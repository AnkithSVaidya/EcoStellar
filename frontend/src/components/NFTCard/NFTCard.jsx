import { motion } from 'framer-motion'
import styles from './NFTCard.module.css'
import { formatDate, formatCoordinates } from '../../data/treeNFTs'

const NFTCard = ({ nft, onClick }) => {
  return (
    <motion.div
      className={styles.nftCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Holographic shine effect */}
      <div className={styles.holoShine}></div>
      
      {/* Certificate border decoration */}
      <div className={styles.certificateBorder}>
        <div className={styles.cornerDecor} data-corner="top-left"></div>
        <div className={styles.cornerDecor} data-corner="top-right"></div>
        <div className={styles.cornerDecor} data-corner="bottom-left"></div>
        <div className={styles.cornerDecor} data-corner="bottom-right"></div>
      </div>

      {/* NFT Header */}
      <div className={styles.nftHeader}>
        <span className={styles.nftBadge}>🌳 Tree Certificate</span>
        <span className={styles.nftId}>#{nft.id}</span>
      </div>

      {/* Tree Image */}
      <div className={styles.imageContainer}>
        <img 
          src={nft.imageUrl} 
          alt={nft.species}
          className={styles.treeImage}
        />
        <div className={styles.imageOverlay}>
          <span className={styles.continent}>{nft.continent}</span>
        </div>
      </div>

      {/* Certificate Content */}
      <div className={styles.certificateContent}>
        <div className={styles.certificationStamp}>
          <span className={styles.stampText}>CERTIFIED</span>
          <span className={styles.stampIcon}>🌿</span>
        </div>

        <h3 className={styles.speciesName}>{nft.species}</h3>
        <p className={styles.scientificName}>{nft.scientificName}</p>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📍</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Location</span>
              <span className={styles.statValue}>{nft.location}</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statIcon}>📅</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Planted</span>
              <span className={styles.statValue}>{formatDate(nft.plantedDate)}</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statIcon}>🌐</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>GPS</span>
              <span className={styles.statValue}>{formatCoordinates(nft.coordinates)}</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statIcon}>💨</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>CO₂ Offset</span>
              <span className={styles.statValue}>{nft.carbonOffset} tons/year</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statIcon}>📏</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Height</span>
              <span className={styles.statValue}>{nft.height}</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statIcon}>⏳</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Age</span>
              <span className={styles.statValue}>{nft.age}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.nftFooter}>
          <p className={styles.description}>{nft.description}</p>
          <a 
            href={`https://stellar.expert/explorer/testnet/contract/${nft.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-sm ${styles.explorerBtn}`}
            onClick={(e) => e.stopPropagation()}
          >
            View on Stellar Explorer →
          </a>
        </div>
      </div>

      {/* Premium seal */}
      <div className={styles.premiumSeal}>
        <span className={styles.sealText}>NFT</span>
      </div>
    </motion.div>
  )
}

export default NFTCard
