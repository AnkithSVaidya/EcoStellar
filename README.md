# EcoStellar 🌟

Video link for the project - https://drive.google.com/file/d/1ISBvItoVuZLG5r6WCvwnYYQQUi8c_Q6C/view?usp=sharing 

A Stellar/Soroban smart contract platform for the EcoQuest gaming ecosystem.

## 🎮 About

EcoStellar provides blockchain-powered token infrastructure for the EcoQuest gaming platform, enabling:
- ✅ In-game rewards and achievements
- ✅ Player-to-player token transfers
- ✅ Transparent token supply tracking
- ✅ Admin-controlled minting for game mechanics

## 📦 What's Inside

### 1. React Frontend (`frontend/`)

A modern web application built with React 18 and Vite:

- **Pages**:
  - ✅ Landing page with hero section and features
  - ✅ Game page (embeds Carbon Dash)
  - ✅ Impact dashboard (environmental stats)
  - ✅ NFT gallery (Tree certificate showcase)

- **Features**:
  - ✅ Freighter wallet integration
  - ✅ Real-time score tracking
  - ✅ Toast notifications
  - ✅ Responsive mobile design
  - ✅ Dark mode with green theme
  - ✅ Context API state management

### 2. Carbon Dash Game (`game/`)

An endless runner web game built with Phaser.js that rewards players with blockchain tokens:

- **Game Mechanics**:
  - ✅ Click/tap to jump over pollution obstacles
  - ✅ Collect green energy orbs for points (+10 each)
  - ✅ Progressive difficulty (speeds up over time)
  - ✅ Parallax scrolling background
  - ✅ Mobile-responsive design

- **Blockchain Integration**:
  - ✅ Earn ECO tokens for high scores (score ÷ 10 = tokens)
  - ✅ "Claim Rewards" connects to GameRewards contract
  - ✅ Real cryptocurrency rewards on Stellar blockchain
  - ✅ Freighter wallet integration

### 3. EcoToken Smart Contract (`contracts/eco-token/`)

A fully functional Soroban token contract with:

- **Token Details**:
  - Name: EcoToken
  - Symbol: ECO
  - Decimals: 7 (Stellar standard)

- **Features**:
  - ✅ Admin-controlled minting
  - ✅ Secure token transfers
  - ✅ Balance queries
  - ✅ Total supply tracking
  - ✅ Event logging for auditing
  - ✅ Comprehensive error handling

### 4. GameRewards Smart Contract (`contracts/game-rewards/`)

An automated rewards distribution system that integrates with EcoToken:

- **Features**:
  - ✅ Record game sessions on-chain
  - ✅ Calculate rewards based on score (score/10 = tokens)
  - ✅ Automatic token minting via cross-contract calls
  - ✅ Player statistics tracking
  - ✅ Session history queries
  - ✅ Minimum score (50) and maximum reward (1000 ECO) enforcement

### 5. TreeNFT Smart Contract (`contracts/tree-nft/`)

Soulbound NFT certificates for real-world trees planted through EcoQuest:

- **Features**:
  - ✅ Mint tree certificate NFTs with rich metadata
  - ✅ Store GPS coordinates, species, plant date, photo URL
  - ✅ Non-transferable (soulbound) certificates
  - ✅ Players can own multiple tree NFTs
  - ✅ Query by NFT ID or player address
  - ✅ Transparent environmental impact tracking

## 🚀 Quick Start

### Run the React Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Play the Game

```bash
cd game
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

📖 **Full game guide**: See [`game/README.md`](game/README.md)

### Build the Contracts

```bash
cd contracts/eco-token
cargo build --target wasm32-unknown-unknown --release
cargo test
```

### Deploy to Stellar Testnet

```bash
# Optimize the contract
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/eco_token.wasm

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/eco_token.optimized.wasm \
  --source admin \
  --network testnet
