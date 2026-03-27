import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row']

type TodayTourOverviewProps = {
  tours: Tour[]
}

const STATUS_LABELS: Record<Tour['status'], string> = {
  waiting: '待機',
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

export function TodayTourOverview({ tours }: TodayTourOverviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">本日の全ツアー</h2>
      {tours.length === 0 ? (
        <p className="text-xs text-gray-400">本日のツアーはありません</p>
      ) : (
        <ul className="space-y-2">
          {tours.map((tour) => (
            <li key={tour.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{tour.tour_type}</p>
                <p className="text-xs text-gray-500">{tour.start_time.slice(0, 5)} — {tour.participant_count}名</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[tour.status]}`}>
                {STATUS_LABELS[tour.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
