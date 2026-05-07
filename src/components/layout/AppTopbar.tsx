'use client'
import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '@/hooks/useProgress'
import type { Concept, GlossaryItem } from '@/lib/schemas'

interface AppTopbarProps {
  concepts: Concept[]
  glossary: GlossaryItem[]
}

export function AppTopbar({ concepts }: AppTopbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { stats } = useProgress()

  useEffect(() => {
    const saved = localStorage.getItem('rprep:theme') as 'light' | 'dark' | null
    if (saved) { setTheme(saved); document.documentElement.dataset.theme = saved }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      document.documentElement.dataset.theme = next
      localStorage.setItem('rprep:theme', next)
      return next
    })
  }, [])

  const openSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-search'))
  }, [])

  return (
    <header className="app-topbar">
      <div className="app-brand">
        <div className="app-brand-mark">R</div>
        <span>Interview Deck</span>
        <span className="app-brand-sub">react · next.js · senior/staff</span>
      </div>

      <div className="app-topbar-spacer" />

      <button className="app-searchbar" onClick={openSearch}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span className="app-searchbar-grow">Buscar conceitos, perguntas, termos…</span>
        <span className="app-kbd">⌘</span><span className="app-kbd">K</span>
      </button>

      <div className="app-counts">
        <span title="Sei">✓ {stats.know}</span>
        <span className="app-counts-sep">·</span>
        <span title="Revisar">⟳ {stats.review}</span>
        <span className="app-counts-sep">·</span>
        <span title="Total">{concepts.length}</span>
      </div>

      <button className="app-icon-btn" title="Tema" onClick={toggleTheme}>
        {theme === 'light' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        )}
      </button>
    </header>
  )
}
