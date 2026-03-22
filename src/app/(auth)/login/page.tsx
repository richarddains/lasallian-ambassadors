'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest editorial-shadow rounded-xl p-10">
      <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-3">
        Ambassador Portal
      </span>
      <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter mb-2">
        Welcome back.
      </h1>
      <p className="font-body italic text-on-surface-variant mb-8">
        Sign in to access the portal.
      </p>

      {error && (
        <div className="bg-error-container border border-error/20 text-on-error-container px-4 py-3 rounded-lg mb-6 font-label text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-8">
        <div className="flex flex-col">
          <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body italic text-on-surface-variant text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-label font-bold not-italic hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
