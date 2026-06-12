import { type ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ShellClient } from '@/components/layout/ShellClient'
import { AppTopbar } from '@/components/layout/AppTopbar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { getConcepts, getGlossary, getConceptLevels } from '@/lib/loaders'
import { ProgressBar } from '@/components/layout/ProgressBar'
import { ChatWidget } from '@/components/chat/ChatWidget'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-jb' })

export const metadata: Metadata = {
  metadataBase: new URL('https://react-tips.felipev.com.br'),
  title: {
    template: '%s · React Interview Deck',
    default: 'React Interview Deck — Preparação Senior/Staff',
  },
  description: 'Domine React, Next.js e TypeScript para entrevistas Senior e Staff. 97 conceitos, 144+ perguntas, glossário, flashcards e cockpits de System Design — tudo em português.',
  keywords: ['React', 'Next.js', 'TypeScript', 'entrevista front-end', 'preparação entrevista React', 'senior engineer', 'staff engineer', 'JavaScript'],
  authors: [{ name: 'React Interview Deck' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://react-tips.felipev.com.br',
    siteName: 'React Interview Deck',
    title: 'React Interview Deck — Preparação Senior/Staff',
    description: 'Domine React, Next.js e TypeScript para entrevistas. 97 conceitos, flashcards, Q&As e System Design em português.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'React Interview Deck' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'React Interview Deck',
    description: 'Prepare-se para entrevistas React Senior/Staff. 97 conceitos, 144+ perguntas em português.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const concepts = getConcepts()
  const glossary = getGlossary()
  const levels = getConceptLevels()

  return (
    <html lang="pt-BR" data-theme="light" data-density="compact" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ProgressBar />
        <ShellClient
          topbar={<AppTopbar concepts={concepts} />}
          sidebar={<AppSidebar concepts={concepts} levels={levels} />}
          search={<GlobalSearch concepts={concepts} glossary={glossary} />}
          concepts={concepts}
        >
          {children}
        </ShellClient>
        <ChatWidget />
      </body>
    </html>
  )
}
