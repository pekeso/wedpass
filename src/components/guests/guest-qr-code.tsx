"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GuestQrCodeProps {
  guestId: string
  fullName: string
  qrPayload: string
}

export function GuestQrCode({ fullName, qrPayload }: GuestQrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  function handleDownload() {
    const canvas = containerRef.current?.querySelector("canvas")
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `${fullName.replace(/\s+/g, "-").toLowerCase()}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <div ref={containerRef}>
          <QRCodeCanvas value={qrPayload} size={160} level="M" includeMargin />
        </div>
        <p className="line-clamp-2 text-center text-sm font-medium">{fullName}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={handleDownload}>
          <Download className="mr-2 size-4" />
          Download PNG
        </Button>
      </CardContent>
    </Card>
  )
}
