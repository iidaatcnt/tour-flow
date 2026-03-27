import { getTodayTours } from '@/lib/actions/tours'
import { TourCard } from '@/components/dashboard/TourCard'

export default async function ToursPage() {
  const tours = await getTodayTours()

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">本日のツアー</h1>
      {tours.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">本日のツアーはありません</p>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
