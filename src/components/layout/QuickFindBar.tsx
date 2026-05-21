'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'
import type { Concept } from '@/lib/schemas'

const VISITED_KEY = 'react-tips-visited'

interface QuickFindBarProps {
  concepts: Concept[]
}

export function QuickFindBar({ concepts }: QuickFindBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { getStatus } = useProgress()
  const [query, setQuery] = useState('')
  const [visited, setVisited] = useState<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Track visited concepts
  useEffect(() => {
    const m = pathname.match(/^\/concepts\/(\d+)/)
    if (!m) return
    const id = Number(m[1])
    setVisited(prev => {
      const filtered = prev.filter(v => v !== id)
      const next = [id, ...filtered].slice(0, 5)
      try { localStorage.setItem(VISITED_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [pathname])

  // Load visited on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY)
      if (raw) setVisited(JSON.parse(raw))
    } catch {}
  }, [])

  // Focus input on mount and when '/' pressed
  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Fuzzy search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return concepts
      .filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.level.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, concepts])

  const recentConcepts = visited
    .map(id => concepts.find(c => c.id === id))
    .filter((c): c is Concept => !!c)

  const reviewConcepts = useMemo(() =>
    concepts.filter(c => getStatus(c.id) === 'review').slice(0, 8),
    [concepts, getStatus]
  )

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results[0]) {
      router.push(`/concepts/${results[0].id}`)
      setQuery('')
    }
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: 'var(--bg)', padding: '10px 20px 8px',
      borderBottom: '1px solid var(--border)',
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Buscar conceito... (/ para focar)"
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            fontSize: 14,
            fontFamily: 'var(--font-sans)',
            background: 'var(--bg-elev)',
            border: '2px solid var(--border-strong)',
            borderRadius: 8,
            color: 'var(--fg)',
            outline: 'none',
            transition: 'border-color 0.1s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
        />
        <span style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', fontSize: 14,
        }}>🔍</span>
        <kbd style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', fontSize: 10,
          fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)',
          background: 'var(--bg-sunken)', padding: '2px 6px',
          borderRadius: 3, border: '1px solid var(--border)',
        }}>/</kbd>
      </div>

      {/* Live results dropdown */}
      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 20, right: 20,
          background: 'var(--bg-elev)', border: '1px solid var(--border-strong)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          maxHeight: 320, overflow: 'auto', zIndex: 10,
          marginTop: -4, maxWidth: 1240, margin: '-4px auto 0',
        }}>
          {results.map(c => (
            <button
              key={c.id}
              onClick={() => { router.push(`/concepts/${c.id}`); setQuery('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 12px',
                background: 'transparent', border: 0,
                borderBottom: '1px solid var(--border)',
                color: 'var(--fg)', cursor: 'pointer',
                fontSize: 13, textAlign: 'left',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sunken)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ flex: 1 }}>{c.title}</span>
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-mono)',
                color: 'var(--fg-muted)', padding: '2px 6px',
                background: 'var(--bg-sunken)', borderRadius: 3,
              }}>{c.level}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recent + Review chips */}
      {!query && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {recentConcepts.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9, fontFamily: 'var(--font-mono)',
                color: 'var(--fg-subtle)', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 700,
              }}>RECENTES</span>
              {recentConcepts.map(c => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/concepts/${c.id}`)}
                  style={{
                    padding: '3px 9px', borderRadius: 99,
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--border)',
                    fontSize: 11, color: 'var(--fg)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {c.title.length > 24 ? c.title.slice(0, 22) + '…' : c.title}
                </button>
              ))}
            </div>
          )}

          {reviewConcepts.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9, fontFamily: 'var(--font-mono)',
                color: 'oklch(0.55 0.16 60)', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontWeight: 700,
              }}>⟳ REVISAR ({reviewConcepts.length})</span>
              {reviewConcepts.slice(0, 5).map(c => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/concepts/${c.id}`)}
                  style={{
                    padding: '3px 9px', borderRadius: 99,
                    background: 'oklch(0.7 0.15 60 / 0.1)',
                    border: '1px solid oklch(0.7 0.15 60 / 0.4)',
                    fontSize: 11, color: 'oklch(0.5 0.15 60)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {c.title.length > 24 ? c.title.slice(0, 22) + '…' : c.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
