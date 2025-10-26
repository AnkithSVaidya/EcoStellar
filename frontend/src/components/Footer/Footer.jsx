import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        {/* Brand */}
        <div className={styles.footerSection}>
          <div className={styles.brand}>
            <span className={styles.logo}>🌱</span>
            <h3>EcoStellar</h3>
          </div>
          <p className={styles.description}>
            Play games, earn crypto rewards, and make a positive impact on the planet.
          </p>
          <div className={styles.social}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              🐦
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              💬
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              💻
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul className={styles.links}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/game">Play Game</Link></li>
            <li><Link to="/impact">Impact Dashboard</Link></li>
            <li><Link to="/gallery">NFT Gallery</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className={styles.footerSection}>
          <h4>Resources</h4>
          <ul className={styles.links}>
            <li>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
                Stellar Network
              </a>
            </li>
            <li>
              <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer">
                Freighter Wallet
              </a>
            </li>
            <li>
              <a href="https://soroban.stellar.org/docs" target="_blank" rel="noopener noreferrer">
                Soroban Docs
              </a>
            </li>
            <li>
              <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer">
                Block Explorer
              </a>
            </li>
          </ul>
        </div>

        {/* Smart Contracts */}
        <div className={styles.footerSection}>
          <h4>Smart Contracts</h4>
          <ul className={styles.contracts}>
            <li>
              <span className={styles.contractLabel}>EcoToken:</span>
              <code className={styles.contractAddress}>CCV5YH...FLIQF</code>
            </li>
            <li>
              <span className={styles.contractLabel}>GameRewards:</span>
              <code className={styles.contractAddress}>CBYRJU...NHRZB</code>
            </li>
            <li>
              <span className={styles.contractLabel}>TreeNFT:</span>
              <code className={styles.contractAddress}>CB5IMO...PLAZL</code>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
            © {currentYear} EcoStellar. Built on Stellar Blockchain. 
        </p>
      </div>
    </footer>
  )
}

export default Footer
