import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  useAuth,
  useProfile,
  usePartnerProfile,
  useMatches,
  useMatchRankings,
  useUpdateRankings,
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import TabBar from '../components/TabBar'
import GenderFilter from '../components/GenderFilter'
import HeadToHead from '../components/HeadToHead'
import type { Gender, Match } from '../types'

export default function Ranking() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: partner } = usePartnerProfile(coupleId, user?.id)
  const { data: matches = [], isLoading: matchesLoading } = useMatches(coupleId)
  const { data: allRankings = [], isLoading: rankingsLoading } = useMatchRankings(coupleId)
  const updateRankings = useUpdateRankings()
  const qc = useQueryClient()

  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [ranking, setRanking] = useState(false)

  const genderMatches = useMemo(
    () => matches.filter((m) => !gender || m.gender === gender),
    [matches, gender],
  )

  const myRankMap = useMemo(() => {
    const map = new Map<string, number>()
    allRankings.filter((r) => r.user_id === user?.id).forEach((r) => map.set(r.name_id, r.rank))
    return map
  }, [allRankings, user?.id])

  const partnerRankMap = useMemo(() => {
    const map = new Map<string, number>()
    allRankings.filter((r) => r.user_id !== user?.id).forEach((r) => map.set(r.name_id, r.rank))
    return map
  }, [allRankings, user?.id])

  // My list for this filter: ranked names first (by saved rank), then any unranked
  const myOrdered = useMemo(
    () => [...genderMatches].sort((a, b) => (myRankMap.get(a.id) ?? Infinity) - (myRankMap.get(b.id) ?? Infinity)),
    [genderMatches, myRankMap],
  )
  const partnerOrdered = useMemo(
    () =>
      genderMatches
        .filter((m) => partnerRankMap.has(m.id))
        .sort((a, b) => partnerRankMap.get(a.id)! - partnerRankMap.get(b.id)!),
    [genderMatches, partnerRankMap],
  )

  const hasMyRanking = useMemo(
    () => genderMatches.some((m) => myRankMap.has(m.id)),
    [genderMatches, myRankMap],
  )

  // Names sitting at the same position in both lists
  const agreedIds = useMemo(() => {
    const partnerPos = new Map(partnerOrdered.map((m, i) => [m.id, i]))
    const s = new Set<string>()
    myOrdered.forEach((m, i) => {
      if (partnerPos.get(m.id) === i) s.add(m.id)
    })
    return s
  }, [myOrdered, partnerOrdered])

  const handleComplete = useCallback(
    (ranked: Match[]) => {
      if (!coupleId || !user) return
      updateRankings.mutate({
        coupleId,
        userId: user.id,
        rankings: ranked.map((m, i) => ({ nameId: m.id, rank: i + 1 })),
        scopeNameIds: genderMatches.map((m) => m.id),
      })
      setRanking(false)
    },
    [coupleId, user, updateRankings, genderMatches],
  )

  // Realtime: update when partner changes their rankings
  useEffect(() => {
    if (!coupleId) return
    const channel = supabase
      .channel(`rankings-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_rankings', filter: `couple_id=eq.${coupleId}` },
        () => qc.invalidateQueries({ queryKey: ['match-rankings', coupleId] }),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, qc])

  if (matchesLoading || rankingsLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-ink/50">Loading rankings...</p>
      </div>
    )
  }

  const myLabel = profile?.display_name || 'You'
  const partnerLabel = partner?.display_name || 'Partner'

  if (matches.length === 0) {
    return (
      <div className="flex min-h-svh flex-col pb-20">
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-xl text-ink">No matches to rank yet</p>
          <p className="mt-2 text-sm text-pass">Keep swiping to find names you both love!</p>
          <Link
            to="/swipe"
            className="mt-4 rounded-xl bg-match px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2"
          >
            Go swipe
          </Link>
        </div>
        <TabBar />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Ranking</h1>
        <p className="mt-1 text-center text-sm text-pass">A quick head-to-head to sort your favorites</p>
      </div>

      <div className="flex justify-center px-4 pb-2">
        <GenderFilter
          value={gender}
          onChange={(g) => {
            setGender(g)
            setRanking(false)
          }}
        />
      </div>

      {ranking ? (
        <div className="px-4 py-4">
          {genderMatches.length < 2 ? (
            <p className="text-center text-pass">Need at least two matches to rank.</p>
          ) : (
            <HeadToHead matches={genderMatches} onComplete={handleComplete} />
          )}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setRanking(false)}
              className="text-sm text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 pt-1 pb-2 text-center">
            <button
              type="button"
              onClick={() => setRanking(true)}
              disabled={genderMatches.length < 2}
              className="rounded-xl bg-match px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-40"
            >
              {hasMyRanking ? 'Re-rank with head-to-head' : `Rank ${genderMatches.length} ${genderMatches.length === 1 ? 'match' : 'matches'}`}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 py-3">
            {/* My ranking */}
            <div>
              <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-accent-a">{myLabel}</h2>
              <ul className="space-y-1.5">
                {myOrdered.map((match, index) => (
                  <li
                    key={match.id}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-2 shadow-sm ${
                      agreedIds.has(match.id) ? 'border border-match/30 bg-match/10' : 'bg-white'
                    }`}
                  >
                    <span className="w-5 text-center font-display text-sm font-semibold text-match">{index + 1}</span>
                    <span className="flex-1 truncate font-display text-sm font-semibold text-ink">{match.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner ranking */}
            <div>
              <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-accent-b">{partnerLabel}</h2>
              {partnerOrdered.length === 0 ? (
                <p className="py-4 text-center text-xs text-pass">Not ranked yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {partnerOrdered.map((match, index) => (
                    <li
                      key={match.id}
                      className={`flex items-center gap-1.5 rounded-lg px-2 py-2 shadow-sm ${
                        agreedIds.has(match.id) ? 'border border-match/30 bg-match/10' : 'bg-white/60'
                      }`}
                    >
                      <span className="w-5 text-center font-display text-sm font-semibold text-accent-b">{index + 1}</span>
                      <span className="flex-1 truncate font-display text-sm font-medium text-ink/70">{match.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      <TabBar />
    </div>
  )
}
