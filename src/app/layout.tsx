import { type ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ShellClient } from '@/components/layout/ShellClient'
import { AppTopbar } from '@/components/layout/AppTopbar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { getConcepts, getGlossary, getConceptLevels } from '@/lib/loaders'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-jb' })

export const metadata: Metadata = { title: 'React Interview Deck — Senior/Staff prep' }

export default function RootLayout({ children }: { children: ReactNode }) {
  const concepts = getConcepts()
  const glossary = getGlossary()
  const levels = getConceptLevels()

  return (
    <html lang="pt-BR" data-theme="light" data-density="compact" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ShellClient
          topbar={<AppTopbar concepts={concepts} glossary={glossary} />}
          sidebar={<AppSidebar concepts={concepts} levels={levels} />}
          search={<GlobalSearch concepts={concepts} glossary={glossary} />}
        >
          {children}
        </ShellClient>
      </body>
    </html>
  )
}
