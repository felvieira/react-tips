'use client'
import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

const STORAGE_KEY = STORAGE_KEYS.mode
const EVENT = 'app-mode-changed'

export type AppMode = 'study' | 'interview'

function applyMode(next: AppMode) {
  document.documentElement.dataset.mode = next
  localStorage.setItem(STORAGE_KEY, next)
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
}

export function useMode() {
  const [mode, setMode] = useState<AppMode>('study')

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as AppMode | null) ?? 'study'
    setMode(saved)
    document.documentElement.dataset.mode = saved

    const syncHandler = (e: Event) => {
      setMode((e as CustomEvent<AppMode>).detail)
    }
    const keyHandler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      // Lower-case E to toggle
      if (e.key === 'e' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        const next: AppMode = localStorage.getItem(STORAGE_KEY) === 'interview' ? 'study' : 'interview'
        applyMode(next)
      }
    }
    window.addEventListener(EVENT, syncHandler)
    window.addEventListener('keydown', keyHandler)
    return () => {
      window.removeEventListener(EVENT, syncHandler)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [])

  const toggle = () => {
    const next: AppMode = mode === 'interview' ? 'study' : 'interview'
    applyMode(next)
  }

  return { mode, toggle, isInterview: mode === 'interview' }
}
