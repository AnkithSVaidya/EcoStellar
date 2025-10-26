/**
 * stellar-service.js
 *
 * Comprehensive Stellar / Soroban integration helper for EcoStellar backend.
 *
 * Provides functions to initialize a connection to Stellar testnet/mainnet,
 * invoke contracts (EcoToken, GameRewards, TreeNFT), query balances, fetch
 * transactions, and generate explorer links.
 *
 * Notes:
 * - This module wraps @stellar/stellar-sdk Soroban helpers. It supports a
 *   mockMode when environment variables are missing so the backend can run in
 *   demo mode without real blockchain access.
 * - All public functions return either a success object or a standardized
 *   error object: { success: false, code, message, details }
 *
 * Error Codes:
 * - INIT_FAILED: Failed to initialize Stellar connection
 * - CALL_FAILED: Failed to call contract (read-only)
 * - INVOKE_FAILED: Failed to invoke contract (state-changing)
 * - SIMULATION_FAILED: Transaction simulation failed
 * - TX_FAILED: Transaction failed on-chain
 * - MINT_FAILED: Token minting failed
 * - GAME_RECORD_FAILED: Game session recording failed
 * - NFT_MINT_FAILED: NFT minting failed
 * - BALANCE_FAILED: Balance query failed
 * - NFT_FETCH_FAILED: NFT fetch failed
 * - TX_FETCH_FAILED: Transaction details fetch failed
 * - TIMEOUT: Network timeout
 */

const {
  Keypair,
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  nativeToScVal,
  scValToNative,
} = require('@stellar/stellar-sdk');

require('dotenv').config();

// ==================== Configuration ====================

const CONFIG = {
  network: process.env.STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet',
  rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  adminSecret: process.env.ADMIN_SECRET_KEY || null,
  adminPublic: process.env.ADMIN_PUBLIC_KEY || null,
  ecoTokenContract: process.env.ECO_TOKEN_CONTRACT_ID || null,
  gameRewardsContract: process.env.GAME_REWARDS_CONTRACT_ID || null,
  treeNFTContract: process.env.TREE_NFT_CONTRACT_ID || null,
  explorerBase: process.env.STELLAR_EXPLORER_BASE || 'https://stellar.expert/explorer',
  txTimeout: parseInt(process.env.TX_TIMEOUT) || 30, // seconds
  maxRetries: parseInt(process.env.TX_MAX_RETRIES) || 30, // retry attempts
};

// ==================== Error Handling ====================

/**
 * Standard error object creator
 * @param {string} code - Error code
 * @param {string} message - Human-readable error message
 * @param {*} details - Additional error details
 * @returns {Object} Standardized error object
 */
const makeError = (code, message, details = null) => ({ 
  success: false, 
  code, 
  message, 
  details,
  timestamp: new Date().toISOString()
});

// ==================== Stellar Service Class ====================

/**
 * StellarService
 * 
 * Main service class for Stellar blockchain integration.
 * Handles all contract interactions with EcoToken, GameRewards, and TreeNFT.
 * 
 * Features:
 * - Mock mode for development without blockchain
 * - Automatic retry logic for transactions
 * - Comprehensive error handling
 * - Transaction tracking and explorer links
 */
class StellarService {
  constructor() {
    this.mockMode = false;
    this.initialized = false;

    // Network passphrase
    this.networkPassphrase = CONFIG.network === 'public' ? Networks.PUBLIC : Networks.TESTNET;

    // Try to initialize from env; if required values missing, enable mock mode
    if (!CONFIG.adminSecret || !CONFIG.ecoTokenContract || !CONFIG.gameRewardsContract || !CONFIG.treeNFTContract) {
      console.warn('⚠️  StellarService: Missing environment configuration. Enabling mockMode for local/dev.');
      this.mockMode = true;
    }

    // Keep contract ids
    this.contracts = {
      ecoToken: CONFIG.ecoTokenContract,
      gameRewards: CONFIG.gameRewardsContract,
      treeNFT: CONFIG.treeNFTContract,
    };

    // Lazy init: call initializeStellar() before making RPC calls
    this.server = null;
    this.adminKeypair = null;
  }

  // ==================== Initialization ====================

  /**
   * Initialize Stellar connection
   * 
   * Sets up the Soroban RPC server and loads admin keypair.
   * This must be called before any blockchain operations.
   * 
   * @returns {Promise<Object>} Success object or error
   * 
   * @example
   * const result = await stellarService.initializeStellar();
   * if (result.success) {
   *   console.log('Connected to Stellar');
   * }
   */
  async initializeStellar() {
    if (this.initialized) {
      return { success: true, message: 'Already initialized' };
    }

    if (this.mockMode) {
      console.log('🔧 Stellar Service initialized in MOCK MODE');
      this.initialized = true;
      return { success: true, mock: true, message: 'Mock mode enabled' };
    }

    try {
      // Connect to Soroban RPC
      this.server = new SorobanRpc.Server(CONFIG.rpcUrl);

      // Load admin keypair from secret key
      if (CONFIG.adminSecret) {
        this.adminKeypair = Keypair.fromSecret(CONFIG.adminSecret);
        console.log(`✅ Admin keypair loaded: ${this.adminKeypair.publicKey()}`);
      }

      // Verify server connection
      try {
        await this.server.getHealth();
        console.log(`✅ Connected to Stellar ${CONFIG.network} network`);
      } catch (healthErr) {
        console.warn('⚠️  Could not verify server health, but continuing...');
      }

      this.initialized = true;
      return { 
        success: true, 
        network: CONFIG.network,
        adminPublicKey: this.adminKeypair?.publicKey(),
        contracts: this.contracts
      };
    } catch (err) {
      console.error('❌ initializeStellar error:', err);
      return makeError('INIT_FAILED', 'Failed to initialize Stellar connection', err.message || err);
    }
  }

  // ==================== Internal Helper Methods ====================

  /**
   * Ensure Stellar is initialized before operations
   * @private
   */
  async _ensureInitialized() {
    if (!this.initialized) {
      const res = await this.initializeStellar();
      if (!res.success && !res.mock) {
        throw new Error(res.message || 'Stellar init failed');
      }
    }
  }

