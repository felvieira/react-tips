import Link from 'next/link'

interface NavItemProps {
  href: string
  emoji: string
  title: string
  tag: string
  tagColor: string
  index: number
  active: boolean
}

export function NavItem({ href, emoji, title, tag, tagColor, index, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 border-l-[3px] transition-all hover:bg-surface2 ${
        active ? 'bg-surface2 border-accent' : 'border-transparent'
      }`}
    >
      <span className="text-base flex-shrink-0">{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] truncate ${active ? 'text-white' : 'text-text'}`}>{title}</div>
        <span
          className="inline-block text-[9px] px-1.5 py-0.5 rounded-lg mt-0.5 uppercase tracking-[0.8px]"
          style={{ color: tagColor, backgroundColor: `${tagColor}18` }}
        >
          {tag}
        </span>
      </div>
      {index > 0 && <span className="text-[10px] text-muted flex-shrink-0">{index}</span>}
    </Link>
  )
}
