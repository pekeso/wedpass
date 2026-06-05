# Phase 38 — Beta Signup Page

## Goal

Replace the `<p>TODO: Beta Signup Page</p>` placeholder at `/beta` with a real interest-capture form for beta applicants.

## Why This Phase Matters

The landing page (Phase 37) sends potential organizers to `/beta` via "Start Free Beta". The current page is a dead placeholder. Organizers need to be able to register their interest before full auth is available to them or to collect structured data about who's joining the beta.

The beta signup does **not** create an organizer account — it captures interest data. A POST endpoint stores the submission. The submitter sees a thank-you screen after submitting.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/ui_ux.md` — Section 17.2 (Beta Signup Page)
- `src/app/(public)/beta/page.tsx` — the file to replace
- `src/components/layout/public-layout.tsx` — outer layout
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`

## Dependencies

- Phase 37 complete (landing page links to /beta)

## Scope

### 1. Beta Signup Form

Client component at `src/app/(public)/beta/page.tsx`.

Fields (all `<Input>` with `<Label>`):
- **Full name** — text, required
- **Email** — email, required
- **Country** — text, required, placeholder "e.g. Nigeria"
- **Wedding date** — date input, optional
- **Estimated guest count** — number input, min 1, placeholder "e.g. 150"
- **Preferred language** — select or text: "English" / "French", optional

Layout: centered card, max-w-lg, white bg, subtle shadow, rounded-2xl, py-10 px-8 on desktop.

Above the card: `<WedPassWordmark size={28} className="mx-auto mb-6" />` and `<h1>` "Join the WedPass Beta".

Subtext below heading: "We're onboarding a small group of couples and planners in Central, East & West Africa. Be first."

### 2. Validation

Use `react-hook-form` + Zod. Schema:

```ts
const betaSignupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  weddingDate: z.string().optional(),
  estimatedGuests: z.coerce.number().int().min(1).optional(),
  preferredLanguage: z.enum(["English", "French"]).optional(),
})
```

### 3. API Endpoint

Create `src/app/api/v1/beta/signup/route.ts` (POST, public, no auth).

Request body: the schema above.

Response: `{ success: true, data: { message: "Beta request received." } }`.

For V1 beta, simply log the submission with `console.log` and return success — no database table needed. Add a `// TODO: persist to database when BetaSignup model is added` comment.

### 4. Thank-You State

After successful submission, show a thank-you state in the same component (no page navigation):

```
✓  You're on the list!
   We'll reach out to joembiye@gmail.com as we onboard new organizers.
   
   [Back to Home]
```

Use a green checkmark icon (`CheckCircle` from lucide, `size-12 text-success`), a bold heading, and a `<Link href="/">` button variant="outline".

### 5. Error Handling

If the server returns an error, show it in a red `<p className="text-sm text-destructive">` above the submit button.

If email appears to be already submitted, return a friendly message (server can just return success regardless — no dedup needed in V1).

## Files to Create

- `src/app/(public)/beta/page.tsx` — complete rewrite
- `src/app/api/v1/beta/signup/route.ts` — new POST endpoint

## Files to NOT Touch

- Any auth, wedding, or guest modules

## Implementation Tasks

1. Create `src/app/api/v1/beta/signup/route.ts` — Zod-validate body, console.log, return `{ success: true, data: { message: "Beta request received." } }`.
2. Rewrite `src/app/(public)/beta/page.tsx` — client component with form, success state.
3. Run `npx tsc --noEmit` — fix all type errors.
4. Run `npm run lint` — fix all lint errors.
5. Update `PROGRESS.md`: add Phase 38 to Completed Phases, set Current Phase to 39.
6. Commit:
   ```
   git commit -m "feat: add beta signup page"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual checks:
- `/beta` renders a centred card with heading, subtext, and 6 fields
- Submitting shows the thank-you screen with green checkmark
- "Back to Home" link navigates to `/`

## Acceptance Criteria

- [ ] `/beta` renders an interest form (not TODO placeholder)
- [ ] Form has 6 fields matching the spec
- [ ] Zod validation shows inline errors for invalid inputs
- [ ] Successful submit shows thank-you screen
- [ ] API route POST `/api/v1/beta/signup` returns `{ success: true }`
- [ ] TypeScript and lint pass

## Git Commit

```
feat: add beta signup page
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 38 to Completed Phases with today's date
- Set Current Phase to 39
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 38: Beta Signup Page.

Before starting, read:
- CLAUDE.md
- src/app/(public)/beta/page.tsx (current TODO placeholder)
- src/components/shared/wedpass-wordmark.tsx
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/form.tsx
- src/types/api.ts (for ApiResponse shape)

TASK 1 — Create src/app/api/v1/beta/signup/route.ts

import { NextResponse } from "next/server"
import { z } from "zod"

const betaSignupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  weddingDate: z.string().optional(),
  estimatedGuests: z.coerce.number().int().min(1).optional(),
  preferredLanguage: z.enum(["English", "French"]).optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = betaSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid submission." } },
      { status: 400 }
    )
  }
  // TODO: persist to database when BetaSignup model is added
  console.log("[beta-signup]", parsed.data)
  return NextResponse.json({ success: true, data: { message: "Beta request received." } })
}

TASK 2 — Rewrite src/app/(public)/beta/page.tsx

"use client"

Use react-hook-form + zodResolver. The form has the same betaSignupSchema.

Page structure:
<div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-12">
  {!submitted ? (
    <div className="w-full max-w-lg rounded-2xl bg-white px-8 py-10 shadow-card">
      <div className="mb-6 flex justify-center">
        <WedPassWordmark size={28} />
      </div>
      <h1 className="mb-1 text-center text-2xl font-bold text-navy">Join the WedPass Beta</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        We&apos;re onboarding couples and planners in Central, East &amp; West Africa. Be first.
      </p>
      {/* Form */}
      <Form ...>
        <form className="space-y-4">
          {/* fullName, email, country, weddingDate (type="date"), estimatedGuests (type="number" min="1"), preferredLanguage (select: English / French) */}
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" variant="navy" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request Beta Access"}
          </Button>
        </form>
      </Form>
    </div>
  ) : (
    <div className="text-center space-y-4">
      <CheckCircle className="mx-auto size-12 text-success" />
      <h2 className="text-2xl font-bold text-navy">You&apos;re on the list!</h2>
      <p className="text-muted-foreground">
        We&apos;ll reach out as we onboard new organizers.
      </p>
      <Link href="/"><Button variant="outline">Back to Home</Button></Link>
    </div>
  )}
</div>

For the preferredLanguage field, use a native <select> wrapped in the same input style OR use shadcn Select component if available. Check src/components/ui/select.tsx first.

The onSubmit handler POSTs to /api/v1/beta/signup. On success set submitted=true. On failure set serverError.

Import:
- CheckCircle from "lucide-react"
- Link from "next/link"
- WedPassWordmark from "@/components/shared/wedpass-wordmark"
- Button from "@/components/ui/button"
- Form, FormField, FormItem, FormLabel, FormControl, FormMessage from "@/components/ui/form"
- Input from "@/components/ui/input"

After implementing:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 38 to Completed Phases (today's date), set Current Phase to 39.
4. Stage and commit:
   git add src/app/(public)/beta/page.tsx src/app/api/v1/beta/signup/route.ts PROGRESS.md
   git commit -m "feat: add beta signup page"
```
