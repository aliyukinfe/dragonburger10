'use client'
import { FormEvent, useMemo, useState } from 'react'
import { useMenu } from '@/hooks/useMenu'

export function NewOrderPanel() {
  const { menu } = useMenu()
  const [customer_name, setName] = useState('')
  const firstCategory = Object.keys(menu)[0]
  const firstItem = firstCategory ? menu[firstCategory][0] : null
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
    <form className="card" onSubmit={onSubmit}>
      <h2>New Order</h2>
      <input required value={customer_name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" style={{ width: '100%', padding: 10 }} />
      <p>Item: {firstItem?.name ?? 'No menu item found'}</p>
      <input value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} min={1} type="number" />
      <p>Total: PKR {total}</p>
      <button className="btn" type="submit">Create Order</button>
    </form>
  )
}
