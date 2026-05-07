import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Concept } from '@/lib/schemas'

interface ConceptHeroProps {
  concept: Concept
  children?: ReactNode
}

export function ConceptHero({ concept, children }: ConceptHeroProps) {
  return (
    <div className="px-9 pt-7 pb-6 border-b border-border bg-gradient-to-br from-surface to-bg">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-5xl leading-none">{concept.emoji}</span>
        <div>
          <Badge label={concept.level} color={concept.color} className="mb-2" />
          <h2 className="font-display text-2xl text-white leading-tight">{concept.title}</h2>
        </div>
      </div>
      <p className="text-[14px] text-[#7a9cc0] leading-[1.8] max-w-2xl">{concept.summary}</p>
      {children}
    </div>
  )
}
