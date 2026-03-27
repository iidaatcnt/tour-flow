'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type UserStatus = ProfileRow['status']

export async function updateUserStatus(status: UserStatus): Promise<ProfileRow> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('未ログインです。')

  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', user.user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  return data
}

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single()

  if (error) return null
  return data
}
