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
      </head>
      <body className={`${inter.variable} font-sans bg-black text-white min-h-screen`}>
        <AuthProvider>
          {hideChrome ? (
            <>{children}</>
          ) : (
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626' },
            success: { style: { background: '#059669', border: '1px solid #10b981' } },
            error: { style: { background: '#dc2626', border: '1px solid #ef4444' } },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
