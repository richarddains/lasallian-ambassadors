import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const profile = await getProfile()

  if (!profile) {
    return null
  }

  const upcomingEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
  })

  const userRegistrations = await prisma.eventRegistration.findMany({
    where: {
      profileId: profile.id,
    },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  const assignedTasks = await prisma.task.findMany({
    where: {
      assignedToId: profile.id,
      status: { not: 'COMPLETED' },
    },
    orderBy: {
      dueDate: 'asc',
    },
    take: 5,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome, {profile.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Your role: {profile.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Upcoming Events</p>
          <p className="text-3xl font-bold text-blue-600">{upcomingEvents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Your Registrations</p>
          <p className="text-3xl font-bold text-green-600">
            {userRegistrations.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Active Tasks</p>
          <p className="text-3xl font-bold text-orange-600">{assignedTasks.length}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <ul className="space-y-3">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No upcoming events</p>
        )}
      </div>

      {/* Active Tasks */}
      {assignedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Tasks</h2>
          <ul className="space-y-3">
            {assignedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
