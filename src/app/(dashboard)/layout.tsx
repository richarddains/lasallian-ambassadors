import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 fixed h-screen overflow-y-auto">
        <Link href="/dashboard" className="text-2xl font-bold mb-8 block">
          Lasallian
        </Link>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/directory"
            className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Directory
          </Link>
          <Link
            href="/dashboard/events"
            className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Events
          </Link>
          <Link
            href="/dashboard/my-registrations"
            className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            My Registrations
          </Link>
          <Link
            href="/dashboard/tasks"
            className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Tasks
          </Link>

          {/* Admin section */}
          {(profile.role === 'COORDINATOR' ||
            profile.role === 'LEAD' ||
            profile.role === 'ADMIN') && (
            <div className="mt-6 pt-6 border-t border-blue-700">
              <p className="text-xs font-semibold text-blue-300 mb-3">ADMIN</p>
              <Link
                href="/dashboard/admin/registrations"
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
              >
                Approvals
              </Link>
              <Link
                href="/dashboard/admin/ambassadors"
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
              >
                Ambassadors
              </Link>
              <Link
                href="/dashboard/admin/tasks"
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
              >
                Assign Tasks
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-blue-700">
            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
            >
              Profile Settings
            </Link>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-blue-700">
          <p className="text-sm text-blue-300 mb-2">Logged in as</p>
          <p className="font-semibold">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-xs text-blue-300 mt-1">{profile.role}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
