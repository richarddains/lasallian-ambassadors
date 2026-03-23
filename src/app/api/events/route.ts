import { NextRequest, NextResponse } from 'next/server'
import { getProfile, requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateEventSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    let dateFilter = {}
    if (yearParam && monthParam) {
      const y = parseInt(yearParam)
      const m = parseInt(monthParam)
      const startOfMonth = new Date(y, m - 1, 1)
      const endOfMonth = new Date(y, m, 0, 23, 59, 59)
      dateFilter = { startTime: { gte: startOfMonth, lte: endOfMonth } }
    }

    const events = await prisma.event.findMany({
      where: {
        status: profile.role === 'AMBASSADOR' ? 'PUBLISHED' : undefined,
        ...dateFilter,
      },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          where: { status: 'APPROVED' },
          select: {
            profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          take: 3,
          orderBy: { registeredAt: 'asc' },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    const eventsWithCounts = events.map((event) => ({
      ...event,
      registrationsCount: event._count.registrations,
      registrants: event.registrations.map((r) => r.profile),
      registrations: undefined,
      _count: undefined,
    }))

    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Only COORDINATOR+ can create events
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  const profile = await getProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = CreateEventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        ...data,
        createdById: profile.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid input' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
