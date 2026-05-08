'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Concept, GlossaryItem } from '@/lib/schemas'

interface SearchResult {
  type: 'concept' | 'glossary'
  href: string
  emoji: string
  title: string
  subtitle: string
  tag: string
  tagColor: string
}

function searchAll(query: string, concepts: Concept[], glossary: GlossaryItem[]): SearchResult[] {
  if (!query.trim()) {
    return concepts.slice(0, 8).map(c => ({
      type: 'concept' as const,
      href: `/concepts/${c.id}`,
      emoji: c.emoji,
      title: c.title,
      subtitle: c.summary,
      tag: c.level,
      tagColor: c.color,
    }))
  }
  const q = query.toLowerCase()

  const conceptResults: SearchResult[] = concepts
    .filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q) ||
      c.problem.toLowerCase().includes(q) ||
      c.solution.toLowerCase().includes(q) ||
      c.tip.toLowerCase().includes(q) ||
      c.questions.some(qq => qq.q.toLowerCase().includes(q) || qq.a.toLowerCase().includes(q))
    )
    .slice(0, 8)
    .map(c => ({
      type: 'concept',
      href: `/concepts/${c.id}`,
      emoji: c.emoji,
      title: c.title,
      subtitle: c.summary,
      tag: c.level,
      tagColor: c.color,
    }))

  const glossaryResults: SearchResult[] = glossary
    .filter(g =>
      g.term.toLowerCase().includes(q) ||
      g.def.toLowerCase().includes(q) ||
      (g.what ?? '').toLowerCase().includes(q) ||
      (g.whenUse ?? '').toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map(g => ({
      type: 'glossary',
      href: `/glossary/${encodeURIComponent(g.term)}`,
      emoji: '📖',
      title: g.term,
      subtitle: g.def,
      tag: g.category,
      tagColor: '#38bdf8',
    }))

  return [...conceptResults, ...glossaryResults]
}

interface GlobalSearchProps {
  concepts: Concept[]
  glossary: GlossaryItem[]
}

export function GlobalSearch({ concepts, glossary }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const results = searchAll(query, concepts, glossary)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  const navigate = useCallback((href: string) => {
    router.push(href)
    close()
  }, [router, close])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') close()
    }
    const openHandler = () => setOpen(true)
    window.addEventListener('keydown', handler)
    window.addEventListener('open-search', openHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('open-search', openHandler)
    }
  }, [close])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected].href)
    }
  }

  if (!open) return null

  return (
    <div className="search-overlay">
      <div style={{ position: 'absolute', inset: 0 }} onClick={close} />
      <div className="search-modal animate-scale-in">
        <div className="search-input-row">
          <span style={{ fontSize: '1.125rem' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar conceitos, hooks, patterns, termos..."
            style={{ flex: 1, font: 'inherit', fontSize: 15, background: 'transparent', border: 0, color: 'var(--fg)', outline: 'none' }}
          />
          <kbd>ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="search-results animate-slide-down">
            <div className="search-section-lbl">{!query ? 'Conceitos' : 'Resultados'}</div>
            {results.map((r, i) => (
              <div
                key={r.href}
                onClick={() => navigate(r.href)}
                onMouseEnter={() => setSelected(i)}
                className={'search-result' + (selected === i ? ' active' : '')}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                <span className="search-result-where" style={{ color: r.tagColor }}>{r.tag}</span>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="search-empty">
            Nenhum resultado para &quot;{query}&quot;
          </div>
        )}

        {!query && (
          <div style={{ padding: '16px', fontSize: 11, color: 'var(--fg-muted)', display: 'flex', gap: 16 }}>
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>ESC fechar</span>
          </div>
        )}
      </div>
    </div>
  )
}
