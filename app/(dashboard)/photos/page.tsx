import { createClient } from '@/lib/supabase/server'
import { PhotoSendChecklist } from '@/components/dashboard/PhotoSendChecklist'
import { PhotoSendLog } from '@/components/dashboard/PhotoSendLog'

export default async function PhotosPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [toursResult, photoSendsResult] = await Promise.all([
    supabase
      .from('tours')
      .select('*, tour_participants(*, customers(id, name, email))')
      .eq('tour_date', today)
      .neq('status', 'cancelled')
      .order('start_time'),
    supabase
      .from('photo_sends')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false }),
  ])

  const tours = toursResult.data ?? []
  const photoSends = photoSendsResult.data ?? []

  // ツアーごとの photo_send を紐付け
  const photoSendsByTour = new Map(
    photoSends.map((ps) => [ps.tour_id, ps])
  )

  // 送付ログ（sent_at あり）
  const sentLogs = photoSends.filter((ps) => ps.sent_at !== null)

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">写真送付</h1>

      <div className="space-y-4">
        {tours.map((tour) => (
          <PhotoSendChecklist
            key={tour.id}
            tour={tour}
            photoSend={photoSendsByTour.get(tour.id) ?? null}
          />
        ))}
        {tours.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">本日のツアーはありません</p>
        )}
      </div>

      {sentLogs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">本日の送付ログ</h2>
          <PhotoSendLog logs={sentLogs} tours={tours} />
        </div>
      )}
    </div>
  )
}
