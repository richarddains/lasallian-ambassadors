import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        profileId: profile.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            location: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { eventId } = await request.json()

    // Check for duplicate registration
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_profileId: {
          eventId,
          profileId: profile.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      )
    }

    // Check if event has available slots
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: 'APPROVED' } } },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const status = event.slots && event._count.registrations >= event.slots
      ? 'WAITLISTED'
      : event.requiresApproval ? 'PENDING' : 'APPROVED'

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        profileId: profile.id,
        status,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
