'use client'

import { useEffect, useMemo, useReducer, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type MenuItem = {
  id: string
  cat: string
  name: string
  en: string
  price: number
  desc: string
  img: string
  tags: string[]
  time: number
}

type CartItem = MenuItem & { qty: number }
type OrderRow = {
  id: string
  customer_name: string
  created_at: string
  total: number
  delivery_status?: string
  notes?: string
  items?: Array<{ name?: string; price?: number; qty?: number }>
}

const FALLBACK_MENU: MenuItem[] = [
  { id: '1', cat: 'popular', name: '招牌叉烧饭', en: 'BBQ Pork Rice', price: 38, desc: 'Glazed pork over rice', img: '🍚', tags: ['Bestseller'], time: 10 },
  { id: '2', cat: 'popular', name: '麻辣烫', en: 'Mala Hot Pot', price: 68, desc: 'Numbing spicy broth', img: '🍲', tags: ['Spicy'], time: 20 },
  { id: '3', cat: 'noodles', name: '干炒牛河', en: 'Dry-Fried Beef Ho Fun', price: 48, desc: 'Wok tossed flat noodles', img: '🍜', tags: ['Bestseller'], time: 10 },
  { id: '4', cat: 'snacks', name: '虾饺', en: 'Har Gow', price: 32, desc: 'Prawn dumplings', img: '🥟', tags: [], time: 8 },
  { id: '5', cat: 'cold', name: '珍珠奶茶', en: 'Bubble Milk Tea', price: 22, desc: 'Brown sugar boba', img: '🧋', tags: ['New'], time: 3 },
]

const CATS = [
  { id: 'popular', label: 'Popular' },
  { id: 'signature', label: 'Signature' },
  { id: 'noodles', label: 'Noodles' },
  { id: 'bbq', label: 'BBQ' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'hot', label: 'Hot Drinks' },
  { id: 'cold', label: 'Cold Drinks' },
]

const STATUS_LIST = ['new', 'preparing', 'cooking', 'ready', 'served']

function cartReducer(state: CartItem[], action: { type: 'ADD' | 'REMOVE' | 'CLEAR'; item?: MenuItem; id?: string }) {
  switch (action.type) {
    case 'ADD': {
      if (!action.item) return state
      const existing = state.find((i) => i.id === action.item?.id)
      if (existing) return state.map((i) => (i.id === action.item?.id ? { ...i, qty: i.qty + 1 } : i))
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'REMOVE':
      return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

function normalizeMenu(raw: unknown): MenuItem[] {
  if (!raw || typeof raw !== 'object') return FALLBACK_MENU
  const sections = raw as Record<string, Array<{ name: string; price: number }>>
  const result: MenuItem[] = []
  Object.entries(sections).forEach(([cat, items]) => {
    if (!Array.isArray(items)) return
    items.forEach((item, index) => {
      result.push({
        id: `${cat}-${index}`,
        cat,
        name: item.name,
        en: item.name,
        price: Number(item.price) || 0,
        desc: '',
        img: '🍽️',
        tags: [],
        time: 10,
      })
    })
  })
  return result.length ? result : FALLBACK_MENU
}

export default function GoldenDragonApp() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<'menu' | 'checkout' | 'success' | 'tracker' | 'kitchen'>('menu')
  const [cartItems, dispatch] = useReducer(cartReducer, [])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('popular')
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [latestOrder, setLatestOrder] = useState<OrderRow | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])

  const tableNum = useMemo(() => {
    if (typeof window === 'undefined') return '8'
    return new URLSearchParams(window.location.search).get('table') || '8'
  }, [])

  const total = useMemo(() => cartItems.reduce((sum, i) => sum + i.price * i.qty, 0), [cartItems])
  const count = useMemo(() => cartItems.reduce((sum, i) => sum + i.qty, 0), [cartItems])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await fetch('/api/menu', { cache: 'no-store' })
      if (res.ok) {
        const payload = await res.json()
        setMenu(normalizeMenu(payload.data))
      } else {
        setMenu(FALLBACK_MENU)
      }
      setLoading(false)
    })()
  }, [])

  const loadOrders = async () => {
    const res = await fetch('/api/orders', { cache: 'no-store' })
    if (!res.ok) return
    setOrders(await res.json())
  }

  useEffect(() => {
    if (screen !== 'kitchen') return
    loadOrders()
    const supabase = createClient()
    const ch = supabase
      .channel('golden-dragon-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [screen])

  useEffect(() => {
    if (!latestOrder?.id || screen !== 'tracker') return
    const supabase = createClient()
    const ch = supabase
      .channel(`order-${latestOrder.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${latestOrder.id}` }, (payload) => {
        setLatestOrder(payload.new as OrderRow)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [latestOrder?.id, screen])

  const filtered = menu
    .filter((m) => (search ? m.en.toLowerCase().includes(search.toLowerCase()) || m.name.includes(search) : true))
    .filter((m) => (search ? true : m.cat === activeCat))

  const createOrder = async () => {
    setSubmitting(true)
    const payload = {
      customer_name: `Table ${tableNum}`,
      order_type: 'dine-in',
      items: cartItems.map((i) => ({ name: i.en, price: i.price, qty: i.qty })),
      total,
      delivery_status: 'new',
      payment_status: 'unpaid',
      notes: note || null,
      order_ref: `T-${tableNum}`,
    }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const order = (await res.json()) as OrderRow
      setLatestOrder(order)
      dispatch({ type: 'CLEAR' })
      setScreen('success')
      setNote('')
    }
    setSubmitting(false)
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status: status }),
    })
  }

  return (
    <main className="gd-app">
      <div className="gd-header">
        <h1>Golden Dragon Restaurant</h1>
        <p>Table {tableNum}</p>
      </div>

      {screen === 'menu' && (
        <>
          <div className="gd-row">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes..." />
            <button onClick={() => setScreen('kitchen')}>Kitchen</button>
          </div>
          {!search && (
            <div className="gd-cats">
              {CATS.map((cat) => (
                <button key={cat.id} className={activeCat === cat.id ? 'active' : ''} onClick={() => setActiveCat(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
          )}
          <section className="gd-list">
            {loading && <p>Loading menu...</p>}
            {!loading &&
              filtered.map((item) => {
                const qty = cartItems.find((c) => c.id === item.id)?.qty || 0
                return (
                  <article key={item.id} className="gd-item">
                    <div>
                      <h3>{item.en}</h3>
                      <small>¥{item.price}</small>
                    </div>
                    <div className="gd-actions">
                      {qty > 0 && <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })}>-</button>}
                      {qty > 0 && <span>{qty}</span>}
                      <button onClick={() => dispatch({ type: 'ADD', item })}>+</button>
                    </div>
                  </article>
                )
              })}
          </section>
          {count > 0 && (
            <button className="gd-cart" onClick={() => setScreen('checkout')}>
              Checkout ({count}) - ¥{total}
            </button>
          )}
        </>
      )}

      {screen === 'checkout' && (
        <section className="gd-card">
          <h2>Confirm Order</h2>
          {cartItems.map((i) => (
            <p key={i.id}>
              {i.en} x {i.qty} = ¥{i.price * i.qty}
            </p>
          ))}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special requests" />
          <p>Total: ¥{total}</p>
          <div className="gd-row">
            <button onClick={() => setScreen('menu')}>Back</button>
            <button onClick={createOrder} disabled={submitting}>
              {submitting ? 'Sending...' : 'Place Order'}
            </button>
          </div>
        </section>
      )}

      {screen === 'success' && (
        <section className="gd-card">
          <h2>Order Placed</h2>
          <p>Order ID: {latestOrder?.id}</p>
          <p>Total: ¥{latestOrder?.total ?? 0}</p>
          <div className="gd-row">
            <button onClick={() => setScreen('tracker')}>Track Order</button>
            <button onClick={() => setScreen('menu')}>Back to Menu</button>
          </div>
        </section>
      )}

      {screen === 'tracker' && (
        <section className="gd-card">
          <h2>Order Tracker</h2>
          <p>Status: {latestOrder?.delivery_status ?? 'new'}</p>
          <div className="gd-steps">
            {STATUS_LIST.map((step) => (
              <span key={step} className={step === (latestOrder?.delivery_status ?? 'new') ? 'active' : ''}>
                {step}
              </span>
            ))}
          </div>
          <button onClick={() => setScreen('menu')}>Back to Menu</button>
        </section>
      )}

      {screen === 'kitchen' && (
        <section className="gd-card">
          <h2>Kitchen Dashboard</h2>
          <button onClick={() => setScreen('menu')}>Customer View</button>
          {orders.map((order) => {
            const current = order.delivery_status ?? 'new'
            const idx = STATUS_LIST.indexOf(current)
            const next = STATUS_LIST[Math.min(idx + 1, STATUS_LIST.length - 1)]
            return (
              <article key={order.id} className="gd-kitchen-item">
                <strong>{order.customer_name}</strong>
                <p>
                  #{order.id} - ¥{order.total} - {current}
                </p>
                {(order.items ?? []).map((item, i) => (
                  <small key={`${order.id}-${i}`}>
                    {item.name} x {item.qty}
                  </small>
                ))}
                {current !== 'served' && <button onClick={() => updateOrderStatus(order.id, next)}>{next}</button>}
              </article>
            )
          })}
        </section>
      )}

      <style jsx>{`
        .gd-app {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100vh;
          background: #fff;
          padding: 12px;
          color: #111827;
        }
        .gd-header h1 {
          margin: 0;
          font-size: 22px;
        }
        .gd-header p {
          margin: 4px 0 12px;
          color: #6b7280;
        }
        .gd-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        input,
        textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
        }
        button {
          border: none;
          border-radius: 8px;
          background: #ff4d4f;
          color: #fff;
          padding: 10px 12px;
          cursor: pointer;
        }
        .gd-cats {
          display: flex;
          overflow: auto;
          gap: 8px;
          margin-bottom: 10px;
        }
        .gd-cats button {
          white-space: nowrap;
          background: #f3f4f6;
          color: #4b5563;
        }
        .gd-cats .active {
          background: #ff4d4f;
          color: #fff;
        }
        .gd-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 80px;
        }
        .gd-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 10px;
        }
        .gd-item h3 {
          margin: 0 0 4px;
          font-size: 14px;
        }
        .gd-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gd-cart {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 456px;
          font-weight: 700;
        }
        .gd-card {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          padding: 14px;
        }
        .gd-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 8px 0 16px;
        }
        .gd-steps span {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 999px;
          text-transform: capitalize;
        }
        .gd-steps .active {
          background: #fee2e2;
          color: #b91c1c;
        }
        .gd-kitchen-item {
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          margin-top: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>
    </main>
  )
}
