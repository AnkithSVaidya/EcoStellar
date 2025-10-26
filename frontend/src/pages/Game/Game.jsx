import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from '../../contexts/ToastContext'
import Loading from '../../components/Loading/Loading'
import styles from './Game.module.css'

const Game = () => {
  const { address, isConnected, connectWallet, balance, refreshBalance } = useWallet()
  const { success, error: showError, info } = useToast()
  
  // Game state
  const [gameState, setGameState] = useState('playing') // playing, paused, gameover
  const [currentScore, setCurrentScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [lives, setLives] = useState(3)
  
  // Blockchain state
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const [rewardsClaimed, setRewardsClaimed] = useState(false)
  const [tokensEarned, setTokensEarned] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [canMintNFT, setCanMintNFT] = useState(false)
  
  // Leaderboard state
  const [playerRank, setPlayerRank] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(100)
  const [isQualified, setIsQualified] = useState(false)
  
  // Modal state
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  
  // Manual wallet input
  const [manualWallet, setManualWallet] = useState('')
  const [walletSubmitted, setWalletSubmitted] = useState(false)
  
  const iframeRef = useRef(null)

  // Listen for game events from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Security: verify origin if needed
      // if (event.origin !== window.location.origin) return;
      
      const data = event.data
      
      if (data.type === 'SCORE_UPDATE') {
        setCurrentScore(data.score)
      } else if (data.type === 'LIVES_UPDATE') {
        setLives(data.lives)
      } else if (data.type === 'GAME_OVER') {
        setFinalScore(data.score)
        setGameState('gameover')
        setShowGameOverModal(true)
        
        // Calculate tokens (10 points = 1 token)
        const tokens = Math.floor(data.score / 10)
        setTokensEarned(tokens)
        
        // MOCK: Always show qualified (top 25%) - rank between 1-25
        const mockRank = Math.floor(Math.random() * 25) + 1
        setPlayerRank(mockRank)
        setTotalPlayers(100)
        
        // Always qualified for mock testing
        setIsQualified(true)
        
        // Check if eligible for NFT (example: 100+ tokens)
        if (tokens >= 100) {
          setCanMintNFT(true)
        }
      } else if (data.type === 'GAME_PAUSED') {
        setGameState('paused')
      } else if (data.type === 'GAME_RESUMED') {
        setGameState('playing')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Monitor game score from window.CarbonDash (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.CarbonDash && window.CarbonDash.score !== undefined) {
        setCurrentScore(window.CarbonDash.score)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Handle manual wallet submission
  const handleWalletSubmit = () => {
    if (!manualWallet.trim()) {
      showError('Please enter a wallet address')
      return
    }
    setWalletSubmitted(true)
    info('Wallet address saved! You can now play the game.')
  }

  // Get active wallet address (either connected or manually entered)
  const getActiveWallet = () => {
    return isConnected ? address : manualWallet
  }

  // Claim rewards function
  const handleClaimRewards = async () => {
    const activeWallet = getActiveWallet()
    
    if (!activeWallet) {
      showError('Please enter a wallet address')
      return
    }

    setIsClaimingRewards(true)

    try {
      // Simulate API call to backend
      // In production: POST /api/game/submit
      const response = await submitGameScore(finalScore, activeWallet)
      
      if (response.success) {
        setRewardsClaimed(true)
        setShowConfetti(true)
        
        // Show success message
        success(`🎉 Successfully claimed ${tokensEarned} ECO tokens!`)
        
        // Refresh wallet balance if using Freighter
        if (isConnected) {
          await refreshBalance()
        }
        
        // Hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        showError(response.message || 'Failed to claim rewards')
      }
    } catch (err) {
      console.error('Error claiming rewards:', err)
      showError('Failed to claim rewards. Please try again.')
    } finally {
      setIsClaimingRewards(false)
    }
  }

  // Mock API call (replace with actual backend integration)
  const submitGameScore = async (score, walletAddress) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful response
        resolve({
          success: true,
          tokensEarned: Math.floor(score / 10),
          transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
          message: 'Rewards claimed successfully!'
        })
      }, 2000)
    })
  }

  // Play again
  const handlePlayAgain = () => {
    setShowGameOverModal(false)
    setGameState('playing')
    setCurrentScore(0)
    setFinalScore(0)
    setLives(3)
    setRewardsClaimed(false)
    setCanMintNFT(false)
    setPlayerRank(0)
    setIsQualified(false)
    
    // Reload iframe to restart game
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  // Start verification job
  const handleStartVerifying = () => {
    info('Redirecting to verification dashboard...')
    // Navigate to Gallery page where verification queue is
    window.location.href = '/gallery'
  }

  // Mint NFT (placeholder)
  const handleMintNFT = async () => {
    const activeWallet = getActiveWallet()
    
    if (!activeWallet) {
      info('Please enter a wallet address')
      return
    }
    
    info('NFT minting feature coming soon!')
    // TODO: Implement NFT minting logic
  }

  return (
    <div className={styles.gamePage}>
      {/* Game Header */}
      <div className={styles.gameHeader}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.gameInfo}>
              <h1>🎮 Carbon Dash</h1>
              <p className={styles.gameTagline}>Run, Collect, Earn ECO Tokens!</p>
            </div>
            
            {/* Live Stats */}
            <div className={styles.liveStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Score</span>
                <span className={styles.statValue}>{currentScore.toLocaleString()}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Lives</span>
                <span className={styles.statValue}>
                  {'❤️'.repeat(lives)}
                  {'🖤'.repeat(Math.max(0, 3 - lives))}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Tokens</span>
                <span className={styles.statValue}>{Math.floor(currentScore / 10)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className={styles.gameContainer}>
        {!isConnected && !walletSubmitted ? (
          <div className={styles.connectWalletOverlay}>
            <div className={styles.connectWalletCard}>
              <div className={styles.walletIcon}>🔗</div>
              <h2>Enter Your Wallet Address</h2>
              <p>Enter your Stellar wallet address to play Carbon Dash and earn ECO tokens.</p>
              
              <div className={styles.walletInputGroup}>
                <input
                  type="text"
                  className={styles.walletInput}
                  placeholder="G... (Stellar address)"
                  value={manualWallet}
                  onChange={(e) => setManualWallet(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleWalletSubmit()}
                  maxLength={56}
                />
              </div>
              
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleWalletSubmit}
                disabled={!manualWallet.trim()}
              >
                Start Playing 🎮
              </button>
              
              <div className={styles.divider}>
                <span>or</span>
              </div>
              
              <button className="btn btn-outline btn-lg" onClick={connectWallet}>
                Connect Freighter Wallet
              </button>
              
              <p className={styles.installNote}>
                Don't have Freighter? <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer">Install it here</a>
              </p>
            </div>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src="/game/index.html"
              title="Carbon Dash Game"
              className={styles.gameFrame}
              allow="autoplay; fullscreen"
            />
            
            {/* Game State Overlay */}
            {gameState === 'paused' && (
              <div className={styles.pausedOverlay}>
                <h2>⏸️ Game Paused</h2>
              </div>
            )}
          </>
        )}
      </div>

      {/* How to Play & Rewards Info */}
      <div className={styles.gameInfoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={`card ${styles.infoCard}`}>
              <h3>🎯 How to Play</h3>
              <ul>
                <li>Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move</li>
                <li>Collect <strong>⚡ Energy Orbs</strong> for points</li>
                <li>Avoid <strong>☢️ Pollution</strong> and obstacles</li>
                <li>Survive as long as possible!</li>
              </ul>
            </div>
            
            <div className={`card ${styles.infoCard}`}>
              <h3>💰 Reward Structure</h3>
              <ul>
                <li><strong>10 points</strong> = 1 ECO Token</li>
                <li><strong>100 tokens</strong> = Unlock Tree NFT</li>
                <li><strong>1000 tokens</strong> = Premium rewards</li>
                <li>Tokens are blockchain-verified!</li>
              </ul>
            </div>
            
            <div className={`card ${styles.infoCard}`}>
              <h3>📜 Smart Contracts</h3>
              <p className={styles.contractInfo}>
                <strong>EcoToken:</strong><br />
                <code>CCV5YH...FLIQF</code>
              </p>
              <p className={styles.contractInfo}>
                <strong>GameRewards:</strong><br />
                <code>CBYRJU...NHRZB</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOverModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && rewardsClaimed) {
                setShowGameOverModal(false)
              }
            }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Confetti Animation */}
              {showConfetti && (
                <div className={styles.confettiContainer}>
                  <div className={styles.confetti}>🎉</div>
                  <div className={styles.confetti}>🎊</div>
                  <div className={styles.confetti}>✨</div>
                  <div className={styles.confetti}>🌟</div>
                  <div className={styles.confetti}>💫</div>
                  <div className={styles.confetti}>⭐</div>
                </div>
              )}
              
              <div className={styles.modalHeader}>
                <h2>
                  {rewardsClaimed ? '🎉 Rewards Claimed!' : '☠️ Game Over'}
                </h2>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.scoreDisplay}>
                  <span className={styles.scoreLabel}>Final Score</span>
                  <span className={styles.scoreFinal}>{finalScore.toLocaleString()}</span>
                </div>
                
                <div className={styles.tokensDisplay}>
                  <span className={styles.tokensLabel}>You Earned</span>
                  <span className={styles.tokensAmount}>
                    💎 {tokensEarned.toLocaleString()} ECO Tokens
                  </span>
                </div>
                
                {/* Leaderboard Rank */}
                <div className={styles.rankDisplay}>
                  <span className={styles.rankLabel}>Your Rank</span>
                  <span className={styles.rankValue}>
                    #{playerRank} out of {totalPlayers}
                  </span>
                </div>
                
                {/* Qualification Results */}
                {isQualified ? (
                  <div className={styles.qualificationSuccess}>
                    <div className={styles.qualificationIcon}>🎉</div>
                    <h3 className={styles.qualificationTitle}>YOU QUALIFIED!</h3>
                    <p className={styles.qualificationText}>
                      You can verify NGO carbon records
                    </p>
                    <div className={styles.earningInfo}>
                      <strong>Earn 0.75 USDC per verification</strong>
                    </div>
                  </div>
                ) : (
                  <div className={styles.qualificationFailed}>
                    <div className={styles.failedIcon}>😔</div>
                    <h3 className={styles.failedTitle}>You didn't qualify this round</h3>
                    <p className={styles.failedText}>
                      Top 25% get verification rights
                    </p>
                    <p className={styles.encouragementText}>
                      Try again to earn higher rank!
                    </p>
                  </div>
                )}
              </div>
              
              <div className={styles.modalActions}>
                {isQualified ? (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleStartVerifying}
                    >
                      🎯 START VERIFYING
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handlePlayAgain}
                    >
                      🔄 Play Again
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handlePlayAgain}
                    >
                      🔄 PLAY AGAIN
                    </button>
                    <Link to="/impact" className="btn btn-outline">
                      📊 View Stats
                    </Link>
                  </>
                )}
              </div>
              
              {rewardsClaimed && (
                <button
                  className={styles.closeButton}
                  onClick={() => setShowGameOverModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Game
