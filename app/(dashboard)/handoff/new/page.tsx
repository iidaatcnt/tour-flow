import { createClient } from '@/lib/supabase/server'
import { HandoffForm } from '@/components/dashboard/HandoffForm'

type SearchParams = { searchParams: { customer_name?: string; content?: string; inquiry_id?: string } }

export default async function NewHandoffPage({ searchParams }: SearchParams) {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .order('name')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">引き継ぎノート作成</h1>
      <HandoffForm
        customers={customers ?? []}
        profiles={profiles ?? []}
        defaultValues={{
          customer_name: searchParams.customer_name,
          history: searchParams.content,
          inquiry_id: searchParams.inquiry_id,
        }}
      />
    </div>
  )
}
