'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext, useReducer } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

/* ─── CONSTANTS ─── */
const FALLBACK_MENU = [
  { id: 1, cat: 'popular', name: '招牌叉烧饭', en: 'BBQ Pork Rice', price: 38, desc: 'Glazed pork over jasmine rice with pickled veg', img: '🍚', tags: ['Bestseller'], time: 10, spicy: false },
  { id: 2, cat: 'popular', name: '蜜汁叉烧', en: 'Honey BBQ Pork', price: 58, desc: 'Slow-roasted pork belly with house honey glaze', img: '🍖', tags: ['Bestseller', 'New'], time: 15, spicy: false },
  { id: 3, cat: 'popular', name: '麻辣烫', en: 'Mala Hot Pot', price: 68, desc: 'Numbing & spicy Sichuan broth with seasonal vegetables', img: '🍲', tags: ['Spicy 🌶', 'Bestseller'], time: 20, spicy: true },
  { id: 4, cat: 'signature', name: '金龙脆皮鸡', en: 'Crispy Dragon Chicken', price: 88, desc: 'Whole free-range chicken deep-fried golden with plum sauce', img: '🍗', tags: ['Signature'], time: 25, spicy: false },
  { id: 5, cat: 'signature', name: '鲍鱼捞饭', en: 'Abalone Claypot Rice', price: 128, desc: 'Premium abalone with silky claypot rice', img: '🫙', tags: ['Signature', 'New'], time: 30, spicy: false },
  { id: 6, cat: 'signature', name: '避风塘炒蟹', en: 'Typhoon Shelter Crab', price: 168, desc: 'Stir-fried crab with crispy garlic & chilli', img: '🦀', tags: ['Signature', 'Spicy 🌶'], time: 20, spicy: true },
  { id: 7, cat: 'noodles', name: '扬州炒饭', en: 'Yangzhou Fried Rice', price: 42, desc: 'Classic fried rice with shrimp egg & roasted pork', img: '🍳', tags: ['Bestseller'], time: 8, spicy: false },
  { id: 8, cat: 'noodles', name: '干炒牛河', en: 'Dry-Fried Beef Ho Fun', price: 48, desc: 'Wok-tossed flat noodles with tender beef & bean sprouts', img: '🍜', tags: ['Bestseller'], time: 10, spicy: false },
  { id: 9, cat: 'noodles', name: '担担面', en: 'Dan Dan Noodles', price: 36, desc: 'Spicy sesame noodles with minced pork & Sichuan pepper', img: '🍝', tags: ['Spicy 🌶'], time: 10, spicy: true },
  { id: 10, cat: 'noodles', name: '猪油捞面', en: 'Lard Tossed Noodles', price: 28, desc: 'Fresh egg noodles tossed with crispy lard & soy', img: '🍜', tags: [], time: 8, spicy: false },
  { id: 11, cat: 'bbq', name: '烤羊肉串', en: 'Lamb Skewers (per pc)', price: 8, desc: 'Per skewer seasoned with cumin & chilli', img: '🍢', tags: ['Spicy 🌶'], time: 8, spicy: true },
  { id: 12, cat: 'bbq', name: '秘制烤鸡翅', en: 'Secret Sauce Wings', price: 48, desc: 'Caramelised wings with our 18-spice blend', img: '🍗', tags: ['Bestseller'], time: 15, spicy: false },
  { id: 13, cat: 'bbq', name: '蒜香烤茄子', en: 'Garlic Grilled Eggplant', price: 28, desc: 'Charred eggplant with minced garlic & scallion', img: '🍆', tags: [], time: 12, spicy: false },
  { id: 14, cat: 'snacks', name: '虾饺', en: 'Har Gow (4 pcs)', price: 32, desc: 'Crystal-skin prawn dumplings steamed to order', img: '🥟', tags: ['Bestseller'], time: 8, spicy: false },
  { id: 15, cat: 'snacks', name: '小笼包', en: 'Xiao Long Bao (6 pcs)', price: 36, desc: 'Shanghai soup dumplings pork & broth', img: '🥟', tags: ['New'], time: 12, spicy: false },
  { id: 16, cat: 'snacks', name: '锅贴', en: 'Potstickers (6 pcs)', price: 28, desc: 'Crispy bottom dumplings with pork & cabbage', img: '🥟', tags: [], time: 10, spicy: false },
  { id: 17, cat: 'snacks', name: '炸春卷', en: 'Spring Rolls (3 pcs)', price: 22, desc: 'Crispy rolls with vermicelli & vegetables', img: '🌯', tags: [], time: 8, spicy: false },
  { id: 18, cat: 'desserts', name: '芒果班戟', en: 'Mango Mille Crepe', price: 38, desc: 'Fresh mango & cream between delicate crepe layers', img: '🥭', tags: ['New'], time: 0, spicy: false },
  { id: 19, cat: 'desserts', name: '杨枝甘露', en: 'Mango Sago Pomelo', price: 28, desc: 'Chilled mango pudding with pomelo pearls & sago', img: '🍨', tags: ['Bestseller'], time: 0, spicy: false },
  { id: 20, cat: 'desserts', name: '红豆沙', en: 'Red Bean Soup', price: 18, desc: 'Warm red bean dessert soup with lotus seeds', img: '🫘', tags: [], time: 5, spicy: false },
  { id: 21, cat: 'hot', name: '香港奶茶', en: 'HK-Style Milk Tea', price: 16, desc: 'Silky blended tea with evaporated milk — classic HK style', img: '☕', tags: ['Bestseller'], time: 3, spicy: false },
  { id: 22, cat: 'hot', name: '普洱茶', en: 'Pu-erh Tea (pot)', price: 12, desc: 'Aged earthy pu-erh great for digestion', img: '🫖', tags: [], time: 2, spicy: false },
  { id: 23, cat: 'hot', name: '手冲咖啡', en: 'Pour-Over Coffee', price: 24, desc: 'Single-origin hand-drip coffee Yunnan beans', img: '☕', tags: ['New'], time: 5, spicy: false },
  { id: 24, cat: 'hot', name: '玫瑰花茶', en: 'Rose Blossom Tea (pot)', price: 18, desc: 'Fragrant dried rose petals in spring water', img: '🌹', tags: [], time: 3, spicy: false },
  { id: 25, cat: 'cold', name: '珍珠奶茶', en: 'Bubble Milk Tea', price: 22, desc: 'Brown sugar boba in creamy milk tea iced', img: '🧋', tags: ['Bestseller'], time: 3, spicy: false },
  { id: 26, cat: 'cold', name: '西瓜汁', en: 'Fresh Watermelon Juice', price: 18, desc: '100% fresh-pressed seasonal watermelon', img: '🍉', tags: [], time: 2, spicy: false },
  { id: 27, cat: 'cold', name: '杨枝甘露奶昔', en: 'Mango Pomelo Smoothie', price: 26, desc: 'Thick blended mango with pomelo and sago pearls', img: '🥤', tags: ['New'], time: 3, spicy: false },
  { id: 28, cat: 'cold', name: '荔枝玫瑰气泡水', en: 'Lychee Rose Soda', price: 20, desc: 'Sparkling water with lychee syrup and rose essence', img: '🌸', tags: [], time: 1, spicy: false },
]

