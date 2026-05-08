'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Bell, Check, ChefHat, Clock, Users, RefreshCw, Wifi, WifiOff, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  order_type: 'dine_in' | 'takeaway'
  total_amount: number
  table_number?: string
  special_instructions?: string
  created_at: string
  order_items: { quantity: number; menu_items: { name: string } | null }[]
}

const STATUS_CONFIG = {
  pending:   { label: '待确认', en: 'Pending',   bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  confirmed: { label: '已确认', en: 'Confirmed', bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  preparing: { label: '制作中', en: 'Preparing', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  ready:     { label: '已就绪', en: 'Ready',     bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30' },
  completed: { label: '已完成', en: 'Done',      bg: 'bg-gray-500/15',   text: 'text-gray-400',   border: 'border-gray-500/30' },
  cancelled: { label: '已取消', en: 'Cancelled', bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30' },
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

export default function WaiterPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [filter, setFilter] = useState<string>('active')
  const [alertOrders, setAlertOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
    const sub = supabase.channel('waiter-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders()
        if (payload.eventType === 'INSERT') {
          setAlertOrders(prev => new Set([...prev, (payload.new as any).id]))
          playAlert()
          toast.success('🔔 新订单！', { duration: 4000 })
        }
        if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'ready') {
          toast.success(`✅ 订单 #${(payload.new as any).order_number} 已就绪`, { duration: 4000 })
        }
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))
    return () => { sub.unsubscribe() }
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(quantity, menu_items(name))')
      .not('status', 'in', '(completed,cancelled)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const playAlert = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880; osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      osc.start(); osc.stop(ctx.currentTime + 0.6)
    } catch {}
  }

  const updateStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) {
      toast.success(`状态已更新: ${STATUS_CONFIG[status].label}`)
      setAlertOrders(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  const filteredOrders = filter === 'active'
    ? orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
    : orders

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const readyCount = orders.filter(o => o.status === 'ready').length

  return (
    <div className="min-h-screen bg-cn-dark font-cn">
      {/* Header */}
      <div className="glass-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cn-gradient flex items-center justify-center">🐉</div>
          <div>
            <div className="text-white font-bold">服务员台</div>
            <div className="text-[10px] text-cn-gold">Waiter Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex items-center gap-1 bg-cn-red/20 border border-cn-red/40 text-cn-red rounded-full px-2 py-1 text-xs font-bold">
              <Bell className="w-3 h-3" />{pendingCount} 待确认
            </motion.div>
          )}
          <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-400' : 'text-gray-500'}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? '实时' : '离线'}
          </div>
          <button onClick={fetchOrders} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {[
          { label: '待确认', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-400' },
          { label: '制作中', value: orders.filter(o => o.status === 'preparing').length, color: 'text-orange-400' },
          { label: '已就绪', value: orders.filter(o => o.status === 'ready').length, color: 'text-green-400' },
          { label: '今日总数', value: orders.length, color: 'text-cn-gold' },
        ].map((stat, i) => (
          <div key={i} className="bg-cn-card border border-cn-border rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-[10px] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Ready Alert Banner */}
      <AnimatePresence>
        {readyCount > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mx-4 mb-3 bg-green-500/15 border border-green-500/40 rounded-xl p-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-400 text-sm font-bold font-cn">{readyCount} 个订单已就绪，请上桌！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders */}
      <div className="px-4 pb-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-cn">暂无活跃订单</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const sc = STATUS_CONFIG[order.status]
            const isAlert = alertOrders.has(order.id)
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-cn-card rounded-2xl border ${isAlert ? 'border-cn-red animate-pulse-red' : 'border-cn-border'} p-4`}>
                {/* Order Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">#{order.order_number}</span>
                    {order.table_number && (
                      <span className="bg-cn-red/20 text-cn-red text-xs px-2 py-0.5 rounded-full font-cn border border-cn-red/30">
                        桌 {order.table_number}
                      </span>
                    )}
                    <span className={`${sc.bg} ${sc.text} ${sc.border} border text-xs px-2 py-0.5 rounded-full font-cn`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {timeAgo(order.created_at)}
                  </div>
                </div>
                {/* Items */}
                <div className="text-gray-300 text-xs mb-3 font-cn space-y-0.5">
                  {order.order_items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex gap-1">
                      <span className="text-cn-red font-bold">{item.quantity}×</span>
                      <span>{item.menu_items?.name || '—'}</span>
                    </div>
                  ))}
                  {(order.order_items?.length || 0) > 4 && (
                    <div className="text-gray-500">+{(order.order_items?.length || 0) - 4} 更多...</div>
                  )}
                </div>
                {order.special_instructions && (
                  <div className="bg-cn-surface rounded-lg px-2 py-1 text-xs text-cn-gold font-cn mb-3">
                    备注: {order.special_instructions}
                  </div>
                )}
                {/* Price + Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-cn-red font-bold text-base">¥{order.total_amount?.toFixed(0)}</span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(order.id, 'confirmed')}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-cn font-bold hover:bg-blue-600 transition-colors">
                          确认
                        </button>
                        <button onClick={() => updateStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 bg-cn-surface border border-cn-border text-gray-400 text-xs rounded-lg font-cn hover:border-cn-red hover:text-cn-red transition-colors">
                          取消
                        </button>
                      </>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => updateStatus(order.id, 'completed')}
                        className="px-4 py-1.5 bg-green-500 text-white text-xs rounded-lg font-cn font-bold hover:bg-green-600 transition-colors flex items-center gap-1">
                        <Check className="w-3 h-3" />已上桌
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
