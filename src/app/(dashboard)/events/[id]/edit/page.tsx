'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  lambSlots: string
  docuLambSlots: string
  aicId: string
  attire: string
}

interface AIC {
  id: string
  firstName: string
  lastName: string
}

function toDatetimeLocal(iso: string) {
  return iso ? new Date(iso).toISOString().slice(0, 16) : ''
}

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aicList, setAicList] = useState<AIC[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    lambSlots: '',
    docuLambSlots: '',
    aicId: '',
    attire: '',
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventRes, aicRes] = await Promise.all([
          fetch(`/api/events/${params.id}`),
          fetch('/api/ambassadors?order=ASPIRING_CORE'),
        ])
        const [data, aics] = await Promise.all([eventRes.json(), aicRes.json()])
        setAicList(aics)
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          startTime: toDatetimeLocal(data.startTime),
          endTime: toDatetimeLocal(data.endTime),
          lambSlots: data.lambSlots?.toString() ?? '',
          docuLambSlots: data.docuLambSlots?.toString() ?? '',
          aicId: data.aicId ?? '',
          attire: data.attire ?? '',
        })
      } catch {
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchEvent()
  }, [params.id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lambSlots: formData.lambSlots ? parseInt(formData.lambSlots) : null,
          docuLambSlots: formData.docuLambSlots ? parseInt(formData.docuLambSlots) : null,
          aicId: formData.aicId || null,
          attire: formData.attire || null,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update event')
        return
      }

      router.push(`/events/${params.id}`)
    } catch {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">hourglass_empty</span>
          <p className="font-body italic text-on-surface-variant">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/events/${params.id}`}
        className="inline-flex items-center gap-1.5 font-label font-bold text-sm text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Event
      </Link>

      <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-3">
          Editing
        </span>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tighter mb-8">
          Edit Event
        </h1>

        {error && (
          <div className="bg-error-container border border-error/20 text-on-error-container px-4 py-3 rounded-lg mb-6 font-label text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Basic Info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">01</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Event Details</h2>
              <div className="h-px flex-grow bg-outline-variant/30"></div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="bg-surface-container-low border-none rounded-xl p-4 font-body text-base text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/40 resize-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  HQ
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  AIC (Aspiring Core in Charge)
                </label>
                <select
                  name="aicId"
                  value={formData.aicId}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface"
                >
                  <option value="">None</option>
                  {aicList.map((ac) => (
                    <option key={ac.id} value={ac.id}>
                      {ac.firstName} {ac.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Dress Code
                </label>
                <select
                  name="attire"
                  value={formData.attire}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface"
                >
                  <option value="">Not specified</option>
                  <option value="DAY1_UNIFORM">Day 1 Uniform</option>
                  <option value="DAY2_UNIFORM">Day 2 Uniform</option>
                  <option value="USHERING_ATTIRE">Ushering Attire</option>
                  <option value="GAWAD_LASALYANO">Gawad Lasalyano Attire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">02</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Schedule</h2>
              <div className="h-px flex-grow bg-outline-variant/30"></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-base text-on-surface"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-base text-on-surface"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Volunteers */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">03</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Volunteer Slots</h2>
              <div className="h-px flex-grow bg-outline-variant/30"></div>
            </div>
            <p className="font-body italic text-on-surface-variant text-sm mb-6">
              Leave blank for unlimited slots.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  LAmb Slots
                </label>
                <input
                  type="number"
                  name="lambSlots"
                  value={formData.lambSlots}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  DocuLAmb Slots
                </label>
                <input
                  type="number"
                  name="docuLambSlots"
                  value={formData.docuLambSlots}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
