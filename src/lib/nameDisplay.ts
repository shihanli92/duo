// Display options for the hero name on the swipe cards: alternate fonts and
// alternate name formats. Shared between NameCard (rendering) and SwipeDeck
// (the pickers).

export type FontKey = 'fraunces' | 'playfair' | 'cormorant' | 'dmserif'

export interface FontSpec {
  label: string
  family: string
  weight: number
  scale: number // per-font size nudge so faces read at a similar visual size
}

export const FONTS: Record<FontKey, FontSpec> = {
  fraunces: { label: 'Fraunces', family: "'Fraunces', serif", weight: 500, scale: 1 },
  playfair: { label: 'Playfair Display', family: "'Playfair Display', serif", weight: 600, scale: 1 },
  cormorant: { label: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", weight: 600, scale: 1.18 },
  dmserif: { label: 'DM Serif Display', family: "'DM Serif Display', serif", weight: 400, scale: 1 },
}

export const FONT_ORDER: FontKey[] = ['fraunces', 'playfair', 'cormorant', 'dmserif']

export type FormatKey = 'first' | 'firstMidLast' | 'initialsLast' | 'full' | 'initials'

export const FORMAT_LABELS: Record<FormatKey, string> = {
  first: 'Amara',
  firstMidLast: 'Amara R. Chen',
  initialsLast: 'AR Chen',
  full: 'Amara Rose Chen',
  initials: 'A.R.C.',
}

export const FORMAT_ORDER: FormatKey[] = ['first', 'firstMidLast', 'initialsLast', 'full', 'initials']

// Initials of a name part, splitting on spaces and hyphens: "Smith-Jones" → "S.J."
function initialsOf(part: string): string {
  return part
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((s) => `${s.charAt(0).toUpperCase()}.`)
    .join('')
}

export function formatName(
  format: FormatKey,
  first: string,
  middle?: string,
  last?: string,
): string {
  const mid = middle?.trim() || ''
  const lst = last?.trim() || ''

  switch (format) {
    case 'full':
      return [first, mid, lst].filter(Boolean).join(' ')
    case 'firstMidLast':
      return (
        first +
        (mid ? ` ${mid.charAt(0).toUpperCase()}.` : '') +
        (lst ? ` ${lst}` : '')
      )
    case 'initialsLast': {
      // First + middle initials (no dots), then the last name spelled out: "AR Chen"
      const inits = [first, mid].filter(Boolean).map((s) => s.charAt(0).toUpperCase()).join('')
      return lst ? `${inits} ${lst}` : inits
    }
    case 'initials':
      return [first, mid, lst].filter(Boolean).map(initialsOf).join('')
    case 'first':
    default:
      return first
  }
}
