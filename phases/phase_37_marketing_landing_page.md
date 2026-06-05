# Phase 37 — Marketing Landing Page

## Goal

Replace the current placeholder landing page (color swatches and skeleton copy) with a real, branded WedPass marketing page that communicates the product's value to potential organizers and captures beta interest.

## Why This Phase Matters

The landing page is the first impression for every couple or planner who hears about WedPass. The current page shows Tailwind color swatches and placeholder text — this is not production-ready. For beta, organizers need to land on a page that clearly explains what WedPass is and invites them to sign up.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/ui_ux.md` — Sections 3.1, 17.1, 27
- `src/app/(public)/page.tsx` — the file to replace
- `src/components/layout/public-layout.tsx` — the outer layout wrapper
- `src/components/shared/wedpass-wordmark.tsx` — use in hero
- `src/components/ui/button.tsx` — use navy and gold variants

## Dependencies

- Phase 32 complete (WedPassWordmark component)
- Phase 35 complete (navy and gold button variants)

## Scope

### 1. Hero Section

Full-width hero with an ivory warm background (`bg-ivory`).

Content:
- WedPass wordmark (`<WedPassWordmark size={40} />`) centered, above the headline
- Headline: `"Beautiful check-in. Calm couples. Bulletproof staff."` — `text-4xl sm:text-5xl font-bold text-navy text-center leading-tight`
- Subheadline: `"The offline-first wedding guest check-in and media platform for Central, East & West Africa."` — `text-lg text-navy/60 text-center max-w-xl mx-auto`
- Two CTA buttons side by side (centered):
  - Primary: `<Button variant="navy" size="lg">` → `/register` — label "Start Free Beta"
  - Secondary: outline link → `/login` — label "Sign In"
- Soft divider or wave at bottom of hero

### 2. Three Pillars Section

Three equally-spaced cards (or icon + text blocks) on a white background:

| Pillar | Icon | Title | Body |
|---|---|---|---|
| Guests | Camera / Heart | Beautiful for Guests | Guests share photos and videos straight from their phone. No app download needed. |
| Couples | Shield / CheckCircle | Calm for Couples | Track check-ins, guest arrivals, and media uploads from one clear dashboard. |
| Staff | Wifi / Zap | Bulletproof for Staff | Check guests in even without internet. Syncs safely when your connection returns. |

Layout: `grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto`

Each card: ivory border (`border-champagne/20`), white bg, `rounded-2xl p-6 text-center`, icon in champagne color (`size-8 text-champagne mx-auto mb-3`), title `font-semibold text-navy`, body `text-sm text-navy/60 mt-1`.

### 3. "How It Works" Section

Navy background (`bg-navy text-white`), three numbered steps:

1. **Create your wedding** — Add your guest list and generate QR codes.
2. **Prepare your staff** — Staff download the offline pack before guests arrive.
3. **Check in with confidence** — Scan QR or search manually — works even offline.

Layout: three column grid on desktop, stacked on mobile. Number circle in champagne, title in white, body in `white/60`.

### 4. Bottom CTA Section

Ivory background. Centred. Large heading and a single "Start Free Beta →" navy button linking to `/register`.

Heading: `"Your guests deserve a seamless arrival."` — `text-3xl font-bold text-navy text-center`
Subtext: `"Join WedPass free during our beta period."` — `text-navy/60`

### 5. What to Remove

Remove all color swatch `<div>` blocks and status badge samples from the current `page.tsx` — those were only for design-token verification.

## Files to Modify

- `src/app/(public)/page.tsx` — complete rewrite

## Files to NOT Touch

- `src/components/layout/public-layout.tsx` (Phase 40 will handle the header wordmark)
- All other existing files

## Implementation Tasks

1. Rewrite `src/app/(public)/page.tsx` with the four sections above.
2. Import WedPassWordmark, Button (navy variant), and Lucide icons (Camera, Shield, Wifi, CheckCircle, Zap, Heart — use whichever are available).
3. Ensure all internal links use `<Link href="...">` from next/link.
4. Run `npx tsc --noEmit` — fix all type errors.
5. Run `npm run lint` — fix all lint errors.
6. Update `PROGRESS.md`: add Phase 37 to Completed Phases with today's date, set Current Phase to 38, update Last Updated.
7. Commit:
   ```
   git commit -m "feat: add marketing landing page"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual checks:
- Hero shows WedPass wordmark above headline on ivory background
- "Start Free Beta" button is navy
- Three pillar cards are visible and equal width on desktop
- Navy "How it Works" section shows three numbered steps
- Bottom CTA section has the gold/navy button
- No color swatches visible

