'use client'

import React from 'react'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-lg border-t border-yellow-500/30 mt-16 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 via-transparent to-orange-900/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl animate-bounce-slow">🚀</div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                  DumbStrategy
                </h3>
                <p className="text-sm text-gray-700">Meme Site Mocking MicroStrategy</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              DumbStrategy is a meme site dedicated to retail investors, we believe "Strategy is fake, feeling is real!"
              Here, you can find resonance, share your investment "wisdom", and let more people see your "strategy"!
            </p>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2">
              <a 
                href="https://x.com/DumbStrategy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-all duration-300 text-sm hover:shadow-neon rounded-lg px-2 py-1"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="border-t border-yellow-500/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600 text-sm">
              © 2024 DumbStrategy. All rights reserved.
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
          <p className="text-red-700 text-xs text-center">
            ⚠️ Disclaimer: This website is for entertainment purposes only and does not constitute investment advice. Cryptocurrency investment involves high risks.
            Please invest carefully and do not invest more than you can afford to lose. Remember: Strategy is fake, feeling is real!
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 