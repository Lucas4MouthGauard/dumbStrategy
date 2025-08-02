'use client'

import React from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'

const Header = () => {
  const { connected } = useWallet()

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-yellow-500/30 sticky top-0 z-50 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 via-transparent to-orange-900/20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce-slow">🚀</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                DumbStrategy
              </h1>
              <p className="text-xs text-gray-700">Meme Site Mocking MicroStrategy</p>
            </div>
          </div>

          <div className="hidden md:block text-center">
            <p className="text-lg font-semibold text-gray-800 animate-pulse">
              "Strategy is fake, feeling is real!"
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.open('https://letsbonk.fun/token/CkEdG6cUUEuDjMnivruciM45KeQ8NNRioW2vnhGJbonk', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-glow hover:shadow-glow-lg animate-glow"
            >
              <span>🚀</span>
              <span>Buy DumbStr</span>
            </button>
            {connected && (
              <div className="text-sm text-green-600 animate-pulse">
                ✅ Connected
              </div>
            )}
            <SimpleWalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 