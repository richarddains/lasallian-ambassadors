import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const roleCheck = await requireRoleResponse(['COORDINATOR', 'LEAD', 'ADMIN'])
  if (roleCheck) return roleCheck

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'asc',
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
