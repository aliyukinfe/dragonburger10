'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, ChefHat, Bell, Home, RotateCcw } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

interface OrderStatus {
  id: string
  order_number: string
  status: string
  total_amount: number
  estimated_time: number | null
  created_at: string
  table_number?: string
}

const STATUS_STEPS = [
  { key: 'pending', label: '已收到', zh: '已收到', icon: '✅', color: '#dc2626' },
  { key: 'preparing', label: 'Preparing', zh: '制作中', icon: '👨‍🍳', color: '#d97706' },
  { key: 'ready', label: 'Ready', zh: '可取餐', icon: '🔔', color: '#16a34a' },
  { key: 'completed', label: 'Served', zh: '已上桌', icon: '🎉', color: '#7c3aed' },
]

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart, tableId } = useCartStore()
  const orderId = searchParams.get('orderId')
  const tableIdParam = searchParams.get('tableId') || tableId
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    clearCart()
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    if (orderId) {
      fetchOrder(orderId)
      const sub = supabase.channel(`order-${orderId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          payload => setOrder(prev => prev ? { ...prev, status: payload.new.status } : prev)
        ).subscribe()
      return () => { sub.unsubscribe() }
    } else {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchOrder = async (id: string) => {
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single()
      if (data) setOrder(data)
    } catch { } finally { setLoading(false) }
  }

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : 0

  const orderNum = order?.order_number || `DB${Date.now().toString().slice(-6)}`
  const tableNum = tableIdParam || '1'

  return (
    <div className="min-h-screen bg-cn-dark flex flex-col items-center justify-start font-cn" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Confetti Particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
              initial={{ y: -20, x: Math.random() * 400, opacity: 1, scale: 0 }}
              animate={{ y: '100vh', opacity: 0, scale: 1, rotate: Math.random() * 720 }}
              transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.5 }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ background: ['#dc2626','#d97706','#fbbf24','#16a34a','#7c3aed'][i % 5] }} />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="w-full glass-header px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-cn-gradient flex items-center justify-center text-sm">🐉</div>
        <div>
          <div className="text-white font-bold text-sm">DragonBurger</div>
          <div className="text-cn-gold text-[10px]">桌号 {tableNum}</div>
        </div>
      </div>

      <div className="flex-1 w-full px-4 py-6 space-y-5">

        {/* Big Success Animation */}
        <div className="text-center py-6">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-cn-red to-cn-red-dark mx-auto mb-4 flex items-center justify-center shadow-xl shadow-cn-red/40">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}>
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="text-white text-2xl font-bold mb-1">下单成功！</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-gray-400 text-sm">Order placed successfully</motion.p>
        </div>

        {/* Order Info Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-cn-card rounded-2xl border border-cn-border p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-gray-400 text-[10px] mb-1 font-cn">订单号</div>
              <div className="text-cn-red font-bold text-sm font-mono">{orderNum}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px] mb-1 font-cn">桌号</div>
              <div className="text-white font-bold text-sm">桌 {tableNum}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px] mb-1 font-cn">预计时间</div>
              <div className="text-cn-gold font-bold text-sm flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                {order?.estimated_time || 15}分钟
              </div>
            </div>
          </div>
          {order?.total_amount && (
            <div className="border-t border-cn-border mt-3 pt-3 text-center">
              <span className="text-gray-400 text-xs">总金额 </span>
              <span className="text-cn-red font-bold text-lg">¥{order.total_amount.toFixed(0)}</span>
            </div>
          )}
        </motion.div>

        {/* Order Status Tracker */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="bg-cn-card rounded-2xl border border-cn-border p-4">
          <h3 className="text-white font-bold text-sm mb-4 font-cn">实时订单状态</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-cn-border" />
            <div className="absolute left-5 top-5 w-0.5 bg-cn-red transition-all duration-1000"
              style={{ height: `${Math.min(currentStepIndex / (STATUS_STEPS.length - 1), 1) * 100}%` }} />
            <div className="space-y-4">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex
                const isActive = i === currentStepIndex
                return (
                  <motion.div key={step.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.15 }}
                    className="flex items-center gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-500 ${isActive ? 'animate-pulse-red' : ''} ${isCompleted ? 'bg-cn-red shadow-lg shadow-cn-red/30' : 'bg-cn-surface border border-cn-border'}`}>
                      <span>{step.icon}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-cn transition-colors ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.zh}</p>
                      {isActive && (
                        <p className="text-cn-gold text-[10px] font-cn">进行中...</p>
                      )}
                    </div>
                    {isActive && (
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        className="ml-auto text-cn-gold">
                        <div className="w-2 h-2 rounded-full bg-cn-gold" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Kitchen Message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="flex items-center gap-3 bg-cn-surface rounded-xl border border-cn-border/50 p-3">
          <div className="w-10 h-10 rounded-full bg-cn-gold/20 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-cn-gold" />
          </div>
          <div>
            <p className="text-white text-xs font-bold font-cn">厨师正在精心准备您的美食</p>
            <p className="text-gray-400 text-[10px] font-cn mt-0.5">Chef is carefully preparing your order</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
          className="grid grid-cols-2 gap-3">
          <Link href={`/order/${tableNum}`}
            className="flex items-center justify-center gap-2 h-12 bg-cn-gradient text-white rounded-xl font-bold text-sm font-cn shadow-lg shadow-cn-red/20">
            <RotateCcw className="w-4 h-4" />
            继续点餐
          </Link>
          <Link href="/"
            className="flex items-center justify-center gap-2 h-12 bg-cn-surface border border-cn-border text-gray-300 rounded-xl font-bold text-sm font-cn hover:border-cn-red hover:text-white transition-all">
            <Home className="w-4 h-4" />
            返回主页
          </Link>
        </motion.div>

        {/* Dragon Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="text-center py-4">
          <div className="text-3xl mb-1">🐉</div>
          <p className="text-gray-500 text-[10px] font-cn">感谢光临龙堡餐厅 · Thank you for dining at DragonBurger</p>
        </motion.div>
      </div>
    </div>
  )
}
