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
  avatarUrl: z.string().url().optional(),
})

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  slots: z.number().positive().optional().nullable(),
  requiresApproval: z.boolean().default(false),
  bannerUrl: z.string().url().optional(),
})

export const UpdateEventSchema = CreateEventSchema.partial()

export const CreateRegistrationSchema = z.object({
  eventId: z.string(),
})

export const ApproveRegistrationSchema = z.object({
  registrationId: z.string(),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  assignedToId: z.string(),
  eventId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const UpdateTaskSchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'COMPLETED']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
})
