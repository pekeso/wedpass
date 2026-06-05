# Phase 40 — Public Layout and Auth Pages Polish

## Goal

Two visual improvements:
1. Replace the plain "WedPass" text in the public navigation header with the WedPass wordmark component.
2. Give the login and register pages a warmer, more premium feel by adding a subtle ivory background to the page body and improving the auth card's visual weight.

## Why This Phase Matters

The public layout header currently renders "WedPass" as a plain `<span>` with `text-lg font-semibold`. The wordmark component (from Phase 32) exists but is only used on auth cards and the sidebar. Consistency means the header should also use the wordmark.

The login and register pages sit on a white background that feels generic. The design spec calls for a "Calm, Premium, Professional" organizer experience. A warm ivory body and slightly elevated card (box-shadow, border) brings the auth pages in line with the rest of the product.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/components/layout/public-layout.tsx` — the header to update
- `src/app/(public)/login/page.tsx` — the login card to polish
- `src/app/(public)/register/page.tsx` — the register card to polish
- `src/components/shared/wedpass-wordmark.tsx`
- `src/app/globals.css` — check shadow-card token exists

## Dependencies

- Phase 32 complete (WedPassWordmark component)

## Scope

### 1. Public Layout Header — wordmark

In `src/components/layout/public-layout.tsx`:

Replace:
```tsx
<Link href="/" className="text-lg font-semibold text-navy hover:opacity-90">
  WedPass
</Link>
```

With:
```tsx
<Link href="/" className="hover:opacity-85 transition-opacity">
  <WedPassWordmark size={20} />
</Link>
```

Import `WedPassWordmark` from `"@/components/shared/wedpass-wordmark"`.

The rest of the header (nav links, "Join Free Beta" button) stays exactly the same.

### 2. Auth Pages Background

In both `src/app/(public)/login/page.tsx` and `src/app/(public)/register/page.tsx`:

Change the outer wrapper from:
```tsx
<div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
```

To:
```tsx
<div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-ivory px-4 py-12">
```

This adds `bg-ivory` to the wrapper so the warm ivory tint fills the page body below the nav.

### 3. Auth Card Elevation

The current `<Card>` on both pages already has reasonable styling from shadcn. Add a subtle navy top accent bar to the card to give it more visual weight and brand identity.

Inside each `<Card>` (as the very first child, before `<CardHeader>`):
```tsx
<div className="h-1 w-full rounded-t-[inherit] bg-navy" />
```

This adds a 4px navy bar across the top of the card — a common premium pattern.

### 4. Auth Button Brand Consistency

In both pages, the submit button currently uses:
```tsx
<Button type="submit" className="w-full bg-navy hover:bg-navy/90" ...>
```

Replace with the proper variant:
```tsx
<Button type="submit" variant="navy" className="w-full" ...>
```

This uses the branded `navy` variant from Phase 35 instead of a raw Tailwind class override.

## Files to Modify

- `src/components/layout/public-layout.tsx`
- `src/app/(public)/login/page.tsx`
- `src/app/(public)/register/page.tsx`

## Files to NOT Touch

- Any other layouts, pages, or components

## Implementation Tasks

1. Update `public-layout.tsx` — replace text link with WedPassWordmark.
2. Update `login/page.tsx` — add `bg-ivory` to wrapper, navy top bar to Card, use `variant="navy"` on submit button.
3. Update `register/page.tsx` — same changes as login.
4. Run `npx tsc --noEmit` — fix all type errors.
5. Run `npm run lint` — fix all lint errors.
6. Update `PROGRESS.md`: add Phase 40 to Completed Phases, set Current Phase to 41.
7. Commit:
   ```
   git commit -m "feat: polish public layout and auth pages"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual checks:
- Public header shows the WedPass wordmark (W mark + "WedPass" logotype) instead of plain text
- Login page has warm ivory background
- Login card has navy top stripe at the very top of the card
- Register page has the same treatment
- Submit button uses the branded navy variant

## Acceptance Criteria

- [ ] Public layout header shows WedPassWordmark (not plain text)
- [ ] Login and register pages have `bg-ivory` wrapper
- [ ] Login and register cards have a navy top accent bar
- [ ] Submit buttons use `variant="navy"` (not inline Tailwind override)
- [ ] TypeScript and lint pass

## Git Commit

```
feat: polish public layout and auth pages
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 40 to Completed Phases with today's date
- Set Current Phase to 41
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 40: Public Layout and Auth Pages Polish.

Before starting, read ALL of these files:
- CLAUDE.md
- src/components/layout/public-layout.tsx
- src/app/(public)/login/page.tsx
- src/app/(public)/register/page.tsx
- src/components/shared/wedpass-wordmark.tsx
- src/components/ui/button.tsx (confirm navy variant exists)

CHANGE 1 — src/components/layout/public-layout.tsx
Find the Link that wraps the "WedPass" text in the header. Replace it with a Link wrapping <WedPassWordmark size={20} />.
Add the import: import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
Keep the className: change it to "hover:opacity-85 transition-opacity" (remove the text classes since the wordmark handles its own styling).
Do not change any other part of the header or layout.

CHANGE 2 — src/app/(public)/login/page.tsx
Read the file first. Three edits:

a) The outer div: add bg-ivory to its className.
   Before: "flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12"
   After:  "flex min-h-[calc(100vh-7rem)] items-center justify-center bg-ivory px-4 py-12"

b) Inside <Card>, add as the very first child (before <CardHeader>):
   <div className="h-1 w-full rounded-t-[inherit] bg-navy" />

c) The submit <Button>: change from className="w-full bg-navy hover:bg-navy/90" to variant="navy" className="w-full"
   Remove the bg-navy/hover class from className since the variant handles it.

CHANGE 3 — src/app/(public)/register/page.tsx
Apply the exact same three edits as Change 2 above.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 40 to Completed Phases (today's date), set Current Phase to 41.
4. Stage and commit:
   git add src/components/layout/public-layout.tsx src/app/(public)/login/page.tsx src/app/(public)/register/page.tsx PROGRESS.md
   git commit -m "feat: polish public layout and auth pages"
```
