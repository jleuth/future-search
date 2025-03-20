export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      search_history: {
        Row: {
          id: string
          user_id: string
          text: string
          timestamp: string
          is_complex: boolean
          categories: string[]
          delete_at: string | null
          manually_preserved: boolean
          search_mode: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          timestamp?: string
          is_complex?: boolean
          categories?: string[]
          delete_at?: string | null
          manually_preserved?: boolean
          search_mode: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          timestamp?: string
          is_complex?: boolean
          categories?: string[]
          delete_at?: string | null
          manually_preserved?: boolean
          search_mode?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          encrypted_key: string
          iv: string
          tag: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          encrypted_key: string
          iv: string
          tag: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          encrypted_key?: string
          iv?: string
          tag?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

