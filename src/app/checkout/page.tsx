'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, User, Phone, Check, Loader2, Banknote, Smartphone, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'

interface LegacyOrderData {
  items: any[]
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  specialInstructions: string
  deliveryAddress?: string
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

const PAYMENT_METHODS = [
  { id: 'cash',     label: '现金',    labelEn: 'Cash',        icon: '💵', desc: '现场付款',         descEn: 'Pay at table/counter' },
  { id: 'telebirr', label: 'Telebirr', labelEn: 'Telebirr',   icon: '📱', desc: '埃塞俄比亚移动支付', descEn: 'Ethiopian mobile money' },
  { id: 'wechat',   label: '微信支付', labelEn: 'WeChat Pay',  icon: '💚', desc: '微信扫码支付',       descEn: 'WeChat QR payment' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const { items: cartItems, getTotalPrice, getTotalItems, clearCart, tableId: storeTableId, orderType: storeOrderType } = useCartStore()

  const tableIdParam = searchParams.get('tableId') || storeTableId
  const orderTypeParam = (searchParams.get('type') as 'dine_in' | 'takeaway') || storeOrderType
  const isQrFlow = Boolean(tableIdParam)

  const [legacyData, setLegacyData] = useState<LegacyOrderData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'telebirr' | 'wechat' | 'card'>('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'info' | 'payment'>('info')

  useEffect(() => {
    if (!isQrFlow) {
      const saved = localStorage.getItem('dragonOrderData')
      if (saved) setLegacyData(JSON.parse(saved))
      else router.push('/cart')
    }
    if (profile) {
      setCustomerName(profile.full_name || '')
      setCustomerPhone((profile as any).phone || '')
    }
  }, [profile, isQrFlow, router])

  const activeItems = isQrFlow ? cartItems : (legacyData?.items || [])
  const subtotal = isQrFlow ? getTotalPrice() : (legacyData?.subtotal || 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax
  const totalQty = isQrFlow ? getTotalItems() : activeItems.reduce((s: number, i: any) => s + i.quantity, 0)

  const placeOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('请填写姓名和电话 / Please enter name and phone')
      return
    }
    if (activeItems.length === 0) {
      toast.error('购物车为空 / Cart is empty')
      return
    }

    setIsProcessing(true)
    try {
      const orderNumber = `DB${Date.now().toString().slice(-8)}`
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_id: user?.id || null,
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
        order_type: orderTypeParam || 'dine_in',
        subtotal,
        tax,
        delivery_fee: 0,
        discount: 0,
        total_amount: total,
        special_instructions: notes || null,
        table_number: tableIdParam || null,
      }).select().single()

      if (orderError) {
        // Offline-friendly: create a mock order if Supabase not set up
        const mockOrderId = `mock-${Date.now()}`
        clearCart()
        if (!isQrFlow) localStorage.removeItem('dragonOrderData')
        router.push(`/order-success?orderId=${mockOrderId}&tableId=${tableIdParam || ''}`)
        return
      }

      await supabase.from('order_items').insert(
        activeItems.map((item: any) => ({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          special_instructions: item.special_instructions || null,
        }))
      )

      await supabase.from('payments').insert({
        order_id: order.id,
        payment_method: paymentMethod === 'wechat' ? 'mobile_banking' : paymentMethod as any,
        amount: total,
        status: paymentMethod === 'cash' ? 'pending' : 'processing',
      })

      clearCart()
      if (!isQrFlow) localStorage.removeItem('dragonOrderData')
      toast.success('下单成功！/ Order placed!')
      router.push(`/order-success?orderId=${order.id}&tableId=${tableIdParam || ''}`)
    } catch (err) {
      console.error(err)
      // Fallback for no-Supabase demo
      clearCart()
      router.push(`/order-success?orderId=demo-${Date.now()}&tableId=${tableIdParam || ''}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isQrFlow && !legacyData) {
    return (
      <div className="min-h-screen bg-cn-dark flex items-center justify-center font-cn">
        <Loader2 className="w-8 h-8 text-cn-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cn-dark font-cn" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-header px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-sm">确认订单</div>
          <div className="text-cn-gold text-[10px]">
            {tableIdParam ? `桌号 ${tableIdParam} · ` : ''}{orderTypeParam === 'dine_in' ? '堂食' : '打包'} · {totalQty} 件
          </div>
        </div>
        <div className="text-cn-red font-bold">¥{total.toFixed(0)}</div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Order Items Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cn-card rounded-2xl border border-cn-border overflow-hidden">
          <div className="px-4 py-3 border-b border-cn-border flex items-center justify-between">
            <span className="text-white font-bold font-cn text-sm">订单明细</span>
            <span className="text-gray-400 text-xs">{totalQty} 件商品</span>
          </div>
          <div className="divide-y divide-cn-border/30">
            {activeItems.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-cn-red text-xs font-bold w-6">{item.quantity}×</span>
                  <span className="text-gray-200 text-sm font-cn">{item.name_zh || item.name}</span>
                </div>
                <span className="text-white text-sm font-bold">¥{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-cn-border space-y-1">
            <div className="flex justify-between text-gray-400 text-xs font-cn">
              <span>小计</span><span>¥{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-xs font-cn">
              <span>税费 (5%)</span><span>¥{tax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base font-cn pt-1 border-t border-cn-border">
              <span>合计</span><span className="text-cn-red">¥{total.toFixed(0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Customer Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-cn-card rounded-2xl border border-cn-border p-4">
          <h3 className="text-white font-bold text-sm mb-3 font-cn flex items-center gap-2">
            <User className="w-4 h-4 text-cn-red" />顾客信息
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs font-cn block mb-1">姓名 *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-cn-red font-cn transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-cn block mb-1">电话 *</label>
              <div className="flex gap-2">
                <div className="bg-cn-surface border border-cn-border rounded-xl px-3 flex items-center text-gray-400 text-sm">+251</div>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="911 123 456" type="tel"
                  className="flex-1 bg-cn-surface border border-cn-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-cn-red font-cn transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-cn block mb-1">备注（选填）</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="特殊要求请备注..." rows={2}
                className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 outline-none focus:border-cn-red font-cn resize-none transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-cn-card rounded-2xl border border-cn-border p-4">
          <h3 className="text-white font-bold text-sm mb-3 font-cn flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cn-red" />支付方式
          </h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(method => (
              <button key={method.id} onClick={() => setPaymentMethod(method.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  paymentMethod === method.id
                    ? 'border-cn-red bg-cn-red/10 shadow-md shadow-cn-red/10'
                    : 'border-cn-border bg-cn-surface hover:border-cn-red/50'
                }`}>
                <span className="text-2xl w-8 text-center">{method.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-bold font-cn">{method.label}</div>
                  <div className="text-gray-400 text-[10px] font-cn">{method.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === method.id ? 'border-cn-red bg-cn-red' : 'border-gray-500'
                }`}>
                  {paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* WeChat Pay Style QR (if selected) */}
        <AnimatePresence>
          {paymentMethod === 'wechat' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-cn-card rounded-2xl border border-green-500/30 p-4 overflow-hidden">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-xl flex items-center justify-center mb-2 text-3xl">📱</div>
                <p className="text-green-400 text-xs font-cn">使用微信扫一扫付款</p>
                <p className="text-gray-400 text-[10px] font-cn mt-1">金额: <span className="text-cn-red font-bold">¥{total.toFixed(0)}</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Place Order CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={placeOrder} disabled={isProcessing}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 bg-cn-gradient text-white font-bold rounded-2xl text-base font-cn shadow-xl shadow-cn-red/30 flex items-center justify-center gap-3 ripple disabled:opacity-60">
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>处理中...</span></>
          ) : (
            <><span>提交订单</span><span className="text-cn-gold text-lg">¥{total.toFixed(0)}</span></>
          )}
        </motion.button>

        <p className="text-center text-gray-500 text-[10px] font-cn pb-4">
          提交即表示您同意我们的服务条款 · By ordering you agree to our terms
        </p>
      </div>
    </div>
  )
}
