'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const COMMITTEE_INFO: Record<string, { label: string; bg: string; text: string }> = {
  MARKETING_RELATIONS: {
    label: 'Marketing and Relations',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
  HUMAN_RESOURCE: {
    label: 'Human Resource Management and Development',
    bg: 'bg-blue-900',
    text: 'text-blue-50',
  },
  DOCUMENTATIONS_PUBLICITY: {
    label: 'Documentations and Publicity',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
  },
  OPERATIONS_FINANCE: {
    label: 'Operations and Finance',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
}

const ORDER_LABEL: Record<string, string> = {
  CORE: 'Core',
  ASPIRING_CORE: 'Aspiring Core',
  NON_FIRST_TIMERS: 'Non-First Timers',
  FIRST_TIMERS: 'First Timers',
}

const ROLE_LABEL: Record<string, string> = {
  AMBASSADOR: 'Lasallian Ambassador',
  ASPIRING_CORE: 'Aspiring Core',
  CORE: 'Core',
}

interface AmbassadorProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  batch?: number
  order?: string
  role: string
  committee?: string
  avatarUrl?: string
}

export default function AmbassadorDetailPage() {
  const params = useParams()
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/ambassadors/${params.id}`)
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
          <p className="font-body italic text-on-surface-variant text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-xl">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
          <p className="font-body italic text-on-surface-variant text-sm">Ambassador not found.</p>
        </div>
      </div>
    )
  }

  const committee = profile.committee ? COMMITTEE_INFO[profile.committee] : null

  return (
    <div className="max-w-xl">
      <Link
        href="/directory"
        className="inline-flex items-center gap-1.5 font-label font-bold text-sm text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Directory
      </Link>

      <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
        {/* Header */}
        <div className="bg-primary/8 px-8 pt-8 pb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="font-headline font-extrabold text-primary text-2xl">
              {profile.firstName[0]}{profile.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tighter">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="font-body text-sm text-on-surface-variant truncate">{profile.email}</p>
            {committee && (
              <span className={`mt-2 inline-block text-xs font-label font-bold px-2.5 py-1 rounded-full ${committee.bg} ${committee.text}`}>
                {committee.label}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Role
              </p>
              <p className="font-headline font-bold text-on-surface text-sm">
                {ROLE_LABEL[profile.role] ?? profile.role}
              </p>
            </div>
            {profile.order && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Order
                </p>
                <p className="font-headline font-bold text-primary text-sm">
                  {ORDER_LABEL[profile.order] ?? profile.order.replace(/_/g, ' ')}
                </p>
              </div>
            )}
            {profile.batch && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Batch
                </p>
                <p className="font-headline font-bold text-on-surface text-sm">{profile.batch}</p>
              </div>
            )}
          </div>

          {profile.bio && (
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                About
              </p>
              <p className="font-body italic text-on-surface text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
