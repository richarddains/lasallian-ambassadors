import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  bio: z.string().optional(),
  batch: z.number().optional().nullable(),
  order: z
    .enum(['CORE', 'ASPIRING_CORE', 'NON_FIRST_TIMERS', 'FIRST_TIMERS'])
    .optional()
    .nullable(),
  committee: z.enum(['MARKETING_RELATIONS', 'HUMAN_RESOURCE', 'DOCUMENTATIONS_PUBLICITY', 'OPERATIONS_FINANCE']).optional().nullable(),
  avatarUrl: z.string().url().optional(),
})

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  eventType: z.enum(['ADMIN_REQUEST', 'LAMB_MODULE', 'LAMB_EVENT', 'MAJOR_EVENT']),
  slots: z.number().positive().optional().nullable(),
  lambSlots: z.number().positive().optional().nullable(),
  docuLambSlots: z.number().positive().optional().nullable(),
  attire: z.enum(['DAY1_UNIFORM', 'DAY2_UNIFORM', 'USHERING_ATTIRE', 'GAWAD_LASALYANO']).optional().nullable(),
  aicId: z.string().optional().nullable(),
  bannerUrl: z.string().url().optional(),
})

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
})

export const CreateRegistrationSchema = z.object({
  eventId: z.string(),
  volunteerType: z.enum(['LAMB', 'DOCULAMB']).optional(),
})
