'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Clock,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalMenuItems: number
  todayOrders: number
  todayRevenue: number
  averageOrderValue: number
  pendingOrders: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalMenuItems: 0,
    todayOrders: 0,
    todayRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get total orders and revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
      
      const totalOrders = ordersData?.length || 0
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      
      // Get today's orders
      const today = new Date().toISOString().split('T')[0]
      const { data: todayOrdersData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today)
      
      const todayOrdersCount = todayOrdersData?.length || 0
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      
      // Get pending orders
      const { data: pendingOrdersData } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending')
      
      const pendingOrdersCount = pendingOrdersData?.length || 0
      
      // Get total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      // Get total menu items
      const { count: menuItemsCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
      
      // Get recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customers!inner(
            full_name
          ),
          total_amount,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers: customersCount || 0,
        totalMenuItems: menuItemsCount || 0,
        todayOrders: todayOrdersCount,
        todayRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pendingOrders: pendingOrdersCount
      })

      setRecentOrders(recentOrdersData?.map(order => ({
        ...order,
        customer_name: (order.customers as any)?.full_name || 'Guest'
      })) || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Orders',
            value: stats.totalOrders,
            change: stats.todayOrders,
            changeType: 'increase' as const,
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            change: `$${stats.todayRevenue.toFixed(2)}`,
            changeType: 'increase' as const,
            icon: DollarSign,
            color: 'from-green-500 to-green-600'
          },
          {
            title: 'Total Customers',
            value: stats.totalCustomers,
            change: '+12%',
            changeType: 'increase' as const,
            icon: Users,
            color: 'from-purple-500 to-purple-600'
          },
          {
            title: 'Menu Items',
            value: stats.totalMenuItems,
            change: '+3',
            changeType: 'increase' as const,
            icon: Package,
            color: 'from-orange-500 to-orange-600'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dragon-gray rounded-xl border border-orange-900/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Average Order Value',
            value: `$${stats.averageOrderValue.toFixed(2)}`,
            icon: DollarSign,
            description: 'Per order average'
          },
          {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            description: 'Orders awaiting processing'
          },
          {
            title: 'Today\'s Performance',
            value: `${stats.todayOrders} orders`,
            icon: TrendingUp,
            description: `$${stats.todayRevenue.toFixed(2)} revenue`
          }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-dragon-gray rounded-xl border border-orange-900/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            </div>
            <p className="text-2xl font-bold text-orange-500 mb-1">{item.value}</p>
            <p className="text-sm text-gray-400">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dragon-gray rounded-xl border border-orange-900/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <button
            onClick={() => window.location.href = '/admin/orders'}
            className="text-orange-500 hover:text-orange-400 transition-colors text-sm"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/20">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Order #</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="border-b border-orange-900/10 hover:bg-dragon-light transition-colors"
                >
                  <td className="py-3 px-4 text-white font-medium">
                    #{order.order_number}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {order.customer_name}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent orders</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
