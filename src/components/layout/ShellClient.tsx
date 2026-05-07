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
      <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 ${focused ? 'w-0' : 'w-[290px]'}`}>
        {sidebar}
      </div>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>
      {search}
    </div>
  )
}
