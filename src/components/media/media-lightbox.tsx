"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import type { PublicGalleryMediaItemDTO } from "@/modules/media/media.dto"

interface MediaLightboxProps {
  item: PublicGalleryMediaItemDTO
  onClose: () => void
}

export function MediaLightbox({ item, onClose }: MediaLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="max-h-[90vh] max-w-[90vw]">
        {item.mediaType === "IMAGE" ? (
          <div className="relative max-h-[85vh] max-w-[85vw]">
            <Image
              src={item.fileUrl}
              alt=""
              width={1200}
              height={900}
              className="max-h-[85vh] max-w-[85vw] rounded-md object-contain"
              unoptimized
              priority
            />
          </div>
        ) : (
          <video
            src={item.fileUrl}
            controls
            className="max-h-[85vh] max-w-[85vw] rounded-md"
            playsInline
          />
        )}
      </div>
    </div>
  )
}
