'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavLink {
  href: string
  label: string
  icon: string
}

interface Props {
  navLinks: NavLink[]
  adminLinks: NavLink[]
  isAdmin: boolean
  firstName: string
  lastName: string
  role: string
  children: React.ReactNode
}

export default function SidebarNav({
  navLinks,
  adminLinks,
  isAdmin,
  firstName,
  lastName,
  role,
  children,
}: Props) {
  const [open, setOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex flex-col h-screen bg-slate-50 border-r border-slate-200/80 transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'w-64' : 'w-0'
        }`}
      >
        {/* Fixed-width inner so content doesn't reflow during animation */}
        <div className="w-64 flex flex-col h-full py-7 px-5">
          <div className="mb-8 px-2">
            <Link href="/dashboard">
              <h1 className="text-base font-black text-emerald-900 font-headline leading-none">
                DLSU LAMB
              </h1>
              <p className="text-[9px] tracking-[0.22em] uppercase text-emerald-600 font-label font-bold mt-1">
                Ambassador Portal
              </p>
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm transition-all duration-150 whitespace-nowrap ${
                    active
                      ? 'text-emerald-900 font-bold bg-emerald-100/70 border-r-[3px] border-emerald-700'
                      : 'text-slate-500 font-medium hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                      active ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              )
            })}

            {isAdmin && (
              <div className="pt-5 mt-5 border-t border-slate-200/80">
                <p className="font-label text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 px-3 mb-2">
                  Management
                </p>
                {adminLinks.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm transition-all duration-150 whitespace-nowrap ${
                        active
                          ? 'text-emerald-900 font-bold bg-emerald-100/70 border-r-[3px] border-emerald-700'
                          : 'text-slate-500 font-medium hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                          active ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Content area */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          open ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between px-7 py-3.5">
            {/* Left: burger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen((o) => !o)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <span className="material-symbols-outlined text-[22px] text-slate-600">
                  {open ? 'menu_open' : 'menu'}
                </span>
              </button>
              {!open && (
                <span className="font-headline font-black text-emerald-900 text-sm tracking-tight">
                  DLSU LAMB
                </span>
              )}
            </div>

            {/* Right: notifications + user dropdown */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-[22px] text-slate-500">
                  notifications
                </span>
              </button>

              {/* User dropdown */}
              <div ref={dropdownRef} className="relative pl-3 ml-1 border-l border-slate-200">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden sm:block">
                    <p className="font-label font-bold text-xs text-emerald-900 leading-tight">
                      {firstName} {lastName}
                    </p>
                    <p className="font-label text-[9px] text-slate-400 uppercase tracking-widest">
                      {role.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-on-primary text-sm flex-shrink-0">
                    {firstName[0]}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-label font-bold text-sm text-emerald-900 truncate">
                        {firstName} {lastName}
                      </p>
                      <p className="font-label text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                        {role.replace(/_/g, ' ')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-label font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-900 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          manage_accounts
                        </span>
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-label font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
