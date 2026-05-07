interface BadgeProps {
  label: string
  color: string
  className?: string
}

export function Badge({ label, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] px-2 py-0.5 rounded-full uppercase tracking-[1.5px] font-bold ${className}`}
      style={{ color, backgroundColor: `${color}18` }}
    >
      {label}
    </span>
  )
}
