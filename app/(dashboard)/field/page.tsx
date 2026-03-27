import { createClient } from '@/lib/supabase/server'
import { FieldNoticeList } from '@/components/field/FieldNoticeList'
import { MyTourCard } from '@/components/field/MyTourCard'
import { NextTourCard } from '@/components/field/NextTourCard'
import { TodayTourOverview } from '@/components/field/TodayTourOverview'
import { OneTabRequestButtons } from '@/components/field/OneTabRequestButtons'
import { SosButton } from '@/components/field/SosButton'

export default async function FieldPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  const [notificationsResult, toursResult, profileResult] = await Promise.all([
    supabase
      .from('field_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('tours')
      .select('*, tour_participants(*, customers(name))')
      .eq('tour_date', today)
      .order('start_time'),
    user
      ? supabase.from('profiles').select('*').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const notifications = notificationsResult.data ?? []
  const tours = toursResult.data ?? []
  const profile = profileResult.data

  // 自分のツアー（担当ガイド）
  const myTours = tours.filter((t) => t.guide_id === user?.id)
  const activeTour = myTours.find((t) => t.status === 'active')
  const nextTour = myTours.find((t) => t.status === 'waiting')

  return (
    // フィールド画面: スマホ最適化・テキスト入力フォーム禁止
    <div className="max-w-lg mx-auto space-y-4 pb-8">
      <div className="bg-green-700 text-white px-4 py-3 rounded-lg">
        <p className="text-sm font-semibold">フィールドモード</p>
        <p className="text-xs opacity-80">{profile?.name ?? ''} — {now}</p>
      </div>

      {/* 通知リスト */}
      <FieldNoticeList notifications={notifications} />

      {/* 自分の現在ツアー */}
      {activeTour && <MyTourCard tour={activeTour} />}

      {/* 次のツアー */}
      {nextTour && <NextTourCard tour={nextTour} />}

      {/* 全体進行状況 */}
      <TodayTourOverview tours={tours} />

      {/* ワンタップリクエストボタン */}
      <OneTabRequestButtons />

      {/* SOSボタン */}
      <SosButton />
    </div>
  )
}
