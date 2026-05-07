'use client'
import { useState } from 'react'
import { ConceptHero } from './ConceptHero'
import { DefinitionBlock } from './DefinitionBlock'
import { SectionGrid } from './SectionGrid'
import { TipBlock } from './TipBlock'
import { QuestionAccordion } from './QuestionAccordion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { NavArrows } from './NavArrows'
import { ProgressButtons } from './ProgressButtons'
import { FlashcardMode } from './FlashcardMode'
import { RelatedTerms } from './RelatedTerms'
import type { Concept, GlossaryItem } from '@/lib/schemas'

interface ConceptPageClientProps {
  concept: Concept
  prev: number | null
  next: number | null
  current: number
  total: number
  relatedTerms: GlossaryItem[]
}

export function ConceptPageClient({ concept, prev, next, current, total, relatedTerms }: ConceptPageClientProps) {
  const [flashcard, setFlashcard] = useState(false)

  const sections = [
    { label: 'Problema', icon: '🔴', color: '#f87171', text: concept.problem },
    { label: 'Solução', icon: '✅', color: '#4ade80', text: concept.solution },
  ]

  if (flashcard) {
    return <FlashcardMode concept={concept} onExit={() => setFlashcard(false)} />
  }

  return (
    <div>
      <ConceptHero concept={concept}>
        <div className="flex items-center gap-2 mt-4">
          <ProgressButtons conceptId={concept.id} />
          <button
            onClick={() => setFlashcard(true)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border border-border text-muted hover:border-accent hover:text-accent transition-all"
          >
            ⚡ Flashcard
          </button>
        </div>
      </ConceptHero>
      <div className="px-6 md:px-9 pb-9 max-w-3xl">
        <DefinitionBlock text={concept.definition} />
        <SectionGrid items={sections} />
        <TipBlock text={concept.tip} />
        <QuestionAccordion questions={concept.questions} />
        <CodeBlock code={concept.code} />
        <RelatedTerms terms={relatedTerms} />
        <NavArrows prevId={prev} nextId={next} current={current} total={total} />
      </div>
    </div>
  )
}
