// 加密货币API服务
// 支持多个API源，自动切换备用方案

interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  lastUpdated: number
}

interface ApiResponse {
  success: boolean
  data?: CryptoPrice[]
  error?: string
}

// API配置
const API_CONFIGS = [
  {
    name: 'CoinGecko',
    baseUrl: 'https://api.coingecko.com/api/v3',
    endpoints: {
      prices: '/simple/price',
      marketData: '/coins/markets'
    },
    rateLimit: 50, // 每分钟请求限制
    priority: 1
  },
  {
    name: 'CoinCap',
    baseUrl: 'https://api.coincap.io/v2',
    endpoints: {
      prices: '/assets',
      marketData: '/assets'
    },
    rateLimit: 100,
    priority: 2
  },
  {
    name: 'Binance',
    baseUrl: 'https://api.binance.com/api/v3',
    endpoints: {
      prices: '/ticker/24hr',
      marketData: '/ticker/24hr'
    },
    rateLimit: 1200,
    priority: 3
  }
]

class CryptoApiService {
  private currentApiIndex = 0
  private lastRequestTime = 0
  private requestCount = 0
  private cache: Map<string, CryptoPrice> = new Map()
  private cacheTimeout = 10 * 60 * 1000 // 10分钟缓存

  // 获取当前API配置
  private getCurrentApi() {
    return API_CONFIGS[this.currentApiIndex]
  }

  // 切换到下一个API
  private switchToNextApi() {
    this.currentApiIndex = (this.currentApiIndex + 1) % API_CONFIGS.length
    console.log(`切换到API: ${this.getCurrentApi().name}`)
  }

  // 检查缓存是否有效
  private isCacheValid(symbol: string): boolean {
    const cached = this.cache.get(symbol)
    if (!cached) return false
    return Date.now() - cached.lastUpdated < this.cacheTimeout
  }

