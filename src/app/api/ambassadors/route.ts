import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const order = searchParams.get('order') || ''
  const role = searchParams.get('role') || ''

  try {
    const ambassadors = await prisma.profile.findMany({
      where: {
        isActive: true,
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          order ? { order: order as any } : {},
          role ? { role: role as any } : {},
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        batch: true,
        order: true,
        committee: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    })

    return NextResponse.json(ambassadors)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ambassadors' },
      { status: 500 }
    )
  }
}
