'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MyRegistration {
  id: string
  status: string
  volunteerType: string | null
}

interface Event {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  status: string
  eventType: string
  slots?: number
  lambSlots?: number
  docuLambSlots?: number
  lambApproved: number
  docuLambApproved: number
  waitlistedCount: number
  attire?: string | null
  registrationsCount: number
  myRegistration: MyRegistration | null
  aic?: { id: string; firstName: string; lastName: string } | null
}

const EVENT_TYPE_STYLES: Record<string, { label: string; pill: string }> = {
  ADMIN_REQUEST: { label: 'Admin Request', pill: 'bg-emerald-700/40 text-emerald-100' },
  LAMB_MODULE:   { label: 'LAmb Module',   pill: 'bg-yellow-500/30 text-yellow-100' },
  LAMB_EVENT:    { label: 'LAmb Event',    pill: 'bg-teal-500/30 text-teal-100' },
  MAJOR_EVENT:   { label: 'Major Event',   pill: 'bg-violet-500/30 text-violet-100' },
}

interface Profile {
  role: string
}

interface AttendanceRow {
  id: string
  volunteerType: string
  attendance: string | null
  profile: { id: string; firstName: string; lastName: string; email: string }
}

const ATTENDANCE_STYLES: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  PRESENT:  { label: 'Present',  bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'check_circle' },
  ABSENT:   { label: 'Absent',   bg: 'bg-red-100',     text: 'text-red-700',     icon: 'cancel' },
  EXCUSED:  { label: 'Excused',  bg: 'bg-amber-100',   text: 'text-amber-800',   icon: 'info' },
}

