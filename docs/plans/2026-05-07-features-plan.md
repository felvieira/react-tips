# React Tips — Features Plan (Progresso, Flashcard, Busca Global, Links Cruzados, Modo Foco)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar 5 features que tornam o app genuinamente útil em preparação e durante entrevistas: progresso pessoal, flashcard, busca global, links cruzados conceito↔glossário, e modo foco.

**Architecture:** Tudo client-side. Progresso em localStorage via hook `useProgress`. Flashcard é um modo de view dentro de `/concepts/[id]`. Busca global é um modal com Command Palette (Cmd+K). Links cruzados são derivados dos dados existentes em build time. Modo foco é um toggle de estado no layout.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, localStorage, zero novas dependências.

---

## Task 1: Hook de progresso (localStorage)

**Files:**
- Create: `src/hooks/useProgress.ts`

Hook central que persiste progresso no localStorage. Todos os outros features dependem dele.

**Step 1: Create `src/hooks/useProgress.ts`**

```ts
'use client'
import { useState, useEffect, useCallback } from 'react'

export type ProgressStatus = 'unseen' | 'know' | 'review'

interface ProgressStore {
  [conceptId: number]: ProgressStatus
}

const STORAGE_KEY = 'react-tips-progress'

function readStore(): ProgressStore {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>({})

  useEffect(() => {
    setStore(readStore())
  }, [])

  const setStatus = useCallback((id: number, status: ProgressStatus) => {
    setStore(prev => {
      const next = { ...prev, [id]: status }
      writeStore(next)
      return next
    })
  }, [])

  const getStatus = useCallback((id: number): ProgressStatus => {
    return store[id] ?? 'unseen'
  }, [store])

  const stats = {
    total: 0,
    know: Object.values(store).filter(s => s === 'know').length,
    review: Object.values(store).filter(s => s === 'review').length,
    unseen: 0,
  }

  return { store, setStatus, getStatus, stats }
}
```

**Step 2: Verify TypeScript compiles**
```bash
cd D:/Repos/react-tips && npx tsc --noEmit
```
Expected: zero errors.

**Step 3: Commit**
```bash
git add src/hooks/useProgress.ts
git commit -m "feat: add useProgress hook with localStorage persistence"
```

---

## Task 2: Botões de progresso no ConceptHero

**Files:**
- Create: `src/components/concept/ProgressButtons.tsx`
- Modify: `src/app/concepts/[id]/page.tsx`
- Modify: `src/components/concept/ConceptHero.tsx`

Botões "✓ Sei" e "⟳ Revisar" ficam no topo do conceito. O hero vira client component que recebe o id e renderiza os botões.

**Step 1: Create `src/components/concept/ProgressButtons.tsx`**

