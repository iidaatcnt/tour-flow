'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type FieldRequestRow = Database['public']['Tables']['field_requests']['Row']
type FieldNotificationRow = Database['public']['Tables']['field_notifications']['Row']
type RequestType = FieldRequestRow['request_type']
type NotificationType = FieldNotificationRow['type']

export type FieldNotificationInput = {
  to_staff_ids: string[]  // 空配列 = 全員
  type: NotificationType
  message: string
  tour_id?: string
}

export async function sendFieldRequest(type: RequestType, tourId?: string): Promise<FieldRequestRow> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('未ログインです。')

  const messages: Record<RequestType, string> = {
    availability: '空き状況を確認してほしい',
    callback: '折り返しをオフィスに任せたい',
    booking_check: '予約内容を確認してほしい',
    urgent: '急ぎの対応をお願いしたい',
    sos: 'SOS（緊急事態）',
  }

  const { data, error } = await supabase
    .from('field_requests')
    .insert({
      from_staff_id: user.user.id,
      request_type: type,
      tour_id: tourId ?? null,
      message: messages[type],
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/field')
  return data
}

export async function sendFieldNotification(input: FieldNotificationInput): Promise<void> {
  // 「返信不要。」を自動付与（末尾に追加、既にある場合はスキップ）
  const messageWithNoReply = input.message.trimEnd().endsWith('返信不要。')
    ? input.message
    : `${input.message.trimEnd()} 返信不要。`

  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('field_notifications')
    .insert({
      to_staff_ids: input.to_staff_ids,
      type: input.type,
      message: messageWithNoReply,
      no_reply: true,
      tour_id: input.tour_id ?? null,
      sent_by: user.user?.id ?? null,
    })

  if (error) throw new Error(error.message)

  revalidatePath('/field')
}

export async function resolveRequest(requestId: string): Promise<FieldRequestRow> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('field_requests')
    .update({
      status: 'resolved',
      resolved_by: user.user?.id ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/field')
  return data
}

export async function getFieldNotifications(staffId?: string): Promise<FieldNotificationRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('field_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // staffId が指定された場合は全員宛(空配列)または個人宛のものを取得
  if (staffId) {
    query = query.or(`to_staff_ids.eq.{},to_staff_ids.cs.{${staffId}}`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}
