'use client'

import React from 'react'

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nostrategy-dark via-purple-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🚀 NoStrategy
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            嘲讽微策略的Meme网站
          </p>
          <div className="text-lg text-yellow-400 animate-pulse">
            "策略是骗人的，感觉才是真实的！"
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">📈 Stonks追踪器</h2>
            <p className="text-gray-300 mb-4">
              连接你的SOL钱包，自动生成Meme报告
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">总余额:</span>
                <span className="text-green-400 font-bold">$15,420.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h变化:</span>
                <span className="text-red-400 font-bold">-12.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">📊 抽象图表</h2>
            <p className="text-gray-300 mb-4">
              图表是骗人的，感觉才是真实的！
            </p>
            <div className="h-32 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">📉 暴跌K线图</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">🎭 Meme生成器</h3>
            <p className="text-gray-300 text-sm">
              上传表情 + 输入Token，生成"某个币"梗图
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">🎰 策略轮盘</h3>
            <p className="text-gray-300 text-sm">
              随机生成你当天的 NoStrategy 心得分享
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">🏆 排行榜</h3>
            <p className="text-gray-300 text-sm">
              最赚钱/最离谱策略用户榜单
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">🎯 今日策略</h2>
          <p className="text-xl text-gray-300 mb-6 italic">
            "感觉对了就买，感觉不对就卖！"
          </p>
          <div className="flex justify-center space-x-4">
            <button className="wallet-button">
              🔗 连接钱包
            </button>
            <button className="wallet-button">
              🎲 开始体验
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            ⚠️ 免责声明：本网站仅供娱乐目的，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoPage 