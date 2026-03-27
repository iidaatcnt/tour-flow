import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row'] & {
  tour_participants: Array<
    Database['public']['Tables']['tour_participants']['Row'] & {
      customers: { name: string } | null
    }
  >
}

type MyTourCardProps = {
  tour: Tour
}

export function MyTourCard({ tour }: MyTourCardProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-green-800">現在のツアー</h2>
        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">進行中</span>
      </div>
      <p className="font-semibold text-gray-900">{tour.tour_type}</p>
      <p className="text-sm text-gray-600">{tour.start_time.slice(0, 5)} 開始</p>

      <div className="mt-3 space-y-1">
        {tour.tour_participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <p className="text-sm text-gray-800">{p.customers?.name ?? '(未登録)'}</p>
            {p.status === 'late' && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                遅刻 {p.late_minutes}分
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
