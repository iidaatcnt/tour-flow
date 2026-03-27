import { getCustomerWithHistory } from '@/lib/actions/customers'
import { notFound } from 'next/navigation'

type Params = { params: { id: string } }

export default async function CustomerDetailPage({ params }: Params) {
  const result = await getCustomerWithHistory(params.id).catch(() => null)
  if (!result) notFound()

  const { customer, inquiries, tourHistory } = result

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{customer.name}</h1>
        {customer.name_kana && <p className="text-sm text-gray-500">{customer.name_kana}</p>}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">電話</p>
          <p className="font-medium">{customer.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">メール</p>
          <p className="font-medium">{customer.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">参加回数</p>
          <p className="font-medium">{customer.tour_count}回</p>
        </div>
        <div>
          <p className="text-gray-500">最終参加日</p>
          <p className="font-medium">{customer.last_tour_date ?? '—'}</p>
        </div>
      </div>

      {customer.notes && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-gray-700">
          {customer.notes}
        </div>
      )}

      {/* 対応ログ */}
      {inquiries.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">対応ログ</h2>
          <ul className="space-y-2">
            {inquiries.map((inq) => (
              <li key={inq.id} className="bg-white rounded border border-gray-100 p-3 text-sm">
                <p className="text-gray-900">{inq.content.slice(0, 80)}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(inq.received_at).toLocaleDateString('ja-JP')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 参加ツアー履歴 */}
      {tourHistory.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">参加ツアー履歴</h2>
          <ul className="space-y-2">
            {tourHistory.map((tp) => {
              const t = tp as typeof tp & { tours: { tour_date: string; tour_type: string; status: string } | null }
              return (
                <li key={tp.id} className="bg-white rounded border border-gray-100 p-3 text-sm">
                  <p className="text-gray-900">{t.tours?.tour_type ?? '—'}</p>
                  <p className="text-xs text-gray-400">{t.tours?.tour_date ?? '—'}</p>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
