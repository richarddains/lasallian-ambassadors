'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const COMMITTEE_INFO: Record<string, { label: string; bg: string; text: string }> = {
  MARKETING_RELATIONS: {
    label: 'Marketing and Relations',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
  HUMAN_RESOURCE: {
    label: 'Human Resource Management and Development',
    bg: 'bg-blue-900',
    text: 'text-blue-50',
  },
  DOCUMENTATIONS_PUBLICITY: {
    label: 'Documentations and Publicity',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
  },
  OPERATIONS_FINANCE: {
    label: 'Operations and Finance',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    batch: '',
    order: '',
    committee: '',
  })

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        setFormData({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          bio: data.bio ?? '',
          batch: data.batch ? String(data.batch) : '',
          order: data.order ?? '',
          committee: data.committee ?? '',
        })
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) {
        setError('Failed to upload avatar')
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: data.publicUrl }),
      })

      if (!response.ok) {
        setError('Failed to save avatar URL')
        return
      }

      setSuccess('Avatar updated successfully')
    } catch {
      setError('An error occurred while uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          batch: formData.batch ? parseInt(formData.batch) : null,
          order: formData.order || null,
          committee: formData.committee || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully')
      router.refresh()
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl">
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
          <div className="text-on-surface-variant font-body italic text-sm">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-3">
          Account
        </span>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tighter mb-8">
          Profile Settings
        </h1>

        {error && (
          <div className="bg-error-container border border-error/20 text-on-error-container px-4 py-3 rounded-lg mb-6 font-label text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 font-label text-sm">
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="mb-8">
          <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 block">
            Profile Picture
          </label>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center hover:bg-primary/15 transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-primary text-2xl">
                {uploading ? 'sync' : 'photo_camera'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div>
              <p className="font-body text-sm text-on-surface">
                {uploading ? 'Uploading...' : 'Click to upload a profile picture'}
              </p>
              <p className="font-label text-xs text-on-surface-variant mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 01 */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">01</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Personal Information</h2>
              <div className="h-px flex-grow bg-outline-variant/30"></div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                    placeholder="Juan"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="bg-surface-container-low border-none rounded-xl p-4 font-body text-base text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/40 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Section 02 */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">02</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Ambassador Details</h2>
              <div className="h-px flex-grow bg-outline-variant/30"></div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Batch Year
                  </label>
                  <input
                    type="number"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="e.g. 2023"
                    className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Order
                  </label>
                  <select
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface"
                  >
                    <option value="">Select order...</option>
                    <option value="CORE">Core</option>
                    <option value="ASPIRING_CORE">Aspiring Core (AC)</option>
                    <option value="NON_FIRST_TIMERS">Non-First Timers</option>
                    <option value="FIRST_TIMERS">First Timers</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Committee
                </label>
                <select
                  name="committee"
                  value={formData.committee}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface"
                >
                  <option value="">No committee</option>
                  <option value="MARKETING_RELATIONS">Marketing and Relations</option>
                  <option value="HUMAN_RESOURCE">Human Resource Management and Development</option>
                  <option value="DOCUMENTATIONS_PUBLICITY">Documentations and Publicity</option>
                  <option value="OPERATIONS_FINANCE">Operations and Finance</option>
                </select>
                {formData.committee && COMMITTEE_INFO[formData.committee] && (
                  <span className={`mt-2 self-start text-xs font-label font-bold px-2.5 py-1 rounded-full ${COMMITTEE_INFO[formData.committee].bg} ${COMMITTEE_INFO[formData.committee].text}`}>
                    {COMMITTEE_INFO[formData.committee].label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
