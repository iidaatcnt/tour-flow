import type { Database } from '@/lib/supabase/types'

type PhotoSend = Database['public']['Tables']['photo_sends']['Row']
type Tour = Database['public']['Tables']['tours']['Row']

type PhotoSendLogProps = {
  logs: PhotoSend[]
  tours: Array<Tour & { tour_participants: unknown[] }>
}

export function PhotoSendLog({ logs, tours }: PhotoSendLogProps) {
  const tourMap = new Map(tours.map((t) => [t.id, t]))

  return (
    <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
      {logs.map((log) => {
        const tour = tourMap.get(log.tour_id)
        return (
          <div key={log.id} className="px-4 py-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tour?.tour_type ?? 'ツアー不明'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {log.sent_at ? new Date(log.sent_at).toLocaleTimeString('ja-JP') : ''} —
                {log.recipient_count}名へ {log.check_photo_count}枚
                {log.is_resend && (
                  <span className="ml-2 text-orange-600">
                    再送: {log.resend_reason}
                  </span>
                )}
              </p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              送付済み
            </span>
          </div>
        )
      })}
    </div>
  )
}
