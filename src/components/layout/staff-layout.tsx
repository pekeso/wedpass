interface StaffLayoutProps {
  children: React.ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return <div className="relative">{children}</div>
}
