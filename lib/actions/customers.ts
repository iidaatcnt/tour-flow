'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type CustomerRow = Database['public']['Tables']['customers']['Row']

export type CustomerCreateInput = {
  name: string
  name_kana?: string
  phone?: string
  email?: string
  notes?: string
}

export async function createCustomer(data: CustomerCreateInput): Promise<CustomerRow> {
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: data.name,
      name_kana: data.name_kana ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/customers')
  return customer
}

export async function searchCustomers(query: string): Promise<CustomerRow[]> {
  const supabase = await createClient()

  if (!query.trim()) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })
      .limit(50)

    if (error) throw new Error(error.message)
    return data ?? []
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(
      `name.ilike.%${query}%,name_kana.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`
    )
    .order('name', { ascending: true })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCustomerWithHistory(customerId: string) {
  const supabase = await createClient()

  const [customerResult, inquiriesResult, participantsResult] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).single(),
    supabase
      .from('inquiries')
      .select('*')
      .eq('customer_id', customerId)
      .order('received_at', { ascending: false }),
    supabase
      .from('tour_participants')
      .select('*, tours(id, tour_date, tour_type, status)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
  ])

  if (customerResult.error) throw new Error(customerResult.error.message)

  return {
    customer: customerResult.data,
    inquiries: inquiriesResult.data ?? [],
    tourHistory: participantsResult.data ?? [],
  }
}
