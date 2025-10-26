# 🧪 How to Check Stellar Integration on Localhost

## Quick Start

### 1. Start the Backend Server

```bash
cd /workspaces/EcoStellar/backend
npm start
```

You should see:
```
🚀 EcoStellar Backend API Server
📍 Running on http://localhost:4000
⭐ Stellar Network: testnet
🔧 Mock Mode: ON (Configure .env for real blockchain)
```

### 2. Test the Integration

#### Option A: Quick Test (Recommended)
```bash
./quick-test.sh
```

#### Option B: Full API Test
```bash
./test-api-stellar.sh
```

#### Option C: Manual curl Commands

```bash
# 1. Check Stellar status
curl http://localhost:4000/health | jq .

# 2. Submit game score (triggers stellar-service.callGameRewardsRecord)
curl -X POST http://localhost:4000/api/game/submit \
  -H "Content-Type: application/json" \
  -d '{"score": 750, "game_type": "carbon_dash"}' | jq .

# 3. Get player stats (triggers stellar-service.getEcoTokenBalance)
curl http://localhost:4000/api/player/guest_123 | jq .

# 4. Get global stats
curl http://localhost:4000/api/stats/global | jq .
```

---

## 📍 API Endpoints Using Stellar Integration

### 1. **POST** `/api/game/submit`
**Stellar Function Used**: `callGameRewardsRecord()`

```bash
curl -X POST http://localhost:4000/api/game/submit \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "GABC...",
    "score": 850,
    "game_type": "carbon_dash"
  }'
```

**Response** (Mock Mode):
```json
{
  "success": true,
  "tokens_earned": 85,
  "blockchain": {
    "success": true,
    "txHash": "mock_game_1761459086757",
    "tokensEarned": 85,
    "explorerLink": "https://stellar.expert/explorer/testnet/tx/mock_game...",
    "mock": true
  }
}
```

### 2. **GET** `/api/player/:wallet`
**Stellar Functions Used**: `getEcoTokenBalance()`, `getPlayerTreeNFTs()`

```bash
curl http://localhost:4000/api/player/GABC...
```

**Response**:
```json
{
  "success": true,
  "player": {
    "wallet_address": "GABC...",
    "eco_tokens_balance": 1250,
    "trees_planted": 3,
    ...
  }
}
```

### 3. **POST** `/api/tree/mint`
**Stellar Function Used**: `callTreeNFTMint()`

```bash
curl -X POST http://localhost:4000/api/tree/mint \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "GABC...",
    "species": "Oak",
    "location": "Central Park",
    "latitude": 40774000,
    "longitude": -73968000,
    "carbon_offset": 750
  }'
```

**Response**:
```json
{
  "success": true,
  "token_id": 73999,
  "explorer_link": "https://stellar.expert/explorer/testnet/tx/mock_tree...",
  "tokens_spent": 100,
  "remaining_tokens": 1150
}
```

### 4. **GET** `/api/player/:wallet/nfts`
**Stellar Function Used**: `getPlayerTreeNFTs()`

```bash
curl http://localhost:4000/api/player/GABC.../nfts
```

---

## 🔍 Verifying Stellar Integration

### Check server.js Integration Points

```bash
grep -n "stellarService\." server.js
```

**You should see**:
- Line 116: `mockMode: stellarService.mockMode`
- Line 140: `stellarService.isValidAddress()`
- Line 152: `stellarService.callGameRewardsRecord()`
- Line 228: `stellarService.getEcoTokenBalance()`
- Line 231: `stellarService.getPlayerTreeNFTs()`
- Line 387: `stellarService.callTreeNFTMint()`

### Check Stellar Service Status

```bash
curl -s http://localhost:4000/health | jq '.stellar'
```

**Expected Output**:
```json
{
  "network": "testnet",
  "mockMode": true
}
```

---

## 🎯 Mock Mode vs Real Blockchain

### Current State: Mock Mode ✅

- ✅ All Stellar functions return mock data
- ✅ No actual blockchain transactions
- ✅ Perfect for development and testing
- ✅ No .env configuration needed

**Mock Response Example**:
```json
{
  "success": true,
  "txHash": "mock_mint_1761459086757",
  "explorerLink": "https://stellar.expert/explorer/testnet/tx/mock_mint...",
  "mock": true
}
```

### Enable Real Blockchain 🚀

Create `.env` file in `/workspaces/EcoStellar/backend/`:

```bash
# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Admin Keys
ADMIN_SECRET_KEY=S...your-secret-key...
ADMIN_PUBLIC_KEY=G...your-public-key...

# Deployed Contract IDs
ECO_TOKEN_CONTRACT_ID=C...
GAME_REWARDS_CONTRACT_ID=C...
TREE_NFT_CONTRACT_ID=C...
```

Then restart the server:
```bash
npm start
```

**Real Blockchain Response**:
```json
{
  "success": true,
  "txHash": "abc123def456...",
  "ledger": 12345,
  "explorerLink": "https://stellar.expert/explorer/testnet/tx/abc123...",
  "mock": false
}
```

---

## 📊 Testing Checklist

- [x] ✅ Server starts successfully
- [x] ✅ Health endpoint shows Stellar status
- [x] ✅ Game submission returns tokens_earned
- [x] ✅ Player stats include blockchain data
- [x] ✅ NFT minting returns token_id
- [x] ✅ Explorer links generated correctly
- [x] ✅ Mock mode active (or blockchain connected)

---

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill existing process
kill -9 <PID>

# Restart
npm start
```

### Stellar functions not working
```bash
# Verify stellar-service.js is loaded
node -e "const s = require('./stellar-service'); console.log(typeof s.callEcoTokenMint)"
# Should output: function
```

### Database errors
```bash
# Reinitialize database
rm ecostellar.db
npm start
```

---

## 🎉 Success Indicators

When everything is working, you should see:

1. **Server logs**:
   ```
   ✅ Admin keypair loaded: G... (if blockchain mode)
   🔧 Mock Mode: ON (if mock mode)
   ```

2. **API responses include blockchain data**:
   ```json
   "blockchain": {
     "success": true,
     "txHash": "...",
     "explorerLink": "https://stellar.expert/..."
   }
   ```

3. **All test scripts pass**:
   ```bash
   ✅ All API endpoints with Stellar integration working!
   ```

---

## 📚 Additional Resources

- **Stellar Service Code**: `/workspaces/EcoStellar/backend/stellar-service.js`
- **Test Suite**: `node test-stellar-service.js`
- **Verification**: `node verify-prompt11.js`
- **Server Integration**: `/workspaces/EcoStellar/backend/server.js`

---

**Last Updated**: October 26, 2025  
**Status**: ✅ Fully Functional in Mock Mode
