'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer } from '@/lib/actions/customers'

export function CustomerForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)

    try {
      await createCustomer({
        name: fd.get('name') as string,
        name_kana: (fd.get('name_kana') as string) || undefined,
        phone: (fd.get('phone') as string) || undefined,
        email: (fd.get('email') as string) || undefined,
        notes: (fd.get('notes') as string) || undefined,
      })
      router.push('/customers')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
        <input name="name" required className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label>
        <input name="name_kana" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
        <input name="phone" type="tel" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input name="email" type="email" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
        <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録する'}
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
