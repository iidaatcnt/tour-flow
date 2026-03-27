'use client'

import { useState } from 'react'
import { sendFieldRequest } from '@/lib/actions/field'

type RequestType = 'availability' | 'callback' | 'booking_check' | 'urgent' | 'sos'

const BUTTONS: Array<{ type: RequestType; label: string; color: string }> = [
  { type: 'availability', label: '空き状況を確認してほしい', color: 'bg-blue-500 hover:bg-blue-600' },
  { type: 'callback', label: '折り返しをオフィスに任せたい', color: 'bg-purple-500 hover:bg-purple-600' },
  { type: 'booking_check', label: '予約内容を確認してほしい', color: 'bg-indigo-500 hover:bg-indigo-600' },
  { type: 'urgent', label: '急ぎの対応をお願いしたい', color: 'bg-orange-500 hover:bg-orange-600' },
]

export function OneTabRequestButtons() {
  const [loading, setLoading] = useState<RequestType | null>(null)
  const [sent, setSent] = useState<RequestType | null>(null)

  async function handleRequest(type: RequestType) {
    setLoading(type)
    try {
      await sendFieldRequest(type)
      setSent(type)
      setTimeout(() => setSent(null), 3000)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">ワンタップ送信</h2>
      {BUTTONS.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => handleRequest(type)}
          disabled={loading !== null}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            sent === type ? 'bg-green-500' : color
          }`}
        >
          {sent === type ? '✓ 送信しました' : loading === type ? '送信中...' : label}
        </button>
      ))}
    </div>
  )
}
