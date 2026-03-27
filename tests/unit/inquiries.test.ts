import { describe, it, expect } from 'vitest'
import { sortInquiries } from '@/components/dashboard/InquiryList'
import type { Database } from '@/lib/supabase/types'

type Inquiry = Database['public']['Tables']['inquiries']['Row']

function makeInquiry(overrides: Partial<Inquiry>): Inquiry {
  return {
    id: 'test-id',
    received_at: new Date().toISOString(),
    channel: 'phone',
    customer_id: null,
    customer_name: 'テスト顧客',
    phone: null,
    email: null,
    category: 'other',
    content: 'テスト内容',
    urgency: 'today',
    status: 'new',
    assigned_to: null,
    nutmeg_required: false,
    resolved_at: null,
    created_by: null,
    ...overrides,
  }
}

describe('sortInquiries', () => {
  it('channel=callback かつ status=new の案件はリスト上部に来る', () => {
    const inquiries: Inquiry[] = [
      makeInquiry({ id: '1', channel: 'phone', status: 'new' }),
      makeInquiry({ id: '2', channel: 'email', status: 'in_progress' }),
      makeInquiry({ id: '3', channel: 'callback', status: 'new' }),
      makeInquiry({ id: '4', channel: 'web', status: 'new' }),
    ]

    const sorted = sortInquiries(inquiries)

    expect(sorted[0].id).toBe('3')
    expect(sorted[0].channel).toBe('callback')
    expect(sorted[0].status).toBe('new')
  })

  it('callback でも done ステータスは上部固定しない', () => {
    const inquiries: Inquiry[] = [
      makeInquiry({ id: '1', channel: 'phone', status: 'new' }),
      makeInquiry({ id: '2', channel: 'callback', status: 'done' }),
      makeInquiry({ id: '3', channel: 'callback', status: 'new' }),
    ]

    const sorted = sortInquiries(inquiries)

    expect(sorted[0].id).toBe('3')
    expect(sorted[0].channel).toBe('callback')
    expect(sorted[0].status).toBe('new')
  })

  it('上部固定対象がない場合は元の順序を保つ', () => {
    const inquiries: Inquiry[] = [
      makeInquiry({ id: '1', channel: 'phone', status: 'new' }),
      makeInquiry({ id: '2', channel: 'email', status: 'in_progress' }),
    ]

    const sorted = sortInquiries(inquiries)

    expect(sorted[0].id).toBe('1')
    expect(sorted[1].id).toBe('2')
  })
})
