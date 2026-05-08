import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  name_zh?: string
  price: number
  image_url?: string
  quantity: number
  special_instructions?: string
  spice_level?: 0 | 1 | 2 | 3
}

interface CartStore {
  items: CartItem[]
  tableId: string | null
  orderType: 'dine_in' | 'takeaway'
  setTableId: (id: string) => void
  setOrderType: (type: 'dine_in' | 'takeaway') => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateNote: (id: string, note: string) => void
  updateSpiceLevel: (id: string, level: 0 | 1 | 2 | 3) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      orderType: 'dine_in',

      setTableId: (id: string) => set({ tableId: id }),
      setOrderType: (type: 'dine_in' | 'takeaway') => set({ orderType: type }),

      addItem: (item: CartItem) => {
        const { items } = get()
        const existingItem = items.find(i => i.id === item.id)
        if (existingItem) {
          set({ items: items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) })
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] })
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter(item => item.id !== id) })
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({ items: get().items.map(item => item.id === id ? { ...item, quantity } : item) })
        }
      },

      updateNote: (id: string, note: string) => {
        set({ items: get().items.map(item => item.id === id ? { ...item, special_instructions: note } : item) })
      },

      updateSpiceLevel: (id: string, level: 0 | 1 | 2 | 3) => {
        set({ items: get().items.map(item => item.id === id ? { ...item, spice_level: level } : item) })
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    { name: 'dragon-cart-v2' }
  )
)
