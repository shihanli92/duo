interface VennHeaderProps {
  matchCount: number
}

export default function VennHeader({ matchCount }: VennHeaderProps) {
  return (
    <div
      className="flex flex-col items-center"
      aria-label={`You and your partner have ${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`}
    >
      <svg width="160" height="100" viewBox="0 0 160 100" aria-hidden="true">
        {/* Partner A circle (periwinkle) */}
        <circle cx="60" cy="50" r="38" fill="var(--color-accent-a)" opacity="0.35" />
        {/* Partner B circle (rose) */}
        <circle cx="100" cy="50" r="38" fill="var(--color-accent-b)" opacity="0.35" />
        {/* Match count in the overlap */}
        <text
          x="80"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontSize="28"
          fontWeight="600"
          fill="var(--color-match)"
        >
          {matchCount}
        </text>
      </svg>
      <p className="text-sm text-pass">
        {matchCount === 0
          ? 'No matches yet'
          : matchCount === 1
            ? '1 match'
            : `${matchCount} matches`}
      </p>
    </div>
  )
}
