# 🚀 GameRewards Deployment Guide

Complete step-by-step guide to deploy and link GameRewards with EcoToken.

## ⚠️ Important: Deployment Order

GameRewards requires EcoToken to be deployed first. The deployment architecture:

```
EcoToken (deploy first)
    ↓
GameRewards (deploy second, link to EcoToken)
    ↓
Initialize with admin authorization
```

---

## 📋 Prerequisites

- ✅ Stellar CLI installed
- ✅ Admin account created and funded
- ✅ EcoToken contract already deployed
- ✅ GameRewards contract built and optimized

---

## 🔧 Step-by-Step Deployment

### Step 1: Build GameRewards Contract

```bash
cd /workspaces/EcoStellar/contracts/game-rewards

# Build
cargo build --target wasm32-unknown-unknown --release

# Optimize
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/game_rewards.wasm
```

**Expected output:**
```
Optimized: game_rewards.optimized.wasm (8.4KB)
```

---

### Step 2: Deploy EcoToken (If Not Already Done)

```bash
cd ../eco-token

# Deploy EcoToken
./eco.sh deploy

# Save the contract ID
export ECO_TOKEN_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Step 3: Deploy GameRewards Contract

```bash
cd ../game-rewards

# Deploy
./game.sh deploy

# You'll get output like:
# Contract ID: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Save the Contract ID:**
```bash
export GAME_REWARDS_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Step 4: Configure Admin Permissions

⚠️ **CRITICAL**: GameRewards needs permission to mint EcoTokens!

You have **two options**:

#### Option A: Make GameRewards the EcoToken Admin (Recommended for Testing)

This is simplest - deploy a fresh EcoToken with GameRewards as admin:

```bash
# Initialize EcoToken with GameRewards as the admin
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $GAME_REWARDS_ID
```

#### Option B: Keep Your Current Admin

If you already have EcoToken initialized with your admin:

**NOTE**: This requires modifying EcoToken to support authorized minters (advanced).  
For the hackathon, use Option A above.

---

### Step 5: Initialize GameRewards

```bash
# Initialize with admin and link to EcoToken
./game.sh init
```

**What this does:**
- Sets up admin address
- Links to EcoToken contract
- Initializes session counter

**Expected output:**
```
✓ Contract initialized!
Admin: GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Linked to EcoToken: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### Step 6: Verify Setup

```bash
# Check linked EcoToken
./game.sh link

# Should return your ECO_TOKEN_ID
```

---

## 🎮 Testing the Integration

### Test 1: Record a Game Session

```bash
# Create a test player
stellar keys generate --global player1 --network testnet

# Record a game with score 500 (should earn 50 ECO)
./game.sh record $(stellar keys address player1) 500 quest
```

**Expected output:**
```
Expected reward: 50 ECO
✓ Game session recorded!
session_id: 1
tokens_earned: 500000000 (50 ECO with 7 decimals)
```

### Test 2: Verify Player Received Tokens

```bash
# Check player's EcoToken balance
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  balance \
  --address $(stellar keys address player1)
```

**Should show**: `"500000000"` (50 ECO)

### Test 3: Check Player Stats

```bash
./game.sh stats $(stellar keys address player1)
```

**Expected output:**
```
{
  total_games_played: 1,
  total_score: 500,
  total_tokens_earned: 500000000
}
```

### Test 4: Get Session Details

```bash
./game.sh session 1
```

**Expected output:**
```
{
  session_id: 1,
  player: GXXXXXXXXX...,
  score: 500,
  game_type: "quest",
  tokens_earned: 500000000,
  timestamp: 123456
}
```

---

## 📊 Complete Example Flow

