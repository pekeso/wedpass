import { QrCode, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScanActionCardProps {
  onScanQr: () => void
  onSearchGuest: () => void
}

export function ScanActionCard({ onScanQr, onSearchGuest }: ScanActionCardProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onScanQr}
        className="h-16 w-full gap-3 rounded-2xl text-lg font-semibold"
      >
        <QrCode className="size-6" />
        Scan QR Code
      </Button>
      <Button
        variant="outline"
        onClick={onSearchGuest}
        className="h-14 w-full gap-3 rounded-2xl text-base font-medium"
      >
        <Search className="size-5" />
        Search Guest
      </Button>
    </div>
  )
}
