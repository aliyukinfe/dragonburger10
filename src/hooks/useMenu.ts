'use client'

import { useEffect, useState } from 'react'
import { MenuItems } from '@/types'
import { DEFAULT_MENU } from '@/lib/menu-data'

export function useMenu() {
  const [menu, setMenu] = useState<MenuItems>(DEFAULT_MENU)

  const loadMenu = async () => {
    const res = await fetch('/api/menu', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setMenu(data.data ?? DEFAULT_MENU)
  }

  const saveMenu = async (data: MenuItems) => {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
    setMenu(data)
  }

  useEffect(() => {
    loadMenu()
  }, [])

  return { menu, saveMenu, reset: () => saveMenu(DEFAULT_MENU) }
}
