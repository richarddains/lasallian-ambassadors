'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Registrant {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
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
  slots?: number | null
  lambSlots?: number | null
  docuLambSlots?: number | null
  registrationsCount: number
  registrants: Registrant[]
  updatedAt: string
}

interface Profile {
  role: string
}

type FilterKey = 'all' | 'PUBLISHED' | 'DRAFT' | 'COMPLETED' | 'CANCELLED'

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'bg-white/60 text-emerald-800',
  DRAFT:     'bg-white/60 text-neutral-500',
  CANCELLED: 'bg-white/60 text-red-700',
  COMPLETED: 'bg-white/60 text-teal-700',
}

const EVENT_TYPE_CARD: Record<string, {
  label: string
  card: string        // card background + border
  accent: string      // label text color
  divider: string     // border-t color
  shadow: string      // hover shadow tint
  dot: string         // legend dot
}> = {
  ADMIN_REQUEST: {
    label:   'Admin Request',
    card:    'bg-emerald-50 border-emerald-100 hover:border-emerald-200',
    accent:  'text-emerald-700',
    divider: 'border-emerald-100',
    shadow:  'hover:shadow-emerald-100',
    dot:     'bg-emerald-500',
  },
  LAMB_MODULE: {
    label:   'LAmb Module',
    card:    'bg-amber-50 border-amber-100 hover:border-amber-200',
    accent:  'text-amber-700',
    divider: 'border-amber-100',
    shadow:  'hover:shadow-amber-100',
    dot:     'bg-amber-400',
  },
  LAMB_EVENT: {
    label:   'LAmb Event',
    card:    'bg-teal-50 border-teal-100 hover:border-teal-200',
    accent:  'text-teal-700',
    divider: 'border-teal-100',
    shadow:  'hover:shadow-teal-100',
    dot:     'bg-teal-500',
  },
  MAJOR_EVENT: {
    label:   'Major Event',
    card:    'bg-violet-50 border-violet-100 hover:border-violet-200',
    accent:  'text-violet-700',
    divider: 'border-violet-100',
    shadow:  'hover:shadow-violet-100',
    dot:     'bg-violet-500',
  },
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All Events' },
  { key: 'PUBLISHED', label: 'Published'  },
  { key: 'DRAFT',     label: 'Drafts'     },
  { key: 'COMPLETED', label: 'Completed'  },
  { key: 'CANCELLED', label: 'Cancelled'  },
]

