'use client'
import { useMenu } from '@/hooks/useMenu'

export function MenuEditorPanel() {
  const { menu, reset } = useMenu()
  return (
    <div className="card">
      <h2>Menu Editor</h2>
      {Object.entries(menu).map(([category, items]) => (
        <div key={category}>
          <strong>{category}</strong>
          <p>{items.map((i) => `${i.name} (PKR ${i.price})`).join(', ')}</p>
        </div>
      ))}
      <button className="btn" onClick={reset}>Reset to Original Menu</button>
    </div>
  )
}
