import Link from 'next/link'
import type { GlossaryItem } from '@/lib/schemas'

export function GlossaryCard({ item }: { item: GlossaryItem }) {
  return (
    <Link
      href={`/glossary/${encodeURIComponent(item.term)}`}
      className="block bg-surface border border-border rounded-xl px-[18px] py-4 transition-all hover:border-accent"
    >
      <div className="font-display text-[15px] text-white mb-1">{item.term}</div>
      <div className="text-[9px] text-accent uppercase tracking-[1.5px] mb-2">{item.category}</div>
      <p className="text-[12px] text-[#8aaccc] leading-relaxed">{item.def}</p>
    </Link>
  )
}
