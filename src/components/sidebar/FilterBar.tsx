interface FilterBarProps {
  levels: string[]
  active: string | null
  onSelect: (level: string | null) => void
}

export function FilterBar({ levels, active, onSelect }: FilterBarProps) {
  return (
    <div className="px-3 py-2 border-b border-border flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={`text-[9px] px-2 py-1 rounded-xl border uppercase tracking-[1px] transition-all ${
          active === null
            ? 'bg-accent text-black border-accent font-bold'
            : 'border-border text-muted hover:border-accent hover:text-accent'
        }`}
      >
        Todos
      </button>
      {levels.map(l => (
        <button
          key={l}
          onClick={() => onSelect(l === active ? null : l)}
          className={`text-[9px] px-2 py-1 rounded-xl border uppercase tracking-[1px] transition-all ${
            active === l
              ? 'bg-accent text-black border-accent font-bold'
              : 'border-border text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
