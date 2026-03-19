import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { registrations: true },
        },
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
