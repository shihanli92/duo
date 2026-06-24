import { useState, useCallback } from 'react'
import {
  useAuth,
  useProfile,
  useUnvotedNames,
  useCastVote,
  useDeleteVote,
} from '../lib/queries'
import SwipeDeck from '../components/SwipeDeck'
import GenderFilter from '../components/GenderFilter'
import TabBar from '../components/TabBar'
import type { Gender, Name, Vote } from '../types'

export default function Swipe() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [lastVote, setLastVote] = useState<{ vote: Vote; name: Name } | null>(null)

  const coupleId = profile?.couple_id
  const { data: names = [], isLoading } = useUnvotedNames(coupleId, gender)
  const castVote = useCastVote()
  const deleteVote = useDeleteVote()

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
          onSuccess: (vote) => {
            setLastVote({ vote, name })
          },
        },
      )
    },
    [coupleId, user, castVote],
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
        <p className="text-pass">Loading names...</p>
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
          onVote={handleVote}
          onUndo={handleUndo}
          canUndo={!!lastVote}
        />
      </div>

      <TabBar />
    </div>
  )
}
