'use client'
import { useOrders } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'

export function OverviewPanel() {
  const { orders } = useOrders()
  const totalOrders = orders.length
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pending = orders.filter((o) => o.delivery_status !== 'delivered').length
  const unpaid = orders.filter((o) => o.payment_status !== 'paid').length
  return (
    <>
      <section className="stats-grid">
        <div className="stat"><small>Total Orders</small><strong>{totalOrders}</strong></div>
        <div className="stat"><small>Revenue</small><strong>{formatPrice(revenue)}</strong></div>
        <div className="stat"><small>Pending Delivery</small><strong>{pending}</strong></div>
        <div className="stat"><small>Unpaid</small><strong>{unpaid}</strong></div>
      </section>
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        {orders.map((o) => (
          <article className="card" key={o.id}>
            <strong>#{o.order_num} {o.customer_name}</strong>
            <p>{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>
            <p style={{ marginBottom: 8 }}>{formatPrice(o.total)}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="pill delivery">{o.delivery_status}</span>
              <span className="pill payment">{o.payment_status}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
