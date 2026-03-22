import { NextRequest, NextResponse } from 'next/server'
import { getProfile, requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateEventSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        aic: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { registrations: true } },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...event,
      registrationsCount: event._count.registrations,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  try {
    const body = await request.json()
    const data = UpdateEventSchema.parse(body)

    const event = await prisma.event.update({
      where: { id },
      data,
    })

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('PATCH /api/events/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  try {
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
