export function DefinitionBlock({ text }: { text: string }) {
  return (
    <div className="bg-surface border-l-[3px] border-accent rounded-md px-5 py-4 mt-5">
      <div className="text-[10px] text-accent uppercase tracking-[2px] font-bold mb-2">Definição</div>
      <p className="text-[13px] text-[#b8d0e8] leading-relaxed">{text}</p>
    </div>
  )
}
