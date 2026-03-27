import { getHandoffs } from '@/lib/actions/handoffs'
import { HandoffList } from '@/components/dashboard/HandoffList'
import Link from 'next/link'

export default async function HandoffPage() {
  const handoffs = await getHandoffs()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">引き継ぎノート</h1>
        <Link
          href="/handoff/new"
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          新規作成
        </Link>
      </div>
      <HandoffList handoffs={handoffs} />
    </div>
  )
}
