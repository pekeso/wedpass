# Phase 39 — System Utility Pages (404 + Error)

## Goal

Add global `not-found.tsx` and `error.tsx` pages at the Next.js app root so that 404s and unhandled errors present branded WedPass screens instead of the bare Next.js default pages.

## Why This Phase Matters

The project currently has no custom 404 or error pages. A user who hits a broken link, an expired QR code URL, or a server error will see an unbranded Next.js page. For beta, every screen a user sees should be WedPass-branded. These are 20-minute files with high visibility payoff.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/app/layout.tsx` — root layout (the utility pages render inside this)
- `src/components/shared/wedpass-wordmark.tsx`
- `src/components/ui/button.tsx`

## Dependencies

- Phase 32 complete (WedPassWordmark component)

## Scope

### 1. Global 404 Page — `src/app/not-found.tsx`

Next.js server component. Shown for any unmatched route across the entire app.

Design:
- Full-page centered layout
- WedPass wordmark at top
- Large "404" in navy, light opacity number for texture: `text-[120px] font-bold text-navy/10 leading-none select-none`
- Heading: "Page not found" — `text-2xl font-bold text-navy`
- Body: "The page you're looking for doesn't exist or has been moved." — `text-muted-foreground`
- Two buttons: "Go Home" (`/`) in navy, "Sign In" (`/login`) in outline

Layout wrapper: `min-h-screen bg-ivory flex flex-col items-center justify-center gap-6 px-6 text-center`

### 2. Global Error Page — `src/app/error.tsx`

Next.js client component (`"use client"`). Shown when any page or layout throws an unhandled error.

Props: `{ error: Error & { digest?: string }, reset: () => void }`

Design matches the 404 page but with different content:
- WedPass wordmark
- Large "!" or error icon (`AlertTriangle size-16 text-danger/20`)
- Heading: "Something went wrong" — `text-2xl font-bold text-navy`
- Body: "An unexpected error occurred. Please try again." — `text-muted-foreground`
- Error digest shown in small monospace if available: `<code className="text-xs text-muted-foreground font-mono">Error: {error.digest}</code>` — useful for support
- Two buttons: "Try again" (calls `reset()`) in navy, "Go Home" (`/`) in outline

### 3. Global Error Boundary — `src/app/global-error.tsx`

Next.js client component (`"use client"`). Shown when the root layout itself crashes.

Minimal. Must include `<html>` and `<body>` tags since it replaces the root layout.

Content: same as error.tsx but self-contained with Inter font and bg-ivory.

```tsx
"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif", background: "#FAF7F1" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", textAlign: "center", padding: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#172033" }}>Something went wrong</h1>
          <p style={{ color: "#6B7280" }}>An unexpected error occurred. Please try again.</p>
          {error.digest && (
            <code style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "monospace" }}>
              Error: {error.digest}
            </code>
          )}
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.5rem", background: "#172033", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
```

### 4. Route-Level not-found for Guest Pages

The guest wedding page already calls `notFound()` for unknown slugs. The global `not-found.tsx` above handles this automatically — no additional work needed.

## Files to Create

- `src/app/not-found.tsx`
- `src/app/error.tsx`
- `src/app/global-error.tsx`

## Files to NOT Touch

- Any existing page files
- Layout files

## Implementation Tasks

1. Create `src/app/not-found.tsx` — WedPass-branded 404 page.
2. Create `src/app/error.tsx` — WedPass-branded error page with reset button.
3. Create `src/app/global-error.tsx` — minimal root-level fallback with inline styles.
4. Run `npx tsc --noEmit` — fix all type errors.
5. Run `npm run lint` — fix all lint errors.
6. Update `PROGRESS.md`: add Phase 39 to Completed Phases, set Current Phase to 40.
7. Commit:
   ```
   git commit -m "feat: add system utility pages"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Manual QA:
- Navigate to `/this-route-does-not-exist` — should show WedPass 404 page
- Visiting `/w/unknown-slug` — triggers `notFound()`, should use the same global 404

## Acceptance Criteria

- [ ] `src/app/not-found.tsx` exists with WedPass branding and two CTAs
- [ ] `src/app/error.tsx` exists with "Try again" reset button and "Go Home" link
- [ ] `src/app/global-error.tsx` exists as a minimal fallback
- [ ] TypeScript and lint pass

## Git Commit

```
feat: add system utility pages
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 39 to Completed Phases with today's date
- Set Current Phase to 40
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 39: System Utility Pages.

Before starting, read:
- CLAUDE.md
- src/app/layout.tsx (understand the root layout)
- src/components/shared/wedpass-wordmark.tsx
- src/components/ui/button.tsx

TASK 1 — Create src/app/not-found.tsx (server component, no "use client"):

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

TASK 2 — Create src/app/error.tsx ("use client"):

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

TASK 3 — Create src/app/global-error.tsx ("use client"):
Use the minimal inline-style version from the phase spec (must include <html> and <body> tags — no Tailwind classes here since the root layout is unavailable when this renders):

"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif", background: "#FAF7F1" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#172033" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6B7280" }}>An unexpected error occurred. Please try again.</p>
          {error.digest && (
            <code style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "monospace" }}>
              Error: {error.digest}
            </code>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#172033",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

After implementing all three files:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 39 to Completed Phases (today's date), set Current Phase to 40.
4. Stage and commit:
   git add src/app/not-found.tsx src/app/error.tsx src/app/global-error.tsx PROGRESS.md
   git commit -m "feat: add system utility pages"
```
