import React from 'react'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🚀 NoStrategy
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          嘲讽微策略的Meme网站
        </p>
        <div className="text-lg text-yellow-400 animate-pulse">
          "策略是骗人的，感觉才是真实的！"
        </div>
        <div className="mt-8">
          <a 
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  )
} 