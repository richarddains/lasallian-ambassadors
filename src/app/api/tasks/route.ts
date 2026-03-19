import { NextRequest, NextResponse } from 'next/server'
import { getProfile, requireRoleResponse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateTaskSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  const profile = await getProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: profile.id,
      },
      include: {
        event: {
          select: { title: true },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Only LEAD+ can assign tasks
  const roleCheck = await requireRoleResponse(['LEAD', 'ADMIN'])
  if (roleCheck) return roleCheck

  try {
    const body = await request.json()
    const data = CreateTaskSchema.parse(body)

    const task = await prisma.task.create({
      data,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
