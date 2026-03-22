'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (!data.user) {
        setError('Registration failed. Please try again.')
        return
      }

      // Create the Profile row in the database
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || 'Failed to create profile.')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-surface-container-lowest editorial-shadow rounded-xl p-10">
      <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-3">
        Candidate Intake
      </span>
      <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter mb-2">
        Join the ranks.
      </h1>
      <p className="font-body italic text-on-surface-variant mb-8">
        Create your ambassador portal account.
      </p>

      {error && (
        <div className="bg-error-container border border-error/20 text-on-error-container px-4 py-3 rounded-lg mb-6 font-label text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">01</span>
          <h2 className="font-headline font-bold text-lg tracking-tight">Personal Information</h2>
          <div className="h-px flex-grow bg-outline-variant/30"></div>
        </div>

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
              required
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
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-primary font-headline font-extrabold text-sm tracking-widest uppercase">02</span>
          <h2 className="font-headline font-bold text-lg tracking-tight">Credentials</h2>
          <div className="h-px flex-grow bg-outline-variant/30"></div>
        </div>

        <div className="flex flex-col">
          <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
            placeholder="you@dlsu.edu.ph"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-transparent ghost-border focus-border py-2 px-0 font-body text-lg text-on-surface placeholder:text-outline/40"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body italic text-on-surface-variant text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-label font-bold not-italic hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
