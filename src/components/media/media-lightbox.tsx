"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, Download, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaLightboxProps {
  items: PublicGalleryMediaItemDTO[]
  initialIndex: number
  onClose: () => void
}

export function MediaLightbox({ items, initialIndex, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslations()

  const item = items[currentIndex]
  const total = items.length

  const goPrev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : i))
  const goNext = () => setCurrentIndex((i) => (i < total - 1 ? i + 1 : i))

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    document.addEventListener("keydown", handleKey)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0e16]"
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-[18px] py-[14px]">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={t("gallery.close")}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="tabular-nums text-[13px] font-semibold text-white/70">
          {currentIndex + 1} / {total}
        </span>

        <a
          href={item.fileUrl}
          download
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={t("gallery.download")}
        >
          <Download className="h-[19px] w-[19px]" aria-hidden="true" />
        </a>
      </div>

      {/* Media */}
      <div className="relative flex flex-1 items-center justify-center">
        {item.mediaType === "IMAGE" ? (
          <div className="relative h-full w-full">
            <Image
              src={item.fileUrl}
              alt=""
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0_10px,rgba(255,255,255,0.015)_10px_20px)]" style={{ aspectRatio: "3/4", maxHeight: "100%", maxWidth: "100%" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Play className="h-7 w-7 fill-white text-white" aria-hidden="true" />
            </div>
            <span className="text-sm text-white/50">{t("gallery.tapToPlay")}</span>
          </div>
        )}

        {/* Prev arrow */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-[10px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={t("gallery.previous")}
          >
            <ChevronLeft className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
        )}

        {/* Next arrow */}
        {currentIndex < total - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-[10px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={t("gallery.next")}
          >
            <ChevronRight className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-5 pb-6 pt-4 text-white/70">
        {item.uploadedByName && (
          <div className="text-[14px] font-semibold text-white">
            {t("gallery.sharedBy", { name: item.uploadedByName })}
          </div>
        )}
        <div className={["tabular-nums text-[12.5px]", item.uploadedByName ? "mt-0.5" : ""].join(" ")}>
          {formattedTime}
        </div>
      </div>
    </div>
  )
}
