import { getGlossary } from '@/lib/loaders'
import { GlossaryCard } from '@/components/glossary/GlossaryCard'

export default function GlossaryPage() {
  const items = getGlossary()

  return (
    <div className="p-9">
      <h2 className="font-display text-2xl text-white mb-6">📖 Dicionário</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {items.map(item => <GlossaryCard key={item.term} item={item} />)}
      </div>
    </div>
  )
}
