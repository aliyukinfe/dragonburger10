'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])

  const fetchOrders = async () => {
    const res = await fetch('/api/orders', { cache: 'no-store' })
    if (!res.ok) return
    setOrders(await res.json())
  }

  useEffect(() => {
    fetchOrders()
    const supabase = createClient()
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { orders, refetch: fetchOrders }
}
