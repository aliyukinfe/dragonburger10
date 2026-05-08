export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_MENU } from '@/lib/menu-data'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('menu').select('*').order('updated_at', { ascending: false }).limit(1)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data: data?.[0]?.data ?? DEFAULT_MENU })
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { data, error } = await supabase.from('menu').insert({ data: body.data }).select('*').single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function PUT(req: NextRequest) {
  return POST(req)
}
