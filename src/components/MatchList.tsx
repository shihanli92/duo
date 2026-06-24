import type { Match } from '../types'

interface MatchListProps {
  matches: Match[]
  lastName?: string
  middleName?: string
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

export default function MatchList({ matches, lastName, middleName }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-pass">Keep swiping to find names you both love!</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3 px-4">
      {matches.map((match) => (
        <li
          key={match.id}
          className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-match)" className="shrink-0">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="flex-1">
            <p className="font-display text-lg font-semibold text-ink">
              {match.value}
              {(middleName || lastName) && (
                <span className="text-base font-medium text-pass/50">
                  {middleName ? ` ${middleName}` : ''}{lastName ? ` ${lastName}` : ''}
                </span>
              )}
            </p>
            {lastName && (
              <p className="text-xs tracking-wide text-pass/50">
                {formatInitials(match.value, middleName ?? '', lastName)}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${genderColors[match.gender] ?? 'bg-pass/15 text-pass'}`}
              >
                {match.gender}
              </span>
              {match.origin && (
                <span className="text-xs text-pass">{match.origin}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
