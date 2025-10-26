# TreeNFT Contract - Deployment Guide 🌳

Complete step-by-step guide to deploy the TreeNFT contract to Stellar testnet.

## Prerequisites

- ✅ Stellar CLI installed
- ✅ Admin keypair generated
- ✅ Funded testnet account (get XLM from friendbot)
- ✅ Contract built and optimized

## Step 1: Build the Contract

```bash
cd /workspaces/EcoStellar/contracts/tree-nft

# Build for WASM
cargo build --target wasm32-unknown-unknown --release

# Optimize the WASM
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/tree_nft.wasm
```

**Output:**
```
Reading: target/wasm32-unknown-unknown/release/tree_nft.wasm
Optimized: target/wasm32-unknown-unknown/release/tree_nft.optimized.wasm
```

## Step 2: Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tree_nft.wasm \
  --source admin \
  --network testnet
```

**Save the contract ID:**
```bash
export TREE_NFT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 3: Initialize the Contract

```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address admin)
```

**Expected output:**
```
✅ Contract initialized successfully
```

## Step 4: Verify Deployment

### Check admin:
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_admin
```

### Check total trees minted:
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_total_trees_minted
```

**Should return:** `0` (no trees minted yet)

## Step 5: Mint Your First Tree NFT

```bash
# Generate a player account (or use existing)
stellar keys generate player1 --network testnet

# Mint a tree NFT
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $(stellar keys address player1) \
  --species "Oak" \
  --latitude 37774900 \
  --longitude -122419400 \
  --plant_date 1698345600 \
  --image_url "https://example.com/tree1.jpg"
```

**Expected output:**
```
1
```
(Returns NFT ID)

## Step 6: Verify the NFT

### Get tree metadata:
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_tree_nft \
  --nft_id 1
```

**Expected output:**
```json
{
  "nft_id": 1,
  "owner": "GXXXXX...",
  "species": "Oak",
  "latitude": 37774900,
  "longitude": -122419400,
  "plant_date": 1698345600,
  "image_url": "https://example.com/tree1.jpg",
  "mint_timestamp": 1729876543
}
```

### Get player's trees:
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_player_trees \
  --player $(stellar keys address player1)
```

**Expected output:**
```
[1]
```

## GPS Coordinate Conversion

When minting NFTs, convert decimal degrees to integers:

### Examples:

**San Francisco:**
- Latitude: 37.7749°N → `37774900`
- Longitude: 122.4194°W → `-122419400`

**New York:**
- Latitude: 40.7128°N → `40712800`
- Longitude: 74.0060°W → `-74006000`

**Formula:**
```
integer_value = decimal_degrees × 1,000,000
```

**For negative (South/West):**
```
integer_value = -(decimal_degrees × 1,000,000)
```

## Testing Scenarios

### Scenario 1: Single Player, Multiple Trees

```bash
# Mint Oak tree
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $(stellar keys address player1) \
  --species "Oak" \
  --latitude 37774900 \
  --longitude -122419400 \
  --plant_date 1698345600 \
  --image_url "https://example.com/oak1.jpg"

# Mint Pine tree for same player
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $(stellar keys address player1) \
  --species "Pine" \
  --latitude 40712800 \
  --longitude -74006000 \
  --plant_date 1698432000 \
  --image_url "https://example.com/pine1.jpg"

# Check player's collection
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_player_trees \
  --player $(stellar keys address player1)
```

**Expected:** `[1, 2]`

### Scenario 2: Multiple Players

```bash
# Create another player
stellar keys generate player2 --network testnet

# Mint tree for player2
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $(stellar keys address player2) \
  --species "Maple" \
  --latitude 34052200 \
  --longitude -118243700 \
  --plant_date 1698518400 \
  --image_url "https://example.com/maple1.jpg"

# Check total trees
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_total_trees_minted
```

**Expected:** `3` (total across all players)

## Integration with EcoQuest System

If you have EcoToken and GameRewards deployed:

### Complete Workflow:

1. **Player earns tokens:**
```bash
# Record game session (from GameRewards contract)
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source admin \
  --network testnet \
  -- \
  record_game_session \
  --player $(stellar keys address player1) \
  --score 1000 \
  --game_type "tree_quest"
```

2. **Admin mints tree NFT as reward:**
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $(stellar keys address player1) \
  --species "Oak" \
  --latitude 37774900 \
  --longitude -122419400 \
  --plant_date $(date +%s) \
  --image_url "https://ipfs.io/ipfs/QmXXXXXX"
```

3. **Player verifies ownership:**
```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  get_player_trees \
  --player $(stellar keys address player1)
```

## Viewing on Blockchain Explorer

After deployment, view your contract on Stellar Expert:

```
https://stellar.expert/explorer/testnet/contract/[YOUR_CONTRACT_ID]
```

### What to Look For:
- ✅ Contract creation transaction
- ✅ Initialize transaction
- ✅ Mint events with player addresses and species
- ✅ Storage entries for each NFT

## Troubleshooting

### Error: "Contract already initialized"
- You can only call `initialize()` once
- Deploy a new contract if you need to re-initialize

### Error: "NFT not found"
- The NFT ID doesn't exist
- Check `get_total_trees_minted()` for valid range

### Error: "Admin not set"
- Contract wasn't initialized
- Call `initialize()` first

### GPS Coordinates Look Wrong
- Remember to multiply by 1,000,000
- Use negative values for South latitude and West longitude

## Production Considerations

### Before Mainnet:

1. **Test thoroughly on testnet**
2. **Verify GPS coordinate calculations**
3. **Set up IPFS for image hosting** (instead of centralized URLs)
4. **Plan tree verification workflow**
5. **Consider partnering with real forestry organizations**
6. **Implement photo upload and verification system**
7. **Add metadata update functions for tree growth tracking**

### Security:

- ✅ Only admin can mint (prevents fake certificates)
- ✅ NFTs are soulbound (prevents speculation)
- ✅ Metadata is immutable once minted
- ✅ All operations logged via events

## Helper Script

Save this as `tree.sh`:

```bash
#!/bin/bash

TREE_NFT_ID="YOUR_CONTRACT_ID_HERE"

case "$1" in
  "mint")
    stellar contract invoke \
      --id $TREE_NFT_ID \
      --source admin \
      --network testnet \
      -- \
      mint_tree_nft \
      --player $2 \
      --species $3 \
      --latitude $4 \
      --longitude $5 \
      --plant_date $6 \
      --image_url $7
    ;;
  "get")
    stellar contract invoke \
      --id $TREE_NFT_ID \
      --source admin \
      --network testnet \
      -- \
      get_tree_nft \
      --nft_id $2
    ;;
  "player")
    stellar contract invoke \
      --id $TREE_NFT_ID \
      --source admin \
      --network testnet \
      -- \
      get_player_trees \
      --player $2
    ;;
  "total")
    stellar contract invoke \
      --id $TREE_NFT_ID \
      --source admin \
      --network testnet \
      -- \
      get_total_trees_minted
    ;;
  *)
    echo "Usage: ./tree.sh {mint|get|player|total} [args]"
    ;;
esac
```

Usage:
```bash
chmod +x tree.sh
./tree.sh mint $(stellar keys address player1) "Oak" 37774900 -122419400 1698345600 "https://example.com/tree.jpg"
./tree.sh get 1
./tree.sh player $(stellar keys address player1)
./tree.sh total
```

---

**Ready to plant some blockchain trees! 🌳✨**
