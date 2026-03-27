'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completeHandoff } from '@/lib/actions/handoffs'
import type { Database } from '@/lib/supabase/types'

type Handoff = Database['public']['Tables']['handoffs']['Row']

type HandoffListProps = {
  handoffs: Handoff[]
}

const STATUS_STYLES: Record<Handoff['status'], string> = {
  urgent: 'border-l-4 border-l-red-500',
  pending: 'border-l-4 border-l-amber-400',
  done: 'border-l-4 border-l-gray-200 opacity-60',
}

const STATUS_LABELS: Record<Handoff['status'], string> = {
  urgent: '緊急',
  pending: '保留',
  done: '完了',
}

export function HandoffList({ handoffs: initialHandoffs }: HandoffListProps) {
  const [handoffs, setHandoffs] = useState<Handoff[]>(initialHandoffs)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleComplete(id: string) {
    setLoading(id)
    try {
      const updated = await completeHandoff(id)
      setHandoffs((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: updated.status } : h))
      )
    } finally {
      setLoading(null)
    }
  }

  const active = handoffs.filter((h) => h.status !== 'done')
  const done = handoffs.filter((h) => h.status === 'done')
  const sorted = [
    ...active.filter((h) => h.status === 'urgent'),
    ...active.filter((h) => h.status === 'pending'),
    ...done,
  ]

  return (
    <div className="space-y-3">
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">引き継ぎノートはありません</p>
      ) : (
        sorted.map((handoff) => (
          <div
            key={handoff.id}
            className={`bg-white rounded-lg border border-gray-100 p-4 ${STATUS_STYLES[handoff.status]}`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    handoff.status === 'urgent' ? 'bg-red-100 text-red-700' :
                    handoff.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {STATUS_LABELS[handoff.status]}
                  </span>
                  <p className="text-sm font-medium text-gray-900 truncate">{handoff.summary}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{handoff.next_action}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(handoff.created_at).toLocaleString('ja-JP')}
                </p>
              </div>
              {handoff.status !== 'done' && (
                <button
                  onClick={() => handleComplete(handoff.id)}
                  disabled={loading === handoff.id}
                  className="ml-3 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
                >
                  完了にする
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