```tsx
'use client'
import { useProgress, type ProgressStatus } from '@/hooks/useProgress'

interface ProgressButtonsProps {
  conceptId: number
}

const LABELS: Record<ProgressStatus, string> = {
  unseen: '',
  know: '✓ Sei',
  review: '⟳ Revisar',
}

export function ProgressButtons({ conceptId }: ProgressButtonsProps) {
  const { getStatus, setStatus } = useProgress()
  const status = getStatus(conceptId)

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setStatus(conceptId, status === 'know' ? 'unseen' : 'know')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border transition-all ${
          status === 'know'
            ? 'bg-green-500/20 border-green-500 text-green-400'
            : 'bg-transparent border-border text-muted hover:border-green-500 hover:text-green-400'
        }`}
      >
        ✓ Sei
      </button>
      <button
        onClick={() => setStatus(conceptId, status === 'review' ? 'unseen' : 'review')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border transition-all ${
          status === 'review'
            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
            : 'bg-transparent border-border text-muted hover:border-yellow-500 hover:text-yellow-400'
        }`}
      >
        ⟳ Revisar
      </button>
    </div>
  )
}
```

**Step 2: Update `src/components/concept/ConceptHero.tsx` to accept children**

Replace the file content:
```tsx
import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Concept } from '@/lib/schemas'

interface ConceptHeroProps {
  concept: Concept
  children?: ReactNode
}

export function ConceptHero({ concept, children }: ConceptHeroProps) {
  return (
    <div className="px-9 pt-7 pb-6 border-b border-border bg-gradient-to-br from-surface to-bg">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-5xl leading-none">{concept.emoji}</span>
        <div>
          <Badge label={concept.level} color={concept.color} className="mb-2" />
          <h2 className="font-display text-2xl text-white leading-tight">{concept.title}</h2>
        </div>
      </div>
      <p className="text-[13px] text-[#7a9cc0] leading-relaxed max-w-2xl">{concept.summary}</p>
      {children}
    </div>
  )
}
```

**Step 3: Update `src/app/concepts/[id]/page.tsx` to render ProgressButtons inside ConceptHero**

Add import:
```tsx
import { ProgressButtons } from '@/components/concept/ProgressButtons'
```

Change the ConceptHero render to:
```tsx
<ConceptHero concept={concept}>
  <ProgressButtons conceptId={concept.id} />
</ConceptHero>
```

**Step 4: Verify TypeScript**
```bash
npx tsc --noEmit
```
Expected: zero errors.

**Step 5: Commit**
```bash
git add src/components/concept/ProgressButtons.tsx src/components/concept/ConceptHero.tsx src/app/concepts/[id]/page.tsx
git commit -m "feat: add progress buttons (know/review) to concept hero"
```

---

## Task 3: Indicadores de progresso na sidebar

**Files:**
- Modify: `src/components/sidebar/NavItem.tsx`
- Modify: `src/components/sidebar/Sidebar.tsx`

Cada item na sidebar mostra um ponto colorido (verde = sei, amarelo = revisar). A sidebar recebe o store de progresso via prop.

**Step 1: Update `src/components/sidebar/NavItem.tsx`**

Add `status` prop and dot indicator:
```tsx
import Link from 'next/link'
import type { ProgressStatus } from '@/hooks/useProgress'

interface NavItemProps {
  href: string
  emoji: string
  title: string
  tag: string
  tagColor: string
  index: number
  active: boolean
  status?: ProgressStatus
}

const STATUS_DOT: Record<string, string> = {
  know:   'bg-green-400',
  review: 'bg-yellow-400',
}

export function NavItem({ href, emoji, title, tag, tagColor, index, active, status }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 border-l-[3px] transition-all hover:bg-surface2 ${
        active ? 'bg-surface2 border-accent' : 'border-transparent'
      }`}
    >
      <span className="text-base flex-shrink-0">{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] truncate ${active ? 'text-white' : 'text-text'}`}>{title}</div>
        <span
          className="inline-block text-[9px] px-1.5 py-0.5 rounded-lg mt-0.5 uppercase tracking-[0.8px]"
          style={{ color: tagColor, backgroundColor: `${tagColor}18` }}
        >
          {tag}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {status && STATUS_DOT[status] && (
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
        )}
        {index > 0 && <span className="text-[10px] text-muted">{index}</span>}
      </div>
    </Link>
  )
}
```

**Step 2: Update `src/components/sidebar/Sidebar.tsx`**

Add useProgress and pass status to NavItem. Replace entire file:

```tsx
'use client'
import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { TabSwitch } from './TabSwitch'
import { SearchBox } from './SearchBox'
import { FilterBar } from './FilterBar'
import { NavItem } from './NavItem'
import { useProgress } from '@/hooks/useProgress'
import type { Concept, GlossaryItem } from '@/lib/schemas'

interface SidebarProps {
  concepts: Concept[]
  glossary: GlossaryItem[]
  levels: string[]
}

export function Sidebar({ concepts, glossary, levels }: SidebarProps) {
  const pathname = usePathname()
  const isGlossary = pathname.startsWith('/glossary')
  const { getStatus } = useProgress()

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
```

**Step 3: Verify TypeScript**
```bash
npx tsc --noEmit
```

**Step 4: Commit**
```bash
git add src/components/sidebar/NavItem.tsx src/components/sidebar/Sidebar.tsx
git commit -m "feat: show progress dots in sidebar nav items"
```

