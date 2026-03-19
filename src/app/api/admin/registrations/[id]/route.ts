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
    const { status, rejectionReason } = await request.json()

    const registration = await prisma.eventRegistration.update({
      where: { id: params.id },
      data: {
        status,
        rejectionReason,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}
