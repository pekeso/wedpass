"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import {
  BarChart2,
  Image as ImageIcon,
  LayoutDashboard,
  QrCode,
  Radio,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
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
      label: "Readiness",
      href: `${base}/readiness`,
      icon: <ShieldCheck className="size-4" />,
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
      label: "Staff Devices",
      href: `${base}/staff`,
      icon: <Shield className="size-4" />,
    },
    {
      label: "Check-Ins",
      href: `${base}/checkins`,
      icon: <BarChart2 className="size-4" />,
    },
    {
      label: "Sync Closeout",
      href: `${base}/sync-closeout`,
      icon: <RefreshCw className="size-4" />,
    },
    {
      label: "Memories",
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
  const { user } = useAuthStore()
  const effectiveWeddingId =
    weddingId ?? pathname.match(/\/dashboard\/wedding\/([^/]+)/)?.[1]
  const navItems = getNavItems(effectiveWeddingId)

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <WedPassWordmark size={22} textColor="#fff" />
      </div>
      <nav className="space-y-0.5 px-2 py-3">
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
                  ? "font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "rgba(200,164,93,0.16)",
                      color: "var(--color-champagne)",
                    }
                  : undefined
              }
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
      {user && (
        <div className="mt-auto pt-3 px-2 pb-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-navy"
              style={{ background: "var(--color-champagne)" }}
            >
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold leading-tight text-white">
                {user.fullName}
              </div>
              <div className="text-[11px] leading-tight text-white/55">Organizer</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
