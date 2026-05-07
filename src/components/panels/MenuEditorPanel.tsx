'use client'
import { useMenu } from '@/hooks/useMenu'

export function MenuEditorPanel() {
  const { menu, reset } = useMenu()
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Menu Editor</h2>
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 12 }}>
          <strong>{category}</strong>
          <div className="menu-grid" style={{ marginTop: 8 }}>
            {items.map((item) => (
              <div key={`${category}-${item.name}`} className="menu-item">
                <h4>{item.name}</h4>
                <p>PKR {item.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn" onClick={reset}>Reset to Original Menu</button>
    </div>
  )
}
