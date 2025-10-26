import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from '../../contexts/ToastContext'
import { availableSpecies, mintLocations } from '../../data/treeNFTs'
import styles from './MintModal.module.css'

const MintModal = ({ isOpen, onClose, onMintSuccess, playerTokens }) => {
  const { walletAddress } = useWallet()
  const { showToast } = useToast()
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [mintingProgress, setMintingProgress] = useState(0)

  const selectedSpeciesData = availableSpecies.find(s => s.id === selectedSpecies)
  const canMint = selectedSpecies && selectedLocation && playerTokens >= (selectedSpeciesData?.cost || 0)

  const fireConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#00FF88', '#00C853', '#4CAF50', '#8BC34A', '#CDDC39']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#00FF88', '#00C853', '#4CAF50', '#8BC34A', '#CDDC39']
      })
    }, 250)
  }

  const handleMint = async () => {
    if (!canMint) return

    setIsMinting(true)
    setMintingProgress(0)

    try {
      // Simulate blockchain transaction progress
      const progressSteps = [
        { progress: 20, message: 'Preparing transaction...' },
        { progress: 40, message: 'Connecting to Stellar network...' },
        { progress: 60, message: 'Minting NFT on blockchain...' },
        { progress: 80, message: 'Uploading metadata...' },
        { progress: 100, message: 'Finalizing...' }
      ]

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setMintingProgress(step.progress)
        showToast(step.message, 'info')
      }

      // Mock API call
      // const response = await fetch('/api/tree/mint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     wallet: walletAddress,
      //     species: selectedSpeciesData.id,
      //     location: selectedLocation
      //   })
      // })

      // Simulate successful mint
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create mock NFT
      const newNFT = {
        id: `NFT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tokenId: Math.floor(Math.random() * 10000),
        species: selectedSpeciesData.name,
        scientificName: selectedSpeciesData.scientificName,
        location: mintLocations.find(l => l.id === selectedLocation)?.name,
        continent: mintLocations.find(l => l.id === selectedLocation)?.continent,
        coordinates: mintLocations.find(l => l.id === selectedLocation)?.coords,
        plantedDate: new Date().toISOString().split('T')[0],
        mintedDate: new Date().toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600',
        description: `Newly planted ${selectedSpeciesData.name} contributing to global reforestation`,
        carbonOffset: selectedSpeciesData.carbonOffset,
        height: '0.5m',
        age: 'Newly planted'
      }

      // Fire confetti!
      fireConfetti()

      showToast('🎉 Tree NFT minted successfully!', 'success')
      
      // Call success callback
      onMintSuccess(newNFT, selectedSpeciesData.cost)

      // Close modal after delay
      setTimeout(() => {
        handleClose()
      }, 1500)

    } catch (error) {
      console.error('Minting error:', error)
      showToast('❌ Failed to mint NFT. Please try again.', 'error')
      setIsMinting(false)
      setMintingProgress(0)
    }
  }

  const handleClose = () => {
    if (!isMinting) {
      setSelectedSpecies('')
      setSelectedLocation('')
      setMintingProgress(0)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>🌳 Mint Tree NFT Certificate</h2>
            <button 
              className={styles.closeButton} 
              onClick={handleClose}
              disabled={isMinting}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className={styles.modalContent}>
            {!isMinting ? (
              <>
                {/* Token Balance */}
                <div className={styles.tokenBalance}>
                  <span className={styles.balanceLabel}>Your ECO Tokens:</span>
                  <span className={styles.balanceValue}>🪙 {playerTokens.toLocaleString()}</span>
                </div>

                {/* Species Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Tree Species</label>
                  <select 
                    className={styles.select}
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                  >
                    <option value="">Choose a species...</option>
                    {availableSpecies.map(species => (
                      <option key={species.id} value={species.id}>
                        {species.name} - {species.cost} ECO
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Planting Location</label>
                  <select 
                    className={styles.select}
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Choose a location...</option>
                    {mintLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.continent})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Species Details */}
                {selectedSpeciesData && (
                  <motion.div 
                    className={styles.speciesDetails}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className={styles.detailsTitle}>Tree Details</h4>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Scientific Name:</span>
                        <span className={styles.detailValue}>{selectedSpeciesData.scientificName}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Minting Cost:</span>
                        <span className={styles.detailValue}>{selectedSpeciesData.cost} ECO Tokens</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>CO₂ Offset:</span>
                        <span className={styles.detailValue}>{selectedSpeciesData.carbonOffset} tons/year</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Insufficient Balance Warning */}
                {selectedSpeciesData && playerTokens < selectedSpeciesData.cost && (
                  <div className={styles.warning}>
                    ⚠️ Insufficient ECO tokens. You need {selectedSpeciesData.cost - playerTokens} more tokens.
                  </div>
                )}

                {/* Mint Button */}
                <button 
                  className={`btn btn-primary btn-lg ${styles.mintButton}`}
                  onClick={handleMint}
                  disabled={!canMint}
                >
                  {canMint ? '🌱 Mint Tree NFT' : 'Select Species & Location'}
                </button>
              </>
            ) : (
              /* Minting Progress */
              <div className={styles.mintingProgress}>
                <div className={styles.progressIcon}>
                  <div className={styles.spinner}>🌳</div>
                </div>
                <h3 className={styles.progressTitle}>Minting Your Tree NFT...</h3>
                <p className={styles.progressText}>Please wait while we plant your tree on the blockchain</p>
                
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill}
                    style={{ width: `${mintingProgress}%` }}
                  ></div>
                </div>
                <span className={styles.progressPercent}>{mintingProgress}%</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MintModal
