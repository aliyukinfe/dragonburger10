'use client'

import { useEffect, useMemo, useState } from 'react'
import { AccountStatus } from '@/types'

export function useAccountStatus() {
  const [status, setStatus] = useState<AccountStatus | null>(null)

  const fetchStatus = async () => {
    const res = await fetch('/api/account/status', { cache: 'no-store' })
    if (!res.ok) return
    setStatus(await res.json())
  }

  useEffect(() => {
    fetchStatus()
    const timer = setInterval(fetchStatus, 60_000)
    return () => clearInterval(timer)
  }, [])

  const now = Date.now()
  const expiresAt = status?.expires_at ? new Date(status.expires_at).getTime() : null
  const hoursRemaining = expiresAt ? (expiresAt - now) / 36e5 : null

  return useMemo(
    () => ({
      isActive: status?.is_active ?? true,
      expiresAt: status?.expires_at ?? null,
      hoursRemaining,
      showWarning: typeof hoursRemaining === 'number' && hoursRemaining > 0 && hoursRemaining <= 24,
      isLocked: status ? !status.is_active || (expiresAt ? expiresAt < now : false) : false,
    }),
    [status, hoursRemaining, expiresAt, now]
  )
}
