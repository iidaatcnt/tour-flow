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
      tour_participants: {
        Row: {
          id: string
          tour_id: string
          customer_id: string | null
          party_size: number
          status: 'confirmed' | 'late' | 'cancelled'
          late_minutes: number | null
        }
        Insert: Omit<Database['public']['Tables']['tour_participants']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['tour_participants']['Insert']>
      }
      photo_sends: {
        Row: {
          id: string
          tour_id: string
          check_recipients: boolean
          check_photo_count: number | null
          sent_at: string | null
          sent_by: string | null
          recipient_count: number | null
          is_resend: boolean
          resend_reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['photo_sends']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['photo_sends']['Insert']>
      }
      field_requests: {
        Row: {
          id: string
          from_staff_id: string
          request_type: 'availability' | 'callback' | 'booking_check' | 'urgent' | 'sos'
          tour_id: string | null
          message: string | null
          status: 'pending' | 'resolved'
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['field_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['field_requests']['Insert']>
      }
      field_notifications: {
        Row: {
          id: string
          to_staff_ids: string[]
          type: 'late' | 'cancel' | 'change' | 'availability' | 'info' | 'emergency'
          message: string
          no_reply: boolean
          tour_id: string | null
          sent_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['field_notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['field_notifications']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          tour_id: string | null
          customer_id: string | null
          guide_id: string | null
          score: number
          comment: string | null
          google_posted: boolean
          google_nudged: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      google_reviews: {
        Row: {
          id: string
          google_id: string | null
          reviewer_name: string | null
          score: number | null
          comment: string | null
          review_date: string | null
          reply_status: 'none' | 'draft' | 'replied'
          reply_text: string | null
          replied_at: string | null
          replied_by: string | null
          owner_approval_required: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['google_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['google_reviews']['Insert']>
      }
      staff_shifts: {
        Row: {
          id: string
          staff_id: string
          shift_date: string
          role: 'tour' | 'office' | 'off'
          tour_id: string | null
          hours_worked: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff_shifts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['staff_shifts']['Insert']>
      }
    }
  }
}
