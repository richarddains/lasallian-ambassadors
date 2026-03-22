# Lasallian Ambassadors - Development Notes

## Project Overview

Full-stack web app for DLSU Lasallian Ambassadors organization with ambassador directory, event management, and volunteering system.

## Key Information

### Ambassador Hierarchy
- **Core**: Senior ambassadors with leadership experience
- **Aspiring Core (AC)**: Working towards core status
- **Non-First Timers**: Returning ambassadors
- **First Timers**: New ambassadors

### User Roles
- **AMBASSADOR**: Basic member
- **COORDINATOR**: Can manage events and sign-ups
- **LEAD**: Coordinator + assign tasks
- **ADMIN**: Full system access

### Database

**Prisma ORM** with **PostgreSQL** (Supabase)

Key models:
- `Profile` - User profiles (linked to Supabase Auth)
- `Event` - Events created by coordinators
- `EventRegistration` - Sign-ups with approval workflow
- `Task` - Tasks assigned to ambassadors

See `prisma/schema.prisma` for full schema.

### Architecture

**Next.js 14 App Router** with:
- Server components for auth checks and data fetching
- Client components for interactive forms
- Route handlers for APIs
- Middleware for auth and role guards
- Supabase SSR pattern for cookie-based sessions

**Authentication**: Supabase Auth (email/password)
**File Storage**: Supabase Storage (avatars, event banners)
**Emails**: Resend API

## Development Patterns

### Auth & Role Guards

```typescript
// In Server Components
import { getProfile, getUser, requireRole } from '@/lib/auth'

const profile = await getProfile()
if (!profile) return redirect('/login')
```

```typescript
// In API Routes
const roleCheck = await requireRoleResponse(['COORDINATOR', 'LEAD'])
if (roleCheck) return roleCheck
```

### Database Queries

```typescript
import { prisma } from '@/lib/prisma'

// Always use include/select to minimize data transfer
const events = await prisma.event.findMany({
  where: { status: 'PUBLISHED' },
  select: { id: true, title: true }, // Be specific
  orderBy: { startTime: 'asc' },
})
```

### Form Validation

All user inputs validated with Zod schemas in `src/lib/validations/index.ts`:

```typescript
import { CreateEventSchema } from '@/lib/validations'

try {
  const data = CreateEventSchema.parse(body)
  // Safe to use data
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }
}
```

### File Uploads

Upload directly to Supabase Storage from browser:

```typescript
const { error } = await supabase.storage
  .from('avatars')
  .upload(fileName, file)
```

Never route large files through Next.js (4.5MB limit).

### Error Handling

Use consistent error responses:

```typescript
return NextResponse.json(
  { error: 'User-friendly message' },
  { status: 400 }
)
```

## API Routes by Feature

### Auth
- `GET /api/profile` - Current user profile
- `PATCH /api/profile` - Update profile

### Directory
- `GET /api/ambassadors` - Search ambassadors
- `GET /api/ambassadors/[id]` - Ambassador detail

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Event detail

### Registrations
- `GET /api/registrations` - User's registrations
- `POST /api/registrations` - Sign up for event

### Admin
- `GET /api/admin/registrations` - Pending approvals
- `PATCH /api/admin/registrations/[id]` - Approve/reject
- `GET /api/admin/ambassadors` - List all users
- `PATCH /api/admin/ambassadors/[id]` - Change role/status

### Tasks
- `GET /api/tasks` - Assigned tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/[id]` - Update task status

## Week 1 Complete Features

✅ User registration and login
✅ Profile creation and editing
✅ Avatar upload to Supabase Storage
✅ Ambassador directory with search
✅ Dashboard with role-aware widgets
✅ Role-based access control
✅ Ambassador hierarchy (Core, AC, Non-First Timers, First Timers)

## Week 2 TODO (Directory & Events)

- [ ] Advanced directory filters (batch, role)
- [ ] Event CRUD (create, edit, publish, cancel)
- [ ] Event registration with slot management
- [ ] Event detail view with banner
- [ ] Event status workflow (DRAFT → PUBLISHED → COMPLETED)

## Week 3-4 TODO (Admin & Deployment)

- [ ] Registration approval workflow with admin dashboard
- [ ] Email notifications via Resend on status changes
- [ ] Waitlist with automatic promotion when slots open
- [ ] Task creation and assignment
- [ ] Admin user management (roles, deactivate users)
- [ ] Dashboard analytics widgets
- [ ] Mobile responsiveness polish
- [ ] Vercel deployment

## Supabase Storage Setup

### Avatar Uploads
The `avatars` bucket must exist in Supabase Storage and be set to **Public**. Without this, all uploads silently fail with a storage error.

Required RLS policies (run in Supabase SQL Editor):
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Important Gotchas

1. **Prisma Singleton** - Required in dev to avoid pool exhaustion
2. **Supabase SSR** - Use `getUser()` not `getSession()` in middleware
3. **RLS Policies** - Currently disabled for dev. Enable in production!
4. **Role Guards** - Always check both UI (hiding) AND API (requireRole)
5. **Duplicate Registrations** - Catch `P2002` error for nice UX
6. **Transaction Safety** - Use `prisma.$transaction()` for waitlist promotions
7. **Environment Variables** - Never prefix service role key with `NEXT_PUBLIC_`

## Running the Project

```bash
# Install dependencies
npm install

# Set up environment (.env.local)
cp .env.example .env.local
# Edit with your Supabase credentials

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Useful Commands

```bash
# Database management
npx prisma studio        # Browse data
npx prisma migrate dev   # Create + run migration
npx prisma db push      # Push schema to DB (dev only)

# Code quality
npm run lint
npm run build

# Check types
npx tsc --noEmit
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Login, register
│   ├── (dashboard)/               # Protected routes
│   │   ├── layout.tsx            # Sidebar nav
│   │   ├── dashboard/            # Home page
│   │   ├── directory/            # Ambassador search
│   │   ├── events/               # Event listings
│   │   ├── profile/              # User settings
│   │   ├── my-registrations/     # User's signups
│   │   ├── tasks/                # Assigned tasks
│   │   └── admin/                # Admin-only pages
│   ├── api/                      # Route handlers
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
├── lib/
│   ├── auth.ts                   # Auth utilities
│   ├── prisma.ts                 # Prisma singleton
│   ├── supabase/                 # Supabase clients
│   └── validations/              # Zod schemas
├── middleware.ts                 # Route protection
└── tailwind.config.ts            # Tailwind config
```

## Testing

For testing in development:
1. Use test accounts registered through the UI
2. Manually verify flows in browser
3. Check database state in Supabase dashboard

For production testing, see deployment section of SETUP.md.

## Deployment

See SETUP.md "Deployment to Vercel" section.

Key points:
- Use production database URLs
- Set all env variables in Vercel
- Enable Supabase RLS policies for security
- Set proper redirect URLs in Supabase Auth

## Team Notes

- Coordinate schema changes in `prisma/schema.prisma` before migrating
- Always validate at API boundaries (don't trust client)
- Keep components small and focused
- Use TypeScript strictly - no `any` types
- Follow the existing code style and patterns

---

Last updated: 2026-03-19
Current phase: Week 1 (Foundation & Auth) ✅
