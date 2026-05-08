'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'react-tips-focus'
const EVENT = 'focus-mode-changed'

function applyFocus(next: boolean) {
  localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
}

export function useFocusMode() {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    // Init from storage
    setFocused(localStorage.getItem(STORAGE_KEY) === '1')

    // Listen for changes from other instances
    const syncHandler = (e: Event) => {
      setFocused((e as CustomEvent<boolean>).detail)
    }

    // Keyboard shortcut Cmd/Ctrl + .
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        const next = localStorage.getItem(STORAGE_KEY) !== '1'
        applyFocus(next)
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
    const next = localStorage.getItem(STORAGE_KEY) !== '1'
    applyFocus(next)
  }

  return { focused, toggle }
}
