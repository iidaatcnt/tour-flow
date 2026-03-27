import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InquiryDetail } from '@/components/dashboard/InquiryDetail'

type Params = { params: { id: string } }

export default async function InquiryDetailPage({ params }: Params) {
  const supabase = await createClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!inquiry) notFound()

  const { data: profiles } = await supabase.from('profiles').select('*')

  return <InquiryDetail inquiry={inquiry} profiles={profiles ?? []} />
}