  // 从CoinGecko获取价格
  private async fetchFromCoinGecko(symbols: string[]): Promise<CryptoPrice[]> {
    const api = this.getCurrentApi()
    const ids = symbols.map(s => this.getCoinGeckoId(s)).filter(Boolean)
    
    if (ids.length === 0) return []

    try {
      const response = await fetch(
        `${api.baseUrl}${api.endpoints.prices}?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const results: CryptoPrice[] = []

      for (const [id, priceData] of Object.entries(data)) {
        const symbol = this.getSymbolFromCoinGeckoId(id)
        if (symbol && priceData && typeof priceData === 'object') {
          results.push({
            symbol: symbol.toUpperCase(),
            price: (priceData as any).usd || 0,
            change24h: (priceData as any).usd_24h_change || 0,
            marketCap: (priceData as any).usd_market_cap || 0,
            volume24h: (priceData as any).usd_24h_vol || 0,
            lastUpdated: Date.now()
          })
        }
      }

      return results
    } catch (error) {
      console.error('CoinGecko API错误:', error)
      throw error
    }
  }

  // 从CoinCap获取价格
  private async fetchFromCoinCap(symbols: string[]): Promise<CryptoPrice[]> {
    const api = this.getCurrentApi()
    
    try {
      const response = await fetch(`${api.baseUrl}${api.endpoints.prices}`)
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const results: CryptoPrice[] = []

      for (const asset of data.data || []) {
        if (symbols.includes(asset.symbol.toUpperCase())) {
          results.push({
            symbol: asset.symbol.toUpperCase(),
            price: parseFloat(asset.priceUsd) || 0,
            change24h: parseFloat(asset.changePercent24Hr) || 0,
            marketCap: parseFloat(asset.marketCapUsd) || 0,
            volume24h: parseFloat(asset.volumeUsd24Hr) || 0,
            lastUpdated: Date.now()
          })
        }
      }

      return results
    } catch (error) {
      console.error('CoinCap API错误:', error)
      throw error
    }
  }

  // 从Binance获取价格
  private async fetchFromBinance(symbols: string[]): Promise<CryptoPrice[]> {
    const api = this.getCurrentApi()
    const results: CryptoPrice[] = []

    try {
      for (const symbol of symbols) {
        const binanceSymbol = `${symbol}USDT`
        
        const response = await fetch(`${api.baseUrl}${api.endpoints.prices}?symbol=${binanceSymbol}`)
        
        if (!response.ok) continue

        const data = await response.json()
        
        if (data.symbol) {
          results.push({
            symbol: symbol.toUpperCase(),
            price: parseFloat(data.lastPrice) || 0,
            change24h: parseFloat(data.priceChangePercent) || 0,
            marketCap: 0, // Binance不提供市值
            volume24h: parseFloat(data.quoteVolume) || 0,
            lastUpdated: Date.now()
          })
        }
      }

      return results
    } catch (error) {
      console.error('Binance API错误:', error)
      throw error
    }
  }

  // CoinGecko ID映射
  private getCoinGeckoId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'DOGE': 'dogecoin',
      'AVAX': 'avalanche-2',
      'MATIC': 'matic-network',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'XLM': 'stellar',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ICP': 'internet-computer',
      'FIL': 'filecoin'
    }
    return mapping[symbol.toUpperCase()] || ''
  }

  // 从CoinGecko ID获取符号
  private getSymbolFromCoinGeckoId(id: string): string {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'ripple': 'XRP',
      'polkadot': 'DOT',
      'dogecoin': 'DOGE',
      'avalanche-2': 'AVAX',
      'matic-network': 'MATIC',
      'chainlink': 'LINK',
      'uniswap': 'UNI',
      'cosmos': 'ATOM',
      'litecoin': 'LTC',
      'bitcoin-cash': 'BCH',
      'stellar': 'XLM',
      'algorand': 'ALGO',
      'vechain': 'VET',
      'internet-computer': 'ICP',
      'filecoin': 'FIL'
    }
    return mapping[id] || ''
  }

  // 获取加密货币价格 - 使用内部API路由
  async getPrices(symbols: string[]): Promise<ApiResponse> {
    try {
      // 检查缓存
      const cachedResults: CryptoPrice[] = []
      const uncachedSymbols: string[] = []

      for (const symbol of symbols) {
        if (this.isCacheValid(symbol)) {
          const cached = this.cache.get(symbol)
          if (cached) cachedResults.push(cached)
        } else {
          uncachedSymbols.push(symbol)
        }
      }

      // 如果所有数据都在缓存中，直接返回
      if (uncachedSymbols.length === 0) {
        return { success: true, data: cachedResults }
      }

      // 使用内部API路由
      try {
        const response = await fetch(`/api/crypto?symbols=${uncachedSymbols.join(',')}&type=prices`)
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result = await response.json()
        
        if (result.success && result.data) {
          // 更新缓存
          for (const price of result.data) {
            this.cache.set(price.symbol, price)
          }

          // 合并缓存和新数据
          const allResults = [...cachedResults, ...result.data]
          return { success: true, data: allResults }
        } else {
          throw new Error(result.error || 'API返回失败')
        }
      } catch (error) {
        console.error('内部API失败，尝试外部API:', error)
        
        // 如果内部API失败，尝试外部API
        let apiResults: CryptoPrice[] = []
        const maxRetries = API_CONFIGS.length

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const api = this.getCurrentApi()
            
            switch (api.name) {
              case 'CoinGecko':
                apiResults = await this.fetchFromCoinGecko(uncachedSymbols)
                break
              case 'CoinCap':
                apiResults = await this.fetchFromCoinCap(uncachedSymbols)
                break
              case 'Binance':
                apiResults = await this.fetchFromBinance(uncachedSymbols)
                break
              default:
                throw new Error(`未知API: ${api.name}`)
            }

            // 更新缓存
            for (const result of apiResults) {
              this.cache.set(result.symbol, result)
            }

            // 合并缓存和新数据
            const allResults = [...cachedResults, ...apiResults]
            
            return { success: true, data: allResults }

          } catch (error) {
            console.error(`${this.getCurrentApi().name} API失败，尝试下一个...`, error)
            this.switchToNextApi()
            
            // 如果是最后一次尝试，返回缓存数据
            if (attempt === maxRetries - 1) {
              console.warn('所有API都失败，返回缓存数据')
              return { success: true, data: cachedResults }
            }
          }
        }
      }

      return { success: false, error: '所有API都不可用' }

    } catch (error) {
      console.error('获取价格失败:', error)
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 获取市场概览数据
  async getMarketOverview(): Promise<{
    totalMarketCap: number
    totalVolume24h: number
    btcDominance: number
    fearGreedIndex: number
  }> {
    try {
      // 首先尝试内部API
      const response = await fetch('/api/crypto?type=overview')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return {
            totalMarketCap: data.totalMarketCap || 0,
            totalVolume24h: data.totalVolume24h || 0,
            btcDominance: data.btcDominance || 0,
            fearGreedIndex: data.fearGreedIndex || 65
          }
        }
      }

      // 如果内部API失败，尝试外部API
      const externalResponse = await fetch('https://api.coingecko.com/api/v3/global')
      
      if (!externalResponse.ok) {
        throw new Error(`HTTP ${externalResponse.status}`)
      }

      const data = await externalResponse.json()
      
      return {
        totalMarketCap: data.data.total_market_cap.usd || 0,
        totalVolume24h: data.data.total_volume.usd || 0,
        btcDominance: data.data.market_cap_percentage.btc || 0,
        fearGreedIndex: Math.floor(Math.random() * 100) // 模拟恐惧贪婪指数
      }
    } catch (error) {
      console.error('获取市场概览失败:', error)
      return {
        totalMarketCap: 2500000000000,
        totalVolume24h: 85000000000,
        btcDominance: 50,
        fearGreedIndex: 65
      }
    }
  }
}

// 创建单例实例
const cryptoApiService = new CryptoApiService()

export default cryptoApiService
export type { CryptoPrice, ApiResponse } 