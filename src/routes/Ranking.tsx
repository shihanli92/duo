import { useState, useRef, useCallback, useEffect } from 'react'
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
import type { Match } from '../types'

interface RankedMatch extends Match {
  myRank: number
  partnerRank: number | null
}

export default function Ranking() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: partner } = usePartnerProfile(coupleId, user?.id)
  const { data: matches = [], isLoading: matchesLoading } = useMatches(coupleId)
  const { data: allRankings = [], isLoading: rankingsLoading } = useMatchRankings(coupleId)
  const updateRankings = useUpdateRankings()
  const qc = useQueryClient()

  const [localOrder, setLocalOrder] = useState<string[]>([])

  const myRankings = allRankings.filter((r) => r.user_id === user?.id)
  const partnerRankings = allRankings.filter((r) => r.user_id !== user?.id)

  // Adjust local order during render (React's recommended derived-state pattern).
  // Handles both initial load and subsequent match additions/removals.
  if (matches.length > 0) {
    const matchIds = new Set(matches.map((m) => m.id))
    const hasNewMatches = matches.some((m) => !localOrder.includes(m.id))
    const hasStaleIds = localOrder.some((id) => !matchIds.has(id))

    if (localOrder.length === 0) {
      // First initialization: use saved ranking order if available
      if (myRankings.length > 0) {
        const rankedIds = [...myRankings]
          .sort((a, b) => a.rank - b.rank)
          .map((r) => r.name_id)
        const validRankedIds = rankedIds.filter((id) => matchIds.has(id))
        const unrankedIds = matches
          .filter((m) => !validRankedIds.includes(m.id))
          .map((m) => m.id)
        setLocalOrder([...validRankedIds, ...unrankedIds])
      } else {
        setLocalOrder(matches.map((m) => m.id))
      }
    } else if (hasNewMatches || hasStaleIds) {
      // Keep existing order, remove stale, append new
      const kept = localOrder.filter((id) => matchIds.has(id))
      const keptSet = new Set(kept)
      const newIds = matches.filter((m) => !keptSet.has(m.id)).map((m) => m.id)
      setLocalOrder([...kept, ...newIds])
    }
  }

  // Build display lists
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

  // Partner's list sorted by their ranking
  const partnerOrdered = [...partnerRankings]
    .sort((a, b) => a.rank - b.rank)
    .map((r) => matchMap.get(r.name_id))
    .filter((m): m is Match => m !== null)

  // Set of name IDs where both partners gave the same rank
  const agreedIds = new Set(
    rankedMatches
      .filter((m) => m.partnerRank !== null && m.partnerRank === m.myRank)
      .map((m) => m.id),
  )

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

  // Drag-to-reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const dragStartY = useRef(0)
  const dragCurrentIndex = useRef(0)
  const itemHeight = useRef(0)
  const orderRef = useRef(localOrder)
  useEffect(() => { orderRef.current = localOrder }, [localOrder])

  const onDragStart = useCallback((index: number, e: React.PointerEvent) => {
    e.preventDefault()
    const li = (e.target as HTMLElement).closest('li')
    if (!li) return
    itemHeight.current = li.getBoundingClientRect().height + 8 // 8px = space-y-2 gap
    dragStartY.current = e.clientY
    dragCurrentIndex.current = index
    setDragIndex(index)
    setDragOffsetY(0)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (dragIndex === null) return
    const dy = e.clientY - dragStartY.current
    setDragOffsetY(dy)

    const shift = Math.round(dy / itemHeight.current)
    const target = Math.max(0, Math.min(orderRef.current.length - 1, dragCurrentIndex.current + shift))

    if (target !== dragCurrentIndex.current) {
      const newOrder = [...orderRef.current]
      const [removed] = newOrder.splice(dragCurrentIndex.current, 1)
      newOrder.splice(target, 0, removed!)
      setLocalOrder(newOrder)
      // Reset baseline so the item tracks smoothly from its new position
      dragStartY.current += (target - dragCurrentIndex.current) * itemHeight.current
      dragCurrentIndex.current = target
      setDragIndex(target)
      setDragOffsetY(e.clientY - dragStartY.current)
    }
  }, [dragIndex])

  const onDragEnd = useCallback(() => {
    if (dragIndex === null) return
    saveRankings(orderRef.current)
    setDragIndex(null)
    setDragOffsetY(0)
  }, [dragIndex, saveRankings])

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

  const myLabel = profile?.display_name || 'You'
  const partnerLabel = partner?.display_name || 'Partner'

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Ranking</h1>
        <p className="mt-1 text-center text-sm text-pass">
          Drag to reorder your favorites
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
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {/* My ranking column */}
          <div>
            <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-accent-a">
              {myLabel}
            </h2>
            <ul className="space-y-1.5">
              {rankedMatches.map((match, index) => {
                const isDragging = dragIndex === index
                return (
                  <li
                    key={match.id}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-2 shadow-sm transition-shadow ${
                      agreedIds.has(match.id)
                        ? 'border border-match/30 bg-match/10'
                        : 'bg-white'
                    } ${isDragging ? 'relative z-10 shadow-lg ring-2 ring-match/30' : ''}`}
                    style={isDragging ? { transform: `translateY(${dragOffsetY}px)` } : undefined}
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                  >
                    {/* Drag handle */}
                    <button
                      className="touch-none cursor-grab p-0.5 text-pass/30 hover:text-pass active:cursor-grabbing"
                      onPointerDown={(e) => onDragStart(index, e)}
                      aria-label={`Drag to reorder ${match.value}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="9" cy="5" r="1.5" />
                        <circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" />
                        <circle cx="15" cy="19" r="1.5" />
                      </svg>
                    </button>

                    <span className="w-5 text-center font-display text-sm font-semibold text-match">
                      {match.myRank}
                    </span>
                    <span className="flex-1 truncate font-display text-sm font-semibold text-ink">
                      {match.value}
                    </span>

                    {/* Compact reorder buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        aria-label={`Move ${match.value} up`}
                        className="p-0.5 text-pass hover:text-ink disabled:opacity-20"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === rankedMatches.length - 1}
                        aria-label={`Move ${match.value} down`}
                        className="p-0.5 text-pass hover:text-ink disabled:opacity-20"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Partner ranking column */}
          <div>
            <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-accent-b">
              {partnerLabel}
            </h2>
            {partnerOrdered.length === 0 ? (
              <p className="py-4 text-center text-xs text-pass">Not ranked yet</p>
            ) : (
              <ul className="space-y-1.5">
                {partnerOrdered.map((match, index) => (
                  <li
                    key={match.id}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-2 shadow-sm ${
                      agreedIds.has(match.id)
                        ? 'border border-match/30 bg-match/10'
                        : 'bg-white/60'
                    }`}
                  >
                    <span className="w-5 text-center font-display text-sm font-semibold text-accent-b">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate font-display text-sm font-medium text-ink/70">
                      {match.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  )
}
