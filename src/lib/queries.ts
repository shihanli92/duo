import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'
import type {
  Profile,
  Couple,
  Name,
  Match,
  MatchRanking,
  PartnerProgress,
  Gender,
  VoteValue,
  Accent,
} from '../types'

// ============================================================
// Auth
// ============================================================

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { session, user, loading, signOut }
}

export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) throw error
}

// ============================================================
// Profile
// ============================================================

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useProfile(user: User | null) {
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  })
}

export function useCreateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      userId: string
      coupleId: string
      displayName: string
      accent: Accent
    }) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: data.userId,
          couple_id: data.coupleId,
          display_name: data.displayName,
          accent: data.accent,
        })
        .select()
        .single()
      if (error) throw error
      return profile
    },
    onSuccess: (profile) => {
      qc.setQueryData(['profile', profile.id], profile)
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      userId: string
      displayName?: string
      accent?: Accent
      coupleId?: string | null
    }) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          ...(data.displayName !== undefined && { display_name: data.displayName }),
          ...(data.accent !== undefined && { accent: data.accent }),
          ...(data.coupleId !== undefined && { couple_id: data.coupleId }),
        })
        .eq('id', data.userId)
        .select()
        .single()
      if (error) throw error
      return profile
    },
    onSuccess: (profile) => {
      qc.setQueryData(['profile', profile.id], profile)
    },
  })
}

export function usePartnerProfile(coupleId: string | null | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['partner-profile', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', coupleId!)
        .neq('id', userId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!coupleId && !!userId,
  })
}

// ============================================================
// Couple
// ============================================================

export function useCouple(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: ['couple', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!coupleId,
  })
}

export function useUpdateCouple() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: { coupleId: string; lastName?: string; middleName?: string }) => {
      const { data: couple, error } = await supabase
        .from('couples')
        .update({
          ...(data.lastName !== undefined && { last_name: data.lastName }),
          ...(data.middleName !== undefined && { middle_name: data.middleName }),
        })
        .eq('id', data.coupleId)
        .select()
        .single()
      if (error) throw error
      return couple
    },
    onSuccess: (couple) => {
      qc.setQueryData(['couple', couple.id], couple)
    },
  })
}

export function useCreateCouple() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .insert({})
        .select()
        .single()
      if (error) throw error
      return data as Couple
    },
  })
}

export function useJoinCouple() {
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      // Look up the couple by invite code
      const { data: couple, error: lookupError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode.trim().toLowerCase())
        .maybeSingle()
      if (lookupError) throw lookupError
      if (!couple) throw new Error('Invalid invite code')

      // Check that the couple doesn't already have 2 members
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', couple.id)
      if (countError) throw countError
      if (count !== null && count >= 2)
        throw new Error('This couple already has two members')

      return couple as Couple
    },
  })
}

// ============================================================
// Names
// ============================================================

export function useUnvotedNames(coupleId: string | null | undefined, gender?: Gender) {
  return useQuery({
    queryKey: ['unvoted-names', coupleId, gender],
    queryFn: async () => {
      // Get names visible to this couple
      let nameQuery = supabase
        .from('names')
        .select('*')
        .or(`couple_id.is.null,couple_id.eq.${coupleId}`)

      if (gender) {
        nameQuery = nameQuery.eq('gender', gender)
      }

      const { data: names, error: nameError } = await nameQuery
      if (nameError) throw nameError

      // Get my votes to filter out already-voted names
      const { data: myVotes, error: voteError } = await supabase
        .from('votes')
        .select('name_id')
      if (voteError) throw voteError

      const votedNameIds = new Set(myVotes?.map((v) => v.name_id))
      return (names ?? []).filter((n) => !votedNameIds.has(n.id))
    },
    enabled: !!coupleId,
  })
}

export async function findNameByValue(coupleId: string, value: string): Promise<Name | null> {
  const { data, error } = await supabase
    .from('names')
    .select('*')
    .eq('value', value)
    .or(`couple_id.is.null,couple_id.eq.${coupleId}`)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useAddName() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      coupleId: string
      value: string
      gender: Gender
      origin: string
    }) => {
      const { data: name, error } = await supabase
        .from('names')
        .insert({
          couple_id: data.coupleId,
          value: data.value,
          gender: data.gender,
          origin: data.origin,
        })
        .select()
        .single()
      if (error) throw error
      return name
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unvoted-names'] })
    },
  })
}

