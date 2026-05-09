'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled
        ? 'glass border-b border-neon-cyan/10'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-orange to-neon-red rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-neon-orange/20">
              <span className="text-white font-bold text-lg sm:text-xl">D</span>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl group-hover:text-neon-cyan transition-colors">
              DragonBurger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/menu', label: 'Menu' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neon-cyan group-hover:w-1/2 transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 text-gray-300 hover:text-neon-cyan transition-colors rounded-xl hover:bg-neon-cyan/5">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-neon-orange to-neon-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce-in">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-neon-cyan transition-colors rounded-xl hover:bg-neon-cyan/5">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{profile?.full_name || 'User'}</span>
                </button>

                <div className="absolute right-0 mt-2 w-52 glass rounded-xl shadow-2xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-neon-cyan/10 overflow-hidden">
                  <Link href="/profile" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-neon-cyan/5 hover:text-neon-cyan transition-colors text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-neon-cyan/5 hover:text-neon-cyan transition-colors text-sm">
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  {profile?.role === 'staff' && (
                    <Link href="/kitchen" className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-neon-cyan/5 hover:text-neon-cyan transition-colors text-sm">
                      <Settings className="w-4 h-4" />
                      <span>Kitchen</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-neon-cyan/5 hover:text-neon-red transition-colors w-full text-left text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-gradient-to-r from-neon-orange to-neon-red text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-orange/30 transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-neon-cyan transition-colors rounded-xl hover:bg-neon-cyan/5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="glass rounded-2xl mt-2 mb-2 p-2 border border-neon-cyan/10">
            {[
              { href: '/', label: 'Home' },
              { href: '/menu', label: 'Menu' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-xl transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-xl transition-colors text-sm">
              Cart {cartItemCount > 0 && <span className="ml-1 text-neon-orange font-bold">({cartItemCount})</span>}
            </Link>

            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-xl transition-colors text-sm">
                  Profile
                </Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-xl transition-colors text-sm">
                    Admin
                  </Link>
                )}
                {profile?.role === 'staff' && (
                  <Link href="/kitchen" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-xl transition-colors text-sm">
                    Kitchen
                  </Link>
                )}
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-gray-300 hover:text-neon-red hover:bg-neon-red/5 rounded-xl transition-colors text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-neon-orange to-neon-red text-white rounded-xl text-center text-sm font-semibold mt-1">
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  )
}
