# React Tips — Next.js Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate `react-guia-completo_2.html` (~3300 lines, all inline) to a DRY Next.js 15 App Router project deployable via Docker on Coolify.

**Architecture:** SSG with `generateStaticParams` for all content routes. Data lives in two JSON files validated by Zod at build time. Sidebar persists across navigation via `app/layout.tsx`. No database, no auth, no CMS.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Zod, next/font (IBM Plex Mono + Syne), Docker standalone output.

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/globals.css`

**Step 1: Init project**

```bash
cd D:/Repos/react-tips
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*" --yes
```

**Step 2: Install Zod**

```bash
npm install zod
```

**Step 3: Configure `next.config.ts` for standalone output**

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
```

**Step 4: Configure Tailwind design tokens in `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#080b10',
        surface:  '#0e1219',
        surface2: '#151c27',
        border:   '#1a2535',
        text:     '#c9d8f0',
        muted:    '#4a6080',
        accent:   '#38bdf8',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
}

export default config
```

**Step 5: Set up fonts + globals in `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import './globals.css'

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
})

const display = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'React & Next.js Senior — Guia de Entrevista',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${mono.variable} ${display.variable}`}>
      <body className="bg-bg text-text font-mono min-h-screen">{children}</body>
    </html>
  )
}
```

**Step 6: `src/app/globals.css` — scrollbar utilities only**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 4px; }
}
```

**Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: `ready on http://localhost:3000`

**Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 project with Tailwind + Zod"
```

---

## Task 2: Extract data to JSON files

**Files:**
- Create: `src/data/concepts.json`
- Create: `src/data/glossary.json`

**Step 1: Extract concepts array from HTML**

Open `react-guia-completo_2.html`. Find `const concepts = [` (line ~621). Copy the entire array (up to `const glossary =` around line ~2000). Paste into `src/data/concepts.json` as a valid JSON array.

Key shape per item:
```json
{
  "id": 1,
  "emoji": "🧠",
  "title": "React.memo + areEqual",
  "level": "Performance",
  "color": "#818cf8",
  "summary": "...",
  "definition": "...",
  "problem": "...",
  "solution": "...",
  "tip": "...",
  "questions": [{ "q": "...", "a": "..." }],
  "code": "..."
}
```

**Step 2: Extract glossary array from HTML**

Find `const glossary = [` (line ~2001). Copy to end of array. Paste into `src/data/glossary.json`.

Key shape per item:
```json
{
  "term": "useState",
  "category": "Hook",
  "def": "...",
  "what": "...",
  "whenUse": "...",
  "whenNot": "...",
  "pros": ["..."],
  "cons": ["..."],
  "code": "..."
}
```

Note: `pros`, `cons`, `what`, `whenUse`, `whenNot`, `code` are optional in some glossary items — use `null` or omit them.

**Step 3: Validate JSON is parseable**

```bash
node -e "require('./src/data/concepts.json'); console.log('ok')"
node -e "require('./src/data/glossary.json'); console.log('ok')"
```
Expected: `ok` both times.

**Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: extract concepts and glossary data to JSON"
```

---

## Task 3: Zod schemas + data loaders

**Files:**
- Create: `src/lib/schemas.ts`
- Create: `src/lib/loaders.ts`

**Step 1: Write schemas**

```ts
// src/lib/schemas.ts
import { z } from 'zod'

export const QuestionSchema = z.object({
  q: z.string(),
  a: z.string(),
})

export const ConceptSchema = z.object({
  id: z.number(),
  emoji: z.string(),
  title: z.string(),
  level: z.string(),
  color: z.string(),
  summary: z.string(),
  definition: z.string(),
  problem: z.string(),
  solution: z.string(),
  tip: z.string(),
  questions: z.array(QuestionSchema),
  code: z.string(),
})

export const GlossaryItemSchema = z.object({
  term: z.string(),
  category: z.string(),
  def: z.string(),
  what: z.string().optional(),
  whenUse: z.string().optional(),
  whenNot: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  code: z.string().optional(),
})

export type Concept = z.infer<typeof ConceptSchema>
export type GlossaryItem = z.infer<typeof GlossaryItemSchema>
export type Question = z.infer<typeof QuestionSchema>
```

**Step 2: Write loaders**

```ts
// src/lib/loaders.ts
import { z } from 'zod'
import { ConceptSchema, GlossaryItemSchema, type Concept, type GlossaryItem } from './schemas'
import rawConcepts from '@/data/concepts.json'
import rawGlossary from '@/data/glossary.json'

export function getConcepts(): Concept[] {
  return z.array(ConceptSchema).parse(rawConcepts)
}

export function getConceptById(id: number): Concept | undefined {
  return getConcepts().find(c => c.id === id)
}

export function getConceptLevels(): string[] {
  return [...new Set(getConcepts().map(c => c.level))]
}

export function getGlossary(): GlossaryItem[] {
  return z.array(GlossaryItemSchema).parse(rawGlossary)
}

export function getGlossaryByTerm(term: string): GlossaryItem | undefined {
  return getGlossary().find(g => g.term === term)
}

export function getGlossaryCategories(): string[] {
  return [...new Set(getGlossary().map(g => g.category))]
}
```

**Step 3: Add `resolveJsonModule` to tsconfig if not present**

In `tsconfig.json`, ensure:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add Zod schemas and data loaders"
```

---

## Task 4: Shared UI primitives

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/SectionLabel.tsx`
- Create: `src/components/ui/CodeBlock.tsx`

These are the atoms reused in both concept and glossary views.

**Step 1: Badge**

```tsx
// src/components/ui/Badge.tsx
interface BadgeProps {
  label: string
  color: string   // hex, e.g. "#818cf8"
  className?: string
}

export function Badge({ label, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] px-2 py-0.5 rounded-full uppercase tracking-[1.5px] font-bold ${className}`}
      style={{ color, backgroundColor: `${color}18` }}
    >
      {label}
    </span>
  )
}
```

**Step 2: SectionLabel**

```tsx
// src/components/ui/SectionLabel.tsx
interface SectionLabelProps {
  children: React.ReactNode
  color?: string
}

