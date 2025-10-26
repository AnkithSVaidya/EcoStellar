# EcoStellar Backend API

Node.js Express backend for EcoStellar blockchain gaming platform with Stellar integration.

## 🚀 Features

- **Game Session Management** - Record gameplay and award tokens
- **Player Profiles** - Track stats, levels, and achievements
- **Tree NFT Minting** - Create blockchain-verified tree certificates
- **Stellar Integration** - Full blockchain connectivity
- **SQLite Database** - Lightweight data storage
- **REST API** - Clean, documented endpoints
- **Security** - Rate limiting, helmet, CORS, validation

## 📋 Prerequisites

- Node.js 16+ and npm
- Stellar testnet account (for production)
- Deployed Stellar smart contracts (EcoToken, GameRewards, TreeNFT)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Initialize database
npm run init-db

# Start server
npm run dev
```

## 🔧 Configuration

Edit `.env` file:

```bash
# Server
PORT=4000
NODE_ENV=development

# Stellar
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
ADMIN_SECRET_KEY=SXXX...  # Your admin secret key
ADMIN_PUBLIC_KEY=GXXX...  # Your admin public key

# Contracts (get these after deploying contracts)
ECO_TOKEN_CONTRACT_ID=CXXX...
GAME_REWARDS_CONTRACT_ID=CXXX...
TREE_NFT_CONTRACT_ID=CXXX...

