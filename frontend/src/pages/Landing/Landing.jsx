import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import styles from './Landing.module.css'

const Landing = () => {
  const { isConnected } = useWallet()
  const [treesPlanted, setTreesPlanted] = useState(0)
  const [co2Offset, setCo2Offset] = useState(0)
  const [activePlayers, setActivePlayers] = useState(0)

  // Animated counter function
  const animateCounter = (target, setter, duration = 2000) => {
    const start = 0
    const increment = target / (duration / 16) // 60 FPS
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setter(target)
        clearInterval(timer)
      } else {
        setter(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }

  // Trigger counter animations on mount
  useEffect(() => {
    const timer1 = animateCounter(1247891, setTreesPlanted, 2500)
    const timer2 = animateCounter(1247, setCo2Offset, 2000)
    const timer3 = animateCounter(10432, setActivePlayers, 2000)

    return () => {
      timer1()
      timer2()
      timer3()
    }
  }, [])

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.heroTitle}>
              Play Games. <span className={styles.highlight}>Plant Trees.</span> Save the Planet.
            </h1>
            <p className={styles.heroSubtitle}>
              EcoStellar combines blockchain gaming with environmental impact.
              Play Carbon Dash, earn ECO tokens, and help plant real trees around the world.
            </p>
            <div className={styles.cta}>
              <Link to="/game" className="btn btn-primary btn-lg">
                🎮 Play Now
              </Link>
              <WalletConnect />
            </div>
            
            {/* Live Stats with Animated Counters */}
            <div className={styles.stats}>
              <motion.div 
                className={styles.stat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className={styles.statNumber}>{formatNumber(treesPlanted)}</span>
                <span className={styles.statLabel}>Total Trees Planted</span>
              </motion.div>
              <motion.div 
                className={styles.stat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <span className={styles.statNumber}>{formatNumber(co2Offset)}</span>
                <span className={styles.statLabel}>Tons CO₂ Offset</span>
              </motion.div>
              <motion.div 
                className={styles.stat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span className={styles.statNumber}>{formatNumber(activePlayers)}</span>
                <span className={styles.statLabel}>Active Players</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.features}>
        <div className="container">
          <motion.h2 
            className="text-center mb-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className={styles.featuresGrid}>
            <motion.div 
              className={`card ${styles.glassCard}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.featureIcon}>🎮</div>
              <h3 className="card-title">Play Eco-Friendly Games</h3>
              <p className="card-body">
                Jump into Carbon Dash, our endless runner game. 
                Avoid pollution, collect energy orbs, and rack up points while learning about sustainability!
              </p>
            </motion.div>
            <motion.div 
              className={`card ${styles.glassCard}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.featureIcon}>🪙</div>
              <h3 className="card-title">Earn EcoTokens</h3>
              <p className="card-body">
                Every 10 points = 1 ECO token automatically minted to your wallet 
                on the Stellar blockchain. Real crypto rewards for playing!
              </p>
            </motion.div>
            <motion.div 
              className={`card ${styles.glassCard}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className={styles.stepNumber}>3</div>
              <div className={styles.featureIcon}>🌳</div>
              <h3 className="card-title">Plant Real Trees</h3>
              <p className="card-body">
                Unlock achievements to mint unique Tree NFT certificates 
                representing real trees planted around the world. Make a real impact!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Game Section */}
      <section className={styles.featured}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-center mb-xl">Featured Game: Carbon Dash</h2>
            <div className={styles.gamePreview}>
              <div className={styles.gameFrame}>
                <div className={styles.gamePreviewOverlay}>
                  <div className={styles.previewContent}>
                    <h3>🎮 Game Preview</h3>
                    <p>Click "Start Playing" to play the full game and earn rewards!</p>
                    <Link to="/game" className="btn btn-primary">
                      Start Playing →
                    </Link>
                  </div>
                </div>
                <iframe 
                  src="/game/index.html" 
                  title="Carbon Dash Preview"
                  className={styles.gameIframe}
                  frameBorder="0"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <div className={styles.gameInfo}>
                <h3>🎮 Carbon Dash</h3>
                <p className={styles.gameDescription}>
                  An endless runner game where you navigate through a polluted city, 
                  collecting energy orbs while avoiding toxic waste and pollution clouds. 
                  The more you play, the more you earn!
                </p>
                <ul className={styles.gameFeatures}>
                  <li>✅ Addictive endless runner gameplay</li>
                  <li>✅ Earn ECO tokens while playing</li>
                  <li>✅ Unlock Tree NFT achievements</li>
                  <li>✅ Compete on global leaderboards</li>
                </ul>
                <Link to="/game" className="btn btn-primary btn-lg">
                  Start Playing →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className={styles.blockchain}>
        <div className="container">
          <motion.div 
            className={styles.blockchainContent}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
              <motion.div 
                className={styles.contractCard}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className={styles.contractIcon}>💎</span>
                <h4>EcoToken</h4>
                <p>Game currency</p>
              </motion.div>
              <motion.div 
                className={styles.contractCard}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className={styles.contractIcon}>🎯</span>
                <h4>GameRewards</h4>
                <p>Automated rewards</p>
              </motion.div>
              <motion.div 
                className={styles.contractCard}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className={styles.contractIcon}>🌳</span>
                <h4>TreeNFT</h4>
                <p>Achievement certificates</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Make an Impact?</h2>
            <p className={styles.ctaText}>
              Join thousands of players earning crypto rewards while helping the planet!
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
            <div className={styles.ctaButtons}>
              <Link to="/game" className="btn btn-primary btn-lg">
                Start Playing Now 🚀
              </Link>
              <Link to="/impact" className="btn btn-outline btn-lg">
                View Our Impact 🌍
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing
