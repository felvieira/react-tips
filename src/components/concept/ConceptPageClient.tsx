'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'
import { getRelatedTerms } from '@/lib/loaders'
import type { Concept, GlossaryItem } from '@/lib/schemas'

const DOMAIN_HUES: Record<string, number> = {
  'Performance': 150, 'React 18': 220, 'Next.js RSC': 190,
  'Padrão': 280, 'Segurança': 0, 'Hooks': 250,
  'Next.js': 190, 'Fundamentos': 60, 'DevTools': 200, 'Padrões': 300,
}

function highlight(code: string): string {
  // Tokenize into segments to avoid reprocessing spans
  type Token = { kind: 'comment' | 'string' | 'keyword' | 'func' | 'raw'; text: string }
  const tokens: Token[] = []
  const src = code
  let i = 0

  while (i < src.length) {
    // Line comment
    if (src[i] === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      const t = end === -1 ? src.slice(i) : src.slice(i, end)
      tokens.push({ kind: 'comment', text: t })
      i += t.length
      continue
    }
    // String literals
    if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
      const q = src[i]
      let j = i + 1
      while (j < src.length && src[j] !== q) {
        if (src[j] === '\\') j++
        j++
      }
      tokens.push({ kind: 'string', text: src.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Collect raw text until next special char
    const next = src.slice(i).search(/\/\/|["'`]/)
    if (next === -1) {
      tokens.push({ kind: 'raw', text: src.slice(i) })
      break
    }
    tokens.push({ kind: 'raw', text: src.slice(i, i + next) })
    i += next
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const KW = /\b(const|let|var|function|return|async|await|if|else|export|import|from|new|use(?:State|Effect|Memo|Callback|Ref|Transition|Reducer|Context|Id|LayoutEffect))\b/g
  const FN = /\b(useDebounce|useTransition|useFormStatus|useActionState)\b/g

  return tokens.map(({ kind, text }) => {
    if (kind === 'comment') return `<span class="cc">${esc(text)}</span>`
    if (kind === 'string')  return `<span class="cs">${esc(text)}</span>`
    if (kind === 'raw') {
      return esc(text)
        .replace(KW, '<span class="ck">$1</span>')
        .replace(FN, '<span class="cf">$1</span>')
    }
    return esc(text)
  }).join('')
}

interface Props {
  concept: Concept
  prev: number | null
  next: number | null
  current: number
  total: number
  relatedTerms: GlossaryItem[]
}

export function ConceptPageClient({ concept, prev, next, current, total, relatedTerms }: Props) {
  const router = useRouter()
  const { getStatus, setStatus } = useProgress()
  const [flashcard, setFlashcard] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const status = getStatus(concept.id)
  const hue = DOMAIN_HUES[concept.level] ?? 220

  // Reset flashcard state when concept changes
  useState(() => { setRevealed(false) })

  return (
    <div key={concept.id} className="content-inner animate-fade-up">
      {/* Meta */}
      <div className="concept-meta">
        <span className="domain-pill" style={{ '--h': hue } as React.CSSProperties}>
          <span className="pdot" />{concept.level}
        </span>
      </div>

      {/* Title */}
      <h1 className="concept-h1">{concept.title}</h1>
      <p className="concept-lead">{concept.summary}</p>

      {/* Actions */}
      <div className="concept-actions">
        <button
          className={'concept-btn know' + (status === 'know' ? ' active' : '')}
          onClick={() => setStatus(concept.id, status === 'know' ? 'unseen' : 'know')}
        >✓ Sei</button>
        <button
          className={'concept-btn review' + (status === 'review' ? ' active' : '')}
          onClick={() => setStatus(concept.id, status === 'review' ? 'unseen' : 'review')}
        >⟳ Revisar</button>
        <button
          className={'concept-btn flash' + (flashcard ? ' active' : '')}
          onClick={() => { setFlashcard(f => !f); setRevealed(false) }}
        >⚡ Flashcard</button>
      </div>

      {/* Flashcard curtain */}
      {flashcard && !revealed && (
        <div className="concept-section animate-scale-in">
          <div className="flashcard-curtain" onClick={() => setRevealed(true)}>
            <div className="flashcard-curtain-label">⚡ Flashcard</div>
            <div className="flashcard-curtain-hint">Pense na resposta — clique para revelar definição, problema, solução e dica.</div>
          </div>
        </div>
      )}

      {/* Content (shown when not in flashcard mode, or when revealed) */}
      {(!flashcard || revealed) && (
        <div className={revealed ? 'animate-fade-up' : ''}>
          {/* Definition */}
          <div className="concept-section">
            <div className="concept-section-label">Definição</div>
            <p>{concept.definition}</p>
          </div>

          {/* Problem → Solution */}
          {concept.problem && (
            <div className="concept-section">
              <div className="concept-section-label">Problema → Solução</div>
              <div className="callout problem">
                <div className="callout-label">Problema</div>
                {concept.problem}
              </div>
              <div style={{ height: 8 }} />
              <div className="callout solution">
                <div className="callout-label">Solução</div>
                {concept.solution}
              </div>
            </div>
          )}

          {/* Tip */}
          {concept.tip && (
            <div className="concept-section">
              <div className="concept-section-label">Dica de entrevista</div>
              <div className="callout tip">
                <div className="callout-label">Tip</div>
                {concept.tip}
              </div>
            </div>
          )}

          {/* Code */}
          {concept.code && (
            <div className="concept-section">
              <div className="concept-section-label">Código</div>
              <pre className="concept-code">
                <code dangerouslySetInnerHTML={{ __html: highlight(concept.code) }} />
              </pre>
            </div>
          )}

          {/* Interview Q&A */}
          {concept.questions && concept.questions.length > 0 && (
            <div className="concept-section">
              <div className="concept-section-label">Perguntas de entrevista</div>
              {concept.questions.map((q, i) => (
                <QABlock key={i} q={q.q} a={q.a} />
              ))}
            </div>
          )}

          {/* Related glossary terms */}
          {relatedTerms.length > 0 && (
            <div className="concept-section">
              <div className="concept-section-label">Termos relacionados</div>
              <div className="related-grid">
                {relatedTerms.map(t => (
                  <span key={t.term} className="related-chip" title={t.def}
                    onClick={() => router.push(`/glossary/${encodeURIComponent(t.term)}`)}>
                    {t.term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav arrows */}
      <NavRow prev={prev} next={next} current={current} total={total} />
    </div>
  )
}

function QABlock({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="qa-block" style={{ marginBottom: 8 }}>
      <div className="qa-q" onClick={() => setOpen(o => !o)}>
        <span className="qa-q-prefix">Q.</span>
        <span style={{ flex: 1 }}>{q}</span>
        <span style={{
          color: 'var(--fg-subtle)',
          fontSize: 12,
          transition: 'transform 0.2s ease',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▾</span>
      </div>
      <div
        className={'collapse-wrap ' + (open ? 'open' : 'closed')}
        style={{ maxHeight: open ? 600 : 0 }}
      >
        <div className="qa-a">
          <span className="qa-a-prefix">A.</span>{a}
        </div>
      </div>
    </div>
  )
}

function NavRow({ prev, next, current, total }: { prev: number | null; next: number | null; current: number; total: number }) {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      <button
        onClick={() => prev && router.push(`/concepts/${prev}`)}
        disabled={!prev}
        style={{
          flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
          borderRadius: 6, background: 'var(--bg-elev)', color: 'var(--fg-muted)',
          fontSize: 12, cursor: prev ? 'pointer' : 'default', opacity: prev ? 1 : 0.3,
          fontFamily: 'var(--font-mono)',
        }}
      >← Anterior</button>
      <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {current}/{total}
      </span>
      <button
        onClick={() => next && router.push(`/concepts/${next}`)}
        disabled={!next}
        style={{
          flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
          borderRadius: 6, background: 'var(--bg-elev)', color: 'var(--fg-muted)',
          fontSize: 12, cursor: next ? 'pointer' : 'default', opacity: next ? 1 : 0.3,
          fontFamily: 'var(--font-mono)',
        }}
      >Próximo →</button>
    </div>
  )
}
