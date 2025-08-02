'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: string
}

interface TradeData {
  type: 'buy' | 'sell'
  price: number
  amount: number
  timestamp: number
}

const NotAChart = () => {
  const { publicKey, connected } = useWallet()
  const [currentChart, setCurrentChart] = useState(0)
  const [chartTypes] = useState(['FOMO Surge', 'Panic Sell', 'Sideways', 'Technical Breakout', 'Whale Manipulation', 'Retail FOMO'])
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null)
  const [timeframe, setTimeframe] = useState('1H')
  const [showVolume, setShowVolume] = useState(true)
  const [showMA, setShowMA] = useState(true)
  const [showRSI, setShowRSI] = useState(true)
  const [showMACD, setShowMACD] = useState(false)
  const [trades, setTrades] = useState<TradeData[]>([])
  const [fomoLevel, setFomoLevel] = useState(0)
  const [priceAlert, setPriceAlert] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // 生成FOMO风格的K线数据
  const generateFomoCandleData = (type: string, count: number = 200): CandleData[] => {
    const data: CandleData[] = []
    let basePrice = 100
    let volatility = 0.1
    let fomoMultiplier = 1

    switch (type) {
      case 'FOMO暴涨':
        volatility = 0.3
        fomoMultiplier = 2.5
        for (let i = 0; i < count; i++) {
          // FOMO效应：价格加速上涨
          const fomoEffect = Math.pow(1.1, Math.min(i / 20, 3))
          const change = (Math.random() + 0.3) * volatility * basePrice * fomoEffect * fomoMultiplier
          basePrice = basePrice + change
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.4 * fomoEffect),
            low: basePrice * (1 - Math.random() * 0.1),
            close: basePrice * (1 + Math.random() * 0.3 * fomoEffect),
            volume: Math.random() * 5000000 * fomoEffect,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
      case '恐慌抛售':
        volatility = 0.4
        for (let i = 0; i < count; i++) {
          const panicEffect = Math.pow(1.2, Math.min(i / 15, 4))
          const change = (Math.random() - 0.7) * volatility * basePrice * panicEffect
          basePrice = Math.max(basePrice + change, 1)
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.2),
            low: basePrice * (1 - Math.random() * 0.5 * panicEffect),
            close: basePrice * (1 - Math.random() * 0.3 * panicEffect),
            volume: Math.random() * 8000000 * panicEffect,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
      case '横盘震荡':
        volatility = 0.05
        for (let i = 0; i < count; i++) {
          const change = (Math.random() - 0.5) * volatility * basePrice
          basePrice = basePrice + change
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.1),
            low: basePrice * (1 - Math.random() * 0.1),
            close: basePrice * (1 + (Math.random() - 0.5) * 0.05),
            volume: Math.random() * 1000000,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
      case '技术突破':
        volatility = 0.2
        for (let i = 0; i < count; i++) {
          let change
          if (i < count * 0.7) {
            // 横盘整理
            change = (Math.random() - 0.5) * 0.02 * basePrice
          } else {
            // 突破上涨
            const breakoutEffect = Math.pow(1.15, (i - count * 0.7) / 10)
            change = (Math.random() + 0.4) * volatility * basePrice * breakoutEffect
          }
          basePrice = basePrice + change
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.3),
            low: basePrice * (1 - Math.random() * 0.1),
            close: basePrice * (1 + Math.random() * 0.2),
            volume: Math.random() * 3000000,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
      case '庄家操盘':
        volatility = 0.25
        for (let i = 0; i < count; i++) {
          // 庄家操控模式：先拉高再砸盘
          let change
          if (i < count * 0.3) {
            // 拉高阶段
            change = (Math.random() + 0.5) * volatility * basePrice
          } else if (i < count * 0.7) {
            // 横盘阶段
            change = (Math.random() - 0.5) * 0.01 * basePrice
          } else {
            // 砸盘阶段
            change = (Math.random() - 0.8) * volatility * basePrice
          }
          basePrice = Math.max(basePrice + change, 1)
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.4),
            low: basePrice * (1 - Math.random() * 0.3),
            close: basePrice * (1 + (Math.random() - 0.5) * 0.2),
            volume: Math.random() * 4000000,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
      case '散户追涨':
        volatility = 0.35
        for (let i = 0; i < count; i++) {
          // 散户追涨模式：疯狂买入
          const fomoEffect = Math.pow(1.2, Math.min(i / 15, 4))
          const change = (Math.random() + 0.6) * volatility * basePrice * fomoEffect
          basePrice = basePrice + change
          
          data.push({
            time: Date.now() - (count - i) * 60000,
            open: basePrice,
            high: basePrice * (1 + Math.random() * 0.5 * fomoEffect),
            low: basePrice * (1 - Math.random() * 0.1),
            close: basePrice * (1 + Math.random() * 0.4 * fomoEffect),
            volume: Math.random() * 6000000 * fomoEffect,
            timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString()
          })
        }
        break
    }
    return data
  }

  const charts = [
    {
      type: 'FOMO Surge',
      emoji: '🚀',
      color: 'from-green-500 to-emerald-500',
      description: 'FOMO effect erupts! Price skyrocketing, missing out means losses!',
      data: generateFomoCandleData('FOMO暴涨')
    },
    {
      type: 'Panic Sell',
      emoji: '💀',
      color: 'from-red-500 to-pink-500',
      description: 'Panic spreads, everyone is selling frantically!',
      data: generateFomoCandleData('恐慌抛售')
    },
    {
      type: 'Sideways',
      emoji: '📊',
      color: 'from-gray-500 to-slate-500',
      description: 'Boring sideways movement, waiting for breakout signals!',
      data: generateFomoCandleData('横盘震荡')
    },
    {
      type: 'Technical Breakout',
      emoji: '📈',
      color: 'from-blue-500 to-cyan-500',
      description: 'Breaking key resistance levels, new uptrend begins!',
      data: generateFomoCandleData('技术突破')
    },
    {
      type: 'Whale Manipulation',
      emoji: '🎯',
      color: 'from-purple-500 to-pink-500',
      description: 'Whales are manipulating the market, beware of getting rekt!',
      data: generateFomoCandleData('庄家操盘')
    },
    {
      type: 'Retail FOMO',
      emoji: '🐑',
      color: 'from-yellow-500 to-orange-500',
      description: 'Retail investors chasing pumps, FOMO at peak!',
      data: generateFomoCandleData('散户追涨')
    }
  ]

  // 计算RSI
  const calculateRSI = (data: CandleData[], period: number = 14): number[] => {
    const rsi: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? -change : 0)
    }

    for (let i = period; i < data.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const rs = avgGain / avgLoss
      const rsiValue = 100 - (100 / (1 + rs))
      rsi.push(rsiValue)
    }

    return rsi
  }

  // 计算MACD
  const calculateMACD = (data: CandleData[]): { macd: number[], signal: number[], histogram: number[] } => {
    const closes = data.map(d => d.close)
    const ema12 = calculateEMA(closes, 12)
    const ema26 = calculateEMA(closes, 26)
    
    const macd: number[] = []
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macd.push(ema12[i] - ema26[i])
    }
    
    const signal = calculateEMA(macd, 9)
    const histogram: number[] = []
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i])
    }
    
    return { macd, signal, histogram }
  }

  // 计算EMA
  const calculateEMA = (data: number[], period: number): number[] => {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)
    
    ema.push(data[0])
    for (let i = 1; i < data.length; i++) {
      ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)))
    }
    
    return ema
  }

  // 绘制专业K线图
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chartData = charts[currentChart].data
    const width = canvas.width
    const height = canvas.height
    const padding = 80
    const chartHeight = showRSI ? height * 0.7 : height
    const rsiHeight = showRSI ? height * 0.2 : 0

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 设置背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // 计算价格范围
    const prices = chartData.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // 绘制网格
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight - 2 * padding) * i / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // 绘制价格标签
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange * i / 5)
      const y = padding + (chartHeight - 2 * padding) * i / 5
      ctx.fillText(price.toFixed(2), 5, y + 4)
    }

    // 绘制K线
    const candleWidth = (width - 2 * padding) / chartData.length * 0.8
    const candleSpacing = (width - 2 * padding) / chartData.length

    chartData.forEach((candle, index) => {
      const x = padding + index * candleSpacing + candleSpacing * 0.1
      const openY = padding + (chartHeight - 2 * padding) * (1 - (candle.open - minPrice) / priceRange)
      const closeY = padding + (chartHeight - 2 * padding) * (1 - (candle.close - minPrice) / priceRange)
      const highY = padding + (chartHeight - 2 * padding) * (1 - (candle.high - minPrice) / priceRange)
      const lowY = padding + (chartHeight - 2 * padding) * (1 - (candle.low - minPrice) / priceRange)

      // 绘制影线
      ctx.strokeStyle = candle.close >= candle.open ? '#22c55e' : '#ef4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.stroke()

      // 绘制实体
      const isGreen = candle.close >= candle.open
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444'
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY))

      // 绘制边框
      ctx.strokeStyle = isGreen ? '#16a34a' : '#dc2626'
      ctx.strokeRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY))
    })

    // 绘制移动平均线
    if (showMA) {
      const maPeriod = 20
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = maPeriod - 1; i < chartData.length; i++) {
        const sum = chartData.slice(i - maPeriod + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
        const ma = sum / maPeriod
        const x = padding + i * candleSpacing + candleSpacing * 0.1 + candleWidth / 2
        const y = padding + (chartHeight - 2 * padding) * (1 - (ma - minPrice) / priceRange)

        if (i === maPeriod - 1) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    // 绘制成交量
    if (showVolume) {
      const volumeHeight = 60
      const volumeY = chartHeight - volumeHeight - 20
      const maxVolume = Math.max(...chartData.map(d => d.volume))

      chartData.forEach((candle, index) => {
        const x = padding + index * candleSpacing + candleSpacing * 0.1
        const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight
        const volumeBarY = volumeY + volumeHeight - volumeBarHeight

        ctx.fillStyle = candle.close >= candle.open ? '#22c55e' : '#ef4444'
        ctx.fillRect(x, volumeBarY, candleWidth, volumeBarHeight)
      })
    }

    // 绘制RSI
    if (showRSI) {
      const rsiData = calculateRSI(chartData)
      const rsiY = chartHeight + 20
      const rsiHeight = height - chartHeight - 40

      // RSI背景
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(padding, rsiY, width - 2 * padding, rsiHeight)

      // RSI线
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 2
      ctx.beginPath()

      rsiData.forEach((rsi, index) => {
        const x = padding + (index + 14) * candleSpacing + candleSpacing * 0.1 + candleWidth / 2
        const y = rsiY + rsiHeight - (rsi / 100) * rsiHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // RSI超买超卖线
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(padding, rsiY + rsiHeight * 0.2)
      ctx.lineTo(width - padding, rsiY + rsiHeight * 0.2)
      ctx.moveTo(padding, rsiY + rsiHeight * 0.8)
      ctx.lineTo(width - padding, rsiY + rsiHeight * 0.8)
      ctx.stroke()
      ctx.setLineDash([])

      // RSI标签
      ctx.fillStyle = '#666'
      ctx.font = '10px Arial'
      ctx.fillText('80', width - 30, rsiY + 15)
      ctx.fillText('20', width - 30, rsiY + rsiHeight - 5)
    }

    // 绘制悬停信息
    if (hoveredCandle) {
      const index = chartData.findIndex(d => d === hoveredCandle)
      if (index !== -1) {
        const x = padding + index * candleSpacing + candleSpacing * 0.1 + candleWidth / 2
        const y = padding + (chartHeight - 2 * padding) * (1 - (hoveredCandle.close - minPrice) / priceRange)

        // 绘制十字线
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, chartHeight - padding - (showVolume ? 80 : 0))
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        ctx.setLineDash([])

        // 绘制信息框
        const info = `O: ${hoveredCandle.open.toFixed(2)} H: ${hoveredCandle.high.toFixed(2)} L: ${hoveredCandle.low.toFixed(2)} C: ${hoveredCandle.close.toFixed(2)}`
        const infoWidth = ctx.measureText(info).width + 20
        const infoX = Math.min(x + 10, width - infoWidth - 10)
        const infoY = Math.max(y - 40, 20)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
        ctx.fillRect(infoX, infoY, infoWidth, 30)
        ctx.fillStyle = '#fff'
        ctx.font = '12px Arial'
        ctx.fillText(info, infoX + 10, infoY + 20)
      }
    }

    // 绘制FOMO指示器
    const currentPrice = chartData[chartData.length - 1].close
    const priceChange = ((currentPrice - chartData[0].close) / chartData[0].close) * 100
    setFomoLevel(Math.min(Math.max(priceChange / 10, 0), 100))

    // 绘制FOMO条
    const fomoBarWidth = 20
    const fomoBarHeight = chartHeight - 2 * padding
    const fomoBarX = width - padding - fomoBarWidth - 10
    const fomoBarY = padding

    // FOMO背景
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(fomoBarX, fomoBarY, fomoBarWidth, fomoBarHeight)

    // FOMO进度
    const fomoProgress = (fomoLevel / 100) * fomoBarHeight
    const gradient = ctx.createLinearGradient(fomoBarX, fomoBarY + fomoBarHeight, fomoBarX, fomoBarY)
    gradient.addColorStop(0, '#22c55e')
    gradient.addColorStop(0.5, '#f59e0b')
    gradient.addColorStop(1, '#ef4444')

    ctx.fillStyle = gradient
    ctx.fillRect(fomoBarX, fomoBarY + fomoBarHeight - fomoProgress, fomoBarWidth, fomoProgress)

    // FOMO标签
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('FOMO', fomoBarX + fomoBarWidth / 2, fomoBarY - 10)
    ctx.fillText(`${fomoLevel.toFixed(0)}%`, fomoBarX + fomoBarWidth / 2, fomoBarY + fomoBarHeight + 20)
    ctx.textAlign = 'left'
  }, [currentChart, hoveredCandle, showVolume, showMA, showRSI, fomoLevel])

  // 每1秒自动切换图表类型
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentChart((prev) => (prev + 1) % chartTypes.length)
        setIsAnimating(false)
      }, 300)
    }, 1000)

    return () => clearInterval(interval)
  }, [chartTypes.length])

  // 绘制动画
  useEffect(() => {
    drawChart()
    animationRef.current = requestAnimationFrame(() => drawChart())
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drawChart])

  // 鼠标事件处理
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const chartData = charts[currentChart].data
    const width = canvas.width
    const padding = 80
    const candleSpacing = (width - 2 * padding) / chartData.length

    const index = Math.floor((x - padding) / candleSpacing)
    if (index >= 0 && index < chartData.length) {
      setHoveredCandle(chartData[index])
    } else {
      setHoveredCandle(null)
    }
  }

  const handleCanvasMouseLeave = () => {
    setHoveredCandle(null)
  }

  // 交易功能
  const executeTrade = (type: 'buy' | 'sell') => {
    if (!connected) {
      alert('请先连接钱包')
      return
    }

    const currentPrice = charts[currentChart].data[charts[currentChart].data.length - 1].close
    const amount = Math.random() * 100 + 10

    const newTrade: TradeData = {
      type,
      price: currentPrice,
      amount,
      timestamp: Date.now()
    }

    setTrades(prev => [newTrade, ...prev.slice(0, 9)])
  }

  // 设置价格提醒
  const setAlert = () => {
    const currentPrice = charts[currentChart].data[charts[currentChart].data.length - 1].close
    const alertPrice = prompt(`设置价格提醒 (当前价格: $${currentPrice.toFixed(2)})`, currentPrice.toString())
    if (alertPrice) {
      setPriceAlert(parseFloat(alertPrice))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          📊 专业FOMO K线图
        </h2>
        <p className="text-gray-300 text-lg">
          图表类型每1秒自动切换 | 鼠标悬停查看详细数据 | FOMO指数实时更新
        </p>
      </div>

      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce-slow">{charts[currentChart].emoji}</div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-gradient">
            {charts[currentChart].type}
          </h3>
                      <p className="text-gray-700 text-lg">{charts[currentChart].description}</p>
        </div>

        {/* Control Panel */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white/10 border border-purple-500/30 rounded px-3 py-1 text-white"
            >
              <option value="1M">1 Minute</option>
              <option value="5M">5 Minutes</option>
              <option value="15M">15 Minutes</option>
              <option value="1H">1 Hour</option>
              <option value="4H">4 Hours</option>
              <option value="1D">1 Day</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showVolume"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showVolume" className="text-gray-300">Volume</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMA"
              checked={showMA}
              onChange={(e) => setShowMA(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showMA" className="text-gray-300">MA</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRSI"
              checked={showRSI}
              onChange={(e) => setShowRSI(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showRSI" className="text-gray-300">RSI</label>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="w-full h-auto border border-gray-600 rounded-lg cursor-crosshair"
          />
        </div>

        {/* Trading Panel */}
        <div className="mt-6 dumbstrategy-card rounded-lg p-4 dumbstrategy-glow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">🚀 Quick Trade</h4>
            <div className="flex items-center space-x-2">
              {!connected ? (
                <SimpleWalletButton />
              ) : (
                <span className="text-green-400 text-sm animate-pulse">✅ Connected</span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => executeTrade('buy')}
              disabled={!connected}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              🟢 Buy
            </button>
            <button
              onClick={() => executeTrade('sell')}
              disabled={!connected}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              🔴 Sell
            </button>
            <button
              onClick={setAlert}
              className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              ⏰ Set Alert
            </button>
          </div>
        </div>

        {/* Trade History */}
        {trades.length > 0 && (
          <div className="mt-4 dumbstrategy-card rounded-lg p-4 dumbstrategy-glow">
            <h4 className="text-white font-semibold mb-2">📋 Trade History</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trades.map((trade, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className={`font-semibold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.type === 'buy' ? '🟢 Buy' : '🔴 Sell'}
                  </span>
                  <span className="text-white">${trade.price.toFixed(2)}</span>
                  <span className="text-gray-400">{trade.amount.toFixed(2)} SOL</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Type Selector */}
        <div className="flex justify-center space-x-4 mt-6">
          {charts.map((chart, index) => (
            <button
              key={index}
              onClick={() => setCurrentChart(index)}
                              className={`p-3 rounded-lg transition-all duration-300 ${
                  currentChart === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow animate-glow'
                    : 'bg-white/10 text-gray-700 hover:bg-white/20 hover:shadow-neon'
                }`}
            >
              {chart.type}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">

          <div className="flex justify-center mt-4 space-x-2">
            {charts.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  currentChart === index ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

              {/* FOMO Status Indicator */}
      <div className="dumbstrategy-card rounded-2xl p-6 dumbstrategy-glow">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">🔥 FOMO Index</h3>
          <div className="text-4xl font-bold text-green-400 animate-pulse">{fomoLevel.toFixed(0)}%</div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-4 rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${fomoLevel}%` }}
            />
          </div>
          <p className="text-gray-700">
            {fomoLevel > 80 ? '🚀 Extreme FOMO! Get on board!' :
             fomoLevel > 60 ? '📈 Strong FOMO! Rare opportunity!' :
             fomoLevel > 40 ? '😐 Moderate FOMO, trade carefully' :
             fomoLevel > 20 ? '😴 Light FOMO, stay calm' : '💤 No FOMO, market calm'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotAChart 