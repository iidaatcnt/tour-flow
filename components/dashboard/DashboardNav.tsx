'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateUserStatus } from '@/lib/actions/profiles'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

type DashboardNavProps = {
  profile: Profile | null
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/inquiries', label: '問い合わせ' },
  { href: '/tours', label: 'ツアー' },
  { href: '/photos', label: '写真送付' },
  { href: '/handoff', label: '引き継ぎ' },
  { href: '/customers', label: '顧客リスト' },
  { href: '/field', label: 'フィールド' },
]

export function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [status, setStatus] = useState<Profile['status']>(profile?.status ?? 'office')
  const [updating, setUpdating] = useState(false)

  async function handleStatusChange(newStatus: Profile['status']) {
    setUpdating(true)
    try {
      await updateUserStatus(newStatus)
      setStatus(newStatus)
    } catch {
      // 更新失敗時は元に戻す
    } finally {
      setUpdating(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statusLabels: Record<Profile['status'], string> = {
    tour: 'ツアー中',
    office: 'オフィス',
    break: '休憩中',
  }

  const statusColors: Record<Profile['status'], string> = {
    tour: 'bg-green-100 text-green-800',
    office: 'bg-blue-100 text-blue-800',
    break: 'bg-gray-100 text-gray-800',
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-green-700">カヌーCRM</span>
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    pathname === href
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{profile.name}</span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as Profile['status'])}
                  disabled={updating}
                  className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusColors[status]}`}
                >
                  <option value="tour">ツアー中</option>
                  <option value="office">オフィス</option>
                  <option value="break">休憩中</option>
                </select>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* フィールド案内バナー */}
        {status === 'tour' && (
          <div className="py-2 bg-green-50 border-t border-green-100 -mx-4 px-4">
            <p className="text-sm text-green-700">
              ツアー中モードです。
              <Link href="/field" className="underline font-medium ml-1">
                フィールド画面を開く →
              </Link>
            </p>
          </div>
        )}
      </div>
    </nav>
  )
}
