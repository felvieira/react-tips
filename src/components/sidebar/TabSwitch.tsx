'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabSwitch() {
  const pathname = usePathname()
  const isGlossary = pathname.startsWith('/glossary')

  return (
    <div className="flex border-b border-border">
      {[
        { label: 'Conceitos', href: '/concepts/1' },
        { label: 'Dicionário', href: '/glossary' },
      ].map(({ label, href }) => {
        const active = href.startsWith('/glossary') ? isGlossary : !isGlossary
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-[1px] border-b-2 transition-all ${
              active
                ? 'text-accent border-accent bg-surface2'
                : 'text-muted border-transparent hover:text-text'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