export function SectionLabel({ children, color = '#c9d8f0' }: SectionLabelProps) {
  return (
    <div
      className="text-[10px] uppercase tracking-[2px] font-bold mb-2.5 flex items-center gap-1.5"
      style={{ color }}
    >
      {children}
    </div>
  )
}
```

**Step 3: CodeBlock (client component with toggle)**

```tsx
// src/components/ui/CodeBlock.tsx
'use client'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label = 'Ver código de exemplo' }: CodeBlockProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-[11px] uppercase tracking-[1px] transition-all ${
          open
            ? 'border-accent text-accent bg-[#0c2d44]'
            : 'border-border text-muted hover:border-accent hover:text-accent'
        }`}
      >
        {open ? '▲' : '▼'} &nbsp; {open ? `Esconder ${label}` : label}
      </button>

      {open && (
        <pre className="mt-3 bg-[#060912] border border-border rounded-xl p-5 text-xs leading-relaxed text-[#a5c8f0] overflow-x-auto whitespace-pre">
          {code}
        </pre>
      )}
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI primitives (Badge, SectionLabel, CodeBlock)"
```

---

## Task 5: Concept detail components

**Files:**
- Create: `src/components/concept/ConceptHero.tsx`
- Create: `src/components/concept/DefinitionBlock.tsx`
- Create: `src/components/concept/SectionGrid.tsx`
- Create: `src/components/concept/TipBlock.tsx`
- Create: `src/components/concept/QuestionAccordion.tsx`
- Create: `src/components/concept/NavArrows.tsx`

**Step 1: ConceptHero**

```tsx
// src/components/concept/ConceptHero.tsx
import { Badge } from '@/components/ui/Badge'
import type { Concept } from '@/lib/schemas'

export function ConceptHero({ concept }: { concept: Concept }) {
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
    </div>
  )
}
```

**Step 2: DefinitionBlock**

