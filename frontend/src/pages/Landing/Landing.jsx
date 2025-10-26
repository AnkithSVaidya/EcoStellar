import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import styles from './Landing.module.css'

const Landing = () => {
  const { isConnected, address } = useWallet()
  const [treesPlanted, setTreesPlanted] = useState(0)
  const [co2Offset, setCo2Offset] = useState(0)
  const [activePlayers, setActivePlayers] = useState(0)
  const [entryPaid, setEntryPaid] = useState(false)
  const [playersInRound, setPlayersInRound] = useState(47)
  const [isPayingEntry, setIsPayingEntry] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [showMoneyGramModal, setShowMoneyGramModal] = useState(false)

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

  // Check if entry fee was already paid
  useEffect(() => {
    if (address) {
      const paidStatus = localStorage.getItem(`entry_paid_${address}`)
      if (paidStatus === 'true') {
        setEntryPaid(true)
      }
    }
  }, [address])

  // Handle entry fee payment (MOCK - no real deduction)
  const handlePayEntryFee = async () => {
    setIsPayingEntry(true)
    setPaymentError(null)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock success - just confirm wallet address is connected
      if (address) {
        setEntryPaid(true)
        localStorage.setItem(`entry_paid_${address}`, 'true')
        // Update players in round
        setPlayersInRound(prev => prev + 1)
      } else {
        throw new Error('Wallet not connected')
      }
    } catch (error) {
      console.error('Entry fee payment failed:', error)
      setPaymentError(error.message)
    } finally {
      setIsPayingEntry(false)
    }
  }

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
              {/* Entry Fee Section */}
              <div className={styles.entrySection}>
                <div className={styles.entryFeeLabel}>
                  💰 Entry Fee: <strong>1 USDC</strong> per game
                  <span className={styles.stellarBadge}>⭐ Stellar USDC</span>
                </div>
                
                {!isConnected ? (
                  <>
                    <div className={styles.paymentOptions}>
                      <h3 className={styles.paymentTitle}>Choose Payment Method:</h3>
                      
                      <div className={styles.paymentMethod}>
                        <div className={styles.methodHeader}>
                          <span className={styles.methodIcon}>🔗</span>
                          <span className={styles.methodLabel}>Option 1: Freighter Wallet</span>
                        </div>
                        <p className={styles.methodDesc}>If you have crypto</p>
                        <WalletConnect />
                      </div>
                      
                      <div className={styles.dividerOr}>
                        <span>OR</span>
                      </div>
                      
                      <div className={styles.paymentMethod}>
                        <div className={styles.methodHeader}>
                          <span className={styles.methodIcon}>💵</span>
                          <span className={styles.methodLabel}>Option 2: MoneyGram Cash</span>
                        </div>
                        <p className={styles.methodDesc}>Deposit cash, get USDC on Stellar</p>
                        <button 
                          className="btn btn-secondary btn-lg"
                          onClick={() => setShowMoneyGramModal(true)}
                        >
                          💵 Pay with MoneyGram Cash
                        </button>
                      </div>
                    </div>
                  </>
                ) : !entryPaid ? (
                  <>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handlePayEntryFee}
                      disabled={isPayingEntry}
                    >
                      {isPayingEntry ? '⏳ Processing Payment...' : '💳 Pay 1 USDC to Play'}
                    </button>
                    {paymentError && (
                      <div className={styles.errorMessage}>
                        ❌ {paymentError}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/game" className="btn btn-primary btn-lg">
                    🎮 Start Playing
                  </Link>
                )}
                
                {/* Entry Status */}
                <div className={styles.entryStatus}>
                  <div className={styles.playerCount}>
                    👥 Players in round: <strong>{playersInRound}/100</strong>
                  </div>
                  {entryPaid && (
                    <div className={styles.entryConfirmed}>
                      ✅ Your entry confirmed
                    </div>
                  )}
                </div>
              </div>
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

      {/* MoneyGram Modal */}
      {showMoneyGramModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMoneyGramModal(false)}>
          <div className={styles.moneyGramModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowMoneyGramModal(false)}
            >
              ✕
            </button>
            
            <div className={styles.modalHeader}>
              <h2>💵 DEPOSIT CASH VIA MONEYGRAM</h2>
              <p className={styles.modalSubtitle}>Get USDC on Stellar in minutes</p>
              <p className={styles.usdcNote}>
                🌟 Using Stellar's native USDC asset
              </p>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.moneyGramSteps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Find Nearest MoneyGram Location</h3>
                    <a 
                      href="https://www.moneygram.com/mgo/us/en/locations" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      📍 Show Map / Location Finder
                    </a>
                  </div>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Say: "Deposit to Stellar"</h3>
                    <p>Provide your wallet address:</p>
                    <div className={styles.walletAddressBox}>
                      <code>{address || 'Connect wallet first to see address'}</code>
                      {address && (
                        <button 
                          className={styles.copyBtn}
                          onClick={() => {
                            navigator.clipboard.writeText(address)
                            alert('Address copied!')
                          }}
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Deposit $2 Cash</h3>
                    <p>MoneyGram converts to <strong>USDC on Stellar</strong> automatically</p>
                    <p>⚡ Arrives in 2-5 minutes</p>
                    <p className={styles.assetInfo}>
                      <small>Asset: USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN</small>
                    </p>
                  </div>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepContent}>
                    <h3>Return Here and Play!</h3>
                    <p>Your USDC will be ready in your Stellar wallet</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.moneyGramFooter}>
                <div className={styles.poweredBy}>
                  <span>Powered by</span>
                  <strong>Stellar + MoneyGram</strong>
                </div>
                <a 
                  href="https://stellar.org/learn/anchor-basics" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.learnMore}
                >
                  📚 Learn More About Stellar Anchors
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
