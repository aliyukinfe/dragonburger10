'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="page-wrap" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form className="card" onSubmit={onSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <h1 className="brand" style={{ fontSize: 42, margin: 0 }}>dragon burger -restaurant</h1>
        <p style={{ color: 'var(--text-muted)' }}>Admin Login</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        {error ? <p style={{ color: 'var(--red)' }}>{error}</p> : null}
        <button className="btn" type="submit">Login</button>
      </form>
    </main>
  )
}
