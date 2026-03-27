'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type Customer = Database['public']['Tables']['customers']['Row']

type CustomerListProps = {
  customers: Customer[]
  initialQuery: string
}

const TAG_COLORS: Record<string, string> = {
  repeater: 'bg-blue-100 text-blue-700',
  vip: 'bg-purple-100 text-purple-700',
  caution: 'bg-red-100 text-red-700',
}

const TAG_LABELS: Record<string, string> = {
  repeater: 'リピーター',
  vip: 'VIP',
  caution: '注意',
}

export function CustomerList({ customers, initialQuery }: CustomerListProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setQuery(value)
    startTransition(() => {
      const params = new URLSearchParams()
      if (value) params.set('q', value)
      router.push(`/customers?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="氏名・フリガナ・電話・メールで検索"
          className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm"
        />
        <Link
          href="/customers/new"
          className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          新規登録
        </Link>
      </div>

      {isPending && (
        <p className="text-xs text-gray-400">検索中...</p>
      )}

      {customers.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">顧客が見つかりません</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/customers/${customer.id}`}
                className="block bg-white rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      {customer.name_kana && (
                        <p className="text-xs text-gray-500">{customer.name_kana}</p>
                      )}
                      {customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-1.5 py-0.5 rounded ${TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {TAG_LABELS[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {customer.phone && <span className="mr-3">{customer.phone}</span>}
                      {customer.email && <span>{customer.email}</span>}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{customer.tour_count}回参加</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
