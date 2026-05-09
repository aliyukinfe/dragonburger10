import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DragonBurger - 龙堡餐厅',
  description: 'Premium Chinese QR restaurant ordering system',
  manifest: '/manifest.json',
  other: { 'apple-mobile-web-app-capable': 'yes', 'apple-mobile-web-app-status-bar-style': 'black-translucent' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isOrderPage = pathname.startsWith('/order/') || pathname.startsWith('/order-success')
  const isKitchenOrWaiter = pathname.startsWith('/kitchen') || pathname.startsWith('/waiter')
  const hideChrome = isOrderPage || isKitchenOrWaiter

  return (
    <html lang="zh" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#050508" />
      </head>
      <body className={`${inter.variable} font-sans bg-cyber-dark text-cyber-text min-h-screen antialiased`}>
        <AuthProvider>
          {hideChrome ? (
            <>{children}</>
          ) : (
            <div className="flex flex-col min-h-screen relative">
              {/* Cyber grid background */}
              <div className="fixed inset-0 bg-cyber-grid-bg pointer-events-none z-0 opacity-50" />
              <div className="fixed inset-0 bg-gradient-to-b from-cyber-dark/50 via-transparent to-cyber-dark/80 pointer-events-none z-0" />
              <Navbar />
              <main className="flex-1 relative z-10">{children}</main>
              <Footer />
            </div>
          )}
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 15, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              color: '#e0e0ff',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)',
              fontSize: '14px',
            },
            success: {
              style: {
                border: '1px solid rgba(0, 255, 170, 0.4)',
                boxShadow: '0 0 30px rgba(0, 255, 170, 0.1)',
              },
              iconTheme: { primary: '#00ffaa', secondary: '#0f0f1a' },
            },
            error: {
              style: {
                border: '1px solid rgba(255, 0, 64, 0.4)',
                boxShadow: '0 0 30px rgba(255, 0, 64, 0.1)',
              },
              iconTheme: { primary: '#ff0040', secondary: '#0f0f1a' },
            },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
