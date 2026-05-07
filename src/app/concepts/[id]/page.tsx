import { notFound } from 'next/navigation'
import { getConcepts, getConceptById, getRelatedTerms } from '@/lib/loaders'
import { ConceptPageClient } from '@/components/concept/ConceptPageClient'

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
  const relatedTerms = getRelatedTerms(concept)

  return (
    <ConceptPageClient
      concept={concept}
      prev={all[idx - 1]?.id ?? null}
      next={all[idx + 1]?.id ?? null}
      current={idx + 1}
      total={all.length}
      relatedTerms={relatedTerms}
    />
  )
}
