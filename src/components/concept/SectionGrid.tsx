import { SectionLabel } from '@/components/ui/SectionLabel'

interface SectionItem {
  label: string
  icon: string
  color: string
  text: string
  full?: boolean
}

export function SectionGrid({ items }: { items: SectionItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {items.map(({ label, icon, color, text, full }) => (
        <div
          key={label}
          className={`bg-surface border border-border rounded-xl px-5 py-4 ${full ? 'col-span-2' : ''}`}
        >
          <SectionLabel color={color}>{icon} {label}</SectionLabel>
          <p className="text-[13px] text-[#8aaccc] leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}
