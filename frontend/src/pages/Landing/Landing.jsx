import { Link } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import styles from './Landing.module.css'

const Landing = () => {
  const { isConnected } = useWallet()

  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Play, Earn, and Save the Planet
            </h1>
          <p className={styles.heroSubtitle}>
              EcoStellar combines blockchain gaming with environmental impact.
              Play Carbon Dash, earn ECO tokens, and plant real trees.
          </p>
            <div className={styles.cta}>
              <Link to="/game" className="btn btn-primary btn-lg">
                🎮 Play Now
              </Link>
              <Link to="/impact" className="btn btn-outline btn-lg">
                📊 View Impact
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10,000+</span>
                <span className={styles.statLabel}>Games Played</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50K</span>
                <span className={styles.statLabel}>ECO Tokens Earned</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Trees Planted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <h2 className="text-center mb-xl">How It Works</h2>
          <div className={styles.featuresGrid}>
            <div className="card">
              <div className={styles.featureIcon}>🎮</div>
              <h3 className="card-title">Play Games</h3>
              <p className="card-body">
                Jump into Carbon Dash, our endless runner game. 
                Avoid pollution, collect energy orbs, and rack up points!
              </p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>🪙</div>
              <h3 className="card-title">Earn ECO Tokens</h3>
              <p className="card-body">
                Every 10 points = 1 ECO token automatically minted to your wallet 
                on the Stellar blockchain.
              </p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>🌳</div>
              <h3 className="card-title">Get Tree NFTs</h3>
              <p className="card-body">
                Unlock achievements to mint unique Tree NFT certificates 
                representing real trees planted around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className={styles.blockchain}>
        <div className="container">
          <div className={styles.blockchainContent}>
            <div className={styles.blockchainText}>
              <h2>Built on Stellar Blockchain</h2>
              <p>
                EcoStellar leverages Stellar's fast, low-cost smart contracts (Soroban) 
                to provide instant rewards with minimal fees.
              </p>
              <ul className={styles.blockchainFeatures}>
                <li>⚡ Instant transactions (3-5 seconds)</li>
                <li>💰 Near-zero fees (~$0.01 per transaction)</li>
                <li>🔒 Secure and decentralized</li>
                <li>🌐 Fully transparent on-chain</li>
              </ul>
              <a 
                href="https://stellar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Learn About Stellar →
              </a>
            </div>
            <div className={styles.blockchainVisual}>
              <div className={styles.contractCard}>
                <span className={styles.contractIcon}>💎</span>
                <h4>EcoToken</h4>
                <p>Game currency</p>
              </div>
              <div className={styles.contractCard}>
                <span className={styles.contractIcon}>🎯</span>
                <h4>GameRewards</h4>
                <p>Automated rewards</p>
              </div>
              <div className={styles.contractCard}>
                <span className={styles.contractIcon}>🌳</span>
                <h4>TreeNFT</h4>
                <p>Achievement certificates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container text-center">
          <h2>Ready to Make an Impact?</h2>
          <p className={styles.ctaText}>
            Connect your wallet and start earning crypto rewards today!
          </p>
          {!isConnected && (
            <p className={styles.walletPrompt}>
              You'll need a Freighter wallet to play.{' '}
              <a 
                href="https://www.freighter.app/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Get Freighter →
              </a>
            </p>
          )}
          <Link to="/game" className="btn btn-primary btn-lg">
            Start Playing Now 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing
