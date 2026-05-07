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
  if (!query.trim()) return []
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
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="app-searchbar"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}
    >
      🔍 <span>Busca global</span>
      <kbd>⌘K</kbd>
    </button>
  )

  return (
    <div className="search-overlay">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="search-modal">
        <div className="search-input-row">
          <span style={{ fontSize: '1.125rem' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar conceitos, hooks, patterns, termos..."
            className="search-input"
          />
          <kbd>ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="search-results">
            {results.map((r, i) => (
              <button
                key={r.href}
                onClick={() => navigate(r.href)}
                onMouseEnter={() => setSelected(i)}
                className={'search-result' + (selected === i ? ' active' : '')}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{r.emoji}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{r.subtitle}</div>
                </div>
                <span
                  className="search-result-where"
                  style={{ color: r.tagColor, backgroundColor: `${r.tagColor}18` }}
                >
                  {r.tag}
                </span>
              </button>
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
