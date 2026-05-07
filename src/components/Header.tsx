'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: '📋 Overview' },
  { href: '/dashboard/new-order', label: '➕ New Order' },
  { href: '/dashboard/orders', label: '📑 All Orders' },
  { href: '/dashboard/reports', label: '📊 Reports' },
  { href: '/dashboard/udhaar', label: '💳 Udhaar' },
  { href: '/dashboard/menu', label: '🏷️ Menu Editor' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }
  return (
    <header className="card" style={{ position: 'sticky', top: 0, zIndex: 5, backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="brand" style={{ margin: 0, fontSize: 34 }}>dragon burger -restaurant</h1>
          <small style={{ color: 'var(--text-muted)' }}>Modern restaurant command center</small>
        </div>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="btn"
            style={{ opacity: pathname === link.href ? 1 : 0.72, transform: pathname === link.href ? 'translateY(-1px)' : 'none' }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
