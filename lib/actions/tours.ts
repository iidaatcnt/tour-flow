'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type TourRow = Database['public']['Tables']['tours']['Row']
type TourParticipantRow = Database['public']['Tables']['tour_participants']['Row']

export async function getTodayTours(): Promise<TourRow[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('tour_date', today)
    .order('start_time', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTourWithParticipants(tourId: string) {
  const supabase = await createClient()

  const [tourResult, participantsResult] = await Promise.all([
    supabase.from('tours').select('*').eq('id', tourId).single(),
    supabase
      .from('tour_participants')
      .select('*, customers(id, name, name_kana, email, phone)')
      .eq('tour_id', tourId),
  ])

  if (tourResult.error) throw new Error(tourResult.error.message)
  if (participantsResult.error) throw new Error(participantsResult.error.message)

  return {
    tour: tourResult.data,
    participants: participantsResult.data ?? [],
  }
}

export async function updateTourStatus(
  tourId: string,
  status: TourRow['status']
): Promise<TourRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tours')
    .update({ status })
    .eq('id', tourId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/tours')
  return data
}

export async function reportLateParticipant(
  participantId: string,
  lateMinutes: number,
  tourId: string
): Promise<TourParticipantRow> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  // 参加者ステータスを late に更新
  const { data: participant, error: participantError } = await supabase
    .from('tour_participants')
    .update({ status: 'late', late_minutes: lateMinutes })
    .eq('id', participantId)
    .select('*, customers(name)')
    .single()

  if (participantError) throw new Error(participantError.message)

  // フィールド通知を作成
  const customerName = (participant as TourParticipantRow & { customers: { name: string } | null })
    .customers?.name ?? '参加者'

  await supabase.from('field_notifications').insert({
    to_staff_ids: [],  // 全員
    type: 'late',
    message: `${customerName}様 ${lateMinutes}分遅刻の見込みです。先に安全説明を進めてください。返信不要。`,
    no_reply: true,
    tour_id: tourId,
    sent_by: user.user?.id ?? null,
  })

  revalidatePath('/tours')
  return participant
}
