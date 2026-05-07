'use client'
import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { TabSwitch } from './TabSwitch'
import { SearchBox } from './SearchBox'
import { FilterBar } from './FilterBar'
import { NavItem } from './NavItem'
import type { Concept, GlossaryItem } from '@/lib/schemas'
import { useProgress } from '@/hooks/useProgress'

interface SidebarProps {
  concepts: Concept[]
  glossary: GlossaryItem[]
  levels: string[]
}

export function Sidebar({ concepts, glossary, levels }: SidebarProps) {
  const pathname = usePathname()
  const { getStatus } = useProgress()
  const isGlossary = pathname.startsWith('/glossary')

  const [conceptSearch, setConceptSearch] = useState('')
  const [glossarySearch, setGlossarySearch] = useState('')
  const [activeLevel, setActiveLevel] = useState<string | null>(null)

  const filteredConcepts = useMemo(() =>
    concepts.filter(c => {
      const matchLevel = !activeLevel || c.level === activeLevel
      const matchSearch = !conceptSearch ||
        c.title.toLowerCase().includes(conceptSearch.toLowerCase()) ||
        c.summary.toLowerCase().includes(conceptSearch.toLowerCase())
      return matchLevel && matchSearch
    }),
    [concepts, activeLevel, conceptSearch]
  )

  const filteredGlossary = useMemo(() =>
    glossary.filter(g =>
      !glossarySearch ||
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.def.toLowerCase().includes(glossarySearch.toLowerCase())
    ),
    [glossary, glossarySearch]
  )

  return (
    <nav className="w-[290px] flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden">
      <div className="px-4 pt-[18px] pb-3.5 border-b border-border">
        <h1 className="font-display text-[15px] text-white leading-snug">⚛️ React &amp; Next.js<br />Senior Interview</h1>
        <span className="inline-block mt-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#0c3a5c] text-accent uppercase tracking-[1.5px]">
          Guia completo
        </span>
      </div>

      <TabSwitch />

      {!isGlossary ? (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <SearchBox value={conceptSearch} onChange={setConceptSearch} placeholder="🔍 Buscar conceito..." />
          <FilterBar levels={levels} active={activeLevel} onSelect={setActiveLevel} />
          <div className="overflow-y-auto flex-1 py-2 scrollbar-thin">
            {filteredConcepts.map((c, i) => (
              <NavItem
                key={c.id}
                href={`/concepts/${c.id}`}
                emoji={c.emoji}
                title={c.title}
                tag={c.level}
                tagColor={c.color}
                index={i + 1}
                active={pathname === `/concepts/${c.id}`}
                status={getStatus(c.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <SearchBox value={glossarySearch} onChange={setGlossarySearch} placeholder="🔍 Buscar termo..." />
          <div className="overflow-y-auto flex-1 py-2 scrollbar-thin">
            {filteredGlossary.map(g => (
              <NavItem
                key={g.term}
                href={`/glossary/${encodeURIComponent(g.term)}`}
                emoji="📖"
                title={g.term}
                tag={g.category}
                tagColor="#38bdf8"
                index={0}
                active={pathname === `/glossary/${encodeURIComponent(g.term)}`}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
