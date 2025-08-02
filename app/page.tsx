'use client'

import React, { useState } from 'react'
import Header from '../components/Header'

import NotAChart from '../components/NotAChart'
import MemeGenerator from '../components/MemeGenerator'
import StrategyRoulette from '../components/StrategyRoulette'
import MarketSentimentAnalyzer from '../components/MarketSentimentAnalyzer'
import ChatRoom from '../components/ChatRoom'
import RealTimePrices from '../components/RealTimePrices'
import Footer from '../components/Footer'

export default function Home() {
  const [activeSection, setActiveSection] = useState('prices')

  const sections = [
    { id: 'prices', name: 'Real-time Prices', icon: '💰' },
    { id: 'chart', name: 'Abstract Chart', icon: '📊' },
    { id: 'sentiment', name: 'Market Sentiment', icon: '😨' },
    { id: 'meme', name: 'Meme Generator', icon: '🎭' },
    { id: 'chat', name: 'Chat Room', icon: '💬' },
    { id: 'roulette', name: 'Strategy Roulette', icon: '🎰' },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'prices':
        return <RealTimePrices />
      case 'chart':
        return <NotAChart />
      case 'sentiment':
        return <MarketSentimentAnalyzer />
      case 'meme':
        return <MemeGenerator />
      case 'chat':
        return <ChatRoom />
      case 'roulette':
        return <StrategyRoulette />
      default:
        return <RealTimePrices />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-sunset rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-fire rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-golden rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-warm rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Header />
      
      {/* Navigation Menu */}
      <nav className="bg-black/10 backdrop-blur-md border-b border-yellow-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow animate-glow'
                    : 'text-gray-700 hover:text-black hover:bg-white/20 hover:shadow-neon'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-semibold">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="animate-fade-in">
          {renderSection()}
        </div>
      </main>

      <Footer />
    </div>
  )
} 