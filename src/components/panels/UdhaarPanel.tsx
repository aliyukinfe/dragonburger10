'use client'
import { useOrders } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'

export function UdhaarPanel() {
  const { orders } = useOrders()
  const udhaarOrders = orders.filter((o) => o.payment_status === 'udhaar')
  const total = udhaarOrders.reduce((sum, o) => sum + o.total, 0)
  return (
    <div className="card">
      <h2>Udhaar</h2>
      <p>Total outstanding: {formatPrice(total)}</p>
      {udhaarOrders.map((o) => <p key={o.id}>#{o.order_num} {o.customer_name} - {formatPrice(o.total)}</p>)}
    </div>
  )
}
