'use client'
import { useOrders } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'

export function OverviewPanel() {
  const { orders } = useOrders()
  return (
    <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
      {orders.map((o) => (
        <article className="card" key={o.id}>
          <strong>#{o.order_num} {o.customer_name}</strong>
          <p>{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>
          <p>{formatPrice(o.total)} | {o.delivery_status} | {o.payment_status}</p>
        </article>
      ))}
    </section>
  )
}
