import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')
  return (
    <main className="page-wrap">
      <Header />
      <div style={{ marginTop: 12 }}>{children}</div>
    </main>
  )
}
