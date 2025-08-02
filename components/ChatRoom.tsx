'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from './SimpleWalletProvider'
import SimpleWalletButton from './SimpleWalletButton'

interface ChatMessage {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: number
  type: 'text' | 'meme' | 'strategy' | 'chart'
  imageUrl?: string
  likes: number
  isLiked: boolean
}

interface ChatRoom {
  id: string
  name: string
  emoji: string
  description: string
  userCount: number
  messages: ChatMessage[]
}

const ChatRoom = () => {
  const { publicKey, connected } = useWallet()
  const [message, setMessage] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('general')
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: 'general',
      name: 'General Discussion',
      emoji: '💬',
      description: 'General discussion and chat',
      userCount: 156,
      messages: []
    },
    {
      id: 'strategy',
      name: 'Strategy Sharing',
      emoji: '📈',
      description: 'Share investment strategies and insights',
      userCount: 89,
      messages: []
    },
    {
      id: 'meme',
      name: 'Meme Sharing',
      emoji: '🎭',
      description: 'Share interesting memes',
      userCount: 234,
      messages: []
    },
    {
      id: 'charts',
      name: 'Chart Analysis',
      emoji: '📊',
      description: 'Discuss technical analysis and charts',
      userCount: 67,
      messages: []
    },
    {
      id: 'news',
      name: 'News & Info',
      emoji: '📰',
      description: 'Cryptocurrency news and information',
      userCount: 123,
      messages: []
    }
  ])

  // 模拟用户头像
  const userAvatars = ['🐕', '🐸', '🚀', '💎', '🔥', '⭐', '🌙', '⚡', '🎯', '🏆']

  // 模拟消息数据
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      user: 'DogeMaster',
      avatar: '🐕',
      message: 'SOL is pumping again today! 🚀',
      timestamp: Date.now() - 300000,
      type: 'text',
      likes: 12,
      isLiked: false
    },
    {
      id: '2',
      user: 'PepeTrader',
      avatar: '🐸',
      message: 'My strategy: HODL to the moon!',
      timestamp: Date.now() - 240000,
      type: 'strategy',
      likes: 8,
      isLiked: false
    },
    {
      id: '3',
      user: 'RocketMan',
      avatar: '🚀',
      message: 'Just shared a new meme, what do you think?',
      timestamp: Date.now() - 180000,
      type: 'meme',
      likes: 15,
      isLiked: false
    },
    {
      id: '4',
      user: 'DiamondHands',
      avatar: '💎',
      message: 'This chart looks very promising!',
      timestamp: Date.now() - 120000,
      type: 'chart',
      likes: 6,
      isLiked: false
    }
  ]

  // 获取当前聊天室
  const currentRoom = chatRooms.find(room => room.id === selectedRoom)

  // 初始化消息
  useEffect(() => {
    if (currentRoom && currentRoom.messages.length === 0) {
      setChatRooms(prev => prev.map(room => 
        room.id === selectedRoom 
          ? { ...room, messages: mockMessages }
          : room
      ))
    }
  }, [selectedRoom, currentRoom])

  // 模拟在线用户数
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(Math.floor(Math.random() * 50) + 100)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentRoom?.messages])

  // 发送消息
  const sendMessage = () => {
    if (!message.trim() || !connected) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: publicKey?.toString().slice(0, 8) + '...' || 'Anonymous',
      avatar: userAvatars[Math.floor(Math.random() * userAvatars.length)],
      message: message.trim(),
      timestamp: Date.now(),
      type: 'text',
      likes: 0,
      isLiked: false
    }

    setChatRooms(prev => prev.map(room => 
      room.id === selectedRoom 
        ? { ...room, messages: [...room.messages, newMessage] }
        : room
    ))

    setMessage('')
  }

  // 点赞消息
  const likeMessage = (messageId: string) => {
    setChatRooms(prev => prev.map(room => ({
      ...room,
      messages: room.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1, isLiked: !msg.isLiked }
          : msg
      )
    })))
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  if (!connected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-4">Real-time Chat Room</h2>
          <p className="text-gray-300 mb-6">Connect wallet to join discussions</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">💬 Real-time Chat Room</h1>
          <p className="text-gray-300">Discuss strategies and share memes with other users</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-white font-semibold">{onlineUsers} Online</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <SimpleWalletButton />
        </div>
      </div>

      {/* 聊天界面 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 聊天室列表 */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">🏠 Chat Rooms</h3>
            <div className="space-y-2">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedRoom === room.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{room.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{room.name}</div>
                      <div className="text-sm opacity-75">{room.description}</div>
                    </div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded">
                      {room.userCount}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="lg:col-span-3">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl h-[600px] flex flex-col">
            {/* 聊天室标题 */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentRoom?.emoji}</span>
                <div>
                  <h3 className="font-bold text-white">{currentRoom?.name}</h3>
                  <p className="text-sm text-gray-400">{currentRoom?.description}</p>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentRoom?.messages.map((msg) => (
                <div key={msg.id} className="flex space-x-3">
                  <div className="text-2xl">{msg.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white">{msg.user}</span>
                      <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                      {msg.type !== 'text' && (
                        <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                          {msg.type === 'meme' ? '🎭' : msg.type === 'strategy' ? '📈' : '📊'}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-200 mb-2">{msg.message}</p>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Shared content"
                          className="w-full max-w-xs rounded-lg mb-2"
                        />
                      )}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => likeMessage(msg.id)}
                          className={`flex items-center space-x-1 text-sm transition-all ${
                            msg.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <span>{msg.isLiked ? '❤️' : '🤍'}</span>
                          <span>{msg.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type message..."
                  className="flex-1 bg-black/30 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom 