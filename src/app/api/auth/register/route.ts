import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RegisterSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = RegisterSchema.parse(body)

    const profile = await prisma.profile.create({
      data: {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    // Duplicate user
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
