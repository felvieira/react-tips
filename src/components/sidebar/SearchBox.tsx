interface SearchBoxProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBox({ value, onChange, placeholder = '🔍 Buscar...' }: SearchBoxProps) {
  return (
    <div className="px-3 py-2 border-b border-border">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 bg-bg border border-border rounded-md text-text font-mono text-[11px] focus:outline-none focus:border-accent"
      />
    </div>
  )
}
