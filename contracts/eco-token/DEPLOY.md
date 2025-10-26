# ✅ EcoToken - Ready to Deploy!

Your contract is **built, tested, and optimized**!

## 📊 Status

✅ **Contract Built**: `eco_token.wasm` (5.8KB)
✅ **Optimized**: `eco_token.optimized.wasm` (5.3KB)  
✅ **CLI Installed**: `stellar 23.1.4`
✅ **Tests Passing**: 6/6 tests ✓

## 🚀 Deployment Guide

### Step 1: Configure Testnet Network

```bash
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Step 2: Generate Admin Keys

```bash
# Generate new keypair
stellar keys generate --global admin --network testnet

# View your address
stellar keys address admin
```

💡 **Save your address!** You'll need it for deployment.

### Step 3: Fund Your Account

```bash
stellar keys fund admin --network testnet
```

This requests test XLM from the Stellar testnet faucet.

### Step 4: Deploy the Contract

```bash
cd /workspaces/EcoStellar/contracts/eco-token

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/eco_token.optimized.wasm \
  --source admin \
  --network testnet
```

📝 **IMPORTANT**: Copy the Contract ID that gets returned! It will look like:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 5: Save Contract ID

```bash
# Replace with your actual contract ID
export CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optionally save to file for later
echo "export CONTRACT_ID=$CONTRACT_ID" >> ~/.bashrc
```

### Step 6: Initialize the Contract

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address admin)
```

### Step 7: Mint Your First Tokens

Mint 10,000 ECO tokens (10,000 × 10^7 = 100,000,000,000):

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  mint \
  --to $(stellar keys address admin) \
  --amount 100000000000
```

### Step 8: Verify Balance

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  balance \
  --address $(stellar keys address admin)
```

Should return: `100000000000` (10,000 ECO tokens)

---

## 🎮 Integration with Your Game

### Get Token Metadata

```bash
# Token name
stellar contract invoke --id $CONTRACT_ID --network testnet -- name

# Token symbol  
stellar contract invoke --id $CONTRACT_ID --network testnet -- symbol

# Decimals
stellar contract invoke --id $CONTRACT_ID --network testnet -- decimals
```

### Mint Rewards to Players

```bash
# Mint 100 ECO to a player (100 * 10^7)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  mint \
  --to PLAYER_STELLAR_ADDRESS \
  --amount 1000000000
```

### Check Total Supply

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  get_total_supply
```

### Transfer Between Players

Players can transfer tokens to each other:

```bash
# Create/import player key first
stellar keys add player1 --secret-key SXXXXXXXXXXXXXXX

# Transfer 50 ECO from player1 to player2 (50 * 10^7)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source player1 \
  --network testnet \
  -- \
  transfer \
  --from $(stellar keys address player1) \
  --to PLAYER2_ADDRESS \
  --amount 500000000
```

---

## 💡 Token Amount Calculator

ECO has 7 decimals (Stellar standard). Use this guide:

| Human-Readable | Contract Amount | Calculation |
|---------------|----------------|-------------|
| 1 ECO | 10000000 | 1 × 10^7 |
| 10 ECO | 100000000 | 10 × 10^7 |
| 100 ECO | 1000000000 | 100 × 10^7 |
| 1,000 ECO | 10000000000 | 1,000 × 10^7 |
| 10,000 ECO | 100000000000 | 10,000 × 10^7 |

**Quick formula**: `Human Amount × 10,000,000 = Contract Amount`

---

## 🔍 Monitoring & Debugging

### View Contract on Stellar Expert

Once deployed, view your contract at:
```
https://stellar.expert/explorer/testnet/contract/{CONTRACT_ID}
```

### Watch Events

Monitor mint and transfer events:

```bash
# Get current ledger
stellar ledger get --network testnet

# Watch events from a specific ledger
stellar events --start-ledger LEDGER_NUMBER --id $CONTRACT_ID --network testnet
```

### Common Issues

**Issue**: `Account not found`
- **Fix**: Run `stellar keys fund admin --network testnet`

**Issue**: `Contract not initialized`
- **Fix**: Run the initialize command (Step 6)

**Issue**: `Not authorized`
- **Fix**: Only admin can mint. Make sure you're using `--source admin`

---

## 📦 SDK Integration (For Your Game Backend)

### JavaScript/TypeScript Example

```typescript
import { Contract, SorobanRpc, Keypair } from '@stellar/stellar-sdk';

const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const contract = new Contract(CONTRACT_ID);

// Mint tokens to a player
async function mintToPlayer(playerAddress: string, amount: string) {
  const tx = contract
    .call('mint', playerAddress, amount)
    .build();
  
  // Sign and submit...
}
```

### Python Example

```python
from stellar_sdk import SorobanServer, Keypair, TransactionBuilder, Network

server = SorobanServer("https://soroban-testnet.stellar.org")
admin = Keypair.from_secret("YOUR_ADMIN_SECRET")

# Build transaction to mint tokens
# ... (use stellar-sdk Python library)
```

---

## 🎉 Your Hackathon Checklist

- [✅] Contract built and optimized
- [✅] Tests passing
- [✅] Stellar CLI installed
- [ ] Network configured (Step 1)
- [ ] Admin keys generated (Step 2)
- [ ] Account funded (Step 3)
- [ ] Contract deployed (Step 4)
- [ ] Contract initialized (Step 6)
- [ ] First tokens minted (Step 7)
- [ ] Integration with game backend
- [ ] Demo ready!

---

## 🆘 Need Help?

- **Stellar Discord**: https://discord.gg/stellar
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Stellar Expert** (Block Explorer): https://stellar.expert/explorer/testnet

Good luck with your hackathon! 🚀🌟
