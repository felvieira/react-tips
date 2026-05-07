'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'react-tips-focus'

export function useFocusMode() {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setFocused(localStorage.getItem(STORAGE_KEY) === '1')
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
