import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import WalletConnect from '../WalletConnect/WalletConnect'
import styles from './Navbar.module.css'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isConnected } = useWallet()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/game', label: 'Play Game' },
    { path: '/impact', label: 'Impact' },
    { path: '/gallery', label: 'NFT Gallery' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌱</span>
          <span className={styles.logoText}>EcoStellar</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={styles.navLinks}>
          {navLinks.map(link => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                className={`${styles.navLink} ${isActive(link.path) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Wallet Connect */}
        <div className={styles.walletSection}>
          <WalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavLinks}>
            {navLinks.map(link => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`${styles.mobileNavLink} ${isActive(link.path) ? styles.active : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileWallet}>
            <WalletConnect />
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
