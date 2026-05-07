import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'dragon burger -restaurant',
  description: 'Dragon Burger Restaurant Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
