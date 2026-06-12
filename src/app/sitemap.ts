import { getConcepts, getGlossary } from '@/lib/loaders'

const BASE = 'https://react-tips.felipev.com.br'

export default function sitemap() {
  const concepts = getConcepts()
  const glossary = getGlossary()

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE}/questions`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE}/glossary`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE}/arquitetura`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    ...concepts.map(c => ({
      url: `${BASE}/concepts/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...glossary.map(g => ({
      url: `${BASE}/glossary/${encodeURIComponent(g.term)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