const CATS = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'signature', label: 'Signature', icon: '⭐' },
  { id: 'noodles', label: 'Rice & Noodles', icon: '🍜' },
  { id: 'bbq', label: 'BBQ & Grill', icon: '🍖' },
  { id: 'snacks', label: 'Snacks', icon: '🥟' },
  { id: 'desserts', label: 'Desserts', icon: '🍮' },
  { id: 'hot', label: 'Hot Drinks', icon: '☕' },
  { id: 'cold', label: 'Cold Drinks', icon: '🧋' },
]

const ORDER_STEPS = [
  { label: 'Order Received', icon: '📋', desc: 'Kitchen got your order', color: '#6b7280' },
  { label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is getting ingredients', color: '#f59e0b' },
  { label: 'Cooking', icon: '🔥', desc: 'Your food is on the wok', color: '#f97316' },
  { label: 'Almost Ready', icon: '🍽️', desc: 'Plating & heading your way', color: '#3b82f6' },
  { label: 'Served! 🎉', icon: '✅', desc: 'Enjoy your meal!', color: '#22c55e' },
]

const STATUS_LIST = ['new', 'preparing', 'cooking', 'ready', 'served']

/* ─── CONTEXT ─── */
const Ctx = createContext<any>(null)
const useApp = () => useContext(Ctx)

const genId = () => 'GD' + Date.now().toString(36).toUpperCase().slice(-6)

function normalizeMenuItem(row: any) {
  return {
    id: row.id,
    cat: row.cat || row.category || 'popular',
    name: row.name || '',
    en: row.en || row.name_en || row.name || '',
    price: Number(row.price) || 0,
    desc: row.desc || row.description || '',
    img: row.img || row.image_emoji || '🍽️',
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ? String(row.tags).replace(/[{}"]/g, '').split(',').filter(Boolean) : []),
    time: Number(row.time || row.cook_time) || 0,
    spicy: Boolean(row.spicy),
  }
}

/* ─── CART REDUCER ─── */
function cartReducer(state: any[], action: any) {
  switch (action.type) {
    case 'ADD': {
      const ex = state.find((i: any) => i.id === action.item.id)
      if (ex) return state.map((i: any) => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'REMOVE':
      return state.map((i: any) => i.id === action.id ? { ...i, qty: i.qty - 1 } : i).filter((i: any) => i.qty > 0)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

/* ─── SUPABASE HELPERS ─── */
async function getMenu() {
  const { data, error } = await supabase.from('menu_items').select('*')
  if (error) { console.error('getMenu:', error); return [] }
  return data || []
}

async function createOrder(tableNum: string, customer: string, phone: string, total: number, note: string, paymentMode: string) {
  const { data, error } = await supabase.from('orders').insert([{ table_num: tableNum, customer_name: customer, total, status: 'new' }]).select().single()
  if (error) { console.error('createOrder:', error); return null }
  return data
}

async function addOrderItems(orderId: string, cart: any[]) {
  const items = cart.map(i => ({ order_id: orderId, name: i.en, price: i.price, qty: i.qty }))
  const { error } = await supabase.from('order_items').insert(items)
  if (error) console.error('addOrderItems:', error)
}

async function placeOrder(tableNum: string, customer: string, phone: string, total: number, note: string, paymentMode: string, cart: any[]) {
  const order = await createOrder(tableNum, customer, phone, total, note, paymentMode)
  if (!order) return null
  await addOrderItems(order.id, cart)
  return order
}

async function loadOrders() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
  if (error) { console.error('loadOrders:', error); return [] }
  return data || []
}

async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
  if (error) console.error('updateOrderStatus:', error)
}

async function deleteOrder(orderId: string) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) console.error('deleteOrder:', error)
}

/* ─── SMALL UI COMPONENTS ─── */
function Toast({ msg }: { msg: string }) {
  return <div className="toast">{msg}</div>
}

function Tag({ t }: { t: string }) {
  if (t.includes('Spicy')) return <span className="tag tag-spicy">{t}</span>
  const cls = t === 'Bestseller' ? 'tag-best' : t === 'New' ? 'tag-new' : t === 'Signature' ? 'tag-sig' : ''
  return <span className={`tag ${cls}`}>{t}</span>
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { new: '🆕 New', preparing: '👨‍🍳 Preparing', cooking: '🔥 Cooking', ready: '🍽️ Ready!', served: '✅ Served' }
  return <span className={`pill status-${status}`}>{map[status] || status}</span>
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 14, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
        <div className="skeleton" style={{ height: 10, width: '90%' }} />
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
      </div>
    </div>
  )
}

/* ─── QR MODAL ─── */
function QRModal({ table, onClose }: { table: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?table=${table}` : ''

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 1, color: { dark: '#111', light: '#fff' } })
    }
  }, [url])

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: 28, zIndex: 100, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 280 }} className="pop-in">
        <div style={{ fontSize: 28, marginBottom: 4 }}>🪑</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 2 }}>Table {table}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Scan to join this table&apos;s order</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <canvas ref={canvasRef} />
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', wordBreak: 'break-all', marginBottom: 16 }}>{url}</div>
        <button className="btn btn-red" style={{ fontSize: 13, padding: '10px' }} onClick={() => { navigator.clipboard?.writeText(url); onClose() }}>
          Copy Link & Close
        </button>
      </div>
    </>
  )
}

/* ─── MENU ITEM CARD ─── */
function MenuItem({ item }: { item: any }) {
  const { cartItems, dispatch } = useApp()
  const qty = cartItems.find((i: any) => i.id === item.id)?.qty || 0
  const [fly, setFly] = useState(false)

  const add = () => {
    dispatch({ type: 'ADD', item })
    setFly(true)
    setTimeout(() => setFly(false), 500)
  }

  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 80, height: 80, borderRadius: 14, background: 'linear-gradient(135deg,#fff7ed,#fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        {item.img}
        {fly && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 20, animation: 'fly .5s ease forwards', pointerEvents: 'none' }}>{item.img}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 3 }}>{item.tags.map((t: string) => <Tag key={t} t={t} />)}</div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', lineHeight: 1.3 }}>{item.en}</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</div>
        {item.time > 0 && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>⏱ ~{item.time} min</div>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 16 }}>¥{item.price}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {qty > 0 && (
              <>
                <button className="btn-circle-outline" onClick={() => dispatch({ type: 'REMOVE', id: item.id })}>−</button>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111', minWidth: 16, textAlign: 'center' }}>{qty}</span>
              </>
            )}
            <button className="btn-circle-red" onClick={add}>+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── SIDEBAR ─── */
function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ width: 76, flexShrink: 0, background: '#fafafa', borderRight: '1px solid #f0f0f0', overflowY: 'auto', height: 'calc(100vh - 116px)' }}>
      {CATS.map(c => (
        <button key={c.id} className="btn" onClick={() => onSelect(c.id)}
          style={{ width: '100%', padding: '12px 6px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', background: active === c.id ? '#fff' : 'transparent', borderLeft: active === c.id ? '3px solid #ff4d4f' : '3px solid transparent', color: active === c.id ? '#ff4d4f' : '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 18 }}>{c.icon}</span>
          <span style={{ fontSize: 10, fontWeight: active === c.id ? 700 : 400, lineHeight: 1.2 }}>{c.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── CART DRAWER ─── */
function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const { cartItems, dispatch, showCart, setShowCart } = useApp()
  const total = cartItems.reduce((s: number, i: any) => s + i.price * i.qty, 0)
  if (!showCart) return null
  return (
    <>
      <div className="overlay" onClick={() => setShowCart(false)} />
      <div className="cart-drawer slide-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>My Order</span>
          <button className="btn" onClick={() => dispatch({ type: 'CLEAR' })} style={{ fontSize: 12, color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', background: '#fff' }}>Clear all</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
          {cartItems.length === 0
            ? <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Your cart is empty</div>
            : cartItems.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: 22 }}>{item.img}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{item.en}</div>
                  <div style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 700 }}>¥{item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn-circle-outline" onClick={() => dispatch({ type: 'REMOVE', id: item.id })}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                  <button className="btn-circle-red" onClick={() => dispatch({ type: 'ADD', item })}>+</button>
                </div>
              </div>
            ))}
        </div>
        {cartItems.length > 0 && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ff4d4f' }}>¥{total}</span>
            </div>
            <button className="btn btn-red" onClick={() => { setShowCart(false); onCheckout() }}>Place Order →</button>
          </div>
        )}
      </div>
    </>
  )
}

/* ─── FLOAT CART ─── */
function FloatCart({ onOpen }: { onOpen: () => void }) {
  const { cartItems } = useApp()
  const count = cartItems.reduce((s: number, i: any) => s + i.qty, 0)
  const total = cartItems.reduce((s: number, i: any) => s + i.price * i.qty, 0)
  if (!count) return null
  return (
    <button className="float-cart fade-in" onClick={onOpen}>
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: 24 }}>🛒</span>
        <span className="float-badge">{count}</span>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 11, opacity: .8, lineHeight: 1 }}>{count} item{count > 1 ? 's' : ''}</div>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>¥{total}</div>
      </div>
    </button>
  )
}

/* ─── SHARE BANNER ─── */
function ShareBanner({ table, onQR }: { table: string; onQR: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?table=${table}` : ''
  const copy = () => {
    navigator.clipboard?.writeText(url).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ margin: '8px 12px', background: 'linear-gradient(135deg,#fff1f2,#fff7ed)', border: '1px solid #fecdd3', borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 22 }}>👥</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Share Table {table} with friends</div>
        <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
      </div>
      <button className="btn btn-sm" onClick={onQR} style={{ background: '#fff', color: '#ff4d4f', border: '1px solid #fecdd3', marginRight: 4 }}>QR</button>
      <button className="btn btn-sm" onClick={copy} style={{ background: copied ? '#22c55e' : '#ff4d4f', color: '#fff' }}>
        {copied ? '✓' : 'Share'}
      </button>
    </div>
  )
}

/* ─── MENU PAGE ─── */
function MenuPage({ onCheckout }: { onCheckout: () => void }) {
  const { tableNum, setShowCart } = useApp()
  const [activeCat, setActiveCat] = useState('popular')
  const [search, setSearch] = useState('')
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuSource, setMenuSource] = useState('')
  const [showQR, setShowQR] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const secRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const rows = await getMenu()
        if (rows && rows.length > 0) { setMenu(rows.map(normalizeMenuItem)); setMenuSource('supabase') }
        else { setMenu(FALLBACK_MENU); setMenuSource('fallback') }
      } catch (e) { console.error('Menu load failed:', e); setMenu(FALLBACK_MENU); setMenuSource('fallback') }
      setLoading(false)
    })()
  }, [])

  const filtered = search ? menu.filter((i: any) => i.en.toLowerCase().includes(search.toLowerCase()) || i.name.includes(search)) : menu

  const grouped = CATS.reduce((a: any, c) => {
    const items = filtered.filter((i: any) => i.cat === c.id)
    if (items.length) a[c.id] = items
    return a
  }, {})

  const scrollTo = (id: string) => {
    setActiveCat(id)
    secRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onScroll = useCallback(() => {
    const el = menuRef.current
    if (!el) return
    const top = el.scrollTop
    for (const id of Object.keys(secRefs.current)) {
      const s = secRefs.current[id]
      if (s && s.offsetTop - 12 <= top) setActiveCat(id)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '12px 14px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 26 }}>🐉</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111', lineHeight: 1.2 }}>Golden Dragon Restaurant</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              ⭐ 4.8 · Table <span style={{ color: '#ff4d4f', fontWeight: 700 }}>{tableNum}</span>
              {menuSource === 'supabase' && <span style={{ marginLeft: 6, color: '#22c55e' }}>● Live</span>}
              {menuSource === 'fallback' && <span style={{ marginLeft: 6, color: '#f59e0b' }}>● Offline</span>}
            </div>
          </div>
          <div style={{ fontSize: 11, background: '#fff1f2', color: '#ff4d4f', padding: '5px 10px', borderRadius: 10, fontWeight: 700 }}>🪑 T-{tableNum}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…" />
          {search && (
            <button className="btn" onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af', background: 'none', border: 'none' }}>✕</button>
          )}
        </div>
      </div>

      {!search && <ShareBanner table={tableNum} onQR={() => setShowQR(true)} />}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!search && <Sidebar active={activeCat} onSelect={scrollTo} />}
        <div ref={menuRef} onScroll={onScroll} style={{ flex: 1, overflowY: 'auto', padding: '0 12px', paddingBottom: 100 }}>
          {loading && [...Array(5)].map((_, i) => <Skeleton key={i} />)}

          {!loading && search && (
            <>
              <div style={{ fontSize: 11, color: '#9ca3af', padding: '8px 0' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
              {filtered.map((i: any) => <MenuItem key={i.id} item={i} />)}
            </>
          )}

          {!loading && !search && Object.entries(grouped).map(([id, items]: [string, any]) => {
            const cat = CATS.find(c => c.id === id)
            return (
              <div key={id} ref={el => { secRefs.current[id] = el }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 16, paddingBottom: 6 }}>
                  <span style={{ fontSize: 15 }}>{cat?.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>{cat?.label}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>({items.length})</span>
                </div>
                {items.map((i: any) => <MenuItem key={i.id} item={i} />)}
              </div>
            )
          })}

          {!loading && !search && Object.keys(grouped).length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
              <div style={{ fontSize: 14 }}>Menu unavailable</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Please ask staff for assistance</div>
            </div>
          )}
        </div>
      </div>

      <FloatCart onOpen={() => setShowCart(true)} />
      <CartDrawer onCheckout={onCheckout} />
      {showQR && <QRModal table={tableNum} onClose={() => setShowQR(false)} />}
    </div>
  )
}

/* ─── CHECKOUT ─── */
function CheckoutPage({ onBack, onPay, submitting }: { onBack: () => void; onPay: (mode: string, note: string, total: number, cart: any[]) => void; submitting: boolean }) {
  const { cartItems, tableNum } = useApp()
  const [note, setNote] = useState('')
  const sub = cartItems.reduce((s: number, i: any) => s + i.price * i.qty, 0)
  const svc = Math.round(sub * 0.1)
  const total = sub + svc
  const count = cartItems.reduce((s: number, i: any) => s + i.qty, 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 50, overflowY: 'auto', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <button className="btn" onClick={onBack} style={{ fontSize: 20, color: '#6b7280', background: 'none', border: 'none', width: 32 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>Confirm Order</span>
      </div>

      <div style={{ padding: '12px 14px 120px' }}>
        <div className="card">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>📍 Dine-in</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>Table {tableNum}</div>
            <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✓ Order goes directly to kitchen</div>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13, fontWeight: 700, color: '#374151' }}>
            {count} item{count !== 1 ? 's' : ''}
          </div>
          {cartItems.map((i: any) => (
            <div key={i.id} className="card-row">
              <span style={{ fontSize: 20, marginRight: 10 }}>{i.img}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#111' }}>{i.en}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>× {i.qty}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>¥{i.price * i.qty}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Special Requests</div>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Allergies, spice level, no MSG…" />
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '14px 16px' }}>
            {[['Subtotal', `¥${sub}`], ['Service charge (10%)', `¥${svc}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#111' }}>
              <span style={{ fontSize: 15 }}>Grand Total</span>
              <span style={{ fontSize: 20, color: '#ff4d4f' }}>¥{total}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-red" onClick={() => onPay('now', note, total, cartItems)} disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="spinning">⏳</span> Sending to kitchen…</span> : `Pay Now — ¥${total}`}
        </button>
        <button className="btn btn-ghost" onClick={() => onPay('later', note, total, cartItems)} disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
          Pay at Counter Later
        </button>
      </div>
    </div>
  )
}

/* ─── PAYMENT ─── */
function PaymentScreen({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [method, setMethod] = useState('wechat')
  const [paying, setPaying] = useState(false)

  const METHODS = [
    { id: 'wechat', label: 'WeChat Pay', icon: '💬', color: '#16a34a', rec: true },
    { id: 'alipay', label: 'Alipay', icon: '🔵', color: '#2563eb', rec: false },
    { id: 'cash', label: 'Cash', icon: '💵', color: '#374151', rec: false },
  ]

  const pay = () => {
    setPaying(true)
    setTimeout(() => { setPaying(false); onSuccess() }, 1800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 50, overflowY: 'auto', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(160deg,#ff4d4f,#e03333)', color: '#fff', padding: '48px 24px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Amount Due</div>
        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>¥{total}</div>
        <div style={{ fontSize: 12, opacity: .65, marginTop: 6 }}>Table dine-in · Golden Dragon</div>
      </div>

      <div style={{ padding: '14px 14px 120px' }}>
        <div className="card">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13, fontWeight: 700, color: '#374151' }}>Payment Method</div>
          {METHODS.map(m => (
            <label key={m.id} className="card-row" style={{ cursor: 'pointer' }}>
              <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} style={{ marginRight: 12 }} />
              <span style={{ fontSize: 20, marginRight: 8 }}>{m.icon}</span>
              <span style={{ fontWeight: 600, color: m.color, flex: 1 }}>{m.label}</span>
              {m.rec && <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 12, fontWeight: 600 }}>Recommended</span>}
            </label>
          ))}
        </div>

        {method !== 'cash' && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📲</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Open {method === 'wechat' ? 'WeChat' : 'Alipay'} and scan to pay</div>
            <div style={{ width: 140, height: 140, margin: '16px auto 0', background: '#f3f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e7eb' }}>
              <span style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', lineHeight: 1.5 }}>QR Code</span>
            </div>
          </div>
        )}
        {method === 'cash' && (
          <div className="card fade-in" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💵</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Please bring ¥{total} to the counter</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>Staff will confirm your payment</div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '14px 16px' }}>
        <button className="btn btn-red" onClick={pay} disabled={paying} style={{ opacity: paying ? 0.7 : 1 }}>
          {paying ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="spinning">⏳</span> Processing…</span> : `Confirm Payment ¥${total}`}
        </button>
      </div>
    </div>
  )
}

/* ─── ORDER SUCCESS ─── */
function OrderSuccess({ orderId, total, items, payLater, onTrack }: { orderId: string; total: number; items: any[]; payLater: boolean; onTrack: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 50, overflowY: 'auto', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '48px 16px 16px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 16px', animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1) forwards' }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Order Placed!</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {payLater ? 'Please pay at the counter when ready.' : 'Payment confirmed — kitchen is notified!'}
        </div>
      </div>

      <div style={{ padding: '0 14px 100px' }}>
        <div className="card">
          {[['Order ID', `#${orderId}`], ['Total', `¥${total}`], ['Payment', payLater ? 'Pay Later' : 'Paid ✓'], ['Est. Wait', '~20 mins']].map(([l, v]) => (
            <div key={l} className="card-row">
              <span style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: l === 'Total' ? '#ff4d4f' : '#111' }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13, fontWeight: 700, color: '#374151' }}>
            {items.length} item{items.length !== 1 ? 's' : ''} ordered
          </div>
          {items.map((i: any) => (
            <div key={i.id} className="card-row">
              <span style={{ fontSize: 20, marginRight: 10 }}>{i.img}</span>
              <span style={{ fontSize: 13, color: '#111', flex: 1 }}>{i.en}</span>
              <span style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', padding: '2px 8px', borderRadius: 8 }}>×{i.qty}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🍳</span>
          <span style={{ fontSize: 13, color: '#1d4ed8' }}>Kitchen has your order and is getting started!</span>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '14px 16px' }}>
        <button className="btn btn-red" onClick={onTrack}>Track Order Status →</button>
      </div>
    </div>
  )
}

/* ─── ORDER TRACKER ─── */
function OrderTracker({ orderId, dbOrderId, onDone }: { orderId: string; dbOrderId: string | null; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [rating, setRating] = useState(0)
  const isServed = step === ORDER_STEPS.length - 1

  useEffect(() => {
    if (!dbOrderId) return
    const channel = supabase.channel('tracker-' + dbOrderId)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${dbOrderId}` }, (payload: any) => {
        const idx = STATUS_LIST.indexOf(payload.new.status)
        if (idx >= 0) setStep(idx)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [dbOrderId])

  useEffect(() => {
    if (dbOrderId || isServed) return
    const t = setTimeout(() => setStep(s => s + 1), 3000)
    return () => clearTimeout(t)
  }, [step, isServed, dbOrderId])

  const cur = ORDER_STEPS[step]

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 50, overflowY: 'auto', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: cur.color, color: '#fff', padding: '40px 24px 32px', textAlign: 'center', transition: 'background .6s' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{cur.icon}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{cur.label}</div>
        <div style={{ fontSize: 13, opacity: .8, marginTop: 4 }}>{cur.desc}</div>
        <div style={{ fontSize: 11, opacity: .6, marginTop: 6, fontFamily: 'monospace' }}>Order #{orderId}</div>
        {dbOrderId && <div style={{ fontSize: 10, opacity: .5, marginTop: 2 }}>🔴 Live updates enabled</div>}
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        {ORDER_STEPS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === step ? 18 : 14, fontWeight: 700, flexShrink: 0, transition: 'all .5s', background: i < step ? '#22c55e' : i === step ? cur.color : '#e5e7eb', color: i <= step ? '#fff' : '#9ca3af', transform: i === step ? 'scale(1.1)' : 'scale(1)', boxShadow: i === step ? `0 0 0 4px ${cur.color}33` : 'none' }}>
                {i < step ? '✓' : s.icon}
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div className="step-line" style={{ background: i < step ? '#22c55e' : '#e5e7eb' }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: i < ORDER_STEPS.length - 1 ? 28 : 16 }}>
              <div style={{ fontSize: 14, fontWeight: i <= step ? 700 : 400, color: i <= step ? '#111' : '#9ca3af', transition: 'all .4s' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: i <= step ? '#6b7280' : '#d1d5db', marginTop: 2 }}>{s.desc}</div>
              {i === step && !isServed && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: cur.color, animation: `dotBounce 1.2s ease ${j * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isServed && (
        <div style={{ padding: '0 16px 100px' }} className="fade-in">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>Enjoy your meal!</div>
            <div style={{ fontSize: 13, color: '#16a34a', marginTop: 4 }}>Rate your experience today</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14 }}>
              {['😞', '😐', '🙂', '😊', '🤩'].map((e, i) => (
                <button key={i} className="btn" onClick={() => setRating(i + 1)} style={{ fontSize: 30, background: 'none', border: 'none', transform: rating === i + 1 ? 'scale(1.35)' : 'scale(1)', transition: 'transform .2s' }}>
                  {e}
                </button>
              ))}
            </div>
            {rating > 0 && <div style={{ marginTop: 12, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Thanks for your feedback! ❤️</div>}
          </div>
        </div>
      )}
      {isServed && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '14px 16px' }}>
          <button className="btn btn-red" onClick={onDone}>← Back to Menu</button>
        </div>
      )}
    </div>
  )
}

/* ─── KITCHEN DASHBOARD ─── */
function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchOrders = async () => {
    setLoading(true)
    const data = await loadOrders()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const ch = supabase.channel('kitchen-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter)

  const handleStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status)
    setOrders((prev: any[]) => prev.map((o: any) => o.id === id ? { ...o, status } : o))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return
    await deleteOrder(id)
    setOrders((prev: any[]) => prev.filter((o: any) => o.id !== id))
  }

  const nextStatus = (s: string) => STATUS_LIST[Math.min(STATUS_LIST.indexOf(s) + 1, STATUS_LIST.length - 1)]
  const actionLabel: Record<string, string> = { new: 'Start Preparing', preparing: 'Start Cooking', cooking: 'Mark Ready', ready: 'Mark Served', served: '✓ Done' }
  const stepColor = (s: string) => ORDER_STEPS[STATUS_LIST.indexOf(s)]?.color || '#ff4d4f'

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', overflowY: 'auto', maxWidth: 480, margin: '0 auto', paddingTop: 0 }}>
      <div style={{ background: '#111', color: '#fff', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>🍳 Kitchen Dashboard</div>
          <div style={{ fontSize: 11, opacity: .6, marginTop: 1 }}>
            {orders.filter((o: any) => o.status !== 'served').length} active · {orders.length} total
            <span style={{ marginLeft: 8, color: '#22c55e' }}>● Live</span>
          </div>
        </div>
        <button className="btn btn-sm" onClick={fetchOrders} style={{ background: '#333', color: '#fff' }}>↻ Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', background: '#fff', borderBottom: '1px solid #f0f0f0', overflowX: 'auto' }}>
        {['all', ...STATUS_LIST].map((s: string) => (
          <button key={s} className="btn btn-sm" onClick={() => setFilter(s)}
            style={{ background: filter === s ? '#ff4d4f' : '#f3f4f6', color: filter === s ? '#fff' : '#374151', whiteSpace: 'nowrap' }}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ marginLeft: 4, opacity: .7 }}>
              {s === 'all' ? orders.length : orders.filter((o: any) => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 12px 80px' }}>
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 10 }} />
        ))}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 14 }}>No orders here</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>All caught up!</div>
          </div>
        )}

        {!loading && filtered.map((order: any) => (
          <div key={order.id} className="kitchen-card" style={{ borderLeftColor: stepColor(order.status) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{order.customer_name || 'Guest'}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ¥{order.total || 0}
                </div>
              </div>
              <StatusPill status={order.status} />
            </div>

            {order.note && (
              <div style={{ fontSize: 12, color: '#6b7280', background: '#fffbeb', borderRadius: 8, padding: '6px 10px', marginBottom: 8 }}>
                📝 {order.note}
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              {(order.order_items || []).map((item: any, i: number) => (
                <div key={i} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 6, padding: '3px 0', alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{item.item_emoji || '🍽️'}</span>
                  <span style={{ flex: 1 }}>{item.item_name || item.name}</span>
                  <span style={{ fontWeight: 700, color: '#111' }}>×{item.quantity || item.qty}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {order.status !== 'served' && (
                <button className="btn btn-sm" onClick={() => handleStatus(order.id, nextStatus(order.status))}
                  style={{ background: '#ff4d4f', color: '#fff', flex: 1, padding: 8 }}>
                  {actionLabel[order.status] || 'Next →'}
                </button>
              )}
              <button className="btn btn-sm" onClick={() => handleDelete(order.id)}
                style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px' }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── ROOT APP ─── */
function App({ tableNum }: { tableNum: string }) {
  const [cartItems, dispatch] = useReducer(cartReducer, [])
  const [showCart, setShowCart] = useState(false)
  const [screen, setScreen] = useState('menu')
  const [tab, setTab] = useState('customer')
  const [payMode, setPayMode] = useState('now')
  const [orderId, setOrderId] = useState('')
  const [dbOrderId, setDbOrderId] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<any[]>([])
  const [snapTotal, setSnapTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.body.style.background = '#f3f4f6'
    return () => { document.body.style.background = '' }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const handlePay = async (mode: string, note: string, total: number, items: any[]) => {
    setSubmitting(true)
    let dbOrder: any = null
    try {
      dbOrder = await placeOrder(tableNum, 'Table ' + tableNum, '', total, note, mode, items)
      if (dbOrder) { showToast('✅ Order sent to kitchen!') }
      else { showToast('⚠️ Could not reach server — saved locally') }
    } catch (e) {
      console.error('handlePay error:', e)
      showToast('⚠️ Offline mode — continuing')
    }

    const newId = genId()
    setPayMode(mode)
    setOrderId(newId)
    setDbOrderId(dbOrder?.id || null)
    setSnapshot([...items])
    setSnapTotal(total)
    dispatch({ type: 'CLEAR' })
    setSubmitting(false)
    setScreen(mode === 'later' ? 'success' : 'payment')
  }

  return (
    <Ctx.Provider value={{ cartItems, dispatch, showCart, setShowCart, tableNum }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
        html,body,#root{height:100%}
        body{font-family:'PingFang SC','SF Pro Text','Helvetica Neue',sans-serif}
        ::-webkit-scrollbar{display:none}
        *{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fly{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(.4)}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .slide-up{animation:slideUp .28s cubic-bezier(.32,.72,0,1) forwards}
        .fade-in{animation:fadeIn .3s ease forwards}
        .pop-in{animation:popIn .35s cubic-bezier(.34,1.56,.64,1) forwards}
        .spinning{animation:spin 1s linear infinite;display:inline-block}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;animation:fadeIn .2s ease}
        .cart-drawer{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:#fff;border-radius:20px 20px 0 0;z-index:50;max-height:75vh;display:flex;flex-direction:column;box-shadow:0 -8px 40px rgba(0,0,0,.18)}
        .tag{display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;margin-right:3px}
        .tag-best{background:#fef3c7;color:#b45309}
        .tag-new{background:#d1fae5;color:#065f46}
        .tag-sig{background:#ede9fe;color:#5b21b6}
        .tag-spicy{color:#ef4444;font-size:11px}
        .btn{border:none;cursor:pointer;font-family:inherit;transition:transform .12s,opacity .12s}
        .btn:active{transform:scale(.94);opacity:.85}
        .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .btn-red{background:#ff4d4f;color:#fff;border-radius:14px;font-weight:700;font-size:15px;padding:14px;width:100%;display:block;box-shadow:0 4px 20px rgba(255,77,79,.35);text-align:center}
        .btn-ghost{background:transparent;color:#6b7280;border:2px solid #e5e7eb;border-radius:14px;font-weight:600;font-size:13px;padding:12px;width:100%;display:block;text-align:center}
        .btn-sm{font-size:11px;padding:5px 12px;border-radius:20px;font-weight:600;border:none;cursor:pointer;font-family:inherit}
        .btn-circle-red{background:#ff4d4f;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(255,77,79,.4);flex-shrink:0;transition:transform .12s}
        .btn-circle-red:active{transform:scale(.85)}
        .btn-circle-outline{background:transparent;color:#ff4d4f;border:2px solid #ff4d4f;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;cursor:pointer;flex-shrink:0;transition:transform .12s}
        .btn-circle-outline:active{transform:scale(.85)}
        .float-cart{position:fixed;bottom:24px;right:16px;z-index:30;background:#ff4d4f;color:#fff;border-radius:50px;padding:10px 16px 10px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 6px 24px rgba(255,77,79,.5);cursor:pointer;border:none;font-family:inherit;transition:transform .15s}
        .float-cart:active{transform:scale(.95)}
        .float-badge{position:absolute;top:-4px;right:-4px;background:#fff;color:#ff4d4f;font-size:10px;font-weight:800;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center}
        textarea{font-family:inherit;font-size:13px;color:#374151;background:#f9fafb;border:none;border-radius:10px;padding:10px 12px;resize:none;width:100%;outline:none}
        textarea:focus{box-shadow:0 0 0 2px rgba(255,77,79,.25)}
        input[type=text],input[type=search]{font-family:inherit;font-size:13px;color:#374151;background:#f3f4f6;border:none;border-radius:50px;padding:8px 12px 8px 32px;width:100%;outline:none}
        input[type=text]:focus,input[type=search]:focus{box-shadow:0 0 0 2px rgba(255,77,79,.2)}
        input[type=radio]{accent-color:#ff4d4f}
        .step-line{width:2px;height:32px;margin:3px auto;border-radius:2px;transition:background .6s}
        .card{background:#fff;border-radius:16px;box-shadow:0 1px 8px rgba(0,0,0,.06);overflow:hidden;margin-bottom:12px}
        .card-row{display:flex;align-items:center;padding:13px 16px;border-bottom:1px solid #f3f4f6}
        .card-row:last-child{border-bottom:none}
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 20px;border-radius:50px;font-size:13px;font-weight:600;z-index:9999;animation:fadeIn .3s ease;white-space:nowrap;pointer-events:none}
        .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;border-radius:8px}
        .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
        .status-new{background:#fef3c7;color:#92400e}
        .status-preparing{background:#fff7ed;color:#c2410c}
        .status-cooking{background:#fee2e2;color:#b91c1c}
        .status-ready{background:#dbeafe;color:#1d4ed8}
        .status-served{background:#dcfce7;color:#15803d}
        .kitchen-card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:14px;margin-bottom:10px;border-left:4px solid #ff4d4f}
        .tab-bar{display:flex;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:20}
        .tab{flex:1;padding:12px 0;text-align:center;font-size:12px;font-weight:600;color:#9ca3af;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;font-family:inherit}
        .tab.active{color:#ff4d4f;border-bottom-color:#ff4d4f}
      `}</style>
      <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', position: 'relative' }}>

          {screen === 'menu' && (
            <div className="tab-bar">
              <button className={`tab ${tab === 'customer' ? 'active' : ''}`} onClick={() => setTab('customer')}>🛍️ Order</button>
              <button className={`tab ${tab === 'kitchen' ? 'active' : ''}`} onClick={() => setTab('kitchen')}>🍳 Kitchen</button>
              <button className="tab" onClick={() => {
                const u = `${window.location.origin}${window.location.pathname}?table=${tableNum}&kitchen=1`
                navigator.clipboard?.writeText(u).catch(() => { })
                showToast('📋 Kitchen URL copied!')
              }}>📋 Copy URL</button>
            </div>
          )}

          {screen === 'menu' && tab === 'customer' && <MenuPage onCheckout={() => setScreen('checkout')} />}
          {screen === 'menu' && tab === 'kitchen' && <KitchenDashboard />}
          {screen === 'checkout' && <CheckoutPage onBack={() => setScreen('menu')} onPay={handlePay} submitting={submitting} />}
          {screen === 'payment' && <PaymentScreen total={snapTotal} onSuccess={() => setScreen('success')} />}
          {screen === 'success' && <OrderSuccess orderId={orderId} total={snapTotal} items={snapshot} payLater={payMode === 'later'} onTrack={() => setScreen('tracker')} />}
          {screen === 'tracker' && <OrderTracker orderId={orderId} dbOrderId={dbOrderId} onDone={() => setScreen('menu')} />}
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </Ctx.Provider>
  )
}

/* ─── PAGE EXPORT ─── */
export default function OrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tableNum = searchParams.get('table') || (params?.tableId as string) || '8'
  return <App tableNum={tableNum} />
}
