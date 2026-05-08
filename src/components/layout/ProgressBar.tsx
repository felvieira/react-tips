'use client'
import { usePathname } from 'next/navigation'
import { getConcepts } from '@/lib/loaders'

const concepts = getConcepts()
const total = concepts.length

export function ProgressBar() {
  const pathname = usePathname()
  const match = pathname.match(/\/concepts\/(\d+)/)
  if (!match) return null
  const id = Number(match[1])
  const idx = concepts.findIndex(c => c.id === id)
  if (idx === -1) return null
  const pct = Math.round(((idx + 1) / total) * 100)
  return (
    <div className="progress-bar-wrap" style={{ position: 'fixed', top: 48, left: 0, right: 0 }}>
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
