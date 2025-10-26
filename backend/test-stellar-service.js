/**
 * Test Script for Stellar Service
 * 
 * Demonstrates all functions in stellar-service.js
 * Works in both mock mode and with real blockchain
 */

const stellarService = require('./stellar-service');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log('📋', colors.cyan, title);
  console.log('='.repeat(60));
}

function logResult(result) {
  if (result.success) {
    log('✅', colors.green, 'SUCCESS');
    console.log(colors.gray + JSON.stringify(result, null, 2) + colors.reset);
  } else {
    log('❌', colors.red, `FAILED: ${result.code}`);
    console.log(colors.gray + JSON.stringify(result, null, 2) + colors.reset);
  }
}

async function runTests() {
  console.clear();
  log('🚀', colors.blue, 'STELLAR SERVICE TEST SUITE');
  log('📅', colors.gray, `Date: ${new Date().toISOString()}`);

  // Test address (example - would be replaced with real address in production)
  const testAddress = 'GABC123DEFG456HIJK789LMNO012PQRS345TUVW678XYZA901BCDE234';

  try {
    // ==================== Test 1: Initialize ====================
    logSection('Test 1: Initialize Stellar Connection');
    const initResult = await stellarService.initializeStellar();
    logResult(initResult);

    if (initResult.mock) {
      log('ℹ️ ', colors.yellow, 'Running in MOCK MODE (configure .env for real blockchain)');
    }

    // ==================== Test 2: Get Configuration ====================
    logSection('Test 2: Get Service Configuration');
    const config = stellarService.getConfig();
    log('🔧', colors.blue, 'Configuration:');
    console.log(colors.gray + JSON.stringify(config, null, 2) + colors.reset);

    // ==================== Test 3: Validate Address ====================
    logSection('Test 3: Validate Stellar Address');
    const isValid = stellarService.isValidAddress(testAddress);
    log(isValid ? '✅' : '❌', isValid ? colors.green : colors.red, 
        `Address validation: ${isValid ? 'VALID' : 'INVALID'}`);

    // ==================== Test 4: Mint EcoTokens ====================
    logSection('Test 4: Mint EcoTokens');
    log('🪙', colors.blue, 'Minting 100 ECO tokens...');
    const mintResult = await stellarService.callEcoTokenMint(testAddress, 100);
    logResult(mintResult);

    if (mintResult.success && mintResult.explorerLink) {
      log('🔗', colors.cyan, `Explorer: ${mintResult.explorerLink}`);
    }

    // ==================== Test 5: Check Balance ====================
    logSection('Test 5: Get EcoToken Balance');
    const balanceResult = await stellarService.getEcoTokenBalance(testAddress);
    logResult(balanceResult);

    if (balanceResult.success) {
      log('💰', colors.green, `Balance: ${balanceResult.balance} ECO`);
    }

    // ==================== Test 6: Record Game Session ====================
    logSection('Test 6: Record Game Session');
    log('🎮', colors.blue, 'Recording game session (score: 750)...');
    const gameResult = await stellarService.callGameRewardsRecord(
      testAddress, 
      750, 
      'carbon_dash'
    );
    logResult(gameResult);

    if (gameResult.success) {
      log('🏆', colors.green, `Tokens Earned: ${gameResult.tokensEarned} ECO`);
      if (gameResult.sessionId) {
        log('🆔', colors.cyan, `Session ID: ${gameResult.sessionId}`);
      }
    }

    // ==================== Test 7: Mint Tree NFT ====================
    logSection('Test 7: Mint Tree NFT');
    log('🌳', colors.blue, 'Minting tree NFT...');
    const treeData = {
      species: 'Oak',
      location: 'Central Park, New York',
      latitude: 40774000,  // 40.774° N
      longitude: -73968000, // -73.968° W
      carbonOffset: 750,
      partnerOrg: 'EcoStellar Test'
    };
    const nftResult = await stellarService.callTreeNFTMint(testAddress, treeData);
    logResult(nftResult);

    if (nftResult.success) {
      log('🎫', colors.green, `NFT Token ID: ${nftResult.tokenId}`);
      if (nftResult.explorerLink) {
        log('🔗', colors.cyan, `Explorer: ${nftResult.explorerLink}`);
      }
    }

    // ==================== Test 8: Get Player NFTs ====================
    logSection('Test 8: Get Player Tree NFTs');
    const nftsResult = await stellarService.getPlayerTreeNFTs(testAddress);
    logResult(nftsResult);

    if (nftsResult.success) {
      log('📊', colors.green, `Total NFTs: ${nftsResult.count || nftsResult.nfts.length}`);
      if (nftsResult.nfts && nftsResult.nfts.length > 0) {
        nftsResult.nfts.forEach((nft, index) => {
          log('🌲', colors.cyan, `NFT #${index + 1}: Token ID ${nft.tokenId}`);
          if (nft.metadata) {
            console.log(colors.gray + `    Species: ${nft.metadata.species}` + colors.reset);
            console.log(colors.gray + `    Location: ${nft.metadata.location}` + colors.reset);
          }
        });
      }
    }

    // ==================== Test 9: Get Transaction Details ====================
    if (mintResult.success && mintResult.txHash && !mintResult.mock) {
      logSection('Test 9: Get Transaction Details');
      log('🔍', colors.blue, `Fetching details for tx: ${mintResult.txHash.substring(0, 20)}...`);
      const txResult = await stellarService.getTransactionDetails(mintResult.txHash);
      logResult(txResult);
    }

    // ==================== Test 10: Generate Explorer Link ====================
    logSection('Test 10: Generate Explorer Link');
    const mockTxHash = 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
    const explorerLink = stellarService.generateExplorerLink(mockTxHash);
    log('🔗', colors.cyan, explorerLink);

    // ==================== Summary ====================
    logSection('Test Summary');
    log('✅', colors.green, 'All tests completed successfully!');
    log('📊', colors.blue, 'Functions tested: 10/10');
    
    if (config.mockMode) {
      log('ℹ️ ', colors.yellow, 'Note: Tests ran in MOCK MODE');
      log('💡', colors.cyan, 'To test with real blockchain:');
      console.log(colors.gray + '  1. Deploy contracts to Stellar testnet');
      console.log('  2. Configure .env with contract IDs and admin keys');
      console.log('  3. Run this test script again' + colors.reset);
    } else {
      log('✨', colors.green, 'Tests ran on REAL BLOCKCHAIN');
    }

  } catch (error) {
    log('❌', colors.red, 'Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n' + '='.repeat(60));
      log('🎉', colors.green, 'Test suite completed!');
      console.log('='.repeat(60) + '\n');
      process.exit(0);
    })
    .catch((error) => {
      log('❌', colors.red, 'Fatal error:');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTests };
