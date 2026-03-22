'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  status: string
  slots?: number
  registrationsCount: number
}

interface Profile {
  role: string
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-secondary-container text-on-secondary-container',
  DRAFT: 'bg-tertiary-fixed text-on-tertiary-fixed',
  CANCELLED: 'bg-error-container text-on-error-container',
  COMPLETED: 'bg-surface-container-highest text-on-surface-variant',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
        setEvents(eventsData)
        setProfile(profileData)
      } catch (error) {
        console.error('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

const isCoordinator = profile && ['ASPIRING_CORE', 'CORE'].includes(profile.role)

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-2">
            Organization
          </span>
          <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter">Events</h1>
        </div>
        {isCoordinator && (
          <Link
            href="/events/new"
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Create Event
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">hourglass_empty</span>
            <p className="font-body italic text-on-surface-variant">Loading events...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">event_busy</span>
            <p className="font-headline font-bold text-on-surface-variant text-lg">No events yet</p>
            <p className="font-body italic text-on-surface-variant text-sm mt-1">
              Check back later for upcoming events.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group bg-surface-container-lowest rounded-xl editorial-shadow hover:shadow-lg transition-all p-6 block border border-transparent hover:border-outline-variant/30"
            >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight group-hover:text-primary transition-colors truncate mb-1">
                      {event.title}
                    </h3>
                    <p className="font-body italic text-on-surface-variant mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {event.location || '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {event.startTime
                          ? new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {event.startTime && event.endTime
                          ? `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : '—'}
                      </span>
                      {event.slots && (
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">group</span>
                          {event.registrationsCount} / {event.slots} slots
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full font-label text-xs font-bold uppercase tracking-widest ${STATUS_STYLES[event.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
                      {event.status}
                    </span>
                    <span className="material-symbols-outlined text-outline text-xl group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
