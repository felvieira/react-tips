import { z } from 'zod'
import { ConceptSchema, GlossaryItemSchema, type Concept, type GlossaryItem } from './schemas'
import rawConcepts from '@/data/concepts.json'
import rawGlossary from '@/data/glossary.json'

export function getConcepts(): Concept[] {
  return z.array(ConceptSchema).parse(rawConcepts)
}

export function getConceptById(id: number): Concept | undefined {
  return getConcepts().find(c => c.id === id)
}

export function getConceptLevels(): string[] {
  return [...new Set(getConcepts().map(c => c.level))]
}

export function getGlossary(): GlossaryItem[] {
  return z.array(GlossaryItemSchema).parse(rawGlossary)
}

export function getGlossaryByTerm(term: string): GlossaryItem | undefined {
  return getGlossary().find(g => g.term === term)
}

export function getGlossaryCategories(): string[] {
  return [...new Set(getGlossary().map(g => g.category))]
}
