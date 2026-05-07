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
        </div>
        <GlobalSearch concepts={concepts} glossary={glossary} />
      </body>
    </html>
  )
}
