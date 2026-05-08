'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, QrCode, Download, Trash2, RefreshCw, Check, Copy, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface RestaurantTable {
  id: string
  table_number: string
  capacity: number
  location?: string
  is_active: boolean
  qr_url?: string
  created_at: string
}

const DEFAULT_TABLES: RestaurantTable[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  table_number: String(i + 1),
  capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
  location: i < 4 ? '一楼' : i < 8 ? '二楼' : 'VIP包厢',
  is_active: true,
  created_at: new Date().toISOString(),
}))

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>(DEFAULT_TABLES)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [newTable, setNewTable] = useState({ number: '', capacity: '4', location: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const generateQR = async (table: RestaurantTable) => {
    const url = `${baseUrl}/order/${table.table_number}`
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#dc2626', light: '#0d0505' },
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(dataUrl)
      setSelectedTable({ ...table, qr_url: url })
    } catch (err) {
      toast.error('Failed to generate QR code')
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl || !selectedTable) return
    const link = document.createElement('a')
    link.download = `DragonBurger-Table-${selectedTable.table_number}.png`
    link.href = qrDataUrl
    link.click()
    toast.success(`Table ${selectedTable.table_number} QR downloaded`)
  }

  const copyUrl = (tableNum: string) => {
    const url = `${baseUrl}/order/${tableNum}`
    navigator.clipboard.writeText(url)
    toast.success('QR URL copied!')
  }

  const addTable = () => {
    if (!newTable.number.trim()) return toast.error('Enter a table number')
    if (tables.find(t => t.table_number === newTable.number)) return toast.error('Table already exists')
    const table: RestaurantTable = {
      id: `table-${newTable.number}`,
      table_number: newTable.number,
      capacity: parseInt(newTable.capacity) || 4,
      location: newTable.location || '一楼',
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setTables(prev => [...prev, table])
    setNewTable({ number: '', capacity: '4', location: '' })
    setShowAddForm(false)
    toast.success(`Table ${newTable.number} added`)
  }

  const toggleActive = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t))
  }

  const locationGroups = tables.reduce((acc, t) => {
    const loc = t.location || 'Other'
    if (!acc[loc]) acc[loc] = []
    acc[loc].push(t)
    return acc
  }, {} as Record<string, RestaurantTable[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">桌位 & QR 管理</h1>
          <p className="text-gray-400 text-sm mt-1">Table & QR Code Management · {tables.filter(t => t.is_active).length} active tables</p>
        </div>
        <button onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-cn-gradient text-white rounded-xl font-bold text-sm shadow-lg shadow-cn-red/20 hover:shadow-cn-red/40 transition-all">
          <Plus className="w-4 h-4" />
          添加桌位
        </button>
      </div>

      {/* Add Table Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cn-card border border-cn-border rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 font-cn">新增桌位</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block font-cn">桌号 *</label>
              <input value={newTable.number} onChange={e => setNewTable(p => ({ ...p, number: e.target.value }))}
                placeholder="e.g. A1"
                className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cn-red" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block font-cn">容量</label>
              <input type="number" value={newTable.capacity} onChange={e => setNewTable(p => ({ ...p, capacity: e.target.value }))}
                min={1} max={20}
                className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cn-red" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block font-cn">区域</label>
              <input value={newTable.location} onChange={e => setNewTable(p => ({ ...p, location: e.target.value }))}
                placeholder="一楼 / VIP"
                className="w-full bg-cn-surface border border-cn-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cn-red" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addTable} className="px-5 py-2 bg-cn-gradient text-white rounded-xl text-sm font-bold font-cn shadow-md shadow-cn-red/20">
              添加
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-5 py-2 bg-cn-surface border border-cn-border text-gray-400 rounded-xl text-sm font-cn hover:text-white transition-colors">
              取消
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables Grid */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(locationGroups).map(([location, locTables]) => (
            <div key={location}>
              <h3 className="text-cn-gold font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cn-gold" />
                {location} ({locTables.length} tables)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {locTables.map(table => (
                  <motion.button key={table.id}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => generateQR(table)}
                    className={`relative p-4 rounded-2xl border text-left transition-all ${
                      selectedTable?.id === table.id
                        ? 'border-cn-red bg-cn-red/10 shadow-lg shadow-cn-red/20'
                        : table.is_active
                          ? 'border-cn-border bg-cn-card hover:border-cn-red/50'
                          : 'border-cn-border/30 bg-cn-surface/50 opacity-50'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <QrCode className={`w-5 h-5 ${selectedTable?.id === table.id ? 'text-cn-red' : 'text-gray-400'}`} />
                      <span className={`w-2 h-2 rounded-full ${table.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                    </div>
                    <div className="text-white font-bold text-lg font-cn leading-none">桌 {table.table_number}</div>
                    <div className="text-gray-400 text-xs mt-1">{table.capacity} 人 · {table.location}</div>
                    {selectedTable?.id === table.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-3 h-3 text-cn-red" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* QR Preview Panel */}
        <div className="space-y-4">
          <div className="bg-cn-card border border-cn-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 font-cn flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cn-red" />
              QR 预览
            </h3>
            {selectedTable && qrDataUrl ? (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="bg-cn-dark p-3 rounded-2xl border border-cn-border mb-3">
                    <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold font-cn text-lg">桌号 {selectedTable.table_number}</div>
                    <div className="text-gray-400 text-xs mt-1 font-cn">{selectedTable.capacity}人桌 · {selectedTable.location}</div>
                  </div>
                </div>
                {/* QR URL */}
                <div className="bg-cn-surface rounded-xl p-3 mb-4 border border-cn-border">
                  <p className="text-gray-400 text-[10px] mb-1 font-cn">扫码链接</p>
                  <p className="text-cn-gold text-xs font-mono break-all line-clamp-2">{selectedTable.qr_url}</p>
                </div>
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={downloadQR}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-cn-gradient text-white rounded-xl text-xs font-bold font-cn shadow-md shadow-cn-red/20">
                    <Download className="w-3 h-3" />下载
                  </button>
                  <button onClick={() => copyUrl(selectedTable.table_number)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-cn-surface border border-cn-border text-gray-300 rounded-xl text-xs font-bold font-cn hover:border-cn-red hover:text-white transition-all">
                    <Copy className="w-3 h-3" />复制链接
                  </button>
                  <a href={selectedTable.qr_url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-cn-surface border border-cn-border text-gray-300 rounded-xl text-xs font-bold font-cn hover:border-cn-gold hover:text-cn-gold transition-all">
                    <Eye className="w-3 h-3" />预览
                  </a>
                  <button onClick={() => toggleActive(selectedTable.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold font-cn border transition-all ${
                      selectedTable.is_active
                        ? 'bg-cn-surface border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'bg-cn-surface border-green-500/30 text-green-400 hover:bg-green-500/10'
                    }`}>
                    {selectedTable.is_active ? '停用' : '启用'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-cn">点击桌位生成QR码</p>
                <p className="text-xs mt-1">Click a table to generate QR</p>
              </div>
            )}
          </div>

          {/* Print All QRs Tip */}
          <div className="bg-cn-surface border border-cn-border rounded-xl p-4">
            <p className="text-cn-gold text-xs font-bold font-cn mb-1">💡 使用提示</p>
            <p className="text-gray-400 text-xs font-cn leading-relaxed">
              点击任意桌位生成专属 QR 码，下载后打印放置于桌面。客人扫码即可直接点餐无需注册。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
