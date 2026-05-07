export function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--green-pale)' }}>{children}</span>
}
