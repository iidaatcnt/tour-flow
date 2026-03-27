'use client'

import { useState } from 'react'
import { sendFieldNotification } from '@/lib/actions/field'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type NotificationType = Database['public']['Tables']['field_notifications']['Row']['type']

type FieldNotificationPanelProps = {
  profiles: Profile[]
}

const PRESETS: Array<{ type: NotificationType; label: string; template: string }> = [
  {
    type: 'late',
    label: '遅刻',
    template: '○○様がN分遅刻の見込みです。先に安全説明を進めてください。',
  },
  {
    type: 'cancel',
    label: 'キャンセル',
    template: '○○様が本日のツアーをキャンセルされました。',
  },
  {
    type: 'change',
    label: '変更',
    template: '○○様の予約内容に変更があります。詳細は別途連絡します。',
  },
  {
    type: 'availability',
    label: '空き回答',
    template: 'お問い合わせの空き状況について：○月○日は空きがあります。',
  },
  {
    type: 'info',
    label: '情報',
    template: '',
  },
]

export function FieldNotificationPanel({ profiles }: FieldNotificationPanelProps) {
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([])  // 空 = 全員
  const [selectedType, setSelectedType] = useState<NotificationType>('info')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePresetChange(type: NotificationType) {
    setSelectedType(type)
    const preset = PRESETS.find((p) => p.type === type)
    if (preset?.template) setMessage(preset.template)
  }

  // 「返信不要。」は末尾に自動付与されるため表示のみ
  const previewMessage = message.trimEnd()
    ? message.trimEnd().endsWith('返信不要。')
      ? message
      : `${message.trimEnd()} 返信不要。`
    : ''

  async function handleSend() {
    if (!message.trim()) {
      setError('メッセージを入力してください')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await sendFieldNotification({
        to_staff_ids: selectedStaffs,
        type: selectedType,
        message,
      })
      setSent(true)
      setMessage('')
      setTimeout(() => setSent(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">フィールドへ送信</h2>

      {/* 送信先 */}
      <div>
        <p className="text-xs text-gray-500 mb-1">送信先</p>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedStaffs.length === 0}
              onChange={() => setSelectedStaffs([])}
              readOnly
            />
            全員
          </label>
          {profiles.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedStaffs.includes(p.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStaffs((prev) => [...prev, p.id])
                  } else {
                    setSelectedStaffs((prev) => prev.filter((id) => id !== p.id))
                  }
                }}
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {/* 通知種別プリセット */}
      <div>
        <p className="text-xs text-gray-500 mb-1">通知種別</p>
        <select
          value={selectedType}
          onChange={(e) => handlePresetChange(e.target.value as NotificationType)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        >
          {PRESETS.map((p) => (
            <option key={p.type} value={p.type}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* メッセージ */}
      <div>
        <p className="text-xs text-gray-500 mb-1">メッセージ</p>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
          placeholder="通知内容を入力..."
        />
        {previewMessage && (
          <p className="text-xs text-gray-400 mt-1">
            送信: &ldquo;{previewMessage}&rdquo;
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={handleSend}
        disabled={loading || sent}
        className={`w-full py-2 rounded text-sm font-medium text-white transition-colors ${
          sent ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {sent ? '✓ 送信しました' : loading ? '送信中...' : '送信する'}
      </button>
    </div>
  )
}
