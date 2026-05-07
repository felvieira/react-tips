import { notFound } from 'next/navigation'
import { getGlossary, getGlossaryByTerm } from '@/lib/loaders'

export function generateStaticParams() {
  return getGlossary().map(g => ({ term: encodeURIComponent(g.term) }))
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term: encodedTerm } = await params
  const term = decodeURIComponent(encodedTerm)
  const item = getGlossaryByTerm(term)
  if (!item) notFound()

  return (
    <div className="app-content">
      <div className="content-inner">
        <div className="concept-meta">
          <span className="domain-pill">
            <span className="pdot" style={{ background: 'var(--accent)' }} />{item.category}
          </span>
        </div>
        <h1 className="concept-h1">{item.term}</h1>
        <p className="concept-lead">{item.def}</p>

        {item.what && (
          <div className="concept-section">
            <div className="concept-section-label">O que é</div>
            <p>{item.what}</p>
          </div>
        )}

        {(item.whenUse || item.whenNot) && (
          <div className="concept-section">
            <div className="concept-section-label">Quando usar / não usar</div>
            {item.whenUse && (
              <div className="callout solution" style={{ marginBottom: 8 }}>
                <div className="callout-label">✅ Quando usar</div>
                {item.whenUse}
              </div>
            )}
            {item.whenNot && (
              <div className="callout problem">
                <div className="callout-label">🚫 Quando NÃO usar</div>
                {item.whenNot}
              </div>
            )}
          </div>
        )}

        {(item.pros || item.cons) && (
          <div className="concept-section">
            <div className="concept-section-label">Prós / Contras</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {item.pros && (
                <div>
                  <div className="callout-label" style={{ marginBottom: 8 }}>👍 Prós</div>
                  {item.pros.map(p => (
                    <div key={p} style={{ padding: '4px 0', fontSize: 13, color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'oklch(0.65 0.14 150)', marginRight: 6 }}>✓</span>{p}
                    </div>
                  ))}
                </div>
              )}
              {item.cons && (
                <div>
                  <div className="callout-label" style={{ marginBottom: 8 }}>👎 Contras</div>
                  {item.cons.map(c => (
                    <div key={c} style={{ padding: '4px 0', fontSize: 13, color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'oklch(0.65 0.16 25)', marginRight: 6 }}>✗</span>{c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {item.code && (
          <div className="concept-section">
            <div className="concept-section-label">Exemplo</div>
            <pre className="concept-code"><code>{item.code}</code></pre>
          </div>
        )}
      </div>
    </div>
  )
}
