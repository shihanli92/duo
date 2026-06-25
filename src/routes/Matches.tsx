import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAuth,
  useProfile,
  useCouple,
  useMatches,
  useMyLikes,
  useDeleteVote,
  usePartnerProgress,
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import VennHeader from '../components/VennHeader'
import MatchList from '../components/MatchList'
import ProgressBar from '../components/ProgressBar'
import TabBar from '../components/TabBar'
import type { Match } from '../types'

const genderColors: Record<string, string> = {
  girl: 'bg-accent-b/15 text-accent-b',
  boy: 'bg-accent-a/15 text-accent-a',
  unisex: 'bg-match/15 text-match',
}

function LikesList({ likes, onRemove }: { likes: Match[]; onRemove: (voteId: string) => void }) {
  if (likes.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-pass">Names you like will appear here.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2 px-4">
      {likes.map((like) => (
        <li
          key={like.id}
          className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-2.5 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-pass)" className="shrink-0" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="flex-1">
            <p className="font-display text-base font-medium text-ink/70">{like.value}</p>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${genderColors[like.gender] ?? 'bg-pass/15 text-pass'}`}
              >
                {like.gender}
              </span>
              {like.origin && (
                <span className="text-xs text-pass">{like.origin}</span>
              )}
            </div>
            {like.meaning && (
              <p className="mt-0.5 text-xs italic text-pass/60">{like.meaning}</p>
            )}
          </div>
          {like.voteId && (
            <button
              onClick={() => onRemove(like.voteId!)}
              aria-label={`Remove ${like.value} from likes`}
              className="shrink-0 rounded-full p-1.5 text-pass/40 transition-colors hover:bg-pass/10 hover:text-pass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Matches() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: couple } = useCouple(coupleId)
  const { data: matches = [], isLoading: matchesLoading } = useMatches(coupleId)
  const { data: myLikes = [] } = useMyLikes(coupleId, user?.id)
  const { data: progress } = usePartnerProgress(coupleId)
  const deleteVote = useDeleteVote()
  const [pane, setPane] = useState<'mutual' | 'likes'>('mutual')
  const qc = useQueryClient()

  // Likes that aren't already matches
  const matchIds = new Set(matches.map((m) => m.id))
  const likesOnly = myLikes.filter((l) => !matchIds.has(l.id))

  // Realtime: re-fetch matches when any vote is inserted for this couple
  useEffect(() => {
    if (!coupleId) return

    const channel = supabase
      .channel(`votes-${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['matches', coupleId] })
          qc.invalidateQueries({ queryKey: ['my-likes', coupleId] })
          qc.invalidateQueries({ queryKey: ['partner-progress', coupleId] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, qc])

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-2">
        <div className="flex justify-center py-4">
          <VennHeader matchCount={matches.length} />
        </div>
      </div>

      {/* Progress bars */}
      {progress && (
        <div className="space-y-3 px-6 py-4">
          <ProgressBar
            label="You"
            voted={progress.my_voted}
            total={progress.total_names}
            color="var(--color-match)"
          />
          <ProgressBar
            label="Partner"
            voted={progress.partner_voted}
            total={progress.total_names}
            color="var(--color-pass)"
          />
        </div>
      )}

      {/* Pane switcher */}
      <div className="mx-4 mt-2 flex rounded-xl bg-white/60 p-1 shadow-sm">
        <button
          onClick={() => setPane('mutual')}
          className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
            pane === 'mutual'
              ? 'bg-match text-white shadow-sm'
              : 'text-pass hover:text-ink'
          }`}
        >
          Mutual{matches.length > 0 ? ` (${matches.length})` : ''}
        </button>
        <button
          onClick={() => setPane('likes')}
          className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
            pane === 'likes'
              ? 'bg-match text-white shadow-sm'
              : 'text-pass hover:text-ink'
          }`}
        >
          My Likes{likesOnly.length > 0 ? ` (${likesOnly.length})` : ''}
        </button>
      </div>

      {/* Pane content */}
      <div className="mt-4">
        {matchesLoading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-ink/50">Loading...</p>
          </div>
        ) : pane === 'mutual' ? (
          <MatchList matches={matches} lastName={couple?.last_name} middleName={couple?.middle_name} />
        ) : (
          <LikesList likes={likesOnly} onRemove={(voteId) => deleteVote.mutate(voteId)} />
        )}
      </div>

      <TabBar />
    </div>
  )
}
