import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '../components/SimpleWalletProvider'
import ErrorBoundary from '../components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DumbStrategy - Meme Site Mocking MicroStrategy',
  description: 'DumbStrategy - A meme site dedicated to mocking MicroStrategy, helping retail investors find resonance!',
  keywords: 'DumbStrategy, meme, MicroStrategy, cryptocurrency, retail investors',
  icons: {
            icon: '/logos/DumbStr.png',
        shortcut: '/logos/DumbStr.png',
        apple: '/logos/DumbStr.png',
  },
  manifest: '/manifest.json',
      openGraph: {
      title: 'DumbStrategy - Meme Site Mocking MicroStrategy',
      description: 'Strategy is fake, feeling is real!',
      type: 'website',
      url: 'https://nostrategy.com',
      siteName: 'DumbStrategy',
      images: [
        {
          url: '/logos/DumbStr.png',
          width: 32,
          height: 32,
          alt: 'DumbStrategy Logo'
        }
      ]
    },
  twitter: {
    card: 'summary',
    title: 'DumbStrategy - Meme Site Mocking MicroStrategy',
    description: 'Strategy is fake, feeling is real!',
            images: ['/logos/DumbStr.png']
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7C3AED',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 