  /**
   * Generic read-only contract call
   * 
   * Simulates a contract call without submitting a transaction.
   * Used for querying contract state.
   * 
   * @private
   * @param {string} contractId - Contract address
   * @param {string} method - Method name to call
   * @param {...any} args - Method arguments
   * @returns {Promise<Object>} Result with contract return value
   */
  async _callContract(contractId, method, ...args) {
    try {
      if (this.mockMode) {
        return { success: true, result: null, mock: true };
      }

      await this._ensureInitialized();

      const contract = new Contract(contractId);
      const account = await this.server.getAccount(this.adminKeypair.publicKey());

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(CONFIG.txTimeout)
        .build();

      const simulated = await this.server.simulateTransaction(tx);
      
      if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
        return { success: true, result: simulated.result.retval };
      }

      return makeError('SIMULATION_FAILED', 'Contract simulation failed', simulated);
    } catch (err) {
      console.error(`❌ _callContract error (${method}):`, err);
      return makeError('CALL_FAILED', `Failed to call contract method: ${method}`, err.message || err);
    }
  }

  /**
   * Generic state-changing contract invocation
   * 
   * Builds, simulates, signs, and submits a transaction to the network.
   * Waits for transaction confirmation.
   * 
   * @private
   * @param {string} contractId - Contract address
   * @param {string} method - Method name to invoke
   * @param {...any} args - Method arguments
   * @returns {Promise<Object>} Transaction result with hash and return value
   */
  async _invokeContract(contractId, method, ...args) {
    try {
      if (this.mockMode) {
        return { 
          success: true, 
          txHash: `mock_${method}_${Date.now()}`, 
          mock: true 
        };
      }

      await this._ensureInitialized();

      const contract = new Contract(contractId);
      const account = await this.server.getAccount(this.adminKeypair.publicKey());

      // Build transaction with call operation (simulate first)
      let tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(CONFIG.txTimeout)
        .build();

      // Simulate transaction
      const simulated = await this.server.simulateTransaction(tx);

      if (!SorobanRpc.Api.isSimulationSuccess(simulated)) {
        return makeError('SIMULATION_FAILED', `Simulation failed for ${method}`, simulated);
      }

      // Assemble and sign transaction
      tx = SorobanRpc.assembleTransaction(tx, simulated).build();
      tx.sign(this.adminKeypair);

      // Submit transaction
      const response = await this.server.sendTransaction(tx);

      // Wait for final status with retry logic
      let status = await this.server.getTransaction(response.hash);
      let tries = 0;
      
      while ((status.status === 'PENDING' || status.status === 'NOT_FOUND') && tries < CONFIG.maxRetries) {
        await new Promise((r) => setTimeout(r, 1000));
        status = await this.server.getTransaction(response.hash);
        tries += 1;
      }

      // Check if we timed out
      if (tries >= CONFIG.maxRetries && status.status === 'PENDING') {
        return makeError('TIMEOUT', `Transaction ${method} timed out after ${CONFIG.maxRetries} retries`, response.hash);
      }

      if (status.status === 'SUCCESS') {
        return { 
          success: true, 
          hash: response.hash, 
          returnValue: status.returnValue, 
          ledger: status.ledger,
          method
        };
      }

      return makeError('TX_FAILED', `Transaction ${method} failed`, status);
    } catch (err) {
      console.error(`❌ _invokeContract error (${method}):`, err);
      return makeError('INVOKE_FAILED', `Failed to invoke contract method: ${method}`, err.message || err);
    }
  }

  // ==================== Public API: EcoToken Contract ====================

  /**
   * Mint EcoTokens to a player's address
   * 
   * Calls the EcoToken contract's mint function to create new tokens.
   * Only admin can mint tokens.
   * 
   * Contract method signature: mint(to: Address, amount: i128)
   * 
   * @param {string} playerAddress - Stellar address to receive tokens
   * @param {number} amount - Amount of tokens to mint (will be converted to i128 with 7 decimals)
   * @returns {Promise<Object>} Transaction result with hash and explorer link
   * 
   * @example
   * const result = await stellarService.callEcoTokenMint('GABC...', 100);
   * // Mints 100 * 10^7 stroops (100 ECO tokens)
   * console.log(result.txHash); // Transaction hash
   * console.log(result.explorerLink); // Stellar Expert URL
   */
  async callEcoTokenMint(playerAddress, amount) {
    try {
      if (this.mockMode) {
        return { 
          success: true, 
          txHash: `mock_mint_${Date.now()}`, 
          tokensMinted: amount, 
          explorerLink: this.generateExplorerLink(`mock_mint_${Date.now()}`),
          mock: true
        };
      }

      // Convert amount to i128 with 7 decimals (Stellar standard)
      const amountStroops = BigInt(amount) * BigInt(10_000_000);

      const res = await this._invokeContract(
        this.contracts.ecoToken, 
        'mint', 
        Address.fromString(playerAddress), 
        nativeToScVal(amountStroops, { type: 'i128' })
      );
      
      if (!res.success) return res;
      
      return { 
        success: true, 
        txHash: res.hash, 
        tokensMinted: amount,
        ledger: res.ledger,
        explorerLink: this.generateExplorerLink(res.hash) 
      };
    } catch (err) {
      console.error('❌ callEcoTokenMint error:', err);
      return makeError('MINT_FAILED', 'Failed to mint ECO tokens', err.message || err);
    }
  }

  /**
   * Get EcoToken balance for an address
   * 
   * Queries the EcoToken contract for the balance of a specific address.
   * 
   * Contract method signature: balance(address: Address) -> i128
   * 
   * @param {string} address - Stellar address to query
   * @returns {Promise<Object>} Balance in ECO tokens (converted from stroops)
   * 
   * @example
   * const result = await stellarService.getEcoTokenBalance('GABC...');
   * console.log(result.balance); // e.g., 1500 ECO
   */
  async getEcoTokenBalance(address) {
    try {
      if (this.mockMode) {
        return { success: true, balance: 1250, mock: true };
      }

      const res = await this._callContract(
        this.contracts.ecoToken, 
        'balance', 
        Address.fromString(address)
      );
      
      if (!res.success) return res;
      
      // Convert from i128 stroops to ECO tokens
      const balanceStroops = scValToNative(res.result);
      const balance = Number(balanceStroops) / 10_000_000;
      
      return { success: true, balance, balanceRaw: balanceStroops };
    } catch (err) {
      console.error('❌ getEcoTokenBalance error:', err);
      return makeError('BALANCE_FAILED', 'Failed to fetch token balance', err.message || err);
    }
  }

  // ==================== Public API: GameRewards Contract ====================

  /**
   * Record a game session and distribute rewards
   * 
   * Calls GameRewards contract to record a session and automatically mint tokens.
   * The contract calculates rewards as: score / 10 = tokens (with min/max limits).
   * 
   * Contract method signature: record_game_session(player: Address, score: u32, game_type: String)
   * 
   * @param {string} playerAddress - Player's Stellar address
   * @param {number} score - Score achieved (0-10000+ range)
   * @param {string} gameType - Type of game (e.g., 'carbon_dash')
   * @returns {Promise<Object>} Session result with tokens earned
   * 
   * @example
   * const result = await stellarService.callGameRewardsRecord('GABC...', 750, 'carbon_dash');
   * console.log(result.tokensEarned); // 75 ECO (750 / 10)
   * console.log(result.sessionId); // On-chain session ID
   */
  async callGameRewardsRecord(playerAddress, score, gameType = 'carbon_dash') {
    try {
      if (this.mockMode) {
        const tokensEarned = Math.floor(score / 10);
        return { 
          success: true, 
          txHash: `mock_game_${Date.now()}`, 
          tokensEarned,
          sessionId: `mock_sess_${Date.now()}`, 
          explorerLink: this.generateExplorerLink(`mock_game_${Date.now()}`),
          mock: true
        };
      }

      const res = await this._invokeContract(
        this.contracts.gameRewards, 
        'record_game_session',
        Address.fromString(playerAddress), 
        nativeToScVal(score, { type: 'u32' }),
        nativeToScVal(gameType, { type: 'string' })
      );
      
      if (!res.success) return res;

      // Parse return value (SessionResult struct)
      let sessionData = null;
      let tokensEarned = Math.floor(score / 10); // Fallback calculation
      
      if (res.returnValue) {
        try {
          sessionData = scValToNative(res.returnValue);
          if (sessionData && sessionData.tokens_earned) {
            tokensEarned = Number(sessionData.tokens_earned) / 10_000_000;
          }
        } catch (parseErr) {
          console.warn('Could not parse session return value:', parseErr);
        }
      }

      return { 
        success: true, 
        txHash: res.hash, 
        tokensEarned,
        sessionId: sessionData?.session_id || null,
        ledger: res.ledger,
        explorerLink: this.generateExplorerLink(res.hash) 
      };
    } catch (err) {
      console.error('❌ callGameRewardsRecord error:', err);
      return makeError('GAME_RECORD_FAILED', 'Failed to record game session', err.message || err);
    }
  }

  // ==================== Public API: TreeNFT Contract ====================

  /**
   * Mint a Tree NFT certificate
   * 
   * Calls TreeNFT contract to mint a soulbound NFT representing a planted tree.
   * 
   * Contract method signature: 
   * mint(to, species, location, latitude, longitude, plant_date, carbon_offset, partner_org) -> u64
   * 
   * @param {string} playerAddress - Address to receive the NFT
   * @param {Object} treeMetadata - Tree data
   * @param {string} treeMetadata.species - Tree species name
   * @param {string} treeMetadata.location - Location description
   * @param {number} treeMetadata.latitude - GPS latitude (degrees × 1,000,000)
   * @param {number} treeMetadata.longitude - GPS longitude (degrees × 1,000,000)
   * @param {number} treeMetadata.plantDate - Unix timestamp (optional, defaults to now)
   * @param {number} treeMetadata.carbonOffset - Estimated CO2 offset in kg (optional, defaults to 500)
   * @param {string} treeMetadata.partnerOrg - Partner organization (optional, defaults to 'EcoStellar')
   * @returns {Promise<Object>} NFT result with token ID and transaction hash
   * 
   * @example
   * const result = await stellarService.callTreeNFTMint('GABC...', {
   *   species: 'Oak',
   *   location: 'Central Park, NY',
   *   latitude: 40774000,  // 40.774 degrees
   *   longitude: -73968000, // -73.968 degrees
   *   carbonOffset: 750
   * });
   * console.log(result.tokenId); // NFT token ID
   */
  async callTreeNFTMint(playerAddress, treeMetadata = {}) {
    try {
      if (this.mockMode) {
        return { 
          success: true, 
          tokenId: Math.floor(Math.random() * 1000000), 
          txHash: `mock_tree_${Date.now()}`, 
          explorerLink: this.generateExplorerLink(`mock_tree_${Date.now()}`),
          mock: true
        };
      }

      const args = [
        Address.fromString(playerAddress),
        nativeToScVal(treeMetadata.species || 'Unknown', { type: 'string' }),
        nativeToScVal(treeMetadata.location || 'Unknown', { type: 'string' }),
        nativeToScVal(treeMetadata.latitude || 0, { type: 'i32' }),
        nativeToScVal(treeMetadata.longitude || 0, { type: 'i32' }),
        nativeToScVal(treeMetadata.plantDate || Math.floor(Date.now() / 1000), { type: 'u64' }),
        nativeToScVal(treeMetadata.carbonOffset || 500, { type: 'u64' }),
        nativeToScVal(treeMetadata.partnerOrg || 'EcoStellar', { type: 'string' }),
      ];

      const res = await this._invokeContract(this.contracts.treeNFT, 'mint', ...args);
      if (!res.success) return res;

      // Parse token ID from return value
      const tokenId = res.returnValue ? scValToNative(res.returnValue) : null;

      return { 
        success: true, 
        tokenId, 
        txHash: res.hash,
        ledger: res.ledger,
        explorerLink: this.generateExplorerLink(res.hash) 
      };
    } catch (err) {
      console.error('❌ callTreeNFTMint error:', err);
      return makeError('NFT_MINT_FAILED', 'Failed to mint tree NFT', err.message || err);
    }
  }

  /**
   * Get all Tree NFTs owned by a player
   * 
   * Queries the TreeNFT contract for NFTs owned by an address and fetches metadata.
   * 
   * Contract methods used:
   * - balance_of(owner: Address) -> u64
   * - get_tree_data(token_id: u64) -> TreeMetadata
   * 
   * @param {string} address - Player's Stellar address
   * @returns {Promise<Object>} Array of NFT objects with metadata
   * 
   * @example
   * const result = await stellarService.getPlayerTreeNFTs('GABC...');
   * result.nfts.forEach(nft => {
   *   console.log(`Tree #${nft.tokenId}: ${nft.metadata.species}`);
   * });
   */
  async getPlayerTreeNFTs(address) {
    try {
      if (this.mockMode) {
        return { success: true, nfts: [], mock: true };
      }

      // Get balance (number of NFTs owned)
      const balanceRes = await this._callContract(
        this.contracts.treeNFT, 
        'balance_of', 
        Address.fromString(address)
      );
      
      if (!balanceRes.success) return balanceRes;

      const count = scValToNative(balanceRes.result) || 0;
      const nfts = [];

      // Note: This assumes the contract has a way to enumerate tokens
      // If not available, this would need to be tracked in the database
      // For now, we'll try to fetch by sequential IDs (common pattern)
      
      // Alternative: If contract has get_player_trees method, use that instead
      try {
        const playerTreesRes = await this._callContract(
          this.contracts.treeNFT,
          'get_player_trees',
          Address.fromString(address)
        );
        
        if (playerTreesRes.success && playerTreesRes.result) {
          const tokenIds = scValToNative(playerTreesRes.result);
          
          for (const tokenId of tokenIds) {
            try {
              const metaRes = await this._callContract(
                this.contracts.treeNFT, 
                'get_tree_data', 
                nativeToScVal(tokenId, { type: 'u64' })
              );
              
              if (metaRes.success) {
                const metadata = scValToNative(metaRes.result);
                nfts.push({ tokenId, metadata });
              }
            } catch (innerErr) {
              console.warn(`Warning fetching NFT metadata for token ${tokenId}:`, innerErr.message);
            }
          }
        }
      } catch (err) {
        console.warn('get_player_trees not available, falling back to balance:', err.message);
      }

      return { success: true, count, nfts };
    } catch (err) {
      console.error('❌ getPlayerTreeNFTs error:', err);
      return makeError('NFT_FETCH_FAILED', 'Failed to fetch player NFTs', err.message || err);
    }
  }

  // ==================== Public API: Transaction & Utility Methods ====================

  /**
   * Get transaction details from Stellar
   * 
   * Fetches the status and details of a submitted transaction.
   * 
   * @param {string} txHash - Transaction hash to query
   * @returns {Promise<Object>} Transaction status and details
   * 
   * @example
   * const result = await stellarService.getTransactionDetails('abc123...');
   * console.log(result.status); // 'SUCCESS', 'FAILED', 'PENDING'
   */
  async getTransactionDetails(txHash) {
    try {
      if (this.mockMode) {
        return { 
          success: true, 
          status: 'SUCCESS', 
          hash: txHash,
          mock: true
        };
      }

      await this._ensureInitialized();
      const status = await this.server.getTransaction(txHash);
      
      return { 
        success: true, 
        hash: txHash,
        status: status.status,
        ledger: status.ledger,
        createdAt: status.createdAt,
        details: status
      };
    } catch (err) {
      console.error('❌ getTransactionDetails error:', err);
      return makeError('TX_FETCH_FAILED', 'Failed to fetch transaction details', err.message || err);
    }
  }

  /**
   * Generate Stellar Explorer link for a transaction
   * 
   * Creates a URL to view the transaction on Stellar Expert.
   * 
   * @param {string} txHash - Transaction hash
   * @returns {string} Stellar Expert URL
   * 
   * @example
   * const url = stellarService.generateExplorerLink('abc123...');
   * // Returns: https://stellar.expert/explorer/testnet/tx/abc123...
   */
  generateExplorerLink(txHash) {
    try {
      const networkPath = CONFIG.network === 'public' ? 'public' : 'testnet';
      return `${CONFIG.explorerBase}/${networkPath}/tx/${txHash}`;
    } catch (err) {
      return `${CONFIG.explorerBase}/testnet/tx/${txHash}`;
    }
  }

  /**
   * Validate a Stellar address
   * 
   * Checks if a string is a valid Stellar public key (G... format).
   * 
   * @param {string} addr - Address to validate
   * @returns {boolean} True if valid
   * 
   * @example
   * if (stellarService.isValidAddress('GABC...')) {
   *   console.log('Valid address');
   * }
   */
  isValidAddress(addr) {
    try {
      Address.fromString(addr);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get service configuration info
   * 
   * Returns current configuration and connection status.
   * 
   * @returns {Object} Configuration details
   * 
   * @example
   * const config = stellarService.getConfig();
   * console.log(config.network); // 'testnet'
   * console.log(config.mockMode); // false
   */
  getConfig() {
    return {
      network: CONFIG.network,
      rpcUrl: CONFIG.rpcUrl,
      mockMode: this.mockMode,
      initialized: this.initialized,
      contracts: this.contracts,
      adminPublicKey: this.adminKeypair?.publicKey() || null
    };
  }
}

// ==================== Singleton Export ====================

/**
 * Singleton instance of StellarService
 * Import this to interact with Stellar blockchain.
 */
const stellarService = new StellarService();

module.exports = stellarService;

// ==================== Usage Examples ====================

/**
 * EXAMPLE USAGE:
 * 
 * // 1. Initialize connection
 * const stellar = require('./stellar-service');
 * await stellar.initializeStellar();
 * 
 * // 2. Mint tokens to a player
 * const mintResult = await stellar.callEcoTokenMint('GABC...', 100);
 * if (mintResult.success) {
 *   console.log(`Minted 100 ECO tokens. Tx: ${mintResult.txHash}`);
 *   console.log(`Explorer: ${mintResult.explorerLink}`);
 * }
 * 
 * // 3. Record a game session
 * const gameResult = await stellar.callGameRewardsRecord('GABC...', 750, 'carbon_dash');
 * if (gameResult.success) {
 *   console.log(`Session recorded. Earned ${gameResult.tokensEarned} ECO`);
 * }
 * 
 * // 4. Mint a Tree NFT
 * const nftResult = await stellar.callTreeNFTMint('GABC...', {
 *   species: 'Oak',
 *   location: 'Central Park',
 *   latitude: 40774000,
 *   longitude: -73968000,
 *   carbonOffset: 500
 * });
 * if (nftResult.success) {
 *   console.log(`Tree NFT minted. Token ID: ${nftResult.tokenId}`);
 * }
 * 
 * // 5. Check balance
 * const balanceResult = await stellar.getEcoTokenBalance('GABC...');
 * console.log(`Balance: ${balanceResult.balance} ECO`);
 * 
 * // 6. Get player's NFTs
 * const nftsResult = await stellar.getPlayerTreeNFTs('GABC...');
 * nftsResult.nfts.forEach(nft => {
 *   console.log(`NFT #${nft.tokenId}: ${nft.metadata.species}`);
 * });
 * 
 * // 7. Get transaction details
 * const txResult = await stellar.getTransactionDetails('abc123...');
 * console.log(`Status: ${txResult.status}`);
 * 
 * // 8. Validate address
 * if (stellar.isValidAddress('GABC...')) {
 *   console.log('Valid Stellar address');
 * }
 */
