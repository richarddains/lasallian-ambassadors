import { NextRequest, NextResponse } from 'next/server'
import { getProfile, requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateEventSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(_request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        // For coordinators+, show all events. For ambassadors, only show published
        status:
          profile.role === 'AMBASSADOR' ? 'PUBLISHED' : undefined,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    const eventsWithCounts = events.map((event) => ({
      ...event,
      registrationsCount: event._count.registrations,
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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
