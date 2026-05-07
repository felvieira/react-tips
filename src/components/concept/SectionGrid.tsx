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
    <div className="flex flex-col gap-3 mt-4">
      {items.map(({ label, icon, color, text }) => (
        <div key={label} className="bg-surface border border-border rounded-xl px-5 py-4">
          <SectionLabel color={color}>{icon} {label}</SectionLabel>
          <p className="text-[14px] text-[#8aaccc] leading-[1.8]">{text}</p>
        </div>
      ))}
    </div>
  )
}
