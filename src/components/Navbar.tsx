'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useCartStore, CartItem } from '@/store/cartStore'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { items } = useCartStore()
  
  const cartItemCount = items.reduce((total: number, item: CartItem) => total + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-md border-b border-orange-900/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-white font-bold text-xl group-hover:text-orange-500 transition-colors">
              DragonBurger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-orange-500 transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-gray-300 hover:text-orange-500 transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-300 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-300 hover:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{profile?.full_name || 'User'}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-dragon-gray border border-orange-900/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/profile" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-dragon-light hover:text-orange-500 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-dragon-light hover:text-orange-500 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  {profile?.role === 'staff' && (
                    <Link href="/kitchen" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-dragon-light hover:text-orange-500 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Kitchen</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-dragon-light hover:text-red-500 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-orange-500 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-dragon-gray border-t border-orange-900/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                Home
              </Link>
              <Link href="/menu" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                Menu
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                Contact
              </Link>
              <Link href="/cart" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                Cart ({cartItemCount})
              </Link>
              
              {user ? (
                <>
                  <Link href="/profile" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                    Profile
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                      Admin
                    </Link>
                  )}
                  {profile?.role === 'staff' && (
                    <Link href="/kitchen" className="block px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-dragon-light rounded-lg transition-colors">
                      Kitchen
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-500 hover:bg-dragon-light rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="block px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-center">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
