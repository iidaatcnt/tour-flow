import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row']

type TourCardProps = {
  tour: Tour
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

export function TourCard({ tour }: TourCardProps) {
  return (
    <Link
      href={`/tours/${tour.id}`}
      className="block bg-white rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{tour.tour_type}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {tour.start_time.slice(0, 5)} 開始
            &nbsp;·&nbsp;
            参加者 {tour.participant_count}/{tour.capacity}名
          </p>
          {tour.notes && (
            <p className="text-xs text-amber-600 mt-1">{tour.notes}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[tour.status]}`}>
          {STATUS_LABELS[tour.status]}
        </span>
      </div>
    </Link>
  )
}
