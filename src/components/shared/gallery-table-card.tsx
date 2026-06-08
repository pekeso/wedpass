"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GalleryTableCardProps {
  galleryUrl: string
  coupleNames: string
  eventDate: string | null
}

export function GalleryTableCard({ galleryUrl, coupleNames, eventDate }: GalleryTableCardProps) {
  const hiddenQrRef = useRef<HTMLCanvasElement>(null)

  const formattedDate = eventDate
    ? new Date(eventDate + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  const displayName = coupleNames || "Couple Names"

  function handlePrint() {
    const canvas = hiddenQrRef.current
    if (!canvas) return
    const qrDataUrl = canvas.toDataURL("image/png")

    const card = `
    <div class="card">
      <div class="card-header">
        <div class="couple-names">${displayName}</div>
        ${formattedDate ? `<div class="event-date">${formattedDate}</div>` : ""}
      </div>
      <div class="card-body">
        <p class="scan-label">Scan to share your photos</p>
        <div class="qr-frame">
          <img src="${qrDataUrl}" alt="QR Code" />
        </div>
      </div>
      <div class="card-footer">
        <p class="footer-text">WedPass &middot; wedpass.net</p>
      </div>
    </div>`

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Table Cards &ndash; ${displayName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: white; }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 12mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 8mm;
      align-items: center;
      justify-items: center;
    }
    .card {
      width: 86mm;
      border: 1px solid #C8A45D;
      border-radius: 10px;
      overflow: hidden;
      background: #FAF7F1;
    }
    .card-header {
      background: linear-gradient(150deg, #C8A45D 0%, #A8843D 100%);
      padding: 20px 18px 18px;
      text-align: center;
    }
    .couple-names {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19px;
      color: #ffffff;
      line-height: 1.3;
      letter-spacing: 0.01em;
    }
    .event-date {
      margin-top: 6px;
      font-size: 10px;
      color: rgba(255,255,255,0.82);
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    .card-body {
      padding: 18px 16px;
      text-align: center;
    }
    .scan-label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6B5B3E;
      margin-bottom: 12px;
    }
    .qr-frame {
      display: inline-block;
      padding: 8px;
      border: 1px solid #E8D5B0;
      border-radius: 6px;
      background: white;
    }
    .qr-frame img { display: block; width: 114px; height: 114px; }
    .card-footer {
      padding: 9px 16px;
      text-align: center;
      border-top: 1px solid #E8D5B0;
    }
    .footer-text {
      font-size: 8px;
      color: #A89070;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${[0, 1, 2, 3].map(() => card).join("\n")}
  </div>
  <script>
    window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 400); });
  </script>
</body>
</html>`

    const win = window.open("", "_blank", "width=800,height=900")
    if (!win) return
    win.document.write(printHtml)
    win.document.close()
  }

  return (
    <div className="space-y-4">
      {/* On-screen preview */}
      <div className="flex justify-start">
        <div className="w-[210px] overflow-hidden rounded-xl border border-champagne bg-ivory shadow-card">
          <div className="bg-gradient-to-br from-champagne to-champagne/80 px-5 py-5 text-center">
            <p className="font-display text-[18px] leading-snug text-white">{displayName}</p>
            {formattedDate && (
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white/80">
                {formattedDate}
              </p>
            )}
          </div>
          <div className="px-4 py-4 text-center">
            <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-navy/50">
              Scan to share your photos
            </p>
            <div className="inline-block rounded-md border border-champagne-light bg-white p-2">
              <QRCodeCanvas value={galleryUrl} size={106} fgColor="#172033" bgColor="#ffffff" />
            </div>
          </div>
          <div className="border-t border-champagne-light px-4 py-2 text-center">
            <p className="text-[7px] uppercase tracking-widest text-navy/30">WedPass · wedpass.net</p>
          </div>
        </div>
      </div>

      {/* Hidden high-res canvas used only to extract a data URL for the print window */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <QRCodeCanvas
          ref={hiddenQrRef}
          value={galleryUrl}
          size={220}
          fgColor="#172033"
          bgColor="#ffffff"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Prints 4 cards per A4 page. Place one on each guest table so guests can scan and share their photos.
      </p>

      <Button type="button" variant="outline" className="gap-2" onClick={handlePrint}>
        <Printer className="size-4" />
        Print Table Cards
      </Button>
    </div>
  )
}
