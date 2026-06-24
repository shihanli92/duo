import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAuth,
  useProfile,
  useCouple,
  useMatches,
  usePartnerProgress,
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import VennHeader from '../components/VennHeader'
import MatchList from '../components/MatchList'
import ProgressBar from '../components/ProgressBar'
import TabBar from '../components/TabBar'

export default function Matches() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: couple } = useCouple(coupleId)
  const { data: matches = [], isLoading: matchesLoading } = useMatches(coupleId)
  const { data: progress } = usePartnerProgress(coupleId)
  const qc = useQueryClient()

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
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Matches</h1>
      </div>

      <div className="flex justify-center py-4">
        <VennHeader matchCount={matches.length} />
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

      {matchesLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-ink/50">Loading matches...</p>
        </div>
      ) : (
        <MatchList matches={matches} lastName={couple?.last_name} />
      )}

      <TabBar />
    </div>
  )
}
