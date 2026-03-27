'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignInquiry, updateInquiryStatus } from '@/lib/actions/inquiries'
import type { Database } from '@/lib/supabase/types'

type Inquiry = Database['public']['Tables']['inquiries']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

type InquiryDetailProps = {
  inquiry: Inquiry
  profiles: Profile[]
}

const STATUS_LABELS: Record<Inquiry['status'], string> = {
  new: '未対応',
  in_progress: '対応中',
  done: '完了',
}

const CHANNEL_LABELS: Record<Inquiry['channel'], string> = {
  phone: '電話',
  email: 'メール',
  callback: '折り返し電話',
  web: 'Webフォーム',
}

const CATEGORY_LABELS: Record<Inquiry['category'], string> = {
  new_booking: '新規予約',
  change: '変更',
  cancel: 'キャンセル',
  clothes: '服装・持ち物',
  photo: '写真',
  other: 'その他',
}

export function InquiryDetail({ inquiry, profiles }: InquiryDetailProps) {
  const router = useRouter()
  const [status, setStatus] = useState(inquiry.status)
  const [assignedTo, setAssignedTo] = useState(inquiry.assigned_to)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAssign() {
    const staffId = profiles[0]?.id
    if (!staffId) return

    setLoading(true)
    setError(null)
    try {
      const updated = await assignInquiry(inquiry.id, staffId)
      setAssignedTo(updated.assigned_to)
      setStatus(updated.status)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '担当設定に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: Inquiry['status']) {
    setLoading(true)
    setError(null)
    try {
      await updateInquiryStatus(inquiry.id, newStatus)
      setStatus(newStatus)

      if (newStatus === 'done') {
        const params = new URLSearchParams({
          customer_name: inquiry.customer_name,
          content: inquiry.content,
          inquiry_id: inquiry.id,
        })
        if (confirm('引き継ぎメモを作成しますか？')) {
          router.push(`/handoff/new?${params.toString()}`)
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ステータス更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const assignedProfile = profiles.find((p) => p.id === assignedTo)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">問い合わせ詳細</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          status === 'new' ? 'bg-red-100 text-red-700' :
          status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">顧客名</p>
            <p className="font-medium">{inquiry.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-500">チャネル</p>
            <p className="font-medium">{CHANNEL_LABELS[inquiry.channel]}</p>
          </div>
          <div>
            <p className="text-gray-500">カテゴリ</p>
            <p className="font-medium">{CATEGORY_LABELS[inquiry.category]}</p>
          </div>
          <div>
            <p className="text-gray-500">受信日時</p>
            <p className="font-medium">{new Date(inquiry.received_at).toLocaleString('ja-JP')}</p>
          </div>
          {inquiry.phone && (
            <div>
              <p className="text-gray-500">電話番号</p>
              <p className="font-medium">{inquiry.phone}</p>
            </div>
          )}
          {inquiry.email && (
            <div>
              <p className="text-gray-500">メール</p>
              <p className="font-medium">{inquiry.email}</p>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-sm mb-1">問い合わせ内容</p>
          <p className="text-sm whitespace-pre-wrap">{inquiry.content}</p>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">担当者</p>
            <p className="text-sm font-medium">
              {assignedProfile?.name ?? '未設定'}
            </p>
          </div>
          {!assignedTo && status !== 'done' && (
            <button
              onClick={handleAssign}
              disabled={loading}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              担当する
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {status !== 'done' && (
        <div className="flex gap-2">
          {status === 'new' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              対応開始
            </button>
          )}
          {status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange('done')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              完了にする
            </button>
          )}
        </div>
      )}
    </div>
  )
}
