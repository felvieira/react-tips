import Link from 'next/link'
import type { ProgressStatus } from '@/hooks/useProgress'

interface NavItemProps {
  href: string
  emoji: string
  title: string
  tag: string
  tagColor: string
  index: number
  active: boolean
  status?: ProgressStatus
}

const STATUS_DOT: Record<string, string> = {
  know:   'bg-green-400',
  review: 'bg-yellow-400',
}

export function NavItem({ href, emoji, title, tag, tagColor, index, active, status }: NavItemProps) {
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
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {status && STATUS_DOT[status] && (
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
        )}
        {index > 0 && <span className="text-[10px] text-muted">{index}</span>}
      </div>
    </Link>
  )
}
