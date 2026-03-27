'use client'

import { useState } from 'react'
import { confirmRecipients, confirmPhotoCount, executeSend, getOrCreatePhotoSend } from '@/lib/actions/photos'
import type { Database } from '@/lib/supabase/types'

type Tour = Database['public']['Tables']['tours']['Row'] & {
  tour_participants: Array<
    Database['public']['Tables']['tour_participants']['Row'] & {
      customers: { id: string; name: string; email: string | null } | null
    }
  >
}
type PhotoSend = Database['public']['Tables']['photo_sends']['Row']

type PhotoSendChecklistProps = {
  tour: Tour
  photoSend: PhotoSend | null
}

export function PhotoSendChecklist({ tour, photoSend: initialPhotoSend }: PhotoSendChecklistProps) {
  const [photoSend, setPhotoSend] = useState<PhotoSend | null>(initialPhotoSend)
  const [photoCount, setPhotoCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmSend, setConfirmSend] = useState(false)

  const isSent = photoSend?.sent_at !== null

  const step1Done = photoSend?.check_recipients === true
  const step2Done = (photoSend?.check_photo_count ?? 0) > 0
  const canSend = step1Done && step2Done && !isSent

  async function ensurePhotoSend(): Promise<PhotoSend> {
    if (photoSend) return photoSend
    const created = await getOrCreatePhotoSend(tour.id)
    setPhotoSend(created)
    return created
  }

  async function handleStep1() {
    setLoading(true)
    setError(null)
    try {
      const ps = await ensurePhotoSend()
      const updated = await confirmRecipients(ps.id)
      setPhotoSend(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Step1に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2() {
    const count = parseInt(photoCount, 10)
    if (!count || count <= 0) {
      setError('写真枚数を入力してください')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const ps = await ensurePhotoSend()
      const updated = await confirmPhotoCount(ps.id, count)
      setPhotoSend(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Step2に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleExecuteSend() {
    if (!photoSend) return
    setLoading(true)
    setError(null)
    setConfirmSend(false)
    try {
      const updated = await executeSend(photoSend.id)
      setPhotoSend(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '送付に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const activeParticipants = tour.tour_participants.filter((p) => p.status !== 'cancelled')

  return (
    <div className={`bg-white rounded-lg border p-4 ${isSent ? 'border-green-300' : 'border-gray-100'}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium text-gray-900">{tour.tour_type}</p>
          <p className="text-xs text-gray-500">{tour.start_time.slice(0, 5)} — {activeParticipants.length}名</p>
        </div>
        {isSent && (
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            ✓ 送付完了
          </span>
        )}
      </div>

      {isSent ? (
        <p className="text-sm text-gray-500">
          {photoSend?.sent_at ? new Date(photoSend.sent_at).toLocaleTimeString('ja-JP') : ''} に
          {photoSend?.recipient_count}名へ {photoSend?.check_photo_count}枚送付済み
        </p>
      ) : (
        <div className="space-y-4">
          {/* Step1 */}
          <div className={`p-3 rounded-lg ${step1Done ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Step1: 宛先確認 {step1Done && '✓'}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {activeParticipants.map((p) => (
                    <li key={p.id} className="text-xs text-gray-500">
                      {p.customers?.name ?? '(未登録)'} — {p.customers?.email ?? 'メールなし'}
                    </li>
                  ))}
                </ul>
              </div>
              {!step1Done && (
                <button
                  onClick={handleStep1}
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  宛先を確認しました
                </button>
              )}
            </div>
          </div>

          {/* Step2 */}
          {step1Done && (
            <div className={`p-3 rounded-lg ${step2Done ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700">
                  Step2: 写真枚数確認 {step2Done && `✓ ${photoSend?.check_photo_count}枚`}
                </p>
                {!step2Done && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={photoCount}
                      onChange={(e) => setPhotoCount(e.target.value)}
                      placeholder="枚数"
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-20"
                    />
                    <button
                      onClick={handleStep2}
                      disabled={loading}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      確認しました
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step3: 送付ボタン */}
          {!confirmSend ? (
            <button
              onClick={() => setConfirmSend(true)}
              disabled={!canSend || loading}
              className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                canSend
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              写真を送付する
            </button>
          ) : (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-orange-800">
                {activeParticipants.length}名へ {photoSend?.check_photo_count}枚を送付します。よろしいですか？
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleExecuteSend}
                  disabled={loading}
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? '送付中...' : '送付実行'}
                </button>
                <button
                  onClick={() => setConfirmSend(false)}
                  className="px-4 py-1.5 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
