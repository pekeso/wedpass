import Link from "next/link"
import { Camera, ShieldCheck, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ivory px-6 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex justify-center">
            <WedPassWordmark size={40} />
          </div>
          <h1 className="text-4xl font-bold leading-tight text-navy sm:text-5xl">
            Beautiful check-in.<br />Calm couples.<br />Bulletproof staff.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-navy/60">
            The offline-first wedding guest check-in and media platform for Central, East &amp; West Africa.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button variant="navy" size="lg" className="min-w-[180px]">Start Free Beta</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-[140px]">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-champagne/20 bg-ivory p-6 text-center">
            <Camera className="mx-auto mb-3 size-8 text-champagne" />
            <h3 className="font-semibold text-navy">Beautiful for Guests</h3>
            <p className="mt-1 text-sm text-navy/60">Guests share photos and videos straight from their phone. No app download needed.</p>
          </div>
          <div className="rounded-2xl border border-champagne/20 bg-ivory p-6 text-center">
            <ShieldCheck className="mx-auto mb-3 size-8 text-champagne" />
            <h3 className="font-semibold text-navy">Calm for Couples</h3>
            <p className="mt-1 text-sm text-navy/60">Track check-ins, guest arrivals, and media uploads from one clear dashboard.</p>
          </div>
          <div className="rounded-2xl border border-champagne/20 bg-ivory p-6 text-center">
            <Wifi className="mx-auto mb-3 size-8 text-champagne" />
            <h3 className="font-semibold text-navy">Bulletproof for Staff</h3>
            <p className="mt-1 text-sm text-navy/60">Check guests in even without internet. Syncs safely when your connection returns.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-navy px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold">How it works</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full text-sm font-bold text-navy"
                style={{ background: "var(--color-champagne)" }}
              >
                1
              </div>
              <h3 className="font-semibold text-white">Create your wedding</h3>
              <p className="mt-1 text-sm text-white/60">Add your guest list and generate QR codes for each guest.</p>
            </div>
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full text-sm font-bold text-navy"
                style={{ background: "var(--color-champagne)" }}
              >
                2
              </div>
              <h3 className="font-semibold text-white">Prepare your staff</h3>
              <p className="mt-1 text-sm text-white/60">Staff download the guest pack before guests arrive — no internet needed on event day.</p>
            </div>
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full text-sm font-bold text-navy"
                style={{ background: "var(--color-champagne)" }}
              >
                3
              </div>
              <h3 className="font-semibold text-white">Check in with confidence</h3>
              <p className="mt-1 text-sm text-white/60">Scan a QR code or search manually. Works fully offline. Syncs when you reconnect.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ivory px-6 py-16 text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-3xl font-bold text-navy">Your guests deserve a seamless arrival.</h2>
          <p className="text-navy/60">Join WedPass free during our beta period.</p>
          <Link href="/register">
            <Button variant="navy" size="lg" className="mt-2">Start Free Beta →</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
