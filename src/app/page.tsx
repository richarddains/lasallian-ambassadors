import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-label">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-headline font-black text-emerald-900 text-base">DLSU LAMB</span>
            <span className="font-label font-bold text-[9px] tracking-[0.22em] uppercase text-emerald-600 mt-0.5">Ambassador Portal</span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="font-headline font-bold tracking-tight text-sm uppercase px-5 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="px-8 py-20 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <span className="font-label font-bold text-tertiary tracking-widest uppercase text-sm block mb-4">
              De La Salle University
            </span>
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-surface tracking-tighter leading-none mb-8">
              The Face of{' '}
              <span className="text-primary font-body italic font-normal">
                Lasallian
              </span>{' '}
              Excellence.
            </h1>
            <p className="font-body text-xl text-on-surface-variant max-w-xl leading-relaxed mb-10">
              A legacy of service, leadership, and faith. For over three
              decades, the Lasallian Ambassadors have stood as the premier
              student representatives of De La Salle University.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="px-8 py-4 rounded-lg bg-primary text-on-primary font-headline font-bold uppercase tracking-tight text-sm hover:opacity-90 transition-all"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-headline font-bold uppercase tracking-tight text-sm hover:bg-secondary-container transition-all"
              >
                Join Now
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-surface-container-high rounded-xl overflow-hidden editorial-shadow">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-end p-8">
                <div>
                  <p className="font-headline font-black text-on-primary text-4xl mb-2">35+</p>
                  <p className="font-label text-on-primary/80 uppercase tracking-widest text-sm">Years of Tradition</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-tertiary-fixed p-8 max-w-xs editorial-shadow rounded-lg">
              <p className="font-body italic text-on-tertiary-fixed leading-tight text-lg">
                &ldquo;To serve with heart and lead with vision—this is the mark
                of a true Ambassador.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-32 max-w-screen-2xl mx-auto px-8 mt-12">
          <div className="text-center mb-20">
            <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-4">
              The Four Pillars
            </h2>
            <div className="h-1 w-20 bg-tertiary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'volunteer_activism', title: 'Service', desc: 'We dedicate ourselves to the university and the community, embodying the spirit of servant leadership in all our endeavors.' },
              { icon: 'groups', title: 'Leadership', desc: 'Developing character and competence, we lead by example and inspire fellow students toward collective excellence.' },
              { icon: 'star', title: 'Excellence', desc: 'In hospitality, communication, and performance, we maintain the gold standard of DLSU\'s institutional image.' },
              { icon: 'church', title: 'Faith', desc: 'Our actions are grounded in the Lasallian faith, finding God\'s presence in the people we serve and the missions we undertake.' },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="group p-8 bg-surface-container-low hover:bg-primary transition-colors duration-500 rounded-xl"
              >
                <span className="material-symbols-outlined text-4xl text-primary group-hover:text-on-primary mb-6 block transition-colors">
                  {pillar.icon}
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-on-primary mb-4 transition-colors">
                  {pillar.title}
                </h3>
                <p className="font-body text-on-surface-variant group-hover:text-on-primary/80 transition-colors">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/10 text-center px-8">
          <div className="max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-tertiary text-4xl mb-8 block">format_quote</span>
            <blockquote className="font-body italic text-3xl md:text-4xl text-on-surface leading-tight mb-8">
              &ldquo;The Ambassadors are the keepers of our stories, the guides to our
              future, and the heartbeat of our heritage.&rdquo;
            </blockquote>
            <cite className="font-headline font-bold text-primary uppercase tracking-widest text-sm not-italic">
              — Office of the President
            </cite>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-100 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-screen-2xl mx-auto">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-headline font-black text-emerald-900 text-base block leading-none">DLSU LAMB</span>
              <span className="font-label font-bold text-[9px] tracking-[0.22em] uppercase text-emerald-600 mt-0.5 block">Ambassador Portal</span>
            </div>
            <p className="font-body italic text-base text-outline">
              The Official Student Ambassadors of De La Salle University.
            </p>
          </div>
          <div>
            <h5 className="font-label font-bold text-sm uppercase tracking-widest text-primary mb-6">
              Navigation
            </h5>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="font-body italic text-outline hover:text-primary transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="font-body italic text-outline hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-label font-bold text-sm uppercase tracking-widest text-primary mb-6">
              Connect
            </h5>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-xl">share</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 px-12 py-6 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-body italic text-sm text-outline">
            © 2024 DLSU Lasallian Ambassadors. All Rights Reserved.
          </span>
          <span className="font-body italic text-sm text-primary font-semibold">
            Excellence through Service
          </span>
        </div>
      </footer>
    </div>
  )
}
