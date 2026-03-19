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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Event
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-600">No events yet</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📍 {event.location}</span>
                    <span>🕐 {new Date(event.startTime).toLocaleDateString()}</span>
                    {event.slots && (
                      <span>
                        👥 {event.registrationsCount} / {event.slots} slots
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : event.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
