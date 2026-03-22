'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Registration {
  id: string
  volunteerType: string
  registeredAt: string
  cancellationReason: string | null
  cancellationRequestedAt: string | null
  event: { id: string; title: string; startTime: string; location: string; status: string }
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  // Map of registrationId → draft reason text for the inline form
  const [openRequest, setOpenRequest] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/registrations')
      .then((r) => r.json())
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openForm = (id: string) => {
    setOpenRequest(id)
    setReason('')
    setError('')
  }

  const cancelForm = () => {
    setOpenRequest(null)
    setReason('')
    setError('')
  }

  const handleSubmitRequest = async (id: string) => {
    if (!reason.trim()) { setError('Please provide a reason.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason }),
      })
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, cancellationReason: reason, cancellationRequestedAt: new Date().toISOString() }
              : r
          )
        )
        cancelForm()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit request.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-2">
          My Activity
        </span>
        <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter">
          My Sign-ups
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-outline-variant">hourglass_empty</span>
        </div>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">how_to_reg</span>
          <p className="font-headline font-bold text-on-surface-variant text-lg">No sign-ups yet</p>
          <p className="font-body italic text-on-surface-variant text-sm mt-1">Browse events and register to get started.</p>
          <Link href="/events" className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:opacity-90 transition-all">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const hasPendingRequest = !!reg.cancellationRequestedAt
            const isOpen = openRequest === reg.id

            return (
              <div
                key={reg.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                  hasPendingRequest ? 'border-error/20' : 'border-slate-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/events/${reg.event.id}`} className="font-headline font-bold text-lg text-on-surface hover:text-primary transition-colors">
                        {reg.event.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 mt-2 font-label text-xs font-medium text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {reg.event.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          {new Date(reg.event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">badge</span>
                          {reg.volunteerType === 'LAMB' ? 'LAmb' : 'DocuLAmb'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {hasPendingRequest ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-error-container text-on-error-container rounded-full font-label text-[10px] font-bold uppercase tracking-widest">
                          <span className="material-symbols-outlined text-sm">pending_actions</span>
                          Removal Requested
                        </span>
                      ) : (
                        reg.event.status === 'PUBLISHED' && (
                          <button
                            onClick={() => openForm(reg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-500 hover:border-error/40 hover:text-red-500 hover:bg-red-50 rounded-full font-label text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Request Removal
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Pending request note */}
                  {hasPendingRequest && reg.cancellationReason && (
                    <div className="mt-4 bg-error-container/30 border border-error/10 rounded-lg px-4 py-3">
                      <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-error-container mb-1">Your reason</p>
                      <p className="font-body italic text-sm text-on-surface-variant">"{reg.cancellationReason}"</p>
                      <p className="font-label text-[9px] text-slate-400 mt-1">
                        Submitted {new Date(reg.cancellationRequestedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Your coordinator will review this.
                      </p>
                    </div>
                  )}
                </div>

                {/* Inline removal request form */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="font-label font-bold text-sm text-on-surface mb-3">
                      Why do you need to remove your sign-up?
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Briefly explain your reason..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    {error && (
                      <p className="font-label text-xs text-error mt-2">{error}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSubmitRequest(reg.id)}
                        disabled={submitting}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:opacity-90 disabled:opacity-50 transition-all"
                      >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                      <button
                        onClick={cancelForm}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg font-label font-bold text-sm uppercase tracking-tight transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
