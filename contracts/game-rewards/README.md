# GameRewards Smart Contract

A Soroban smart contract for the EcoQuest gaming platform that records game sessions on-chain and automatically distributes EcoToken rewards to players based on their scores.

## 🎮 Overview

GameRewards works in conjunction with the EcoToken contract to create a complete on-chain gaming economy:

- **Records** game sessions on the Stellar blockchain
- **Calculates** rewards based on player scores
- **Distributes** EcoTokens automatically via cross-contract calls
- **Tracks** player statistics and session history

## 📊 Features

### Core Functionality

1. **Game Session Recording**
   - Stores session data (player, score, game type, timestamp)
   - Generates unique session IDs
   - Immutable on-chain record

2. **Automatic Reward Distribution**
   - Calculates tokens based on score
   - Calls EcoToken contract to mint rewards
   - Instant distribution to players

3. **Player Statistics**
   - Total games played
   - Cumulative score
   - Total tokens earned

4. **Session Queries**
   - Retrieve any session by ID
   - View complete session history

## 💰 Reward Formula

```
Base Formula: score / 10 = EcoTokens

Examples:
- 100 points = 10 ECO
- 500 points = 50 ECO  
- 1000 points = 100 ECO

Constraints:
- Minimum score: 50 (below this = 0 tokens)
- Maximum reward: 1000 ECO per session
- Token decimals: 7 (Stellar standard)
```

## 🏗️ Contract Functions

### Admin Functions

#### `initialize(admin, eco_token_contract)`
Set up the contract (one-time only)

```rust
// Parameters:
// - admin: Address with management privileges
// - eco_token_contract: Address of deployed EcoToken contract

game_rewards.initialize(&admin_address, &eco_token_address);
```

### Public Functions

#### `record_game_session(player, score, game_type)`
Record a game session and distribute rewards

```rust
// Parameters:
// - player: Player's address
// - score: Score achieved (0-10000+)
// - game_type: Type of game (e.g., "quest", "puzzle")

// Returns: SessionResult { session_id, tokens_earned }

let result = game_rewards.record_game_session(
    &player_address,
    &750,  // score
    &String::from_str(&env, "quest")
);
// Result: session_id=1, tokens_earned=75 ECO
```

#### `get_player_stats(player)`
Get aggregated player statistics

```rust
// Returns: PlayerStats {
//   total_games_played,
//   total_score,
//   total_tokens_earned
// }

let stats = game_rewards.get_player_stats(&player_address);
```

#### `get_game_session(session_id)`
Retrieve a specific game session

```rust
// Returns: GameSession with all session details

let session = game_rewards.get_game_session(&1);
```

#### `get_total_sessions()`
Get total number of sessions recorded

```rust
let total = game_rewards.get_total_sessions();
```

#### `get_eco_token_contract()`
Get the linked EcoToken contract address

```rust
let eco_token_addr = game_rewards.get_eco_token_contract();
```

## 📦 Data Structures

### GameSession
```rust
{
    session_id: u64,           // Unique identifier
    player: Address,           // Player address
    score: u32,                // Score achieved
    game_type: String,         // Game category
    tokens_earned: i128,       // ECO tokens earned
    timestamp: u64,            // Ledger sequence
}
```

### PlayerStats
```rust
{
    total_games_played: u32,   // Total game count
    total_score: u64,          // Cumulative score
    total_tokens_earned: i128, // Total ECO earned
}
```

### SessionResult
```rust
{
    session_id: u64,           // Created session ID
    tokens_earned: i128,       // Tokens minted
}
```

## 🚀 Build & Test

### Prerequisites
- Rust with `wasm32-unknown-unknown` target
- Stellar CLI
- EcoToken contract built

### Build
```bash
cd /workspaces/EcoStellar/contracts/game-rewards

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Optimize for deployment
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/game_rewards.wasm
```

### Test
```bash
# Run test suite
cargo test

# Test with output
cargo test -- --nocapture
```

## 🌐 Deployment

### Step 1: Deploy EcoToken (if not already done)

```bash
cd ../eco-token
./eco.sh deploy
# Save the CONTRACT_ID
export ECO_TOKEN_ID=CXXXXXXXXX...
```

### Step 2: Deploy GameRewards

```bash
cd ../game-rewards

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/game_rewards.optimized.wasm \
  --source admin \
  --network testnet

# Save the returned contract ID
export GAME_REWARDS_ID=CXXXXXXXXX...
```

### Step 3: Initialize GameRewards

⚠️ **IMPORTANT**: The GameRewards contract needs to be able to mint tokens. You have two options:

**Option A**: Make GameRewards the admin of EcoToken (recommended for testing)

```bash
# When deploying EcoToken, initialize with GameRewards as admin:
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $GAME_REWARDS_ID
```

**Option B**: Keep original admin and manually authorize GameRewards

(More complex - requires modifying EcoToken to support authorized minters)

### Step 4: Initialize GameRewards Contract

```bash
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address admin) \
  --eco_token_contract $ECO_TOKEN_ID
```

## 🎯 Usage Examples

### Record a Game Session

```bash
# Player completes a quest with score 500
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source player \
  --network testnet \
  -- \
  record_game_session \
  --player $(stellar keys address player) \
  --score 500 \
  --game_type "quest"

# Returns: { session_id: 1, tokens_earned: 500000000 } (50 ECO)
```

### Check Player Stats

```bash
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source admin \
  --network testnet \
  -- \
  get_player_stats \
  --player PLAYER_ADDRESS
```

### Get Session Details

```bash
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source admin \
  --network testnet \
  -- \
  get_game_session \
  --session_id 1
```

### Verify Tokens Were Minted

```bash
# Check player's EcoToken balance
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  balance \
  --address PLAYER_ADDRESS
```

