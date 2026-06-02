"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-6 px-6 text-center">
      <WedPassWordmark size={28} />
      <AlertTriangle className="size-14 text-danger/30" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        {error.digest && (
          <code className="block text-xs text-muted-foreground font-mono mt-2">
            Error: {error.digest}
          </code>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="navy" onClick={reset}>Try again</Button>
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    </div>
  )
}
