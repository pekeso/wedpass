import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WedPass',
  description: 'Offline-first wedding guest check-in and media collection platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
