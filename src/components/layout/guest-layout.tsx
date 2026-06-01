interface GuestLayoutProps {
  children: React.ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-ivory">
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  )
}
