import type { Name } from '../types'

interface NameCardProps {
  name: Name
  lastName?: string
  middleName?: string
  onTapName?: () => void
  style?: React.CSSProperties
  className?: string
}

const genderColors: Record<string, string> = {
  girl: 'bg-accent-b/15 text-accent-b',
  boy: 'bg-accent-a/15 text-accent-a',
  unisex: 'bg-match/15 text-match',
}

function formatInitials(firstName: string, middleName: string, lastName: string): string {
  const fi = firstName.charAt(0).toUpperCase()
  const mi = middleName ? middleName.charAt(0).toUpperCase() : ''
  const li = lastName.charAt(0).toUpperCase()
  return mi ? `${fi}.${mi}.${li}.` : `${fi}.${li}.`
}

export default function NameCard({ name, lastName, middleName, onTapName, style, className = '' }: NameCardProps) {
  const hasSecondary = lastName || middleName

  return (
    <div
      role="article"
      aria-label={`Baby name: ${name.value}${middleName ? ` ${middleName}` : ''}${lastName ? ` ${lastName}` : ''}, ${name.gender}${name.origin ? `, origin: ${name.origin}` : ''}`}
      className={`flex flex-col items-center justify-center rounded-2xl bg-white shadow-md ${className}`}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <h2 className="text-center font-display font-semibold text-ink">
        <span
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${onTapName ? 'cursor-pointer underline decoration-pass/20 decoration-2 underline-offset-4 hover:decoration-match/40' : ''}`}
          onClick={onTapName}
        >
          {name.value}
        </span>
        {hasSecondary && (
          <span className="text-3xl font-medium text-pass/50 sm:text-4xl md:text-5xl">
            {middleName ? ` ${middleName}` : ''}{lastName ? ` ${lastName}` : ''}
          </span>
        )}
      </h2>
      {lastName && (
        <p className="mt-1 text-sm tracking-wide text-pass/60 md:text-base">
          {formatInitials(name.value, middleName ?? '', lastName)}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2 md:mt-6">
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize md:text-sm ${genderColors[name.gender] ?? 'bg-pass/15 text-pass'}`}
        >
          {name.gender}
        </span>
        {name.origin && (
          <span className="text-sm text-pass md:text-base">{name.origin}</span>
        )}
      </div>
      {name.meaning && (
        <p className="mt-1 text-xs italic text-pass/70">{name.meaning}</p>
      )}
    </div>
  )
}
