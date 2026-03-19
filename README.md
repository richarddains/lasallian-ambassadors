# Lasallian Ambassadors Web App

A full-stack web application for managing the DLSU Lasallian Ambassadors organization, featuring ambassador directory, event management, and volunteering sign-up system with admin approval workflows.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **File Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod
- **Email**: Resend
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://supabase.com))
- A Resend account for email notifications ([sign up here](https://resend.com))

## Getting Started

### 1. Set up Supabase

1. Create a new project in Supabase
2. Get your project credentials:
   - Project URL: `https://[project-ref].supabase.co`
   - Anon Public Key: Available in Settings > API
   - Service Role Secret Key: Available in Settings > API

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then update `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (PostgreSQL connection string for migrations, port 6543)
- `DIRECT_URL` (PostgreSQL direct connection, port 5432)
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 3. Set up the Database

```bash
# Install Prisma CLI (if not already installed)
npm install -g prisma

# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create the migration files
# 2. Apply the migration to your Supabase database
# 3. Generate Prisma Client
```

### 4. Set up Supabase Storage Buckets

Create two public storage buckets in your Supabase dashboard:
1. `avatars` — for user profile photos
2. `event-banners` — for event images

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & registration
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API route handlers
│   └── page.tsx             # Home page
├── components/              # Reusable UI components
├── lib/
│   ├── auth.ts              # Authentication utilities
│   ├── prisma.ts            # Prisma singleton
│   └── supabase/            # Supabase client setup
└── middleware.ts            # Route protection & redirects
```

## Ambassador Hierarchy

- **Core**: Senior ambassadors with leadership experience
- **Aspiring Core (AC)**: Ambassadors working towards core status
- **Non-First Timers**: Returning ambassadors
- **First Timers**: New ambassadors

## Roles & Permissions

- **AMBASSADOR**: Basic member, can view directory and sign up for events
- **COORDINATOR**: Can manage events and registrations
- **LEAD**: Coordinator + can assign tasks and manage other coordinators
- **ADMIN**: Full system access

## Development Phases

### Phase 1 (Week 1): Foundation & Auth ✅
- [x] Next.js 14 setup with TypeScript
- [x] Supabase Auth integration
- [x] Prisma schema with ambassador hierarchy
- [x] Login/Register pages
- [x] Dashboard layout
- [ ] Profile completion page
- [ ] Avatar upload to Supabase Storage

### Phase 2 (Week 2): Directory & Events
- [ ] Ambassador directory with search/filters
- [ ] Event management (CRUD)
- [ ] Event registration/sign-up
- [ ] Event status workflow

### Phase 3 (Week 3-4): Admin & Deployment
- [ ] Admin approval workflows
- [ ] Email notifications via Resend
- [ ] Task assignment system
- [ ] Waitlist & slot management
- [ ] Vercel deployment

## Deployment

```bash
# Push to GitHub and connect to Vercel
# Vercel will auto-deploy on push to main

# Set environment variables in Vercel project settings
```

## Troubleshooting

### Prisma Migration Issues
- Ensure `DATABASE_URL` uses port 6543 (pooled connection)
- Ensure `DIRECT_URL` uses port 5432 (direct connection)
- Run `npx prisma migrate resolve --applied init` if migration gets stuck

### Supabase RLS Policies
Check that Supabase has RLS policies disabled initially for development, or set appropriate policies for the `profiles`, `events`, `registrations`, and `tasks` tables.

## License

MIT