```tsx
// src/components/concept/DefinitionBlock.tsx
export function DefinitionBlock({ text }: { text: string }) {
  return (
    <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4 mt-5">
      <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">Definição</div>
      <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{text}</p>
    </div>
  )
}
```

**Step 3: SectionGrid**

```tsx
// src/components/concept/SectionGrid.tsx
import { SectionLabel } from '@/components/ui/SectionLabel'

interface SectionItem {
  label: string
  icon: string
  color: string
  text: string
  full?: boolean
}

interface SectionGridProps {
  items: SectionItem[]
}

export function SectionGrid({ items }: SectionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {items.map(({ label, icon, color, text, full }) => (
        <div
          key={label}
          className={`bg-surface border border-border rounded-xl px-5 py-4 ${full ? 'col-span-2' : ''}`}
        >
          <SectionLabel color={color}>{icon} {label}</SectionLabel>
          <p className="text-[13px] text-[#8aaccc] leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}
```

**Step 4: TipBlock**

```tsx
// src/components/concept/TipBlock.tsx
export function TipBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl px-4 py-3.5 mt-4 border border-[#854d0e] bg-[#1c0f03]">
      <div className="text-[10px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-1.5">💡 Dica Senior</div>
      <p className="text-[13px] text-[#d97706] leading-relaxed">{text}</p>
    </div>
  )
}
```

**Step 5: QuestionAccordion (client)**

```tsx
// src/components/concept/QuestionAccordion.tsx
'use client'
import { useState } from 'react'
import type { Question } from '@/lib/schemas'

export function QuestionAccordion({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mt-6">
      <h3 className="font-display text-[17px] text-white mb-3.5 flex items-center gap-2.5 before:content-[''] before:w-1 before:h-[18px] before:bg-accent before:rounded-sm">
        Perguntas de Entrevista
      </h3>
      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-xl mb-2.5 overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start gap-3 px-4.5 py-3.5 text-left hover:bg-surface2 transition-colors"
          >
            <span className="text-accent font-bold flex-shrink-0 text-sm">Q</span>
            <span className="flex-1 text-[13px] text-text leading-relaxed">{q.q}</span>
            <span className={`text-muted flex-shrink-0 transition-transform ${open === i ? 'rotate-180 text-accent' : ''}`}>▾</span>
          </button>

          {open === i && (
            <div className="px-4.5 pb-4 pl-[50px]">
              <p className="text-[13px] text-[#8aaccc] leading-relaxed border-l-2 border-accent pl-3.5">{q.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**Step 6: NavArrows (client)**

```tsx
// src/components/concept/NavArrows.tsx
'use client'
import { useRouter } from 'next/navigation'

interface NavArrowsProps {
  prevId: number | null
  nextId: number | null
  current: number
  total: number
}

export function NavArrows({ prevId, nextId, current, total }: NavArrowsProps) {
  const router = useRouter()

  return (
    <div className="flex gap-2 mt-7 pt-5 border-t border-border">
      <button
        onClick={() => prevId && router.push(`/concepts/${prevId}`)}
        disabled={!prevId}
        className="flex-1 py-2.5 bg-surface2 border border-border rounded-lg text-muted text-[11px] text-center transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-default"
      >
        ← Anterior
      </button>
      <span className="flex items-center px-3 text-accent text-[11px]">
        {current}/{total}
      </span>
      <button
        onClick={() => nextId && router.push(`/concepts/${nextId}`)}
        disabled={!nextId}
        className="flex-1 py-2.5 bg-surface2 border border-border rounded-lg text-muted text-[11px] text-center transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-default"
      >
        Próximo →
      </button>
    </div>
  )
}
```

**Step 7: Commit**

```bash
git add src/components/concept/
git commit -m "feat: add concept detail components"
```

---

## Task 6: Glossary components

**Files:**
- Create: `src/components/glossary/GlossaryCard.tsx`
- Create: `src/components/glossary/GlossaryDetail.tsx`

**Step 1: GlossaryCard**

```tsx
// src/components/glossary/GlossaryCard.tsx
import Link from 'next/link'
import type { GlossaryItem } from '@/lib/schemas'