const ATTIRE_INFO: Record<string, { label: string; items: string[]; note: string }> = {
  DAY1_UNIFORM: {
    label: 'Day 1 Uniform',
    items: ['White DLSU/LAmb Shirt', 'Blue or black denim pants', 'LAmbyard', 'Sneakers'],
    note: 'Ambassadors are expected to wear their white DLSU/LAmb shirt paired with blue or black denim pants. Make sure to bring your LAmbyard and wear clean sneakers.',
  },
  DAY2_UNIFORM: {
    label: 'Day 2 Uniform',
    items: ['Green DLSU/LAmb Shirt', 'Blue or black denim pants', 'LAmbyard', 'Sneakers'],
    note: 'Ambassadors are expected to wear their green DLSU/LAmb shirt paired with blue or black denim pants. Make sure to bring your LAmbyard and wear clean sneakers.',
  },
  USHERING_ATTIRE: {
    label: 'Ushering Attire',
    items: ['White long sleeve polo', 'Black trousers/slacks', 'LAmbyard', 'Black shoes'],
    note: 'Ambassadors must wear a white long sleeve polo tucked in with black trousers or slacks. Bring your LAmbyard and wear formal black shoes. Smart and presentable appearance is required.',
  },
  GAWAD_LASALYANO: {
    label: 'Gawad Lasalyano Attire',
    items: ['Top provided by LAmb', 'Black trousers/slacks', 'Black shoes'],
    note: 'The top for this event will be provided by LAmb — no need to prepare one. Pair it with black trousers or slacks and formal black shoes. Further details on the top will be coordinated separately.',
  },
}

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'bg-emerald-400 text-emerald-950',
  DRAFT:     'bg-tertiary-fixed text-on-tertiary-fixed',
  CANCELLED: 'bg-error-container text-on-error-container',
  COMPLETED: 'bg-surface-container-highest text-on-surface-variant',
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [myRegistration, setMyRegistration] = useState<MyRegistration | null>(null)
  const [registering, setRegistering] = useState(false)
  const [volunteerType, setVolunteerType] = useState<'LAMB' | 'DOCULAMB'>('LAMB')
  const [actionLoading, setActionLoading] = useState(false)
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, profileRes] = await Promise.all([
          fetch(`/api/events/${params.id}`),
          fetch('/api/profile'),
        ])
        const [eventData, profileData] = await Promise.all([
          eventRes.json(),
          profileRes.json(),
        ])
        setEvent(eventData)
        setProfile(profileData)
        setMyRegistration(eventData.myRegistration ?? null)

        // Fetch attendance rows if event is completed and user is Core/Aspiring Core
        if (
          eventData.status === 'COMPLETED' &&
          ['ASPIRING_CORE', 'CORE'].includes(profileData.role)
        ) {
          const regRes = await fetch(`/api/admin/registrations?eventId=${params.id}`)
          const regData = await regRes.json()
          setAttendanceRows(Array.isArray(regData) ? regData : [])
        }
      } catch (error) {
        console.error('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchData()
  }, [params.id])

  const handleAttendance = async (regId: string, attendance: string | null) => {
    setAttendanceLoading(true)
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance }),
      })
      if (res.ok) {
        setAttendanceRows((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, attendance } : r))
        )
      }
    } catch {
      console.error('Failed to update attendance')
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event) return
    setRegistering(true)
    try {
      const body: Record<string, string> = { eventId: event.id }
      if (event.eventType !== 'LAMB_EVENT') body.volunteerType = volunteerType
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data: MyRegistration = await res.json()
        setMyRegistration(data)
        // Update local counts optimistically
        setEvent((prev) => {
          if (!prev) return prev
          if (data.status === 'APPROVED') {
            if (data.volunteerType === 'LAMB') return { ...prev, lambApproved: prev.lambApproved + 1 }
            if (data.volunteerType === 'DOCULAMB') return { ...prev, docuLambApproved: prev.docuLambApproved + 1 }
          } else {
            return { ...prev, waitlistedCount: prev.waitlistedCount + 1 }
          }
          return prev
        })
      }
    } catch {
      console.error('Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!event) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setEvent({ ...event, status })
    } catch {
      console.error('Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !confirm('Delete this event? This cannot be undone.')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/events')
    } catch {
      console.error('Failed to delete event')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">hourglass_empty</span>
          <p className="font-body italic text-on-surface-variant">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">event_busy</span>
          <p className="font-headline font-bold text-on-surface-variant text-lg">Event not found</p>
        </div>
      </div>
    )
  }

  const isCoordinator = profile && ['ASPIRING_CORE', 'CORE'].includes(profile.role)

  const dateLabel = event.startTime
    ? new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—'
  const timeLabel = event.startTime && event.endTime
    ? `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '—'

  return (
    <div className="-mx-8 -mt-8">
      {/* Hero */}
      <section className="relative h-80 w-full flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #00552c 0%, #00703c 100%)' }} />
        <div className="relative z-10 w-full px-10 pb-10">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-emerald-200/70 hover:text-white font-label font-bold text-xs uppercase tracking-widest transition-colors mb-5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Events
          </Link>

          <div className="flex items-center gap-2 mb-3">
            {event.eventType && EVENT_TYPE_STYLES[event.eventType] && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-label ${EVENT_TYPE_STYLES[event.eventType].pill}`}>
                {EVENT_TYPE_STYLES[event.eventType].label}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-label ${STATUS_BADGE[event.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
              {event.status}
            </span>
          </div>

          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-white tracking-tight leading-tight max-w-3xl mb-5">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-emerald-100/80 font-label text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 text-base">calendar_today</span>
              {dateLabel}
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 text-base">schedule</span>
              {timeLabel}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-12">

          {/* Meta bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5 font-label">HQ</p>
                <p className="font-headline font-bold text-on-surface">{event.location}</p>
              </div>
            </div>

            {event.aic && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">star</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-0.5 font-label">AIC</p>
                  <p className="font-headline font-bold text-on-surface">{event.aic.firstName} {event.aic.lastName}</p>
                </div>
              </div>
            )}

            {event.status === 'PUBLISHED' && event.attire && ATTIRE_INFO[event.attire] && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">checkroom</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5 font-label">Dress Code</p>
                  <p className="font-headline font-bold text-on-surface">{ATTIRE_INFO[event.attire].label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attire note */}
          {event.status === 'PUBLISHED' && event.attire && ATTIRE_INFO[event.attire] && (
            <div className="bg-tertiary-fixed/50 border border-tertiary-fixed rounded-xl p-5 flex gap-4">
              <span className="material-symbols-outlined text-tertiary mt-0.5 flex-shrink-0">info</span>
              <div>
                <p className="font-label font-bold text-sm text-on-surface mb-1.5">Attire Note</p>
                <p className="font-body italic text-sm text-on-surface-variant leading-relaxed">
                  {ATTIRE_INFO[event.attire].note}
                </p>
              </div>
            </div>
          )}

          {/* About */}
          <section>
            <h2 className="font-headline font-extrabold text-2xl text-emerald-900 mb-6 border-l-4 border-emerald-700 pl-5">
              About this Event
            </h2>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {/* Slot availability */}
          {(event.lambSlots != null || event.docuLambSlots != null || event.slots != null) && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline font-extrabold text-2xl text-emerald-900">
                  Slot Availability
                </h2>
                {event.waitlistedCount > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-label text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {event.waitlistedCount} on waitlist
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {event.lambSlots != null && (() => {
                  const filled = event.lambApproved ?? 0
                  const total = event.lambSlots
                  const left = Math.max(0, total - filled)
                  const pct = Math.min(100, (filled / total) * 100)
                  const isFull = left === 0
                  const isSelected = volunteerType === 'LAMB' && !isCoordinator && !myRegistration && event.status === 'PUBLISHED'
                  return (
                    <button
                      onClick={() => { if (event.status === 'PUBLISHED' && !isCoordinator && !myRegistration) setVolunteerType('LAMB') }}
                      className={`w-full flex items-center justify-between p-5 rounded-xl transition-all group ${
                        isSelected ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-100 text-emerald-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className={`text-center px-4 py-2 rounded-lg min-w-[60px] flex-shrink-0 ${isSelected ? 'bg-white/15' : isFull ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <p className={`text-3xl font-headline font-black leading-none ${isSelected ? 'text-white' : isFull ? 'text-red-500' : 'text-emerald-800'}`}>
                            {String(left).padStart(2, '0')}
                          </p>
                          <p className={`text-[9px] font-bold uppercase tracking-tighter font-label mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>Left</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-headline font-bold text-xl uppercase tracking-tight">LAmb</h3>
                            <span className={`font-label text-xs ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>{filled} / {total} filled</span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${isSelected ? 'bg-white' : isFull ? 'bg-red-400' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {isFull && !isSelected && (
                            <p className="font-label text-[10px] text-red-500 mt-1 font-bold">Full · joining adds you to waitlist</p>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform ml-3 flex-shrink-0">arrow_forward_ios</span>
                    </button>
                  )
                })()}

                {event.docuLambSlots != null && (() => {
                  const filled = event.docuLambApproved ?? 0
                  const total = event.docuLambSlots!
                  const left = Math.max(0, total - filled)
                  const pct = Math.min(100, (filled / total) * 100)
                  const isFull = left === 0
                  const isSelected = volunteerType === 'DOCULAMB' && !isCoordinator && !myRegistration && event.status === 'PUBLISHED'
                  return (
                    <button
                      onClick={() => { if (event.status === 'PUBLISHED' && !isCoordinator && !myRegistration) setVolunteerType('DOCULAMB') }}
                      className={`w-full flex items-center justify-between p-5 rounded-xl transition-all group ${
                        isSelected ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-100 text-emerald-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className={`text-center px-4 py-2 rounded-lg min-w-[60px] flex-shrink-0 ${isSelected ? 'bg-white/15' : isFull ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <p className={`text-3xl font-headline font-black leading-none ${isSelected ? 'text-white' : isFull ? 'text-red-500' : 'text-emerald-800'}`}>
                            {String(left).padStart(2, '0')}
                          </p>
                          <p className={`text-[9px] font-bold uppercase tracking-tighter font-label mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>Left</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-headline font-bold text-xl uppercase tracking-tight">DocuLAmb</h3>
                            <span className={`font-label text-xs ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>{filled} / {total} filled</span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${isSelected ? 'bg-white' : isFull ? 'bg-red-400' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {isFull && !isSelected && (
                            <p className="font-label text-[10px] text-red-500 mt-1 font-bold">Full · joining adds you to waitlist</p>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform ml-3 flex-shrink-0">arrow_forward_ios</span>
                    </button>
                  )
                })()}

                {/* LAMB_EVENT total slots */}
                {event.slots != null && event.lambSlots == null && event.docuLambSlots == null && (() => {
                  const filled = (event.registrationsCount ?? 0) - (event.waitlistedCount ?? 0)
                  const total = event.slots
                  const left = Math.max(0, total - filled)
                  const pct = Math.min(100, (filled / total) * 100)
                  const isFull = left === 0
                  return (
                    <div className="bg-white border border-slate-100 p-5 rounded-xl">
                      <div className="flex items-center gap-5">
                        <div className={`text-center px-4 py-2 rounded-lg min-w-[60px] flex-shrink-0 ${isFull ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <p className={`text-3xl font-headline font-black leading-none ${isFull ? 'text-red-500' : 'text-emerald-800'}`}>
                            {String(left).padStart(2, '0')}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-tighter font-label mt-0.5 text-slate-400">Left</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-headline font-bold text-xl uppercase tracking-tight text-emerald-900">Total Slots</h3>
                            <span className="font-label text-xs text-slate-400">{filled} / {total} filled</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {isFull && (
                            <p className="font-label text-[10px] text-red-500 mt-1 font-bold">Full · pre-registering adds you to waitlist</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </section>
          )}
          {/* Attendance — Core/Aspiring Core only, completed events */}
          {event.status === 'COMPLETED' && isCoordinator && (
            <section>
              <h2 className="font-headline font-extrabold text-2xl text-emerald-900 mb-5 border-l-4 border-emerald-700 pl-5">
                Attendance
              </h2>
              {attendanceRows.length === 0 ? (
                <p className="font-body italic text-on-surface-variant text-sm">No sign-ups for this event.</p>
              ) : (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest text-slate-400">Ambassador</th>
                        <th className="text-left px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                        <th className="text-left px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest text-slate-400">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendanceRows.map((row) => {
                        const att = row.attendance ? ATTENDANCE_STYLES[row.attendance] : null
                        return (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-headline font-bold text-on-surface text-sm">
                                {row.profile.firstName} {row.profile.lastName}
                              </p>
                              <p className="font-label text-[10px] text-slate-400">{row.profile.email}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-label text-xs font-bold text-primary/70">
                                {row.volunteerType === 'LAMB' ? 'LAmb' : row.volunteerType === 'DOCULAMB' ? 'DocuLAmb' : '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                {att && (
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-label font-bold px-2 py-0.5 rounded-full ${att.bg} ${att.text}`}>
                                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{att.icon}</span>
                                    {att.label}
                                  </span>
                                )}
                                <select
                                  value={row.attendance ?? ''}
                                  onChange={(e) => handleAttendance(row.id, e.target.value || null)}
                                  disabled={attendanceLoading}
                                  className="text-xs font-label font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                >
                                  <option value="">Not marked</option>
                                  <option value="PRESENT">Present</option>
                                  <option value="ABSENT">Absent</option>
                                  <option value="EXCUSED">Excused</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right sticky column */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">

            {/* Coordinator actions */}
            {isCoordinator && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Event Management
                </p>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-on-surface rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Event
                </Link>

                {event.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('PUBLISHED')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">publish</span>
                    Publish
                  </button>
                )}

                {event.status === 'PUBLISHED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">task_alt</span>
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-error-container text-on-error-container rounded-lg font-label font-bold text-sm uppercase tracking-tight hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      Cancel Event
                    </button>
                  </>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg font-label font-bold text-sm uppercase tracking-tight disabled:opacity-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete Event
                  </button>
                </div>
              </div>
            )}

            {/* Registration card — varies by event type */}
            {!isCoordinator && event.eventType !== 'LAMB_MODULE' && event.status === 'PUBLISHED' && (
              <div className="bg-emerald-950 text-white p-7 rounded-2xl shadow-xl shadow-emerald-900/10">
                <h3 className="font-headline font-bold text-xl mb-6">
                  {event.eventType === 'LAMB_EVENT' ? 'Pre-Registration' : 'Sign Up'}
                </h3>

                <div className="space-y-4 mb-7 text-sm">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-emerald-100/60 font-label">Date</span>
                    <span className="font-bold font-label text-right text-xs">{dateLabel}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-emerald-100/60 font-label">Time</span>
                    <span className="font-bold font-label">{timeLabel}</span>
                  </div>
                  {event.eventType !== 'LAMB_EVENT' && !myRegistration && (
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-100/60 font-label">Signing up as</span>
                      <span className="font-bold font-label">{volunteerType === 'LAMB' ? 'LAmb' : 'DocuLAmb'}</span>
                    </div>
                  )}
                </div>

                {!myRegistration ? (
                  <>
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-headline font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                      {registering
                        ? 'Submitting...'
                        : event.eventType === 'LAMB_EVENT'
                        ? 'Pre-Register'
                        : 'Register Now'}
                    </button>
                    {event.eventType !== 'LAMB_EVENT' && (
                      <p className="text-center text-[9px] mt-3 opacity-40 uppercase tracking-widest font-label font-bold">
                        Select a slot type above to switch
                      </p>
                    )}
                  </>
                ) : myRegistration.status === 'WAITLISTED' ? (
                  <div className="flex items-center gap-3 bg-amber-900/40 border border-amber-600/30 px-4 py-3 rounded-xl">
                    <span className="material-symbols-outlined text-amber-400 flex-shrink-0">schedule</span>
                    <div>
                      <p className="font-label font-bold text-sm text-amber-100">You're on the waitlist</p>
                      <p className="font-label text-[10px] text-amber-200/60 mt-0.5">You'll be moved up if a slot opens</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-emerald-800/50 border border-emerald-700/30 px-4 py-3 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p className="font-label font-bold text-sm text-emerald-100">
                      {event.eventType === 'LAMB_EVENT'
                        ? 'Pre-registered!'
                        : `Signed up as ${myRegistration.volunteerType === 'LAMB' ? 'LAmb' : 'DocuLAmb'}!`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Module — announcement only */}
            {!isCoordinator && event.eventType === 'LAMB_MODULE' && event.status === 'PUBLISHED' && (
              <div className="bg-tertiary-fixed/60 rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-on-tertiary-fixed-variant block mb-2">campaign</span>
                <p className="font-label font-bold text-sm text-on-tertiary-fixed-variant uppercase tracking-widest mb-1">Announcement</p>
                <p className="font-body italic text-xs text-on-tertiary-fixed-variant/80">
                  No sign-up required. Just show up!
                </p>
              </div>
            )}

            {event.status !== 'PUBLISHED' && !isCoordinator && event.eventType !== 'LAMB_MODULE' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-7 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300 block mb-3">event_busy</span>
                <p className="font-label font-bold text-sm text-slate-400 uppercase tracking-widest">
                  {event.status === 'COMPLETED' ? 'Event Completed' : event.status === 'CANCELLED' ? 'Event Cancelled' : 'Not Yet Open'}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
