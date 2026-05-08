'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Menu,
  LogOut,
  TrendingUp,
  FileText,
  Truck,
  QrCode,
  ChefHat,
  Utensils
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tables', label: 'Tables & QR', icon: QrCode },
  { href: '/admin/menu', label: 'Menu Management', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/drivers', label: 'Delivery Drivers', icon: Truck },
  { href: '/admin/inventory', label: 'Inventory', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/kitchen', label: 'Kitchen Display', icon: ChefHat },
  { href: '/waiter', label: 'Waiter Dashboard', icon: Utensils },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-dragon-black flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dragon-gray border-r border-orange-900/20 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-orange-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {sidebarOpen && (
              <span className="text-white font-bold text-xl">DragonBurger</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-dragon-light hover:text-orange-500'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-orange-900/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center space-x-3 px-3 py-2 text-gray-300 hover:bg-dragon-light hover:text-orange-500 rounded-lg transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && (
              <span>Toggle Sidebar</span>
            )}
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-dragon-light hover:text-red-500 rounded-lg transition-all duration-200 mt-2"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-dragon-gray border-b border-orange-900/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {adminNavItems.find(item => item.href === pathname)?.label || 'Admin Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Admin Panel
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
