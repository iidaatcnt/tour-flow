// Supabase から自動生成される型定義のプレースホルダー
// `npx supabase gen types typescript --local > lib/supabase/types.ts` で更新

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'owner' | 'instructor' | 'office'
          status: 'tour' | 'office' | 'break'
          avatar_color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          name_kana: string | null
          phone: string | null
          email: string | null
          tour_count: number
          last_tour_date: string | null
          tags: string[]
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'tour_count'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      tours: {
        Row: {
          id: string
          tour_date: string
          start_time: string
          tour_type: string
          guide_id: string | null
          capacity: number
          participant_count: number
          status: 'waiting' | 'active' | 'done' | 'cancelled'
          photos_uploaded: boolean
          photos_sent: boolean
          photos_sent_at: string | null
          photos_sent_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tours']['Row'], 'id' | 'created_at' | 'participant_count' | 'photos_uploaded' | 'photos_sent'>
        Update: Partial<Database['public']['Tables']['tours']['Insert']>
      }
      inquiries: {
        Row: {
          id: string
          received_at: string
          channel: 'phone' | 'email' | 'callback' | 'web'
          customer_id: string | null
          customer_name: string
          phone: string | null
          email: string | null
          category: 'new_booking' | 'change' | 'cancel' | 'clothes' | 'photo' | 'other'
          content: string
          urgency: 'immediate' | 'today' | 'later'
          status: 'new' | 'in_progress' | 'done'
          assigned_to: string | null
          nutmeg_required: boolean
          resolved_at: string | null
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'received_at'>
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>
      }
      handoffs: {
        Row: {
          id: string
          customer_id: string | null
          inquiry_id: string | null
          summary: string
          history: string
          next_action: string
          status: 'urgent' | 'pending' | 'done'
          from_staff_id: string | null
          to_staff_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['handoffs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['handoffs']['Insert']>
      }
    }
  }
}
