import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const roleCheck = await requireRoleResponse(['COORDINATOR', 'LEAD', 'ADMIN'])
  if (roleCheck) return roleCheck

  try {
    const ambassadors = await prisma.profile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
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
