import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: eventId ? { eventId } : undefined,
      include: {
        profile: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        event: {
          select: { id: true, title: true, startTime: true },
        },
      },
      orderBy: [
        { cancellationRequestedAt: 'desc' },
        { registeredAt: 'asc' },
      ],
    })

    return NextResponse.json(registrations)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
  }
}
