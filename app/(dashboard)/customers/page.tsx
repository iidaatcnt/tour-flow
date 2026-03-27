import { searchCustomers } from '@/lib/actions/customers'
import { CustomerList } from '@/components/dashboard/CustomerList'

type SearchParams = { searchParams: { q?: string } }

export default async function CustomersPage({ searchParams }: SearchParams) {
  const customers = await searchCustomers(searchParams.q ?? '')

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">顧客リスト</h1>
      <CustomerList customers={customers} initialQuery={searchParams.q ?? ''} />
    </div>
  )
}
