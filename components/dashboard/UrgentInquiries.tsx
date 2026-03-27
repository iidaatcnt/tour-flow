'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Inquiry = Database['public']['Tables']['inquiries']['Row']

type UrgentInquiriesProps = {
  inquiries: Inquiry[]
}

export function UrgentInquiries({ inquiries: initialInquiries }: UrgentInquiriesProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('urgent-inquiries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        async () => {
          const { data } = await supabase
            .from('inquiries')
            .select('*')
            .eq('channel', 'callback')
            .eq('status', 'new')
            .order('received_at')
          if (data) setInquiries(data)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (inquiries.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          要対応
        </span>
        <h2 className="text-sm font-semibold text-red-700">
          折り返し電話 未対応 ({inquiries.length}件)
        </h2>
      </div>
      <ul className="space-y-2">
        {inquiries.map((inquiry) => (
          <li key={inquiry.id}>
            <Link
              href={`/inquiries/${inquiry.id}`}
              className="flex items-center justify-between p-2 bg-white rounded border border-red-100 hover:border-red-300"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{inquiry.customer_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{inquiry.content.slice(0, 60)}...</p>
              </div>
              <span className="text-xs text-red-600">
                {new Date(inquiry.received_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
