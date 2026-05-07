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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-[11px] text-muted hover:border-accent hover:text-accent transition-all shadow-lg"
    >
      🔍 <span>Busca global</span>
      <kbd className="text-[9px] px-1.5 py-0.5 bg-surface2 border border-border rounded font-mono">⌘K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-2xl mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <span className="text-muted text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar conceitos, hooks, patterns, termos..."
            className="flex-1 bg-transparent text-text text-[14px] placeholder-muted outline-none font-mono"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 bg-surface2 border border-border rounded text-muted font-mono">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin py-2">
            {results.map((r, i) => (
              <button
                key={r.href}
                onClick={() => navigate(r.href)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected === i ? 'bg-surface2' : ''
                }`}
              >
                <span className="text-xl flex-shrink-0">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white truncate">{r.title}</div>
                  <div className="text-[11px] text-muted truncate mt-0.5">{r.subtitle}</div>
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-[1px] font-bold"
                  style={{ color: r.tagColor, backgroundColor: `${r.tagColor}18` }}
                >
                  {r.tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-muted text-[13px]">
            Nenhum resultado para &quot;{query}&quot;
          </div>
        )}

        {!query && (
          <div className="px-4 py-4 text-[11px] text-muted flex gap-4">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>ESC fechar</span>
          </div>
        )}
      </div>
    </div>
  )
}