```bash
# 1. Set environment variables
export ECO_TOKEN_ID=CAT6W7CDV7F2IHDU7LMQMDD72QKS3WIT2P7TCEJNNCLRFDGXTFLTCCMQ
export GAME_REWARDS_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 2. Create players
stellar keys generate --global player1 --network testnet
stellar keys generate --global player2 --network testnet

# 3. Player 1 plays a quest (score 750)
./game.sh record $(stellar keys address player1) 750 quest
# Result: 75 ECO minted

# 4. Player 2 plays a puzzle (score 1200)
./game.sh record $(stellar keys address player2) 1200 puzzle  
# Result: 120 ECO minted

# 5. Player 1 plays again (score 300)
./game.sh record $(stellar keys address player1) 300 battle
# Result: 30 ECO minted

# 6. Check Player 1 stats
./game.sh stats $(stellar keys address player1)
# Shows: 2 games, 1050 total score, 105 ECO earned

# 7. Check total sessions
./game.sh total
# Shows: 3

# 8. View specific session
./game.sh session 2
# Shows Player 2's puzzle game details
```

---

## 🔗 View on Blockchain

After deployment, view your contracts:

**GameRewards Contract:**
```
https://stellar.expert/explorer/testnet/contract/{GAME_REWARDS_ID}
```

**EcoToken Contract:**
```
https://stellar.expert/explorer/testnet/contract/{ECO_TOKEN_ID}
```

---

## 📝 Important Notes

### Reward Calculation

| Score | ECO Earned | Notes |
|-------|-----------|-------|
| 0-49 | 0 | Below minimum |
| 50 | 5 | Minimum reward |
| 100 | 10 | Base: score/10 |
| 500 | 50 | Medium reward |
| 1,000 | 100 | High reward |
| 10,000 | 1,000 | Maximum (capped) |
| 20,000+ | 1,000 | Still capped at max |

### Token Decimals

All amounts are stored with 7 decimals (Stellar standard):
- 1 ECO = 10,000,000 (raw)
- 100 ECO = 1,000,000,000 (raw)

### Cross-Contract Calls

When `record_game_session` is called:
1. GameRewards validates the score
2. Calculates reward tokens
3. Stores session data
4. Updates player stats
5. **Calls EcoToken.mint()** to give player tokens
6. Emits completion event

---

## ⚠️ Troubleshooting

### Error: "EcoToken contract not configured"
**Fix:** Run `./game.sh init` to initialize the contract

### Error: Cross-contract call fails
**Fix:** Ensure GameRewards is the admin of EcoToken:
```bash
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $GAME_REWARDS_ID
```

### Error: Player didn't receive tokens
**Checks:**
1. Score >= 50? (minimum requirement)
2. GameRewards is EcoToken admin?
3. Check player balance with EcoToken contract

### Error: "Session not found"
**Fix:** Check session ID exists:
```bash
./game.sh total  # See how many sessions exist
```

---

## 🎯 Quick Commands Reference

```bash
# Deploy
./game.sh deploy

# Initialize
export ECO_TOKEN_ID=CXXXXXXXXX...
export GAME_REWARDS_ID=CXXXXXXXXX...
./game.sh init

# Record game
./game.sh record PLAYER_ADDR 500 quest

# Check stats
./game.sh stats PLAYER_ADDR

# Get session
./game.sh session 1

# Total sessions
./game.sh total

# Show linked EcoToken
./game.sh link
```

---

## 🌟 Production Considerations

For production deployment:

1. **Authorization**: Implement proper admin-only functions
2. **Rate Limiting**: Add cooldown periods between sessions
3. **Score Validation**: Validate scores server-side (don't trust client)
4. **Event Monitoring**: Set up event listeners for analytics
5. **Error Handling**: Add graceful error recovery
6. **Gas Optimization**: Batch operations where possible

---

## 📚 Next Steps

1. ✅ Deploy both contracts
2. ✅ Link them together
3. ✅ Test with sample game sessions
4. ✅ Integrate with your game backend
5. ✅ Monitor events and analytics
6. ✅ Demo for hackathon!

---

**Your contracts are now live and connected!** 🚀

Players can earn EcoTokens by playing games, and it's all recorded on the Stellar blockchain!
