import Link from 'next/link'
import type { GlossaryItem } from '@/lib/schemas'

interface RelatedTermsProps {
  terms: GlossaryItem[]
}

export function RelatedTerms({ terms }: RelatedTermsProps) {
  if (terms.length === 0) return null

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-3 flex items-center gap-1.5">
        🔗 Termos do dicionário
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map(t => (
          <Link
            key={t.term}
            href={`/glossary/${encodeURIComponent(t.term)}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] text-text hover:border-accent hover:text-accent transition-all"
          >
            <span className="text-accent text-[9px] uppercase tracking-[1px] font-bold">{t.category}</span>
            <span className="text-muted">·</span>
            {t.term}
          </Link>
        ))}
      </div>
    </div>
  )
}
