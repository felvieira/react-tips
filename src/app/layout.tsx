import { type ReactNode } from 'react'
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${mono.variable} ${display.variable}`}>
      <body className="bg-bg text-text font-mono min-h-screen">{children}</body>
    </html>
  )
}
