'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('takeaway')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.15 // 15% tax
  const deliveryFee = orderType === 'delivery' ? 5.00 : 0
  const total = subtotal + tax + deliveryFee

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Please enter delivery address')
      return
    }

    // Store order data in localStorage for checkout page
    const orderData = {
      items,
      orderType,
      specialInstructions,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      subtotal,
      tax,
      deliveryFee,
      total
    }
    
    localStorage.setItem('dragonOrderData', JSON.stringify(orderData))
    
    // Navigate to checkout
    window.location.href = '/checkout'
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some delicious dragon burgers to get started</p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
          >
            Browse Menu
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
            {" "}Dragon Cart
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dragon-gray rounded-2xl border border-orange-900/20 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-dragon-black rounded-lg border border-orange-900/20"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">🍔</span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="text-orange-500 font-semibold">${item.price.toFixed(2)}</p>
                      {item.special_instructions && (
                        <p className="text-sm text-gray-400 mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 bg-dragon-gray rounded-lg hover:bg-dragon-light transition-colors border border-orange-900/20"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 bg-dragon-gray rounded-lg hover:bg-dragon-light transition-colors border border-orange-900/20"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total and Remove */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => {
                          removeItem(item.id)
                          toast.success('Item removed from cart')
                        }}
                        className="text-red-500 hover:text-red-400 transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Options */}
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Order Type</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'dine_in', label: 'Dine In' },
                      { value: 'takeaway', label: 'Takeaway' },
                      { value: 'delivery', label: 'Delivery' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setOrderType(type.value as any)}
                        className={`px-4 py-3 rounded-lg border transition-all duration-300 ${
                          orderType === type.value
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-dragon-black border-orange-900/20 text-gray-300 hover:border-orange-500/50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {orderType === 'delivery' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Delivery Address</h3>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address..."
                      className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                      rows={3}
                    />
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Special Instructions</h3>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or dietary requirements..."
                    className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dragon-gray rounded-2xl border border-orange-900/20 p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (15%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-orange-900/20 pt-3">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="text-orange-500">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full px-6 py-3 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  Clear Cart
                </button>
              </div>

              <div className="mt-6 p-4 bg-dragon-black rounded-lg border border-orange-900/20">
                <p className="text-sm text-gray-400 text-center">
                  <span className="text-orange-500">🔥</span> Dragon Tip: Add a drink to complete your meal!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
