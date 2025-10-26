# 📘 Stellar Service Quick Reference

## 🚀 Quick Start

```javascript
const stellar = require('./stellar-service');

// Initialize
await stellar.initializeStellar();

// Check status
const config = stellar.getConfig();
console.log(config.mockMode ? 'Mock Mode' : 'Connected to Blockchain');
```

---

## 🔧 Main Functions

### 1. Mint EcoTokens
```javascript
const result = await stellar.callEcoTokenMint(address, amount);
// → { success, txHash, tokensMinted, explorerLink }
```

### 2. Record Game Session
```javascript
const result = await stellar.callGameRewardsRecord(address, score, gameType);
// → { success, txHash, tokensEarned, sessionId, explorerLink }
```

### 3. Mint Tree NFT
```javascript
const result = await stellar.callTreeNFTMint(address, {
  species: 'Oak',
  location: 'Central Park',
  latitude: 40774000,
  longitude: -73968000,
  carbonOffset: 750,
  partnerOrg: 'EcoStellar'
});
// → { success, tokenId, txHash, explorerLink }
```

### 4. Get Token Balance
```javascript
const result = await stellar.getEcoTokenBalance(address);
// → { success, balance, balanceRaw }
```

### 5. Get Player NFTs
```javascript
const result = await stellar.getPlayerTreeNFTs(address);
// → { success, count, nfts: [{tokenId, metadata}] }
```

### 6. Get Transaction Details
```javascript
const result = await stellar.getTransactionDetails(txHash);
// → { success, hash, status, ledger, details }
```

### 7. Generate Explorer Link
```javascript
const url = stellar.generateExplorerLink(txHash);
// → "https://stellar.expert/explorer/testnet/tx/..."
```

### 8. Validate Address
```javascript
const isValid = stellar.isValidAddress('GABC...');
// → true or false
```

---

## 📊 Response Format

### Success Response
```javascript
{
  success: true,
  txHash: 'abc123...',
  // ... additional fields
}
```

### Error Response
```javascript
{
  success: false,
  code: 'MINT_FAILED',
  message: 'Failed to mint ECO tokens',
  details: 'Error details here',
  timestamp: '2025-10-26T...'
}
```

---

## 🎯 Error Codes

| Code | Meaning |
|------|---------|
| `INIT_FAILED` | Failed to initialize connection |
| `CALL_FAILED` | Read-only contract call failed |
| `INVOKE_FAILED` | State-changing contract call failed |
| `SIMULATION_FAILED` | Transaction simulation failed |
| `TX_FAILED` | Transaction failed on-chain |
| `MINT_FAILED` | Token minting failed |
| `GAME_RECORD_FAILED` | Game session recording failed |
| `NFT_MINT_FAILED` | NFT minting failed |
| `BALANCE_FAILED` | Balance query failed |
| `NFT_FETCH_FAILED` | NFT fetch failed |
| `TX_FETCH_FAILED` | Transaction fetch failed |
| `TIMEOUT` | Network timeout |

---

## 🔢 Type Conversions

### ECO Tokens ↔ Stroops
```javascript
// Service handles conversion automatically
callEcoTokenMint(address, 100)  // 100 ECO
// → Sends 100 * 10^7 = 1,000,000,000 stroops (i128)

getEcoTokenBalance(address)
// → Returns { balance: 1500 } (ECO tokens)
// → Also returns { balanceRaw: 15000000000 } (stroops)
```

### GPS Coordinates
```javascript
// Degrees × 1,000,000 for precision
latitude: 40.774 → 40774000 (i32)
longitude: -73.968 → -73968000 (i32)
```

### Timestamps
```javascript
// Unix timestamp in seconds
plantDate: Math.floor(Date.now() / 1000)  // u64
```

---

## ⚙️ Configuration (.env)

```bash
# Network
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_EXPLORER_BASE=https://stellar.expert/explorer

# Admin Keys
ADMIN_SECRET_KEY=S...
ADMIN_PUBLIC_KEY=G...

# Contracts
ECO_TOKEN_CONTRACT_ID=C...
GAME_REWARDS_CONTRACT_ID=C...
TREE_NFT_CONTRACT_ID=C...

# Optional
TX_TIMEOUT=30
TX_MAX_RETRIES=30
```

---

## 🧪 Testing

```bash
# Run test suite
node test-stellar-service.js

# Tests all 10 functions
# Works in mock mode or with real blockchain
```

---

## 💡 Common Patterns

### Pattern 1: Check and Execute
```javascript
if (stellar.isValidAddress(address)) {
  const result = await stellar.callEcoTokenMint(address, 100);
  if (result.success) {
    console.log('Success!', result.explorerLink);
  } else {
    console.error(result.code, result.message);
  }
}
```

### Pattern 2: Try-Catch with Fallback
```javascript
try {
  const balance = await stellar.getEcoTokenBalance(address);
  return balance.success ? balance.balance : dbBalance;
} catch (error) {
  console.error('Blockchain error, using database:', error);
  return dbBalance;
}
```

### Pattern 3: Transaction with Verification
```javascript
const mintResult = await stellar.callEcoTokenMint(address, 100);
if (mintResult.success) {
  // Wait a moment for confirmation
  await new Promise(r => setTimeout(r, 2000));
  
  // Verify by checking balance
  const balanceResult = await stellar.getEcoTokenBalance(address);
  console.log('New balance:', balanceResult.balance);
}
```

---

## 📦 Integration Example

```javascript
// In your backend API route
app.post('/api/game/submit', async (req, res) => {
  const { wallet, score } = req.body;
  
  // Validate address
  if (!stellar.isValidAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet' });
  }
  
  // Record session on blockchain
  const result = await stellar.callGameRewardsRecord(
    wallet, 
    score, 
    'carbon_dash'
  );
  
  if (!result.success) {
    console.error('Blockchain error:', result.code);
    // Continue with database fallback
  }
  
  res.json({
    success: true,
    tokensEarned: result.tokensEarned || Math.floor(score / 10),
    txHash: result.txHash,
    explorerLink: result.explorerLink
  });
});
```

---

## 🎯 Best Practices

1. **Always validate addresses** before calling contract functions
2. **Handle both success and error cases** in your code
3. **Use mock mode** for development and testing
4. **Check `result.success`** before accessing result data
5. **Log transaction hashes** for debugging
6. **Provide explorer links** to users for transparency
7. **Implement fallbacks** for network issues
8. **Monitor error codes** to identify patterns

---

## 📞 Support

- **Documentation**: `PROMPT11_STELLAR_SERVICE_COMPLETE.md`
- **Test Suite**: `test-stellar-service.js`
- **Source Code**: `stellar-service.js` (810 lines, fully commented)

---

**Last Updated**: October 26, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
