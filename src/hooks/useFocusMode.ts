'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'react-tips-focus'

export function useFocusMode() {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setFocused(localStorage.getItem(STORAGE_KEY) === '1')
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        setFocused(v => {
          const next = !v
          localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggle = () => {
    setFocused(v => {
      const next = !v
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return { focused, toggle }
}
