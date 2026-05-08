export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { data: nextNumData, error: nextNumError } = await supabase.rpc('next_order_num')
  if (nextNumError) return Response.json({ error: nextNumError.message }, { status: 500 })
  const payload = {
    ...body,
    order_num: nextNumData as number,
    id: `ORD${Date.now().toString().slice(-6)}`,
  }
  const { data, error } = await supabase.from('orders').insert(payload).select('*').single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
