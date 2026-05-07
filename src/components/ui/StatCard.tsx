export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <small>{label}</small>
      <h3 style={{ margin: 0 }}>{value}</h3>
    </div>
  )
}
