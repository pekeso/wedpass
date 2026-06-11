import Link from "next/link"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="sticky top-0 z-40 border-b border-[#e7e1d6] bg-[rgba(250,247,241,0.92)] backdrop-blur-sm">
        <div className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between px-8">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <WedPassWordmark size={22} tagline />
          </Link>
          <nav className="flex items-center gap-5">
            <div className="hidden items-center gap-6 md:flex">
              {[
                ["How it works", "#how-it-works"],
                ["For staff", "#for-staff"],
                ["Memories", "#memories"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-[#45506b] transition-colors hover:text-navy"
                >
                  {label}
                </Link>
              ))}
            </div>
            <Link
              href="/login"
              className="hidden rounded-lg border border-[#e7e1d6] bg-white px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-ivory sm:inline-flex"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#e7e1d6] px-8 py-6">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <WedPassWordmark size={18} />
          <span className="text-[12.5px] text-[#97a0b2]">
            © 2026 WedPass · Two halves, one pass.
          </span>
        </div>
      </footer>
    </div>
  )
}
