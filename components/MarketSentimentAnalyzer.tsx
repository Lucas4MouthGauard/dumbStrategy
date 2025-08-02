'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'

interface FearGreedData {
  value: number
  classification: string
  timestamp: number
  lastUpdated: string
}

const MarketSentimentAnalyzer = () => {
  const { publicKey, connected } = useWallet()
  const [fearGreedData, setFearGreedData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // 获取恐慌贪婪指数的API端点
  const API_ENDPOINTS = [
    'https://api.alternative.me/fng/',
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    'https://api.coinmarketcap.com/v1/global/'
  ]

  // 从Alternative.me获取恐慌贪婪指数
  const fetchFearGreedIndex = async (): Promise<FearGreedData | null> => {
    try {
      const response = await fetch('https://api.alternative.me/fng/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // 设置超时
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data && data.data && data.data[0]) {
        const item = data.data[0]
        return {
          value: parseInt(item.value),
          classification: item.value_classification,
          timestamp: parseInt(item.timestamp),
          lastUpdated: new Date().toLocaleString('en-US')
        }
      }
      
      throw new Error('Invalid data format')
    } catch (error) {
      console.error('Alternative.me API failed:', error)
      return null
    }
  }

  // 备用API：从CoinGecko获取市场数据并计算恐慌贪婪指数
  const fetchBackupFearGreedIndex = async (): Promise<FearGreedData | null> => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data && data.bitcoin && data.bitcoin.usd_24h_change !== undefined) {
        // Calculate fear and greed index based on Bitcoin 24h price change
        const change = data.bitcoin.usd_24h_change
        let value: number
        let classification: string

        if (change > 10) {
          value = 85
          classification = 'Extreme Greed'
        } else if (change > 5) {
          value = 70
          classification = 'Greed'
        } else if (change > 0) {
          value = 55
          classification = 'Neutral'
        } else if (change > -5) {
          value = 40
          classification = 'Fear'
        } else if (change > -10) {
          value = 25
          classification = 'Extreme Fear'
        } else {
          value = 10
          classification = 'Extreme Fear'
        }

        return {
          value,
          classification,
          timestamp: Date.now(),
          lastUpdated: new Date().toLocaleString('en-US')
        }
      }
      
      throw new Error('Invalid data format')
    } catch (error) {
      console.error('CoinGecko API failed:', error)
      return null
    }
  }

  // 获取恐慌贪婪指数数据
  const fetchFearGreedData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 首先尝试主要API
      let data = await fetchFearGreedIndex()
      
              // If primary API fails, try backup API
      if (!data) {
        console.log('Primary API failed, trying backup API...')
        data = await fetchBackupFearGreedIndex()
      }

      if (data) {
        setFearGreedData(data)
        setLastFetchTime(Date.now())
        localStorage.setItem('fearGreedData', JSON.stringify(data))
        localStorage.setItem('fearGreedLastFetch', Date.now().toString())
      } else {
        // If all APIs fail, try to get last data from local storage
        const cachedData = localStorage.getItem('fearGreedData')
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          setFearGreedData(parsedData)
          setError('Using cached data, API temporarily unavailable')
        } else {
          setError('Unable to fetch fear and greed index data')
        }
      }
    } catch (error) {
      console.error('Error fetching fear and greed data:', error)
      setError('Error occurred while fetching data')
      
      // Try to get last data from local storage
      const cachedData = localStorage.getItem('fearGreedData')
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        setFearGreedData(parsedData)
      }
    } finally {
      setLoading(false)
    }
  }

  // 获取恐慌贪婪指数的颜色
  const getFearGreedColor = (value: number) => {
    if (value >= 80) return 'text-red-500'
    if (value >= 60) return 'text-orange-500'
    if (value >= 40) return 'text-yellow-500'
    if (value >= 20) return 'text-blue-500'
    return 'text-green-500'
  }

  // 获取恐慌贪婪指数的描述
  const getFearGreedDescription = (value: number, classification: string) => {
    if (value >= 80) {
      return '市场极度贪婪，投资者过于乐观，可能存在泡沫风险'
    } else if (value >= 60) {
      return '市场贪婪，投资者情绪乐观，但需保持谨慎'
    } else if (value >= 40) {
      return '市场情绪中性，投资者保持理性判断'
    } else if (value >= 20) {
      return '市场恐惧，投资者情绪悲观，可能是买入机会'
    } else {
      return '市场极度恐惧，投资者恐慌抛售，可能是绝佳买入时机'
    }
  }

  // 获取恐慌贪婪指数的建议
  const getFearGreedAdvice = (value: number) => {
    if (value >= 80) {
      return '考虑减仓，市场可能过热'
    } else if (value >= 60) {
      return '谨慎投资，不要追高'
    } else if (value >= 40) {
      return '保持理性，按计划投资'
    } else if (value >= 20) {
      return '可以考虑分批买入'
    } else {
      return '可能是绝佳的买入时机'
    }
  }

  // 初始化数据
  useEffect(() => {
    // 检查是否有缓存数据
    const cachedData = localStorage.getItem('fearGreedData')
    const lastFetch = localStorage.getItem('fearGreedLastFetch')
    
    if (cachedData && lastFetch) {
      const parsedData = JSON.parse(cachedData)
      const lastFetchTime = parseInt(lastFetch)
      const now = Date.now()
      
      // 如果缓存数据不超过30分钟，使用缓存数据
      if (now - lastFetchTime < 30 * 60 * 1000) {
        setFearGreedData(parsedData)
        setLastFetchTime(lastFetchTime)
      } else {
        // 超过30分钟，重新获取数据
        fetchFearGreedData()
      }
    } else {
      // 没有缓存数据，立即获取
      fetchFearGreedData()
    }
  }, [])

  // 设置定时器，每30分钟刷新一次
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFearGreedData()
    }, 30 * 60 * 1000) // 30分钟

    return () => clearInterval(interval)
  }, [])

  if (!connected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">😨</div>
          <h2 className="text-2xl font-bold text-white mb-4">Market Sentiment Analyzer</h2>
          <p className="text-gray-300 mb-6">Connect wallet to get real-time market sentiment analysis</p>
          <SimpleWalletButton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 标题和连接状态 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">😨 Market Sentiment Analyzer</h1>
          <p className="text-gray-300">Real-time analysis of cryptocurrency market fear and greed index</p>
        </div>
        <SimpleWalletButton />
      </div>

      {/* 恐慌贪婪指数显示 */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">😨 Fear & Greed Index</h2>
          
          {loading ? (
            <div className="space-y-4">
              <div className="animate-spin text-4xl mx-auto">🔄</div>
              <p className="text-gray-300">Fetching latest data...</p>
            </div>
          ) : fearGreedData ? (
            <div className="space-y-6">
              {/* 指数数值 */}
              <div className={`text-8xl font-bold mb-4 ${getFearGreedColor(fearGreedData.value)}`}>
                {fearGreedData.value}
              </div>
              
              {/* 分类 */}
              <div className="text-3xl font-semibold text-white mb-4">
                {fearGreedData.classification}
              </div>
              
              {/* 进度条 */}
              <div className="w-full max-w-md mx-auto">
                <div className="w-full bg-gray-700 rounded-full h-6 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-6 rounded-full transition-all duration-1000"
                    style={{ width: `${fearGreedData.value}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Extreme Fear</span>
                  <span>Fear</span>
                  <span>Neutral</span>
                  <span>Greed</span>
                  <span>Extreme Greed</span>
                </div>
              </div>
              
              {/* 描述 */}
              <div className="bg-black/30 rounded-xl p-6 max-w-2xl mx-auto">
                <p className="text-gray-200 text-lg leading-relaxed">
                  {getFearGreedDescription(fearGreedData.value, fearGreedData.classification)}
                </p>
              </div>
              
              {/* 建议 */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 max-w-2xl mx-auto border border-purple-500/30">
                <h3 className="text-xl font-semibold text-white mb-2">💡 Investment Advice</h3>
                <p className="text-gray-200">
                  {getFearGreedAdvice(fearGreedData.value)}
                </p>
              </div>
              
              {/* 更新时间 */}
              <div className="text-gray-400 text-sm">
                Last updated: {fearGreedData.lastUpdated}
              </div>
              
              {/* 错误提示 */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">😰</div>
              <p className="text-gray-300">Unable to fetch fear and greed index data</p>
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
          
          {/* 刷新按钮 */}
          <div className="mt-8">
            <button
              onClick={fetchFearGreedData}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Fetching...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* 说明信息 */}
      <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 About Fear & Greed Index</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">🎯 Index Meaning</h4>
            <p className="text-sm leading-relaxed">
              The Fear & Greed Index is a technical indicator that measures cryptocurrency market sentiment. When the index approaches 0, it indicates extreme fear,
              and when it approaches 100, it indicates extreme greed. This indicator can help investors assess market sentiment and make wiser investment decisions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">⏰ Update Frequency</h4>
            <p className="text-sm leading-relaxed">
              Data is automatically updated every 30 minutes to ensure you always get the latest market sentiment information.
              If the API is temporarily unavailable, the system will display the last successfully fetched data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketSentimentAnalyzer 