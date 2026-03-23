'use client'

import { useState } from 'react'
import Link from 'next/link'

interface EventItem {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  attire: string | null
  status: string
  slots: number | null
  lambSlots: number | null
  docuLambSlots: number | null
  requiresApproval: boolean
  registrationsCount: number
  bannerUrl: string | null
  aicId: string | null
  aic: { id: string; firstName: string; lastName: string } | null
  eventType: string
}

interface EventRegistrant {
  id: string
  volunteerType: string
  status: string
  profile: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
}

interface EventDetail extends EventItem {
  registrations: EventRegistrant[]
}

interface Props {
  profile: { firstName: string; lastName: string; role: string }
  initialEvents: EventItem[]
  initialYear: number
  initialMonth: number
  totalRegistrations: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const ATTIRE_LABELS: Record<string, string> = {
  DAY1_UNIFORM: 'Day 1 Uniform',
  DAY2_UNIFORM: 'Day 2 Uniform',
  USHERING_ATTIRE: 'Ushering Attire',
  GAWAD_LASALYANO: 'Gawad Lasalyano',
}

const EVENT_TYPE_COLORS: Record<string, { pill: string; selected: string; dot: string; label: string }> = {
  ADMIN_REQUEST: { pill: 'bg-primary/10 text-primary',                    selected: 'bg-primary text-on-primary',      dot: 'bg-primary',    label: 'Admin Request' },
  LAMB_MODULE:   { pill: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', selected: 'bg-tertiary text-on-tertiary',  dot: 'bg-tertiary',   label: 'LAmb Module' },
  LAMB_EVENT:    { pill: 'bg-secondary-container/50 text-secondary',       selected: 'bg-secondary text-on-secondary',  dot: 'bg-secondary',  label: 'LAmb Event' },
  MAJOR_EVENT:   { pill: 'bg-violet-100 text-violet-700',                  selected: 'bg-violet-600 text-white',         dot: 'bg-violet-600', label: 'Major Event' },
}

function getEventColor(eventType: string) {
  return EVENT_TYPE_COLORS[eventType] ?? EVENT_TYPE_COLORS.ADMIN_REQUEST
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

export default function CalendarDashboard({
  profile,
  initialEvents,
  initialYear,
  initialMonth,
  totalRegistrations,
}: Props) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const navigateMonth = async (direction: 1 | -1) => {
    let newMonth = month + direction
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }

    setYear(newYear)
    setMonth(newMonth)
    setLoadingEvents(true)
    setSelectedEventId(null)
    setSelectedEventDetail(null)

    try {
      const res = await fetch(`/api/events?year=${newYear}&month=${newMonth}`)
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch {
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  const selectEvent = async (id: string) => {
    if (selectedEventId === id) {
      setSelectedEventId(null)
      setSelectedEventDetail(null)
      return
    }
    setSelectedEventId(id)
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/events/${id}`)
      const data = await res.json()
      setSelectedEventDetail(data)
    } catch {
      setSelectedEventDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const upcomingCount = events.filter((e) => new Date(e.startTime) >= today).length

  const calendarDays = buildCalendarDays(year, month)

  const eventsByDay: Record<number, EventItem[]> = {}
  events.forEach((event) => {
    const d = new Date(event.startTime).getDate()
    if (!eventsByDay[d]) eventsByDay[d] = []
    eventsByDay[d].push(event)
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-1">
          Ambassador Management
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tighter">
            Welcome back, {profile.firstName}.
          </h1>
          <p className="font-body italic text-sm text-on-surface-variant">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-container-lowest rounded-xl p-3 editorial-shadow">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">event</span>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Events This Month</p>
          </div>
          <p className="font-headline font-black text-2xl text-primary">{events.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-3 editorial-shadow">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-tertiary text-base">upcoming</span>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Upcoming</p>
          </div>
          <p className="font-headline font-black text-2xl text-tertiary">{upcomingCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-3 editorial-shadow">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary text-base">how_to_reg</span>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">My Total Sign-ups</p>
          </div>
          <p className="font-headline font-black text-2xl text-secondary">{totalRegistrations}</p>
        </div>
      </div>

      {/* Calendar + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-8 space-y-3">
          {/* Month Navigator */}
          <div className="flex items-center justify-between py-2 px-4 bg-surface-container-lowest rounded-xl editorial-shadow">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <h2 className="font-headline text-base font-bold text-on-surface">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden editorial-shadow border border-outline-variant/10">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-surface-container-high">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant"
                >
                  {d}
                </div>
              ))}
            </div>

            {loadingEvents ? (
              <div className="h-48 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">autorenew</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 auto-rows-[64px]">
                {calendarDays.map((day, idx) => {
                  const dayEvents = day ? (eventsByDay[day] || []) : []
                  const isToday = isCurrentMonth && day === today.getDate()

                  return (
                    <div
                      key={idx}
                      className={`p-1.5 border-r border-b border-surface-container-high overflow-hidden last:border-r-0 ${
                        !day ? 'bg-surface-container-low/30' : ''
                      } ${isToday ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
                    >
                      {day && (
                        <>
                          <span
                            className={`font-label text-sm font-medium block mb-1 ${
                              isToday ? 'text-primary font-black' : 'text-on-surface'
                            }`}
                          >
                            {day}
                          </span>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => {
                              const color = getEventColor(event.eventType)
                              const isSelected = selectedEventId === event.id
                              return (
                                <button
                                  key={event.id}
                                  onClick={() => selectEvent(event.id)}
                                  className={`w-full text-left px-1.5 py-1 rounded text-[9px] font-label font-bold uppercase leading-none truncate transition-all ${
                                    isSelected ? color.selected + ' shadow-sm' : color.pill + ' hover:opacity-80'
                                  }`}
                                >
                                  {event.title}
                                </button>
                              )
                            })}
                            {dayEvents.length > 2 && (
                              <button
                                onClick={() => selectEvent(dayEvents[2].id)}
                                className="font-label text-[9px] text-primary pl-1 hover:underline"
                              >
                                +{dayEvents.length - 2} more
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4">
            {Object.values(EVENT_TYPE_COLORS).map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                <span className="font-label text-[10px] font-bold uppercase text-on-surface-variant">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6 h-fit space-y-3">
          {/* Event Detail Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow border border-outline-variant/5">
            {!selectedEventId ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">event_note</span>
                <p className="font-headline font-bold text-on-surface-variant text-sm">Select an event</p>
                <p className="font-body italic text-xs text-on-surface-variant mt-1">
                  Click any event on the calendar to view details.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-outline-variant animate-spin block mb-2">
                  autorenew
                </span>
                <p className="font-body italic text-xs text-on-surface-variant">Loading details...</p>
              </div>
            ) : selectedEventDetail ? (
              <>
                <div className="mb-3">
                  <span className="font-label text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-0.5 block">
                    Event Details
                  </span>
                  <h3 className="font-headline text-base font-bold text-on-surface leading-tight">
                    {selectedEventDetail.title}
                  </h3>
                  <p className="font-body italic text-on-surface-variant text-xs mt-0.5">
                    {new Date(selectedEventDetail.startTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' · '}
                    {new Date(selectedEventDetail.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {' — '}
                    {new Date(selectedEventDetail.endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-base">location_on</span>
                    </div>
                    <div>
                      <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Location</h4>
                      <p className="font-headline font-bold text-on-surface text-sm">{selectedEventDetail.location}</p>
                    </div>
                  </div>

                  {/* Attire */}
                  {selectedEventDetail.attire && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/40 flex items-center justify-center text-tertiary flex-shrink-0">
                        <span className="material-symbols-outlined text-base">apparel</span>
                      </div>
                      <div>
                        <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Attire</h4>
                        <span className="mt-0.5 inline-block px-2 py-0.5 bg-tertiary text-on-tertiary font-label text-[10px] font-black rounded uppercase">
                          {ATTIRE_LABELS[selectedEventDetail.attire] ?? selectedEventDetail.attire}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Slots */}
                  {(selectedEventDetail.lambSlots || selectedEventDetail.docuLambSlots || selectedEventDetail.slots) && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary flex-shrink-0">
                        <span className="material-symbols-outlined text-base">group</span>
                      </div>
                      <div>
                        <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Slots</h4>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {selectedEventDetail.lambSlots && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary font-label text-[10px] font-bold rounded">
                              LAmb: {selectedEventDetail.lambSlots}
                            </span>
                          )}
                          {selectedEventDetail.docuLambSlots && (
                            <span className="px-2 py-0.5 bg-secondary-container/50 text-secondary font-label text-[10px] font-bold rounded">
                              DocuLAmb: {selectedEventDetail.docuLambSlots}
                            </span>
                          )}
                          {selectedEventDetail.slots && !selectedEventDetail.lambSlots && !selectedEventDetail.docuLambSlots && (
                            <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label text-[10px] font-bold rounded">
                              Total: {selectedEventDetail.slots}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AIC */}
                  {selectedEventDetail.aic && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-base">badge</span>
                      </div>
                      <div>
                        <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider">AIC</h4>
                        <p className="font-headline font-bold text-on-surface text-sm">
                          {selectedEventDetail.aic.firstName} {selectedEventDetail.aic.lastName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="border-t border-surface-container-high pt-3">
                    <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-1">About</h4>
                    <p className="font-body italic text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                      {selectedEventDetail.description}
                    </p>
                  </div>

                  {/* Approved Registrants */}
                  {selectedEventDetail.registrations && selectedEventDetail.registrations.length > 0 && (
                    <div className="border-t border-surface-container-high pt-3">
                      <h4 className="font-label text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-2">
                        Registered Ambassadors ({selectedEventDetail.registrationsCount})
                      </h4>
                      <div className="space-y-1.5">
                        {selectedEventDetail.registrations.slice(0, 3).map((reg) => (
                          <div key={reg.id} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
                              {reg.profile.avatarUrl ? (
                                <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="font-label font-bold text-[10px] text-on-surface-variant">
                                    {reg.profile.firstName[0]}{reg.profile.lastName[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-label text-[11px] font-bold text-on-surface leading-none truncate">
                                {reg.profile.firstName} {reg.profile.lastName}
                              </p>
                              <p className="font-body text-[10px] text-on-surface-variant">
                                {reg.volunteerType === 'LAMB' ? 'LAmb' : reg.volunteerType === 'DOCULAMB' ? 'DocuLAmb' : 'Pre-Registered'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {selectedEventDetail.registrationsCount > 3 && (
                          <p className="font-label text-[10px] text-on-surface-variant">
                            +{selectedEventDetail.registrationsCount - 3} more registered
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-1">
                    <Link
                      href={`/events/${selectedEventDetail.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      View Full Details
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Quick Links */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow border border-outline-variant/5">
            <h4 className="font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
              Quick Links
            </h4>
            <div className="space-y-0.5">
              <Link href="/events" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-primary text-lg">event</span>
                <span className="font-label text-xs font-bold text-on-surface">Browse All Events</span>
                <span className="material-symbols-outlined text-outline text-sm ml-auto">arrow_forward</span>
              </Link>
              <Link href="/my-registrations" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-secondary text-lg">how_to_reg</span>
                <span className="font-label text-xs font-bold text-on-surface">My Sign-ups</span>
                <span className="material-symbols-outlined text-outline text-sm ml-auto">arrow_forward</span>
              </Link>
              <Link href="/directory" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-tertiary text-lg">people</span>
                <span className="font-label text-xs font-bold text-on-surface">Ambassador Directory</span>
                <span className="material-symbols-outlined text-outline text-sm ml-auto">arrow_forward</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-lg">manage_accounts</span>
                <span className="font-label text-xs font-bold text-on-surface">My Profile</span>
                <span className="material-symbols-outlined text-outline text-sm ml-auto">arrow_forward</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
