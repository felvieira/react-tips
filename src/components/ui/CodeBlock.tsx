'use client'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label = 'Ver código de exemplo' }: CodeBlockProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

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
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', top: 20, right: 12,
              padding: '3px 8px', fontSize: 10,
              fontFamily: 'var(--font-mono)',
              background: 'var(--border)', border: '1px solid var(--border-strong)',
              borderRadius: 4, color: 'var(--fg-muted)', cursor: 'pointer',
              transition: 'all .15s',
              zIndex: 1,
            }}
          >
            {copied ? '✓ copiado' : 'copiar'}
          </button>
          <pre className="mt-3 bg-[#060912] border border-border rounded-xl p-5 text-xs leading-relaxed text-[#a5c8f0] overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      )}
    </div>
  )
}