export function GlossaryCard({ item }: { item: GlossaryItem }) {
  return (
    <Link
      href={`/glossary/${encodeURIComponent(item.term)}`}
      className="block bg-surface border border-border rounded-xl px-4.5 py-4 transition-all hover:border-accent"
    >
      <div className="font-display text-[15px] text-white mb-1">{item.term}</div>
      <div className="text-[9px] text-accent uppercase tracking-[1.5px] mb-2">{item.category}</div>
      <p className="text-[12px] text-[#8aaccc] leading-relaxed">{item.def}</p>
    </Link>
  )
}
```

**Step 2: GlossaryDetail**

```tsx
// src/components/glossary/GlossaryDetail.tsx
import { SectionLabel } from '@/components/ui/SectionLabel'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { GlossaryCard } from './GlossaryCard'
import { getGlossary } from '@/lib/loaders'
import type { GlossaryItem } from '@/lib/schemas'

export function GlossaryDetail({ item }: { item: GlossaryItem }) {
  const related = getGlossary()
    .filter(g => g.category === item.category && g.term !== item.term)
    .slice(0, 8)

  return (
    <div>
      <div className="px-9 pt-7 pb-6 border-b border-border bg-gradient-to-br from-surface to-bg">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl leading-none">📖</span>
          <div>
            <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-xl uppercase tracking-[1.5px] font-bold bg-[#0c2d44] text-accent mb-2">
              {item.category}
            </span>
            <h2 className="font-display text-2xl text-white leading-tight">{item.term}</h2>
          </div>
        </div>
        <p className="text-[13px] text-[#7a9cc0] leading-relaxed max-w-2xl">{item.def}</p>
      </div>

      <div className="px-9 pb-9 mt-5 space-y-4">
        {item.what && (
          <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4">
            <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">📚 O que é</div>
            <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{item.what}</p>
          </div>
        )}

        {(item.whenUse || item.whenNot) && (
          <div className="grid grid-cols-2 gap-4">
            {item.whenUse && (
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <SectionLabel color="#4ade80">✅ Quando usar</SectionLabel>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{item.whenUse}</p>
              </div>
            )}
            {item.whenNot && (
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <SectionLabel color="#f87171">🚫 Quando NÃO usar</SectionLabel>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{item.whenNot}</p>
              </div>
            )}
          </div>
        )}

        {(item.pros || item.cons) && (
          <div className="grid grid-cols-2 gap-4">
            {item.pros && (
              <div>
                <SectionLabel color="#4ade80">👍 Prós</SectionLabel>
                <div className="bg-surface border border-border rounded-lg px-4 py-3.5">
                  {item.pros.map(p => (
                    <div key={p} className="text-[12px] text-[#8aaccc] leading-relaxed py-0.5 pl-3.5 relative before:content-['✓'] before:absolute before:left-0 before:text-green-400">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.cons && (
              <div>
                <SectionLabel color="#f87171">👎 Contras</SectionLabel>
                <div className="bg-surface border border-border rounded-lg px-4 py-3.5">
                  {item.cons.map(c => (
                    <div key={c} className="text-[12px] text-[#8aaccc] leading-relaxed py-0.5 pl-3.5 relative before:content-['✗'] before:absolute before:left-0 before:text-red-400">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {item.code && <CodeBlock code={item.code} label="Ver exemplo" />}

        {related.length > 0 && (
          <div>
            <SectionLabel color="#38bdf8">🔗 Termos relacionados</SectionLabel>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {related.map(r => <GlossaryCard key={r.term} item={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/glossary/
git commit -m "feat: add glossary components"
```

---

## Task 7: Sidebar

**Files:**
- Create: `src/components/sidebar/Sidebar.tsx`
- Create: `src/components/sidebar/NavItem.tsx`
- Create: `src/components/sidebar/FilterBar.tsx`
- Create: `src/components/sidebar/SearchBox.tsx`
- Create: `src/components/sidebar/TabSwitch.tsx`

**Step 1: TabSwitch**

```tsx
// src/components/sidebar/TabSwitch.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabSwitch() {
  const pathname = usePathname()
  const isGlossary = pathname.startsWith('/glossary')

  return (
    <div className="flex border-b border-border">
      {[
        { label: 'Conceitos', href: '/concepts' },
        { label: 'Dicionário', href: '/glossary' },
      ].map(({ label, href }) => {
        const active = href === '/glossary' ? isGlossary : !isGlossary
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-[1px] border-b-2 transition-all ${
              active
                ? 'text-accent border-accent bg-surface2'
                : 'text-muted border-transparent hover:text-text'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
```

**Step 2: SearchBox**

```tsx
// src/components/sidebar/SearchBox.tsx
interface SearchBoxProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBox({ value, onChange, placeholder = '🔍 Buscar...' }: SearchBoxProps) {
  return (
    <div className="px-3 py-2 border-b border-border">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 bg-bg border border-border rounded-md text-text font-mono text-[11px] focus:outline-none focus:border-accent"
      />
    </div>
  )
}
```

**Step 3: FilterBar**

```tsx
// src/components/sidebar/FilterBar.tsx
interface FilterBarProps {
  levels: string[]
  active: string | null
  onSelect: (level: string | null) => void
}

export function FilterBar({ levels, active, onSelect }: FilterBarProps) {
  return (
    <div className="px-3 py-2 border-b border-border flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={`text-[9px] px-2 py-1 rounded-xl border uppercase tracking-[1px] transition-all ${
          active === null
            ? 'bg-accent text-black border-accent font-bold'
            : 'border-border text-muted hover:border-accent hover:text-accent'
        }`}
      >
        Todos
      </button>
      {levels.map(l => (
        <button
          key={l}
          onClick={() => onSelect(l === active ? null : l)}
          className={`text-[9px] px-2 py-1 rounded-xl border uppercase tracking-[1px] transition-all ${
            active === l
              ? 'bg-accent text-black border-accent font-bold'
              : 'border-border text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
```

**Step 4: NavItem**

```tsx
// src/components/sidebar/NavItem.tsx
import Link from 'next/link'

interface NavItemProps {
  href: string
  emoji: string
  title: string
  tag: string
  tagColor: string
  index: number
  active: boolean
}

export function NavItem({ href, emoji, title, tag, tagColor, index, active }: NavItemProps) {
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
      <span className="text-[10px] text-muted flex-shrink-0">{index}</span>
    </Link>
  )
}
```

**Step 5: Sidebar (main client component)**

```tsx
// src/components/sidebar/Sidebar.tsx
'use client'
import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { TabSwitch } from './TabSwitch'
import { SearchBox } from './SearchBox'
import { FilterBar } from './FilterBar'
import { NavItem } from './NavItem'
import type { Concept, GlossaryItem } from '@/lib/schemas'

interface SidebarProps {
  concepts: Concept[]
  glossary: GlossaryItem[]
  levels: string[]
}

export function Sidebar({ concepts, glossary, levels }: SidebarProps) {
  const pathname = usePathname()
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
      <div className="px-4 pt-4.5 pb-3.5 border-b border-border">
        <h1 className="font-display text-[15px] text-white leading-snug">⚛️ React & Next.js<br />Senior Interview</h1>
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

**Step 6: Commit**

```bash
git add src/components/sidebar/
git commit -m "feat: add sidebar with search, filter, and tab switch"
```

---

## Task 8: App routes and layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/concepts/[id]/page.tsx`
- Create: `src/app/glossary/page.tsx`
- Create: `src/app/glossary/[term]/page.tsx`

**Step 1: Update root layout to include Sidebar**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { getConcepts, getGlossary, getConceptLevels } from '@/lib/loaders'

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-mono' })
const display = Syne({ subsets: ['latin'], weight: ['700','800'], variable: '--font-display' })

export const metadata: Metadata = { title: 'React & Next.js Senior — Guia de Entrevista' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        </div>
      </body>
    </html>
  )
}
```

**Step 2: Root redirect**

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/concepts/1')
}
```

**Step 3: Concept detail page**

```tsx
// src/app/concepts/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getConcepts, getConceptById } from '@/lib/loaders'
import { ConceptHero } from '@/components/concept/ConceptHero'
import { DefinitionBlock } from '@/components/concept/DefinitionBlock'
import { SectionGrid } from '@/components/concept/SectionGrid'
import { TipBlock } from '@/components/concept/TipBlock'
import { QuestionAccordion } from '@/components/concept/QuestionAccordion'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { NavArrows } from '@/components/concept/NavArrows'

export function generateStaticParams() {
  return getConcepts().map(c => ({ id: String(c.id) }))
}

export default function ConceptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const concept = getConceptById(id)
  if (!concept) notFound()

  const all = getConcepts()
  const idx = all.findIndex(c => c.id === id)
  const prev = all[idx - 1]?.id ?? null
  const next = all[idx + 1]?.id ?? null

  const sections = [
    { label: 'Problema', icon: '🔴', color: '#f87171', text: concept.problem },
    { label: 'Solução', icon: '✅', color: '#4ade80', text: concept.solution },
  ]

  return (
    <div>
      <ConceptHero concept={concept} />
      <div className="px-9 pb-9">
        <DefinitionBlock text={concept.definition} />
        <SectionGrid items={sections} />
        <TipBlock text={concept.tip} />
        <QuestionAccordion questions={concept.questions} />
        <CodeBlock code={concept.code} />
        <NavArrows prevId={prev} nextId={next} current={idx + 1} total={all.length} />
      </div>
    </div>
  )
}
```

**Step 4: Glossary grid page**

```tsx
// src/app/glossary/page.tsx
import { getGlossary } from '@/lib/loaders'
import { GlossaryCard } from '@/components/glossary/GlossaryCard'

export default function GlossaryPage() {
  const items = getGlossary()

  return (
    <div className="p-9">
      <h2 className="font-display text-2xl text-white mb-6">📖 Dicionário</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {items.map(item => <GlossaryCard key={item.term} item={item} />)}
      </div>
    </div>
  )
}
```

**Step 5: Glossary detail page**

```tsx
// src/app/glossary/[term]/page.tsx
import { notFound } from 'next/navigation'
import { getGlossary, getGlossaryByTerm } from '@/lib/loaders'
import { GlossaryDetail } from '@/components/glossary/GlossaryDetail'

export function generateStaticParams() {
  return getGlossary().map(g => ({ term: encodeURIComponent(g.term) }))
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const term = decodeURIComponent(params.term)
  const item = getGlossaryByTerm(term)
  if (!item) notFound()

  return <GlossaryDetail item={item} />
}
```

**Step 6: Verify build**

```bash
npm run build
```
Expected: no TypeScript errors, all static pages generated.

**Step 7: Commit**

```bash
git add src/app/
git commit -m "feat: add all app routes and root layout with sidebar"
```

---

## Task 9: Dockerfile for Coolify

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Step 1: Dockerfile (multi-stage)**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 2: .dockerignore**

```
node_modules
.next
.git
docs
*.md
```

**Step 3: Test Docker build locally**

```bash
docker build -t react-tips .
docker run -p 3000:3000 react-tips
```
Expected: app accessible at `http://localhost:3000`

**Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "chore: add Dockerfile for Coolify deploy"
```

---

## Task 10: Final smoke test

**Step 1: Run dev server and verify all routes**

```bash
npm run dev
```

Check:
- `http://localhost:3000` → redirects to `/concepts/1`
- `/concepts/1` renders concept with hero, definition, sections, tip, questions accordion, code toggle, nav arrows
- `/concepts/2` works, nav arrows update correctly
- `/glossary` renders grid of cards
- `/glossary/useState` renders detail with pros/cons, code toggle, related terms
- Sidebar search filters concept list in real time
- Sidebar filter buttons filter by level
- Tab switch between Conceitos/Dicionário updates the sidebar list
- Active item in sidebar highlights correctly

**Step 2: Production build**

```bash
npm run build && npm start
```
Expected: all pages load correctly.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete React Tips Next.js migration"
```
