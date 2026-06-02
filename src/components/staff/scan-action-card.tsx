"use client"

import { ScanLine, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface ScanActionCardProps {
  onScanQr: () => void
  onSearchGuest: () => void
}

export function ScanActionCard({ onScanQr, onSearchGuest }: ScanActionCardProps) {
  const { t } = useTranslations()

  return (
    <div className="space-y-3">
      <Button
        variant="navy"
        size="xl"
        onClick={onScanQr}
        className="w-full flex-col gap-2 rounded-[20px] min-h-[132px]"
      >
        <ScanLine className="size-10 text-champagne" />
        <span className="text-[19px] font-semibold">Scan QR Code</span>
        <span className="text-[12.5px] font-medium text-white/60">Point the camera at a guest pass</span>
      </Button>
      <Button
        variant="outline"
        onClick={onSearchGuest}
        className="h-14 w-full gap-3 rounded-2xl border-2 border-navy text-base font-medium"
      >
        <Search className="size-5" />
        {t("search.title")}
      </Button>
    </div>
  )
}
