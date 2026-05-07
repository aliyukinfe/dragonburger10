'use client'
import { useOrders } from '@/hooks/useOrders'
import { formatDate } from '@/lib/utils'

export function AllOrdersPanel() {
  const { orders } = useOrders()
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>All Orders</h2>
      {orders.map((o) => (
        <div key={o.id} style={{ borderTop: '1px solid var(--border)', padding: '10px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
          <div>
            <strong>#{o.order_num} • {o.customer_name}</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13 }}>
            <div>{formatDate(o.created_at)}</div>
            <div>{o.payment_status} / {o.delivery_status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
