'use client'
import { useRouter } from 'next/navigation'

interface NavArrowsProps {
  prevId: number | null
  nextId: number | null
  current: number
  total: number
}

export function NavArrows({ prevId, nextId, current, total }: NavArrowsProps) {
  const router = useRouter()

  return (
    <div className="flex gap-2 mt-7 pt-5 border-t border-border">
      <button
        onClick={() => prevId && router.push(`/concepts/${prevId}`)}
        disabled={!prevId}
        className="flex-1 py-2.5 bg-surface2 border border-border rounded-lg text-muted text-[11px] text-center transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-default"
      >
        ← Anterior
      </button>
      <span className="flex items-center px-3 text-accent text-[11px]">
        {current}/{total}
      </span>
      <button
        onClick={() => nextId && router.push(`/concepts/${nextId}`)}
        disabled={!nextId}
        className="flex-1 py-2.5 bg-surface2 border border-border rounded-lg text-muted text-[11px] text-center transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-default"
      >
        Próximo →
      </button>
    </div>
  )
}
