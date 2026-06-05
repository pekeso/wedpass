# Phase 32 — WedPass Wordmark Component

## Goal

Create the official WedPass brand wordmark component — the split-W SVG mark plus "WedPass" logotype — and replace the plain text in the sidebar, login, and register pages.

## Why This Phase Matters

The sidebar currently renders a plain `<span>WedPass</span>`. The approved design uses a custom two-tone "W" mark (left stroke navy, right stroke gold) beside "Wed**Pass**" text (weight 800, "Pass" tinted gold). This is the most immediately recognisable brand element and every organizer sees it on every page. Fixing it closes the largest single visual gap between the live app and the design prototype.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/app/globals.css` — understand existing CSS custom properties (`--color-navy`, `--color-champagne`, `--color-champagne-deep` to be added)
- `src/components/layout/app-sidebar.tsx` — where the wordmark must replace the plain text
- `src/app/(public)/login/page.tsx` and `register/page.tsx` — secondary usage sites

## Dependencies

- Phase 02 complete (design tokens configured)
- Phase 03 complete (sidebar exists)

## Scope

### 1. Add `champagne-deep` token to globals.css

In `src/app/globals.css`, inside the `@theme { }` block that already has `--color-champagne`, add:

```css
--color-champagne-deep: #A8843F;
```

### 2. Create `src/components/shared/wedpass-wordmark.tsx`

This is a pure presentational component. No client directive needed (SVG is static).

**Props:**

```ts
interface WedPassWordmarkProps {
  /** Height of the W mark in px. Text scales proportionally. Default 28. */
  size?: number
  /** Colour of "Wed" text. Default "var(--color-navy)". Pass "#fff" for dark backgrounds. */
  textColor?: string
  /** Show "Smart Wedding Check-In" tagline beneath the wordmark. Default false. */
  tagline?: boolean
}
```

**The W mark SVG:**

The mark is a single polyline path `M10,27 L31,90 L50,7 L69,90 L90,27` on a `0 0 100 96` viewBox, rendered as two overlapping strokes clipped at the vertical midline (x = 50):

- Left clip (`0 0 50 96`): stroke colour `#172033` (navy)
- Right clip (`50 0 50 96`): stroke colour `#C8A45D` (champagne)
- `strokeWidth={13}` `strokeLinejoin="miter"` `strokeLinecap="butt"` `strokeMiterlimit={20}` `fill="none"`
- SVG dimensions: `width={size}` `height={size * 0.92}`

Use two `<clipPath>` elements with unique IDs (use a module-level counter or `useId` if the component is ever rendered multiple times). Because this is a server component, use `React.useId()` only if you add `"use client"`, otherwise generate IDs from a simple incrementing counter module variable.

**"WedPass" logotype:**

Beside the mark, render:

```
Wed<span style={{ color: "var(--color-champagne-deep)" }}>Pass</span>
```

- `fontWeight: 800`
- `fontSize: size * 0.66` (px)
- `letterSpacing: "-0.01em"`
- `color`: the `textColor` prop (default `"var(--color-navy)"`)

**Tagline (optional):**

When `tagline={true}`, below the wordmark text render:

```
Smart Wedding Check‑In
```

- `fontSize: size * 0.235`
- `letterSpacing: "0.22em"`
- `textTransform: "uppercase"`
- `color: "var(--color-champagne-deep)"`
- `fontWeight: 600`

**Full layout:**

```tsx
<div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
  {/* W mark SVG */}
  <div style={{ lineHeight: 1 }}>
    <div>Wed<span>Pass</span></div>
    {tagline && <div>Smart Wedding Check-In</div>}
  </div>
</div>
```

### 3. Update `src/components/layout/app-sidebar.tsx`

Replace:

```tsx
<span className="text-lg font-semibold tracking-tight">WedPass</span>
```

With:

```tsx
<WedPassWordmark size={22} textColor="#fff" />
```

Import `WedPassWordmark` from `@/components/shared/wedpass-wordmark`.

The surrounding `<div className="border-b border-white/10 px-5 py-4">` wrapper can stay as is.

### 4. Update login and register pages

In `src/app/(public)/login/page.tsx` and `src/app/(public)/register/page.tsx`, find wherever the app name / logo is shown and replace with:

```tsx
<WedPassWordmark size={28} />
```

If these pages currently show no logo at all, add the wordmark prominently near the top of the form panel (above the heading).

## Files to Create

- `src/components/shared/wedpass-wordmark.tsx`

## Files to Modify

- `src/app/globals.css` (add `--color-champagne-deep` token)
- `src/components/layout/app-sidebar.tsx`
- `src/app/(public)/login/page.tsx`
- `src/app/(public)/register/page.tsx`

## Explicitly Out of Scope

- No changes to routing, API, or business logic
- No animation on the W mark
- No changes to the staff or guest layouts (covered in Phase 36)

## Implementation Tasks

