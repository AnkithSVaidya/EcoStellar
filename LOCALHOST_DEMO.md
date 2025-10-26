# 🚀 Run EcoStellar Full App Locally

## Quick Start (2 commands)

```bash
# 1. Install dependencies
cd frontend && npm install

# 2. Start development server
npm run dev
```

**Your app will open at:** `http://localhost:3000`

---

## What You'll See

### ✅ Full React Application with ALL Features:

1. **Landing Page** (`/`)
   - Pay 1 USDC entry fee (simulation)
   - Choose: Wallet OR MoneyGram payment
   - MoneyGram modal with 4-step instructions
   - Manual wallet address input (no Freighter needed)

2. **Game Page** (`/game`)
   - Carbon Dash endless runner
   - Game over shows rank 1-25 (always qualified)
   - Leaderboard with total players
   - "Start Verifying" button → redirects to Gallery

3. **NFT Gallery** (`/gallery`)
   - **Verification Queue:** 15 records to verify
   - Click verify 15 times → earn 0.75 USDC each
   - **Mint Modal:** Choose from 6 NGO locations:
     - Amazon Rainforest, Brazil
     - Borneo Forest, Indonesia
     - Congo Basin, DR Congo
     - Redwood National Park, USA
     - Black Forest, Germany
     - Great Bear Rainforest, Canada
   - **Minted NFTs Grid:** Shows all your tree certificates with:
     - Species, Location, GPS coordinates
     - CO2 offset, NGO partner
     - Certificate ID, Minted date

4. **Impact Page** (`/impact`)
   - **3D Globe Visualization** with react-globe.gl
   - All tree locations marked on Earth
   - **Golden rings** around locations where you minted NFTs
   - Larger markers for minted locations
   - Hover to see location details
   - Auto-rotate globe

---

## Step-by-Step Testing Flow

### Test the Complete User Journey:

```
1. Open http://localhost:3000
   ↓
2. Click "Connect Wallet" → Enter any wallet address (simulation)
   ↓
3. Pay 1 USDC entry fee → Click "Pay with Wallet"
   ↓
4. Click "Start Playing" → Play Carbon Dash game
   ↓
5. Game over → See rank (1-25) → Click "Start Verifying"
   ↓
6. Redirected to /gallery → Click "Verify" 15 times
   ↓
7. Mint modal opens → Select a location → Click "Mint NFT"
   ↓
8. NFT appears in gallery with full details
   ↓
9. Go to /impact → See 3D globe with GOLDEN RING at your minted location!
```

---

## Features Demonstrated

### Stellar Hackathon Requirements:

✅ **Fast Finality** - Instant game rewards (simulated)  
✅ **Low Fees** - $0.01 transaction cost messaging  
✅ **MoneyGram Integration** - Cash-to-crypto on-ramp UI  
✅ **USDC Payments** - All amounts show "USDC" explicitly  
✅ **Smart Contracts** - 3 deployed on Stellar Testnet  
✅ **NFT Minting** - Tree certificates with full metadata  
✅ **Real-world Impact** - Environmental mission

### Tech Stack:

- **Frontend:** React 18 + Vite
- **Routing:** React Router v6
- **Animation:** Framer Motion
- **3D Globe:** react-globe.gl + Three.js
- **State:** React hooks + Context API
- **Styling:** CSS Modules
- **Storage:** LocalStorage (for demo persistence)

---

## Contract Addresses (Already Deployed)

```
EcoToken:    CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF
GameRewards: CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB
TreeNFT:     CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL
```

**View on Stellar Explorer:**
- https://stellar.expert/explorer/testnet/contract/CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF
- https://stellar.expert/explorer/testnet/contract/CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB
- https://stellar.expert/explorer/testnet/contract/CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL

---

## Demo Video Alternative

If you can't share localhost, record a screen video showing:

1. Connect wallet (manual input)
2. Pay entry fee
3. Play game → see rank
4. Verify 15 records → earn USDC
5. Mint NFT at chosen location
6. View minted NFT in gallery
7. See golden ring on globe at minted location

**Tools:**
- OBS Studio (free): https://obsproject.com/
- Loom (easy): https://www.loom.com/
- Screen recording (built-in): Win+G (Windows) or Cmd+Shift+5 (Mac)

---

## GitHub Pages Deployment

**Static demo site:** https://ankithsvaidya.github.io/EcoStellar/

Shows:
- Contract addresses
- Feature descriptions
- Links to Stellar Explorer
- Carbon Dash game embedded

**Note:** The static site shows what the app does, but localhost shows the FULL interactive experience.

---

## Troubleshooting

**Port already in use?**
```bash
# Kill existing Vite server
pkill -f vite
npm run dev
```

**Globe not loading?**
```bash
# Clear browser cache or use Incognito mode
# Globe requires WebGL - use Chrome or Firefox
```

**Minted NFTs not persisting?**
```bash
# Check localStorage in browser DevTools
# Application → Local Storage → http://localhost:3000
# Look for "minted_nfts" key
```

---

## For Submission

**1. Contract Addresses:**
```
CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF
CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB
CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL
```

**2. Demo URL:**
```
https://ankithsvaidya.github.io/EcoStellar/
```

**3. Source Code:**
```
https://github.com/AnkithSVaidya/EcoStellar
```

**4. Local Demo Instructions:**
```
cd frontend && npm install && npm run dev
Open: http://localhost:3000
```

---

**Built with 💚 on Stellar Blockchain**
