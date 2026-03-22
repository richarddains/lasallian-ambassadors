import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-headline font-black text-emerald-900 text-base">DLSU LAMB</span>
            <span className="font-label font-bold text-[9px] tracking-[0.22em] uppercase text-emerald-600 mt-0.5">Ambassador Portal</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
