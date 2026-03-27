import { getInquiries } from '@/lib/actions/inquiries'
import { InquiryList } from '@/components/dashboard/InquiryList'
import Link from 'next/link'

export default async function InquiriesPage() {
  const inquiries = await getInquiries()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">問い合わせ管理</h1>
        <Link
          href="/inquiries/new"
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          新規起票
        </Link>
      </div>
      <InquiryList inquiries={inquiries} />
    </div>
  )
}
