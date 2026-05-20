import type { ReactNode } from 'react'

// Layout dedicado para a página de print — sem sidebar, sem chat, sem topbar.
// Maximiza espaço útil para a cola física.
export default function PrintLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: '100vh', background: 'white' }}>{children}</div>
}
