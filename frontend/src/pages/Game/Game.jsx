import { useState, useEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from '../../contexts/ToastContext'
import styles from './Game.module.css'

const Game = () => {
  const { isConnected, address } = useWallet()
  const { info, success, error } = useToast()
  const [gameScore, setGameScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Monitor global game state
    const checkGameState = setInterval(() => {
      if (window.CarbonDash) {
        setGameScore(window.CarbonDash.currentScore)
        setIsPlaying(window.CarbonDash.isPlaying)
      }
    }, 100)

    return () => clearInterval(checkGameState)
  }, [])

  const handleClaimRewards = async () => {
    if (!isConnected) {
      error('Please connect your wallet first')
      return
    }

    const finalScore = window.CarbonDash?.lastScore || gameScore
    const ecoTokens = Math.floor(finalScore / 10)

    info(`Claiming ${ecoTokens} ECO tokens...`)

    // TODO: Integrate with GameRewards smart contract
    setTimeout(() => {
      success(`Successfully claimed ${ecoTokens} ECO tokens!`)
    }, 2000)
  }

  return (
    <div className={styles.gamePage}>
      <div className="container">
        {/* Game Header */}
        <div className={styles.gameHeader}>
          <div>
            <h1>🎮 Carbon Dash</h1>
            <p>Avoid pollution, collect energy, earn crypto!</p>
          </div>
          {isConnected && (
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreLabel}>Current Score:</span>
              <span className={styles.scoreValue}>{gameScore}</span>
            </div>
          )}
        </div>

        {/* Wallet Check */}
        {!isConnected && (
          <div className={styles.walletWarning}>
            <h3>⚠️ Wallet Not Connected</h3>
            <p>
              Connect your Freighter wallet to earn ECO token rewards!
              You can still play without connecting, but rewards won't be saved.
            </p>
          </div>
        )}

        {/* Game Container */}
        <div className={styles.gameContainer}>
          <iframe
            src="/game/index.html"
            title="Carbon Dash Game"
            className={styles.gameFrame}
            allow="accelerometer; gyroscope"
          />
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <h3>How to Play</h3>
          <div className={styles.instructionsGrid}>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>🖱️</span>
              <p><strong>Click/Tap</strong> to jump</p>
            </div>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>☁️</span>
              <p><strong>Avoid</strong> grey pollution clouds</p>
            </div>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>💚</span>
              <p><strong>Collect</strong> green energy orbs (+10 pts)</p>
            </div>
            <div className={styles.instruction}>
              <span className={styles.instructionIcon}>🪙</span>
              <p><strong>Earn</strong> 1 ECO per 10 points</p>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className={styles.rewardsInfo}>
          <h3>🎁 Reward Structure</h3>
          <div className={styles.rewardsGrid}>
            <div className="card">
              <h4>ECO Tokens</h4>
              <p className="text-primary" style={{ fontSize: '2rem', margin: '1rem 0' }}>
                10 pts = 1 ECO
              </p>
              <p>Automatically minted to your wallet on Stellar blockchain</p>
            </div>
            <div className="card">
              <h4>Tree NFT Certificates</h4>
              <p className="text-primary" style={{ fontSize: '2rem', margin: '1rem 0' }}>
                High Scores
              </p>
              <p>Unlock special achievements to mint unique Tree NFTs</p>
            </div>
            <div className="card">
              <h4>Leaderboard</h4>
              <p className="text-primary" style={{ fontSize: '2rem', margin: '1rem 0' }}>
                Coming Soon
              </p>
              <p>Compete with players worldwide for bonus rewards</p>
            </div>
          </div>
        </div>

        {/* Smart Contract Info */}
        <div className={styles.contractInfo}>
          <h4>🔗 Smart Contract Integration</h4>
          <p>
            This game uses the <strong>GameRewards</strong> Soroban smart contract 
            to automatically distribute ECO tokens based on your score.
          </p>
          <div className={styles.contractAddress}>
            <span>Contract:</span>
            <code>CBYRJUBZVX7ND2MV7QJA6D6BXHQO6BNXFOVXTXZMCLDINMPHF2TNHRZB</code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
