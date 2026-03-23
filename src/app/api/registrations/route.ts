import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateRegistrationSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(_request: NextRequest) {
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
            status: true,
            eventType: true,
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
    const body = await request.json()
    const { eventId, volunteerType } = CreateRegistrationSchema.parse(body)

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        eventType: true,
        status: true,
        slots: true,
        lambSlots: true,
        docuLambSlots: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // LAmb Modules are announcements only — no sign-up
    if (event.eventType === 'LAMB_MODULE') {
      return NextResponse.json(
        { error: 'This is an announcement — no sign-up required.' },
        { status: 400 }
      )
    }

    // Admin Request & Major Event require a volunteer type
    if (event.eventType !== 'LAMB_EVENT' && !volunteerType) {
      return NextResponse.json(
        { error: 'Volunteer type is required for this event.' },
        { status: 400 }
      )
    }

    // Check for duplicate registration
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_profileId: { eventId, profileId: profile.id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      )
    }

    // Per-type slot check
    let status: 'APPROVED' | 'WAITLISTED' = 'APPROVED'
    if (event.eventType === 'LAMB_EVENT') {
      if (event.slots != null) {
        const totalApproved = await prisma.eventRegistration.count({
          where: { eventId, status: 'APPROVED' },
        })
        if (totalApproved >= event.slots) status = 'WAITLISTED'
      }
    } else {
      if (volunteerType === 'LAMB' && event.lambSlots != null) {
        const lambApproved = await prisma.eventRegistration.count({
          where: { eventId, status: 'APPROVED', volunteerType: 'LAMB' },
        })
        if (lambApproved >= event.lambSlots) status = 'WAITLISTED'
      } else if (volunteerType === 'DOCULAMB' && event.docuLambSlots != null) {
        const docuLambApproved = await prisma.eventRegistration.count({
          where: { eventId, status: 'APPROVED', volunteerType: 'DOCULAMB' },
        })
        if (docuLambApproved >= event.docuLambSlots) status = 'WAITLISTED'
      }
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        profileId: profile.id,
        status,
        // null for LAMB_EVENT pre-registrations
        volunteerType: event.eventType === 'LAMB_EVENT' ? null : volunteerType,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
