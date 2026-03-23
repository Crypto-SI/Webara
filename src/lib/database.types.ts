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
      apps: {
        Row: {
          id: string
          name: string
          slug: string
          website_url: string | null
          description: string | null
          status: 'active' | 'planning' | 'archived'
          sort_order: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          website_url?: string | null
          description?: string | null
          status?: 'active' | 'planning' | 'archived'
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          website_url?: string | null
          description?: string | null
          status?: 'active' | 'planning' | 'archived'
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          clerk_user_id: string | null
          email: string
          email_verified: boolean
          first_name: string | null
          last_name: string | null
          full_name: string | null
          username: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'webara_staff'
          clerk_created_at: string | null
          clerk_last_sign_in_at: string | null
          public_metadata: Json
          private_metadata: Json
          unsafe_metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clerk_user_id?: string | null
          email: string
          email_verified?: boolean
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          username?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'webara_staff'
          clerk_created_at?: string | null
          clerk_last_sign_in_at?: string | null
          public_metadata?: Json
          private_metadata?: Json
          unsafe_metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clerk_user_id?: string | null
          email?: string
          email_verified?: boolean
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          username?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'webara_staff'
          clerk_created_at?: string | null
          clerk_last_sign_in_at?: string | null
          public_metadata?: Json
          private_metadata?: Json
          unsafe_metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          industry: string | null
          website: string | null
          description: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          business_type: 'startup' | 'small_business' | 'enterprise' | 'non_profit' | 'agency' | null
          contact_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          industry?: string | null
          website?: string | null
          description?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          business_type?: 'startup' | 'small_business' | 'enterprise' | 'non_profit' | 'agency' | null
          contact_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          industry?: string | null
          website?: string | null
          description?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          business_type?: 'startup' | 'small_business' | 'enterprise' | 'non_profit' | 'agency' | null
          contact_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          title: string
          website_needs: string
          collaboration_preferences: string | null
          budget_range: string | null
          ai_quote: string | null
          suggested_collaboration: string | null
          ai_suggestions: Json
          admin_feedback: string | null
          user_feedback: string | null
          status:
            | 'draft'
            | 'pending'
            | 'under_review'
            | 'accepted'
            | 'rejected'
            | 'call_requested'
            | 'project_created'
          estimated_cost: number | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: string | null
          title: string
          website_needs: string
          collaboration_preferences?: string | null
          budget_range?: string | null
          ai_quote?: string | null
          suggested_collaboration?: string | null
          ai_suggestions?: Json
          admin_feedback?: string | null
          user_feedback?: string | null
          status?:
            | 'draft'
            | 'pending'
            | 'under_review'
            | 'accepted'
            | 'rejected'
            | 'call_requested'
            | 'project_created'
          estimated_cost?: number | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string | null
          title?: string
          website_needs?: string
          collaboration_preferences?: string | null
          budget_range?: string | null
          ai_quote?: string | null
          suggested_collaboration?: string | null
          ai_suggestions?: Json
          admin_feedback?: string | null
          user_feedback?: string | null
          status?:
            | 'draft'
            | 'pending'
            | 'under_review'
            | 'accepted'
            | 'rejected'
            | 'call_requested'
            | 'project_created'
          estimated_cost?: number | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_activities: {
        Row: {
          id: string
          quote_id: string
          activity_type:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'call_requested'
            | 'note_added'
            | 'viewed'
          description: string | null
          created_by: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          activity_type:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'call_requested'
            | 'note_added'
            | 'viewed'
          description?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          activity_type?:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'call_requested'
            | 'note_added'
            | 'viewed'
          description?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          quote_id: string | null
          client_id: string
          project_name: string
          description: string | null
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          final_cost: number | null
          currency: string
          team_members: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id?: string | null
          client_id: string
          project_name: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          final_cost?: number | null
          currency?: string
          team_members?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string | null
          client_id?: string
          project_name?: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          final_cost?: number | null
          currency?: string
          team_members?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
          due_date: string | null
          completed_date: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'blocked'
          due_date?: string | null
          completed_date?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'blocked'
          due_date?: string | null
          completed_date?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          id: string
          project_id: string
          name: string
          file_url: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          file_url: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          file_url?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          operation: string
          user_id: string | null
          row_id: string | null
          old_values: Json | null
          new_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          operation: string
          user_id?: string | null
          row_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          operation?: string
          user_id?: string | null
          row_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      weekly_marketing_checklist_items: {
        Row: {
          id: string
          week_start_date: string
          task_key: string
          task_label: string
          platform: string
          day_of_week: number
          completed: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          week_start_date: string
          task_key: string
          task_label: string
          platform: string
          day_of_week: number
          completed?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          week_start_date?: string
          task_key?: string
          task_label?: string
          platform?: string
          day_of_week?: number
          completed?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      weekly_marketing_summaries: {
        Row: {
          id: string
          week_start_date: string
          total_tasks: number
          completed_tasks: number
          completion_rate: number
          breakdown_json: Json
          committed_at: string
          committed_by: string | null
          is_committed: boolean
        }
        Insert: {
          id?: string
          week_start_date: string
          total_tasks: number
          completed_tasks: number
          completion_rate: number
          breakdown_json: Json
          committed_at?: string
          committed_by?: string | null
          is_committed?: boolean
        }
        Update: {
          id?: string
          week_start_date?: string
          total_tasks?: number
          completed_tasks?: number
          completion_rate?: number
          breakdown_json?: Json
          committed_at?: string
          committed_by?: string | null
          is_committed?: boolean
        }
        Relationships: []
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
