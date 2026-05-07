'use client'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import { getConcepts, getConceptById } from '@/lib/loaders'
import { ConceptHero } from '@/components/concept/ConceptHero'
import { DefinitionBlock } from '@/components/concept/DefinitionBlock'
import { SectionGrid } from '@/components/concept/SectionGrid'
import { TipBlock } from '@/components/concept/TipBlock'
import { QuestionAccordion } from '@/components/concept/QuestionAccordion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { NavArrows } from '@/components/concept/NavArrows'
import { ProgressButtons } from '@/components/concept/ProgressButtons'
import { FlashcardMode } from '@/components/concept/FlashcardMode'
import type { Concept } from '@/lib/schemas'

// ─── Client view wrapper ────────────────────────────────────────────────────
interface ConceptViewProps {
  concept: Concept
  prev: number | null
  next: number | null
  current: number
  total: number
}

function ConceptView({ concept, prev, next, current, total }: ConceptViewProps) {
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
      <div className="px-9 pb-9">
        <DefinitionBlock text={concept.definition} />
        <SectionGrid items={sections} />
        <TipBlock text={concept.tip} />
        <QuestionAccordion questions={concept.questions} />
        <CodeBlock code={concept.code} />
        <NavArrows prevId={prev} nextId={next} current={current} total={total} />
      </div>
    </div>
  )
}

// ─── Static params ──────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getConcepts().map(c => ({ id: String(c.id) }))
}

// ─── Page (client component — params is NOT a Promise) ───────────────────────
export default function ConceptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const concept = getConceptById(id)
  if (!concept) notFound()

  const all = getConcepts()
  const idx = all.findIndex(c => c.id === id)

  return (
    <ConceptView
      concept={concept}
      prev={all[idx - 1]?.id ?? null}
      next={all[idx + 1]?.id ?? null}
      current={idx + 1}
      total={all.length}
    />
  )
}
