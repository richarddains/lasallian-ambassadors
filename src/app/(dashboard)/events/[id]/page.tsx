'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        const data = await response.json()
        setEvent(data)
      } catch (error) {
        console.error('Failed to fetch event')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const handleRegister = async () => {
    if (!event) return

    setRegistering(true)
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })

      if (response.ok) {
        setRegistered(true)
      }
    } catch (error) {
      console.error('Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>
  }

  if (!event) {
    return <div className="text-center text-gray-600">Event not found</div>
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/events"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Banner placeholder */}
        <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg mb-6"></div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <span
            className={`px-4 py-2 rounded-lg font-semibold ${
              event.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : event.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(event.startTime).toLocaleDateString()} at{' '}
              {new Date(event.startTime).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Location</p>
            <p className="font-semibold text-gray-900">{event.location}</p>
          </div>
          {event.slots && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Slots</p>
              <p className="font-semibold text-gray-900">
                {event.registrationsCount} / {event.slots}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {event.status === 'PUBLISHED' && (
          <button
            onClick={handleRegister}
            disabled={registering || registered}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {registering
              ? 'Registering...'
              : registered
                ? 'Registered'
                : 'Register Now'}
          </button>
        )}
      </div>
    </div>
  )
}
