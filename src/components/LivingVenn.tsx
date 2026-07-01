import type { Accent } from '../types'

interface LivingVennProps {
  myLikes: number
  partnerLikes: number
  matchCount: number
  myAccent: Accent
}

// Circle radius grows with the like count — sqrt so the AREA tracks likes
// (doubling likes ≈ doubling area, not radius). Clamped so it never overflows.
function radius(likes: number): number {
  return 28 + Math.min(44, Math.sqrt(likes) * 8)
}

// The signature "living" Venn: Partner A (periwinkle) always left, Partner B
// (rose) always right, each circle sized by how many names that partner has
// liked. The overlap (match-violet blend) holds the mutual-match count.
export default function LivingVenn({ myLikes, partnerLikes, matchCount, myAccent }: LivingVennProps) {
  const aIsYou = myAccent === 'a'
  const aLikes = aIsYou ? myLikes : partnerLikes
  const bLikes = aIsYou ? partnerLikes : myLikes

  const rA = radius(aLikes)
  const rB = radius(bLikes)
  const cy = 80
  const gap = (rA + rB) * 0.58 // center distance → keeps a consistent overlap lens
  const cxA = 120 - gap / 2
  const cxB = 120 + gap / 2

  const leftLabel = aIsYou ? 'You' : 'Them'
  const rightLabel = aIsYou ? 'Them' : 'You'

  return (
    <div
      className="flex flex-col items-center"
      aria-label={`You have liked ${myLikes} names, your partner ${partnerLikes}, with ${matchCount} ${matchCount === 1 ? 'match' : 'matches'} in common`}
    >
      <svg width="240" height="160" viewBox="0 0 240 160" aria-hidden="true">
        <circle
          cx={cxA}
          cy={cy}
          r={rA}
          fill="var(--color-accent-a)"
          opacity="0.5"
          style={{ transition: 'r 0.5s ease-out, cx 0.5s ease-out' }}
        />
        <circle
          cx={cxB}
          cy={cy}
          r={rB}
          fill="var(--color-accent-b)"
          opacity="0.5"
          style={{ transition: 'r 0.5s ease-out, cx 0.5s ease-out' }}
        />
        <text
          x="120"
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontSize="30"
          fontWeight="600"
          fill="var(--color-match)"
        >
          {matchCount}
        </text>
      </svg>

      <p className="-mt-1 text-sm text-pass">
        {matchCount === 0 ? 'No matches yet' : matchCount === 1 ? '1 match' : `${matchCount} matches`}
      </p>

      <div className="mt-3 flex items-center gap-5 text-xs text-pass">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent-a)' }} aria-hidden="true" />
          {leftLabel} <span className="font-medium text-ink/70 tabular-nums">{aLikes}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent-b)' }} aria-hidden="true" />
          {rightLabel} <span className="font-medium text-ink/70 tabular-nums">{bLikes}</span>
        </span>
      </div>
    </div>
  )
}