## 🔗 Integration with Your Game

### Backend Integration Example (JavaScript/TypeScript)

```typescript
import { Contract, SorobanRpc } from '@stellar/stellar-sdk';

const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const gameRewards = new Contract(GAME_REWARDS_ID);

// Player completes a game
async function recordGameCompletion(
  playerAddress: string,
  score: number,
  gameType: string
) {
  const result = await gameRewards
    .call('record_game_session', playerAddress, score, gameType)
    .send();
  
  console.log(`Session ${result.session_id} created!`);
  console.log(`Player earned ${result.tokens_earned / 10000000} ECO`);
}

// Get player stats for leaderboard
async function getPlayerStats(playerAddress: string) {
  const stats = await gameRewards
    .call('get_player_stats', playerAddress)
    .send();
  
  return {
    gamesPlayed: stats.total_games_played,
    totalScore: stats.total_score,
    tokensEarned: stats.total_tokens_earned / 10000000
  };
}
```

## 📈 Game Integration Workflow

```
1. Player completes game
   └─> Game backend calculates final score

2. Backend calls record_game_session()
   └─> GameRewards contract:
       - Validates score
       - Calculates tokens (score / 10)
       - Creates session record
       - Updates player stats
       - Calls EcoToken.mint()
       - Emits event

3. EcoToken contract mints tokens
   └─> Player receives ECO tokens

4. Game UI updates
   └─> Shows tokens earned
   └─> Updates player balance
```

## 📊 Reward Examples

| Score | Tokens Earned | Use Case |
|-------|--------------|----------|
| 0-49 | 0 ECO | Failed/practice mode |
| 50 | 5 ECO | Minimum reward |
| 100 | 10 ECO | Easy quest |
| 500 | 50 ECO | Medium quest |
| 1,000 | 100 ECO | Hard quest |
| 5,000 | 500 ECO | Boss battle |
| 10,000+ | 1,000 ECO | Max reward (capped) |

## 🔍 Events

### game_done Event
Emitted when a session is recorded

```rust
topics: ["game_done", player_address]
data: (session_id, score, tokens_earned)
```

Monitor events:
```bash
stellar events --start-ledger LEDGER \
  --id $GAME_REWARDS_ID \
  --network testnet
```

## ⚠️ Security Considerations

1. **Admin Access**: GameRewards needs to mint tokens
   - Set GameRewards as EcoToken admin, OR
   - Implement authorized minter pattern

2. **Player Authorization**: Players must authorize their sessions
   - Prevents fake session recording

3. **Score Validation**: Backend must validate scores
   - Don't trust client-side scoring

4. **Rate Limiting**: Consider implementing cooldown periods
   - Prevents session spam

## 🧪 Testing

The contract includes comprehensive tests:

- ✅ Initialization
- ✅ Session recording with rewards
- ✅ Minimum score requirement (< 50 = no rewards)
- ✅ Maximum reward cap (1000 ECO max)
- ✅ Multiple sessions per player
- ✅ Player statistics aggregation
- ✅ Session retrieval
- ✅ Cross-contract EcoToken minting

Run tests:
```bash
cargo test
```

## 📝 Error Handling

The contract handles these error cases:

- ❌ Contract not initialized
- ❌ Score is 0 or negative
- ❌ Session ID doesn't exist
- ❌ EcoToken contract not configured

## 🎮 Example Game Flow

```bash
# 1. Player starts game
# 2. Player completes game with score 750

# 3. Record session
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source player1 \
  --network testnet \
  -- \
  record_game_session \
  --player $(stellar keys address player1) \
  --score 750 \
  --game_type "dungeon_crawl"

# Result: 75 ECO minted to player

# 4. Check player stats
stellar contract invoke \
  --id $GAME_REWARDS_ID \
  --source admin \
  --network testnet \
  -- \
  get_player_stats \
  --player $(stellar keys address player1)

# Shows: 1 game, 750 score, 75 ECO earned

# 5. Verify EcoToken balance
stellar contract invoke \
  --id $ECO_TOKEN_ID \
  --source admin \
  --network testnet \
  -- \
  balance \
  --address $(stellar keys address player1)

# Shows: 750000000 (75 ECO with 7 decimals)
```

## 🔗 Cross-Contract Architecture

```
┌─────────────┐
│ Game Backend│
└──────┬──────┘
       │ 1. record_game_session(player, score, "quest")
       ▼
┌─────────────────┐
│ GameRewards     │
│ Contract        │
│                 │
│ - Validate      │
│ - Calculate     │
│ - Store session │
│ - Update stats  │
└────────┬────────┘
         │ 2. mint(player, tokens)
         ▼
┌─────────────────┐
│ EcoToken        │
│ Contract        │
│                 │
│ - Mint tokens   │
│ - Update balance│
│ - Emit event    │
└─────────────────┘
```

## 🌟 Best Practices

1. **Score Validation**: Validate scores server-side before recording
2. **Gas Limits**: Be aware of transaction costs
3. **Event Monitoring**: Monitor events for analytics
4. **Error Handling**: Handle contract errors gracefully
5. **Testing**: Test with various score ranges

## 📚 Related Documentation

- [EcoToken Contract](../eco-token/README.md)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Cross-Contract Calls](https://soroban.stellar.org/docs/learn/interactions)

## 🆘 Troubleshooting

**Issue**: "EcoToken contract not configured"
- **Fix**: Ensure you initialized GameRewards with correct EcoToken address

**Issue**: Cross-contract call fails
- **Fix**: Make sure GameRewards is admin of EcoToken

**Issue**: Player didn't receive tokens
- **Fix**: Check minimum score requirement (>= 50)

## License

MIT License

---

Built for EcoQuest hackathon on Stellar/Soroban 🚀
