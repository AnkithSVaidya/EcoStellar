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

// Configuration
const CONFIG = {
  network: process.env.STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet',
  rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  adminSecret: process.env.ADMIN_SECRET_KEY || null,
  adminPublic: process.env.ADMIN_PUBLIC_KEY || null,
  ecoTokenContract: process.env.ECO_TOKEN_CONTRACT_ID || null,
  gameRewardsContract: process.env.GAME_REWARDS_CONTRACT_ID || null,
  treeNFTContract: process.env.TREE_NFT_CONTRACT_ID || null,
  explorerBase: process.env.STELLAR_EXPLORER_BASE || 'https://stellar.expert/explorer',
};

// Standard error helper
const makeError = (code, message, details = null) => ({ success: false, code, message, details });

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

  /**
   * initializeStellar()
   * - Sets up the Soroban RPC server and loads admin keypair
   */
  async initializeStellar() {
    if (this.initialized) return { success: true };

    if (this.mockMode) {
      this.initialized = true;
      return { success: true, mock: true };
    }

    try {
      this.server = new SorobanRpc.Server(CONFIG.rpcUrl);

      if (CONFIG.adminSecret) {
        this.adminKeypair = Keypair.fromSecret(CONFIG.adminSecret);
      }

      this.initialized = true;
      return { success: true };
    } catch (err) {
      console.error('initializeStellar error:', err);
      return makeError('INIT_FAILED', 'Failed to initialize Stellar connection', err.message || err);
    }
  }

  // ---------------------- Helpers: call/invoke ----------------------
  async _ensureInitialized() {
    if (!this.initialized) {
      const res = await this.initializeStellar();
      if (!res.success && !res.mock) throw new Error(res.message || 'Stellar init failed');
    }
  }

  /**
   * Generic read-only contract call
   */
  async _callContract(contractId, method, ...args) {
    try {
      if (this.mockMode) return { success: true, result: null, mock: true };

      await this._ensureInitialized();

      const contract = new Contract(contractId);
      const account = await this.server.getAccount(this.adminKeypair.publicKey());

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(tx);
      if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
        return { success: true, result: simulated.result.retval };
      }

      return makeError('SIMULATION_FAILED', 'Contract simulation failed', simulated);
    } catch (err) {
      console.error('_callContract error:', err);
      return makeError('CALL_FAILED', 'Failed to call contract', err.message || err);
    }
  }

  /**
   * Generic state-changing contract invocation
   */
  async _invokeContract(contractId, method, ...args) {
    try {
      if (this.mockMode) {
        return { success: true, txHash: `mock_tx_${Date.now()}`, mock: true };
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
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(tx);

      if (!SorobanRpc.Api.isSimulationSuccess(simulated)) {
        return makeError('SIMULATION_FAILED', 'Simulation failed', simulated);
      }

      // Assemble and sign transaction
      tx = SorobanRpc.assembleTransaction(tx, simulated).build();
      tx.sign(this.adminKeypair);

      // Submit
      const response = await this.server.sendTransaction(tx);

      // Wait for final status
      let status = await this.server.getTransaction(response.hash);
      const maxRetries = 30; // ~30 seconds
      let tries = 0;
      while ((status.status === 'PENDING' || status.status === 'NOT_FOUND') && tries < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000));
        status = await this.server.getTransaction(response.hash);
        tries += 1;
      }

      if (status.status === 'SUCCESS') {
        return { success: true, hash: response.hash, returnValue: status.returnValue, ledger: status.ledger };
      }

      return makeError('TX_FAILED', 'Transaction failed', status);
    } catch (err) {
      console.error('_invokeContract error:', err);
      return makeError('INVOKE_FAILED', 'Failed to invoke contract', err.message || err);
    }
  }

  // ---------------------- Public API ----------------------

  /**
   * callEcoTokenMint(playerAddress, amount)
   * - Mint ECO tokens to a player's address via EcoToken contract
   */
  async callEcoTokenMint(playerAddress, amount) {
    try {
      if (this.mockMode) {
        return { success: true, txHash: `mock_mint_${Date.now()}`, tokensMinted: amount, explorerLink: this.generateExplorerLink(`mock_mint_${Date.now()}`) };
      }

      // amount as u64
      const res = await this._invokeContract(this.contracts.ecoToken, 'mint', Address.fromString(playerAddress), nativeToScVal(amount, { type: 'u64' }));
      if (!res.success) return res;
      return { success: true, txHash: res.hash, tokensMinted: amount, explorerLink: this.generateExplorerLink(res.hash) };
    } catch (err) {
      console.error('callEcoTokenMint error:', err);
      return makeError('MINT_FAILED', 'Failed to mint ECO tokens', err.message || err);
    }
  }

  /**
   * callGameRewardsRecord(playerAddress, score, gameType)
   * - Record a game session and optionally mint tokens via GameRewards contract
   */
  async callGameRewardsRecord(playerAddress, score, gameType = 'carbon_dash') {
    try {
      if (this.mockMode) {
        const tokens = Math.floor(score / 10);
        return { success: true, txHash: `mock_game_${Date.now()}`, tokensEarned: tokens, sessionId: `mock_sess_${Date.now()}`, explorerLink: this.generateExplorerLink(`mock_game_${Date.now()}`) };
      }

      const tokensToMint = Math.floor(score / 10);

      const res = await this._invokeContract(this.contracts.gameRewards, 'record_session', Address.fromString(playerAddress), nativeToScVal(score, { type: 'u64' }), nativeToScVal(tokensToMint, { type: 'u64' }), nativeToScVal(gameType, { type: 'string' }));
      if (!res.success) return res;

      // Return: session id can be derived from returnValue if contract returns it
      return { success: true, txHash: res.hash, tokensEarned: tokensToMint, explorerLink: this.generateExplorerLink(res.hash), sessionId: res.returnValue || null };
    } catch (err) {
      console.error('callGameRewardsRecord error:', err);
      return makeError('GAME_RECORD_FAILED', 'Failed to record game session', err.message || err);
    }
  }

  /**
   * callTreeNFTMint(playerAddress, treeMetadata)
   * - Mint a tree NFT via TreeNFT contract. treeMetadata should include species, location, latitude, longitude, plantDate, carbonOffset, partnerOrg
   */
  async callTreeNFTMint(playerAddress, treeMetadata = {}) {
    try {
      if (this.mockMode) {
        return { success: true, tokenId: Math.floor(Math.random() * 1000000), txHash: `mock_tree_${Date.now()}`, explorerLink: this.generateExplorerLink(`mock_tree_${Date.now()}`) };
      }

      const args = [
        Address.fromString(playerAddress),
        nativeToScVal(treeMetadata.species || '', { type: 'string' }),
        nativeToScVal(treeMetadata.location || '', { type: 'string' }),
        nativeToScVal(treeMetadata.latitude || 0, { type: 'i32' }),
        nativeToScVal(treeMetadata.longitude || 0, { type: 'i32' }),
        nativeToScVal(treeMetadata.plantDate || Math.floor(Date.now() / 1000), { type: 'u64' }),
        nativeToScVal(treeMetadata.carbonOffset || 500, { type: 'u64' }),
        nativeToScVal(treeMetadata.partnerOrg || 'EcoStellar', { type: 'string' }),
      ];

      const res = await this._invokeContract(this.contracts.treeNFT, 'mint', ...args);
      if (!res.success) return res;

      // If contract returns token id, parse it
      const tokenId = res.returnValue ? scValToNative(res.returnValue) : null;

      return { success: true, tokenId, txHash: res.hash, explorerLink: this.generateExplorerLink(res.hash) };
    } catch (err) {
      console.error('callTreeNFTMint error:', err);
      return makeError('NFT_MINT_FAILED', 'Failed to mint tree NFT', err.message || err);
    }
  }

  /**
   * getEcoTokenBalance(address)
   */
  async getEcoTokenBalance(address) {
    try {
      if (this.mockMode) return { success: true, balance: 1250 };

      const res = await this._callContract(this.contracts.ecoToken, 'balance', Address.fromString(address));
      if (!res.success) return res;
      const val = scValToNative(res.result);
      return { success: true, balance: val };
    } catch (err) {
      console.error('getEcoTokenBalance error:', err);
      return makeError('BALANCE_FAILED', 'Failed to fetch token balance', err.message || err);
    }
  }

  /**
   * getPlayerTreeNFTs(address)
   * - Calls TreeNFT contract to fetch IDs owned, then fetches metadata per token if available
   */
  async getPlayerTreeNFTs(address) {
    try {
      if (this.mockMode) return { success: true, nfts: [] };

      // Example: call balance_of then iterate tokens -- contract API varies
      const balanceRes = await this._callContract(this.contracts.treeNFT, 'balance_of', Address.fromString(address));
      if (!balanceRes.success) return balanceRes;

      const count = scValToNative(balanceRes.result) || 0;
      const nfts = [];

      for (let i = 0; i < count; i++) {
        try {
          const tokenRes = await this._callContract(this.contracts.treeNFT, 'token_of_owner_by_index', Address.fromString(address), nativeToScVal(i, { type: 'u64' }));
          const tokenId = scValToNative(tokenRes.result);
          const metaRes = await this._callContract(this.contracts.treeNFT, 'get_metadata', nativeToScVal(tokenId, { type: 'u64' }));
          const metadata = scValToNative(metaRes.result);
          nfts.push({ tokenId, metadata });
        } catch (innerErr) {
          console.warn('Warning fetching NFT at index', i, innerErr.message || innerErr);
        }
      }

      return { success: true, nfts };
    } catch (err) {
      console.error('getPlayerTreeNFTs error:', err);
      return makeError('NFT_FETCH_FAILED', 'Failed to fetch player NFTs', err.message || err);
    }
  }

  /**
   * getTransactionDetails(txHash)
   */
  async getTransactionDetails(txHash) {
    try {
      if (this.mockMode) return { success: true, status: 'MOCK', hash: txHash };

      await this._ensureInitialized();
      const status = await this.server.getTransaction(txHash);
      return { success: true, status };
    } catch (err) {
      console.error('getTransactionDetails error:', err);
      return makeError('TX_FETCH_FAILED', 'Failed to fetch transaction details', err.message || err);
    }
  }

  /**
   * generateExplorerLink(txHash)
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
   * validate Stellar address
   */
  isValidAddress(addr) {
    try {
      Address.fromString(addr);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton
const stellarService = new StellarService();

module.exports = stellarService;

/**
 * Example usage (for developers):
 *
 * const stellar = require('./stellar-service');
 * await stellar.initializeStellar();
 * const balance = await stellar.getEcoTokenBalance('G...');
 * const mint = await stellar.callEcoTokenMint('G...', 10);
 */
