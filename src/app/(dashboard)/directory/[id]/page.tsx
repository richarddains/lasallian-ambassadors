'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface AmbassadorProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  batch?: number
  order?: string
  role: string
  avatarUrl?: string
}

export default function AmbassadorDetailPage() {
  const params = useParams()
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/ambassadors/${params.id}`)
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error('Failed to fetch ambassador')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center text-gray-600">Ambassador not found</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6"></div>

        {/* Profile Info */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-gray-600 text-center mb-6">{profile.email}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b">
          <div>
            <p className="text-sm font-medium text-gray-600">Role</p>
            <p className="text-lg font-semibold text-gray-900">{profile.role}</p>
          </div>
          {profile.order && (
            <div>
              <p className="text-sm font-medium text-gray-600">Order</p>
              <p className="text-lg font-semibold text-blue-600">
                {profile.order.replace(/_/g, ' ')}
              </p>
            </div>
          )}
          {profile.batch && (
            <div>
              <p className="text-sm font-medium text-gray-600">Batch</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.batch}
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Bio</p>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  )
}
