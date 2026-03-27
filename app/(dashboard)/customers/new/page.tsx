import { CustomerForm } from '@/components/dashboard/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">顧客新規登録</h1>
      <CustomerForm />
    </div>
  )
}
