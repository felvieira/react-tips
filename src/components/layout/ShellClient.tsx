'use client'
import { type ReactNode, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

interface ShellClientProps {
  topbar: ReactNode
  sidebar: ReactNode
  children: ReactNode
  search: ReactNode
}

export function ShellClient({ topbar, sidebar, children, search }: ShellClientProps) {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    // Init
    setFocused(localStorage.getItem(STORAGE_KEYS.focus) === '1')

    const handler = (e: Event) => {
      setFocused((e as CustomEvent<boolean>).detail)
    }
    window.addEventListener('focus-mode-changed', handler)
    return () => window.removeEventListener('focus-mode-changed', handler)
  }, [])

  return (
    <div className="app-grid" data-focus={focused ? 'true' : 'false'}>
      {topbar}
      <div
        className="app-sidebar-wrapper"
        style={{
          gridArea: 'sidebar',
          overflow: 'hidden',   /* apenas para a transição de width */
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          width: focused ? 0 : 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ width: 280, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {sidebar}
        </div>
      </div>
      <main className="app-content">
        {children}
      </main>
      {search}
    </div>
  )
}
