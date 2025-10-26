import { motion, AnimatePresence } from 'framer-motion'
import styles from './LocationPopup.module.css'

const LocationPopup = ({ location, onClose }) => {
  if (!location) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.popupOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.popup}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>

          {/* Location Image */}
          <div className={styles.imageContainer}>
            <img 
              src={location.imageUrl} 
              alt={location.name}
              className={styles.locationImage}
            />
            <div className={styles.biomeTag} style={{ backgroundColor: location.biomeColor }}>
              {location.biome}
            </div>
          </div>

          {/* Location Info */}
          <div className={styles.content}>
            <h2 className={styles.locationName}>{location.name}</h2>
            <p className={styles.country}>📍 {location.country}</p>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{location.trees.toLocaleString()}</span>
                <span className={styles.statLabel}>Trees Planted</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{Math.floor(location.trees * 0.005)}</span>
                <span className={styles.statLabel}>Tons CO₂ Offset</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Partner Organization</h3>
              <p className={styles.partner}>🤝 {location.partner}</p>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Project Description</h3>
              <p className={styles.description}>{location.description}</p>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Project Started</h3>
              <p className={styles.date}>📅 {new Date(location.dateStarted).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={onClose}>
              Learn More About This Project
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LocationPopup
