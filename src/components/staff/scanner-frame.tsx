"use client"

import { cn } from "@/lib/utils"

interface ScannerFrameProps {
  scannerId: string
  className?: string
}

export function ScannerFrame({ scannerId, className }: ScannerFrameProps) {
  return (
    <div
      className={cn(
        "relative min-h-72 w-full overflow-hidden rounded-2xl bg-black",
        className
      )}
    >
      <div id={scannerId} className="w-full" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-56 w-56">
          <span className="absolute left-0 top-0 block h-8 w-8 border-l-4 border-t-4 border-white" />
          <span className="absolute right-0 top-0 block h-8 w-8 border-r-4 border-t-4 border-white" />
          <span className="absolute bottom-0 left-0 block h-8 w-8 border-b-4 border-l-4 border-white" />
          <span className="absolute bottom-0 right-0 block h-8 w-8 border-b-4 border-r-4 border-white" />
        </div>
      </div>
    </div>
  )
}
