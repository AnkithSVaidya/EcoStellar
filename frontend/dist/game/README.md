# 🎮 Carbon Dash - Quick Start Guide

## 🚀 Play the Game NOW

### Option 1: Open in Browser (Easiest)

1. Navigate to the game directory:
   ```bash
   cd /workspaces/EcoStellar/game
   ```

2. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open in browser:
   - **Dev Container**: The port will be forwarded automatically
   - Click the popup notification, or manually open: `http://localhost:8080`

4. **Play!** Click/tap to jump, avoid grey clouds, collect green orbs! 🌱

---

### Option 2: Use VS Code Live Server Extension

1. Install "Live Server" extension (if not already installed)
2. Right-click `index.html`
3. Select **"Open with Live Server"**

---

## 🎯 How to Play

### Controls
- **Click/Tap** anywhere = Jump
- **Spacebar** = Jump (keyboard)

### Objective
- **Avoid** grey pollution clouds ☁️
- **Collect** green energy orbs 💚
- **Survive** as long as possible!

### Scoring
- Each green orb = **+10 points**
- Game speed increases over time
- Final score = ECO token rewards!

### Blockchain Rewards
- **10 points = 1 ECO token** 🪙
- Click "Claim Rewards" to record on Stellar blockchain (coming soon!)

---

## 📊 Game Features

✅ **Endless Runner** - Automatic running, click to jump  
✅ **Parallax Background** - Clouds move at different speeds  
✅ **Progressive Difficulty** - Game speeds up gradually  
✅ **Score Tracking** - Real-time score display  
✅ **Game Over Screen** - Shows final score + ECO token calculation  
✅ **Mobile Responsive** - Works on phone and desktop  
✅ **NO External Assets Needed** - All graphics generated in code!  

---

## 🔗 Next: Blockchain Integration

The "Claim Rewards" button will connect to your deployed smart contracts:

1. **GameRewards Contract**: `CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB`
   - Records game session on-chain
   - Calculates rewards (score ÷ 10 = ECO tokens)

2. **EcoToken Contract**: `CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF`
   - Automatically mints ECO tokens to player

3. **TreeNFT Contract**: `CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL`
   - Mint tree certificate NFTs for special achievements

---

## 🛠️ Troubleshooting

### Game doesn't load?
- Check browser console for errors (F12)
- Ensure internet connection (Phaser loaded from CDN)
- Try refreshing the page

### Graphics look weird?
- The game uses simple programmatic sprites (intentional!)
- See `ASSETS.md` for custom graphics guide

### Can't jump?
- Click/tap ANYWHERE on the game canvas
- Or press SPACEBAR
- Make sure the game has focus (click on it first)

---

## 📱 Mobile Testing

Works great on phones! Just:
1. Deploy to a hosting service (Netlify, Vercel, GitHub Pages)
2. Open the URL on your phone
3. Tap to jump!

Or test locally:
1. Find your computer's local IP: `ifconfig` or `ipconfig`
2. On phone, browse to: `http://YOUR_IP:8080`

---

## 🎨 Customization

Want to make it your own?

- **Change colors**: Edit `game.js` sprite generation functions
- **Add sounds**: Load MP3/WAV files in `BootScene.preload()`
- **Custom sprites**: See `ASSETS.md` for image specifications
- **Adjust difficulty**: Modify `gameSpeed` and spawn timers in `PlayScene.update()`

---

## 🏆 Demo Tips

For your hackathon presentation:

1. **Play live** to show the game mechanics
2. **Score 100+ points** to get 10 ECO tokens
3. **Click "Claim Rewards"** to show blockchain connection point
4. **Show the code** - highlight the clean Phaser structure
5. **Explain the reward formula**: Score ÷ 10 = ECO tokens

---

**Ready to play? Start the server and have fun!** 🎮🌱
