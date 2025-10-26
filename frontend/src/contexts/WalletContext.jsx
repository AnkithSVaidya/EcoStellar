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
  const [network, setNetwork] = useState('testnet')

  // Check if Freighter is installed
  const isFreighterInstalled = () => {
    return typeof window !== 'undefined' && window.freighter !== undefined
  }

  // Connect wallet
  const connectWallet = async () => {
    if (!isFreighterInstalled()) {
      throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/')
    }

    setIsConnecting(true)

    try {
      // Request public key from Freighter
      const publicKey = await window.freighter.getPublicKey()
      
      setAddress(publicKey)
      setIsConnected(true)
      
      // Fetch balance
      await fetchBalance(publicKey)
      
      // Store in localStorage
      localStorage.setItem('walletAddress', publicKey)
      
      return publicKey
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setBalance(null)
    localStorage.removeItem('walletAddress')
  }

  // Fetch XLM balance
  const fetchBalance = async (publicKey) => {
    try {
      const server = new StellarSdk.Horizon.Server(
        network === 'testnet' 
          ? 'https://horizon-testnet.stellar.org'
          : 'https://horizon.stellar.org'
      )
      
      const account = await server.loadAccount(publicKey)
      const xlmBalance = account.balances.find(b => b.asset_type === 'native')
      
      setBalance(xlmBalance ? parseFloat(xlmBalance.balance) : 0)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance(0)
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

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      // Just set the address from localStorage (simulation mode)
      setAddress(savedAddress)
      setIsConnected(true)
      setBalance(100.50) // Mock balance
    }
  }, [])

  // Refresh balance every 30 seconds if connected
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        fetchBalance(address)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isConnected, address, network])

  const value = {
    address,
    isConnected,
    isConnecting,
    balance,
    network,
    isFreighterInstalled,
    connectWallet,
    disconnectWallet,
    signTransaction,
    refreshBalance: () => address && fetchBalance(address),
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
