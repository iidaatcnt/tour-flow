'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInquiry } from '@/lib/actions/inquiries'

export function InquiryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    setLoading(true)
    setError(null)

    try {
      await createInquiry({
        channel: fd.get('channel') as 'phone' | 'email' | 'callback' | 'web',
        customer_name: fd.get('customer_name') as string,
        phone: (fd.get('phone') as string) || undefined,
        email: (fd.get('email') as string) || undefined,
        category: fd.get('category') as 'new_booking' | 'change' | 'cancel' | 'clothes' | 'photo' | 'other',
        content: fd.get('content') as string,
        urgency: fd.get('urgency') as 'immediate' | 'today' | 'later',
      })
      router.push('/inquiries')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '起票に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顧客名 *</label>
          <input
            name="customer_name"
            required
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">チャネル *</label>
          <select name="channel" required className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
            <option value="phone">電話</option>
            <option value="email">メール</option>
            <option value="callback">折り返し電話</option>
            <option value="web">Webフォーム</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input name="phone" type="tel" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
          <input name="email" type="email" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
          <select name="category" required className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
            <option value="new_booking">新規予約</option>
            <option value="change">変更</option>
            <option value="cancel">キャンセル</option>
            <option value="clothes">服装・持ち物</option>
            <option value="photo">写真</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">緊急度 *</label>
          <select name="urgency" required className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
            <option value="immediate">至急</option>
            <option value="today">本日中</option>
            <option value="later">後日</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">問い合わせ内容 *</label>
        <textarea
          name="content"
          required
          rows={4}
          className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '起票する'}
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
