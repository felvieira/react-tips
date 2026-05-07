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
