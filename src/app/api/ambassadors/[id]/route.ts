import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const ambassador = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        batch: true,
        order: true,
        role: true,
        avatarUrl: true,
      },
    })

    if (!ambassador) {
      return NextResponse.json(
        { error: 'Ambassador not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ambassador)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ambassador' },
      { status: 500 }
    )
  }
}
