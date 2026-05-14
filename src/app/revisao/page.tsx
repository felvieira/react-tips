'use client'
import { useState, useEffect } from 'react'
import { getConcepts } from '@/lib/loaders'
import { useProgress } from '@/hooks/useProgress'
import Link from 'next/link'

const ALL_CONCEPTS = getConcepts()

export default function RevisaoPage() {
  const { getStatus, setStatus } = useProgress()
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const toReview = ALL_CONCEPTS.filter(c => getStatus(c.id) === 'review')

  useEffect(() => { setRevealed(false) }, [idx])

  if (toReview.length === 0) {
    return (
      <div className="app-content">
        <div className="content-inner" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 className="concept-h1">Nenhum conceito para revisar</h1>
          <p className="concept-lead">Marque conceitos como "⟳ Revisar" para aparecerem aqui.</p>
          <Link href="/concepts/1" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            ← Voltar aos conceitos
          </Link>
        </div>
      </div>
    )
  }

  const concept = toReview[idx] ?? toReview[toReview.length - 1]

  return (
    <div className="app-content">
      <div className="content-inner">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ⟳ Revisão Rápida — {idx + 1} / {toReview.length}
          </div>
          <Link href="/concepts/1" style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 6 }}>
            ✕ Sair
          </Link>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, marginBottom: 32 }}>
          <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, width: `${((idx + 1) / toReview.length) * 100}%`, transition: 'width .3s ease' }} />
        </div>

        {/* Card */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{concept.emoji}</div>
          <div className="domain-pill" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="pdot" style={{ '--h': 220 } as React.CSSProperties} />{concept.level}
          </div>
          <h1 className="concept-h1" style={{ marginBottom: 12 }}>{concept.title}</h1>
          <p className="concept-lead" style={{ marginBottom: 0 }}>{concept.summary}</p>
        </div>

        {!revealed ? (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setRevealed(true)}
              style={{ padding: '10px 32px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Revelar
            </button>
          </div>
        ) : (
          <>
            <div className="callout" style={{ marginBottom: 12 }}>
              <div className="callout-label">Definição</div>
              {concept.definition}
            </div>
            <div className="callout tip" style={{ marginBottom: 32 }}>
              <div className="callout-label">💡 Dica</div>
              {concept.tip}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setStatus(concept.id, 'know')
                  // Clamp idx after status update — toReview will shrink by 1
                  setIdx(i => Math.min(i, toReview.length - 2))
                }}
                style={{ flex: 1, maxWidth: 180, padding: '10px 0', background: 'oklch(0.65 0.14 150 / 0.15)', color: 'oklch(0.55 0.14 150)', border: '1px solid oklch(0.65 0.14 150 / 0.4)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                ✓ Sei — próximo
              </button>
              <button
                onClick={() => setIdx(i => Math.min(i + 1, toReview.length - 1))}
                style={{ flex: 1, maxWidth: 180, padding: '10px 0', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', cursor: 'pointer' }}
              >
                Pular →
              </button>
            </div>
            {idx === toReview.length - 1 && (
              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                Fim da revisão!{' '}
                <Link href="/concepts/1" style={{ color: 'var(--accent)' }}>Voltar</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
