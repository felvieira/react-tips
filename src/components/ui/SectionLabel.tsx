import { type ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  color?: string
}

export function SectionLabel({ children, color = '#c9d8f0' }: SectionLabelProps) {
  return (
    <div
      className="text-[10px] uppercase tracking-[2px] font-bold mb-2.5 flex items-center gap-1.5"
      style={{ color }}
    >
      {children}
    </div>
  )
}
