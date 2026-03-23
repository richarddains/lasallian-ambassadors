'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AIC {
  id: string
  firstName: string
  lastName: string
}

const EVENT_TYPE_OPTIONS = [
  { value: 'ADMIN_REQUEST', label: 'Admin Request', desc: 'Campus tours, ushering, external duties' },
  { value: 'LAMB_MODULE', label: 'LAmb Module', desc: 'Formation modules, committee trainings' },
  { value: 'LAMB_EVENT', label: 'LAmb Event', desc: 'Internal org events, scavenger hunts, etc.' },
  { value: 'MAJOR_EVENT', label: 'Major Event', desc: 'Flagship events (The Greening, LPEP, etc.)' },
]

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aicList, setAicList] = useState<AIC[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    eventType: 'ADMIN_REQUEST',
    lambSlots: '',
    docuLambSlots: '',
    slots: '',
    aicId: '',
    attire: '',
  })

  useEffect(() => {
    fetch('/api/ambassadors?order=ASPIRING_CORE')
      .then((r) => r.json())
      .then(setAicList)
      .catch(() => {})
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const isModule = formData.eventType === 'LAMB_MODULE'
      const isLambEvent = formData.eventType === 'LAMB_EVENT'

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          eventType: formData.eventType,
          aicId: formData.aicId || null,
          attire: (!isModule && formData.attire) ? formData.attire : null,
          lambSlots: (!isModule && !isLambEvent && formData.lambSlots) ? parseInt(formData.lambSlots) : null,
          docuLambSlots: (!isModule && !isLambEvent && formData.docuLambSlots) ? parseInt(formData.docuLambSlots) : null,
          slots: (isLambEvent && formData.slots) ? parseInt(formData.slots) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create event')
        return
      }

      const event = await response.json()
      router.push(`/events/${event.id}`)
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isModule = formData.eventType === 'LAMB_MODULE'
  const isLambEvent = formData.eventType === 'LAMB_EVENT'

  return (
    <div className="max-w-2xl">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 font-label font-bold text-sm text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Events
      </Link>

      <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-3">
          New Event
        </span>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tighter mb-8">
          Create Event
        </h1>

        {error && (
          <div className="bg-error-container border border-error/20 text-on-error-container px-4 py-3 rounded-lg mb-6 font-label text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Event Type */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">01</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Event Type</h2>
              <div className="h-px flex-grow bg-outline-variant/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, eventType: opt.value })}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    formData.eventType === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <p className={`font-label font-bold text-sm mb-0.5 ${formData.eventType === opt.value ? 'text-primary' : 'text-on-surface'}`}>
                    {opt.label}
                  </p>
                  <p className="font-body italic text-xs text-on-surface-variant">{opt.desc}</p>
                </button>
              ))}
            </div>
            {isModule && (
              <p className="mt-3 font-body italic text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-tertiary">info</span>
                LAmb Modules appear as announcements — ambassadors are not required to sign up.
              </p>
            )}
          </div>

          {/* Section 2: Basic Info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">02</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Event Details</h2>
              <div className="h-px flex-grow bg-outline-variant/30" />
            </div>
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  placeholder="Event name"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="bg-surface-container-low border-none rounded-xl p-4 font-body text-base text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/40 resize-none"
                  placeholder="Describe the event..."
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">HQ / Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  placeholder="Venue or address"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">AIC (Aspiring Core in Charge)</label>
                <select
                  name="aicId"
                  value={formData.aicId}
                  onChange={handleChange}
                  className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface"
                >
                  <option value="">None</option>
                  {aicList.map((ac) => (
                    <option key={ac.id} value={ac.id}>{ac.firstName} {ac.lastName}</option>
                  ))}
                </select>
              </div>
              {!isModule && (
                <div className="flex flex-col">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Dress Code</label>
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
              )}
            </div>
          </div>

          {/* Section 3: Schedule */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">03</span>
              <h2 className="font-headline font-bold text-lg tracking-tight">Schedule</h2>
              <div className="h-px flex-grow bg-outline-variant/30" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Start Time</label>
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
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">End Time</label>
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

          {/* Section 4: Slots (conditional) */}
          {!isModule && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">04</span>
                <h2 className="font-headline font-bold text-lg tracking-tight">
                  {isLambEvent ? 'Pre-Registration Capacity' : 'Volunteer Slots'}
                </h2>
                <div className="h-px flex-grow bg-outline-variant/30" />
              </div>
              <p className="font-body italic text-on-surface-variant text-sm mb-6">Leave blank for unlimited.</p>
              {isLambEvent ? (
                <div className="flex flex-col max-w-xs">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Slots</label>
                  <input
                    type="number"
                    name="slots"
                    value={formData.slots}
                    onChange={handleChange}
                    min="1"
                    placeholder="Unlimited"
                    className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">LAmb Slots</label>
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
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">DocuLAmb Slots</label>
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
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  )
}
