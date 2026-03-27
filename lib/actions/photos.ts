'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type PhotoSendRow = Database['public']['Tables']['photo_sends']['Row']

export async function getOrCreatePhotoSend(tourId: string): Promise<PhotoSendRow> {
  const supabase = await createClient()

  // 本日のツアーに既存レコードがあれば返す
  const { data: existing } = await supabase
    .from('photo_sends')
    .select('*')
    .eq('tour_id', tourId)
    .is('sent_at', null)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('photo_sends')
    .insert({ tour_id: tourId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function confirmRecipients(photoSendId: string): Promise<PhotoSendRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('photo_sends')
    .update({ check_recipients: true })
    .eq('id', photoSendId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/photos')
  return data
}

export async function confirmPhotoCount(photoSendId: string, count: number): Promise<PhotoSendRow> {
  if (count <= 0) throw new Error('写真枚数は1以上を入力してください。')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('photo_sends')
    .update({ check_photo_count: count })
    .eq('id', photoSendId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/photos')
  return data
}

export async function executeSend(photoSendId: string): Promise<PhotoSendRow> {
  const supabase = await createClient()

  // Step1・Step2 チェック
  const { data: record, error: fetchError } = await supabase
    .from('photo_sends')
    .select('*')
    .eq('id', photoSendId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  if (!record.check_recipients || !record.check_photo_count) {
    throw new Error('400: checks incomplete — Step1・Step2を完了してから送付してください。')
  }

  const { data: user } = await supabase.auth.getUser()

  // 参加者数を取得
  const { data: participants } = await supabase
    .from('tour_participants')
    .select('customer_id')
    .eq('tour_id', record.tour_id)
    .neq('status', 'cancelled')

  const recipientCount = participants?.length ?? 0

  const { data, error } = await supabase
    .from('photo_sends')
    .update({
      sent_at: new Date().toISOString(),
      sent_by: user.user?.id ?? null,
      recipient_count: recipientCount,
    })
    .eq('id', photoSendId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // tours テーブルを更新
  await supabase
    .from('tours')
    .update({
      photos_sent: true,
      photos_sent_at: new Date().toISOString(),
      photos_sent_by: user.user?.id ?? null,
    })
    .eq('id', record.tour_id)

  revalidatePath('/photos')
  return data
}

export async function getTodayPhotoSends(): Promise<PhotoSendRow[]> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('photo_sends')
    .select('*, tours!inner(tour_date, tour_type)')
    .gte('created_at', `${today}T00:00:00`)
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as PhotoSendRow[]) ?? []
}
