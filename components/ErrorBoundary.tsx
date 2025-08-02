'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary 捕获到错误:', error)
    console.error('错误信息:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 text-center max-w-md">
            <div className="text-6xl mb-4">🚨</div>
                               <h1 className="text-2xl font-bold text-white mb-4">An Error Occurred</h1>
                   <p className="text-gray-300 mb-6">
                     Sorry, the website encountered an error. This may be due to wallet connection issues or browser extension conflicts.
                   </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                                       Refresh Page
              </button>
              <div className="text-sm text-gray-400">
                                     <p>If the problem persists, try:</p>
                     <ul className="mt-2 space-y-1">
                       <li>• Disable wallet extensions</li>
                       <li>• Clear browser cache</li>
                       <li>• Use incognito mode</li>
                     </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 