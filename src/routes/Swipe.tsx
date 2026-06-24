import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAuth,
  useProfile,
  useCouple,
  useUnvotedNames,
  useCastVote,
  useDeleteVote,
  usePartnerProgress,
} from '../lib/queries'
import SwipeDeck from '../components/SwipeDeck'
import GenderFilter from '../components/GenderFilter'
import MatchOverlay from '../components/MatchOverlay'
import TabBar from '../components/TabBar'
import type { Gender, Name, Vote, PartnerProgress } from '../types'

export default function Swipe() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [lastVote, setLastVote] = useState<{ vote: Vote; name: Name } | null>(null)

  const coupleId = profile?.couple_id
  const { data: couple } = useCouple(coupleId)
  const { data: names = [], isLoading } = useUnvotedNames(coupleId, gender)
  const { data: progress } = usePartnerProgress(coupleId)
  const castVote = useCastVote()
  const deleteVote = useDeleteVote()
  const qc = useQueryClient()
  const [prevMatchCount, setPrevMatchCount] = useState<number | null>(null)
  const [matchedName, setMatchedName] = useState<string | null>(null)

  // Initialize prevMatchCount once progress loads
  if (progress && prevMatchCount === null) {
    setPrevMatchCount(progress.match_count)
  }

  const handleVote = useCallback(
    (name: Name, value: 'like' | 'pass') => {
      if (!coupleId || !user) return
      castVote.mutate(
        {
          coupleId,
          nameId: name.id,
          userId: user.id,
          value,
        },
        {
          onSuccess: async (vote) => {
            setLastVote({ vote, name })

            if (value === 'like') {
              // Re-fetch progress to check for a new match
              const fresh = await qc.fetchQuery<PartnerProgress | null>({
                queryKey: ['partner-progress', coupleId],
                staleTime: 0,
              })
              if (fresh && prevMatchCount !== null && fresh.match_count > prevMatchCount) {
                setMatchedName(name.value)
              }
              if (fresh) {
                setPrevMatchCount(fresh.match_count)
              }
            }
          },
        },
      )
    },
    [coupleId, user, castVote, qc, prevMatchCount],
  )

  const handleUndo = useCallback(() => {
    if (!lastVote) return
    deleteVote.mutate(lastVote.vote.id, {
      onSuccess: () => {
        setLastVote(null)
      },
    })
  }, [lastVote, deleteVote])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-ink/50">Loading names...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      {/* Header with gender filter */}
      <div className="flex items-center justify-center px-4 pt-6 pb-4">
        <GenderFilter value={gender} onChange={setGender} />
      </div>

      {/* Swipe deck */}
      <div className="flex flex-1 items-center justify-center px-4">
        <SwipeDeck
          names={names}
          lastName={couple?.last_name}
          onVote={handleVote}
          onUndo={handleUndo}
          canUndo={!!lastVote}
        />
      </div>

      {matchedName && (
        <MatchOverlay name={matchedName} onDismiss={() => setMatchedName(null)} />
      )}

      <TabBar />
    </div>
  )
}
