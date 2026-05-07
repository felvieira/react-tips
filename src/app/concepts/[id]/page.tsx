import { notFound } from 'next/navigation'
import { getConcepts, getConceptById } from '@/lib/loaders'
import { ConceptHero } from '@/components/concept/ConceptHero'
import { DefinitionBlock } from '@/components/concept/DefinitionBlock'
import { SectionGrid } from '@/components/concept/SectionGrid'
import { TipBlock } from '@/components/concept/TipBlock'
import { QuestionAccordion } from '@/components/concept/QuestionAccordion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { NavArrows } from '@/components/concept/NavArrows'

export function generateStaticParams() {
  return getConcepts().map(c => ({ id: String(c.id) }))
}

export default async function ConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  const concept = getConceptById(id)
  if (!concept) notFound()

  const all = getConcepts()
  const idx = all.findIndex(c => c.id === id)
  const prev = all[idx - 1]?.id ?? null
  const next = all[idx + 1]?.id ?? null

  const sections = [
    { label: 'Problema', icon: '🔴', color: '#f87171', text: concept.problem },
    { label: 'Solução', icon: '✅', color: '#4ade80', text: concept.solution },
  ]

  return (
    <div>
      <ConceptHero concept={concept} />
      <div className="px-9 pb-9">
        <DefinitionBlock text={concept.definition} />
        <SectionGrid items={sections} />
        <TipBlock text={concept.tip} />
        <QuestionAccordion questions={concept.questions} />
        <CodeBlock code={concept.code} />
        <NavArrows prevId={prev} nextId={next} current={idx + 1} total={all.length} />
      </div>
    </div>
  )
}
