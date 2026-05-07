'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ProgressButtons } from './ProgressButtons'
import type { Concept } from '@/lib/schemas'

interface FlashcardModeProps {
  concept: Concept
  onExit: () => void
}

export function FlashcardMode({ concept, onExit }: FlashcardModeProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="flex items-center justify-between px-9 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-[2px]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Modo Flashcard
        </div>
        <button
          onClick={onExit}
          className="text-[11px] text-muted hover:text-text border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-all uppercase tracking-[1px]"
        >
          ✕ Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-9 py-12 max-w-3xl mx-auto w-full">
        <div className="w-full text-center mb-8">
          <span className="text-7xl leading-none block mb-6">{concept.emoji}</span>
          <Badge label={concept.level} color={concept.color} className="mb-3" />
          <h2 className="font-display text-3xl text-white leading-tight mb-4">{concept.title}</h2>
          <p className="text-[14px] text-[#7a9cc0] leading-relaxed">{concept.summary}</p>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 px-8 py-3 bg-accent text-black font-bold text-[13px] uppercase tracking-[1.5px] rounded-xl hover:bg-[#7dd3fc] transition-all"
          >
            Revelar resposta
          </button>
        ) : (
          <div className="w-full space-y-4">
            <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4">
              <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">Definição</div>
              <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{concept.definition}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <div className="text-[10px] text-[#f87171] uppercase tracking-[2px] font-bold mb-2">🔴 Problema</div>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{concept.problem}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <div className="text-[10px] text-[#4ade80] uppercase tracking-[2px] font-bold mb-2">✅ Solução</div>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{concept.solution}</p>
              </div>
            </div>

            <div className="rounded-xl px-4 py-3.5 border border-[#854d0e] bg-[#1c0f03]">
              <div className="text-[10px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-1.5">💡 Dica Senior</div>
              <p className="text-[13px] text-[#d97706] leading-relaxed">{concept.tip}</p>
            </div>

            <div className="flex justify-center pt-2">
              <ProgressButtons conceptId={concept.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
