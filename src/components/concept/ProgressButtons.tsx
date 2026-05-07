'use client'
import { useProgress, type ProgressStatus } from '@/hooks/useProgress'

interface ProgressButtonsProps {
  conceptId: number
}

export function ProgressButtons({ conceptId }: ProgressButtonsProps) {
  const { getStatus, setStatus } = useProgress()
  const status = getStatus(conceptId)

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setStatus(conceptId, status === 'know' ? 'unseen' : 'know')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border transition-all ${
          status === 'know'
            ? 'bg-green-500/20 border-green-500 text-green-400'
            : 'bg-transparent border-border text-muted hover:border-green-500 hover:text-green-400'
        }`}
      >
        ✓ Sei
      </button>
      <button
        onClick={() => setStatus(conceptId, status === 'review' ? 'unseen' : 'review')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[1px] border transition-all ${
          status === 'review'
            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
            : 'bg-transparent border-border text-muted hover:border-yellow-500 hover:text-yellow-400'
        }`}
      >
        ⟳ Revisar
      </button>
    </div>
  )
}
