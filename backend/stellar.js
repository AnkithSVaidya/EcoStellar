const {
  Keypair,
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
} = require('@stellar/stellar-sdk');

/**
 * Stellar Blockchain Integration Module
 * 
 * Handles all interactions with Stellar smart contracts:
 * - EcoToken contract
 * - GameRewards contract
 * - TreeNFT contract
 */

class StellarService {
  constructor() {
    // Network configuration
    this.network = process.env.STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
    
    this.rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
    this.server = new SorobanRpc.Server(this.rpcUrl);
    
    // Load admin keypair
    try {
      this.adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
      console.log('✅ Admin keypair loaded:', this.adminKeypair.publicKey());
    } catch (error) {
      console.warn('⚠️  Admin keypair not configured. Set ADMIN_SECRET_KEY in .env');
      this.adminKeypair = null;
    }
    
    // Contract IDs
    this.contracts = {
      ecoToken: process.env.ECO_TOKEN_CONTRACT_ID,
      gameRewards: process.env.GAME_REWARDS_CONTRACT_ID,
      treeNFT: process.env.TREE_NFT_CONTRACT_ID,
    };
    
    // Validate configuration
    this.validateConfig();
  }
  
  /**
   * Validate Stellar configuration
   */
  validateConfig() {
    const missing = [];
    
    if (!this.adminKeypair) missing.push('ADMIN_SECRET_KEY');
    if (!this.contracts.ecoToken) missing.push('ECO_TOKEN_CONTRACT_ID');
    if (!this.contracts.gameRewards) missing.push('GAME_REWARDS_CONTRACT_ID');
    if (!this.contracts.treeNFT) missing.push('TREE_NFT_CONTRACT_ID');
    
    if (missing.length > 0) {
      console.warn(`⚠️  Missing Stellar configuration: ${missing.join(', ')}`);
      console.warn('   Set these in .env file. Using mock mode for testing.');
      this.mockMode = true;
    } else {
      console.log('✅ Stellar configuration validated');
      this.mockMode = false;
    }
  }
  
  /**
   * Get player's EcoToken balance
   * @param {string} walletAddress - Player's Stellar address
   * @returns {Promise<number>} Token balance
   */
  async getTokenBalance(walletAddress) {
    if (this.mockMode) {
      console.log('🔧 Mock mode: Returning dummy token balance');
      return 1250;
    }
    
    try {
      const contract = new Contract(this.contracts.ecoToken);
      
      const result = await this.callContract(
        contract,
        'balance',
        Address.fromString(walletAddress)
      );
      
      return scValToNative(result);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to fetch token balance from blockchain');
    }
  }
  
  /**
   * Record game session and mint tokens
   * @param {string} walletAddress - Player's wallet
   * @param {number} score - Game score
   * @param {number} tokensToMint - Tokens to award
   * @returns {Promise<object>} Transaction result
   */
  async recordGameSession(walletAddress, score, tokensToMint) {
    if (this.mockMode) {
      console.log('🔧 Mock mode: Simulating game session recording');
      return {
        success: true,
        txHash: 'mock_tx_' + Date.now(),
        tokensEarned: tokensToMint,
        explorerLink: `https://stellar.expert/explorer/testnet/tx/mock_${Date.now()}`
      };
    }
    
    try {
      const contract = new Contract(this.contracts.gameRewards);
      
      const result = await this.invokeContract(
        contract,
        'record_session',
        Address.fromString(walletAddress),
        nativeToScVal(score, { type: 'u64' }),
        nativeToScVal(tokensToMint, { type: 'u64' })
      );
      
      return {
        success: true,
        txHash: result.hash,
        tokensEarned: tokensToMint,
        explorerLink: this.getExplorerLink(result.hash)
      };
    } catch (error) {
      console.error('Error recording game session:', error);
      throw new Error('Failed to record game session on blockchain');
    }
  }
  
