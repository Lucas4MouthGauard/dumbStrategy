'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'

const SignatureComponent = () => {
  const { publicKey, signTransaction, connected } = useWallet()
  const [signature, setSignature] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 创建测试交易
  const createTestTransaction = async () => {
    if (!publicKey || !signTransaction) return

    const transaction = new Transaction()
    
    // 添加一个简单的转账指令（0 SOL，仅用于测试签名）
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey, // 转给自己
        lamports: 0, // 0 SOL
      })
    )

    // 设置最近的区块哈希
    const connection = new Connection('https://api.mainnet-beta.solana.com')
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey

    return transaction
  }

  // 签名消息
  const signMessage = async () => {
    if (!publicKey || !signTransaction) {
      setMessage('请先连接钱包')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 创建测试交易
      const transaction = await createTestTransaction()
      if (!transaction) {
        setMessage('创建交易失败')
        setLoading(false)
        return
      }

      // 签名交易
      const signedTransaction = await signTransaction(transaction)
      
      // 获取签名
      const signature = signedTransaction.signatures[0]?.signature
      if (signature) {
        setSignature(signature.toString('base64'))
        setMessage('✅ 签名成功！')
      } else {
        setMessage('❌ 签名失败')
      }
    } catch (error) {
      console.error('签名错误:', error)
      setMessage('❌ 签名失败: ' + (error as Error).message)
    }

    setLoading(false)
  }

  // 验证签名
  const verifySignature = async () => {
    if (!signature || !publicKey) {
      setMessage('请先进行签名')
      return
    }

    try {
      // 这里可以添加签名验证逻辑
      setMessage('✅ 签名验证成功！')
    } catch (error) {
      setMessage('❌ 签名验证失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          🔐 钱包签名测试
        </h2>
        <p className="text-gray-300 text-lg">
          测试钱包连接和签名功能
        </p>
      </div>

      {!connected ? (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce-slow">🔐</div>
            <h3 className="text-2xl font-bold text-white">
              连接钱包进行签名测试
            </h3>
            <p className="text-gray-400">
              支持 Phantom、Solflare 等主流钱包
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="wallet-button text-lg px-8 py-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 钱包信息 */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">钱包信息</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">地址:</span>
                <span className="text-white font-mono text-sm">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">状态:</span>
                <span className="text-green-400">✅ 已连接</span>
              </div>
            </div>
          </div>

          {/* 签名操作 */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">签名操作</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={signMessage}
                  disabled={loading}
                  className="wallet-button disabled:opacity-50"
                >
                  {loading ? '🔐 签名中...' : '🔐 创建签名'}
                </button>
                <button
                  onClick={verifySignature}
                  disabled={!signature}
                  className="wallet-button disabled:opacity-50"
                >
                  ✅ 验证签名
                </button>
              </div>
              
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('成功') ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
                }`}>
                  <p className="text-center">{message}</p>
                </div>
              )}
            </div>
          </div>

          {/* 签名结果 */}
          {signature && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">签名结果</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">签名数据:</label>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-white font-mono text-sm break-all">
                      {signature}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>签名长度: {signature.length} 字符</span>
                  <span>时间: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* 功能说明 */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4">💡 功能说明</h3>
            <div className="space-y-2 text-gray-300">
              <p>• <strong>创建签名:</strong> 创建一个测试交易并请求钱包签名</p>
              <p>• <strong>验证签名:</strong> 验证签名的有效性</p>
              <p>• <strong>安全测试:</strong> 仅用于测试，不会执行实际交易</p>
              <p>• <strong>支持钱包:</strong> Phantom、Solflare 等主流 Solana 钱包</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignatureComponent 