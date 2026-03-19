'use client'

import { useEffect, useState } from 'react'

interface Registration {
  id: string
  event: {
    id: string
    title: string
    startTime: string
    location: string
  }
  status: string
  registeredAt: string
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/registrations')
        const data = await response.json()
        setRegistrations(data)
      } catch (error) {
        console.error('Failed to fetch registrations')
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Registrations</h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-center text-gray-600">No registrations yet</div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {reg.event.title}
                </h3>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📍 {reg.event.location}</span>
                  <span>
                    🕐 {new Date(reg.event.startTime).toLocaleDateString()}
                  </span>
                  <span>
                    📝 Registered{' '}
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-lg font-semibold ${
                  reg.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : reg.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : reg.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {reg.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
