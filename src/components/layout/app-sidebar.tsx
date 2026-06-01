"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  Image as ImageIcon,
  LayoutDashboard,
  QrCode,
  Radio,
  Settings,
  Shield,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function getNavItems(weddingId?: string): NavItem[] {
  const base = weddingId ? `/dashboard/wedding/${weddingId}` : "/dashboard"
  return [
    {
      label: "Dashboard",
      href: base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Guests",
      href: `${base}/guests`,
      icon: <Users className="size-4" />,
    },
    {
      label: "QR Codes",
      href: `${base}/qr-codes`,
      icon: <QrCode className="size-4" />,
    },
    {
      label: "Event Mode",
      href: `${base}/event-mode`,
      icon: <Radio className="size-4" />,
    },
    {
      label: "Staff Access",
      href: `${base}/staff`,
      icon: <Shield className="size-4" />,
    },
    {
      label: "Check-Ins",
      href: `${base}/checkins`,
      icon: <BarChart2 className="size-4" />,
    },
    {
      label: "Gallery",
      href: `${base}/gallery`,
      icon: <ImageIcon className="size-4" />,
    },
    {
      label: "Settings",
      href: `${base}/settings`,
      icon: <Settings className="size-4" />,
    },
  ]
}

export interface AppSidebarProps {
  weddingId?: string
}

export function AppSidebar({ weddingId }: AppSidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(weddingId)

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <span className="text-lg font-semibold tracking-tight">WedPass</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
