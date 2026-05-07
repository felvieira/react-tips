'use client'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label = 'Ver código de exemplo' }: CodeBlockProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-[11px] uppercase tracking-[1px] transition-all ${
          open
            ? 'border-accent text-accent bg-[#0c2d44]'
            : 'border-border text-muted hover:border-accent hover:text-accent'
        }`}
      >
        {open ? '▲' : '▼'}&nbsp;&nbsp;{open ? `Esconder ${label}` : label}
      </button>

      {open && (
        <pre className="mt-3 bg-[#060912] border border-border rounded-xl p-5 text-xs leading-relaxed text-[#a5c8f0] overflow-x-auto whitespace-pre">
          {code}
        </pre>
      )}
    </div>
  )
}
