import type { Database } from './lib/database.types'

export type Couple = Database['public']['Tables']['couples']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Name = Database['public']['Tables']['names']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type MatchRanking = Database['public']['Tables']['match_rankings']['Row']

export type Gender = 'girl' | 'boy' | 'unisex'
export type Accent = 'a' | 'b'
export type VoteValue = 'like' | 'pass'

export interface Match {
  id: string
  value: string
  gender: string
  origin: string
}

export interface PartnerProgress {
  partner_voted: number
  my_voted: number
  total_names: number
  match_count: number
}
