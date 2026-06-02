"use client"

import { useState } from "react"
import { WifiOff, X } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

export function OfflineWarningBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { t } = useTranslations()

  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 bg-warning-light px-4 py-3 text-sm text-warning">
      <WifiOff className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">{t("offlineBanner.message")}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
