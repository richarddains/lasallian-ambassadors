import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  batch: z.number().optional().nullable(),
  order: z.enum(['CORE', 'ASPIRING_CORE', 'NON_FIRST_TIMERS', 'FIRST_TIMERS']).optional().nullable(),
  committee: z.enum(['MARKETING_RELATIONS', 'HUMAN_RESOURCE', 'DOCUMENTATIONS_PUBLICITY', 'OPERATIONS_FINANCE']).optional().nullable(),
  avatarUrl: z.string().url().optional(),
})

export async function GET(_request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(profile)
}

export async function PATCH(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = UpdateProfileSchema.parse(body)

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
