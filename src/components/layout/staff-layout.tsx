import { LanguageToggle } from "@/components/shared/language-toggle"

interface StaffLayoutProps {
  children: React.ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="relative">
      <div className="absolute right-4 top-14 z-50">
        <LanguageToggle />
      </div>
      {children}
    </div>
  )
}
