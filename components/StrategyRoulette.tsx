'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'
import cryptoApiService, { type CryptoPrice } from '../lib/cryptoApi'

interface Strategy {
  id: string
  name: string
  emoji: string
  category: 'bullish' | 'bearish' | 'neutral' | 'fomo' | 'hodl'
  description: string
  risk: 'low' | 'medium' | 'high' | 'extreme'
  potential: 'low' | 'medium' | 'high' | 'moon'
  advice: string[]
  tokens: string[]
  confidence: number
  marketSentiment: string
  timeframe: string
  entryPrice?: number
  targetPrice?: number
  stopLoss?: number
}

interface RouletteHistory {
  id: string
  strategy: Strategy
  timestamp: number
  userAddress?: string
  likes: number
  shares: number
  comments: number
}

const StrategyRoulette = () => {
  const { publicKey, connected } = useWallet()
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [rouletteHistory, setRouletteHistory] = useState<RouletteHistory[]>([])
  const [activeTab, setActiveTab] = useState<'spin' | 'history' | 'analysis'>('spin')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [marketData, setMarketData] = useState({
    btcPrice: 45000,
    ethPrice: 2800,
    solPrice: 100,
    marketCap: 2500000000000,
    volume24h: 85000000000,
    fearGreedIndex: 65
  })
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  // 微策略风格的策略库
  const strategies: Strategy[] = [
    // 看涨策略
    {
      id: 'moon-shot',
      name: '月球射击',
      emoji: '🚀',
      category: 'bullish',
      description: '全仓梭哈，目标月球！',
      risk: 'extreme',
      potential: 'moon',
      advice: [
        '将所有资金投入热门币种',
        '设置止盈目标：10倍收益',
        '忽略所有风险警告',
        '相信"这次不一样"'
      ],
      tokens: [],
      confidence: 95,
      marketSentiment: '极度乐观',
      timeframe: '1-7天'
    },
    {
      id: 'dca-strategy',
      name: '定投策略',
      emoji: '📈',
      category: 'bullish',
      description: '定期定额投资，长期持有',
      risk: 'low',
      potential: 'high',
      advice: [
        '每周固定金额买入',
        '选择主流币种',
        '长期持有至少1年',
        '不要被短期波动影响'
      ],
      tokens: [],
      confidence: 85,
      marketSentiment: '稳健看涨',
      timeframe: '1-5年'
    },
    {
      id: 'momentum-trading',
      name: '动量交易',
      emoji: '⚡',
      category: 'bullish',
      description: '跟随市场趋势，快进快出',
      risk: 'high',
      potential: 'high',
      advice: [
        '关注24小时涨幅榜',
        '设置严格止损',
        '不要恋战',
        '及时止盈'
      ],
      tokens: [],
      confidence: 70,
      marketSentiment: '趋势跟随',
      timeframe: '1-7天'
    },

    // 看跌策略
    {
      id: 'short-term',
      name: '做空策略',
      emoji: '📉',
      category: 'bearish',
      description: '市场即将崩盘，准备做空',
      risk: 'extreme',
      potential: 'high',
      advice: [
        '等待市场确认下跌趋势',
        '分批建仓做空',
        '设置严格止损',
        '关注市场情绪指标'
      ],
      tokens: [],
      confidence: 60,
      marketSentiment: '悲观',
      timeframe: '1-30天'
    },
    {
      id: 'cash-position',
      name: '现金为王',
      emoji: '💰',
      category: 'bearish',
      description: '持有现金，等待机会',
      risk: 'low',
      potential: 'low',
      advice: [
        '保持80%现金仓位',
        '等待市场底部信号',
        '关注恐慌指数',
        '准备抄底资金'
      ],
      tokens: [],
      confidence: 75,
      marketSentiment: '谨慎',
      timeframe: '1-6个月'
    },

    // 中性策略
    {
      id: 'grid-trading',
      name: '网格交易',
      emoji: '🕸️',
      category: 'neutral',
      description: '在价格区间内高抛低吸',
      risk: 'medium',
      potential: 'medium',
      advice: [
        '设定价格区间',
        '自动执行买卖',
        '定期调整参数',
        '监控市场变化'
      ],
      tokens: [],
      confidence: 80,
      marketSentiment: '中性',
      timeframe: '1-3个月'
    },
    {
      id: 'arbitrage',
      name: '套利策略',
      emoji: '🔄',
      category: 'neutral',
      description: '利用价格差异获利',
      risk: 'low',
      potential: 'medium',
      advice: [
        '监控不同交易所价差',
        '快速执行交易',
        '注意手续费成本',
        '使用自动化工具'
      ],
      tokens: [],
      confidence: 90,
      marketSentiment: '技术性',
      timeframe: '分钟级'
    },

    // FOMO策略
    {
      id: 'fomo-buy',
      name: 'FOMO买入',
      emoji: '🔥',
      category: 'fomo',
      description: '看到别人赚钱，我也要上车！',
      risk: 'extreme',
      potential: 'moon',
      advice: [
        '看到暴涨立即买入',
        '不要犹豫，错过就是损失',
        '借钱也要买',
        '相信"这次不一样"'
      ],
      tokens: [],
      confidence: 50,
      marketSentiment: '极度FOMO',
      timeframe: '分钟级'
    },
    {
      id: 'ape-in',
      name: '猿人策略',
      emoji: '🦍',
      category: 'fomo',
      description: '猿人思维：看到就买，不问原因',
      risk: 'extreme',
      potential: 'moon',
      advice: [
        '看到新币就买',
        '不要看白皮书',
        '相信社区力量',
        '准备归零'
      ],
      tokens: [],
      confidence: 30,
      marketSentiment: '疯狂',
      timeframe: '1-7天'
    },

    // HODL策略
    {
      id: 'diamond-hands',
      name: '钻石手',
      emoji: '💎',
      category: 'hodl',
      description: '永不卖出，直到月球',
      risk: 'high',
      potential: 'moon',
      advice: [
        '买入后删除交易软件',
        '设置10年提醒',
        '忽略所有卖出信号',
        '相信比特币终将到100万'
      ],
      tokens: [],
      confidence: 95,
      marketSentiment: '长期看涨',
      timeframe: '10年+'
    },
    {
      id: 'hodl-forever',
      name: '永久持有',
      emoji: '🏛️',
      category: 'hodl',
      description: '传给下一代',
      risk: 'medium',
      potential: 'high',
      advice: [
        '选择优质项目',
        '定期检查基本面',
        '不要被短期波动影响',
        '考虑遗产规划'
      ],
      tokens: [],
      confidence: 85,
      marketSentiment: '长期价值',
      timeframe: '终身'
    }
  ]

  // 获取风险等级颜色
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'extreme': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // 获取潜力等级颜色
  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'low': return 'text-gray-400'
      case 'medium': return 'text-blue-400'
      case 'high': return 'text-green-400'
      case 'moon': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  // 获取潜力等级图标
  const getPotentialIcon = (potential: string) => {
    switch (potential) {
      case 'low': return '📊'
      case 'medium': return '📈'
      case 'high': return '🚀'
      case 'moon': return '🌙'
      default: return '📊'
    }
  }

  // 获取市场情绪颜色
  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('乐观') || sentiment.includes('看涨')) return 'text-green-400'
    if (sentiment.includes('悲观') || sentiment.includes('看跌')) return 'text-red-400'
    if (sentiment.includes('谨慎') || sentiment.includes('中性')) return 'text-yellow-400'
    return 'text-gray-400'
  }

  // 获取真实价格数据
  const fetchRealPrices = async () => {
    setIsLoadingPrices(true)
    try {
      const symbols = ['BTC', 'ETH', 'SOL']
      const response = await cryptoApiService.getPrices(symbols)
      
      if (response.success && response.data) {
        setCryptoPrices(response.data)
        
        // 更新市场数据
        const btcPrice = response.data.find(p => p.symbol === 'BTC')?.price || 45000
        const ethPrice = response.data.find(p => p.symbol === 'ETH')?.price || 2800
        const solPrice = response.data.find(p => p.symbol === 'SOL')?.price || 100
        
        setMarketData(prev => ({
          ...prev,
          btcPrice,
          ethPrice,
          solPrice
        }))
        
        setLastUpdate(new Date())
        console.log('✅ 价格数据更新成功:', response.data)
      } else {
        console.warn('⚠️ API返回失败，使用缓存数据')
      }
    } catch (error) {
      console.error('❌ 获取价格数据失败:', error)
    } finally {
      setIsLoadingPrices(false)
    }
  }

  // 获取市场概览数据
  const fetchMarketOverview = async () => {
    try {
      const overview = await cryptoApiService.getMarketOverview()
      setMarketData(prev => ({
        ...prev,
        marketCap: overview.totalMarketCap,
        volume24h: overview.totalVolume24h,
        fearGreedIndex: overview.fearGreedIndex
      }))
    } catch (error) {
      console.error('获取市场概览失败:', error)
    }
  }

  // 旋转轮盘
  const spinRoulette = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setSpinCount(prev => prev + 1)

    // 随机选择策略
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)]
    
    // 计算旋转角度
    const spins = 5 + Math.random() * 5 // 5-10圈
    const finalRotation = rotation + (spins * 360)
    setRotation(finalRotation)

    // 动画结束后显示结果
    setTimeout(() => {
      setCurrentStrategy(randomStrategy)
      setIsSpinning(false)

      // 保存到历史记录
      const newHistory: RouletteHistory = {
        id: Date.now().toString(),
        strategy: randomStrategy,
        timestamp: Date.now(),
        userAddress: publicKey?.toString() || undefined,
        likes: 0,
        shares: 0,
        comments: 0
      }
      setRouletteHistory(prev => [newHistory, ...prev.slice(0, 19)])
    }, 3000)
  }

  // 点赞策略
  const likeStrategy = (historyId: string) => {
    setRouletteHistory(prev => 
      prev.map(item => 
        item.id === historyId ? { ...item, likes: item.likes + 1 } : item
      )
    )
  }



  // 初始化数据
  useEffect(() => {
    fetchRealPrices()
    fetchMarketOverview()
  }, [])

  // 每10分钟自动更新价格数据
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealPrices()
      fetchMarketOverview()
    }, 10 * 60 * 1000) // 10分钟

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          🎰 NoStrategy Strategy Roulette
        </h2>
        <p className="text-gray-300 text-lg">
          Randomly generate your investment strategy, mimicking MicroStrategy's "professional" advice
        </p>
      </div>



      {/* 标签页 */}
      <div className="flex justify-center space-x-4 mb-6">
        {[
          { id: 'spin', name: '🎰 Spin', emoji: '🎰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'spin' && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：轮盘 */}
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">🎰 Strategy Roulette</h3>
              
              {/* 轮盘容器 */}
              <div className="relative w-80 h-80 mx-auto">
                <div
                  ref={wheelRef}
                  className={`w-full h-full rounded-full border-4 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 transition-transform duration-3000 ease-out ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {/* 轮盘分割线 */}
                  {strategies.map((strategy, index) => {
                    const angle = (360 / strategies.length) * index
                    return (
                      <div
                        key={strategy.id}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div className="text-2xl transform -rotate-90">
                          {strategy.emoji}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 指针 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-white"></div>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="space-y-4">
                <button
                  onClick={spinRoulette}
                  disabled={isSpinning}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-lg"
                >
                  {isSpinning ? '🎰 Spinning...' : '🎰 Spin Roulette'}
                </button>
                
                <div className="text-gray-400">
                  Spun {spinCount} times
                </div>
              </div>
            </div>

            {/* 右侧：策略结果 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">📋 Strategy Result</h3>
              
              {currentStrategy ? (
                <div className="space-y-6">
                  {/* 策略概览 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl">{currentStrategy.emoji}</div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{currentStrategy.name}</h4>
                        <p className="text-gray-300">{currentStrategy.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-gray-400 text-sm">Risk Level</span>
                        <div className={`font-semibold ${getRiskColor(currentStrategy.risk)}`}>
                          {currentStrategy.risk.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Potential Level</span>
                        <div className={`font-semibold ${getPotentialColor(currentStrategy.potential)}`}>
                          {getPotentialIcon(currentStrategy.potential)} {currentStrategy.potential.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Confidence</span>
                        <div className="text-white font-semibold">{currentStrategy.confidence}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Timeframe</span>
                        <div className="text-white font-semibold">{currentStrategy.timeframe}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">Market Sentiment</span>
                      <div className={`font-semibold ${getSentimentColor(currentStrategy.marketSentiment)}`}>
                        {currentStrategy.marketSentiment}
                      </div>
                    </div>
                  </div>

                  {/* 投资建议 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h5 className="text-lg font-bold text-white mb-3">💡 Investment Advice</h5>
                    <ul className="space-y-2">
                      {currentStrategy.advice.map((advice, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span className="text-gray-300">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-4">
                    <button
                      onClick={spinRoulette}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                      🎰 Spin Again
                    </button>
                            <button
          onClick={() => window.open('https://letsbonk.fun/token/CkEdG6cUUEuDjMnivruciM45KeQ8NNRioW2vnhGJbonk', '_blank')}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg font-semibold"
        >
          🚀 Buy $NoStrategy
        </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎰</div>
                  <p className="text-gray-300 text-lg">Click the roulette to start getting strategies</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">📊 History</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-purple-500/30 rounded px-3 py-1 text-white"
            >
              <option value="all">All Strategies</option>
              <option value="bullish">Bullish Strategies</option>
              <option value="bearish">Bearish Strategies</option>
              <option value="neutral">Neutral Strategies</option>
              <option value="fomo">FOMO Strategies</option>
              <option value="hodl">HODL Strategies</option>
            </select>
          </div>

          {rouletteHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-300 text-lg">No history yet, go spin the roulette!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {rouletteHistory
                .filter(item => selectedCategory === 'all' || item.strategy.category === selectedCategory)
                .map(item => (
                  <div key={item.id} className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{item.strategy.emoji}</div>
                        <div>
                          <div className="text-white font-semibold">{item.strategy.name}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => likeStrategy(item.id)}
                          className="flex items-center space-x-1 text-gray-300 hover:text-red-400"
                        >
                          <span>❤️</span>
                          <span>{item.likes}</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm">{item.strategy.description}</div>
                    <div className="flex space-x-4 text-xs text-gray-400">
                      <span>风险: {item.strategy.risk.toUpperCase()}</span>
                      <span>潜力: {item.strategy.potential.toUpperCase()}</span>
                      <span>信心: {item.strategy.confidence}%</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* 市场概览 */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">📈 市场概览</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">₿</div>
                <div className="text-white font-semibold">${marketData.btcPrice.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">BTC价格</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">Ξ</div>
                <div className="text-white font-semibold">${marketData.ethPrice.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">ETH价格</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">◎</div>
                <div className="text-white font-semibold">${marketData.solPrice.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">SOL价格</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-semibold">${(marketData.marketCap / 1e12).toFixed(2)}T</div>
                <div className="text-gray-400 text-sm">总市值</div>
              </div>
            </div>
          </div>

          {/* 恐惧贪婪指数 */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">😨 恐惧贪婪指数</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">当前指数</span>
                <span className="text-2xl font-bold text-white">{marketData.fearGreedIndex}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    marketData.fearGreedIndex > 70 ? 'bg-green-500' :
                    marketData.fearGreedIndex > 50 ? 'bg-yellow-500' :
                    marketData.fearGreedIndex > 30 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${marketData.fearGreedIndex}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>极度恐惧</span>
                <span>恐惧</span>
                <span>中性</span>
                <span>贪婪</span>
                <span>极度贪婪</span>
              </div>
              <div className="text-center">
                <p className="text-gray-300">
                  {marketData.fearGreedIndex > 70 ? '市场极度贪婪，考虑减仓' :
                   marketData.fearGreedIndex > 50 ? '市场情绪中性，保持观望' :
                   marketData.fearGreedIndex > 30 ? '市场恐惧，可能是买入机会' : '市场极度恐惧，准备抄底'}
                </p>
              </div>
            </div>
          </div>

          {/* 策略分布 */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">📊 策略分布</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { category: 'bullish', name: '看涨', emoji: '📈', count: strategies.filter(s => s.category === 'bullish').length },
                { category: 'bearish', name: '看跌', emoji: '📉', count: strategies.filter(s => s.category === 'bearish').length },
                { category: 'neutral', name: '中性', emoji: '📊', count: strategies.filter(s => s.category === 'neutral').length },
                { category: 'fomo', name: 'FOMO', emoji: '🔥', count: strategies.filter(s => s.category === 'fomo').length },
                { category: 'hodl', name: 'HODL', emoji: '💎', count: strategies.filter(s => s.category === 'hodl').length }
              ].map(item => (
                <div key={item.category} className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <div className="text-white font-semibold">{item.name}</div>
                  <div className="text-gray-400 text-sm">{item.count} 个策略</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default StrategyRoulette 