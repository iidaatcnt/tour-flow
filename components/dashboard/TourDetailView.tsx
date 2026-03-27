'use client'

import { useState } from 'react'
import { reportLateParticipant, updateTourStatus } from '@/lib/actions/tours'
import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row']
type TourParticipant = Database['public']['Tables']['tour_participants']['Row'] & {
  customers: { id: string; name: string; name_kana: string | null; email: string | null; phone: string | null } | null
}

type TourDetailViewProps = {
  tour: Tour
  participants: TourParticipant[]
}

const STATUS_LABELS: Record<Tour['status'], string> = {
  waiting: '待機中',
  active: '進行中',
  done: '完了',
  cancelled: 'キャンセル',
}

export function TourDetailView({ tour, participants }: TourDetailViewProps) {
  const [tourStatus, setTourStatus] = useState(tour.status)
  const [lateTarget, setLateTarget] = useState<string | null>(null)
  const [lateMinutes, setLateMinutes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: Tour['status']) {
    setLoading(true)
    try {
      await updateTourStatus(tour.id, newStatus)
      setTourStatus(newStatus)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ステータス更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleLateReport(participantId: string) {
    const minutes = parseInt(lateMinutes, 10)
    if (!minutes || minutes <= 0) {
      setError('遅刻見込み分数を入力してください')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await reportLateParticipant(participantId, minutes, tour.id)
      setLateTarget(null)
      setLateMinutes('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '遅刻報告に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{tour.tour_type}</h1>
          <p className="text-sm text-gray-500">{tour.tour_date} {tour.start_time.slice(0, 5)} 開始</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          tourStatus === 'active' ? 'bg-green-100 text-green-700' :
          tourStatus === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
          tourStatus === 'done' ? 'bg-gray-100 text-gray-500' :
          'bg-red-100 text-red-600'
        }`}>
          {STATUS_LABELS[tourStatus]}
        </span>
      </div>

      {/* ステータス更新ボタン */}
      {tourStatus === 'waiting' && (
        <button
          onClick={() => handleStatusUpdate('active')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          ツアー開始
        </button>
      )}
      {tourStatus === 'active' && (
        <button
          onClick={() => handleStatusUpdate('done')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          ツアー完了
        </button>
      )}

      {/* 参加者リスト */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">参加者一覧 ({participants.length}名)</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {participants.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.customers?.name ?? '(未登録)'}
                    <span className="text-gray-400 ml-1 text-xs">{p.party_size}名</span>
                  </p>
                  {p.customers?.email && (
                    <p className="text-xs text-gray-500">{p.customers.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.status === 'late' && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      遅刻 {p.late_minutes}分
                    </span>
                  )}
                  {p.status === 'confirmed' && lateTarget !== p.id && (
                    <button
                      onClick={() => setLateTarget(p.id)}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      遅刻報告
                    </button>
                  )}
                </div>
              </div>

              {/* 遅刻入力フォーム */}
              {lateTarget === p.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={lateMinutes}
                    onChange={(e) => setLateMinutes(e.target.value)}
                    placeholder="遅刻見込み（分）"
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-32"
                  />
                  <button
                    onClick={() => handleLateReport(p.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:opacity-50"
                  >
                    報告
                  </button>
                  <button
                    onClick={() => { setLateTarget(null); setLateMinutes('') }}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
