'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

type TeamStatusBarProps = {
  profiles: Profile[]
}

const STATUS_LABELS: Record<Profile['status'], string> = {
  tour: 'ツアー中',
  office: 'オフィス',
  break: '休憩',
}

const STATUS_COLORS: Record<Profile['status'], string> = {
  tour: 'bg-green-100 text-green-700',
  office: 'bg-blue-100 text-blue-700',
  break: 'bg-gray-100 text-gray-500',
}

export function TeamStatusBar({ profiles: initialProfiles }: TeamStatusBarProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('profiles-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, ...(payload.new as Profile) } : p
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">チーム状況</h2>
      <div className="space-y-2">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {profile.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-800">{profile.name}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[profile.status]}`}>
              {STATUS_LABELS[profile.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