## Acceptance Criteria

- [ ] Placeholder color swatches are gone
- [ ] Hero has WedPass wordmark, headline, and two CTAs
- [ ] Three pillars section renders
- [ ] "How it works" section renders with navy background
- [ ] Bottom CTA links to `/register`
- [ ] TypeScript and lint pass

## Git Commit

```
feat: add marketing landing page
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 37 to Completed Phases with today's date
- Set Current Phase to 38
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 37: Marketing Landing Page.

Before starting, read:
- CLAUDE.md
- src/app/(public)/page.tsx (current placeholder — full rewrite)
- src/components/shared/wedpass-wordmark.tsx
- src/components/ui/button.tsx (check available variants: navy, gold, outline)
- src/components/layout/public-layout.tsx (outer layout)

TASK: Rewrite src/app/(public)/page.tsx completely. Remove all color-swatch divs and placeholder status badges. Implement a four-section marketing landing page:

SECTION 1 — HERO (bg-ivory):
  <section className="bg-ivory px-6 py-20 sm:py-28 text-center">
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex justify-center">
        <WedPassWordmark size={40} />
      </div>
      <h1 className="text-4xl font-bold leading-tight text-navy sm:text-5xl">
        Beautiful check-in.<br />Calm couples.<br />Bulletproof staff.
      </h1>
      <p className="mx-auto max-w-xl text-lg text-navy/60">
        The offline-first wedding guest check-in and media platform for Central, East & West Africa.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/register"><Button variant="navy" size="lg" className="min-w-[180px]">Start Free Beta</Button></Link>
        <Link href="/login"><Button variant="outline" size="lg" className="min-w-[140px]">Sign In</Button></Link>
      </div>
    </div>
  </section>

SECTION 2 — THREE PILLARS (bg-white):
  <section className="bg-white px-6 py-16">
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
      Three cards. Each card:
        <div className="rounded-2xl border border-champagne/20 bg-ivory p-6 text-center">
          {icon at size-8, text-champagne, mx-auto mb-3}
          <h3 className="font-semibold text-navy">{title}</h3>
          <p className="mt-1 text-sm text-navy/60">{body}</p>
        </div>

      Card 1: icon=<Camera />, title="Beautiful for Guests", body="Guests share photos and videos straight from their phone. No app download needed."
      Card 2: icon=<ShieldCheck />, title="Calm for Couples", body="Track check-ins, guest arrivals, and media uploads from one clear dashboard."
      Card 3: icon=<Wifi />, title="Bulletproof for Staff", body="Check guests in even without internet. Syncs safely when your connection returns."
      (Use ShieldCheck or Shield — check what's available in lucide-react.)
    </div>
  </section>

SECTION 3 — HOW IT WORKS (bg-navy text-white):
  <section className="bg-navy px-6 py-16 text-white">
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-10 text-center text-2xl font-bold">How it works</h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        Three steps. Each step:
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full text-navy font-bold text-sm" style={{ background: "var(--color-champagne)" }}>
              {step number}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/60">{body}</p>
          </div>

        Step 1: "Create your wedding" / "Add your guest list and generate QR codes for each guest."
        Step 2: "Prepare your staff" / "Staff download the guest pack before guests arrive — no internet needed on event day."
        Step 3: "Check in with confidence" / "Scan a QR code or search manually. Works fully offline. Syncs when you reconnect."
      </div>
    </div>
  </section>

SECTION 4 — BOTTOM CTA (bg-ivory):
  <section className="bg-ivory px-6 py-16 text-center">
    <div className="mx-auto max-w-xl space-y-4">
      <h2 className="text-3xl font-bold text-navy">Your guests deserve a seamless arrival.</h2>
      <p className="text-navy/60">Join WedPass free during our beta period.</p>
      <Link href="/register">
        <Button variant="navy" size="lg" className="mt-2">Start Free Beta →</Button>
      </Link>
    </div>
  </section>

Wrap all sections in a <main> (not adding a layout — the public-layout.tsx already provides the outer shell).

Import:
- Link from "next/link"
- Button from "@/components/ui/button"
- WedPassWordmark from "@/components/shared/wedpass-wordmark"
- Camera, ShieldCheck (or Shield), Wifi from "lucide-react"

The file is a server component (no "use client" needed).

After implementing:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 37 to Completed Phases (today's date), set Current Phase to 38.
4. Stage and commit:
   git add src/app/(public)/page.tsx PROGRESS.md
   git commit -m "feat: add marketing landing page"
```
