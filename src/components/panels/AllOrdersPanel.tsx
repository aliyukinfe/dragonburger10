'use client'
import { useOrders } from '@/hooks/useOrders'
import { formatDate } from '@/lib/utils'

export function AllOrdersPanel() {
  const { orders } = useOrders()
  return (
    <div className="card">
      <h2>All Orders</h2>
      {orders.map((o) => (
        <div key={o.id} style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
          #{o.order_num} - {o.customer_name} - {formatDate(o.created_at)}
        </div>
      ))}
    </div>
  )
}
