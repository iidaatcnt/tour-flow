'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type InquiryRow = Database['public']['Tables']['inquiries']['Row']
type InquiryStatus = InquiryRow['status']
type InquiryChannel = InquiryRow['channel']
type InquiryCategory = InquiryRow['category']
type InquiryUrgency = InquiryRow['urgency']

export type InquiryCreateInput = {
  channel: InquiryChannel
  customer_name: string
  customer_id?: string
  phone?: string
  email?: string
  category: InquiryCategory
  content: string
  urgency?: InquiryUrgency
}

export type InquiryFilters = {
  channel?: InquiryChannel
  status?: InquiryStatus
  urgency?: InquiryUrgency
}

export async function createInquiry(data: InquiryCreateInput): Promise<InquiryRow> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      channel: data.channel,
      customer_name: data.customer_name,
      customer_id: data.customer_id ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      category: data.category,
      content: data.content,
      urgency: data.urgency ?? 'today',
      status: 'new',
      created_by: user.user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/inquiries')
  return inquiry
}

export async function assignInquiry(id: string, staffId: string): Promise<InquiryRow> {
  const supabase = await createClient()

  // 楽観的ロック: assigned_to が null のもののみ更新
  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .update({ assigned_to: staffId, status: 'in_progress' })
    .eq('id', id)
    .is('assigned_to', null)
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!inquiry) throw new Error('すでに他のスタッフが担当しています。')

  revalidatePath('/inquiries')
  return inquiry
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryRow> {
  const supabase = await createClient()

  const updateData: Partial<InquiryRow> = { status }
  if (status === 'done') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/inquiries')
  return inquiry
}

export async function getInquiries(filters?: InquiryFilters): Promise<InquiryRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('inquiries')
    .select('*')
    .order('received_at', { ascending: false })

  if (filters?.channel) query = query.eq('channel', filters.channel)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.urgency) query = query.eq('urgency', filters.urgency)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}
