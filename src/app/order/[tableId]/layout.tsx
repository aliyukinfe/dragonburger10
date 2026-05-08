import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'DragonBurger | 扫码点餐',
  description: 'Scan & order at your table',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1f1111',
            color: '#f5f5f5',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Noto Sans SC, Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </>
  )
}
