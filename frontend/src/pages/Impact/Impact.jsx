import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Globe from 'react-globe.gl'
import { useWallet } from '../../contexts/WalletContext'
import { treeLocations, getTotalTrees, getTotalCountries, recentActivity, getTimeAgo } from '../../data/treeLocations'
import LocationPopup from '../../components/LocationPopup/LocationPopup'
import styles from './Impact.module.css'

const Impact = () => {
  const { walletAddress } = useWallet()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const globeEl = useRef()

  // Mock player stats (replace with actual blockchain data)
  const [playerStats] = useState({
    treesPlanted: 47,
    co2Offset: 0.235, // tons per year
    level: 5,
    rank: 'Sapling',
    ecoTokens: 1250,
    nftsClaimed: 3
  })

  // Calculate global stats
  const totalTrees = getTotalTrees()
  const totalCountries = getTotalCountries()
  const globalCo2 = (totalTrees * 0.005).toFixed(0) // ~5kg per tree per year

  // Initialize globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.5
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0)
    }
  }, [])

  // Transform location data for globe markers
  const markerData = treeLocations.map(loc => ({
    ...loc,
    size: Math.log(loc.trees) * 0.8,
    color: loc.biomeColor
  }))

  const handleMarkerClick = (location) => {
    setSelectedLocation(location)
    // Zoom to location
    if (globeEl.current) {
      globeEl.current.pointOfView({
        lat: location.lat,
        lng: location.lng,
        altitude: 1.5
      }, 2000)
    }
  }

  const handleClosePopup = () => {
    setSelectedLocation(null)
    // Reset view
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'tree_planted': return '🌳'
      case 'nft_minted': return '🎨'
      case 'milestone': return '🏆'
      default: return '✨'
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'tree_planted':
        return `planted ${activity.trees} tree${activity.trees > 1 ? 's' : ''} in ${activity.location}`
      case 'nft_minted':
        return `minted a Tree NFT certificate for ${activity.location}`
      case 'milestone':
        return `reached ${activity.trees} trees milestone in ${activity.location}`
      default:
        return 'made an impact'
    }
  }

  return (
    <div className={styles.impactPage}>
      <div className={styles.globeSection}>
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={markerData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.02}
          pointRadius="size"
          pointLabel={d => `<div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; border: 1px solid ${d.color};"><strong style="color: ${d.color}; font-size: 14px;">${d.name}</strong><br/><span style="color: #ccc; font-size: 12px;">${d.country}</span><br/><span style="color: #fff; font-size: 13px; margin-top: 4px; display: block;">🌳 ${d.trees.toLocaleString()} trees planted</span><span style="color: ${d.color}; font-size: 11px; margin-top: 4px; display: block;">${d.biome}</span></div>`}
          onPointClick={handleMarkerClick}
          atmosphereColor="rgba(0, 200, 83, 0.3)"
          atmosphereAltitude={0.15}
          width={window.innerWidth}
          height={window.innerHeight}
        />

        <div className={styles.globeOverlay}>
          <motion.h1
            className={styles.globeTitle}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            🌍 Global Impact Dashboard
          </motion.h1>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <motion.div className={`card ${styles.statsCard}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="card-title">Your Personal Impact</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🌳</span>
                <span className={styles.statValue}>{playerStats.treesPlanted}</span>
                <span className={styles.statLabel}>Trees Planted</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>💨</span>
                <span className={styles.statValue}>{playerStats.co2Offset}</span>
                <span className={styles.statLabel}>Tons CO₂/year</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>⭐</span>
                <span className={styles.statValue}>Level {playerStats.level}</span>
                <span className={styles.statLabel}>{playerStats.rank}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🪙</span>
                <span className={styles.statValue}>{playerStats.ecoTokens}</span>
                <span className={styles.statLabel}>ECO Tokens</span>
              </div>
            </div>
            <div className={styles.progressSection}>
              <p className={styles.progressLabel}>Progress to next level</p>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(playerStats.treesPlanted / 100) * 100}%` }} /></div>
            </div>
          </motion.div>

          <motion.div className={`card ${styles.statsCard}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="card-title">Global Impact</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}><span className={styles.statIcon}>🌲</span><span className={styles.statValue}>{totalTrees.toLocaleString()}</span><span className={styles.statLabel}>Total Trees</span></div>
              <div className={styles.statItem}><span className={styles.statIcon}>🌍</span><span className={styles.statValue}>{totalCountries}</span><span className={styles.statLabel}>Countries</span></div>
              <div className={styles.statItem}><span className={styles.statIcon}>💨</span><span className={styles.statValue}>{globalCo2}</span><span className={styles.statLabel}>Tons CO₂/year</span></div>
              <div className={styles.statItem}><span className={styles.statIcon}>🎯</span><span className={styles.statValue}>{treeLocations.length}</span><span className={styles.statLabel}>Active Projects</span></div>
            </div>
          </motion.div>

          <motion.div className={`card ${styles.timelineCard}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <h3 className="card-title">Recent Activity</h3>
            <div className={styles.timeline}>
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className={styles.timelineItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <span className={styles.activityIcon}>{getActivityIcon(activity.type)}</span>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>You {getActivityText(activity)}</p>
                    <span className={styles.activityTime}>{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {selectedLocation && (
        <LocationPopup location={selectedLocation} onClose={handleClosePopup} />
      )}
    </div>
  )
}

export default Impact
