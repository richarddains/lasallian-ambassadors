# Setup Guide - Lasallian Ambassadors Web App

## Phase 1 (Week 1): Foundation & Auth ✅

This guide walks through setting up the development environment for the Lasallian Ambassadors Web App.

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git
- A Supabase account
- A Resend account (for email notifications)

### Step 1: Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and log in or create an account
2. Create a new project:
   - Name: "lasallian-ambassadors"
   - Region: Choose closest to your location
   - Database password: Save securely
3. Wait for the project to be created
4. From the dashboard, navigate to **Settings > API**
5. Copy the following values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Database Connection Strings

1. In Supabase dashboard, go to **Settings > Database**
2. Find the connection string section
3. Copy the **"connection pooling"** string (port 6543) → `DATABASE_URL`
4. Copy the **"direct connection"** string (port 5432) → `DIRECT_URL`

Replace the placeholders with your actual credentials:
```
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?schema=public
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres?schema=public
```

### Step 3: Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to API Keys
3. Copy your API key → `RESEND_API_KEY`

### Step 4: Create .env.local

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:your_password@your_host:6543/postgres?schema=public
DIRECT_URL=postgresql://postgres:your_password@your_host:5432/postgres?schema=public

# Email
RESEND_API_KEY=your_resend_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Run Database Migrations

```bash
# This creates all tables in your Supabase database
npx prisma migrate dev --name init
```

This will:
- Create all tables (profiles, events, registrations, tasks)
- Generate the Prisma Client
- Prompt you to create a migration name (just press enter for "init")

### Step 6: Create Supabase Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `avatars`
   - Make it **Public**
3. Create another bucket named `event-banners`
   - Make it **Public**

These are for storing user profile pictures and event banners.

### Step 7: Set Up Supabase Auth

1. In Supabase dashboard, go to **Authentication > Providers**
2. Ensure "Email" is enabled (it is by default)
3. Go to **Settings > Auth** and note:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### Step 8: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 9: Test Registration

1. Navigate to `http://localhost:3000/register`
2. Create a test account
3. You should be redirected to the dashboard
4. Visit `/dashboard/profile` to complete your profile

### Initial Admin Setup

To create an admin user:

1. Register an account normally through the UI
2. Connect to your Supabase database and run:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE email = 'your_email@example.com';
```

Or use Supabase's Table Editor to manually change the role.

---

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm run start
```

### Code Quality
```bash
npm run lint
```

---

## Deployment to Vercel

1. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/lasallian-ambassadors.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and connect your GitHub repository

3. Set environment variables in Vercel project settings:
   - Add all variables from your `.env.local`
   - Make sure to use the **production** database URLs

4. Deploy!

---

## Troubleshooting

### "Connection refused" when migrating
- Ensure `DIRECT_URL` uses port 5432 (direct connection)
- Check your Supabase database is active

### Profile creation fails after signup
- Check that your database migration completed
- Verify service role key is correct

### Storage bucket uploads fail
- Ensure buckets are set to **Public**
- Check CORS settings in Supabase Storage

### Email notifications not working
- Verify Resend API key is correct
- Check that email domain is verified in Resend (if using custom domain)

---

## Next Steps

After setup is complete, the following Week 1 features are available:

✅ User authentication (register, login, logout)
✅ Profile creation and editing
✅ Avatar upload
✅ Dashboard overview
✅ Role-based access control

See README.md for the full implementation roadmap.

---

For issues or questions, open an issue on GitHub or contact the development team.
