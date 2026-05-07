import { notFound } from 'next/navigation'
import { getGlossary, getGlossaryByTerm } from '@/lib/loaders'
import { GlossaryDetail } from '@/components/glossary/GlossaryDetail'

export function generateStaticParams() {
  return getGlossary().map(g => ({ term: encodeURIComponent(g.term) }))
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term: encodedTerm } = await params
  const term = decodeURIComponent(encodedTerm)
  const item = getGlossaryByTerm(term)
  if (!item) notFound()

  return <GlossaryDetail item={item} />
}