  /**
   * Mint a Tree NFT
   * @param {string} walletAddress - Player's wallet
   * @param {object} treeData - Tree metadata
   * @returns {Promise<object>} Mint result
   */
  async mintTreeNFT(walletAddress, treeData) {
    if (this.mockMode) {
      console.log('🔧 Mock mode: Simulating NFT mint');
      return {
        success: true,
        tokenId: Math.floor(Math.random() * 1000),
        txHash: 'mock_nft_tx_' + Date.now(),
        explorerLink: `https://stellar.expert/explorer/testnet/tx/mock_nft_${Date.now()}`
      };
    }
    
    try {
      const contract = new Contract(this.contracts.treeNFT);
      
      const result = await this.invokeContract(
        contract,
        'mint',
        Address.fromString(walletAddress),
        nativeToScVal(treeData.species, { type: 'string' }),
        nativeToScVal(treeData.location, { type: 'string' }),
        nativeToScVal(treeData.latitude, { type: 'i32' }),
        nativeToScVal(treeData.longitude, { type: 'i32' }),
        nativeToScVal(treeData.plantDate, { type: 'u64' }),
        nativeToScVal(treeData.carbonOffset, { type: 'u64' }),
        nativeToScVal(treeData.partnerOrg, { type: 'string' })
      );
      
      // Extract token ID from result
      const tokenId = scValToNative(result.returnValue);
      
      return {
        success: true,
        tokenId,
        txHash: result.hash,
        explorerLink: this.getExplorerLink(result.hash)
      };
    } catch (error) {
      console.error('Error minting tree NFT:', error);
      throw new Error('Failed to mint NFT on blockchain');
    }
  }
  
  /**
   * Get player's Tree NFTs
   * @param {string} walletAddress - Player's wallet
   * @returns {Promise<number>} Number of NFTs owned
   */
  async getPlayerNFTCount(walletAddress) {
    if (this.mockMode) {
      console.log('🔧 Mock mode: Returning dummy NFT count');
      return 2;
    }
    
    try {
      const contract = new Contract(this.contracts.treeNFT);
      
      const result = await this.callContract(
        contract,
        'balance_of',
        Address.fromString(walletAddress)
      );
      
      return scValToNative(result);
    } catch (error) {
      console.error('Error getting NFT count:', error);
      return 0;
    }
  }
  
  /**
   * Call a read-only contract function
   * @param {Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {...any} args - Method arguments
   * @returns {Promise<any>} Result
   */
  async callContract(contract, method, ...args) {
    const account = await this.server.getAccount(this.adminKeypair.publicKey());
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();
    
    const simulated = await this.server.simulateTransaction(transaction);
    
    if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
      return simulated.result.retval;
    } else {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }
  }
  
  /**
   * Invoke a contract function that modifies state
   * @param {Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {...any} args - Method arguments
   * @returns {Promise<object>} Transaction result
   */
  async invokeContract(contract, method, ...args) {
    const account = await this.server.getAccount(this.adminKeypair.publicKey());
    
    let transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();
    
    // Simulate first
    const simulated = await this.server.simulateTransaction(transaction);
    
    if (!SorobanRpc.Api.isSimulationSuccess(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }
    
    // Prepare transaction
    transaction = SorobanRpc.assembleTransaction(transaction, simulated).build();
    
    // Sign transaction
    transaction.sign(this.adminKeypair);
    
    // Submit transaction
    const response = await this.server.sendTransaction(transaction);
    
    // Wait for confirmation
    let status = await this.server.getTransaction(response.hash);
    
    while (status.status === 'PENDING' || status.status === 'NOT_FOUND') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      status = await this.server.getTransaction(response.hash);
    }
    
    if (status.status === 'SUCCESS') {
      return {
        hash: response.hash,
        returnValue: status.returnValue,
        ledger: status.ledger
      };
    } else {
      throw new Error(`Transaction failed: ${status.status}`);
    }
  }
  
  /**
   * Get Stellar Expert explorer link
   * @param {string} txHash - Transaction hash
   * @returns {string} Explorer URL
   */
  getExplorerLink(txHash) {
    const network = this.network === Networks.PUBLIC ? 'public' : 'testnet';
    return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
  }
  
  /**
   * Validate Stellar address format
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid
   */
  isValidAddress(address) {
    try {
      Address.fromString(address);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
const stellarService = new StellarService();

module.exports = stellarService;
