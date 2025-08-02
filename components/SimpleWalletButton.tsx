'use client'

import React from 'react'
import { useWallet } from './SimpleWalletProvider'

const SimpleWalletButton: React.FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      connect()
    }
  }



  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        {/* Wallet Address Display */}
        <div className="text-right">
          <div className="text-white font-semibold">
            {formatAddress(publicKey.toString())}
          </div>
        </div>
        

        
        {/* Disconnect Button */}
        <button
          onClick={handleClick}
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>🔌</span>
          <span>Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="wallet-button bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {connecting ? (
        <>
          <span className="animate-spin">🔄</span>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span>🔗</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  )
}

export default SimpleWalletButton 