import { z } from 'zod'

export const QuestionSchema = z.object({
  q: z.string(),
  a: z.string(),
})

export const ConceptSchema = z.object({
  id: z.number(),
  emoji: z.string(),
  title: z.string(),
  level: z.string(),
  color: z.string(),
  summary: z.string(),
  definition: z.string(),
  problem: z.string(),
  solution: z.string(),
  tip: z.string(),
  questions: z.array(QuestionSchema),
  code: z.string(),
})

export const GlossaryItemSchema = z.object({
  term: z.string(),
  category: z.string(),
  def: z.string(),
  what: z.string().optional(),
  whenUse: z.string().optional(),
  whenNot: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  code: z.string().optional(),
})

export type Concept = z.infer<typeof ConceptSchema>
export type GlossaryItem = z.infer<typeof GlossaryItemSchema>
export type Question = z.infer<typeof QuestionSchema>
