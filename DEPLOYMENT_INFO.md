# 🚀 EcoStellar Deployment Information

## ✅ DEPLOYED CONTRACT ADDRESSES (Stellar Testnet)

### 1. EcoToken Contract
**Address:** `CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF`

📊 **View on Stellar Expert:**  
https://stellar.expert/explorer/testnet/contract/CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF

**Functions:**
- `initialize()` - Set up token with name, symbol, decimals
- `mint(to, amount)` - Mint tokens to player
- `balance(address)` - Check balance
- `transfer(from, to, amount)` - Transfer tokens

---

### 2. GameRewards Contract  
**Address:** `CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB`

📊 **View on Stellar Expert:**  
https://stellar.expert/explorer/testnet/contract/CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB

**Functions:**
- `record_game_session(player, score, duration)` - Record game results
- `get_player_stats(player)` - Get player statistics
- `claim_rewards(player)` - Claim accumulated rewards

---

### 3. TreeNFT Contract
**Address:** `CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL`

📊 **View on Stellar Expert:**  
https://stellar.expert/explorer/testnet/contract/CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL

**Functions:**
- `mint(to, metadata)` - Mint tree NFT certificate
- `owner_of(token_id)` - Check NFT owner
- `token_metadata(token_id)` - Get NFT details

---

## 🌐 DEMO SITE URL

### GitHub Pages (Auto-deployed)
**URL:** https://ankithsvaidya.github.io/EcoStellar/

**Status:** ✅ Deploying now via GitHub Actions

**Deployment Method:** 
- Push to `main` branch triggers automatic build & deploy
- Static site hosted on GitHub Pages
- Free, fast, global CDN

---

### Alternative: Local Development
```bash
# Frontend
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000

# Backend API
cd backend
npm install
node server.js
# Runs at http://localhost:4000
```

---

## 📋 Quick Test Checklist

### On Demo Site:
1. ✅ **Landing Page** - Pay entry fee (1 USDC simulation)
2. ✅ **Play Game** - Carbon Dash endless runner
3. ✅ **View Results** - See leaderboard rank (always top 25%)
4. ✅ **Verify Records** - Click verify 15 times (earn 0.75 USDC each)
5. ✅ **Mint NFT** - Choose location, mint tree certificate
6. ✅ **View Impact** - See minted trees on 3D globe with gold rings
7. ✅ **Gallery** - Browse all NFT certificates

### Wallet Connection:
- Uses **manual input** (simulation mode)
- No Freighter extension required
- Enter any wallet address to test

---

## 🔧 Technical Stack

**Frontend:**
- React 18 + Vite
- Framer Motion animations
- react-globe.gl (3D Earth visualization)
- React Router v6

**Smart Contracts:**
- Rust + Soroban SDK
- Deployed to Stellar Testnet
- Production-ready code

**Blockchain:**
- Stellar Network (Testnet)
- USDC payments (simulated)
- Fast finality (~3-5 seconds)
- Low fees (~$0.01 per transaction)

---

## 📱 MoneyGram Integration

✅ Cash-to-crypto on-ramp UI implemented
✅ Shows 4-step process (Find Location → Bring Cash → Provide Address → Receive USDC)
✅ Links to MoneyGram location finder
✅ Displays Stellar USDC asset: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`

---

## 🎯 Stellar Hackathon Features Demonstrated

1. ✅ **Fast Finality** - Instant game rewards
2. ✅ **Low Fees** - Minimal transaction costs
3. ✅ **MoneyGram Anchor** - Cash on-ramp integration
4. ✅ **USDC Payments** - Stablecoin throughout
5. ✅ **Smart Contracts** - 3 deployed Soroban contracts
6. ✅ **NFTs** - Tree certificates on-chain
7. ✅ **Real-world Impact** - Environmental mission

---

## 📞 Support

**Repository:** https://github.com/AnkithSVaidya/EcoStellar  
**Issues:** https://github.com/AnkithSVaidya/EcoStellar/issues

---

**Last Updated:** October 26, 2025  
**Status:** ✅ Production Deployed
