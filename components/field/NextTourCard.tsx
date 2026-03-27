import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row']

type NextTourCardProps = {
  tour: Tour
}

export function NextTourCard({ tour }: NextTourCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-80">
      <h2 className="text-xs font-semibold text-gray-500 mb-2">次のツアー</h2>
      <p className="font-medium text-gray-700">{tour.tour_type}</p>
      <p className="text-sm text-gray-500">
        {tour.start_time.slice(0, 5)} — {tour.participant_count}名
      </p>
    </div>
  )
}
