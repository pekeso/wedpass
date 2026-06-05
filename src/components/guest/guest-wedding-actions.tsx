"use client"

import Link from "next/link"
import { Upload, Image, Lock } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"

interface GuestWeddingActionsProps {
  slug: string
  galleryEnabled: boolean
  isUpcoming: boolean
}

export function GuestWeddingActions({
  slug,
  galleryEnabled,
  isUpcoming,
}: GuestWeddingActionsProps) {
  const { t } = useTranslations()

  return (
    <>
      {/* Italic serif quote */}
      <p
        className="mb-6 text-center font-display italic leading-[1.5] text-navy/70"
        style={{ fontSize: 18 }}
      >
        {isUpcoming ? t("guest.upcomingMessage") : t("guest.pastMessage")}
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/w/${slug}/upload`}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-navy px-6 text-base font-semibold text-white transition-colors hover:bg-navy-hover active:scale-[0.98]"
          style={{ padding: "18px 24px", fontSize: 16 }}
        >
          <Upload className="h-5 w-5 flex-none" style={{ color: "#C8A45D" }} aria-hidden="true" />
          {t("guest.sharePhotos")}
        </Link>

        {galleryEnabled && (
          <Link
            href={`/w/${slug}/gallery`}
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-navy/20 bg-white font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-ivory active:scale-[0.98]"
            style={{ padding: "17px 24px", fontSize: 16 }}
          >
            <Image className="h-[18px] w-[18px] flex-none text-navy/70" aria-hidden="true" />
            {t("guest.viewGallery")}
          </Link>
        )}
      </div>

      {/* Privacy note card */}
      <div
        className="mt-[18px] flex gap-2.5 rounded-[13px] px-[14px] py-[14px]"
        style={{ background: "#FBEDEB" }}
      >
        <Lock
          className="mt-0.5 h-[17px] w-[17px] flex-none"
          style={{ color: "#A8843F" }}
          aria-hidden="true"
        />
        <p className="text-[12.5px] leading-[1.45] text-navy/70">{t("guest.privacyNote")}</p>
      </div>

      {/* Powered by WedPass */}
      <div className="mt-6 flex items-center justify-center gap-[7px] pb-4" style={{ opacity: 0.8 }}>
        <WedPassWordmark size={15} markOnly />
        <span
          className="text-[11px] font-semibold uppercase"
          style={{ letterSpacing: "0.14em", color: "#172033", opacity: 0.55 }}
        >
          {t("guest.poweredBy")}
        </span>
      </div>
    </>
  )
}
