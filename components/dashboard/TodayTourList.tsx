import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row']

type TodayTourListProps = {
  tours: Tour[]
}

const STATUS_LABELS: Record<Tour['status'], string> = {
  waiting: '待機中',
  active: '進行中',
  done: '完了',
  cancelled: 'キャンセル',
}

const STATUS_COLORS: Record<Tour['status'], string> = {
  waiting: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  done: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
}

export function TodayTourList({ tours }: TodayTourListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">本日のツアー</h2>
      </div>
      {tours.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-400 text-center">本日のツアーはありません</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {tours.map((tour) => (
            <li key={tour.id}>
              <Link
                href={`/tours/${tour.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{tour.tour_type}</p>
                  <p className="text-xs text-gray-500">
                    {tour.start_time.slice(0, 5)} — 参加者{tour.participant_count}/{tour.capacity}名
                    {tour.notes && <span className="ml-2 text-yellow-600">{tour.notes}</span>}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[tour.status]}`}>
                  {STATUS_LABELS[tour.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
