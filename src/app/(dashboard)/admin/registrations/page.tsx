'use client'

import { useEffect, useState } from 'react'

interface Registration {
  id: string
  volunteerType: string
  registeredAt: string
  cancellationReason: string | null
  cancellationRequestedAt: string | null
  profile: { id: string; firstName: string; lastName: string; email: string }
  event: { id: string; title: string; startTime: string }
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'removal'>('all')
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/registrations')
      .then((r) => r.json())
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this sign-up? This cannot be undone.')) return
    setRemoving(id)
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' })
      if (res.ok) setRegistrations((prev) => prev.filter((r) => r.id !== id))
    } catch {
      console.error('Failed to remove')
    } finally {
      setRemoving(null)
    }
  }

  const displayed = filter === 'removal'
    ? registrations.filter((r) => r.cancellationRequestedAt)
    : registrations

  const removalCount = registrations.filter((r) => r.cancellationRequestedAt).length

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-2">
            Management
          </span>
          <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter">
            Sign-ups
          </h1>
        </div>
        {removalCount > 0 && (
          <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-2 rounded-lg font-label font-bold text-sm">
            <span className="material-symbols-outlined text-base">pending_actions</span>
            {removalCount} removal {removalCount === 1 ? 'request' : 'requests'}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            filter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Sign-ups
        </button>
        <button
          onClick={() => setFilter('removal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            filter === 'removal'
              ? 'bg-error-container text-on-error-container'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Removal Requests
          {removalCount > 0 && (
            <span className="bg-error text-on-error text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {removalCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">hourglass_empty</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">how_to_reg</span>
          <p className="font-headline font-bold text-on-surface-variant">
            {filter === 'removal' ? 'No removal requests' : 'No sign-ups yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((reg) => (
            <div
              key={reg.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${
                reg.cancellationRequestedAt
                  ? 'border-error/30 bg-error-container/10'
                  : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-on-primary text-sm flex-shrink-0">
                    {reg.profile.firstName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-label font-bold text-sm text-on-surface">
                      {reg.profile.firstName} {reg.profile.lastName}
                    </p>
                    <p className="font-label text-xs text-slate-400">{reg.profile.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="font-label text-xs font-medium text-on-surface-variant truncate">
                        {reg.event.title}
                      </span>
                      <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {reg.volunteerType === 'LAMB' ? 'LAmb' : 'DocuLAmb'}
                      </span>
                      <span className="font-label text-[10px] text-slate-400">
                        Signed up {new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {reg.cancellationRequestedAt && reg.cancellationReason && (
                      <div className="mt-3 bg-error-container/40 border border-error/20 rounded-lg px-4 py-3">
                        <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-error-container mb-1">
                          Removal Request · {new Date(reg.cancellationRequestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="font-body italic text-sm text-on-surface-variant">
                          "{reg.cancellationReason}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(reg.id)}
                  disabled={removing === reg.id}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-label font-bold text-xs text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors uppercase tracking-tight"
                >
                  <span className="material-symbols-outlined text-base">person_remove</span>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
