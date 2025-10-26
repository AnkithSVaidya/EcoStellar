import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from '../../contexts/ToastContext'
import styles from './WalletConnect.module.css'

const WalletConnect = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    connectWallet, 
    disconnectWallet,
    isFreighterInstalled 
  } = useWallet()
  
  const { success, error } = useToast()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleConnect = async () => {
    if (!isFreighterInstalled()) {
      error('Please install Freighter wallet extension from freighter.app')
      // Don't auto-open the page, just show the error
      return
    }

    try {
      await connectWallet()
      success('Wallet connected successfully!')
    } catch (err) {
      error(err.message || 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowDropdown(false)
    success('Wallet disconnected')
  }

  const shortenAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    success('Address copied to clipboard!')
  }

  if (isConnecting) {
    return (
      <button className={`${styles.btn} ${styles.connecting}`} disabled>
        <span className={styles.spinner}></span>
        Connecting...
      </button>
    )
  }

  if (!isConnected) {
    return (
      <button className={styles.btn} onClick={handleConnect}>
        <span className={styles.icon}>🔗</span>
        Connect Wallet
      </button>
    )
  }

  return (
    <div className={styles.walletConnected}>
      <button 
        className={styles.walletBtn}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className={styles.walletInfo}>
          <span className={styles.balance}>
            {balance !== null ? `${balance.toFixed(2)} XLM` : 'Loading...'}
          </span>
          <span className={styles.address}>{shortenAddress(address)}</span>
        </div>
        <span className={styles.chevron}>▼</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem} onClick={copyAddress}>
            <span className={styles.icon}>📋</span>
            Copy Address
          </div>
          <div className={styles.dropdownItem}>
            <span className={styles.icon}>🌐</span>
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer
            </a>
          </div>
          <div className={styles.dropdownDivider}></div>
          <div 
            className={`${styles.dropdownItem} ${styles.disconnect}`}
            onClick={handleDisconnect}
          >
            <span className={styles.icon}>🔌</span>
            Disconnect
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletConnect
