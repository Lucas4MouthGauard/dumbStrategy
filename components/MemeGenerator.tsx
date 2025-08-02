'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'

interface MemeTemplate {
  id: string
  name: string
  emoji: string
  description: string
  background: string
  textStyle: {
    top: { fontSize: number; color: string; fontWeight: string }
    bottom: { fontSize: number; color: string; fontWeight: string }
  }
  textPositions: {
    top: { x: number; y: number }
    bottom: { x: number; y: number }
  }
}

interface GeneratedMeme {
  id: string
  template: string
  topText: string
  bottomText: string
  tokenName: string
  imageUrl: string
  timestamp: number
  likes: number
  shares: number
}

const MemeGenerator = () => {
  const { publicKey, connected } = useWallet()
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMemes, setGeneratedMemes] = useState<GeneratedMeme[]>([])
  const [activeTab, setActiveTab] = useState<'create' | 'gallery' | 'trending'>('create')
  const [filterCategory, setFilterCategory] = useState('all')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 热门Meme模板
  const memeTemplates: MemeTemplate[] = [
    {
      id: 'doge',
      name: 'Doge',
      emoji: '🐕',
      description: '经典Doge表情包',
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      textStyle: {
        top: { fontSize: 48, color: '#000', fontWeight: 'bold' },
        bottom: { fontSize: 48, color: '#000', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 80 },
        bottom: { x: 50, y: 320 }
      }
    },
    {
      id: 'pepe',
      name: 'Pepe',
      emoji: '🐸',
      description: 'Pepe青蛙',
      background: 'linear-gradient(45deg, #00FF00, #32CD32)',
      textStyle: {
        top: { fontSize: 44, color: '#FFF', fontWeight: 'bold' },
        bottom: { fontSize: 44, color: '#FFF', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 60 },
        bottom: { x: 50, y: 340 }
      }
    },
    {
      id: 'wojak',
      name: 'Wojak',
      emoji: '😢',
      description: '悲伤Wojak',
      background: 'linear-gradient(45deg, #808080, #A9A9A9)',
      textStyle: {
        top: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
        bottom: { fontSize: 40, color: '#FFF', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 70 },
        bottom: { x: 50, y: 330 }
      }
    },
    {
      id: 'chad',
      name: 'Chad',
      emoji: '💪',
      description: 'Chad强者',
      background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
      textStyle: {
        top: { fontSize: 46, color: '#FFF', fontWeight: 'bold' },
        bottom: { fontSize: 46, color: '#FFF', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 75 },
        bottom: { x: 50, y: 325 }
      }
    },
    {
      id: 'diamond-hands',
      name: '钻石手',
      emoji: '💎',
      description: '钻石手HODL',
      background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
      textStyle: {
        top: { fontSize: 42, color: '#FFF', fontWeight: 'bold' },
        bottom: { fontSize: 42, color: '#FFF', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 65 },
        bottom: { x: 50, y: 335 }
      }
    },
    {
      id: 'rocket',
      name: '火箭',
      emoji: '🚀',
      description: '火箭起飞',
      background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
      textStyle: {
        top: { fontSize: 44, color: '#FFF', fontWeight: 'bold' },
        bottom: { fontSize: 44, color: '#FFF', fontWeight: 'bold' }
      },
      textPositions: {
        top: { x: 50, y: 70 },
        bottom: { x: 50, y: 330 }
      }
    }
  ]

  // 热门Token建议
  const popularTokens = [
    'SOL', 'BONK', 'JUP', 'WIF', 'POPCAT', 'BOOK', 'MYRO', 'BOME', 'DOGE', 'SHIB',
    'PEPE', 'FLOKI', 'BABYDOGE', 'SAFEMOON', 'ELON', 'MOON', 'ROCKET', 'LAMBO'
  ]

  // 热门Meme文案
  const popularTexts = {
    top: [
      '当你的币',
      '看到价格',
      '别人卖出',
      '你还在',
      'FOMO买入',
      '钻石手',
      'HODL',
      'TO THE MOON',
      'WAGMI',
      'NGMI'
    ],
    bottom: [
      '涨了1000%',
      '暴跌90%',
      '你还在HODL',
      '别人已经财富自由',
      '你还在犹豫',
      '永不卖出',
      '永远相信',
      '🚀🚀🚀',
      '💎🙌',
      '😭😭😭'
    ]
  }

  // 生成Meme
  const generateMeme = async () => {
    if (!selectedTemplate && !uploadedImage) {
      alert('请选择模板或上传图片')
      return
    }

    if (!tokenName.trim()) {
      alert('请输入Token名称')
      return
    }

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 设置画布尺寸
      canvas.width = 600
      canvas.height = 400

      // 绘制背景
      if (selectedTemplate) {
        const gradient = ctx.createLinearGradient(0, 0, 600, 400)
        gradient.addColorStop(0, '#FFD700')
        gradient.addColorStop(1, '#FFA500')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 600, 400)

        // 绘制模板图标
        ctx.font = '120px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillText(selectedTemplate.emoji, 300, 200)
      } else if (uploadedImage) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 600, 400)
          drawText(ctx)
        }
        img.src = uploadedImage
        return
      }

      // 绘制文字
      drawText(ctx)

      // 转换为图片URL
      const memeUrl = canvas.toDataURL('image/png')
      setGeneratedMeme(memeUrl)

      // 保存到历史记录
      const newMeme: GeneratedMeme = {
        id: Date.now().toString(),
        template: selectedTemplate?.name || '自定义',
        topText,
        bottomText,
        tokenName,
        imageUrl: memeUrl,
        timestamp: Date.now(),
        likes: 0,
        shares: 0
      }

      setGeneratedMemes(prev => [newMeme, ...prev.slice(0, 19)])

    } catch (error) {
      console.error('生成Meme失败:', error)
      alert('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 绘制文字
  const drawText = (ctx: CanvasRenderingContext2D) => {
    if (!selectedTemplate) return

    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 4

    // 绘制顶部文字
    if (topText) {
      ctx.font = `${selectedTemplate.textStyle.top.fontSize}px Arial`
      ctx.fillStyle = selectedTemplate.textStyle.top.color
      ctx.strokeText(topText, selectedTemplate.textPositions.top.x, selectedTemplate.textPositions.top.y)
      ctx.fillText(topText, selectedTemplate.textPositions.top.x, selectedTemplate.textPositions.top.y)
    }

    // 绘制底部文字
    if (bottomText) {
      ctx.font = `${selectedTemplate.textStyle.bottom.fontSize}px Arial`
      ctx.fillStyle = selectedTemplate.textStyle.bottom.color
      ctx.strokeText(bottomText, selectedTemplate.textPositions.bottom.x, selectedTemplate.textPositions.bottom.y)
      ctx.fillText(bottomText, selectedTemplate.textPositions.bottom.x, selectedTemplate.textPositions.bottom.y)
    }

    // 绘制Token名称
    if (tokenName) {
      ctx.font = '24px Arial'
      ctx.fillStyle = '#FFF'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.strokeText(tokenName, 300, 380)
      ctx.fillText(tokenName, 300, 380)
    }
  }

  // 上传图片
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setSelectedTemplate(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // 下载Meme
  const downloadMeme = () => {
    if (!generatedMeme) return

    const link = document.createElement('a')
    link.download = `nostrategy-meme-${tokenName}-${Date.now()}.png`
    link.href = generatedMeme
    link.click()
  }

  // 分享Meme
  const shareMeme = async () => {
    if (!generatedMeme) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `NoStrategy Meme - ${tokenName}`,
          text: `看看我制作的${tokenName} Meme！`,
          url: window.location.href
        })
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(`NoStrategy Meme - ${tokenName}: ${window.location.href}`)
        alert('链接已复制到剪贴板！')
      }
    } catch (error) {
      console.error('分享失败:', error)
    }
  }

  // 点赞Meme
  const likeMeme = (memeId: string) => {
    setGeneratedMemes(prev => 
      prev.map(meme => 
        meme.id === memeId ? { ...meme, likes: meme.likes + 1 } : meme
      )
    )
  }

  // 随机生成文案
  const generateRandomText = () => {
    const randomTop = popularTexts.top[Math.floor(Math.random() * popularTexts.top.length)]
    const randomBottom = popularTexts.bottom[Math.floor(Math.random() * popularTexts.bottom.length)]
    setTopText(randomTop)
    setBottomText(randomBottom)
  }

  // 随机选择Token
  const generateRandomToken = () => {
    const randomToken = popularTokens[Math.floor(Math.random() * popularTokens.length)]
    setTokenName(randomToken)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient">
          🎭 DumbStrategy Meme Generator
        </h2>
        <p className="text-gray-700 text-lg">
          Upload emoji + Enter token, generate "some coin" memes
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex justify-center space-x-4 mb-6">
        {[
          { id: 'create', name: '🎨 Create Meme', emoji: '🎨' },
          { id: 'gallery', name: '🖼️ My Works', emoji: '🖼️' },
          { id: 'trending', name: '🔥 Trending', emoji: '🔥' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow animate-glow'
                    : 'bg-white/10 text-gray-700 hover:bg-white/20 hover:shadow-neon'
                }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="dumbstrategy-card rounded-2xl p-8 dumbstrategy-glow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：编辑区域 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">🎨 Edit Meme</h3>

              {/* 模板选择 */}
              <div>
                <label className="block text-gray-300 mb-3">Select Template</label>
                <div className="grid grid-cols-3 gap-3">
                  {memeTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template)
                        setUploadedImage(null)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{template.emoji}</div>
                      <div className="text-sm text-gray-300">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 上传图片 */}
              <div>
                <label className="block text-gray-300 mb-3">Or Upload Custom Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors text-gray-300"
                >
                  📁 Click to Upload Image
                </button>
              </div>

              {/* Token名称 */}
              <div>
                <label className="block text-gray-300 mb-3">Token Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value.toUpperCase())}
                    placeholder="Enter token name, e.g.: SOL"
                    className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={generateRandomToken}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    🎲 Random
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularTokens.slice(0, 8).map(token => (
                    <button
                      key={token}
                      onClick={() => setTokenName(token)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-gray-300"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字编辑 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-3">Top Text</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="Enter top text"
                      className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    />
                    <button
                      onClick={() => setTopText(popularTexts.top[Math.floor(Math.random() * popularTexts.top.length)])}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-3">Bottom Text</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="Enter bottom text"
                      className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    />
                    <button
                      onClick={() => setBottomText(popularTexts.bottom[Math.floor(Math.random() * popularTexts.bottom.length)])}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <button
                  onClick={generateRandomText}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold"
                >
                  🎲 随机生成文案
                </button>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={generateMeme}
                disabled={isGenerating || (!selectedTemplate && !uploadedImage)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-lg"
              >
                {isGenerating ? '🎨 Generating...' : '🎨 Generate Meme'}
              </button>
            </div>

            {/* 右侧：预览区域 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">👀</h3>

              {/* 画布预览 */}
              <div className="bg-white/5 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border border-gray-600 rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </div>

              {/* 生成结果 */}
              {generatedMeme && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <img
                      src={generatedMeme}
                      alt="Generated Meme"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={downloadMeme}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                      💾 Download
                    </button>
                    <button
                      onClick={shareMeme}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                      📤 Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-6">🖼️ 我的作品</h3>
          
          {generatedMemes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-300 text-lg">还没有作品，快去创建一个吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedMemes.map(meme => (
                <div key={meme.id} className="bg-white/5 rounded-lg p-4 space-y-3">
                  <img
                    src={meme.imageUrl}
                    alt={`${meme.tokenName} Meme`}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{meme.tokenName}</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(meme.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => likeMeme(meme.id)}
                        className="flex items-center space-x-1 text-gray-300 hover:text-red-400"
                      >
                        <span>❤️</span>
                        <span>{meme.likes}</span>
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedMeme(meme.imageUrl)
                          setActiveTab('create')
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        重新编辑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-6">🔥 热门Meme</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { token: 'SOL', likes: 1234, shares: 567, image: '🚀' },
              { token: 'BONK', likes: 987, shares: 432, image: '🐕' },
              { token: 'JUP', likes: 765, shares: 321, image: '🪐' },
              { token: 'WIF', likes: 654, shares: 234, image: '🐕' },
              { token: 'POPCAT', likes: 543, shares: 123, image: '🐱' },
              { token: 'BOOK', likes: 432, shares: 98, image: '📚' }
            ].map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="text-6xl text-center">{item.image}</div>
                <div className="text-center space-y-2">
                  <div className="text-white font-semibold text-lg">{item.token}</div>
                  <div className="flex justify-center space-x-4 text-sm text-gray-400">
                    <span>❤️ {item.likes}</span>
                    <span>📤 {item.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4">💡 使用提示</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <p>• 选择模板或上传自定义图片</p>
            <p>• 输入Token名称和文案</p>
            <p>• 使用随机生成功能获得灵感</p>
          </div>
          <div>
            <p>• 下载生成的Meme图片</p>
            <p>• 分享到社交媒体</p>
            <p>• 查看历史作品和热门Meme</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemeGenerator 