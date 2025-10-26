# 🎮 Carbon Dash - Blockchain Integration Guide

## 🌟 Overview

Carbon Dash is now ready to connect to your Stellar smart contracts! This guide explains how to integrate the game with your deployed blockchain infrastructure.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Carbon Dash   │  🎮 Phaser.js Game
│  (Frontend Web) │
└────────┬────────┘
         │
         │ JavaScript SDK
         ▼
┌─────────────────┐
│  Stellar SDK    │  📦 stellar-sdk.js
│   (Browser)     │
└────────┬────────┘
         │
         │ RPC Calls
         ▼
┌─────────────────────────────────────┐
│     Stellar Testnet Blockchain      │
├─────────────────────────────────────┤
│  1. GameRewards Contract            │
│     - record_game_session()         │
│     - Calculates rewards            │
│     - Calls EcoToken.mint()         │
│                                     │
│  2. EcoToken Contract               │
│     - Mints ECO tokens to player    │
│                                     │
│  3. TreeNFT Contract                │
│     - Mint tree certificates        │
│     - For high scores/achievements  │
└─────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before integrating:

1. ✅ **Deployed Smart Contracts** (You have these!)
   - EcoToken: `CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF`
   - GameRewards: `CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB`
   - TreeNFT: `CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL`

2. 📦 **Stellar SDK** - Add to `index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@11.2.0/dist/stellar-sdk.min.js"></script>
   ```

3. 🔑 **Player Wallet** - Users need Freighter or Albedo browser wallet

---

## 🔧 Integration Steps

### Step 1: Add Stellar SDK to HTML

Update `game/index.html`:

```html
<head>
    ...
    <!-- Stellar SDK for blockchain integration -->
    <script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@11.2.0/dist/stellar-sdk.min.js"></script>
    
    <!-- Phaser 3 CDN -->
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
```

### Step 2: Create Blockchain Service

Create `game/js/blockchain.js`:

```javascript
/**
 * Blockchain Service - Stellar/Soroban Integration
 */

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';

// Your deployed contract addresses
const CONTRACTS = {
    gameRewards: 'CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB',
    ecoToken: 'CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF',
    treeNFT: 'CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL'
};

class BlockchainService {
    constructor() {
        this.server = new StellarSdk.SorobanRpc.Server(RPC_URL);
        this.playerAddress = null;
    }

    /**
     * Connect player's wallet (Freighter extension)
     */
    async connectWallet() {
        if (!window.freighter) {
            throw new Error('Please install Freighter wallet extension');
        }

        const { address } = await window.freighter.getPublicKey();
        this.playerAddress = address;
        
        console.log('✅ Wallet connected:', address);
        return address;
    }

    /**
     * Submit game score and claim ECO token rewards
     */
    async claimRewards(score) {
        if (!this.playerAddress) {
            await this.connectWallet();
        }

        console.log('🎮 Claiming rewards for score:', score);

        try {
            // Build contract call to GameRewards.record_game_session()
            const contract = new StellarSdk.Contract(CONTRACTS.gameRewards);
            
            const transaction = new StellarSdk.TransactionBuilder(
                await this.server.getAccount(this.playerAddress),
                {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: NETWORK_PASSPHRASE
                }
            )
            .addOperation(
                contract.call(
                    'record_game_session',
                    StellarSdk.Address(this.playerAddress).toScVal(),
                    StellarSdk.nativeToScVal(score, { type: 'u64' })
                )
            )
            .setTimeout(30)
            .build();

            // Sign with Freighter
            const signedTx = await window.freighter.signTransaction(
                transaction.toXDR(),
                NETWORK_PASSPHRASE
            );

            // Submit to blockchain
            const txResponse = await this.server.sendTransaction(
                StellarSdk.TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE)
            );

            console.log('✅ Transaction submitted:', txResponse.hash);

            // Wait for confirmation
            const result = await this.pollTransactionStatus(txResponse.hash);
            
            const rewardTokens = Math.floor(score / 10);
            console.log(`🎉 Success! You earned ${rewardTokens} ECO tokens!`);
            
            return {
                success: true,
                txHash: txResponse.hash,
                rewardTokens
            };

        } catch (error) {
            console.error('❌ Claim failed:', error);
            throw error;
        }
    }

    /**
     * Mint Tree NFT certificate (for special achievements)
     */
    async mintTreeNFT(species, latitude, longitude, imageUrl) {
        if (!this.playerAddress) {
            await this.connectWallet();
        }

        const contract = new StellarSdk.Contract(CONTRACTS.treeNFT);
        
        const transaction = new StellarSdk.TransactionBuilder(
            await this.server.getAccount(this.playerAddress),
            {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: NETWORK_PASSPHRASE
            }
        )
        .addOperation(
            contract.call(
                'mint_tree_nft',
                StellarSdk.Address(this.playerAddress).toScVal(),
                StellarSdk.nativeToScVal(species, { type: 'string' }),
                StellarSdk.nativeToScVal(latitude, { type: 'i32' }),
                StellarSdk.nativeToScVal(longitude, { type: 'i32' }),
                StellarSdk.nativeToScVal(Date.now() / 1000, { type: 'u64' }),
                StellarSdk.nativeToScVal(imageUrl, { type: 'string' })
            )
        )
        .setTimeout(30)
        .build();

        const signedTx = await window.freighter.signTransaction(
            transaction.toXDR(),
            NETWORK_PASSPHRASE
        );

        const txResponse = await this.server.sendTransaction(
            StellarSdk.TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE)
        );

        await this.pollTransactionStatus(txResponse.hash);
        
        console.log('🌳 Tree NFT minted!');
        return txResponse.hash;
    }

    /**
     * Poll transaction status until confirmed
     */
    async pollTransactionStatus(hash, maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            const status = await this.server.getTransaction(hash);
            
            if (status.status === 'SUCCESS') {
                return status;
            }
            
            if (status.status === 'FAILED') {
                throw new Error('Transaction failed');
            }
            
            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error('Transaction timeout');
    }
}

// Global instance
const blockchain = new BlockchainService();
```

### Step 3: Update Game Over Scene

Modify `game/js/game.js` - replace the "Claim Rewards" button handler:

```javascript
claimButton.on('pointerdown', async () => {
    claimText.setText('Processing...');
    claimButton.disableInteractive();
    
    try {
        // Connect to blockchain and claim rewards
        const result = await blockchain.claimRewards(this.finalScore);
        
        // Show success message
        claimText.setText('✅ Claimed!');
        claimButton.setFillStyle(0x00DD66);
        
        alert(`🎉 Success!\n\nTransaction Hash: ${result.txHash}\n\nYou earned ${result.rewardTokens} ECO tokens!`);
        
    } catch (error) {
        console.error('Claim error:', error);
        claimText.setText('Claim Rewards');
        claimButton.setInteractive({ useHandCursor: true });
        
        alert(`❌ Error: ${error.message}\n\nMake sure Freighter wallet is installed and connected.`);
    }
});
```

### Step 4: Update index.html

Add the blockchain service script:

```html
<!-- Game Logic -->
<script src="js/blockchain.js"></script>
<script src="js/game.js"></script>
```

---

## 🎯 User Flow

1. **Player plays Carbon Dash** 🎮
2. **Gets a score** (e.g., 150 points)
3. **Clicks "Claim Rewards"** 💰
4. **Freighter wallet popup appears** 🔑
5. **Player approves transaction** ✅
6. **GameRewards contract executes**:
   - Records session: `record_game_session(player, 150)`
   - Calculates rewards: `150 ÷ 10 = 15 ECO tokens`
   - Calls `EcoToken.mint(player, 15 * 10^7)`
7. **Player receives 15 ECO tokens!** 🪙
8. **Transaction appears on blockchain** 🌐

---

## 🧪 Testing the Integration

### 1. Install Freighter Wallet

- Chrome/Brave: [Chrome Web Store](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)
- Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/freighter/)

### 2. Fund Your Testnet Account

```bash
# Get your Freighter address
# Then fund it on testnet:
curl "https://friendbot.stellar.org?addr=YOUR_FREIGHTER_ADDRESS"
```

### 3. Test the Flow

1. Open `http://localhost:8080`
2. Play the game, score 100+ points
3. Click "Claim Rewards"
4. Approve in Freighter
5. Check Stellar Expert to see your transaction!

---

## 🔍 Verification

After claiming rewards, verify on Stellar Expert:

- **GameRewards transactions**: https://stellar.expert/explorer/testnet/contract/CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB
- **Your wallet**: https://stellar.expert/explorer/testnet/account/YOUR_ADDRESS

You should see:
- `record_game_session` invocation
- `mint` event from EcoToken
- ECO token balance increase

---

## 🚀 Deployment

### Deploy to Vercel (Free)

1. Push to GitHub
2. Import to Vercel
3. Deploy!

```bash
# Add to git
git add game/
git commit -m "Add Carbon Dash game"
git push

# Or deploy directly:
npx vercel deploy game/
```

### Deploy to GitHub Pages

```bash
# Enable GitHub Pages in repo settings
# Select branch: main
# Folder: /game

# Your game will be live at:
# https://YOUR_USERNAME.github.io/EcoStellar/
```

---

## 🎨 Customization Ideas

### Add More Blockchain Features

1. **Leaderboard**: Store high scores on-chain
2. **Achievements**: Mint special NFTs for milestones
3. **Daily Challenges**: Time-locked rewards
4. **Player Profiles**: On-chain stats tracking

### Enhance Game Mechanics

1. **Power-ups**: Collect items for temporary abilities
2. **Boss Levels**: Special challenges every 500 points
3. **Multiplayer**: Compete with other players in real-time
4. **Seasons**: Limited-time events with bonus rewards

---

## 📊 Analytics

Track on-chain analytics:

```javascript
// In GameOverScene
async function trackScore(score) {
    // This data is publicly queryable on Stellar!
    const session = await blockchain.getGameSession(playerAddress);
    
    console.log('Total games:', session.games_played);
    console.log('Total score:', session.total_score);
    console.log('Total earned:', session.total_rewards);
}
```

---

## 🛡️ Security Best Practices

1. **Never store private keys** in frontend code
2. **Always use wallet extensions** (Freighter, Albedo)
3. **Validate inputs** before sending to blockchain
4. **Set transaction timeouts** to prevent hanging
5. **Handle errors gracefully** - show user-friendly messages

---

## 🎯 Next Steps

1. ✅ Test locally with Freighter wallet
2. ✅ Verify transactions on Stellar Expert
3. ✅ Deploy to production hosting
4. ✅ Add social sharing ("I earned 50 ECO tokens!")
5. ✅ Create tutorial for new players
6. ✅ Submit to hackathon! 🏆

---

**Your game is now blockchain-powered!** 🎮⛓️

Players earn REAL cryptocurrency rewards for playing! 🌱💰
