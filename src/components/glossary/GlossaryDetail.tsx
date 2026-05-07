import { SectionLabel } from '@/components/ui/SectionLabel'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { GlossaryCard } from './GlossaryCard'
import { getGlossary } from '@/lib/loaders'
import type { GlossaryItem } from '@/lib/schemas'

export function GlossaryDetail({ item }: { item: GlossaryItem }) {
  const related = getGlossary()
    .filter(g => g.category === item.category && g.term !== item.term)
    .slice(0, 8)

  return (
    <div>
      <div className="px-9 pt-7 pb-6 border-b border-border bg-gradient-to-br from-surface to-bg">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl leading-none">📖</span>
          <div>
            <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-xl uppercase tracking-[1.5px] font-bold bg-[#0c2d44] text-accent mb-2">
              {item.category}
            </span>
            <h2 className="font-display text-2xl text-white leading-tight">{item.term}</h2>
          </div>
        </div>
        <p className="text-[13px] text-[#7a9cc0] leading-relaxed max-w-2xl">{item.def}</p>
      </div>

      <div className="px-9 pb-9 mt-5 space-y-4">
        {item.what && (
          <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4">
            <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">📚 O que é</div>
            <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{item.what}</p>
          </div>
        )}

        {(item.whenUse || item.whenNot) && (
          <div className="grid grid-cols-2 gap-4">
            {item.whenUse && (
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <SectionLabel color="#4ade80">✅ Quando usar</SectionLabel>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{item.whenUse}</p>
              </div>
            )}
            {item.whenNot && (
              <div className="bg-surface border border-border rounded-xl px-5 py-4">
                <SectionLabel color="#f87171">🚫 Quando NÃO usar</SectionLabel>
                <p className="text-[13px] text-[#8aaccc] leading-relaxed">{item.whenNot}</p>
              </div>
            )}
          </div>
        )}

        {(item.pros || item.cons) && (
          <div className="grid grid-cols-2 gap-4">
            {item.pros && (
              <div>
                <SectionLabel color="#4ade80">👍 Prós</SectionLabel>
                <div className="bg-surface border border-border rounded-lg px-4 py-3.5">
                  {item.pros.map(p => (
                    <div key={p} className="text-[12px] text-[#8aaccc] leading-relaxed py-0.5 pl-3.5 relative before:content-['✓'] before:absolute before:left-0 before:text-green-400">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.cons && (
              <div>
                <SectionLabel color="#f87171">👎 Contras</SectionLabel>
                <div className="bg-surface border border-border rounded-lg px-4 py-3.5">
                  {item.cons.map(c => (
                    <div key={c} className="text-[12px] text-[#8aaccc] leading-relaxed py-0.5 pl-3.5 relative before:content-['✗'] before:absolute before:left-0 before:text-red-400">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {item.code && <CodeBlock code={item.code} label="Ver exemplo" />}

        {related.length > 0 && (
          <div>
            <SectionLabel color="#38bdf8">🔗 Termos relacionados</SectionLabel>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {related.map(r => <GlossaryCard key={r.term} item={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
