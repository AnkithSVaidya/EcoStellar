import { createContext, useContext, useState, useEffect } from 'react'
import * as StellarSdk from '@stellar/stellar-sdk'

const WalletContext = createContext(null)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState(null)
  const [usdcBalance, setUsdcBalance] = useState(null)
  const [network, setNetwork] = useState('testnet')
  const [accountExists, setAccountExists] = useState(false)
  const [error, setError] = useState(null)

  // Stellar server instance
  const getServer = () => {
    return new StellarSdk.Horizon.Server(
      network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    )
  }

  // Check if Freighter is installed
  const isFreighterInstalled = () => {
    return typeof window !== 'undefined' && window.freighter !== undefined
  }

  // Verify Stellar address and fetch balance
  const verifyAndConnectAddress = async (publicKey) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Validate address format
      if (!StellarSdk.StrKey.isValidEd25519PublicKey(publicKey)) {
        throw new Error('Invalid Stellar address format')
      }

      const server = getServer()
      
      try {
        // Try to load account from Stellar network
        const account = await server.loadAccount(publicKey)
        
        // Account exists on Stellar!
        setAccountExists(true)
        
        // Get XLM balance
        const xlmBalance = account.balances.find(b => b.asset_type === 'native')
        setBalance(xlmBalance ? parseFloat(xlmBalance.balance) : 0)
        
        // Get USDC balance (if exists)
        const usdcBal = account.balances.find(b => 
          b.asset_code === 'USDC' || 
          (b.asset_code && b.asset_code.includes('USD'))
        )
        setUsdcBalance(usdcBal ? parseFloat(usdcBal.balance) : 0)
        
        setAddress(publicKey)
        setIsConnected(true)
        localStorage.setItem('walletAddress', publicKey)
        
        return { success: true, exists: true, account }
        
      } catch (accountError) {
        // Account doesn't exist on network yet (unfunded)
        if (accountError.response && accountError.response.status === 404) {
          setAccountExists(false)
          setBalance(0)
          setUsdcBalance(0)
          setAddress(publicKey)
          setIsConnected(true)
          localStorage.setItem('walletAddress', publicKey)
          
          return { 
            success: true, 
            exists: false, 
            message: 'Address valid but unfunded. Fund it at https://laboratory.stellar.org/#account-creator?network=test' 
          }
        }
        throw accountError
      }
      
    } catch (error) {
      console.error('Wallet verification failed:', error)
      setError(error.message)
      setIsConnected(false)
      setAddress(null)
      return { success: false, error: error.message }
    } finally {
      setIsConnecting(false)
    }
  }

  // Connect wallet (Freighter)
  const connectWallet = async () => {
    if (!isFreighterInstalled()) {
      throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/')
    }

    setIsConnecting(true)

    try {
      // Request public key from Freighter
      const publicKey = await window.freighter.getPublicKey()
      
      return await verifyAndConnectAddress(publicKey)
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  // Manual address connection (for testing)
  const connectManualAddress = async (publicKey) => {
    return await verifyAndConnectAddress(publicKey)
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setBalance(null)
    setUsdcBalance(null)
    setAccountExists(false)
    setError(null)
    localStorage.removeItem('walletAddress')
  }

  // Fetch XLM balance (real Stellar call)
  const fetchBalance = async (publicKey) => {
    try {
      const server = getServer()
      const account = await server.loadAccount(publicKey)
      
      // Get XLM balance
      const xlmBalance = account.balances.find(b => b.asset_type === 'native')
      setBalance(xlmBalance ? parseFloat(xlmBalance.balance) : 0)
      
      // Get USDC balance
      const usdcBal = account.balances.find(b => 
        b.asset_code === 'USDC' || 
        (b.asset_code && b.asset_code.includes('USD'))
      )
      setUsdcBalance(usdcBal ? parseFloat(usdcBal.balance) : 0)
      
      setAccountExists(true)
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Account not found (unfunded)
        setAccountExists(false)
        setBalance(0)
        setUsdcBalance(0)
      } else {
        console.error('Failed to fetch balance:', error)
        setError(error.message)
      }
    }
  }

  // Sign transaction
  const signTransaction = async (xdr) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const signedXDR = await window.freighter.signTransaction(
        xdr,
        network === 'testnet' 
          ? StellarSdk.Networks.TESTNET 
          : StellarSdk.Networks.PUBLIC
      )
      
      return signedXDR
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  // Auto-connect on mount if previously connected (with real verification)
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      // Verify the saved address on Stellar network
      verifyAndConnectAddress(savedAddress)
    }
  }, [])

  // Refresh balance every 30 seconds if connected (real Stellar calls)
  useEffect(() => {
    if (isConnected && address && accountExists) {
      const interval = setInterval(() => {
        fetchBalance(address)
      }, 30000) // Every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [isConnected, address, accountExists, network])

  const value = {
    address,
    walletAddress: address,
    isConnected,
    isConnecting,
    balance,
    usdcBalance,
    accountExists,
    error,
    network,
    connectWallet,
    connectManualAddress,
    disconnectWallet,
    fetchBalance,
    refreshBalance: () => fetchBalance(address),
    createTestnetAccount,
    deleteTestnetAccount,
    isFreighterInstalled: typeof window !== 'undefined' && window.freighter !== undefined,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
