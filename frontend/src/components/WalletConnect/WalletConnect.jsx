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
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  const handleConnect = async () => {
    // Show manual input instead of trying Freighter
    setShowManualInput(true)
  }

  const handleManualConnect = () => {
    if (!manualAddress.trim()) {
      error('Please enter a wallet address')
      return
    }
    
    // Simulate connection with manual address
    localStorage.setItem('walletAddress', manualAddress)
    window.location.reload() // Reload to trigger connection
    success('Wallet connected successfully!')
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
      <>
        <button className={styles.btn} onClick={handleConnect}>
          <span className={styles.icon}>🔗</span>
          Connect Wallet
        </button>
        
        {showManualInput && (
          <div className={styles.manualInputOverlay} onClick={() => setShowManualInput(false)}>
            <div className={styles.manualInputBox} onClick={(e) => e.stopPropagation()}>
              <h3>Enter Wallet Address</h3>
              <input
                type="text"
                placeholder="G... (Stellar address)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className={styles.addressInput}
                autoFocus
              />
              <div className={styles.manualInputActions}>
                <button className="btn btn-primary" onClick={handleManualConnect}>
                  Connect
                </button>
                <button className="btn btn-outline" onClick={() => setShowManualInput(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
