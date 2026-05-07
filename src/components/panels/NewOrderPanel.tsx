'use client'
import { FormEvent, useMemo, useState } from 'react'
import { useMenu } from '@/hooks/useMenu'

export function NewOrderPanel() {
  const { menu } = useMenu()
  const categories = Object.keys(menu)
  const [activeCategory, setActiveCategory] = useState('')
  const [customer_name, setName] = useState('')
  const selectedCategory = activeCategory || categories[0] || ''
  const items = selectedCategory ? menu[selectedCategory] ?? [] : []
  const [selectedIndex, setSelectedIndex] = useState(0)
  const firstItem = items[selectedIndex] ?? null
  const [qty, setQty] = useState(1)

  const total = useMemo(() => (firstItem ? firstItem.price * qty : 0), [firstItem, qty])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firstItem) return
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name,
        order_type: 'dine-in',
        items: [{ name: firstItem.name, price: firstItem.price, qty }],
        total,
        delivery_status: 'pending',
        payment_status: 'unpaid',
      }),
    })
    setName('')
    setQty(1)
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
      <form className="card" onSubmit={onSubmit}>
        <h2 style={{ marginTop: 0 }}>New Order</h2>
        <input
          required
          value={customer_name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer name"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className="btn"
              onClick={() => {
                setActiveCategory(cat)
                setSelectedIndex(0)
              }}
              style={{ opacity: (selectedCategory === cat ? 1 : 0.7) }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="menu-grid">
          {items.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              type="button"
              className="menu-item"
              onClick={() => setSelectedIndex(index)}
              style={{ borderColor: firstItem?.name === item.name ? 'var(--green)' : 'var(--border)' }}
            >
              <h4>{item.name}</h4>
              <p>PKR {item.price}</p>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
          <span>Qty</span>
          <input value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} min={1} type="number" style={{ width: 80 }} />
          <strong style={{ marginLeft: 'auto' }}>Total: PKR {total}</strong>
        </div>
        <button className="btn" type="submit" style={{ marginTop: 12, width: '100%' }}>Create Order</button>
      </form>
      <aside className="card">
        <h3 style={{ marginTop: 0 }}>Current Selection</h3>
        <p><strong>Category:</strong> {selectedCategory || 'None'}</p>
        <p><strong>Item:</strong> {firstItem?.name ?? 'No item selected'}</p>
        <p><strong>Price:</strong> PKR {firstItem?.price ?? 0}</p>
        <p><strong>Quantity:</strong> {qty}</p>
      </aside>
    </div>
  )
}