// ============================================================
// My Likes (names I voted "like" on — privacy safe, own votes only)
// ============================================================

export function useMyLikes(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: ['my-likes', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('name_id, names!inner(id, value, gender, origin)')
        .eq('couple_id', coupleId!)
        .eq('value', 'like')
      if (error) throw error
      return (data ?? []).map((row) => {
        const n = row.names as unknown as { id: string; value: string; gender: string; origin: string }
        return { id: n.id, value: n.value, gender: n.gender, origin: n.origin }
      }) as Match[]
    },
    enabled: !!coupleId,
  })
}

// ============================================================
// Votes
// ============================================================

export function useCastVote() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      coupleId: string
      nameId: string
      userId: string
      value: VoteValue
    }) => {
      const { data: vote, error } = await supabase
        .from('votes')
        .insert({
          couple_id: data.coupleId,
          name_id: data.nameId,
          user_id: data.userId,
          value: data.value,
        })
        .select()
        .single()
      if (error) throw error
      return vote
    },
    onMutate: async (newVote) => {
      await qc.cancelQueries({ queryKey: ['unvoted-names', newVote.coupleId] })
      // Optimistically remove the voted name from all filtered views
      qc.setQueriesData<Name[]>(
        { queryKey: ['unvoted-names', newVote.coupleId] },
        (old) => old?.filter((n) => n.id !== newVote.nameId),
      )
    },
    onError: (_err, vars) => {
      // Refetch to restore correct state
      qc.invalidateQueries({ queryKey: ['unvoted-names', vars.coupleId] })
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['unvoted-names'] })
      qc.invalidateQueries({ queryKey: ['matches', vars.coupleId] })
      qc.invalidateQueries({ queryKey: ['my-likes', vars.coupleId] })
      qc.invalidateQueries({ queryKey: ['partner-progress', vars.coupleId] })
    },
  })
}

export function useDeleteVote() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (voteId: string) => {
      const { error } = await supabase.from('votes').delete().eq('id', voteId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unvoted-names'] })
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['my-likes'] })
      qc.invalidateQueries({ queryKey: ['partner-progress'] })
    },
  })
}

// ============================================================
// Matches (via RPC)
// ============================================================

export function useMatches(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: ['matches', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_matches', {
        p_couple_id: coupleId!,
      })
      if (error) throw error
      return (data ?? []) as Match[]
    },
    enabled: !!coupleId,
  })
}

// ============================================================
// Partner Progress (via RPC)
// ============================================================

export function usePartnerProgress(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: ['partner-progress', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('partner_progress', {
        p_couple_id: coupleId!,
      })
      if (error) throw error
      const row = data?.[0]
      return row
        ? ({
            partner_voted: Number(row.partner_voted),
            my_voted: Number(row.my_voted),
            total_names: Number(row.total_names),
            match_count: Number(row.match_count),
          } as PartnerProgress)
        : null
    },
    enabled: !!coupleId,
  })
}

// ============================================================
// Match Rankings
// ============================================================

export function useMatchRankings(coupleId: string | null | undefined) {
  return useQuery({
    queryKey: ['match-rankings', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_rankings')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('rank', { ascending: true })
      if (error) throw error
      return (data ?? []) as MatchRanking[]
    },
    enabled: !!coupleId,
  })
}

export function useUpdateRankings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      coupleId: string
      userId: string
      rankings: { nameId: string; rank: number }[]
    }) => {
      const { error: deleteError } = await supabase
        .from('match_rankings')
        .delete()
        .eq('couple_id', data.coupleId)
        .eq('user_id', data.userId)
      if (deleteError) throw deleteError

      if (data.rankings.length > 0) {
        const rows = data.rankings.map((r) => ({
          couple_id: data.coupleId,
          user_id: data.userId,
          name_id: r.nameId,
          rank: r.rank,
        }))
        const { error: insertError } = await supabase
          .from('match_rankings')
          .insert(rows)
        if (insertError) throw insertError
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['match-rankings', vars.coupleId] })
    },
  })
}

// ============================================================
// Reset (for Settings)
// ============================================================

export function useResetVotes() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('votes').delete().eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unvoted-names'] })
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['partner-progress'] })
      qc.invalidateQueries({ queryKey: ['match-rankings'] })
    },
  })
}
