'use client'
import { useOrders } from '@/hooks/useOrders'
import { useReports } from '@/hooks/useReports'
import { formatPrice } from '@/lib/utils'

export function ReportsPanel() {
  const { orders } = useOrders()
  const report = useReports(orders)
  return (
    <div className="card">
      <h2>Reports</h2>
      <p>Total Orders: {report.count}</p>
      <p>Revenue: {formatPrice(report.revenue)}</p>
      <p>Udhaar: {formatPrice(report.udhaar)}</p>
    </div>
  )
}
