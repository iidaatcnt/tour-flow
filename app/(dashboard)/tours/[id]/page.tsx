import { getTourWithParticipants } from '@/lib/actions/tours'
import { notFound } from 'next/navigation'
import { TourDetailView } from '@/components/dashboard/TourDetailView'

type Params = { params: { id: string } }

export default async function TourDetailPage({ params }: Params) {
  const result = await getTourWithParticipants(params.id).catch(() => null)
  if (!result) notFound()

  return <TourDetailView tour={result.tour} participants={result.participants} />
}
