'use client'
import { useState } from 'react'
import type { Question } from '@/lib/schemas'

export function QuestionAccordion({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mt-6">
      <h3 className="font-display text-[17px] text-white mb-3.5 flex items-center gap-2.5 before:content-[''] before:w-1 before:h-[18px] before:bg-accent before:rounded-sm">
        Perguntas de Entrevista
      </h3>
      {questions.map((q, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl mb-2.5 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start gap-3 px-[18px] py-3.5 text-left hover:bg-surface2 transition-colors"
          >
            <span className="text-accent font-bold flex-shrink-0 text-sm">Q</span>
            <span className="flex-1 text-[13px] text-text leading-relaxed">{q.q}</span>
            <span className={`text-muted flex-shrink-0 transition-transform ${open === i ? 'rotate-180 text-accent' : ''}`}>▾</span>
          </button>
          {open === i && (
            <div className="px-[18px] pb-4 pl-[50px]">
              <p className="text-[13px] text-[#8aaccc] leading-relaxed border-l-2 border-accent pl-3.5">{q.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
