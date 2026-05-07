'use client'
import { useFocusMode } from '@/hooks/useFocusMode'

export function FocusToggle() {
  const { focused, toggle } = useFocusMode()

  return (
    <button
      onClick={toggle}
      title={focused ? 'Mostrar sidebar (⌘.)' : 'Modo foco (⌘.)'}
      className={'app-icon-btn' + (focused ? ' active' : '')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>
      </svg>
    </button>
  )
}
