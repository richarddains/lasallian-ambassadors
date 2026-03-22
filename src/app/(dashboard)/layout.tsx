import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { href: '/directory', label: 'Directory', icon: 'people' },
    { href: '/events', label: 'Events', icon: 'event' },
    { href: '/my-registrations', label: 'My Sign-ups', icon: 'how_to_reg' },
    { href: '/tasks', label: 'Tasks', icon: 'task_alt' },
  ]

  const adminLinks = [
    { href: '/admin/registrations', label: 'Approvals', icon: 'approval' },
    { href: '/admin/ambassadors', label: 'Ambassadors', icon: 'manage_accounts' },
    { href: '/admin/tasks', label: 'Assign Tasks', icon: 'assignment' },
  ]

  const isAdmin = ['ASPIRING_CORE', 'CORE'].includes(profile.role)

  return (
    <SidebarNav
      navLinks={navLinks}
      adminLinks={adminLinks}
      isAdmin={isAdmin}
      firstName={profile.firstName}
      lastName={profile.lastName}
      role={profile.role}
    >
      {children}
    </SidebarNav>
  )
}
