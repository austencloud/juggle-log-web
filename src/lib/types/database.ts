// src/lib/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          display_name: string | null
          bio: string | null
          location: string | null
          website: string | null
          youtube_channel: string | null
          instagram_handle: string | null
          verification_level: 'basic' | 'verified' | 'moderator' | 'admin'
          reputation_score: number
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          display_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          youtube_channel?: string | null
          instagram_handle?: string | null
          verification_level?: 'basic' | 'verified' | 'moderator' | 'admin'
          reputation_score?: number
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          display_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          youtube_channel?: string | null
          instagram_handle?: string | null
          verification_level?: 'basic' | 'verified' | 'moderator' | 'admin'
          reputation_score?: number
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      world_records: {
        Row: {
          id: string
          category: 'balls' | 'clubs' | 'rings' | 'bounce' | 'diabolo' | 'other'
          subcategory: 'force' | 'lift' | 'high' | 'low' | 'sync' | 'async' | null
          object_count: number
          pattern_siteswap: string | null
          pattern_custom: string | null
          pattern_description: string | null
          record_type: 'endurance' | 'flash' | 'technical' | 'speed'
          value_number: number
          value_unit: 'catches' | 'seconds' | 'minutes' | 'hours'
          date_set: string
          location: string | null
          event_name: string | null
          video_url: string
          video_platform: 'youtube' | 'vimeo' | 'direct' | 'other'
          video_start_time: number
          video_end_time: number | null
          verification_status: 'pending' | 'verified' | 'rejected' | 'disputed'
          source: 'user_submission' | 'imported' | 'competition' | 'migration'
          source_url: string | null
          difficulty_rating: number | null
          notes: string | null
          tags: string[] | null
          is_current_record: boolean
          superseded_by: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          category: 'balls' | 'clubs' | 'rings' | 'bounce' | 'diabolo' | 'other'
          subcategory?: 'force' | 'lift' | 'high' | 'low' | 'sync' | 'async' | null
          object_count: number
          pattern_siteswap?: string | null
          pattern_custom?: string | null
          pattern_description?: string | null
          record_type: 'endurance' | 'flash' | 'technical' | 'speed'
          value_number: number
          value_unit: 'catches' | 'seconds' | 'minutes' | 'hours'
          date_set: string
          location?: string | null
          event_name?: string | null
          video_url: string
          video_platform?: 'youtube' | 'vimeo' | 'direct' | 'other'
          video_start_time?: number
          video_end_time?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'disputed'
          source: 'user_submission' | 'imported' | 'competition' | 'migration'
          source_url?: string | null
          difficulty_rating?: number | null
          notes?: string | null
          tags?: string[] | null
          is_current_record?: boolean
          superseded_by?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          category?: 'balls' | 'clubs' | 'rings' | 'bounce' | 'diabolo' | 'other'
          subcategory?: 'force' | 'lift' | 'high' | 'low' | 'sync' | 'async' | null
          object_count?: number
          pattern_siteswap?: string | null
          pattern_custom?: string | null
          pattern_description?: string | null
          record_type?: 'endurance' | 'flash' | 'technical' | 'speed'
          value_number?: number
          value_unit?: 'catches' | 'seconds' | 'minutes' | 'hours'
          date_set?: string
          location?: string | null
          event_name?: string | null
          video_url?: string
          video_platform?: 'youtube' | 'vimeo' | 'direct' | 'other'
          video_start_time?: number
          video_end_time?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'disputed'
          source?: 'user_submission' | 'imported' | 'competition' | 'migration'
          source_url?: string | null
          difficulty_rating?: number | null
          notes?: string | null
          tags?: string[] | null
          is_current_record?: boolean
          superseded_by?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      record_holders: {
        Row: {
          id: string
          record_id: string
          juggler_name: string
          juggler_id: string | null
          is_primary_holder: boolean
          order_position: number
          created_at: string
        }
        Insert: {
          id?: string
          record_id: string
          juggler_name: string
          juggler_id?: string | null
          is_primary_holder?: boolean
          order_position?: number
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          juggler_name?: string
          juggler_id?: string | null
          is_primary_holder?: boolean
          order_position?: number
          created_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          pattern: string
          pattern_notation: 'custom' | 'siteswap'
          storage_key: string
          max_catches: number
          is_completed: boolean
          last_updated: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pattern: string
          pattern_notation?: 'custom' | 'siteswap'
          storage_key: string
          max_catches?: number
          is_completed?: boolean
          last_updated?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pattern?: string
          pattern_notation?: 'custom' | 'siteswap'
          storage_key?: string
          max_catches?: number
          is_completed?: boolean
          last_updated?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          level: number
          total_xp: number
          current_level_xp: number
          xp_to_next_level: number
          last_level_up: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level?: number
          total_xp?: number
          current_level_xp?: number
          xp_to_next_level?: number
          last_level_up?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level?: number
          total_xp?: number
          current_level_xp?: number
          xp_to_next_level?: number
          last_level_up?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          progress: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          progress?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          progress?: Json | null
        }
      }
      record_verifications: {
        Row: {
          id: string
          record_id: string
          submitted_by: string
          submission_date: string
          status: 'pending' | 'approved' | 'rejected' | 'needs_review'
          moderator_id: string | null
          moderator_notes: string | null
          auto_verification_score: number | null
          community_score: number | null
          approved_at: string | null
          rejected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          record_id: string
          submitted_by: string
          submission_date?: string
          status?: 'pending' | 'approved' | 'rejected' | 'needs_review'
          moderator_id?: string | null
          moderator_notes?: string | null
          auto_verification_score?: number | null
          community_score?: number | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          submitted_by?: string
          submission_date?: string
          status?: 'pending' | 'approved' | 'rejected' | 'needs_review'
          moderator_id?: string | null
          moderator_notes?: string | null
          auto_verification_score?: number | null
          community_score?: number | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
        }
      }
      verification_votes: {
        Row: {
          id: string
          verification_id: string
          user_id: string
          vote: 'approve' | 'reject' | 'needs_review' | 'abstain'
          confidence_level: number | null
          comment: string | null
          expertise_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          verification_id: string
          user_id: string
          vote: 'approve' | 'reject' | 'needs_review' | 'abstain'
          confidence_level?: number | null
          comment?: string | null
          expertise_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          verification_id?: string
          user_id?: string
          vote?: 'approve' | 'reject' | 'needs_review' | 'abstain'
          confidence_level?: number | null
          comment?: string | null
          expertise_areas?: string[] | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
