'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Ambassador {
  id: string
  firstName: string
  lastName: string
  email: string
  batch?: number
  order?: string
  role: string
}

export default function DirectoryPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrder, setFilterOrder] = useState('')
  const [filterRole, setFilterRole] = useState('')

  useEffect(() => {
    fetchAmbassadors()
  }, [])

  const fetchAmbassadors = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterOrder) params.append('order', filterOrder)
      if (filterRole) params.append('role', filterRole)

      const response = await fetch(`/api/ambassadors?${params}`)
      const data = await response.json()
      setAmbassadors(data)
    } catch (error) {
      console.error('Failed to fetch ambassadors')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ambassador Directory</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={filterOrder}
              onChange={(e) => setFilterOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Orders</option>
              <option value="CORE">Core</option>
              <option value="ASPIRING_CORE">Aspiring Core</option>
              <option value="NON_FIRST_TIMERS">Non-First Timers</option>
              <option value="FIRST_TIMERS">First Timers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="AMBASSADOR">Ambassador</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="LEAD">Lead</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <button
          onClick={fetchAmbassadors}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : ambassadors.length === 0 ? (
        <div className="text-center text-gray-600">No ambassadors found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambassadors.map((ambassador) => (
            <Link
              key={ambassador.id}
              href={`/dashboard/directory/${ambassador.id}`}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4"></div>
                <h3 className="text-lg font-bold text-gray-900">
                  {ambassador.firstName} {ambassador.lastName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{ambassador.email}</p>
                {ambassador.batch && (
                  <p className="text-xs text-gray-500">Batch: {ambassador.batch}</p>
                )}
                {ambassador.order && (
                  <p className="text-xs text-blue-600 font-medium">
                    {ambassador.order.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
