'use client'

import { useMemo } from 'react'
import { Order } from '@/types'

export function useReports(orders: Order[]) {
  return useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0)
    const udhaar = orders.filter((o) => o.payment_status === 'udhaar').reduce((sum, o) => sum + o.total, 0)
    return { revenue, udhaar, count: orders.length }
  }, [orders])
}
