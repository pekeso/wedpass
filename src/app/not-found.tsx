import Link from "next/link"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-6 px-6 text-center">
      <WedPassWordmark size={28} />
      <div className="space-y-1">
        <p className="text-[96px] font-bold leading-none text-navy/10 select-none">404</p>
        <h1 className="text-2xl font-bold text-navy">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/"><Button variant="navy">Go Home</Button></Link>
        <Link href="/login"><Button variant="outline">Sign In</Button></Link>
      </div>
    </div>
  )
}
