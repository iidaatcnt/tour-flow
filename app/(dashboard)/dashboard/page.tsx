import { createClient } from '@/lib/supabase/server'
import { MetricsBar } from '@/components/dashboard/MetricsBar'
import { TeamStatusBar } from '@/components/dashboard/TeamStatusBar'
import { TodayTourList } from '@/components/dashboard/TodayTourList'
import { UrgentInquiries } from '@/components/dashboard/UrgentInquiries'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [toursResult, inquiriesResult, profilesResult, photoSendsResult] = await Promise.all([
    supabase.from('tours').select('*').eq('tour_date', today).order('start_time'),
    supabase.from('inquiries').select('*').neq('status', 'done').order('received_at'),
    supabase.from('profiles').select('*').order('name'),
    supabase
      .from('photo_sends')
      .select('tour_id')
      .not('sent_at', 'is', null)
      .gte('created_at', `${today}T00:00:00`),
  ])

  const tours = toursResult.data ?? []
  const inquiries = inquiriesResult.data ?? []
  const profiles = profilesResult.data ?? []
  const sentTourIds = new Set((photoSendsResult.data ?? []).map((p) => p.tour_id))

  const urgentInquiries = inquiries.filter(
    (i) => i.channel === 'callback' && i.status === 'new'
  )

  const doneTodayTours = tours.filter((t) => t.status === 'done').length
  const photoProgress = tours.length > 0
    ? `${sentTourIds.size}/${tours.filter((t) => t.status === 'done').length}`
    : '0/0'

  return (
    <div className="space-y-6">
      <MetricsBar
        todayTourCount={tours.length}
        pendingInquiryCount={inquiries.filter((i) => i.status === 'new').length}
        photoProgress={photoProgress}
        doneTourCount={doneTodayTours}
        sentTourCount={sentTourIds.size}
      />

      <UrgentInquiries inquiries={urgentInquiries} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayTourList tours={tours} />
        </div>
        <div>
          <TeamStatusBar profiles={profiles} />
        </div>
      </div>
    </div>
  )
}
