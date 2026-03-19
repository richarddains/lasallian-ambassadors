'use client'

import { useEffect, useState } from 'react'

interface Ambassador {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
}

export default function AmbassadorsManagementPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        const response = await fetch('/api/admin/ambassadors')
        const data = await response.json()
        setAmbassadors(data)
      } catch (error) {
        console.error('Failed to fetch ambassadors')
      } finally {
        setLoading(false)
      }
    }

    fetchAmbassadors()
  }, [])

  const handleRoleChange = async (
    ambassadorId: string,
    newRole: string
  ) => {
    try {
      const response = await fetch(`/api/admin/ambassadors/${ambassadorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setAmbassadors(
          ambassadors.map((a) =>
            a.id === ambassadorId ? { ...a, role: newRole } : a
          )
        )
      }
    } catch (error) {
      console.error('Failed to update role')
    }
  }

  const handleToggleActive = async (ambassadorId: string) => {
    try {
      const ambassador = ambassadors.find((a) => a.id === ambassadorId)
      const response = await fetch(`/api/admin/ambassadors/${ambassadorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ambassador?.isActive }),
      })

      if (response.ok) {
        setAmbassadors(
          ambassadors.map((a) =>
            a.id === ambassadorId ? { ...a, isActive: !a.isActive } : a
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle active status')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Manage Ambassadors
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : ambassadors.length === 0 ? (
        <div className="text-center text-gray-600">No ambassadors found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ambassadors.map((ambassador) => (
                <tr key={ambassador.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ambassador.firstName} {ambassador.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {ambassador.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ambassador.role}
                      onChange={(e) =>
                        handleRoleChange(ambassador.id, e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option>AMBASSADOR</option>
                      <option>COORDINATOR</option>
                      <option>LEAD</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        ambassador.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ambassador.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleActive(ambassador.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {ambassador.isActive ? 'Deactivate' : 'Activate'}
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
