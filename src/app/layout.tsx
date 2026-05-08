import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DragonBurger - Premium Restaurant',
  description: 'Experience the best burgers in town with DragonBurger - Premium restaurant management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #ff6b35',
              },
              success: {
                style: {
                  background: '#059669',
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
