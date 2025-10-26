# TreeNFT Smart Contract 🌳

Soroban smart contract for minting Tree Certificate NFTs representing real-world trees planted through the EcoQuest gaming platform.

## Overview

Each NFT is a soulbound (non-transferable) token that certifies a tree planted in real life, storing complete metadata including GPS coordinates, species, planting date, and photo evidence on the Stellar blockchain.

## Features

✅ **Soulbound NFTs** - Non-transferable certificates tied to player accounts  
✅ **Rich Metadata** - Species, GPS coordinates, planting date, image URL  
✅ **Player Collections** - Players can own multiple tree NFTs  
✅ **Query Functions** - Get individual NFTs or all trees owned by a player  
✅ **Transparent Tracking** - Total trees planted visible on-chain  
✅ **Event Logging** - All minting activities recorded

## Data Structures

### TreeMetadata
```rust
pub struct TreeMetadata {
    pub nft_id: u64,
    pub owner: Address,
    pub species: String,
    pub latitude: i32,       // GPS latitude × 1,000,000
    pub longitude: i32,      // GPS longitude × 1,000,000
    pub plant_date: u64,     // Unix timestamp
    pub image_url: String,
    pub mint_timestamp: u64, // When NFT was minted
}
```

### GPS Coordinate Format

Coordinates are stored as integers for precision:
- **Multiply by 1,000,000** before storing
- Example: `37.7749°N` → `37774900`
- Example: `-122.4194°W` → `-122419400`

## Contract Functions

### Administrative

#### `initialize(admin)`
Initialize the contract with an admin address.
- **Parameters:** `admin: Address`
- **Authorization:** Requires admin signature
- **Can only be called once**

### NFT Management

#### `mint_tree_nft(player, species, latitude, longitude, plant_date, image_url)`
Mint a new Tree NFT certificate.
- **Parameters:**
  - `player: Address` - NFT recipient
  - `species: String` - Tree species (e.g., "Oak", "Pine")
  - `latitude: i32` - GPS latitude × 1,000,000
  - `longitude: i32` - GPS longitude × 1,000,000
  - `plant_date: u64` - Unix timestamp when planted
  - `image_url: String` - URL to tree photo/certificate
- **Returns:** `u64` - The new NFT ID
- **Authorization:** Only admin can mint
- **Events:** Emits `mint` event with player and species

### Query Functions

#### `get_tree_nft(nft_id)`
Get complete metadata for a specific tree NFT.
- **Parameters:** `nft_id: u64`
- **Returns:** `TreeMetadata`

#### `get_player_trees(player)`
Get all NFT IDs owned by a player.
- **Parameters:** `player: Address`
- **Returns:** `Vec<u64>` - Array of NFT IDs

#### `get_total_trees_minted()`
Get the total number of trees minted globally.
- **Returns:** `u64` - Total tree count

#### `get_admin()`
Get the contract admin address.
- **Returns:** `Address`

## Usage Examples

### Minting a Tree NFT

```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source admin \
  --network testnet \
  -- \
  mint_tree_nft \
  --player $PLAYER_ADDRESS \
  --species "Oak" \
  --latitude 37774900 \
  --longitude -122419400 \
  --plant_date 1698345600 \
  --image_url "https://storage.example.com/tree1.jpg"
```

### Getting Player's Trees

```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source player \
  --network testnet \
  -- \
  get_player_trees \
  --player $PLAYER_ADDRESS
```

### Getting Tree Details

```bash
stellar contract invoke \
  --id $TREE_NFT_ID \
  --source player \
  --network testnet \
  -- \
  get_tree_nft \
  --nft_id 1
```

## Real-World Use Cases

### Environmental Impact Tracking
- Players plant real trees through EcoQuest
- Each tree receives a blockchain certificate
- GPS coordinates prove actual planting location
- Photo evidence stored via IPFS or cloud storage
- Lifetime tracking of environmental contribution

### Gamification
- Earn NFTs by playing games and achieving milestones
- Build a collection of trees across different species
- Show off your environmental impact portfolio
- Compete with other players on total trees planted

### Transparency & Trust
- All tree data immutably stored on Stellar blockchain
- Anyone can verify planting locations and dates
- No double-counting or fake claims
- Full audit trail from game to real-world impact

## GPS Coordinate Examples

| Location | Latitude | Longitude | Stored Lat | Stored Lon |
|----------|----------|-----------|------------|------------|
| San Francisco | 37.7749°N | 122.4194°W | 37774900 | -122419400 |
| New York | 40.7128°N | 74.0060°W | 40712800 | -74006000 |
| Tokyo | 35.6762°N | 139.6503°E | 35676200 | 139650300 |
| Sydney | -33.8688°S | 151.2093°E | -33868800 | 151209300 |
| London | 51.5074°N | 0.1278°W | 51507400 | -127800 |

## Testing

Run the complete test suite:

```bash
cargo test
```

**Test Coverage:**
- ✅ Contract initialization
- ✅ NFT minting with metadata
- ✅ Player collections (multiple NFTs per player)
- ✅ Multiple players
- ✅ GPS coordinate storage
- ✅ Prevents re-initialization

## Building

```bash
# Build
cargo build --target wasm32-unknown-unknown --release

# Optimize
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/tree_nft.wasm
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for complete deployment instructions.

## Integration with EcoQuest

### Typical Flow:
1. Player completes game achievements → Earns ECO tokens via GameRewards
2. Player uses tokens → Plants real tree through partner organization
3. Admin mints TreeNFT → Player receives permanent certificate
4. Player verifies → GPS coordinates + photo on blockchain
5. Player shares → Show off environmental impact!

## Technical Notes

### Storage Patterns
- Uses Soroban instance storage for all data
- NFT counter tracks sequential IDs
- Player collections stored as vectors of NFT IDs
- All metadata stored on-chain (no external dependencies)

### Soulbound NFTs
NFTs are intentionally non-transferable in this implementation to prevent:
- Secondary market speculation
- Fake environmental claims
- Dissociation from actual player impact

In a production system, transfer functions could be added if needed.

### Gas Costs
Approximate costs per operation:
- Initialize: ~60,000 stroops
- Mint NFT: ~50,000 stroops  
- Query operations: Read-only (free simulation)

## Future Enhancements

Potential additions for production:
- [ ] NFT metadata update (e.g., tree growth photos)
- [ ] Tree verification status (pending → verified)
- [ ] Integration with real forestry partners
- [ ] IPFS for decentralized image storage
- [ ] Carbon offset calculations based on tree type
- [ ] Tree survival status tracking

## License

MIT License - Open source for environmental good! 🌍

---

Built with 💚 for EcoQuest and the planet
