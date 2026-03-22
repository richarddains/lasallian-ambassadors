import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const profile = await getProfile()

  if (!profile) {
    return null
  }

  const upcomingEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: 'asc' },
    take: 5,
  })

  const userRegistrations = await prisma.eventRegistration.findMany({
    where: { profileId: profile.id },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const assignedTasks = await prisma.task.findMany({
    where: {
      assignedToId: profile.id,
      status: { not: 'COMPLETED' },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <span className="font-label font-bold text-primary tracking-widest uppercase text-xs block mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter">
          Welcome back, {profile.firstName}.
        </h1>
        <p className="font-body italic text-on-surface-variant mt-2">
          Here&apos;s what&apos;s happening in the organization.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">event</span>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-bold">Upcoming Events</p>
          </div>
          <p className="font-headline font-black text-4xl text-primary">{upcomingEvents.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">how_to_reg</span>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-bold">Your Sign-ups</p>
          </div>
          <p className="font-headline font-black text-4xl text-secondary">{userRegistrations.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary text-2xl">task_alt</span>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-bold">Active Tasks</p>
          </div>
          <p className="font-headline font-black text-4xl text-tertiary">{assignedTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">Upcoming Events</h2>
            <Link href="/events" className="font-label text-xs font-bold uppercase tracking-widest text-primary hover:underline">
              View all
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <p className="font-label font-semibold text-on-surface text-sm">{event.title}</p>
                      <p className="font-body italic text-xs text-on-surface-variant mt-0.5">
                        {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-sm">arrow_forward</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">event_busy</span>
              <p className="font-body italic text-on-surface-variant text-sm">No upcoming events</p>
            </div>
          )}
        </div>

        {/* Active Tasks */}
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">Your Tasks</h2>
            <Link href="/tasks" className="font-label text-xs font-bold uppercase tracking-widest text-primary hover:underline">
              View all
            </Link>
          </div>
          {assignedTasks.length > 0 ? (
            <ul className="space-y-3">
              {assignedTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-outline text-xl mt-0.5">radio_button_unchecked</span>
                  <div>
                    <p className="font-label font-semibold text-on-surface text-sm">{task.title}</p>
                    <p className="font-body italic text-xs text-on-surface-variant mt-0.5">{task.description}</p>
                    {task.dueDate && (
                      <p className="font-label text-xs text-tertiary mt-1 font-bold">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">task_alt</span>
              <p className="font-body italic text-on-surface-variant text-sm">No active tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
