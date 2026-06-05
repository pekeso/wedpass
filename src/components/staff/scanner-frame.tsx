"use client"

import { cn } from "@/lib/utils"

interface ScannerFrameProps {
  scannerId: string
  className?: string
}

const GOLD = "#C8A45D"

export function ScannerFrame({ scannerId, className }: ScannerFrameProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div id={scannerId} className="absolute inset-0 h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: 230, height: 230 }}>
          {/* Top-left */}
          <span className="absolute" style={{ top: 0, left: 0, width: 38, height: 38, borderLeft: `4px solid ${GOLD}`, borderTop: `4px solid ${GOLD}`, borderRadius: 4 }} />
          {/* Top-right */}
          <span className="absolute" style={{ top: 0, right: 0, width: 38, height: 38, borderRight: `4px solid ${GOLD}`, borderTop: `4px solid ${GOLD}`, borderRadius: 4 }} />
          {/* Bottom-left */}
          <span className="absolute" style={{ bottom: 0, left: 0, width: 38, height: 38, borderLeft: `4px solid ${GOLD}`, borderBottom: `4px solid ${GOLD}`, borderRadius: 4 }} />
          {/* Bottom-right */}
          <span className="absolute" style={{ bottom: 0, right: 0, width: 38, height: 38, borderRight: `4px solid ${GOLD}`, borderBottom: `4px solid ${GOLD}`, borderRadius: 4 }} />
          {/* Scanning line */}
          <div
            className="absolute"
            style={{
              left: 12,
              right: 12,
              top: "50%",
              height: 2,
              background: GOLD,
              boxShadow: `0 0 12px ${GOLD}`,
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </div>
  )
}
