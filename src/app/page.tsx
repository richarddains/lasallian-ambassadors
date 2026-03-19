import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Lasallian Ambassadors
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect, coordinate, and celebrate the Lasallian community
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  )
}