# API
CORS_ORIGIN=http://localhost:3000
```

### Getting Stellar Credentials

1. **Create testnet account**: https://laboratory.stellar.org/#account-creator?network=test
2. **Fund with testnet XLM**: Use the friendbot link provided
3. **Deploy contracts**: Follow `/contracts/*/DEPLOY.md` guides
4. **Copy contract IDs** to `.env`

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### 1. Submit Game Session

**POST** `/api/game/submit`

Submit a game score and earn EcoTokens.

**Request:**
```json
{
  "wallet_address": "GXXX...XXX",
  "score": 450,
  "game_type": "carbon_dash"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": 123,
  "tokens_earned": 45,
  "new_balance": 1295,
  "level": 5,
  "blockchain": {
    "success": true,
    "txHash": "abc123...",
    "explorerLink": "https://stellar.expert/..."
  }
}
```

**Token Calculation:** `tokens_earned = floor(score / 10)`

---

#### 2. Get Player Profile

**GET** `/api/player/:wallet`

Retrieve player statistics and profile.

**Response:**
```json
{
  "success": true,
  "player": {
    "wallet_address": "GXXX...XXX",
    "games_played": 25,
    "total_score": 12500,
    "eco_tokens_balance": 1250,
    "level": 5,
    "trees_planted": 2,
    "created_at": "2024-10-01T00:00:00.000Z",
    "recent_sessions": [...]
  }
}
```

---

#### 3. Get Player NFTs

**GET** `/api/player/:wallet/nfts`

Get all Tree NFTs owned by player.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "nfts": [
    {
      "nft_id": 1,
      "token_id": 1,
      "species": "Giant Sequoia",
      "location": "Yosemite, CA",
      "coordinates": {
        "latitude": 37.7489,
        "longitude": -119.5598
      },
      "plant_date": 1698345600,
      "carbon_offset": 1200,
      "partner_org": "One Tree Planted",
      "image_url": "https://...",
      "minted_at": "2024-10-15T00:00:00.000Z",
      "explorer_link": "https://stellar.expert/..."
    }
  ]
}
```

---

#### 4. Mint Tree NFT

**POST** `/api/tree/mint`

Mint a new Tree NFT (costs 100 EcoTokens).

**Request:**
```json
{
  "wallet_address": "GXXX...XXX",
  "species": "Oak",
  "location": "San Francisco, CA",
  "latitude": 37774900,
  "longitude": -122419400,
  "carbon_offset": 500,
  "partner_org": "Trees for the Future",
  "image_url": "https://example.com/oak.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "nft_id": 3,
  "token_id": 3,
  "explorer_link": "https://stellar.expert/...",
  "tokens_spent": 100,
  "remaining_tokens": 1150
}
```

**Requirements:**
- Player must have ≥100 EcoTokens
- Coordinates in micro-degrees (multiply by 1,000,000)

---

#### 5. Global Statistics

**GET** `/api/stats/global`

Get platform-wide statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_players": 1247,
    "total_games": 18430,
    "total_score": 5621340,
    "total_trees": 891,
    "total_tokens_earned": 562134,
    "total_co2_offset": 445500,
    "active_players": 432
  }
}
```

---

#### 6. Health Check

**GET** `/health`

Server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-26T00:00:00.000Z",
  "stellar": {
    "network": "testnet",
    "mockMode": false
  }
}
```

## 🗄️ Database Schema

### players
```sql
CREATE TABLE players (
  wallet_address TEXT PRIMARY KEY,
  total_games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  total_eco_tokens INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### game_sessions
```sql
CREATE TABLE game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_wallet TEXT NOT NULL,
  score INTEGER NOT NULL,
  tokens_earned INTEGER NOT NULL,
  game_type TEXT DEFAULT 'carbon_dash',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_wallet) REFERENCES players(wallet_address)
);
```

### tree_nfts
```sql
CREATE TABLE tree_nfts (
  nft_id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_wallet TEXT NOT NULL,
  species TEXT NOT NULL,
  location TEXT,
  latitude INTEGER,
  longitude INTEGER,
  plant_date INTEGER,
  carbon_offset INTEGER DEFAULT 0,
  partner_org TEXT,
  image_url TEXT,
  stellar_token_id INTEGER,
  stellar_tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_wallet) REFERENCES players(wallet_address)
);
```

## 🔐 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Prepared statements
- **Environment Variables** - Sensitive data in .env

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:4000/health

# Submit game (replace with real wallet)
curl -X POST http://localhost:4000/api/game/submit \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "GXXX...XXX",
    "score": 500,
    "game_type": "carbon_dash"
  }'

# Get player stats
curl http://localhost:4000/api/player/GXXX...XXX

# Global stats
curl http://localhost:4000/api/stats/global
```

### With Frontend

1. Start backend: `npm run dev`
2. Start frontend: `cd ../frontend && npm run dev`
3. Open: `http://localhost:3000`
4. Connect wallet and play game

## 🔄 Mock Mode

If Stellar credentials aren't configured, the server runs in **mock mode**:

- ✅ All API endpoints work
- ✅ Database operations complete
- ⚠️ Blockchain calls are simulated
- ⚠️ No real transactions

**To enable real blockchain:**
1. Deploy smart contracts
2. Add contract IDs to `.env`
3. Add admin keypair to `.env`
4. Restart server

## 📁 Project Structure

```
backend/
├── server.js           # Main Express app
├── database.js         # SQLite database setup
├── stellar.js          # Stellar blockchain integration
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .env                # Your configuration (gitignored)
├── data/
│   └── ecostellar.db   # SQLite database file
└── README.md           # This file
```

## 🐛 Troubleshooting

### Database locked error
```bash
# Stop server and reinitialize
npm run init-db
```

### Stellar connection timeout
```bash
# Check RPC URL in .env
STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Verify contract IDs are correct
```

### CORS errors
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Production Deployment

1. **Set environment to production:**
   ```bash
   NODE_ENV=production
   ```

2. **Use mainnet:**
   ```bash
   STELLAR_NETWORK=mainnet
   STELLAR_RPC_URL=https://soroban-mainnet.stellar.org
   ```

3. **Secure admin keys:**
   - Use hardware wallet or KMS
   - Never commit `.env` to git

4. **Enable HTTPS:**
   - Use reverse proxy (nginx)
   - Get SSL certificate (Let's Encrypt)

5. **Database backups:**
   ```bash
   # Backup SQLite database
   cp data/ecostellar.db data/ecostellar.db.backup
   ```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Discord**: EcoStellar Community

---

Built with ❤️ for a sustainable future 🌳
