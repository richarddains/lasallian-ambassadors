import { NextRequest, NextResponse } from 'next/server'
import { requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateAttendanceSchema = z.object({
  attendance: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']).nullable(),
})

// Core / Aspiring Core marks attendance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  try {
    const body = await request.json()
    const { attendance } = UpdateAttendanceSchema.parse(body)

    const updated = await prisma.eventRegistration.update({
      where: { id },
      data: { attendance },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}

// Core / Aspiring Core removes a registration
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const roleCheck = await requireRoleResponse(['ASPIRING_CORE', 'CORE'])
  if (roleCheck) return roleCheck

  try {
    await prisma.$transaction(async (tx) => {
      const reg = await tx.eventRegistration.findUnique({
        where: { id },
        select: { eventId: true, volunteerType: true, status: true },
      })
      if (!reg) return

      await tx.eventRegistration.delete({ where: { id } })

      // Promote oldest waitlisted registration if the removed one was APPROVED
      if (reg.status === 'APPROVED') {
        const next = await tx.eventRegistration.findFirst({
          where: {
            eventId: reg.eventId,
            status: 'WAITLISTED',
            // For typed events, promote same volunteer type
            ...(reg.volunteerType ? { volunteerType: reg.volunteerType } : {}),
          },
          orderBy: { registeredAt: 'asc' },
        })
        if (next) {
          await tx.eventRegistration.update({
            where: { id: next.id },
            data: { status: 'APPROVED' },
          })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove registration' }, { status: 500 })
  }
}
