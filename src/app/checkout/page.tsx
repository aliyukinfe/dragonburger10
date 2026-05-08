'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Truck, User, Mail, Phone, MapPin, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface OrderData {
  items: any[]
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  specialInstructions: string
  deliveryAddress?: string
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { clearCart } = useCartStore()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cash' | 'card'>('telebirr')
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Load order data from localStorage
    const savedOrderData = localStorage.getItem('dragonOrderData')
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData))
    } else {
      router.push('/cart')
    }

    // Pre-fill customer info if logged in
    if (profile) {
      setCustomerInfo(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      }))
    }
  }, [profile, router])

  const handleTelebirrPayment = async () => {
    if (!orderData) return

    setIsProcessing(true)
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id || null,
          order_number: `DB${Date.now()}`,
          status: 'pending',
          order_type: orderData.orderType,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          delivery_fee: orderData.deliveryFee,
          total_amount: orderData.total,
          special_instructions: orderData.specialInstructions,
          delivery_address: orderData.deliveryAddress || null
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_instructions: item.special_instructions || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: 'telebirr',
          amount: orderData.total,
          status: 'pending'
        })

      if (paymentError) throw paymentError

      // Simulate Telebirr payment initiation
      // In real implementation, this would call Telebirr API
      const telebirrResponse = await simulateTelebirrPayment({
        amount: orderData.total,
        orderId: order.id,
        customerPhone: customerInfo.phone,
        customerName: customerInfo.fullName
      })

      if (telebirrResponse.success) {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'processing',
            transaction_id: telebirrResponse.transactionId,
            payment_response: telebirrResponse
          })
          .eq('order_id', order.id)

        toast.success('Payment initiated! Check your Telebirr app.')
        
        // Redirect to payment confirmation page
        router.push(`/payment-confirmation?orderId=${order.id}`)
      } else {
        throw new Error('Payment initiation failed')
      }

    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateTelebirrPayment = async (paymentData: any) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful payment initiation
    return {
      success: true,
      transactionId: `TB${Date.now()}`,
      message: 'Payment initiated successfully'
    }
  }

  const handleCashOrCardPayment = async () => {
    if (!orderData) return

    setIsProcessing(true)
    try {
      // Similar order creation logic as above
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id || null,
          order_number: `DB${Date.now()}`,
          status: 'confirmed',
          order_type: orderData.orderType,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          delivery_fee: orderData.deliveryFee,
          total_amount: orderData.total,
          special_instructions: orderData.specialInstructions,
          delivery_address: orderData.deliveryAddress || null
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: orderData.total,
          status: 'completed'
        })

      if (paymentError) throw paymentError

      toast.success('Order placed successfully!')
      clearCart()
      localStorage.removeItem('dragonOrderData')
      router.push(`/order-confirmation?orderId=${order.id}`)

    } catch (error) {
      console.error('Order error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (paymentMethod === 'telebirr') {
      await handleTelebirrPayment()
    } else {
      await handleCashOrCardPayment()
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dragon-gray rounded-2xl border border-orange-900/20 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-orange-500" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+251 911 123 456"
                    required
                  />
                </div>

                {orderData.orderType === 'delivery' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={orderData.deliveryAddress || customerInfo.address}
                      onChange={(e) => {
                        setCustomerInfo(prev => ({ ...prev, address: e.target.value }))
                        // Also update orderData if needed
                      }}
                      className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="123 Dragon Street, Addis Ababa, Ethiopia"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dragon-gray rounded-2xl border border-orange-900/20 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

              <div className="space-y-4">
                {[
                  {
                    id: 'telebirr',
                    name: 'Telebirr',
                    icon: <Smartphone className="w-5 h-5" />,
                    description: 'Pay with Ethiopian mobile money'
                  },
                  {
                    id: 'cash',
                    name: 'Cash on Delivery',
                    icon: <Truck className="w-5 h-5" />,
                    description: 'Pay when you receive your order'
                  },
                  {
                    id: 'card',
                    name: 'Credit/Debit Card',
                    icon: <CreditCard className="w-5 h-5" />,
                    description: 'Pay with your card'
                  }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-orange-900/20 hover:border-orange-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-400'
                      }`}>
                        {paymentMethod === method.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="text-orange-500">{method.icon}</div>
                      <div>
                        <div className="text-white font-medium">{method.name}</div>
                        <div className="text-sm text-gray-400">{method.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
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

              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-orange-900/20 pt-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (15%)</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                {orderData.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Fee</span>
                    <span>${orderData.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-orange-900/20">
                  <span>Total</span>
                  <span className="text-orange-500">${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'telebirr' ? 'Pay with Telebirr' : 'Place Order'}
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-dragon-black rounded-lg border border-orange-900/20">
                <p className="text-xs text-gray-400 text-center">
                  By placing this order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}
