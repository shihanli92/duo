interface OriginFilterProps {
  value: string | undefined
  origins: string[]
  onChange: (value: string | undefined) => void
}

export default function OriginFilter({ value, origins, onChange }: OriginFilterProps) {
  const active = !!value

  return (
    <div className="relative inline-flex">
      <select
        aria-label="Filter by origin"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={`appearance-none rounded-full py-1.5 pl-4 pr-9 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
          active
            ? 'bg-ink text-paper'
            : 'border border-pass/30 bg-white text-pass hover:text-ink'
        }`}
      >
        <option value="">All origins</option>
        {origins.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${active ? 'text-paper' : 'text-pass'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}
