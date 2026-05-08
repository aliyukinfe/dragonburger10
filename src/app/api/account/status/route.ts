export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('account_status')
    .select('is_active, expires_at, activated_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) {
    return Response.json({ is_active: true, expires_at: null, activated_at: new Date().toISOString() })
  }
  return Response.json(data)
}
