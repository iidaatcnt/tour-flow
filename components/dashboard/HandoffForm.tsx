'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHandoff } from '@/lib/actions/handoffs'

type HandoffFormProps = {
  customers: Array<{ id: string; name: string }>
  profiles: Array<{ id: string; name: string }>
  defaultValues?: {
    customer_name?: string
    history?: string
    inquiry_id?: string
  }
}

export function HandoffForm({ customers, profiles, defaultValues }: HandoffFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextAction, setNextAction] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // クライアント側バリデーション
    if (!nextAction.trim()) {
      setError('「次のアクション」は必須です。誰が・何を・いつまでに を記入してください。')
      return
    }

    const form = e.currentTarget
    const fd = new FormData(form)
    setLoading(true)
    setError(null)

    try {
      await createHandoff({
        customer_id: (fd.get('customer_id') as string) || undefined,
        inquiry_id: defaultValues?.inquiry_id || undefined,
        summary: fd.get('summary') as string,
        history: fd.get('history') as string,
        next_action: nextAction,
        status: fd.get('status') as 'urgent' | 'pending',
        to_staff_id: (fd.get('to_staff_id') as string) || undefined,
      })
      router.push('/handoff')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
        <select name="customer_id" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
          <option value="">
            {defaultValues?.customer_name
              ? `${defaultValues.customer_name}（未登録）`
              : '選択してください'}
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">1行サマリー *</label>
        <input
          name="summary"
          required
          className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
          placeholder="例: 山田様 来月予約変更希望"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">対応経緯 *</label>
        <textarea
          name="history"
          required
          rows={3}
          defaultValue={defaultValues?.history}
          className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          次のアクション *
          <span className="text-red-500 ml-1">（必須）</span>
        </label>
        <textarea
          rows={2}
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          required
          className={`w-full border rounded px-3 py-1.5 text-sm ${
            !nextAction.trim() ? 'border-red-300' : 'border-gray-200'
          }`}
          placeholder="例: 田中が明日13時までに予約変更の可否を電話で回答する"
        />
        <p className="text-xs text-gray-400 mt-0.5">誰が・何を・いつまでに</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select name="status" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
            <option value="pending">保留</option>
            <option value="urgent">緊急</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">引き継ぎ先</label>
          <select name="to_staff_id" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
            <option value="">選択してください</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
