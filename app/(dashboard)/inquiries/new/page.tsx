import { InquiryForm } from '@/components/dashboard/InquiryForm'

export default function NewInquiryPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">問い合わせ新規起票</h1>
      <InquiryForm />
    </div>
  )
}
