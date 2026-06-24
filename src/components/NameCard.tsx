import type { Name } from '../types'

interface NameCardProps {
  name: Name
  style?: React.CSSProperties
  className?: string
}

const genderColors: Record<string, string> = {
  girl: 'bg-accent-b/15 text-accent-b',
  boy: 'bg-accent-a/15 text-accent-a',
  unisex: 'bg-match/15 text-match',
}

export default function NameCard({ name, style, className = '' }: NameCardProps) {
  return (
    <div
      role="article"
      aria-label={`Baby name: ${name.value}, ${name.gender}${name.origin ? `, origin: ${name.origin}` : ''}`}
      className={`flex flex-col items-center justify-center rounded-2xl bg-white shadow-md ${className}`}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <h2 className="font-display text-5xl font-semibold text-ink sm:text-6xl">
        {name.value}
      </h2>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${genderColors[name.gender] ?? 'bg-pass/15 text-pass'}`}
        >
          {name.gender}
        </span>
        {name.origin && (
          <span className="text-sm text-pass">{name.origin}</span>
        )}
      </div>
    </div>
  )
}
