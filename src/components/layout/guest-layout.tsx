import { LanguageToggle } from "@/components/shared/language-toggle"

interface GuestLayoutProps {
  children: React.ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="flex justify-end px-4 pt-4">
        <LanguageToggle />
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-8">{children}</main>
    </div>
  )
}
