import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  useAuth,
  useProfile,
  useMatches,
  useMatchRankings,
  useUpdateRankings,
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import TabBar from '../components/TabBar'
import type { Match } from '../types'

interface RankedMatch extends Match {
  myRank: number
  partnerRank: number | null
}

export default function Ranking() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: matches = [], isLoading: matchesLoading } = useMatches(coupleId)
  const { data: allRankings = [], isLoading: rankingsLoading } = useMatchRankings(coupleId)
  const updateRankings = useUpdateRankings()
  const qc = useQueryClient()

  const [localOrder, setLocalOrder] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  // Build the ranked list from matches + rankings
  const myRankings = allRankings.filter((r) => r.user_id === user?.id)
  const partnerRankings = allRankings.filter((r) => r.user_id !== user?.id)

  // Initialize local order from rankings or match order
  if (matches.length > 0 && !initialized) {
    if (myRankings.length > 0) {
      // Use saved ranking order, append any unranked matches
      const rankedIds = myRankings
        .sort((a, b) => a.rank - b.rank)
        .map((r) => r.name_id)
      const matchIds = new Set(matches.map((m) => m.id))
      const validRankedIds = rankedIds.filter((id) => matchIds.has(id))
      const unrankedIds = matches
        .filter((m) => !validRankedIds.includes(m.id))
        .map((m) => m.id)
      setLocalOrder([...validRankedIds, ...unrankedIds])
    } else {
      setLocalOrder(matches.map((m) => m.id))
    }
    setInitialized(true)
  }

  // Build display list
  const matchMap = new Map(matches.map((m) => [m.id, m]))
  const partnerRankMap = new Map(partnerRankings.map((r) => [r.name_id, r.rank]))

  const rankedMatches: RankedMatch[] = localOrder
    .map((id, index) => {
      const match = matchMap.get(id)
      if (!match) return null
      return {
        ...match,
        myRank: index + 1,
        partnerRank: partnerRankMap.get(id) ?? null,
      }
    })
    .filter((m): m is RankedMatch => m !== null)

  // Persist rankings
  const saveRankings = useCallback(
    (order: string[]) => {
      if (!coupleId || !user) return
      updateRankings.mutate({
        coupleId,
        userId: user.id,
        rankings: order.map((nameId, i) => ({ nameId, rank: i + 1 })),
      })
    },
    [coupleId, user, updateRankings],
  )

  const moveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const newOrder = [...localOrder]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index]!, newOrder[index - 1]!]
      setLocalOrder(newOrder)
      saveRankings(newOrder)
    },
    [localOrder, saveRankings],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (index >= localOrder.length - 1) return
      const newOrder = [...localOrder]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1]!, newOrder[index]!]
      setLocalOrder(newOrder)
      saveRankings(newOrder)
    },
    [localOrder, saveRankings],
  )

  // Realtime: update when partner changes their rankings
  useEffect(() => {
    if (!coupleId) return
    const channel = supabase
      .channel(`rankings-${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_rankings',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['match-rankings', coupleId] })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, qc])

  const isLoading = matchesLoading || rankingsLoading

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-ink/50">Loading rankings...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Ranking</h1>
        <p className="mt-1 text-center text-sm text-pass">
          Move your favorites to the top
        </p>
      </div>

      {rankedMatches.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-xl text-ink">No matches to rank yet</p>
          <p className="mt-2 text-sm text-pass">
            Keep swiping to find names you both love!
          </p>
          <Link
            to="/swipe"
            className="mt-4 rounded-xl bg-match px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2"
          >
            Go swipe
          </Link>
        </div>
      ) : (
        <ul className="space-y-2 px-4 py-4">
          {rankedMatches.map((match, index) => {
            const agreed = match.partnerRank !== null && match.partnerRank === match.myRank
            return (
              <li
                key={match.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
                  agreed
                    ? 'border border-match/30 bg-match/10'
                    : 'bg-white'
                }`}
              >
                {/* My rank */}
                <span className="w-8 text-center font-display text-lg font-semibold text-match">
                  {match.myRank}
                </span>

                {/* Name */}
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-ink">
                    {match.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pass capitalize">{match.gender}</span>
                    {match.origin && (
                      <span className="text-xs text-pass">{match.origin}</span>
                    )}
                  </div>
                </div>

                {/* Partner rank */}
                <span className="w-8 text-center text-sm text-pass">
                  {match.partnerRank !== null ? `#${match.partnerRank}` : '\u2014'}
                </span>

                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    aria-label={`Move ${match.value} up`}
                    className="rounded p-1 text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === rankedMatches.length - 1}
                    aria-label={`Move ${match.value} down`}
                    className="rounded p-1 text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <TabBar />
    </div>
  )
}
