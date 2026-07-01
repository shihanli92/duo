import { useState } from 'react'
import SwipeDeck from '../components/SwipeDeck'
import type { Name } from '../types'

// Dev-only visual harness for the swipe deck. No auth, no Supabase — just
// mock names so the card/deck design can be iterated at /preview. Gated to
// dev builds in App.tsx, so it never ships.

function mockName(partial: Partial<Name> & { value: string; gender: string }): Name {
  return {
    id: partial.value.toLowerCase(),
    couple_id: null,
    origin: '',
    meaning: '',
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

const SAMPLE_NAMES: Name[] = [
  mockName({ value: 'Amara', gender: 'girl', origin: 'Igbo', meaning: 'grace, mercy' }),
  mockName({ value: 'Elias', gender: 'boy', origin: 'Hebrew', meaning: 'the Lord is my God' }),
  mockName({ value: 'Rowan', gender: 'unisex', origin: 'Irish', meaning: 'little redhead' }),
  mockName({ value: 'Seraphina', gender: 'girl', origin: 'Hebrew', meaning: 'fiery, burning ones' }),
  mockName({ value: 'Caspian', gender: 'boy', origin: 'Literary', meaning: 'of the Caspian Sea' }),
  mockName({ value: 'Constantine', gender: 'boy', origin: 'Latin', meaning: 'steadfast, constant' }),
  mockName({ value: 'Alexandrina', gender: 'girl', origin: 'Greek', meaning: 'defender of the people' }),
]

export default function DeckPreview() {
  const [log, setLog] = useState<string[]>([])

  const handleVote = (name: Name, value: 'like' | 'pass') => {
    setLog((prev) => [`${value} → ${name.value}`, ...prev].slice(0, 6))
  }

  return (
    <div className="flex min-h-svh flex-col pb-10">
      <div className="px-4 pt-6 pb-4 text-center">
        <p className="font-display text-lg text-ink">Deck preview</p>
        <p className="text-xs text-pass">dev-only · mock data · no login</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <SwipeDeck
          names={SAMPLE_NAMES}
          lastName="Chen"
          middleName="Rose"
          onVote={handleVote}
          canUndo={false}
        />
      </div>

      {log.length > 0 && (
        <div className="px-4 pb-6 text-center text-xs text-pass">
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      )}
    </div>
  )
}
