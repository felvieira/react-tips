export function TipBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl px-5 py-5 mt-3 border border-[#854d0e] bg-[#1c0f03]">
      <div className="text-[10px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-3">💡 Dica Senior</div>
      <p className="text-[14px] text-[#d97706] leading-[1.8]">{text}</p>
    </div>
  )
}