1. Add `--color-champagne-deep: #A8843F` to the `@theme` block in `globals.css`.
2. Create `src/components/shared/wedpass-wordmark.tsx` as a server component with the spec above.
3. Verify the SVG renders correctly by reading the component carefully — the two `<clipPath>` rects must be at `x={0}` and `x={50}` respectively, and both paths share the identical `d` string.
4. Replace sidebar text with `<WedPassWordmark size={22} textColor="#fff" />`.
5. Add/replace wordmark on login and register pages.
6. Run `npx tsc --noEmit` — fix any type errors.
7. Run `npm run lint` — fix any lint errors.
8. Update `PROGRESS.md`: move Phase 32 to Completed Phases, set Current Phase to Phase 33, record today's date.
9. Commit:
   ```
   git commit -m "feat: add WedPass wordmark component"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual check: open the sidebar in the browser — the W mark should be visible with navy left stroke and gold right stroke, "Wed" in white, "Pass" in darker gold.

## Acceptance Criteria

- [ ] `src/components/shared/wedpass-wordmark.tsx` created
- [ ] `--color-champagne-deep` token present in `globals.css`
- [ ] Sidebar shows the W mark + "WedPass" logotype (not plain text)
- [ ] Login and register pages show the wordmark
- [ ] TypeScript and lint pass

## Git Commit

```
feat: add WedPass wordmark component
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 32 to Completed Phases
- Set Current Phase to Phase 33
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 32: WedPass Wordmark Component.

Before starting, read:
- CLAUDE.md
- src/app/globals.css
- src/components/layout/app-sidebar.tsx
- src/app/(public)/login/page.tsx
- src/app/(public)/register/page.tsx

Your task is to create the official WedPass brand wordmark and replace all plain "WedPass" text instances with it.

Step 1 — Add the champagne-deep color token.
In src/app/globals.css, inside the @theme { } block that already contains --color-champagne: #C8A45D, add on the next line:
  --color-champagne-deep: #A8843F;

Step 2 — Create src/components/shared/wedpass-wordmark.tsx.

This is a server component (no "use client" needed).

Props:
  size?: number  (default 28, controls height of W mark in px)
  textColor?: string  (default "var(--color-navy)", pass "#fff" for dark backgrounds)
  tagline?: boolean  (default false)

The W mark is an SVG:
  width={size} height={size * 0.92} viewBox="0 0 100 96"
  A single path: d="M10,27 L31,90 L50,7 L69,90 L90,27"
  Rendered TWICE via two <path> elements inside a <g fill="none" strokeWidth={13} strokeLinejoin="miter" strokeLinecap="butt" strokeMiterlimit={20}>
  First path: stroke="#172033", clipped by a <clipPath id="wp-left-N"><rect x="0" y="0" width="50" height="96" /></clipPath>
  Second path: stroke="#C8A45D", clipped by a <clipPath id="wp-right-N"><rect x="50" y="0" width="50" height="96" /></clipPath>
  (N is a unique number per instance — use a module-level let _id = 0 counter, incrementing in the component body with useId-style logic, or just use a static suffix like "0" since only one wordmark renders per page at a time.)

The logotype text:
  <div style={{ fontWeight: 800, fontSize: `${size * 0.66}px`, letterSpacing: "-0.01em", color: textColor ?? "var(--color-navy)" }}>
    Wed<span style={{ color: "var(--color-champagne-deep)" }}>Pass</span>
  </div>

When tagline is true, below the logotype:
  <div style={{ fontSize: `${size * 0.235}px`, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-champagne-deep)", marginTop: "5px", fontWeight: 600 }}>
    Smart Wedding Check‑In
  </div>

Outer layout:
  <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(size * 0.4)}px` }}>
    {svg}
    <div style={{ lineHeight: 1 }}>{logotype}{tagline && taglineEl}</div>
  </div>

Step 3 — Update src/components/layout/app-sidebar.tsx.
Replace the <span className="text-lg font-semibold tracking-tight">WedPass</span> with:
  <WedPassWordmark size={22} textColor="#fff" />
Import WedPassWordmark from "@/components/shared/wedpass-wordmark".

Step 4 — Update public pages.
In src/app/(public)/login/page.tsx and src/app/(public)/register/page.tsx, find where the site name / logo is shown and replace with <WedPassWordmark size={28} />. If there is no logo element yet, add <WedPassWordmark size={28} /> above the main heading of the form.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors before continuing.
2. Run: npm run lint — fix all lint errors before continuing.
3. Update PROGRESS.md:
   - Move Phase 32 to Completed Phases with today's date (2026-06-02)
   - Set Current Phase to Phase 33
   - Set Last Updated to 2026-06-02
   - Add a Phase 32 completion entry with files created/modified
4. Stage and commit:
   git add src/components/shared/wedpass-wordmark.tsx src/app/globals.css src/components/layout/app-sidebar.tsx src/app/(public)/login/page.tsx src/app/(public)/register/page.tsx PROGRESS.md
   git commit -m "feat: add WedPass wordmark component"
```
