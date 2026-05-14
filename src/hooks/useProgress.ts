'use client'
import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

export type ProgressStatus = 'unseen' | 'know' | 'review'

interface ProgressStore {
  [conceptId: number]: ProgressStatus
}

const STORAGE_KEY = STORAGE_KEYS.progress

function readStore(): ProgressStore {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>({})

  useEffect(() => {
    setStore(readStore())
  }, [])

  const setStatus = useCallback((id: number, status: ProgressStatus) => {
    setStore(prev => {
      const next = { ...prev, [id]: status }
      writeStore(next)
      return next
    })
  }, [])

  const getStatus = useCallback((id: number): ProgressStatus => {
    return store[id] ?? 'unseen'
  }, [store])

  const knowCount = Object.values(store).filter(s => s === 'know').length
  const reviewCount = Object.values(store).filter(s => s === 'review').length

  const stats = {
    know: knowCount,
    review: reviewCount,
  }

  return { store, setStatus, getStatus, stats }
}
