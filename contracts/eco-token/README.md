# EcoToken Smart Contract

A Soroban-based fungible token contract for the EcoQuest gaming platform on Stellar.

## Token Details

- **Name**: EcoToken
- **Symbol**: ECO
- **Decimals**: 7 (Stellar standard)

## Features

- ✅ Admin-controlled token minting
- ✅ Token transfers between accounts
- ✅ Balance queries
- ✅ Total supply tracking
- ✅ Event logging for mints and transfers
- ✅ Comprehensive error handling

## Prerequisites

- Rust (latest stable)
- Soroban CLI
- Stellar account with testnet funding

### Install Soroban CLI

```bash
cargo install --locked soroban-cli --features opt
```

### Install Rust target for Soroban

```bash
rustup target add wasm32-unknown-unknown
```

## Build

Build the contract:

```bash
cd contracts/eco-token
cargo build --target wasm32-unknown-unknown --release
```

Optimize the WASM file:

```bash
soroban contract optimize \
  --wasm target/wasm32-unknown-unknown/release/eco_token.wasm
```

This creates an optimized WASM file at `target/wasm32-unknown-unknown/release/eco_token.optimized.wasm`

## Testing

Run the test suite:

```bash
cargo test
```

## Deployment to Stellar Testnet

### 1. Configure Stellar CLI for Testnet

```bash
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 2. Create/Import Identity

Create a new identity:
```bash
soroban keys generate --global admin --network testnet
```

Or import existing secret key:
```bash
soroban keys add admin --secret-key SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Get your public key:
```bash
soroban keys address admin
```

### 3. Fund Your Account

Visit the Stellar Laboratory Friendbot:
https://laboratory.stellar.org/#account-creator?network=test

Or use CLI:
```bash
soroban keys fund admin --network testnet
```

### 4. Deploy the Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/eco_token.optimized.wasm \
  --source admin \
  --network testnet
```

This will output a contract ID like:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Save this contract ID for interactions!

### 5. Set Contract ID as Alias (Optional)

```bash
export CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Or create an alias:
```bash
soroban contract alias set ecotoken --id $CONTRACT_ID
```

## Contract Interaction

### Initialize the Contract

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace `GXXXXXXXXX...` with your admin public address.

### Mint Tokens

Mint 1,000 ECO tokens (1000 * 10^7):

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  mint \
  --to GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --amount 10000000000
```

### Check Balance

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  balance \
  --address GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Transfer Tokens

Transfer 100 ECO tokens (100 * 10^7):

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source sender \
  --network testnet \
  -- \
  transfer \
  --from GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_SENDER_XXXX \
  --to GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_RECEIVER_XXX \
  --amount 1000000000
```

### Get Total Supply

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  get_total_supply
```

### Get Token Metadata

```bash
# Get name
soroban contract invoke --id $CONTRACT_ID --network testnet -- name

# Get symbol
soroban contract invoke --id $CONTRACT_ID --network testnet -- symbol

# Get decimals
soroban contract invoke --id $CONTRACT_ID --network testnet -- decimals
```

## Amount Calculation

Since ECO has 7 decimals (Stellar standard):
- 1 ECO = 10,000,000 (10^7)
- 100 ECO = 1,000,000,000
- 1,000 ECO = 10,000,000,000

## Events

The contract emits events for:

1. **Mint Event** - `(topic: "mint", recipient: Address) -> amount: i128`
2. **Transfer Event** - `(topic: "transfer", from: Address, to: Address) -> amount: i128`

Monitor events using:
```bash
soroban events --start-ledger <ledger_number> --id $CONTRACT_ID --network testnet
```

## Error Handling

The contract includes comprehensive error handling:

- **AlreadyInitialized**: Contract can only be initialized once
- **NotInitialized**: Contract must be initialized before use
- **NotAuthorized**: Only admin can mint tokens
- **InsufficientBalance**: Sender doesn't have enough tokens
- **InvalidAmount**: Amount must be positive

## Security Considerations

1. **Admin Key Security**: Keep your admin private key secure - it controls token minting
2. **Initialization**: Contract can only be initialized once - choose admin carefully
3. **Authorization**: All sensitive operations require proper authorization
4. **Overflow Protection**: Uses `checked_add` and `checked_sub` to prevent overflows

## Project Structure

```
contracts/eco-token/
├── src/
│   ├── lib.rs          # Main contract implementation
│   └── test.rs         # Unit tests
├── Cargo.toml          # Rust dependencies
├── rust-toolchain.toml # Rust toolchain configuration
└── README.md           # This file
```

## Useful Links

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet)
- [Soroban Examples](https://github.com/stellar/soroban-examples)

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: Create an issue in the repository
- Stellar Discord: https://discord.gg/stellar

## Hackathon Notes

This contract is designed for the EcoQuest gaming platform and can be integrated with:
- Game reward systems
- In-game purchases
- Player achievements
- Leaderboard rewards
- NFT minting (future extension)

Happy building! 🚀🌟
