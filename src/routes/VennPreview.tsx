import { useState } from 'react'
import LivingVenn from '../components/LivingVenn'
import type { Accent } from '../types'

// Dev-only harness for the living Venn. Sliders drive the counts so the
// circles' growth + overlap can be tuned without real data. Gated to dev
// builds in App.tsx, so it never ships.

function Slider({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-pass">
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--color-match)]"
      />
      <span className="w-8 text-right font-medium tabular-nums text-ink/70">{value}</span>
    </label>
  )
}

export default function VennPreview() {
  const [myLikes, setMyLikes] = useState(12)
  const [partnerLikes, setPartnerLikes] = useState(20)
  const [matchCount, setMatchCount] = useState(5)
  const [myAccent, setMyAccent] = useState<Accent>('a')

  const cap = Math.min(myLikes, partnerLikes)
  const shownMatches = Math.min(matchCount, cap)

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pt-8">
      <p className="font-display text-lg text-ink">Living Venn preview</p>
      <p className="mb-6 text-xs text-pass">dev-only · no login</p>

      <LivingVenn myLikes={myLikes} partnerLikes={partnerLikes} matchCount={shownMatches} myAccent={myAccent} />

      <div className="mt-8 w-full max-w-sm space-y-3">
        <Slider label="My likes" value={myLikes} max={80} onChange={setMyLikes} />
        <Slider label="Partner likes" value={partnerLikes} max={80} onChange={setPartnerLikes} />
        <Slider label="Matches" value={matchCount} max={80} onChange={setMatchCount} />
        <button
          type="button"
          onClick={() => setMyAccent((a) => (a === 'a' ? 'b' : 'a'))}
          className="rounded-full border border-pass/30 bg-white px-4 py-1.5 text-sm font-medium text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
        >
          I am Partner {myAccent.toUpperCase()} (tap to switch)
        </button>
      </div>
    </div>
  )
}
