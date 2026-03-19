import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lasallian Ambassadors',
  description: 'Ambassador directory and event management for DLSU Lasallian Ambassadors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  )
}
