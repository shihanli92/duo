export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string
          invite_code: string
          last_name: string
          created_at: string
        }
        Insert: {
          id?: string
          invite_code?: string
          last_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          invite_code?: string
          last_name?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          couple_id: string | null
          display_name: string
          accent: string
          created_at: string
        }
        Insert: {
          id: string
          couple_id?: string | null
          display_name?: string
          accent: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string | null
          display_name?: string
          accent?: string
          created_at?: string
        }
        Relationships: []
      }
      names: {
        Row: {
          id: string
          couple_id: string | null
          value: string
          gender: string
          origin: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id?: string | null
          value: string
          gender: string
          origin?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string | null
          value?: string
          gender?: string
          origin?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          couple_id: string
          name_id: string
          user_id: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          name_id: string
          user_id: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          name_id?: string
          user_id?: string
          value?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_matches: {
        Args: { p_couple_id: string }
        Returns: {
          id: string
          value: string
          gender: string
          origin: string
        }[]
      }
      partner_progress: {
        Args: { p_couple_id: string }
        Returns: {
          partner_voted: number
          my_voted: number
          total_names: number
          match_count: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
