import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'
import NFTCard from '../../components/NFTCard/NFTCard'
import MintModal from '../../components/MintModal/MintModal'
import { mockNFTs, filterNFTs, sortNFTs, getContinents } from '../../data/treeNFTs'
import styles from './Gallery.module.css'

const Gallery = () => {
  const { walletAddress, isConnected } = useWallet()
  const [nfts, setNfts] = useState(mockNFTs)
  const [displayedNFTs, setDisplayedNFTs] = useState(mockNFTs)
  const [isMintModalOpen, setIsMintModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Player stats (mock - replace with API)
  const [playerTokens, setPlayerTokens] = useState(1250)
  
  // Verification state
  const [verificationsRemaining, setVerificationsRemaining] = useState(15)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showEarningMessage, setShowEarningMessage] = useState(false)
  const [lastEarning, setLastEarning] = useState(0)
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    species: '',
    continent: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })
  const [sortBy, setSortBy] = useState('newest')

  // Apply filters and sorting
  useEffect(() => {
    let filtered = filterNFTs(nfts, filters)
    filtered = sortNFTs(filtered, sortBy)
    setDisplayedNFTs(filtered)
  }, [nfts, filters, sortBy])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      species: '',
      continent: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    })
  }

  const handleMintSuccess = (newNFT, cost) => {
    setNfts(prev => [newNFT, ...prev])
    setPlayerTokens(prev => prev - cost)
  }

  // Handle verification
  const handleVerify = () => {
    if (verificationsRemaining <= 0) return
    
    setIsVerifying(true)
    
    // Simulate verification process
    setTimeout(() => {
      const earning = 0.75
      setVerificationsRemaining(prev => prev - 1)
      setTotalEarnings(prev => prev + earning)
      setLastEarning(earning)
      setIsVerifying(false)
      setShowEarningMessage(true)
      
      // Hide message after 3 seconds
      setTimeout(() => setShowEarningMessage(false), 3000)
    }, 1000)
  }

  const continents = getContinents(nfts)

  return (
    <div className={styles.galleryPage}>
      {/* Verification Queue Section */}
      <div className={styles.verificationSection}>
        <div className="container">
          <motion.div
            className={styles.verificationCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.verificationHeader}>
              <h2 className={styles.verificationTitle}>🎯 VERIFICATION QUEUE</h2>
            </div>
            <div className={styles.verificationContent}>
              <div className={styles.verificationStats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>NGO Records to Verify</span>
                  <span className={styles.statValue}>{verificationsRemaining}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Earn Per Verification</span>
                  <span className={styles.statValue}>$0.75</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Potential Earnings</span>
                  <span className={styles.statValue}>${(verificationsRemaining * 0.75).toFixed(2)}</span>
                </div>
              </div>
              
              <button
                className={`btn btn-primary btn-lg ${styles.verifyButton}`}
                onClick={handleVerify}
                disabled={verificationsRemaining <= 0 || isVerifying}
              >
                {isVerifying ? '⏳ Verifying...' : verificationsRemaining > 0 ? '✓ VERIFY NEXT RECORD' : '✓ All Done!'}
              </button>
              
              {showEarningMessage && (
                <motion.div
                  className={styles.earningMessage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  💰 ${lastEarning.toFixed(2)} deposited to your account!
                </motion.div>
              )}
              
              {totalEarnings > 0 && (
                <div className={styles.totalEarnings}>
                  <strong>Total Earned:</strong> ${totalEarnings.toFixed(2)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <motion.div
            className={styles.headerContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>🌳 My Tree NFT Gallery</h1>
              <p className={styles.subtitle}>
                Your collection of authenticated tree planting certificates on the Stellar blockchain
              </p>
            </div>
            <button 
              className={`btn btn-primary btn-lg ${styles.mintButton}`}
              onClick={() => setIsMintModalOpen(true)}
              disabled={!isConnected}
            >
              <span className={styles.mintIcon}>🌱</span>
              Mint New Tree NFT
            </button>
          </motion.div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={styles.controlsSection}>
        <div className="container">
          <div className={styles.controls}>
            {/* Search */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search by species, location, or ID..."
                className={styles.searchInput}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className={styles.filters}>
              <select 
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="carbonOffset">Highest CO₂ Offset</option>
              </select>

              <select 
                className={styles.filterSelect}
                value={filters.continent}
                onChange={(e) => handleFilterChange('continent', e.target.value)}
              >
                <option value="">All Continents</option>
                {continents.map(continent => (
                  <option key={continent} value={continent}>{continent}</option>
                ))}
              </select>

              <input
                type="date"
                className={styles.filterInput}
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />

              <input
                type="date"
                className={styles.filterInput}
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />

              {(filters.species || filters.continent || filters.dateFrom || filters.dateTo || filters.search) && (
                <button 
                  className={styles.clearButton}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              Showing {displayedNFTs.length} of {nfts.length} NFTs
            </div>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="container">
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}>🌳</div>
            <p>Loading your NFT collection...</p>
          </div>
        ) : displayedNFTs.length > 0 ? (
          <motion.div 
            className={styles.nftGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {displayedNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <NFTCard nft={nft} onClick={() => {}} />
              </motion.div>
            ))}
          </motion.div>
        ) : nfts.length === 0 ? (
          /* Empty State - No NFTs */
          <motion.div 
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.emptyIcon}>🌱</div>
            <h2 className={styles.emptyTitle}>You haven't planted any trees yet!</h2>
            <p className={styles.emptyText}>
              Start your reforestation journey by playing our eco-friendly games and earning ECO tokens.
              Then mint your first Tree NFT certificate!
            </p>
            <div className={styles.emptyActions}>
              <Link to="/game" className="btn btn-primary btn-lg">
                🎮 Play a Game
              </Link>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => setIsMintModalOpen(true)}
                disabled={!isConnected}
              >
                🌱 Mint Your First Tree
              </button>
            </div>
          </motion.div>
        ) : (
          /* No Results from Filter */
          <motion.div 
            className={styles.noResults}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.noResultsIcon}>🔍</div>
            <h3 className={styles.noResultsTitle}>No trees match your filters</h3>
            <p className={styles.noResultsText}>Try adjusting your search criteria</p>
            <button 
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Stats Footer */}
      {nfts.length > 0 && (
        <div className={styles.statsFooter}>
          <div className="container">
            <div className={styles.statsGrid}>
              <motion.div 
                className={styles.statCard}
                whileHover={{ y: -4 }}
              >
                <span className={styles.statIcon}>🌳</span>
                <span className={styles.statValue}>{nfts.length}</span>
                <span className={styles.statLabel}>Total Trees Planted</span>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ y: -4 }}
              >
                <span className={styles.statIcon}>💨</span>
                <span className={styles.statValue}>
                  {nfts.reduce((sum, nft) => sum + nft.carbonOffset, 0).toFixed(2)}
                </span>
                <span className={styles.statLabel}>Tons CO₂ Offset/Year</span>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ y: -4 }}
              >
                <span className={styles.statIcon}>🌍</span>
                <span className={styles.statValue}>{continents.length}</span>
                <span className={styles.statLabel}>Continents</span>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ y: -4 }}
              >
                <span className={styles.statIcon}>🪙</span>
                <span className={styles.statValue}>{playerTokens.toLocaleString()}</span>
                <span className={styles.statLabel}>ECO Tokens</span>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Mint Modal */}
      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        onMintSuccess={handleMintSuccess}
        playerTokens={playerTokens}
      />
    </div>
  )
}

export default Gallery