function AvatarStack({ registrants, total }: { registrants: Registrant[]; total: number }) {
  const extra = total - registrants.length
  return (
    <div className="flex -space-x-2">
      {registrants.map((r) => (
        <div
          key={r.id}
          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-on-primary bg-primary overflow-hidden flex-shrink-0"
          title={`${r.firstName} ${r.lastName}`}
        >
          {r.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.avatarUrl} alt={r.firstName} className="w-full h-full object-cover" />
          ) : (
            <span>{r.firstName[0]}{r.lastName[0]}</span>
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant flex-shrink-0">
          +{extra}
        </div>
      )}
      {total === 0 && (
        <span className="font-label text-xs text-slate-400 italic">No sign-ups yet</span>
      )}
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, profileRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/profile'),
        ])
        const [eventsData, profileData] = await Promise.all([
          eventsRes.json(),
          profileRes.json(),
        ])
        setEvents(Array.isArray(eventsData) ? eventsData : [])
        setProfile(profileData)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isCoordinator = profile && ['ASPIRING_CORE', 'CORE'].includes(profile.role)

  const displayed = filter === 'all' ? events : events.filter((e) => e.status === filter)

  const now = new Date()
  const thisMonthCount = events.filter((e) => {
    const d = new Date(e.startTime)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div>
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">Events</h1>
          <p className="font-body text-lg italic text-on-surface-variant">
            Curating excellence through institutional engagement.
          </p>
        </div>
        {isCoordinator && (
          <Link
            href="/events/new"
            className="self-start md:self-auto flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label font-bold uppercase tracking-tight text-sm hover:bg-primary-container transition-all shadow-lg shadow-primary/10 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Create Event
          </Link>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2 rounded-full text-sm font-label font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">hourglass_empty</span>
            <p className="font-body italic text-on-surface-variant">Loading events...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stats */}
              <div className="bg-surface-container p-6 rounded-xl space-y-5">
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">
                  This Month
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-primary font-headline tracking-tighter">
                    {String(thisMonthCount).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-label font-semibold text-neutral-500 uppercase leading-tight">
                    Events<br/>Scheduled
                  </div>
                </div>
                <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, (thisMonthCount / 20) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Type Legend */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl space-y-3">
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                  Event Types
                </h3>
                {Object.values(EVENT_TYPE_CARD).map(({ label, dot }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="font-label text-xs text-on-surface-variant">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Grid */}
            <div className="lg:col-span-9">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">event_busy</span>
                  <p className="font-headline font-bold text-on-surface-variant text-lg">No events found</p>
                  <p className="font-body italic text-on-surface-variant text-sm mt-1">
                    {filter === 'all' ? 'Check back later for upcoming events.' : `No ${filter.toLowerCase()} events.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayed.map((event) => {
                    const isDraft = event.status === 'DRAFT'
                    const typeStyle = EVENT_TYPE_CARD[event.eventType]
                    const statusStyle = STATUS_BADGE[event.status]
                    const cardBg = isDraft
                      ? 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                      : (typeStyle?.card ?? 'bg-surface-container-lowest border-outline-variant/10')
                    const accentColor = isDraft ? 'text-neutral-400' : (typeStyle?.accent ?? 'text-primary')
                    const dividerColor = isDraft ? 'border-neutral-200' : (typeStyle?.divider ?? 'border-neutral-100')

                    const dateLabel = event.startTime
                      ? new Date(event.startTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'TBD'
                    const timeLabel = event.startTime && event.endTime
                      ? `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'TBD'

                    // Days until sign-up closes (1 day before event)
                    const closeMs = event.startTime
                      ? new Date(event.startTime).getTime() - 24 * 60 * 60 * 1000 - Date.now()
                      : null
                    const daysLeft = closeMs != null ? Math.floor(closeMs / (1000 * 60 * 60 * 24)) : null
                    const showCountdown = event.status === 'PUBLISHED' && event.eventType !== 'LAMB_MODULE' && daysLeft != null
                    const isUrgent = daysLeft != null && daysLeft <= 2 && daysLeft >= 0
                    const isClosed = daysLeft != null && daysLeft < 0

                    // Total slots
                    const totalSlots =
                      event.eventType === 'LAMB_MODULE' ? null
                      : (event.lambSlots ?? 0) + (event.docuLambSlots ?? 0) > 0
                        ? (event.lambSlots ?? 0) + (event.docuLambSlots ?? 0)
                        : (event.slots ?? null)

                    return (
                      <div
                        key={event.id}
                        className={`rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border group ${cardBg} ${
                          isDraft ? 'opacity-75 hover:opacity-100' : ''
                        }`}
                      >
                        <div className="p-8 flex flex-col h-full">
                          {/* Type label + status badge */}
                          <div className="flex justify-between items-start mb-5">
                            <span className={`font-label text-[10px] font-bold uppercase tracking-widest ${accentColor}`}>
                              {typeStyle?.label ?? event.eventType}
                            </span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm font-label border border-black/5 ${statusStyle ?? 'bg-white/60 text-on-surface-variant'}`}>
                              {event.status}
                            </span>
                          </div>

                          {/* Title + Description */}
                          <h3 className="font-headline text-2xl font-bold text-on-background mb-3 group-hover:text-primary transition-colors leading-tight">
                            {event.title}
                          </h3>
                          <p className="font-body text-neutral-600 mb-6 line-clamp-2 text-sm leading-relaxed">
                            {event.description}
                          </p>

                          {/* Meta */}
                          <div className="space-y-2.5 mb-5">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                              <span className={`material-symbols-outlined text-base flex-shrink-0 ${accentColor}`}>location_on</span>
                              <span className="font-label font-medium truncate">{event.location || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                              <span className={`material-symbols-outlined text-base flex-shrink-0 ${accentColor}`}>calendar_today</span>
                              <span className="font-label font-medium">{dateLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                              <span className={`material-symbols-outlined text-base flex-shrink-0 ${accentColor}`}>schedule</span>
                              <span className="font-label font-medium">{timeLabel}</span>
                            </div>
                            {totalSlots != null && (
                              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className={`material-symbols-outlined text-base flex-shrink-0 ${accentColor}`}>group</span>
                                <span className="font-label font-medium">
                                  {event.registrationsCount} / {totalSlots} slots filled
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Countdown chip */}
                          {showCountdown && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-label font-bold ${
                              isClosed
                                ? 'bg-neutral-100 text-neutral-400'
                                : isUrgent
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : 'bg-white/60 text-on-surface-variant'
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {isClosed ? 'lock' : isUrgent ? 'warning' : 'hourglass_bottom'}
                              </span>
                              {isClosed
                                ? 'Sign-up closed'
                                : daysLeft === 0
                                ? 'Last day to sign up!'
                                : daysLeft === 1
                                ? '1 day left to sign up'
                                : `${daysLeft} days left to sign up`}
                            </div>
                          )}

                          {/* Footer */}
                          <div className={`flex items-center justify-between pt-5 border-t mt-auto ${dividerColor}`}>
                            {isDraft ? (
                              <span className="text-xs italic text-neutral-400 font-body">
                                Last edited {new Date(event.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            ) : (
                              <AvatarStack
                                registrants={event.registrants ?? []}
                                total={event.registrationsCount}
                              />
                            )}
                            <Link
                              href={`/events/${event.id}`}
                              className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/60 hover:bg-primary hover:text-on-primary transition-all flex-shrink-0`}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {isDraft ? 'edit' : 'arrow_forward'}
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Create card — coordinators only */}
                  {isCoordinator && filter === 'all' && (
                    <Link
                      href="/events/new"
                      className="bg-surface-container-lowest rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 group flex flex-col items-center justify-center text-center p-8 min-h-[280px] transition-all hover:shadow-md"
                    >
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">calendar_add_on</span>
                      </div>
                      <h3 className="font-headline text-lg font-bold text-primary mb-2">Schedule New Activity</h3>
                      <p className="font-body text-neutral-500 text-sm max-w-[180px] italic">
                        Add a new institutional or internal event to the queue.
                      </p>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

        </>
      )}

      {/* FAB — coordinators only */}
      {isCoordinator && (
        <Link
          href="/events/new"
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">bolt</span>
        </Link>
      )}
    </div>
  )
}
