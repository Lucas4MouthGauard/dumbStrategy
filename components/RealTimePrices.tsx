'use client'

import React, { useState, useEffect } from 'react'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  lastUpdated: string
}

const RealTimePrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    try {
      setLoading(true)
      setError(null)

      // 尝试多个API源
      const apis = [
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
        'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]',
        'https://api.coinbase.com/v2/prices/BTC-USD/spot'
      ]

      let data = null
      let apiUsed = ''

      for (const api of apis) {
        try {
          const response = await fetch(api, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000) // 5秒超时
          })

          if (response.ok) {
            data = await response.json()
            apiUsed = api
            break
          }
        } catch (err) {
          console.log(`API ${api} failed, trying next...`)
          continue
        }
      }

      if (!data) {
        throw new Error('All APIs failed')
      }

      let priceData: PriceData[] = []

      if (apiUsed.includes('coingecko')) {
        // CoinGecko API格式
        priceData = [
          {
            symbol: 'BTC',
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change,
            lastUpdated: new Date(data.bitcoin.last_updated_at * 1000).toLocaleString('en-US')
          },
          {
            symbol: 'ETH',
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change,
            lastUpdated: new Date(data.ethereum.last_updated_at * 1000).toLocaleString('en-US')
          },
          {
            symbol: 'SOL',
            price: data.solana.usd,
            change24h: data.solana.usd_24h_change,
            lastUpdated: new Date(data.solana.last_updated_at * 1000).toLocaleString('en-US')
          }
        ]
      } else if (apiUsed.includes('binance')) {
        // Binance API格式
        const btcData = data.find((item: any) => item.symbol === 'BTCUSDT')
        const ethData = data.find((item: any) => item.symbol === 'ETHUSDT')
        const solData = data.find((item: any) => item.symbol === 'SOLUSDT')

        priceData = [
          {
            symbol: 'BTC',
            price: parseFloat(btcData?.lastPrice || '45000'),
            change24h: parseFloat(btcData?.priceChangePercent || '2.5'),
            lastUpdated: new Date().toLocaleString('en-US')
          },
          {
            symbol: 'ETH',
            price: parseFloat(ethData?.lastPrice || '2800'),
            change24h: parseFloat(ethData?.priceChangePercent || '-1.2'),
            lastUpdated: new Date().toLocaleString('en-US')
          },
          {
            symbol: 'SOL',
            price: parseFloat(solData?.lastPrice || '100.00'),
            change24h: parseFloat(solData?.priceChangePercent || '5.8'),
            lastUpdated: new Date().toLocaleString('en-US')
          }
        ]
      } else {
        // Use mock data
        priceData = [
          { symbol: 'BTC', price: 45000, change24h: 2.5, lastUpdated: 'Just now' },
          { symbol: 'ETH', price: 2800, change24h: -1.2, lastUpdated: 'Just now' },
          { symbol: 'SOL', price: 100.00, change24h: 5.8, lastUpdated: 'Just now' }
        ]
      }

      setPrices(priceData)
    } catch (err) {
      console.error('Failed to fetch prices:', err)
      setError('Failed to fetch real-time prices, using mock data')
      
      // Use fallback data
      setPrices([
        { symbol: 'BTC', price: 45000, change24h: 2.5, lastUpdated: 'Just now' },
        { symbol: 'ETH', price: 2800, change24h: -1.2, lastUpdated: 'Just now' },
        { symbol: 'SOL', price: 100.00, change24h: 5.8, lastUpdated: 'Just now' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }

  const getPriceIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return '₿'
      case 'ETH': return 'Ξ'
      case 'SOL': return '◎'
      default: return '💎'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient">
          💰 Real-time Prices
        </h2>
        <p className="text-gray-700 text-lg">
          Get the latest cryptocurrency price data
        </p>
      </div>

      <div className="dumbstrategy-card rounded-2xl p-6 dumbstrategy-glow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Major Cryptocurrencies</h3>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg"
          >
            {loading ? '🔄 Updating...' : '🔄 Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prices.map((price) => (
            <div
              key={price.symbol}
              className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-glow backdrop-blur-sm hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl animate-float">{getPriceIcon(price.symbol)}</span>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{price.symbol}</h4>
                    <p className="text-gray-600 text-sm">
                      {price.symbol === 'BTC' ? 'Bitcoin' : 
                       price.symbol === 'ETH' ? 'Ethereum' : 
                       price.symbol === 'SOL' ? 'Solana' : 'Cryptocurrency'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(price.price)}
                  </p>
                  <p className={`text-sm font-semibold ${
                    price.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>24h Change</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RealTimePrices 