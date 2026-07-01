import { useState } from 'react'
import HeadToHead from '../components/HeadToHead'
import GenderFilter from '../components/GenderFilter'
import type { Gender, Match } from '../types'

// Dev-only harness for the head-to-head tie-breaker. Mock matches, no backend —
// it produces a ranking in the browser only. Gated to dev builds in App.tsx.

const MOCK_MATCHES: Match[] = [
  { id: 'amara', value: 'Amara', gender: 'girl', origin: 'Igbo', meaning: 'grace, mercy' },
  { id: 'rowan', value: 'Rowan', gender: 'unisex', origin: 'Irish', meaning: 'little redhead' },
  { id: 'elias', value: 'Elias', gender: 'boy', origin: 'Hebrew', meaning: 'the Lord is my God' },
  { id: 'mia', value: 'Mia', gender: 'girl', origin: 'Italian', meaning: 'mine' },
  { id: 'kenji', value: 'Kenji', gender: 'boy', origin: 'Japanese', meaning: 'strong, wise' },
  { id: 'sage', value: 'Sage', gender: 'unisex', origin: 'Latin', meaning: 'wise, healthy' },
  { id: 'aisha', value: 'Aisha', gender: 'girl', origin: 'Arabic', meaning: 'alive, living' },
]

export default function BracketPreview() {
  const [count, setCount] = useState(5)
  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [runKey, setRunKey] = useState(0)
  const matches = MOCK_MATCHES.slice(0, count).filter((m) => !gender || m.gender === gender)
  const restart = () => setRunKey((k) => k + 1)

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pt-8">
      <p className="font-display text-lg text-ink">Head-to-head preview</p>
      <p className="mb-6 text-xs text-pass">dev-only · no backend · ranking is browser-only</p>

      <div className="mb-4 flex items-center gap-3 text-sm text-pass">
        <label className="flex items-center gap-2">
          Matches
          <input
            type="range"
            min={2}
            max={MOCK_MATCHES.length}
            value={count}
            onChange={(e) => {
              setCount(Number(e.target.value))
              restart()
            }}
            className="accent-[var(--color-match)]"
          />
          <span className="w-5 text-right font-medium tabular-nums text-ink/70">{count}</span>
        </label>
      </div>

      <div className="mb-6">
        <GenderFilter
          value={gender}
          onChange={(g) => {
            setGender(g)
            restart()
          }}
        />
      </div>

      <div className="w-full max-w-lg">
        {matches.length < 2 ? (
          <p className="text-center text-pass">Need at least two matches in this filter to rank.</p>
        ) : (
          <HeadToHead key={runKey} matches={matches} />
        )}
      </div>
    </div>
  )
}
