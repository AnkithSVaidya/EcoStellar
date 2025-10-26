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
    usdcBalance,
    accountExists,
    error: walletError,
    connectWallet,
    connectManualAddress,
    disconnectWallet,
    refreshBalance,
    isFreighterInstalled,
    createTestnetAccount,
    deleteTestnetAccount,
  } = useWallet()
  
  const { success, error } = useToast()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [verifying, setVerifying] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccountInfo, setNewAccountInfo] = useState(null);

  const handleConnect = async () => {
    // Show manual input instead of trying Freighter
    setShowManualInput(true)
  }

    const handleManualConnect = async () => {
    if (!manualAddress.trim()) {
      showToast('Please enter a Stellar address', 'error');
      return;
    }

    setVerifying(true);
    try {
      const result = await connectManualAddress(manualAddress.trim());
      
      if (result.success) {
        if (result.exists) {
          showToast(`Connected successfully! Balance: ${result.balance} XLM`, 'success');
        } else {
          showToast('Address is valid but unfunded. Fund it to use full features.', 'warning');
        }
        setShowManualInput(false);
        setManualAddress('');
      } else {
        showToast(result.error || 'Failed to connect', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to verify address', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateTestnetAccount = async () => {
    setCreatingAccount(true);
    setNewAccountInfo(null);
    
    try {
      showToast('Creating new testnet account...', 'info');
      const result = await createTestnetAccount();
      
      if (result.success) {
        setNewAccountInfo({
          publicKey: result.publicKey,
          secretKey: result.secretKey,
          balance: result.balance
        });
        showToast(`Account created with ${result.balance} XLM!`, 'success');
      } else {
        showToast(result.error || 'Failed to create account', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to create testnet account', 'error');
    } finally {
      setCreatingAccount(false);
    }
  };

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
        
        <button 
          className={styles.createBtn} 
          onClick={handleCreateTestnetAccount}
          disabled={creatingAccount}
          style={{marginLeft: '10px'}}
        >
          <span className={styles.icon}>{creatingAccount ? '⏳' : '🆕'}</span>
          {creatingAccount ? 'Creating...' : 'Create Testnet Account'}
        </button>
        
        {showManualInput && (
          <div className={styles.manualInputOverlay} onClick={() => setShowManualInput(false)}>
            <div className={styles.manualInputBox} onClick={(e) => e.stopPropagation()}>
              <h3>🌟 Connect Stellar Wallet</h3>
              <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '20px'}}>
                Enter your Stellar testnet address to verify on blockchain
              </p>
              <input
                type="text"
                placeholder="G... (Stellar public key)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className={styles.addressInput}
                autoFocus
              />
              {walletError && (
                <p className={styles.errorMessage}>❌ {walletError}</p>
              )}
              <div className={styles.manualInputActions}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleManualConnect}
                  disabled={verifying}
                >
                  {verifying ? 'Verifying on Stellar...' : 'Verify & Connect'}
                </button>
                <button className="btn btn-outline" onClick={() => setShowManualInput(false)}>
                  Cancel
                </button>
              </div>
              <p style={{color: '#666', fontSize: '0.85rem', marginTop: '15px'}}>
                Don't have a testnet account?{' '}
                <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" style={{color: '#00C853'}}>
                  Create one here
                </a>
              </p>
            </div>
          </div>
        )}
        
        {newAccountInfo && (
          <div className={styles.manualInputOverlay} onClick={() => setNewAccountInfo(null)}>
            <div className={styles.manualInputBox} onClick={(e) => e.stopPropagation()}>
              <h3>✅ Testnet Account Created!</h3>
              <p style={{color: '#00C853', marginBottom: '20px'}}>
                Your account has been funded with {newAccountInfo.balance} XLM on Stellar testnet
              </p>
              
              <div style={{marginBottom: '15px', textAlign: 'left'}}>
                <strong>Public Key (Share this):</strong>
                <div style={{
                  background: '#1a1a1a',
                  padding: '10px',
                  borderRadius: '8px',
                  wordBreak: 'break-all',
                  marginTop: '5px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>
                  {newAccountInfo.publicKey}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(newAccountInfo.publicKey);
                    success('Public key copied!');
                  }}
                  style={{marginTop: '5px', padding: '5px 10px', fontSize: '0.85rem'}}
                  className="btn btn-outline"
                >
                  📋 Copy Public Key
                </button>
              </div>
              
              <div style={{marginBottom: '20px', textAlign: 'left'}}>
                <strong style={{color: '#ff4444'}}>Secret Key (Keep this PRIVATE!):</strong>
                <div style={{
                  background: '#2a1a1a',
                  border: '2px solid #ff4444',
                  padding: '10px',
                  borderRadius: '8px',
                  wordBreak: 'break-all',
                  marginTop: '5px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>
                  {newAccountInfo.secretKey}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(newAccountInfo.secretKey);
                    success('Secret key copied! Keep it safe!');
                  }}
                  style={{marginTop: '5px', padding: '5px 10px', fontSize: '0.85rem'}}
                  className="btn btn-outline"
                >
                  🔐 Copy Secret Key
                </button>
              </div>
              
              <p style={{color: '#ff9800', fontSize: '0.85rem', marginBottom: '15px'}}>
                ⚠️ Save these keys now! The secret key is stored in your browser, but you should save it securely.
              </p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => setNewAccountInfo(null)}
                style={{width: '100%'}}
              >
                Got it!
              </button>
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
          <div className={styles.balances}>
            <span className={styles.balance}>
              {balance !== null ? `${balance.toFixed(2)} XLM` : 'Loading...'}
            </span>
            {usdcBalance !== null && usdcBalance > 0 && (
              <span className={styles.usdcBalance}>
                {usdcBalance.toFixed(2)} USDC
              </span>
            )}
          </div>
          <span className={styles.address}>
            {shortenAddress(address)}
            {accountExists && <span className={styles.verified}>✓</span>}
          </span>
        </div>
        <span className={styles.chevron}>▼</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <strong>Stellar Account</strong>
            {accountExists ? (
              <span className={styles.statusBadge} style={{color: '#00C853'}}>✓ Verified</span>
            ) : (
              <span className={styles.statusBadge} style={{color: '#FFA500'}}>⚠ Unfunded</span>
            )}
          </div>
          <div className={styles.balanceInfo}>
            <div>XLM: <strong>{balance?.toFixed(4) || '0.0000'}</strong></div>
            {usdcBalance !== null && (
              <div>USDC: <strong>{usdcBalance?.toFixed(4) || '0.0000'}</strong></div>
            )}
          </div>
          <div className={styles.dropdownDivider}></div>
          <div className={styles.dropdownItem} onClick={copyAddress}>
            <span className={styles.icon}>📋</span>
            Copy Address
          </div>
          <div className={styles.dropdownItem} onClick={() => refreshBalance()}>
            <span className={styles.icon}>🔄</span>
            Refresh Balance
          </div>
          <div className={styles.dropdownItem}>
            <span className={styles.icon}>🌐</span>
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Stellar Explorer
            </a>
          </div>
          {!accountExists && (
            <div className={styles.dropdownItem}>
              <span className={styles.icon}>💰</span>
              <a 
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fund Account (Testnet)
              </a>
            </div>
          )}
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
