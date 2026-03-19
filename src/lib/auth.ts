import { createClient } from './supabase/server'
import { prisma } from './prisma'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const user = await getUser()
  if (!user) return null

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })
  return profile
}

export async function requireRole(requiredRoles: Role | Role[]) {
  const profile = await getProfile()

  if (!profile) {
    return {
      error: 'Unauthorized',
      status: 401,
    }
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(profile.role)) {
    return {
      error: 'Forbidden',
      status: 403,
    }
  }

  return { profile, status: 200 }
}

export async function requireRoleResponse(requiredRoles: Role | Role[]) {
  const result = await requireRole(requiredRoles)

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return null
}
