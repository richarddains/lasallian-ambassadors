import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ACCORE directly removes a registration
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  try {
    await prisma.eventRegistration.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove registration' }, { status: 500 })
  }
}
