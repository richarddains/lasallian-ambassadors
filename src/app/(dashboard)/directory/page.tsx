'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COMMITTEE_INFO: Record<string, { label: string; bg: string; text: string }> = {
  MARKETING_RELATIONS: { label: 'MR', bg: 'bg-amber-100', text: 'text-amber-800' },
  HUMAN_RESOURCE: { label: 'HRMD', bg: 'bg-blue-900', text: 'text-blue-50' },
  DOCUMENTATIONS_PUBLICITY: { label: 'DP', bg: 'bg-pink-100', text: 'text-pink-700' },
  OPERATIONS_FINANCE: { label: 'OF', bg: 'bg-purple-100', text: 'text-purple-700' },
}

const ORDER_LABEL: Record<string, string> = {
  CORE: 'Core',
  ASPIRING_CORE: 'Aspiring Core',
  NON_FIRST_TIMERS: 'Non-First Timers',
  FIRST_TIMERS: 'First Timers',
}

interface Ambassador {
  id: string
  firstName: string
  lastName: string
  email: string
  batch?: number
  order?: string
  role: string
  committee?: string
}

export default function DirectoryPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrder, setFilterOrder] = useState('')
  const [filterRole, setFilterRole] = useState('')

  useEffect(() => {
    fetchAmbassadors()
  }, [])

  const fetchAmbassadors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterOrder) params.append('order', filterOrder)
      if (filterRole) params.append('role', filterRole)

      const response = await fetch(`/api/ambassadors?${params}`)
      const data = await response.json()
      setAmbassadors(Array.isArray(data) ? data : [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-2">
          People
        </span>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tighter">
          Ambassador Directory
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAmbassadors()}
              className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-base text-on-surface placeholder:text-outline/40"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Order
            </label>
            <select
              value={filterOrder}
              onChange={(e) => setFilterOrder(e.target.value)}
              className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-base text-on-surface"
            >
              <option value="">All Orders</option>
              <option value="CORE">Core</option>
              <option value="ASPIRING_CORE">Aspiring Core</option>
              <option value="NON_FIRST_TIMERS">Non-First Timers</option>
              <option value="FIRST_TIMERS">First Timers</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-base text-on-surface"
            >
              <option value="">All Roles</option>
              <option value="AMBASSADOR">Ambassador</option>
              <option value="ASPIRING_CORE">Aspiring Core</option>
              <option value="CORE">Core</option>
            </select>
          </div>
        </div>
        <button
          onClick={fetchAmbassadors}
          className="mt-5 bg-primary text-on-primary px-6 py-2 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 transition-all"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center font-body italic text-on-surface-variant py-12">Loading...</div>
      ) : ambassadors.length === 0 ? (
        <div className="text-center font-body italic text-on-surface-variant py-12">No ambassadors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ambassadors.map((ambassador) => {
            const committee = ambassador.committee ? COMMITTEE_INFO[ambassador.committee] : null
            return (
              <Link key={ambassador.id} href={`/directory/${ambassador.id}`}>
                <div className="bg-surface-container-lowest rounded-xl editorial-shadow hover:shadow-md transition p-6 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-headline font-extrabold text-primary text-lg">
                        {ambassador.firstName[0]}{ambassador.lastName[0]}
                      </span>
                    </div>
                    {committee && (
                      <span className={`text-xs font-label font-bold px-2 py-0.5 rounded-full ${committee.bg} ${committee.text}`}>
                        {committee.label}
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                    {ambassador.firstName} {ambassador.lastName}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant mb-3 truncate">{ambassador.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ambassador.order && (
                      <span className="text-xs font-label font-bold text-primary/80 bg-primary/8 px-2 py-0.5 rounded-full">
                        {ORDER_LABEL[ambassador.order] ?? ambassador.order.replace(/_/g, ' ')}
                      </span>
                    )}
                    {ambassador.batch && (
                      <span className="text-xs font-label text-on-surface-variant">
                        Batch {ambassador.batch}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
