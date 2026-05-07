export function TipBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl px-4 py-3.5 mt-4 border border-[#854d0e] bg-[#1c0f03]">
      <div className="text-[10px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-1.5">💡 Dica Senior</div>
      <p className="text-[13px] text-[#d97706] leading-relaxed">{text}</p>
    </div>
  )
}
