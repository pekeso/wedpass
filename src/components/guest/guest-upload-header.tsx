"use client"

import { Camera } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

interface GuestUploadHeaderProps {
  displayName: string
}

export function GuestUploadHeader({ displayName }: GuestUploadHeaderProps) {
  const { t } = useTranslations()

  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-champagne/20">
        <Camera className="h-7 w-7 text-champagne" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-navy">{t("upload.pageTitle")}</h1>
      <p className="mt-2 text-sm text-navy/60">
        {t("upload.pageSubtitle", { weddingName: displayName })}
      </p>
    </div>
  )
}

export function GuestUploadFooter() {
  const { t } = useTranslations()
  return (
    <p className="mt-6 text-center text-xs text-navy/40">
      {t("upload.privacyNote")}
    </p>
  )
}
