import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl font-bold text-navy">
          WedPass
        </h1>
        <p className="text-lg text-offline max-w-md">
          Offline-first wedding guest check-in and media collection platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="bg-navy text-white hover:bg-navy-hover h-12 px-6 rounded-md">
          Join Free Beta
        </Button>
        <Button
          variant="outline"
          className="border-beige text-navy h-12 px-6 rounded-md"
        >
          Login
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <span className="bg-success-light text-success text-sm px-3 py-1 rounded-full font-medium">
          Checked In
        </span>
        <span className="bg-warning-light text-warning text-sm px-3 py-1 rounded-full font-medium">
          Pending Sync
        </span>
        <span className="bg-danger-light text-danger text-sm px-3 py-1 rounded-full font-medium">
          Sync Failed
        </span>
        <span className="bg-sync-light text-sync text-sm px-3 py-1 rounded-full font-medium">
          Syncing
        </span>
        <span className="bg-offline-light text-offline text-sm px-3 py-1 rounded-full font-medium">
          Offline
        </span>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <div className="w-16 h-8 bg-navy rounded" title="navy" />
        <div className="w-16 h-8 bg-champagne rounded" title="champagne" />
        <div className="w-16 h-8 bg-ivory border border-beige rounded" title="ivory" />
        <div className="w-16 h-8 bg-blush rounded" title="blush" />
        <div className="w-16 h-8 bg-terracotta rounded" title="terracotta" />
      </div>
    </main>
  )
}