---

## Task 4: Modo Flashcard

**Files:**
- Create: `src/components/concept/FlashcardMode.tsx`
- Modify: `src/app/concepts/[id]/page.tsx`

Quando ativado, esconde tudo e mostra só título + summary. Botão "Revelar" expande para ver definição, problema, solução e dica. Botões de progresso ficam visíveis após revelar.

**Step 1: Create `src/components/concept/FlashcardMode.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ProgressButtons } from './ProgressButtons'
import type { Concept } from '@/lib/schemas'

interface FlashcardModeProps {
  concept: Concept
  onExit: () => void
}

export function FlashcardMode({ concept, onExit }: FlashcardModeProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex flex-col min-h-[calc(100vh-0px)] bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-9 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-[2px]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Modo Flashcard
        </div>
        <button
          onClick={onExit}
          className="text-[11px] text-muted hover:text-text border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-all uppercase tracking-[1px]"
        >
          ✕ Sair
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-9 py-12 max-w-3xl mx-auto w-full">
        {/* Question side — always visible */}
        <div className="w-full text-center mb-8">
          <span className="text-7xl leading-none block mb-6">{concept.emoji}</span>
          <Badge label={concept.level} color={concept.color} className="mb-3" />
          <h2 className="font-display text-3xl text-white leading-tight mb-4">{concept.title}</h2>
          <p className="text-[14px] text-[#7a9cc0] leading-relaxed">{concept.summary}</p>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 px-8 py-3 bg-accent text-black font-bold text-[13px] uppercase tracking-[1.5px] rounded-xl hover:bg-[#7dd3fc] transition-all"
          >
            Revelar resposta
          </button>
        ) : (
          <div className="w-full space-y-4 animate-fadeIn">
            {/* Definition */}
            <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4">
              <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">Definição</div>
              <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{concept.definition}</p>
            </div>

            {/* Problem / Solution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <div className="text-[10px] text-[#f87171] uppercase tracking-[2px] font-bold mb-2">🔴 Problema</div>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{concept.problem}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <div className="text-[10px] text-[#4ade80] uppercase tracking-[2px] font-bold mb-2">✅ Solução</div>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{concept.solution}</p>
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-xl px-4 py-3.5 border border-[#854d0e] bg-[#1c0f03]">
              <div className="text-[10px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-1.5">💡 Dica Senior</div>
              <p className="text-[13px] text-[#d97706] leading-relaxed">{concept.tip}</p>
            </div>

            {/* Progress buttons */}
            <div className="flex justify-center pt-2">
              <ProgressButtons conceptId={concept.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Update `src/app/concepts/[id]/page.tsx`**

This page is a server component — the flashcard toggle must live in a client wrapper. Create a client wrapper inside the page file by adding a new client component at the top of the file:

Replace the entire file with:
```tsx
'use client' // needed for ConceptPageClient wrapper below
import { notFound } from 'next/navigation'
import { getConcepts, getConceptById } from '@/lib/loaders'
import { ConceptHero } from '@/components/concept/ConceptHero'
import { DefinitionBlock } from '@/components/concept/DefinitionBlock'
import { SectionGrid } from '@/components/concept/SectionGrid'
import { TipBlock } from '@/components/concept/TipBlock'
import { QuestionAccordion } from '@/components/concept/QuestionAccordion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { NavArrows } from '@/components/concept/NavArrows'
import { ProgressButtons } from '@/components/concept/ProgressButtons'
import { FlashcardMode } from '@/components/concept/FlashcardMode'
import { useState } from 'react'
import type { Concept } from '@/lib/schemas'

