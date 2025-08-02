'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

interface WalletContextType {
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<Uint8Array | null>
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  // 监听钱包连接状态变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.solana) {
      const handleConnect = () => {
        if (window.solana?.publicKey) {
          setPublicKey(new PublicKey(window.solana.publicKey.toString()))
          setConnected(true)
        }
      }

      const handleDisconnect = () => {
        setPublicKey(null)
        setConnected(false)
      }

      const handleAccountChanged = (publicKey: any) => {
        if (publicKey) {
          setPublicKey(new PublicKey(publicKey.toString()))
        } else {
          setPublicKey(null)
        }
      }

      if (window.solana) {
        window.solana.on('connect', handleConnect)
        window.solana.on('disconnect', handleDisconnect)
        window.solana.on('accountChanged', handleAccountChanged)

        return () => {
          if (window.solana) {
            window.solana.removeListener('connect', handleConnect)
            window.solana.removeListener('disconnect', handleDisconnect)
            window.solana.removeListener('accountChanged', handleAccountChanged)
          }
        }
      }
    }
  }, [])

  // 连接钱包并自动签名
  const connect = async () => {
    if (typeof window === 'undefined' || !window.solana) {
      alert('Please install Phantom wallet')
      window.open('https://phantom.app/', '_blank')
      return
    }

    try {
      setConnecting(true)
      
      // 步骤1: 请求连接钱包
      console.log('🔗 发起钱包连接请求...')
      const response = await window.solana.connect()
      
      if (response.publicKey) {
        const walletAddress = new PublicKey(response.publicKey.toString())
        setPublicKey(walletAddress)
        setConnected(true)
        
        console.log('✅ 钱包连接成功:', walletAddress.toString())
        
        // 步骤2: 连接成功后自动进行签名
        await handleAutoSign(walletAddress)
      }
    } catch (error: any) {
      console.error('❌ 钱包连接失败:', error)
      if (error.code === 4001) {
        alert('User rejected wallet connection request')
      } else {
        alert('Error connecting wallet')
      }
    } finally {
      setConnecting(false)
    }
  }

  // 自动签名处理
  const handleAutoSign = async (walletAddress: PublicKey) => {
    if (!window.solana) {
      return
    }

    try {
      console.log('✍️ 发起签名请求...')
      const message = `NoStrategy - 连接时间: ${new Date().toLocaleString()}`
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
      
      // 步骤3: 签名成功，连接完成
      console.log('✅ 钱包连接并签名完成:', {
        address: walletAddress.toString(),
        signature: Buffer.from(signedMessage.signature).toString('hex'),
        message: message
      })
      
    } catch (error: any) {
      console.error('❌ 签名失败:', error)
      // 签名失败不影响连接状态，只在控制台记录
      if (error.code === 4001) {
        console.log('User rejected signature request')
      }
    }
  }

  // 断开连接
  const disconnect = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        await window.solana.disconnect()
        setPublicKey(null)
        setConnected(false)
      } catch (error: any) {
        console.error('Error disconnecting wallet:', error)
      }
    }
  }

  // 签名消息
  const signMessage = async (message: string): Promise<Uint8Array | null> => {
    if (!connected || !window.solana) {
      alert('Please connect wallet first')
      return null
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
      return signedMessage.signature
    } catch (error: any) {
      console.error('Error signing message:', error)
      if (error.code === 4001) {
        alert('User rejected signature request')
      } else {
        alert('Error signing message')
      }
      return null
    }
  }

  // 签名交易
  const signTransaction = async (transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction | null> => {
    if (!connected || !window.solana) {
      alert('Please connect wallet first')
      return null
    }

    try {
      const signedTransaction = await window.solana.signTransaction(transaction)
      return signedTransaction
    } catch (error: any) {
      console.error('Error signing transaction:', error)
      if (error.code === 4001) {
        alert('User rejected transaction signature request')
      } else {
        alert('Error signing transaction')
      }
      return null
    }
  }

  const value: WalletContextType = {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    signMessage,
    signTransaction
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// 扩展Window接口
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      isConnected: boolean
      publicKey: { toString(): string }
      connect: () => Promise<{ publicKey: { toString(): string } }>
      disconnect: () => Promise<void>
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
      signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
} 