```

📖 **Full deployment guide**: See [`contracts/eco-token/DEPLOY.md`](contracts/eco-token/DEPLOY.md)

## 📚 Documentation

### React Frontend
- **[Frontend README](frontend/README.md)** - Complete setup & development guide
- **[Component Documentation](frontend/README.md#-key-components)** - Reusable components
- **[Context API Guide](frontend/README.md#-context-providers)** - State management

### Carbon Dash Game
- **[Game README](game/README.md)** - How to play and run locally
- **[Blockchain Integration](game/BLOCKCHAIN_INTEGRATION.md)** - Connect game to Stellar
- **[Asset Guide](game/ASSETS.md)** - Custom graphics specifications

### EcoToken
- **[Deployment Guide](contracts/eco-token/DEPLOY.md)** - Complete deployment walkthrough
- **[Contract README](contracts/eco-token/README.md)** - Technical documentation
- **[Quick Start](contracts/eco-token/QUICKSTART.md)** - Fast setup guide
- **[Testing Guide](contracts/eco-token/TESTING.md)** - How to verify it works

### GameRewards
- **[Deployment Guide](contracts/game-rewards/DEPLOY.md)** - Step-by-step deployment & linking
- **[Contract README](contracts/game-rewards/README.md)** - Full technical documentation
- **[Complete Guide](contracts/game-rewards/COMPLETE.md)** - Overview and status

### TreeNFT
- **[Deployment Guide](contracts/tree-nft/DEPLOY.md)** - GPS coordinates & minting guide
- **[Contract README](contracts/tree-nft/README.md)** - Complete documentation

## 🧪 Testing

### Test the React Frontend

```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

### Test the Game

```bash
cd game
python3 -m http.server 8080
# Play at http://localhost:8080
```

### Test Smart Contracts

All contracts include comprehensive test suites:

```bash
cd contracts/eco-token
cargo test
```

**Current Status**: ✅ 6/6 tests passing

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router, CSS Modules
- **Game Frontend**: Phaser 3, JavaScript, HTML5 Canvas
- **Smart Contracts**: Rust + Soroban SDK
- **Blockchain**: Stellar Network
- **Wallet**: Freighter Browser Extension
- **Build Tools**: Cargo, Stellar CLI, npm
- **Testing**: Soroban SDK Test Utils

## 📊 Contract Status

| Component | Tests | Build | Status |
|----------|-------|-------|--------|
| React Frontend | N/A | Ready | ✅ Development Server |
| Carbon Dash Game | N/A | Ready | ✅ Playable Now! |
| EcoToken | ✅ 6/6 | 5.3KB | ✅ Deployed on Testnet |
| GameRewards | ✅ 6/6 | 8.4KB | ✅ Deployed on Testnet |
| TreeNFT | ✅ 6/6 | 6.1KB | ✅ Deployed on Testnet |

## 🎯 Use Cases

### For Players
- **Play Carbon Dash** - Fun endless runner game in your browser! 🎮
- Earn ECO tokens through gameplay (automatically!)
- Transfer tokens to other players
- Track your token balance on-chain
- View your complete game history
- Mint tree NFT certificates for achievements
- Compete on leaderboards

### For Game Developers
- Integrate blockchain rewards into any web game
- Reward players with ECO tokens for achievements
- Create in-game economies with transparent token tracking
- Enable player-to-player trading
- **Automate reward distribution** with GameRewards contract
- Track player statistics on-chain

### Complete Workflow
```
🎮 Play Carbon Dash Game
  ↓
Player scores 750 points in endless runner
  ↓
Player clicks "Claim Rewards" button
  ↓
GameRewards Contract:
  1. Records session on-chain
  2. Calculates: 750/10 = 75 ECO
  3. Calls EcoToken to mint
  4. Player receives 75 ECO ✓
  ↓
🌳 Unlock Achievement
  ↓
TreeNFT Contract:
  1. Mints certificate NFT
  2. Stores GPS coordinates
  3. Player receives permanent proof ✓
```

## 🔗 Useful Links

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/explorer/testnet) (Block Explorer)
- [Stellar Discord](https://discord.gg/stellar)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🏆 Hackathon

Built for hackathon demonstration of Stellar/Soroban smart contract capabilities.

---

**Ready to play?** Open `game/index.html` or check out the [game README](game/README.md)! 🎮

**Ready to deploy contracts?** Check out the [deployment guide](contracts/eco-token/DEPLOY.md)! 🚀
