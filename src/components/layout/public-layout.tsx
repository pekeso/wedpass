import Link from "next/link"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <WedPassWordmark size={20} />
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/beta"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-navy px-4 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
            >
              Join Free Beta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WedPass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
