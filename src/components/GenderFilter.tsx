import type { Gender } from '../types'

type FilterValue = Gender | undefined

const options: { value: FilterValue; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'girl', label: 'Girls' },
  { value: 'boy', label: 'Boys' },
  { value: 'unisex', label: 'Unisex' },
]

interface GenderFilterProps {
  value: FilterValue
  onChange: (value: FilterValue) => void
}

export default function GenderFilter({ value, onChange }: GenderFilterProps) {
  return (
    <div role="radiogroup" aria-label="Filter by gender" className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.label}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
              active
                ? 'bg-ink text-paper'
                : 'border border-pass/30 bg-white text-pass hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
