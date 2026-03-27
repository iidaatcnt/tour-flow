'use client'

import { useState } from 'react'
import { sendFieldRequest } from '@/lib/actions/field'

export function SosButton() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSos() {
    if (!confirm('緊急事態として報告します。よろしいですか？')) return
    setLoading(true)
    try {
      await sendFieldRequest('sos')
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSos}
      disabled={loading || sent}
      className={`w-full py-5 rounded-xl text-white font-bold text-lg transition-colors ${
        sent
          ? 'bg-gray-400'
          : 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg'
      } disabled:opacity-70`}
    >
      {sent ? '✓ SOS 送信済み' : loading ? '送信中...' : '🆘 SOS（緊急事態）'}
    </button>
  )
}
