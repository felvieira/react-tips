'use client'
import { useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'
import type { Concept } from '@/lib/schemas'

const DOMAIN_HUES: Record<string, number> = {
  'Performance': 150,
  'React 18': 220,
  'Next.js RSC': 190,
  'Padrão': 280,
  'Segurança': 0,
  'Hooks': 250,
  'Next.js': 190,
  'Fundamentos': 60,
  'DevTools': 200,
  'Padrões': 300,
}

interface AppSidebarProps {
  concepts: Concept[]
  levels: string[]
}

type View = 'domain' | 'difficulty' | 'status'

export function AppSidebar({ concepts, levels }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { getStatus } = useProgress()
  const [view, setView] = useState<View>('domain')

  const currentId = pathname.startsWith('/concepts/') ? Number(pathname.split('/').pop()) : null

  const groups = useMemo(() => {
    if (view === 'domain') {
      return levels.map(level => ({
        key: level,
        title: level,
        hue: DOMAIN_HUES[level] ?? 220,
        items: concepts.filter(c => c.level === level),
      })).filter(g => g.items.length > 0)
    }

    if (view === 'difficulty') {
      const diffs = [...new Set(concepts.map(c => c.level))]
      return diffs.map(d => ({
        key: d,
        title: d,
        hue: 220,
        items: concepts.filter(c => c.level === d),
      })).filter(g => g.items.length > 0)
    }

    // status view
    const know = concepts.filter(c => getStatus(c.id) === 'know')
    const review = concepts.filter(c => getStatus(c.id) === 'review')
    const unseen = concepts.filter(c => getStatus(c.id) === 'unseen')
    return [
      { key: 'review', title: 'Revisar', hue: 60, items: review },
      { key: 'unseen', title: 'Não vistos', hue: 240, items: unseen },
      { key: 'know', title: 'Sei', hue: 150, items: know },
    ].filter(g => g.items.length > 0)
  }, [view, concepts, levels, getStatus])

  return (
    <aside className="app-sidebar">
      <div className="sidebar-tabs">
        {([['domain', 'Tópico'], ['difficulty', 'Nível'], ['status', 'Status']] as [View, string][]).map(([id, label]) => (
          <button
            key={id}
            className={'sidebar-tab' + (view === id ? ' active' : '')}
            onClick={() => setView(id)}
          >{label}</button>
        ))}
      </div>

      {groups.map(g => (
        <div key={g.key} className="sidebar-section">
          <div className="sidebar-section-title" style={{ '--h': g.hue } as React.CSSProperties}>
            <span className="sdot" /><span>{g.title}</span>
            <span className="scount">{g.items.length}</span>
          </div>
          {g.items.map(c => {
            const status = getStatus(c.id)
            return (
              <div
                key={c.id}
                className={'sidebar-row' + (currentId === c.id ? ' active' : '')}
                onClick={() => router.push(`/concepts/${c.id}`)}
              >
                <span className={'status-dot' + (status === 'know' ? ' know' : status === 'review' ? ' review' : '')} />
                <span className="sidebar-row-label">{c.title}</span>
                {view !== 'difficulty' && (
                  <span className="diff-tag">{c.level.slice(0, 3)}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <div className="sidebar-divider sidebar-section">
        <div className="sidebar-section-title">
          <span className="sdot" style={{ background: 'var(--fg-muted)' }} />
          <span>Outros</span>
        </div>
        <div
          className={'sidebar-row' + (pathname === '/glossary' ? ' active' : '')}
          onClick={() => router.push('/glossary')}
        >
          <span className="status-dot" />
          <span className="sidebar-row-label">Dicionário técnico</span>
        </div>
      </div>
    </aside>
  )
}
