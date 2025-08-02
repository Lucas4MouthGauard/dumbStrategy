import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '../components/SimpleWalletProvider'
import ErrorBoundary from '../components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NoStrategy - Meme Site Mocking MicroStrategy',
  description: 'NoStrategy - A meme site dedicated to mocking MicroStrategy, helping retail investors find resonance!',
  keywords: 'NoStrategy, meme, MicroStrategy, cryptocurrency, retail investors',
  icons: {
    icon: '/logos/NoStrategy.png',
    shortcut: '/logos/NoStrategy.png',
    apple: '/logos/NoStrategy.png',
  },
  manifest: '/manifest.json',
      openGraph: {
      title: 'NoStrategy - Meme Site Mocking MicroStrategy',
      description: 'Strategy is fake, feeling is real!',
      type: 'website',
      url: 'https://nostrategy.com',
      siteName: 'NoStrategy',
      images: [
        {
          url: '/logos/NoStrategy.png',
          width: 32,
          height: 32,
          alt: 'NoStrategy Logo'
        }
      ]
    },
  twitter: {
    card: 'summary',
    title: 'NoStrategy - Meme Site Mocking MicroStrategy',
    description: 'Strategy is fake, feeling is real!',
    images: ['/logos/NoStrategy.png']
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