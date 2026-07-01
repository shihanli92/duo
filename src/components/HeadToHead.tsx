import { useEffect, useMemo, useState } from 'react'
import type { Match } from '../types'

interface HeadToHeadProps {
  matches: Match[]
  onComplete?: (ranked: Match[]) => void
}

// Comparison-driven merge sort: it asks you to compare two names only when it
// genuinely needs that ordering, and settles everything else automatically.
// The result is a full ranking in ~n·log2(n) picks.
interface MergeState {
  runs: Match[][]
  current: { left: Match[]; right: Match[]; merged: Match[]; li: number; ri: number } | null
  done: Match[] | null
  decisions: number
}

function advance(state: MergeState, choice: 'left' | 'right' | null): MergeState {
  if (state.done) return state
  let runs = state.runs.slice()
  let current = state.current ? { ...state.current } : null
  let decisions = state.decisions

  if (current && choice) {
    current = { ...current, merged: current.merged.slice() }
    if (choice === 'left') {
      current.merged.push(current.left[current.li]!)
      current.li++
    } else {
      current.merged.push(current.right[current.ri]!)
      current.ri++
    }
    decisions++
  }

  while (true) {
    let cur = current
    if (!cur) {
      if (runs.length <= 1) {
        return { runs, current: null, done: runs[0] ?? [], decisions }
      }
      cur = { left: runs[0]!, right: runs[1]!, merged: [], li: 0, ri: 0 }
      runs = runs.slice(2)
    }
    if (cur.li >= cur.left.length || cur.ri >= cur.right.length) {
      const rest = cur.li < cur.left.length ? cur.left.slice(cur.li) : cur.right.slice(cur.ri)
      runs = runs.concat([cur.merged.concat(rest)])
      current = null
      continue
    }
    return { runs, current: cur, done: null, decisions }
  }
}

function initSort(items: Match[]): MergeState {
  return advance({ runs: items.map((i) => [i]), current: null, done: null, decisions: 0 }, null)
}

const genderAccent: Record<string, string> = {
  girl: '#e07a93',
  boy: '#6e80d8',
  unisex: '#9a6fc0',
}

function Contender({ match, onPick, label }: { match: Match; onPick: () => void; label: string }) {
  const accent = genderAccent[match.gender] ?? '#9a95a3'
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`Pick ${match.value} (${label})`}
      className="flex flex-1 flex-col items-center justify-center rounded-[20px] px-5 py-8 text-center transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
      style={{ backgroundColor: '#FFFCF8', border: `1px solid ${accent}2E`, boxShadow: `0 6px 22px ${accent}1A` }}
    >
      <span className="font-display text-3xl font-medium text-ink sm:text-4xl">{match.value}</span>
      <span className="mt-3 rounded-full px-3 py-0.5 text-xs font-medium capitalize" style={{ backgroundColor: `${accent}26`, color: accent }}>
        {match.gender}
      </span>
      {match.origin && <span className="mt-1.5 text-xs uppercase tracking-wide text-pass">{match.origin}</span>}
      {match.meaning && <span className="mt-2 font-display text-sm italic text-match/90">&ldquo;{match.meaning}&rdquo;</span>}
    </button>
  )
}

export default function HeadToHead({ matches, onComplete }: HeadToHeadProps) {
  const [state, setState] = useState<MergeState>(() => initSort(matches))

  const estimatedTotal = useMemo(() => {
    const n = matches.length
    return n < 2 ? 0 : Math.ceil(n * Math.log2(n))
  }, [matches.length])

  const pick = (choice: 'left' | 'right') => setState((s) => advance(s, choice))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setState((s) => advance(s, 'left'))
      else if (e.key === 'ArrowRight') setState((s) => advance(s, 'right'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (state.done && onComplete) onComplete(state.done)
  }, [state.done, onComplete])

  // Final ranking
  if (state.done) {
    return (
      <div className="w-full">
        <p className="mb-4 text-center font-display text-xl text-ink">Your ranking</p>
        <ol className="mx-auto max-w-md space-y-2">
          {state.done.map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <span className={`w-6 text-center font-display text-lg font-semibold ${i === 0 ? 'text-match' : 'text-pass'}`}>{i + 1}</span>
              <span className="font-display text-base font-medium text-ink">{m.value}</span>
              {i === 0 && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-match)" className="ml-auto" aria-label="favorite">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setState(initSort(matches))}
            className="rounded-full border border-pass/30 bg-white px-4 py-1.5 text-sm font-medium text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  if (!state.current) {
    return <p className="text-center text-pass">Need at least two matches to rank.</p>
  }

  const left = state.current.left[state.current.li]
  const right = state.current.right[state.current.ri]
  if (!left || !right) return null
  const progress = estimatedTotal ? Math.min(0.95, state.decisions / estimatedTotal) : 0

  return (
    <div className="w-full">
      <p className="mb-1 text-center font-display text-xl text-ink">Which do you love more?</p>
      <p className="mb-5 text-center text-xs text-pass">← / → to choose · pick {state.decisions + 1}</p>

      <div className="flex items-stretch gap-3">
        <Contender match={left} onPick={() => pick('left')} label="left" />
        <div className="flex items-center font-display text-sm text-pass/60">or</div>
        <Contender match={right} onPick={() => pick('right')} label="right" />
      </div>

      <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-pass/15">
        <div className="h-full rounded-full bg-match transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  )
}
