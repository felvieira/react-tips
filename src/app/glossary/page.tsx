import type { Metadata } from 'next'
import { getGlossary } from '@/lib/loaders'

export const metadata: Metadata = {
  title: 'Glossário',
  description: 'Glossário completo de termos React, Next.js e frontend para entrevistas técnicas.',
}

export default function GlossaryPage() {
  const items = getGlossary()
  return (
    <div className="app-content">
      <div className="content-inner">
        <div className="concept-meta">
          <span className="domain-pill">
            <span className="pdot" style={{ background: 'var(--fg-muted)' }} />Dicionário
          </span>
        </div>
        <h1 className="concept-h1">Dicionário técnico</h1>
        <p className="concept-lead">{items.length} termos para olhar de relance durante a entrevista.</p>
        <div className="glossary-list">
          {items.map(g => (
            <div key={g.term} className="glossary-item">
              <div className="glossary-term">{g.term}</div>
              <div className="glossary-def">{g.def}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
