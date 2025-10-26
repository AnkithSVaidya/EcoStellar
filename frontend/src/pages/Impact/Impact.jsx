import styles from './Impact.module.css'

const Impact = () => {
  return (
    <div className={styles.impactPage}>
      <div className="container">
        <h1>📊 Environmental Impact Dashboard</h1>
        <p className={styles.subtitle}>
          Track the real-world impact of the EcoStellar community
        </p>

        {/* Global Stats */}
        <div className={styles.statsGrid}>
          <div className="card">
            <h3>🌳 Trees Planted</h3>
            <p className={styles.statValue}>1,247</p>
            <p className={styles.statChange}>+32 this week</p>
          </div>
          <div className="card">
            <h3>🪙 ECO Tokens Earned</h3>
            <p className={styles.statValue}>52,340</p>
            <p className={styles.statChange}>+1,205 this week</p>
          </div>
          <div className="card">
            <h3>🎮 Games Played</h3>
            <p className={styles.statValue}>10,842</p>
            <p className={styles.statChange}>+543 this week</p>
          </div>
          <div className="card">
            <h3>👥 Active Players</h3>
            <p className={styles.statValue}>2,156</p>
            <p className={styles.statChange}>+89 this week</p>
          </div>
        </div>

        {/* Carbon Impact */}
        <div className={`card ${styles.carbonCard}`}>
          <h2>🌍 Carbon Impact</h2>
          <div className={styles.carbonStats}>
            <div className={styles.carbonStat}>
              <span className={styles.carbonValue}>6.2</span>
              <span className={styles.carbonLabel}>Tons CO₂ Offset</span>
            </div>
            <div className={styles.carbonStat}>
              <span className={styles.carbonValue}>≈</span>
              <span className={styles.carbonLabel}>Equivalent to</span>
            </div>
            <div className={styles.carbonStat}>
              <span className={styles.carbonValue}>27,000</span>
              <span className={styles.carbonLabel}>Miles not driven</span>
            </div>
          </div>
        </div>

        {/* Tree Locations */}
        <div className="card">
          <h2>🗺️ Tree Planting Locations</h2>
          <p className="text-center text-muted">
            Interactive map coming soon!
          </p>
          <div className={styles.mapPlaceholder}>
            <p>🌍</p>
            <p>Trees planted across 15 countries</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2>📝 Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>🌳</span>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>
                  <strong>Player#1234</strong> planted an Oak tree in California
                </p>
                <p className={styles.activityTime}>2 hours ago</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>🪙</span>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>
                  <strong>Player#5678</strong> earned 50 ECO tokens
                </p>
                <p className={styles.activityTime}>4 hours ago</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>🌳</span>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>
                  <strong>Player#9012</strong> minted a Tree NFT certificate
                </p>
                <p className={styles.activityTime}>6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Impact
