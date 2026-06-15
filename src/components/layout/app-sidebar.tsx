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
import { useTranslations } from "@/lib/i18n/use-translations"

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

function useNavItems(weddingId?: string): NavItem[] {
  const { t } = useTranslations()
  const base = weddingId ? `/dashboard/wedding/${weddingId}` : "/dashboard"
  return [
    { label: t("sidebar.dashboard"), href: base, icon: <LayoutDashboard className="size-4" /> },
    { label: t("sidebar.readiness"), href: `${base}/readiness`, icon: <ShieldCheck className="size-4" /> },
    { label: t("sidebar.guests"), href: `${base}/guests`, icon: <Users className="size-4" /> },
    { label: t("sidebar.qrCodes"), href: `${base}/qr-codes`, icon: <QrCode className="size-4" /> },
    { label: t("sidebar.eventMode"), href: `${base}/event-mode`, icon: <Radio className="size-4" /> },
    { label: t("sidebar.staffDevices"), href: `${base}/staff`, icon: <Shield className="size-4" /> },
    { label: t("sidebar.checkIns"), href: `${base}/checkins`, icon: <BarChart2 className="size-4" /> },
    { label: t("sidebar.syncCloseout"), href: `${base}/sync-closeout`, icon: <RefreshCw className="size-4" /> },
    { label: t("sidebar.memories"), href: `${base}/gallery`, icon: <ImageIcon className="size-4" /> },
    { label: t("sidebar.settings"), href: `${base}/settings`, icon: <Settings className="size-4" /> },
  ]
}

export interface AppSidebarProps {
  weddingId?: string
}

export function AppSidebar({ weddingId }: AppSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { t } = useTranslations()
  const effectiveWeddingId =
    weddingId ?? pathname.match(/\/dashboard\/wedding\/([^/]+)/)?.[1]
  const navItems = useNavItems(effectiveWeddingId)

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
              <div className="text-[11px] leading-tight text-white/55">{t("sidebar.organizerRole")}</div>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/25">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
        </div>
      )}
    </aside>
  )
}
