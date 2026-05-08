'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ShoppingCart, Flame, Star, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import { SAMPLE_CATEGORIES, SAMPLE_MENU_ITEMS, CATEGORY_META, type SampleMenuItem } from '@/lib/sampleMenuData'
import { translations, type Lang } from '@/lib/i18n'
import { type CartItem } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string; description?: string; sort_order: number; is_active: boolean }
type MenuItem = SampleMenuItem & { categories?: { name: string } }

const SPICE_ICONS = ['', '🌶', '🌶🌶', '🌶🌶🌶']
const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', zh: '🇨🇳', am: '🇪🇹' }

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const tableId = params.tableId
  const router = useRouter()
  const { items, addItem, updateQuantity, removeItem, getTotalItems, getTotalPrice, setTableId, orderType, setOrderType } = useCartStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('zh')
  const [cartBounce, setCartBounce] = useState(false)
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  const [noteText, setNoteText] = useState('')

  const mainScrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isScrollingProgrammatic = useRef(false)

  const tr = translations[lang]

  useEffect(() => { setTableId(tableId) }, [tableId, setTableId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
        const { data: dishes } = await supabase.from('menu_items').select('*, categories(name)').eq('is_available', true).order('sort_order')
        if (cats && cats.length > 0) {
          setCategories(cats)
          setMenuItems(dishes || [])
          setActiveCategory(cats[0]?.id)
        } else throw new Error('no data')
      } catch {
        setCategories(SAMPLE_CATEGORIES)
        setMenuItems(SAMPLE_MENU_ITEMS as MenuItem[])
        setActiveCategory(SAMPLE_CATEGORIES[0]?.id)
      } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!mainScrollRef.current || categories.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatic.current) return
        let best: { id: string; ratio: number } | null = null
        entries.forEach(entry => {
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id: entry.target.getAttribute('data-catid') || '', ratio: entry.intersectionRatio }
          }
        })
        if (best && (best as any).ratio > 0) setActiveCategory((best as any).id)
      },
      { root: mainScrollRef.current, threshold: [0, 0.1, 0.5], rootMargin: '-5% 0px -70% 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [categories, menuItems])

  const scrollToCategory = (catId: string) => {
    isScrollingProgrammatic.current = true
    setActiveCategory(catId)
    const el = sectionRefs.current[catId]
    if (el && mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: el.offsetTop - 2, behavior: 'smooth' })
    }
    setTimeout(() => { isScrollingProgrammatic.current = false }, 800)
  }

  const getQty = (id: string) => items.find(i => i.id === id)?.quantity || 0

  const handleAdd = useCallback((item: MenuItem) => {
    addItem({ id: item.id, name: item.name, name_zh: item.name_zh, price: item.price, image_url: item.image_url, quantity: 1 })
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 400)
    toast.success(lang === 'zh' ? `已添加 ${item.name_zh}` : `Added ${item.name}`, { duration: 1200 })
  }, [addItem, lang])

  const handleMinus = useCallback((id: string, qty: number) => {
    if (qty <= 1) removeItem(id)
    else updateQuantity(id, qty - 1)
  }, [removeItem, updateQuantity])

  const searchResults = searchTerm.trim()
    ? menuItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.name_zh?.includes(searchTerm) || i.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const cycleLang = () => setLang(l => l === 'en' ? 'zh' : l === 'zh' ? 'am' : 'en')

  if (loading) {
    return (
      <div className="h-screen bg-cn-dark flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-3 border-cn-red border-t-transparent" style={{ borderWidth: 3 }} />
        <p className="text-cn-red font-cn text-sm tracking-widest">加载中...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-cn-dark overflow-hidden font-cn" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <header className="glass-header flex-shrink-0 z-30" style={{ height: 52 }}>
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cn-gradient flex items-center justify-center text-sm font-bold shadow-lg shadow-cn-red/40">🐉</div>
            <div>
              <div className="text-white text-sm font-bold leading-tight tracking-wide">DragonBurger</div>
              <div className="text-cn-gold text-[10px] leading-tight font-cn">
                {tr.tableNumber} {tableId} · {orderType === 'dine_in' ? tr.dineIn : tr.takeaway}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={cycleLang}
              className="h-7 px-2 rounded-full bg-white/5 flex items-center gap-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <span>{LANG_FLAGS[lang]}</span>
              <span className="uppercase">{lang}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── ORDER TYPE TOGGLE ── */}
      <div className="flex-shrink-0 bg-cn-surface border-b border-cn-border px-3 py-1.5 flex items-center gap-2">
        {(['dine_in', 'takeaway'] as const).map(t => (
          <button key={t} onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${orderType === t ? 'bg-cn-red text-white shadow-md shadow-cn-red/30' : 'text-gray-400 bg-white/5 hover:text-white'}`}>
            {t === 'dine_in' ? (lang === 'zh' ? '堂食' : tr.dineIn) : (lang === 'zh' ? '打包' : tr.takeaway)}
          </button>
        ))}
      </div>

      {/* ── SEARCH BAR ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 48, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 bg-cn-surface border-b border-cn-border overflow-hidden z-20">
            <div className="flex items-center gap-2 px-3 h-12">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={tr.searchPlaceholder}
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none font-cn" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BODY: SIDEBAR + DISHES ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── CATEGORY SIDEBAR ── */}
        <aside className="flex-shrink-0 bg-cn-surface border-r border-cn-border overflow-y-auto scrollbar-hide" style={{ width: 68 }}>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat.name] || { emoji: '🍽️', zh: cat.name, color: '#dc2626' }
            const isActive = activeCategory === cat.id
            return (
              <button key={cat.id} onClick={() => scrollToCategory(cat.id)}
                className={`relative w-full py-3.5 flex flex-col items-center gap-1 text-center transition-all duration-200 ${isActive ? 'bg-cn-card cat-active' : 'hover:bg-white/5'}`}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-cn-red rounded-r" />}
                <span className="text-xl leading-none">{meta.emoji}</span>
                <span className={`text-[10px] leading-tight font-cn px-1 ${isActive ? 'text-cn-red font-bold' : 'text-gray-400'}`}>
                  {lang === 'zh' ? meta.zh : cat.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </aside>

        {/* ── DISHES MAIN ── */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto scrollbar-hide bg-cn-dark">
          {searchOpen && searchTerm ? (
            /* Search Results */
            <div className="px-2 py-2">
              <p className="text-gray-400 text-xs px-1 mb-2">{searchResults.length} results for "{searchTerm}"</p>
              {searchResults.map(item => <DishCard key={item.id} item={item} qty={getQty(item.id)} lang={lang} onAdd={handleAdd} onMinus={handleMinus} onDetail={setDetailItem} />)}
              {searchResults.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-sm font-cn">{lang === 'zh' ? '未找到相关菜品' : 'No results found'}</p>
                </div>
              )}
            </div>
          ) : (
            /* Category Sections */
            categories.map(cat => {
              const meta = CATEGORY_META[cat.name] || { emoji: '🍽️', zh: cat.name, color: '#dc2626' }
              const catItems = menuItems.filter(i => i.category_id === cat.id)
              if (catItems.length === 0) return null
              return (
                <div key={cat.id} ref={el => { sectionRefs.current[cat.id] = el }} data-catid={cat.id}>
                  {/* Section Header */}
                  <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-cn-dark border-b border-cn-border/50">
                    <span className="text-base">{meta.emoji}</span>
                    <span className="text-sm font-bold text-white font-cn">{lang === 'zh' ? meta.zh : cat.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{catItems.length} {lang === 'zh' ? '款' : 'items'}</span>
                  </div>
                  {catItems.map(item => (
                    <DishCard key={item.id} item={item} qty={getQty(item.id)} lang={lang} onAdd={handleAdd} onMinus={handleMinus} onDetail={setDetailItem} />
                  ))}
                </div>
              )
            })
          )}
          <div className="h-24" />
        </main>
      </div>

      {/* ── STICKY CART BAR ── */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            className="flex-shrink-0 z-30 pb-safe bg-cn-dark border-t border-cn-border px-3 py-2">
            <button onClick={() => setCartOpen(true)}
              className="w-full h-12 bg-cn-gradient rounded-xl flex items-center px-4 shadow-xl shadow-cn-red/30 ripple overflow-hidden">
              <div className={`relative ${cartBounce ? 'animate-cart-shake' : ''}`}>
                <ShoppingCart className="w-5 h-5 text-white" />
                <motion.span key={totalItems} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-cn-gold rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {totalItems}
                </motion.span>
              </div>
              <span className="ml-3 flex-1 text-left text-white font-bold font-cn text-sm">
                {lang === 'zh' ? '去结算' : tr.checkout}
              </span>
              <span className="text-cn-gold font-bold text-base">
                ¥{totalPrice.toFixed(0)}
              </span>
              <ChevronRight className="w-4 h-4 text-white/60 ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            items={items}
            lang={lang}
            tableId={tableId}
            orderType={orderType}
            totalPrice={totalPrice}
            totalItems={totalItems}
            onClose={() => setCartOpen(false)}
            onUpdateQty={updateQuantity}
            onRemove={removeItem}
            onCheckout={() => {
              setCartOpen(false)
              router.push(`/checkout?tableId=${tableId}&type=${orderType}`)
            }}
          />
        )}
      </AnimatePresence>

      {/* ── DISH DETAIL MODAL ── */}
      <AnimatePresence>
        {detailItem && (
          <DishDetailModal
            item={detailItem}
            qty={getQty(detailItem.id)}
            lang={lang}
            noteText={noteText}
            setNoteText={setNoteText}
            onAdd={handleAdd}
            onMinus={handleMinus}
            onClose={() => { setDetailItem(null); setNoteText('') }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ════════════════════════════════════
   DISH CARD COMPONENT
════════════════════════════════════ */
function DishCard({ item, qty, lang, onAdd, onMinus, onDetail }: {
  item: MenuItem; qty: number; lang: Lang
  onAdd: (i: MenuItem) => void
  onMinus: (id: string, qty: number) => void
  onDetail: (i: MenuItem) => void
}) {
  return (
    <div className="dish-card flex items-start gap-3 px-3 py-3 border-b border-cn-border/30 relative">
      {/* Image */}
      <div className="relative flex-shrink-0 w-[88px] h-[88px] rounded-xl overflow-hidden bg-cn-surface" onClick={() => onDetail(item)}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-cn-surface to-cn-card">
            {CATEGORY_META[item.categories?.name || '']?.emoji || '🍽️'}
          </div>
        )}
        {/* Sold out overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/80 px-2 py-1 rounded font-cn">
              {lang === 'zh' ? '售罄' : 'Sold Out'}
            </span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          {item.is_popular && (
            <span className="bg-cn-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-cn leading-none">
              {lang === 'zh' ? '热销' : 'HOT'}
            </span>
          )}
          {item.is_new && (
            <span className="bg-cn-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-cn leading-none">
              {lang === 'zh' ? '新品' : 'NEW'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={() => onDetail(item)}>
        <div className="flex items-start gap-1 mb-0.5">
          {item.is_recommended && <Star className="w-3 h-3 text-cn-gold flex-shrink-0 mt-0.5" fill="currentColor" />}
          <h3 className="text-white text-sm font-bold font-cn leading-tight line-clamp-1">
            {lang === 'zh' ? item.name_zh : item.name}
          </h3>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 font-cn mb-1.5">
          {item.description}
        </p>
        {/* Spice + veg indicators */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {item.is_spicy && item.spice_level && (
            <span className="text-[10px]">{SPICE_ICONS[item.spice_level]}</span>
          )}
          {item.is_vegetarian && (
            <span className="text-[9px] border border-green-500 text-green-400 px-1 rounded font-cn">素</span>
          )}
          {item.combo_items && (
            <span className="text-[9px] border border-cn-gold text-cn-gold px-1 rounded font-cn">套餐</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-cn-red text-base font-bold">¥</span>
            <span className="text-cn-red text-lg font-bold">{item.price}</span>
          </div>
          {/* Stepper */}
          {item.is_available && (
            <div className="flex items-center gap-1.5">
              {qty > 0 ? (
                <>
                  <button onClick={() => onMinus(item.id, qty)}
                    className="stepper-btn stepper-minus">−</button>
                  <motion.span key={qty} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                    className="text-white text-sm font-bold w-5 text-center">{qty}</motion.span>
                  <button onClick={() => onAdd(item)} className="stepper-btn stepper-plus">+</button>
                </>
              ) : (
                <button onClick={() => onAdd(item)}
                  className="stepper-btn stepper-plus w-[52px] rounded-xl text-xs font-cn">
                  {lang === 'zh' ? '加入' : '+Add'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   DISH DETAIL MODAL
════════════════════════════════════ */
function DishDetailModal({ item, qty, lang, noteText, setNoteText, onAdd, onMinus, onClose }: {
  item: MenuItem; qty: number; lang: Lang
  noteText: string; setNoteText: (v: string) => void
  onAdd: (i: MenuItem) => void
  onMinus: (id: string, qty: number) => void
  onClose: () => void
}) {
  const tr = translations[lang]
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 480, margin: '0 auto' }}>
      <motion.div className="absolute inset-0 cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="relative bg-cn-card rounded-t-3xl overflow-hidden z-10">
        {/* Image */}
        <div className="relative h-44 bg-cn-surface">
          {item.image_url
            ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-cn-surface to-cn-dark">{CATEGORY_META[item.categories?.name || '']?.emoji || '🍽️'}</div>
          }
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
            <X className="w-4 h-4" />
          </button>
          {item.is_popular && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-cn-red text-white px-2 py-1 rounded-full text-xs font-bold font-cn">
              <Flame className="w-3 h-3" />{lang === 'zh' ? '热销' : 'HOT'}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          <h2 className="text-white text-lg font-bold font-cn mb-1">{lang === 'zh' ? item.name_zh : item.name}</h2>
          <p className="text-gray-400 text-sm font-cn mb-3 leading-relaxed">{item.description}</p>
          {item.combo_items && (
            <div className="mb-3 p-2 bg-cn-surface rounded-xl border border-cn-border">
              <p className="text-cn-gold text-xs font-bold font-cn mb-1">{lang === 'zh' ? '套餐包含' : 'Includes'}</p>
              {item.combo_items.map((c, i) => (
                <div key={i} className="text-gray-300 text-xs font-cn flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-cn-red inline-block" />{c}
                </div>
              ))}
            </div>
          )}
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            placeholder={tr.notePlaceholder} rows={2}
            className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 outline-none focus:border-cn-red font-cn resize-none mb-4" />
          <div className="flex items-center justify-between">
            <div className="text-cn-red text-2xl font-bold">¥{item.price}</div>
            <div className="flex items-center gap-3">
              {qty > 0 ? (
                <>
                  <button onClick={() => onMinus(item.id, qty)} className="stepper-btn stepper-minus">−</button>
                  <span className="text-white text-lg font-bold w-6 text-center">{qty}</span>
                  <button onClick={() => onAdd(item)} className="stepper-btn stepper-plus">+</button>
                </>
              ) : (
                <button onClick={() => { onAdd(item); onClose() }}
                  className="px-6 py-2.5 bg-cn-gradient text-white font-bold rounded-xl text-sm font-cn shadow-lg shadow-cn-red/30 ripple">
                  {lang === 'zh' ? '加入购物车' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════════════════════════
   CART DRAWER COMPONENT
════════════════════════════════════ */
function CartDrawer({ items, lang, tableId, orderType, totalPrice, totalItems, onClose, onUpdateQty, onRemove, onCheckout }: {
  items: CartItem[]; lang: Lang; tableId: string; orderType: string
  totalPrice: number; totalItems: number
  onClose: () => void
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}) {
  const tr = translations[lang]
  const tax = totalPrice * 0.05
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 480, margin: '0 auto' }}>
      <motion.div className="absolute inset-0 cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        className="relative bg-cn-card rounded-t-3xl z-10 max-h-[85vh] flex flex-col">
        {/* Handle + Header */}
        <div className="flex-shrink-0 pt-3 pb-2 px-4">
          <div className="w-10 h-1 bg-cn-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cn-red" />
              <span className="text-white font-bold font-cn text-base">{lang === 'zh' ? '我的购物车' : tr.cart}</span>
              <span className="text-xs text-gray-400 font-cn">{lang === 'zh' ? `桌号 ${tableId}` : `Table ${tableId}`}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-2">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
                className="flex items-center gap-3 py-3 border-b border-cn-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold font-cn line-clamp-1">{lang === 'zh' && item.name_zh ? item.name_zh : item.name}</p>
                  {item.special_instructions && (
                    <p className="text-gray-500 text-[10px] font-cn mt-0.5 line-clamp-1">备注: {item.special_instructions}</p>
                  )}
                  <p className="text-cn-red text-sm font-bold mt-0.5">¥{item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="stepper-btn stepper-minus">−</button>
                  <span className="text-white text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="stepper-btn stepper-plus">+</button>
                </div>
                <div className="text-right flex-shrink-0 w-14">
                  <p className="text-white text-sm font-bold">¥{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary + CTA */}
        <div className="flex-shrink-0 px-4 pt-3 pb-safe">
          <div className="space-y-1.5 mb-3 bg-cn-surface rounded-xl p-3 border border-cn-border">
            <div className="flex justify-between text-gray-300 text-xs font-cn">
              <span>{tr.subtotal} ({totalItems} {lang === 'zh' ? '件' : 'items'})</span>
              <span>¥{totalPrice.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-300 text-xs font-cn">
              <span>{tr.tax} (5%)</span>
              <span>¥{tax.toFixed(0)}</span>
            </div>
            <div className="border-t border-cn-border pt-1.5 flex justify-between">
              <span className="text-white font-bold font-cn text-sm">{tr.total}</span>
              <span className="text-cn-red font-bold text-lg">¥{(totalPrice + tax).toFixed(0)}</span>
            </div>
          </div>
          <button onClick={onCheckout}
            className="w-full h-12 bg-cn-gradient text-white font-bold rounded-xl font-cn text-base shadow-xl shadow-cn-red/30 flex items-center justify-center gap-2 ripple">
            <span>{lang === 'zh' ? '去结算' : tr.checkout}</span>
            <span className="text-cn-gold">¥{(totalPrice + tax).toFixed(0)}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
