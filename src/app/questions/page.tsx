import type { Metadata } from 'next'
import { getConcepts } from '@/lib/loaders'
import { QuestionsClient } from '@/components/questions/QuestionsClient'

export const metadata: Metadata = {
  title: 'Perguntas de Entrevista',
  description: '144+ perguntas de entrevista React, Next.js e TypeScript organizadas por tópico.',
}

export default function QuestionsPage() {
  const concepts = getConcepts()

  // Flatten all Q&As with their parent concept
  const allQuestions = concepts.flatMap(c =>
    c.questions.map((q, i) => ({
      conceptId: c.id,
      conceptTitle: c.title,
      conceptLevel: c.level,
      conceptColor: c.color,
      q: q.q,
      a: q.a,
      // Mark as "gotcha" if answer mentions common pitfall words
      gotcha: /nunca|nunca|não .*(sempre|basta)|piora|erro|armadilha|cuidado|overhead|pior|falha|problema|stale|raro|não .*ajuda|não .*funciona/i.test(q.a),
      key: `${c.id}-${i}`,
    }))
  )

  const levels = [...new Set(concepts.map(c => c.level))]

  return (
    <div className="app-content">
      <div className="content-inner">
        <div className="concept-meta">
          <span className="domain-pill">
            <span className="pdot" style={{ background: 'oklch(0.72 0.14 60)' }} />Perguntas
          </span>
        </div>
        <h1 className="concept-h1">Perguntas de Entrevista</h1>
        <p className="concept-lead">
          {allQuestions.length} perguntas de todos os conceitos. Filtre por tópico para focar no que a entrevista vai cobrar.
        </p>
        <QuestionsClient questions={allQuestions} levels={levels} />
      </div>
    </div>
  )
}
