# Design: React Tips — Next.js App Router

**Date:** 2026-05-07  
**Status:** Approved  
**Source:** `react-guia-completo_2.html`

## Goal

Migrate a single-file HTML interview guide (~3300 lines, all inline JS/CSS/data) to a maintainable Next.js 15 project with DRY architecture, type-safe data layer, and Docker deploy for Coolify.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styles | Tailwind CSS |
| Data validation | Zod |
| Fonts | IBM Plex Mono + Syne (Google Fonts / next/font) |
| Deploy | Docker (standalone output) on Coolify |

## Data Model

Two JSON files are the single source of truth:

**`concepts.json`** — array of ~45 items:
```ts
{
  id: number
  emoji: string
  title: string
  level: string       // e.g. "Performance", "React 18", "Next.js RSC"
  color: string       // hex for level badge
  summary: string
  definition: string
  problem: string
  solution: string
  tip: string
  questions: Array<{ q: string; a: string }>
  code: string
}
```

**`glossary.json`** — array of ~30+ items:
```ts
{
  term: string
  category: string    // e.g. "Hook", "Pattern"
  def: string
  what: string
  whenUse: string
  whenNot: string
  pros: string[]
  cons: string[]
  code: string
}
```

Zod schemas in `lib/schemas.ts` validate both at build time via `loaders.ts`. No component imports JSON directly.

## Routing

| Route | Page | Rendering |
|-------|------|-----------|
| `/` | Redirect → `/concepts/1` | — |
| `/concepts/[id]` | Concept detail | SSG (`generateStaticParams`) |
| `/glossary` | Glossary grid | SSG |
| `/glossary/[term]` | Glossary detail | SSG |

Layout (`app/layout.tsx`) wraps all routes with the sidebar shell — persists across navigation.

## Component Tree

```
RootLayout (layout.tsx)
├── Sidebar (client)
│   ├── TabSwitch
│   ├── SearchBox
│   ├── FilterBar          ← concepts only
│   └── NavItem[]
└── {children}
    ├── /concepts/[id]
    │   ├── ConceptHero
    │   ├── DefinitionBlock
    │   ├── SectionGrid
    │   ├── TipBlock
    │   ├── QuestionAccordion[]
    │   ├── CodeBlock (toggle)
    │   └── NavArrows
    └── /glossary
        └── GlossaryGrid
            └── GlossaryCard[]
```

## DRY Principles

- Design tokens (colors, fonts) live in `tailwind.config.ts` — used via class names, not inline styles
- All data access goes through `lib/loaders.ts` — single place to change data source later
- `QuestionAccordion` and `CodeBlock` are reused across concept and glossary detail views
- Sidebar active state via `usePathname()` — no prop drilling

## Docker / Coolify

```dockerfile
# Multi-stage, node:20-alpine
# next.config.ts: output: 'standalone'
# Exposes port 3000
# No required env vars
```

## Out of Scope

- Auth / user accounts
- Progress tracking / bookmarks
- Admin CMS panel
- Dark/light mode toggle (dark-only, matching original)
