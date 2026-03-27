'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type FieldNotification = Database['public']['Tables']['field_notifications']['Row']

type FieldNoticeListProps = {
  notifications: FieldNotification[]
}

const TYPE_LABELS: Record<FieldNotification['type'], string> = {
  late: '遅刻',
  cancel: 'キャンセル',
  change: '変更',
  availability: '空き',
  info: '情報',
  emergency: '緊急',
}

const TYPE_COLORS: Record<FieldNotification['type'], string> = {
  late: 'bg-amber-100 text-amber-700',
  cancel: 'bg-red-100 text-red-700',
  change: 'bg-blue-100 text-blue-700',
  availability: 'bg-green-100 text-green-700',
  info: 'bg-gray-100 text-gray-700',
  emergency: 'bg-red-600 text-white',
}

export function FieldNoticeList({ notifications: initialNotifications }: FieldNoticeListProps) {
  const [notifications, setNotifications] = useState<FieldNotification[]>(initialNotifications)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('field-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'field_notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as FieldNotification, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        <p className="text-sm text-gray-400 text-center">通知はありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">オフィスからの通知</h2>
      </div>
      <ul className="divide-y divide-gray-50">
        {notifications.map((n) => (
          <li key={n.id} className="px-4 py-3">
            <div className="flex items-start gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap mt-0.5 ${TYPE_COLORS[n.type]}`}>
                {TYPE_LABELS[n.type]}
              </span>
              <p className="text-sm text-gray-900">{n.message}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
