"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface GuestUploadHeaderProps {
  displayName: string
  slug: string
}

export function GuestUploadHeader({ displayName, slug }: GuestUploadHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 px-5 pb-0 pt-4">
      <Link
        href={`/w/${slug}`}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[#e7e1d6] bg-white"
        aria-label="Back to wedding page"
      >
        <ArrowLeft className="h-[18px] w-[18px] text-navy" aria-hidden="true" />
      </Link>
      <p className="font-serif text-[20px] font-semibold leading-tight text-navy">
        {displayName}
      </p>
    </div>
  )
}

