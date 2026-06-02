"use client"

import { QrCode, Search } from "lucide-react"
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
        className="w-full rounded-2xl font-semibold"
      >
        <QrCode className="size-6" />
        {t("scan.title")}
      </Button>
      <Button
        variant="outline"
        onClick={onSearchGuest}
        className="h-14 w-full gap-3 rounded-2xl text-base font-medium"
      >
        <Search className="size-5" />
        {t("search.title")}
      </Button>
    </div>
  )
}
