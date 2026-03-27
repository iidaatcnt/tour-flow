'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type Inquiry = Database['public']['Tables']['inquiries']['Row']

type InquiryListProps = {
  inquiries: Inquiry[]
}

const CHANNEL_LABELS: Record<Inquiry['channel'], string> = {
  phone: '電話',
  email: 'メール',
  callback: '折り返し',
  web: 'Web',
}

const STATUS_LABELS: Record<Inquiry['status'], string> = {
  new: '未対応',
  in_progress: '対応中',
  done: '完了',
}

const STATUS_COLORS: Record<Inquiry['status'], string> = {
  new: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-gray-100 text-gray-500',
}

const URGENCY_LABELS: Record<Inquiry['urgency'], string> = {
  immediate: '至急',
  today: '本日中',
  later: '後日',
}

/** 折り返し電話 かつ 未対応 のものを先頭に固定し、残りは受信時刻順 */
export function sortInquiries(inquiries: Inquiry[]): Inquiry[] {
  const urgent = inquiries.filter((i) => i.channel === 'callback' && i.status === 'new')
  const rest = inquiries.filter((i) => !(i.channel === 'callback' && i.status === 'new'))
  return [...urgent, ...rest]
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

function isOverdue(receivedAt: string, status: Inquiry['status']): boolean {
  if (status === 'done') return false
  return Date.now() - new Date(receivedAt).getTime() > TWO_HOURS_MS
}

export function InquiryList({ inquiries }: InquiryListProps) {
  const [channelFilter, setChannelFilter] = useState<Inquiry['channel'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Inquiry['status'] | 'all'>('all')

  const filtered = useMemo(() => {
    const base = inquiries.filter((i) => {
      if (channelFilter !== 'all' && i.channel !== channelFilter) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      return true
    })
    return sortInquiries(base)
  }, [inquiries, channelFilter, statusFilter])

  return (
    <div className="space-y-3">
      {/* フィルタ */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as Inquiry['channel'] | 'all')}
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="all">すべてのチャネル</option>
          <option value="phone">電話</option>
          <option value="email">メール</option>
          <option value="callback">折り返し</option>
          <option value="web">Web</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Inquiry['status'] | 'all')}
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="all">すべてのステータス</option>
          <option value="new">未対応</option>
          <option value="in_progress">対応中</option>
          <option value="done">完了</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">該当する問い合わせがありません</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((inquiry) => {
            const isUrgent = inquiry.channel === 'callback' && inquiry.status === 'new'
            const overdue = isOverdue(inquiry.received_at, inquiry.status)

            return (
              <li key={inquiry.id}>
                <Link
                  href={`/inquiries/${inquiry.id}`}
                  className={`block p-3 rounded-lg border bg-white hover:bg-gray-50 ${
                    isUrgent
                      ? 'border-red-300 bg-red-50 hover:bg-red-50'
                      : overdue
                      ? 'border-amber-200'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUrgent && (
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            要対応
                          </span>
                        )}
                        {overdue && !isUrgent && (
                          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-1.5 py-0.5 rounded">
                            2時間超未対応
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {inquiry.customer_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {CHANNEL_LABELS[inquiry.channel]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {URGENCY_LABELS[inquiry.urgency]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{inquiry.content}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[inquiry.status]}`}>
                      {STATUS_LABELS[inquiry.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(inquiry.received_at).toLocaleString('ja-JP')}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
