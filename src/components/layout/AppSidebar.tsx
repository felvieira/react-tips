'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'
import type { Concept } from '@/lib/schemas'

const DOMAIN_HUES: Record<string, number> = {
  'Performance': 150, 'React 18': 220, 'Next.js RSC': 190,
  'Padrão': 280, 'Segurança': 0, 'Hooks': 250, 'Next.js': 190,
  'Fundamentos': 60, 'DevTools': 200, 'Padrões': 300,
  'Básico FE': 60, 'Intermediário FE': 220, 'Avançado FE': 300,
  'Design System': 30, 'Microfrontend': 160, 'Observabilidade': 50,
  'Estado Global': 260,
  'Testing': 150, 'Acessibilidade': 280, 'Carreira': 40,
  'Arquitetura': 200,
  'IA Básico': 290, 'IA Avançado': 270,
}

const DIFFICULTY_ORDER = [
  'Fundamentos', 'Básico FE', 'Padrão', 'Padrões', 'Hooks', 'Carreira',
  'Estado Global', 'Design System', 'Testing', 'Acessibilidade', 'Intermediário FE',
  'Performance', 'React 18', 'Next.js', 'Observabilidade', 'Arquitetura',
  'Next.js RSC', 'Avançado FE', 'Microfrontend', 'Segurança', 'DevTools',
  'IA Básico', 'IA Avançado',
]

const DIFFICULTY_LABEL: Record<string, string> = {
  'Fundamentos': 'Júnior', 'Básico FE': 'Júnior', 'Carreira': 'Júnior',
  'Padrão': 'Pleno', 'Padrões': 'Pleno', 'Hooks': 'Pleno',
  'Intermediário FE': 'Pleno', 'Estado Global': 'Pleno', 'Design System': 'Pleno',
  'Testing': 'Pleno', 'Acessibilidade': 'Pleno',
  'Performance': 'Sênior', 'React 18': 'Sênior', 'Next.js': 'Sênior',
  'Observabilidade': 'Sênior', 'Arquitetura': 'Sênior',
  'IA Básico': 'Sênior', 'IA Avançado': 'Staff',
  'Next.js RSC': 'Staff', 'Avançado FE': 'Staff', 'Segurança': 'Staff',
  'DevTools': 'Staff', 'Microfrontend': 'Staff',
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
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentId])

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
      // Group by difficulty tier (júnior/pleno/sênior/staff)
      const tiers: Record<string, { label: string; hue: number; items: typeof concepts }> = {
        'Júnior':  { label: 'Júnior',  hue: 60,  items: [] },
        'Pleno':   { label: 'Pleno',   hue: 150, items: [] },
        'Sênior':  { label: 'Sênior',  hue: 220, items: [] },
        'Staff':   { label: 'Staff',   hue: 280, items: [] },
      }
      // Sort concepts by DIFFICULTY_ORDER first
      const sorted = [...concepts].sort((a, b) =>
        (DIFFICULTY_ORDER.indexOf(a.level) ?? 99) - (DIFFICULTY_ORDER.indexOf(b.level) ?? 99)
      )
      for (const c of sorted) {
        const tier = DIFFICULTY_LABEL[c.level] ?? 'Sênior'
        tiers[tier].items.push(c)
      }
      return Object.values(tiers).filter(t => t.items.length > 0).map(t => ({
        key: t.label,
        title: t.label,
        hue: t.hue,
        items: t.items,
      }))
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

      <div key={view} className="animate-stagger">
      {groups.map(g => (
        <div key={g.key} className="sidebar-section">
          <div className="sidebar-section-title" style={{ '--h': g.hue } as React.CSSProperties}>
            <span className="sdot" /><span>{g.title}</span>
            <span className="scount">{g.items.length}</span>
          </div>
          {g.items.map(c => {
            const status = getStatus(c.id)
            const active = currentId === c.id
            return (
              <div
                key={c.id}
                ref={active ? activeRef : undefined}
                className={'sidebar-row' + (active ? ' active' : '')}
                onClick={() => router.push(`/concepts/${c.id}`)}
              >
                <span className={'status-dot' + (status === 'know' ? ' know' : status === 'review' ? ' review' : '')} />
                <span className="sidebar-row-label">{c.title}</span>
                {view === 'domain' && (
                  <span className="diff-tag">{c.level.slice(0, 3)}</span>
                )}
                {view === 'difficulty' && (
                  <span className="diff-tag">{c.level.slice(0, 3)}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
      </div>

      <div className="sidebar-divider sidebar-section">
        <div className="sidebar-section-title">
          <span className="sdot" style={{ background: 'var(--fg-muted)' }} />
          <span>Outros</span>
        </div>
        <div
          className={'sidebar-row' + (pathname === '/revisao' ? ' active' : '')}
          onClick={() => router.push('/revisao')}
        >
          <span className="status-dot review" />
          <span className="sidebar-row-label">Revisão Rápida</span>
        </div>
        <div
          className={'sidebar-row' + (pathname === '/questions' ? ' active' : '')}
          onClick={() => router.push('/questions')}
        >
          <span className="status-dot" />
          <span className="sidebar-row-label">Todas as perguntas</span>
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
