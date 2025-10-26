# 🌱 EcoStellar Frontend

A modern React application built with Vite for the EcoStellar blockchain gaming platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Freighter wallet browser extension

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.module.css
│   │   ├── WalletConnect/
│   │   │   ├── WalletConnect.jsx
│   │   │   └── WalletConnect.module.css
│   │   ├── Toast/
│   │   │   ├── Toast.jsx
│   │   │   └── Toast.module.css
│   │   └── Loading/
│   │       ├── Loading.jsx
│   │       └── Loading.module.css
│   │
│   ├── pages/               # Page components
│   │   ├── Landing/
│   │   │   ├── Landing.jsx
│   │   │   └── Landing.module.css
│   │   ├── Game/
│   │   │   ├── Game.jsx
│   │   │   └── Game.module.css
│   │   ├── Impact/
│   │   │   ├── Impact.jsx
│   │   │   └── Impact.module.css
│   │   └── Gallery/
│   │       ├── Gallery.jsx
│   │       └── Gallery.module.css
│   │
│   ├── contexts/            # React Context providers
│   │   ├── WalletContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── styles/              # Global styles
│   │   └── global.css
│   │
│   ├── App.jsx              # Main app component
│   ├── App.css
│   └── main.jsx             # Entry point
│
├── public/                  # Static assets
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Pages

### 1. Landing (`/`)
- Hero section with CTA buttons
- Feature showcase (Play, Earn, NFTs)
- Blockchain technology explanation
- Global statistics

### 2. Game (`/game`)
- Embedded Carbon Dash Phaser game
- Real-time score tracking
- Wallet connection requirement
- Reward structure information
- Smart contract details

### 3. Impact Dashboard (`/impact`)
- Global environmental statistics
- Trees planted counter
- ECO tokens earned
- Carbon offset calculations
- Recent activity feed
- Interactive map (coming soon)

### 4. NFT Gallery (`/gallery`)
- Grid view of all Tree NFTs
- Detailed NFT modal view
- GPS coordinates display
- Soulbound certificate information
- Blockchain explorer links

## 🔧 Key Components

### Navbar
- Responsive navigation menu
- Wallet connect button
- Active route highlighting
- Mobile hamburger menu

### WalletConnect
- Freighter wallet integration
- Balance display
- Address shortening
- Copy address functionality
- Disconnect option
- Blockchain explorer links

### Toast Notifications
- Success, error, warning, info types
- Auto-dismiss after 3 seconds
- Stacked notifications
- Custom messages

### Loading Spinner
- Full-screen and inline modes
- Customizable message
- Smooth animations

### Footer
- Brand information
- Quick links
- Social media links
- Smart contract addresses
- Resource links

## 🌐 Context Providers

### WalletContext
Manages wallet state across the app:
- `address` - User's Stellar address
- `isConnected` - Connection status
- `balance` - XLM balance
- `connectWallet()` - Connect Freighter
- `disconnectWallet()` - Disconnect wallet
- `signTransaction()` - Sign blockchain transactions

**Usage:**
```jsx
import { useWallet } from '@contexts/WalletContext'

function MyComponent() {
  const { address, isConnected, connectWallet } = useWallet()
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect</button>
      )}
    </div>
  )
}
```

### ToastContext
Manages toast notifications:
- `success(message)` - Green success toast
- `error(message)` - Red error toast
- `warning(message)` - Yellow warning toast
- `info(message)` - Blue info toast

**Usage:**
```jsx
import { useToast } from '@contexts/ToastContext'

function MyComponent() {
  const { success, error } = useToast()
  
  const handleAction = async () => {
    try {
      await someAsyncAction()
      success('Action completed!')
    } catch (err) {
      error(err.message)
    }
  }
}
```

## 🎨 Styling

### Theme Colors
```css
--color-primary: #00C853        /* Bright green */
--color-primary-dark: #2E7D32   /* Dark green */
--color-primary-light: #81C784  /* Light green */

--color-bg-primary: #121212     /* Dark background */
--color-bg-secondary: #1E1E1E   /* Card background */
--color-bg-tertiary: #2A2A2A    /* Hover states */
```

### CSS Modules
Each component has its own scoped CSS module to prevent style conflicts:

```jsx
import styles from './MyComponent.module.css'

<div className={styles.container}>...</div>
```

### Global Utility Classes
Defined in `styles/global.css`:

```jsx
<div className="container">      {/* Max-width container */}
<button className="btn btn-primary btn-lg">  {/* Button styles */}
<div className="card">           {/* Card container */}
```

## 🔗 Blockchain Integration

### Smart Contracts
The frontend connects to 3 Soroban smart contracts on Stellar testnet:

1. **EcoToken** (`CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF`)
   - In-game currency
   - Mintable rewards

2. **GameRewards** (`CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB`)
   - Automated reward distribution
   - Score tracking

3. **TreeNFT** (`CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL`)
   - Soulbound NFT certificates
   - GPS coordinate storage

### Wallet Integration
Uses Freighter browser extension for:
- Wallet connection
- Transaction signing
- Balance queries
- Network switching (testnet/mainnet)

## 📱 Responsive Design

### Breakpoints
- Desktop: > 768px
- Mobile: ≤ 768px

### Mobile Features
- Hamburger menu
- Touch-optimized buttons
- Stacked layouts
- Reduced font sizes
- Full-width cards

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel deploy
```

### Netlify
```bash
npm run build
# Drag 'dist' folder to Netlify drop zone
```

### GitHub Pages
```bash
npm run build
# Deploy 'dist' folder to gh-pages branch
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:

```env
VITE_STELLAR_NETWORK=testnet
VITE_ECOTOKEN_CONTRACT=CCV5YHHNQ6AM77Z4GRBRGKDDCFVMOT3K4XKFMJ53E6ERRDFKIV5FLIQF
VITE_GAMEREWARDS_CONTRACT=CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB
VITE_TREENFT_CONTRACT=CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL
```

### Vite Config
Path aliases already configured in `vite.config.js`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@contexts': '/src/contexts',
      '@styles': '/src/styles',
    },
  },
})
```

## 📦 Dependencies

### Core
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.20.0

### Blockchain
- `@stellar/stellar-sdk` ^11.2.0

### Build Tools
- `vite` ^5.0.8
- `@vitejs/plugin-react` ^4.2.1

## 🎯 Features Implemented

✅ React 18 with Vite  
✅ React Router v6 navigation  
✅ CSS Modules for scoped styling  
✅ Dark mode with green theme  
✅ Responsive mobile design  
✅ Freighter wallet integration  
✅ Context API state management  
✅ Toast notification system  
✅ Loading spinners  
✅ 4 complete pages  
✅ Reusable components  
✅ Stellar SDK integration  

## 🔜 Future Enhancements

- [ ] Connect to actual smart contracts
- [ ] Real-time blockchain data fetching
- [ ] Transaction signing & submission
- [ ] Leaderboard functionality
- [ ] Interactive tree map
- [ ] User profiles
- [ ] Achievement system
- [ ] Social sharing

## 🐛 Troubleshooting

### Freighter Not Detected
1. Install Freighter extension
2. Refresh the page
3. Check browser console for errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styling Issues
- CSS modules must end with `.module.css`
- Check import paths
- Verify CSS custom properties in `global.css`

## 📄 License

MIT License - Built for EcoStellar hackathon demonstration

---

**Built with 💚 for the planet** 🌍
