'use client'
import { type ReactNode } from 'react'
import { useFocusMode } from '@/hooks/useFocusMode'

interface ShellClientProps {
  topbar: ReactNode
  sidebar: ReactNode
  children: ReactNode
  search: ReactNode
}

export function ShellClient({ topbar, sidebar, children, search }: ShellClientProps) {
  const { focused } = useFocusMode()

  return (
    <div className="app-grid" data-focus={focused ? 'true' : 'false'}>
      {topbar}
      {sidebar}
      <main className="app-content">
        {children}
      </main>
      {search}
    </div>
  )
}
