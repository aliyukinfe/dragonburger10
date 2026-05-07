'use client'
import { useOrders } from '@/hooks/useOrders'
import { useReports } from '@/hooks/useReports'
import { formatPrice } from '@/lib/utils'

export function ReportsPanel() {
  const { orders } = useOrders()
  const report = useReports(orders)
  return (
    <>
      <section className="stats-grid">
        <div className="stat"><small>Total Orders</small><strong>{report.count}</strong></div>
        <div className="stat"><small>Revenue</small><strong>{formatPrice(report.revenue)}</strong></div>
        <div className="stat"><small>Udhaar</small><strong>{formatPrice(report.udhaar)}</strong></div>
      </section>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Report Feed</h2>
        {orders.slice(0, 8).map((order) => (
          <div key={order.id} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
            #{order.order_num} - {order.customer_name} - {formatPrice(order.total)}
          </div>
        ))}
      </div>
    </>
  )
}
