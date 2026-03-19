import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const roleCheck = await requireRoleResponse(['COORDINATOR', 'LEAD', 'ADMIN'])
  if (roleCheck) return roleCheck

  try {
    const { role, isActive } = await request.json()

    const ambassador = await prisma.profile.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(typeof isActive !== 'undefined' && { isActive }),
      },
    })

    return NextResponse.json(ambassador)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ambassador' },
      { status: 500 }
    )
  }
}
