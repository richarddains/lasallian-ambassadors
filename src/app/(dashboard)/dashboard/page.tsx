import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CalendarDashboard from './CalendarDashboard'

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) return null

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-based

  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const [rawEvents, totalRegistrations] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: profile.role === 'AMBASSADOR' ? 'PUBLISHED' : undefined,
        startTime: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startTime: true,
        endTime: true,
        attire: true,
        status: true,
        eventType: true,
        slots: true,
        lambSlots: true,
        docuLambSlots: true,
        bannerUrl: true,
        aicId: true,
        aic: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.eventRegistration.count({
      where: { profileId: profile.id },
    }),
  ])

  const events = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
    attire: e.attire,
    status: e.status,
    eventType: e.eventType,
    slots: e.slots,
    lambSlots: e.lambSlots,
    docuLambSlots: e.docuLambSlots,
    requiresApproval: e.requiresApproval,
    bannerUrl: e.bannerUrl,
    aicId: e.aicId,
    aic: e.aic,
    registrationsCount: e._count.registrations,
  }))

  return (
    <CalendarDashboard
      profile={{ firstName: profile.firstName, lastName: profile.lastName, role: profile.role }}
      initialEvents={events}
      initialYear={year}
      initialMonth={month}
      totalRegistrations={totalRegistrations}
    />
  )
}
