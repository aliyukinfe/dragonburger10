'use client'

import { useEffect, useState } from 'react'

export function ShutdownBanner({ expiresAt }: { expiresAt: string }) {
  const [left, setLeft] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      const s = Math.max(0, Math.floor(diff / 1000))
      const h = String(Math.floor(s / 3600)).padStart(2, '0')
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
      const sec = String(s % 60).padStart(2, '0')
      setLeft(`${h}:${m}:${sec}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return <div style={{ background: '#e67e22', color: '#fff', padding: 10 }}>⚠️ Your account will shut down in {left}</div>
}
