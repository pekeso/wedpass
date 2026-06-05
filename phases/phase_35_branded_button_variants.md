# Phase 35 — Branded Button Variants

## Goal

Add `navy` and `gold` button variants to the shadcn Button component, add an `xl` size, and apply them to the highest-visibility CTAs across the organizer dashboard and staff mode.

## Why This Phase Matters

The design system defines three primary button styles: a navy-fill primary (used for main actions), a gold-fill accent (used for confirmations and event-day actions), and an `xl` size (minimum height 60px for staff-mode large-touch CTAs). Currently all buttons use generic shadcn variants (`default`, `outline`, `ghost`) with no brand colour. Applying the correct variants to key CTAs is a quick, high-impact polish step that brings the app closer to the approved design.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/components/ui/button.tsx` — the `cva` definition to extend
- `src/app/globals.css` — confirm `--color-navy`, `--color-navy-hover`, `--color-champagne`, `--color-champagne-deep` tokens
- `src/app/dashboard/wedding/[weddingId]/page.tsx` — primary dashboard CTA
- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx` — enable Event Mode CTA
- `src/app/staff/[weddingId]/checkin/page.tsx` — scan CTA (Phase 36 will also touch this)

## Dependencies

- Phase 02 complete (button.tsx and color tokens exist)
- Phase 32 complete (champagne-deep token added to globals.css)

## Scope

### 1. Extend `buttonVariants` in `src/components/ui/button.tsx`

**New variants:**

```ts
navy: "bg-navy text-white hover:bg-navy-hover shadow-sm",
gold: "bg-champagne text-navy font-semibold hover:bg-champagne-deep hover:text-white shadow-sm",
```

Add these inside `variants.variant` alongside the existing `default`, `outline`, `ghost`, `secondary`, `destructive`, `link`.

**New size:**

```ts
xl: "h-[60px] min-h-[60px] gap-2 px-6 text-base rounded-xl",
```

Add this inside `variants.size` alongside the existing sizes.

Tailwind v4 resolves `bg-navy`, `bg-navy-hover`, `bg-champagne`, `bg-champagne-deep` from the `@theme` tokens. Confirm `--color-navy-hover` and `--color-champagne-deep` exist in `globals.css`. Both should already be present after Phase 32 added `--color-champagne-deep`.

### 2. Apply variants to high-visibility CTAs

Update the following call sites. Read each file before editing to confirm the exact line.

**Dashboard overview** (`src/app/dashboard/wedding/[weddingId]/page.tsx`):
- The "Settings" outline button in `primaryAction` may remain `variant="outline"` — it is a secondary action.
- If there is a "Prepare Event Mode" or similar primary CTA, update to `variant="navy"`.

**Event Mode page** (`src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`):
- The "Enable Event Mode" / "Complete Setup" primary button → `variant="navy"`.
- Any confirmation/proceed button that advances a step → `variant="gold"`.

**Staff check-in page** (`src/app/staff/[weddingId]/checkin/page.tsx`):
- The "Scan QR Code" primary action button → `variant="navy" size="xl"`.
- The "Sync Now" button → `variant="gold" size="lg"`.

**Staff sync page** (`src/app/staff/[weddingId]/sync/page.tsx`):
- "Sync Now" button → `variant="gold" size="lg"`.

**Staff download page** (`src/app/staff/[weddingId]/download/page.tsx`):
- "Start Check-In" / "Download Offline Pack" primary button → `variant="navy" size="xl"`.

Only change variants where there is a clear primary action that maps to navy or gold. Do not change every button in the app — focus on the highest-traffic screens listed above.

## Files to Modify

- `src/components/ui/button.tsx`
- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`
- `src/app/staff/[weddingId]/checkin/page.tsx`
- `src/app/staff/[weddingId]/sync/page.tsx`
- `src/app/staff/[weddingId]/download/page.tsx`

## Explicitly Out of Scope

- Do not change every button in the entire codebase — only the CTAs listed above
- Do not change the shadcn `default` variant (used by shadcn internal components)
- No routing or API changes

## Implementation Tasks

1. Add `navy` and `gold` variants and `xl` size to `src/components/ui/button.tsx`.
2. Verify `--color-navy-hover` and `--color-champagne-deep` are defined in `globals.css`.
3. Read each of the 4 target pages and update the specific CTAs listed above.
4. Run `npx tsc --noEmit` — fix any type errors.
5. Run `npm run lint` — fix any lint errors.
6. Update `PROGRESS.md`: move Phase 35 to Completed Phases, set Current Phase to Phase 36, record today's date.
7. Commit:
   ```
   git commit -m "feat: add navy and gold button variants"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual check: the Event Mode enable button should be navy. The Sync Now button should be gold. The Scan QR Code button should be navy and noticeably taller (60px).

## Acceptance Criteria

- [ ] `navy` variant added to `buttonVariants` — navy fill, white text
- [ ] `gold` variant added to `buttonVariants` — gold fill, navy text
- [ ] `xl` size added — minimum 60px height
- [ ] Event Mode primary CTA uses `variant="navy"`
- [ ] Scan QR Code button uses `variant="navy" size="xl"`
- [ ] Sync Now buttons use `variant="gold"`
- [ ] TypeScript and lint pass

## Git Commit

```
feat: add navy and gold button variants
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 35 to Completed Phases with today's date
- Set Current Phase to Phase 36
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 35: Branded Button Variants.

Before starting, read:
- CLAUDE.md
- src/components/ui/button.tsx
- src/app/globals.css  (check navy-hover and champagne-deep tokens exist)
- src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx
- src/app/staff/[weddingId]/checkin/page.tsx
- src/app/staff/[weddingId]/sync/page.tsx
- src/app/staff/[weddingId]/download/page.tsx

STEP 1 — Extend buttonVariants in src/components/ui/button.tsx.

Inside the variants.variant object, add after the existing entries:
  navy: "bg-navy text-white hover:bg-navy-hover shadow-sm",
  gold: "bg-champagne text-navy font-semibold hover:bg-champagne-deep hover:text-white shadow-sm",

Inside the variants.size object, add:
  xl: "h-[60px] min-h-[60px] gap-2 px-6 text-base rounded-xl",

Also update the VariantProps type to include these — since cva infers the types, this should happen automatically.

STEP 2 — Check globals.css.
Verify --color-navy-hover: #101827 and --color-champagne-deep: #A8843F are in the @theme block.
If --color-champagne-deep is missing (should have been added in Phase 32), add it now:
  --color-champagne-deep: #A8843F;

STEP 3 — Update CTAs on specific pages.
Read each page file carefully to find the exact button before changing it.

In event-mode/page.tsx:
  Find the primary "Enable Event Mode" or "Complete Setup" button → add variant="navy"

In staff/[weddingId]/checkin/page.tsx:
  Find the "Scan QR Code" action button → add variant="navy" size="xl"
  Find any "Sync Now" button → add variant="gold" size="lg"

In staff/[weddingId]/sync/page.tsx:
  Find the "Sync Now" button → add variant="gold" size="lg"

In staff/[weddingId]/download/page.tsx:
  Find the primary "Start Check-In" or "Download Offline Pack" button → add variant="navy" size="xl"

Only change the specific CTAs named above. Do not change every button in these pages.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: Phase 35 to Completed Phases (today's date), Current Phase → Phase 36.
4. Stage and commit:
   git add src/components/ui/button.tsx src/app/globals.css src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx src/app/staff/[weddingId]/checkin/page.tsx src/app/staff/[weddingId]/sync/page.tsx src/app/staff/[weddingId]/download/page.tsx PROGRESS.md
   git commit -m "feat: add navy and gold button variants"
```
