'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  Clock, 
  Check, 
  X, 
  ChefHat, 
  Bell,
  Timer,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  customer_name: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  total_amount: number
  special_instructions?: string
  delivery_address?: string
  estimated_time?: number
  created_at: string
  order_items: {
    menu_item_id: string
    quantity: number
    menu_items: {
      name: string
    }
  }[]
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('Order change:', payload)
          fetchOrders()
          
          // Play sound for new orders
          if (payload.eventType === 'INSERT' && soundEnabled) {
            playNotificationSound()
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [soundEnabled])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            menu_item_id,
            quantity,
            menu_items (
              name
            )
          ),
          customers!inner (
            full_name
          )
        `)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data?.map(order => ({
        ...order,
        customer_name: order.customers?.full_name || 'Guest'
      })) || [])

    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'preparing':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'ready':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'delivering':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <Check className="w-4 h-4" />
      case 'preparing':
        return <ChefHat className="w-4 h-4" />
      case 'ready':
        return <Timer className="w-4 h-4" />
      case 'delivering':
        return <Users className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getOrderTypeColor = (type: Order['order_type']) => {
    switch (type) {
      case 'dine_in':
        return 'bg-blue-500/20 text-blue-400'
      case 'takeaway':
        return 'bg-green-500/20 text-green-400'
      case 'delivery':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading kitchen dashboard...</div>
      </div>
    )
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const confirmedOrders = orders.filter(order => order.status === 'confirmed')
  const preparingOrders = orders.filter(order => order.status === 'preparing')
  const readyOrders = orders.filter(order => order.status === 'ready')

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-dragon-gray border-b border-orange-900/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Kitchen Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Order Counts */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</div>
                <div className="text-xs text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{confirmedOrders.length}</div>
                <div className="text-xs text-gray-400">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{preparingOrders.length}</div>
                <div className="text-xs text-gray-400">Preparing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{readyOrders.length}</div>
                <div className="text-xs text-gray-400">Ready</div>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-dragon-black text-gray-400 border border-orange-900/20'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Pending ({pendingOrders.length})
            </h2>
            {pendingOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-dragon-gray rounded-xl border ${getStatusColor(order.status)} p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">#{order.order_number}</h3>
                    <p className="text-sm text-gray-300">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getOrderTypeColor(order.order_type)}`}>
                    {order.order_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.menu_items?.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-lg font-bold text-orange-500 mb-3">
                  ${order.total_amount.toFixed(2)}
                </div>

                {order.special_instructions && (
                  <div className="mb-3 p-2 bg-dragon-black rounded text-sm text-gray-300">
                    <strong>Note:</strong> {order.special_instructions}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
            
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending orders</p>
              </div>
            )}
          </div>

          {/* Confirmed Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-400 flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Confirmed ({confirmedOrders.length})
            </h2>
            {confirmedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-dragon-gray rounded-xl border ${getStatusColor(order.status)} p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">#{order.order_number}</h3>
                    <p className="text-sm text-gray-300">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getOrderTypeColor(order.order_type)}`}>
                    {order.order_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.menu_items?.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-lg font-bold text-orange-500 mb-3">
                  ${order.total_amount.toFixed(2)}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Start Preparing
                </button>
              </motion.div>
            ))}
            
            {confirmedOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No confirmed orders</p>
              </div>
            )}
          </div>

          {/* Preparing Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-orange-400 flex items-center">
              <ChefHat className="w-5 h-5 mr-2" />
              Preparing ({preparingOrders.length})
            </h2>
            {preparingOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-dragon-gray rounded-xl border ${getStatusColor(order.status)} p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">#{order.order_number}</h3>
                    <p className="text-sm text-gray-300">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getOrderTypeColor(order.order_type)}`}>
                    {order.order_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.menu_items?.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-lg font-bold text-orange-500 mb-3">
                  ${order.total_amount.toFixed(2)}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark Ready
                </button>
              </motion.div>
            ))}
            
            {preparingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No orders being prepared</p>
              </div>
            )}
          </div>

          {/* Ready Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-400 flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Ready for Pickup ({readyOrders.length})
            </h2>
            {readyOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-dragon-gray rounded-xl border ${getStatusColor(order.status)} p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">#{order.order_number}</h3>
                    <p className="text-sm text-gray-300">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getOrderTypeColor(order.order_type)}`}>
                    {order.order_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.menu_items?.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-lg font-bold text-orange-500 mb-3">
                  ${order.total_amount.toFixed(2)}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Complete Order
                </button>
              </motion.div>
            ))}
            
            {readyOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Timer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
