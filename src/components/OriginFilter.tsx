import { useState } from 'react'

interface OriginFilterProps {
  value: string | undefined
  origins: string[]
  onChange: (value: string | undefined) => void
}

// Searchable origin picker: type to filter the (long) list of origins, click or
// press Enter to choose, × to clear back to "All origins".
export default function OriginFilter({ value, origins, onChange }: OriginFilterProps) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  // Keep the input in sync when the committed value changes elsewhere
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setQuery(value ?? '')
  }

  const q = query.trim().toLowerCase()
  const matches = (q ? origins.filter((o) => o.toLowerCase().includes(q)) : origins).slice(0, 8)

  const commit = (origin: string | undefined) => {
    setQuery(origin ?? '')
    setOpen(false)
    onChange(origin)
  }

  const reconcile = () => {
    setOpen(false)
    const exact = origins.find((o) => o.toLowerCase() === query.trim().toLowerCase())
    if (exact) commit(exact)
    else if (query.trim() === '') commit(undefined)
    else setQuery(value ?? '') // partial text that matched nothing → revert
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (matches[active]) commit(matches[active])
    } else if (e.key === 'Escape') {
      setQuery(value ?? '')
      setOpen(false)
    }
  }

  return (
    <div className="relative inline-flex">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="Filter by origin"
        value={query}
        placeholder="All origins"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(0)
          if (e.target.value === '') onChange(undefined)
        }}
        onFocus={() => setOpen(true)}
        onBlur={reconcile}
        onKeyDown={onKeyDown}
        className={`w-44 rounded-full border bg-white py-1.5 pl-4 pr-8 text-sm font-medium placeholder:text-pass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
          value ? 'border-match/40 text-ink' : 'border-pass/30 text-pass'
        }`}
      />

      {value ? (
        <button
          type="button"
          aria-label="Clear origin filter"
          onMouseDown={(e) => {
            e.preventDefault()
            commit(undefined)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : (
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pass"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}

      {open && matches.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-64 w-44 overflow-auto rounded-xl border border-pass/20 bg-white py-1 shadow-lg"
        >
          {matches.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                commit(o)
              }}
              className={`cursor-pointer px-4 py-1.5 text-sm ${i === active ? 'bg-match/10 text-ink' : 'text-pass'}`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
