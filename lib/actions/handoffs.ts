'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type HandoffRow = Database['public']['Tables']['handoffs']['Row']
type HandoffStatus = HandoffRow['status']

export type HandoffCreateInput = {
  customer_id?: string
  inquiry_id?: string
  summary: string
  history: string
  next_action: string
  status?: HandoffStatus
  from_staff_id?: string
  to_staff_id?: string
}

export type HandoffFilters = {
  status?: HandoffStatus
  to_staff_id?: string
}

export async function createHandoff(data: HandoffCreateInput): Promise<HandoffRow> {
  // next_action 必須チェック（バックエンドゲートキーパー）
  if (!data.next_action?.trim()) {
    throw new Error('next_action is required')
  }

  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { data: handoff, error } = await supabase
    .from('handoffs')
    .insert({
      customer_id: data.customer_id ?? null,
      inquiry_id: data.inquiry_id ?? null,
      summary: data.summary,
      history: data.history,
      next_action: data.next_action.trim(),
      status: data.status ?? 'pending',
      from_staff_id: data.from_staff_id ?? user.user?.id ?? null,
      to_staff_id: data.to_staff_id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/handoff')
  return handoff
}

export async function completeHandoff(id: string): Promise<HandoffRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('handoffs')
    .update({ status: 'done' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/handoff')
  return data
}

export async function getHandoffs(filters?: HandoffFilters): Promise<HandoffRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('handoffs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.to_staff_id) query = query.eq('to_staff_id', filters.to_staff_id)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}
