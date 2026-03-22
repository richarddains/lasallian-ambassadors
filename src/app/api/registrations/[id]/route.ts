import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Ambassador requests cancellation with a reason
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { cancellationReason } = await request.json()

    if (!cancellationReason?.trim()) {
      return NextResponse.json({ error: 'A reason is required' }, { status: 400 })
    }

    // Only the registration owner can request cancellation
    const registration = await prisma.eventRegistration.findUnique({ where: { id } })
    if (!registration) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (registration.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.eventRegistration.update({
      where: { id },
      data: {
        cancellationReason: cancellationReason.trim(),
        cancellationRequestedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