// ─── Client wrapper ─────────────────────────────────────────────────────────
function ConceptView({ concept, prev, next, current, total }: {
  concept: Concept
  prev: number | null
  next: number | null
  current: number
  total: number
}) {
  const [flashcard, setFlashcard] = useState(false)

  const sections = [
    { label: 'Problema', icon: '🔴', color: '#f87171', text: concept.problem },
    { label: 'Solução', icon: '✅', color: '#4ade80', text: concept.solution },
  ]

  if (flashcard) {
    return <FlashcardMode concept={concept} onExit={() => setFlashcard(false)} />
  }

  return (
    <div>
      <ConceptHero concept={concept}>
        <div className="flex items-center gap-2 mt-4">
          <ProgressButtons conceptId={concept.id} />
          <button
            onClick={() => setFlashcard(true)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border border-border text-muted hover:border-accent hover:text-accent transition-all"
          >
            ⚡ Flashcard
          </button>
        </div>
      </ConceptHero>
      <div className="px-9 pb-9">
        <DefinitionBlock text={concept.definition} />
        <SectionGrid items={sections} />
        <TipBlock text={concept.tip} />
        <QuestionAccordion questions={concept.questions} />
        <CodeBlock code={concept.code} />
        <NavArrows prevId={prev} nextId={next} current={current} total={total} />
      </div>
    </div>
  )
}

// ─── Static params (still needed even in client file) ────────────────────────
export function generateStaticParams() {
  return getConcepts().map(c => ({ id: String(c.id) }))
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ConceptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const concept = getConceptById(id)
  if (!concept) notFound()

  const all = getConcepts()
  const idx = all.findIndex(c => c.id === id)

  return (
    <ConceptView
      concept={concept}
      prev={all[idx - 1]?.id ?? null}
      next={all[idx + 1]?.id ?? null}
      current={idx + 1}
      total={all.length}
    />
  )
}
```

**IMPORTANT:** When the page is `'use client'`, `params` is no longer a Promise — it's a plain `{ id: string }`. Also `generateStaticParams` still works in client components in Next.js 16.

**Step 3: Add fadeIn animation to globals.css**

In `src/app/globals.css`, add inside `@layer utilities`:
```css
  .animate-fadeIn { animation: fadeIn 0.2s ease; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
```

**Step 4: Verify TypeScript**
```bash
npx tsc --noEmit
```

**Step 5: Commit**
```bash
git add src/components/concept/FlashcardMode.tsx src/app/concepts/[id]/page.tsx src/app/globals.css
git commit -m "feat: add flashcard mode to concept pages"
```

---

## Task 5: Busca global (Command Palette Cmd+K)

**Files:**
- Create: `src/components/search/GlobalSearch.tsx`
- Modify: `src/app/layout.tsx`

Modal que abre com Cmd+K ou Ctrl+K. Campo de busca que pesquisa em tempo real em títulos, summaries, definições, perguntas e termos do glossário. Resultados clicáveis que navegam para a rota.

**Step 1: Create `src/components/search/GlobalSearch.tsx`**

```tsx
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

  // Cmd+K / Ctrl+K to open
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

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Keyboard navigation
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Input */}
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

        {/* Results */}
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
```

**Step 2: Update `src/app/layout.tsx` to include GlobalSearch**

Add import and render GlobalSearch after `<main>`:
```tsx
import { GlobalSearch } from '@/components/search/GlobalSearch'
```

Inside the body div, after `</main>`, add:
```tsx
<GlobalSearch concepts={concepts} glossary={glossary} />
```

Full updated layout:
```tsx
import { type ReactNode } from 'react'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { getConcepts, getGlossary, getConceptLevels } from '@/lib/loaders'

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-mono' })
const display = Syne({ subsets: ['latin'], weight: ['700','800'], variable: '--font-display' })

export const metadata: Metadata = { title: 'React & Next.js Senior — Guia de Entrevista' }

export default function RootLayout({ children }: { children: ReactNode }) {
  const concepts = getConcepts()
  const glossary = getGlossary()
  const levels = getConceptLevels()

  return (
    <html lang="pt-BR" className={`${mono.variable} ${display.variable}`}>
      <body className="bg-bg text-text font-mono min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Sidebar concepts={concepts} glossary={glossary} levels={levels} />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
          <GlobalSearch concepts={concepts} glossary={glossary} />
        </div>
      </body>
    </html>
  )
}
```

**Step 3: Verify TypeScript**
```bash
npx tsc --noEmit
```

**Step 4: Commit**
```bash
git add src/components/search/GlobalSearch.tsx src/app/layout.tsx
git commit -m "feat: add global search command palette (Cmd+K)"
```

---

## Task 6: Links cruzados conceito ↔ glossário

**Files:**
- Modify: `src/lib/loaders.ts`
- Create: `src/components/concept/RelatedTerms.tsx`
- Modify: `src/app/concepts/[id]/page.tsx` (add RelatedTerms)

Em build time, derivar quais termos do glossário são mencionados no título/summary/definition de cada conceito. Renderizar como chips clicáveis no final do conceito.

**Step 1: Add `getRelatedTerms` to `src/lib/loaders.ts`**

Append to the end of the file:
```ts
export function getRelatedTerms(concept: Concept): GlossaryItem[] {
  const glossary = getGlossary()
  const haystack = [
    concept.title,
    concept.summary,
    concept.definition,
    concept.problem,
    concept.solution,
    concept.tip,
  ].join(' ').toLowerCase()

  return glossary.filter(g =>
    haystack.includes(g.term.toLowerCase())
  ).slice(0, 6)
}
```

**Step 2: Create `src/components/concept/RelatedTerms.tsx`**

```tsx
import Link from 'next/link'
import type { GlossaryItem } from '@/lib/schemas'

interface RelatedTermsProps {
  terms: GlossaryItem[]
}

export function RelatedTerms({ terms }: RelatedTermsProps) {
  if (terms.length === 0) return null

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-3 flex items-center gap-1.5">
        🔗 Termos do dicionário
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map(t => (
          <Link
            key={t.term}
            href={`/glossary/${encodeURIComponent(t.term)}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] text-text hover:border-accent hover:text-accent transition-all"
          >
            <span className="text-accent text-[9px] uppercase tracking-[1px] font-bold">{t.category}</span>
            <span className="text-border">·</span>
            {t.term}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Update `src/app/concepts/[id]/page.tsx`**

Since the page is now a client component (from Task 4), import RelatedTerms and getRelatedTerms, compute related in the page component, pass down to ConceptView, render after CodeBlock.

Add at top of file:
```tsx
import { RelatedTerms } from '@/components/concept/RelatedTerms'
import { getRelatedTerms } from '@/lib/loaders'
import type { GlossaryItem } from '@/lib/schemas'
```

Update ConceptView props interface:
```tsx
function ConceptView({ concept, prev, next, current, total, relatedTerms }: {
  concept: Concept
  prev: number | null
  next: number | null
  current: number
  total: number
  relatedTerms: GlossaryItem[]
}) {
```

Add `<RelatedTerms terms={relatedTerms} />` after `<CodeBlock code={concept.code} />`.

Update ConceptPage to compute and pass relatedTerms:
```tsx
export default function ConceptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const concept = getConceptById(id)
  if (!concept) notFound()

  const all = getConcepts()
  const idx = all.findIndex(c => c.id === id)
  const relatedTerms = getRelatedTerms(concept)

  return (
    <ConceptView
      concept={concept}
      prev={all[idx - 1]?.id ?? null}
      next={all[idx + 1]?.id ?? null}
      current={idx + 1}
      total={all.length}
      relatedTerms={relatedTerms}
    />
  )
}
```

**Step 4: Verify TypeScript**
```bash
npx tsc --noEmit
```

**Step 5: Commit**
```bash
git add src/lib/loaders.ts src/components/concept/RelatedTerms.tsx src/app/concepts/[id]/page.tsx
git commit -m "feat: add cross-links concept to glossary terms"
```

---

## Task 7: Modo Foco (esconde sidebar)

**Files:**
- Create: `src/hooks/useFocusMode.ts`
- Create: `src/components/layout/FocusToggle.tsx`
- Modify: `src/app/layout.tsx`

Toggle que esconde a sidebar para leitura focada. Estado em localStorage para persistir entre páginas.

**Step 1: Create `src/hooks/useFocusMode.ts`**

```ts
'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'react-tips-focus'

export function useFocusMode() {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setFocused(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  const toggle = () => {
    setFocused(v => {
      const next = !v
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return { focused, toggle }
}
```

**Step 2: Create `src/components/layout/FocusToggle.tsx`**

```tsx
'use client'
import { useFocusMode } from '@/hooks/useFocusMode'

export function FocusToggle() {
  const { focused, toggle } = useFocusMode()

  return (
    <button
      onClick={toggle}
      title={focused ? 'Mostrar sidebar' : 'Modo foco'}
      className="fixed top-4 right-4 z-40 w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all text-[13px]"
    >
      {focused ? '◧' : '□'}
    </button>
  )
}
```

**Step 3: Create `src/components/layout/ShellClient.tsx`**

The layout is a server component — we need a client shell to apply the focus-mode class. Create a thin client wrapper:

```tsx
'use client'
import { type ReactNode } from 'react'
import { useFocusMode } from '@/hooks/useFocusMode'

interface ShellClientProps {
  sidebar: ReactNode
  children: ReactNode
  search: ReactNode
}

export function ShellClient({ sidebar, children, search }: ShellClientProps) {
  const { focused } = useFocusMode()

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`transition-all duration-300 overflow-hidden ${focused ? 'w-0' : 'w-[290px]'} flex-shrink-0`}>
        {sidebar}
      </div>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>
      {search}
    </div>
  )
}
```

**Step 4: Update `src/app/layout.tsx` to use ShellClient**

```tsx
import { type ReactNode } from 'react'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { ShellClient } from '@/components/layout/ShellClient'
import { FocusToggle } from '@/components/layout/FocusToggle'
import { getConcepts, getGlossary, getConceptLevels } from '@/lib/loaders'

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-mono' })
const display = Syne({ subsets: ['latin'], weight: ['700','800'], variable: '--font-display' })

export const metadata: Metadata = { title: 'React & Next.js Senior — Guia de Entrevista' }

export default function RootLayout({ children }: { children: ReactNode }) {
  const concepts = getConcepts()
  const glossary = getGlossary()
  const levels = getConceptLevels()

  return (
    <html lang="pt-BR" className={`${mono.variable} ${display.variable}`}>
      <body className="bg-bg text-text font-mono min-h-screen">
        <ShellClient
          sidebar={<Sidebar concepts={concepts} glossary={glossary} levels={levels} />}
          search={<GlobalSearch concepts={concepts} glossary={glossary} />}
        >
          {children}
        </ShellClient>
        <FocusToggle />
      </body>
    </html>
  )
}
```

**Step 5: Verify TypeScript**
```bash
npx tsc --noEmit
```

**Step 6: Verify build**
```bash
npm run build 2>&1 | tail -15
```
Expected: clean build, all pages generated.

**Step 7: Commit**
```bash
git add src/hooks/useFocusMode.ts src/components/layout/ src/app/layout.tsx
git commit -m "feat: add focus mode toggle (hide sidebar)"
```

---

## Task 8: Smoke test visual

Start dev server and verify all features work:

```bash
npx next dev -p 4002
```

**Checklist:**
- [ ] `/concepts/1` → botões "✓ Sei" e "⟳ Revisar" visíveis no hero
- [ ] Clicar "✓ Sei" → botão fica verde, ponto verde aparece na sidebar
- [ ] Clicar "⚡ Flashcard" → modo flashcard abre, mostra só título/summary
- [ ] Clicar "Revelar resposta" → definição, problema, solução, dica aparecem
- [ ] Clicar "✕ Sair" → volta ao modo normal
- [ ] Cmd+K (ou Ctrl+K) → abre modal de busca
- [ ] Digitar "memo" → resultados de conceitos e glossário aparecem
- [ ] Clicar resultado → navega para a rota
- [ ] ESC → fecha modal
- [ ] Botão "□" (canto superior direito) → esconde sidebar
- [ ] Botão "◧" → mostra sidebar novamente
- [ ] Em `/concepts/1` → chips de "Termos do dicionário" aparecem (se houver matches)
- [ ] Clicar chip → navega para o termo no glossário

**Final commit:**
```bash
git add .
git commit -m "feat: complete interview features (progress, flashcard, search, cross-links, focus mode)"
```
