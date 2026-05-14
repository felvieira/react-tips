'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DOMAIN_HUES } from '@/lib/constants'

interface Question {
  conceptId: number
  conceptTitle: string
  conceptLevel: string
  conceptColor: string
  q: string
  a: string
  gotcha: boolean
  key: string
}

interface Props {
  questions: Question[]
  levels: string[]
}

export function QuestionsClient({ questions, levels }: Props) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const [onlyGotcha, setOnlyGotcha] = useState(false)
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())

  const filtered = useMemo(() =>
    questions.filter(q => {
      if (activeLevel && q.conceptLevel !== activeLevel) return false
      if (onlyGotcha && !q.gotcha) return false
      return true
    }),
    [questions, activeLevel, onlyGotcha]
  )

  // Group by concept
  const groups = useMemo(() => {
    const map = new Map<number, { title: string; level: string; color: string; items: Question[] }>()
    for (const q of filtered) {
      if (!map.has(q.conceptId)) {
        map.set(q.conceptId, { title: q.conceptTitle, level: q.conceptLevel, color: q.conceptColor, items: [] })
      }
      map.get(q.conceptId)!.items.push(q)
    }
    return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }))
  }, [filtered])

  const toggle = (key: string) => {
    setOpenKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const gotchaCount = questions.filter(q => q.gotcha).length

  return (
    <>
      <div className="qpage-filter-row animate-fade-in">
        <button
          className={'qpage-filter-btn' + (!activeLevel && !onlyGotcha ? ' active' : '')}
          onClick={() => { setActiveLevel(null); setOnlyGotcha(false) }}
        >Todos ({questions.length})</button>

        {levels.map(l => (
          <button
            key={l}
            className={'qpage-filter-btn' + (activeLevel === l && !onlyGotcha ? ' active' : '')}
            onClick={() => { setActiveLevel(l); setOnlyGotcha(false) }}
            style={activeLevel === l && !onlyGotcha ? { '--accent-h': DOMAIN_HUES[l] ?? 220 } as React.CSSProperties : {}}
          >
            {l}
          </button>
        ))}

        <button
          className={'qpage-filter-btn' + (onlyGotcha ? ' active' : '')}
          style={onlyGotcha ? { background: 'oklch(0.65 0.16 25 / 0.15)', color: 'oklch(0.75 0.14 25)', borderColor: 'oklch(0.65 0.16 25 / 0.4)' } : {}}
          onClick={() => { setOnlyGotcha(v => !v); setActiveLevel(null) }}
        >
          ⚠ Pegadinhas ({gotchaCount})
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
          Nenhuma pergunta com esses filtros.
        </div>
      )}

      {groups.map(g => (
        <div key={g.id} className="qpage-group">
          <div className="qpage-group-title" style={{ '--h': DOMAIN_HUES[g.level] ?? 220 } as React.CSSProperties}>
            <span style={{ color: `oklch(0.6 0.12 ${DOMAIN_HUES[g.level] ?? 220})` }}>{g.title}</span>
            <span style={{ color: 'var(--fg-subtle)', fontWeight: 400 }}>· {g.items.length} {g.items.length === 1 ? 'pergunta' : 'perguntas'}</span>
          </div>
          <div className="animate-stagger">
            {g.items.map(q => {
              const isOpen = openKeys.has(q.key)
              return (
                <div key={q.key} className="qpage-card">
                  <div className="qpage-q" onClick={() => toggle(q.key)}>
                    <span className="qpage-q-prefix">Q.</span>
                    <span className="qpage-q-text">{q.q}</span>
                    <div className="qpage-q-meta">
                      {q.gotcha && <span className="qpage-gotcha">⚠ pegadinha</span>}
                      <span className="qpage-toggle">{isOpen ? '▲' : '▾'}</span>
                    </div>
                  </div>
                  <div
                    className={'collapse-wrap ' + (isOpen ? 'open' : 'closed')}
                    style={{ maxHeight: isOpen ? 800 : 0 }}
                  >
                    <div className="qpage-a">
                      <span className="qpage-a-prefix">A.</span>
                      {q.a}
                      <Link href={`/concepts/${q.conceptId}`} className="qpage-concept-link">
                        ver conceito →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
