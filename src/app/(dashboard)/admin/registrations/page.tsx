'use client'

import { useEffect, useState } from 'react'
import { getProfile } from '@/lib/auth'

interface PendingRegistration {
  id: string
  profileId: string
  eventId: string
  profile: {
    firstName: string
    lastName: string
    email: string
  }
  event: {
    title: string
    startTime: string
  }
  status: string
}

export default function RegistrationsApprovalPage() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/admin/registrations')
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

  const handleApprove = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        setRegistrations(
          registrations.filter((r) => r.id !== registrationId)
        )
      }
    } catch (error) {
      console.error('Failed to approve registration')
    }
  }

  const handleReject = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        setRegistrations(
          registrations.filter((r) => r.id !== registrationId)
        )
      }
    } catch (error) {
      console.error('Failed to reject registration')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Pending Approvals
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-center text-gray-600">No pending registrations</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ambassador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reg.profile.firstName} {reg.profile.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.profile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.event.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(reg.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
