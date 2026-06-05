# Phase 36 — Staff Mode Visual Polish

## Goal

Bring the four core staff-mode screens (login, download/prep, check-in home, check-in confirmation) up to the approved design fidelity: dark contextual backgrounds on the sync bar, a navy login screen with the WedPass wordmark, a large scan button with gold icon, and a bold success screen.

## Why This Phase Matters

Staff operate under pressure on event day — often on personal Android phones in crowded venues. The design's staff mode is deliberately bold: high contrast, large touch targets, and a persistent dark sync bar that communicates offline state at a glance. The current sync bar uses light-coloured variants (white backgrounds) that lose contrast against the ivory page background and don't signal the operational state with enough urgency. The login screen is a plain form with no brand presence. These are the first screens staff see; getting them right matters for real-world usability.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/components/staff/sync-status-bar.tsx` — the component to restyle
- `src/app/staff/[weddingId]/login/page.tsx` — the login screen to redesign
- `src/app/staff/[weddingId]/checkin/page.tsx` — scan button and layout
- `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx` — confirmation and success screens
- `src/components/shared/wedpass-wordmark.tsx` — must exist from Phase 32

## Dependencies

- Phase 32 complete (WedPassWordmark component)
- Phase 35 complete (navy and gold button variants, xl size)
- Phase 14B complete (check-in pages exist)

## Scope

### 1. Restyle `SyncStatusBar` — dark operational backgrounds

Replace the current light `bg-success-light text-success` (etc.) classes with dark backgrounds that match the design:

| State | Background | Dot colour | Icon colour | Text colour |
|---|---|---|---|---|
| `idle` (online, synced) | `#0f3d24` | `#3ddc84` | `rgba(255,255,255,0.85)` | white |
| `offline` | `#2b2118` | `#f0b463` | `rgba(255,255,255,0.85)` | white |
| `syncing` | `#15294d` | `#5b9bff` | `rgba(255,255,255,0.85)` | white |
| `failed` | `#3a1717` | `#f06b6b` | `rgba(255,255,255,0.85)` | white |

Switch from Tailwind classes to inline `style` objects for these backgrounds since they are hex values not in the token set. The dot is a `<span>` with `style={{ width: 9, height: 9, borderRadius: "50%", background: dotColor, boxShadow: \`0 0 0 4px ${dotColor}22\` }}`.

The text content and icon set stay the same; only the visual treatment changes.

Add a right-side label in amber/gold for offline and failed states: "Saved locally" — small, 12px, aligned `ml-auto`.

Updated component signature stays identical — no prop changes.

### 2. Staff login page — navy background, WedPass wordmark

Fully restyle `src/app/staff/[weddingId]/login/page.tsx`.

The design shows:
- Full-page navy background (`bg-navy`)
- Large faint W mark watermark behind the form (`opacity-[0.05]`, right-aligned, ~300px, `position: absolute`)
- Centred form column with `max-w-sm mx-auto`
- Large WedPass W mark centred above the form: `<WedPassWordmark size={60} textColor="#fff" />` (import from `@/components/shared/wedpass-wordmark`)
- Heading: "Event Mode" — `text-2xl font-bold text-white text-center`
- Subtext: "Enter your staff access to begin checking in guests." — `text-white/60 text-center text-sm`
- Inputs styled for the dark background:
  - Wrapper: `flex items-center gap-3 rounded-xl border border-white/15 bg-white/7 px-4 py-3.5`
  - Icon: lock icon, `text-white/45`
  - `<input>` with `bg-transparent border-0 text-white text-base font-semibold outline-none flex-1`
- Labels: `text-[12.5px] font-semibold text-white/60 mb-2 block`
- Submit button: `variant="gold" size="xl" className="w-full mt-6"` (from Phase 35) — label "Enter Event Mode →"
- Footer line: shield icon + "Staff access is limited & secure" in `text-white/50 text-xs`

Preserve all existing form submission logic, validation, and error handling — only the visual layer changes.

### 3. Staff check-in home — larger scan button

In `src/app/staff/[weddingId]/checkin/page.tsx`, update the scan CTA:

The "Scan QR Code" button should use `variant="navy" size="xl"` (from Phase 35) **plus** additional styles:
- `className="w-full flex-col gap-2 rounded-[20px] min-h-[132px]"` (extra tall, stacked content)
- Inside the button: a scan icon at size 40px in champagne colour above the text
- Text: "Scan QR Code" in `text-[19px] font-semibold`
- Sub-text: "Point the camera at a guest pass" in `text-[12.5px] text-white/60 font-medium`

The manual search input below the scan button should get a `border-2 border-navy` style to give it a stronger visual presence — matching the design's navy 2px border on the search field.

### 4. Check-in confirmation success screen

In `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx`, after a successful check-in, the success state currently exists but may lack visual weight. Update:

- The success circle: `size-24 rounded-full bg-success-light text-success flex items-center justify-center mx-auto mb-4`
- Checkmark icon inside: `size-12` stroke 2.5 — or use `CheckCircle` from lucide
- Heading: `text-2xl font-bold text-navy` — "[Guest] is in!"
- Sub-text: "Saved on this device. Will sync when internet returns." — `text-ink-2` (use `text-muted-foreground`)
- The "Continue Scanning" / "Next Guest" CTA button: `variant="gold" size="xl" className="w-full"`

Read the current file to understand what exactly exists before editing — preserve all state management and navigation logic.

## Files to Modify

- `src/components/staff/sync-status-bar.tsx`
- `src/app/staff/[weddingId]/login/page.tsx`
- `src/app/staff/[weddingId]/checkin/page.tsx`
- `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx`

## Explicitly Out of Scope

- No changes to the offline IndexedDB logic, sync engine, or API routes
- No changes to the staff search page (it already has reasonable styling)
- No changes to the staff sync page visual (covered by the sync bar restyle and gold button from Phase 35)
- The help page stays as is

## Implementation Tasks

1. Update `sync-status-bar.tsx` — switch to dark inline-style backgrounds and add dot + "Saved locally" label.
2. Restyle `login/page.tsx` — navy bg, wordmark, dark inputs, gold CTA.
3. Update scan button in `checkin/page.tsx` — `xl` size, flex-col, 40px icon, navy 2px border on search.
4. Update success state in `checkin/[guestId]/page.tsx` — larger circle, gold CTA.
5. Run `npx tsc --noEmit` — fix all type errors.
6. Run `npm run lint` — fix all lint errors.
7. Update `PROGRESS.md`: move Phase 36 to Completed Phases, set Current Phase to Phase 30 (continuing from where the roadmap left off — Phase 36 inserts after Phase 35 in the design gap sequence), record today's date.
8. Commit:
   ```
   git commit -m "feat: staff mode visual polish"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual checks:
- Staff login: navy background, W mark visible, gold "Enter Event Mode" button
- SyncStatusBar offline state: dark amber background, amber dot, white text
- SyncStatusBar online state: dark green background, green dot
- Scan QR button: 132px tall, navy, gold scan icon above text
- Check-in success: large green circle, bold heading, gold "Continue Scanning" button

## Acceptance Criteria

- [ ] SyncStatusBar offline state has dark amber background with white text
- [ ] SyncStatusBar online/synced state has dark green background with white text
- [ ] Staff login page has navy background with WedPass wordmark
- [ ] Staff login submit button uses gold variant
- [ ] Scan QR Code button is at least 132px tall, navy, with gold icon
- [ ] Check-in success screen has large green circle and gold CTA
- [ ] TypeScript and lint pass

## Git Commit

```
feat: staff mode visual polish
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 36 to Completed Phases with today's date
- Set Current Phase to Phase 30 (returning to the main roadmap)
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 36: Staff Mode Visual Polish.

Before starting, read:
- CLAUDE.md
- src/components/staff/sync-status-bar.tsx
- src/app/staff/[weddingId]/login/page.tsx
- src/app/staff/[weddingId]/checkin/page.tsx
- src/app/staff/[weddingId]/checkin/[guestId]/page.tsx
- src/components/shared/wedpass-wordmark.tsx  (from Phase 32)

CHANGE 1 — Restyle SyncStatusBar (src/components/staff/sync-status-bar.tsx).
Replace the light Tailwind class config with dark inline styles. The stateConfig should become:

const stateConfig = {
  idle:    { bg: "#0f3d24", dot: "#3ddc84", icon: <Wifi />,         savedLocally: false },
  offline: { bg: "#2b2118", dot: "#f0b463", icon: <WifiOff />,      savedLocally: true  },
  syncing: { bg: "#15294d", dot: "#5b9bff", icon: <RefreshCw spin/>, savedLocally: false },
  failed:  { bg: "#3a1717", dot: "#f06b6b", icon: <AlertTriangle />, savedLocally: true  },
}

Render the bar as:
  <div style={{ background: cfg.bg }} className="sticky top-0 z-40 flex items-center gap-2.5 px-4 py-2.5 text-white">
    <span style={{ width:9, height:9, borderRadius:"50%", background:cfg.dot, boxShadow:`0 0 0 4px ${cfg.dot}22`, flexShrink:0 }} />
    {cfg.icon rendered at size-4 with color rgba(255,255,255,0.85)}
    <span className="text-[13.5px] font-semibold tracking-[0.01em]">{statusText}</span>
    {cfg.savedLocally && <span className="ml-auto text-[12px] font-semibold" style={{ color: cfg.dot }}>Saved locally</span>}
  </div>

Keep all existing statusText logic and props unchanged.

CHANGE 2 — Restyle staff login page (src/app/staff/[weddingId]/login/page.tsx).
Read the file fully first. Preserve ALL form logic, validation, error handling, and submission. Only change the visual wrapper.

New outer wrapper: <div className="relative flex min-h-screen flex-col bg-navy text-white overflow-hidden">
Add a faint background W mark:
  <div className="absolute right-[-60px] top-10 opacity-[0.05] pointer-events-none">
    <WedPassWordmark size={300} textColor="#fff" />
  </div>

Form container: <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-10">
  <div className="w-full max-w-sm">
    <div className="mb-6 flex justify-center"><WedPassWordmark size={60} textColor="#fff" /></div>
    <h1 className="mb-2 text-center text-[23px] font-bold">Event Mode</h1>
    <p className="mb-8 text-center text-sm text-white/60 leading-relaxed">Enter your staff access to begin checking in guests.</p>
    {/* existing form fields, but restyle inputs: */}
    {/* Input wrapper: flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 */}
    {/* Input element: bg-transparent border-0 text-white text-base font-semibold outline-none flex-1 placeholder:text-white/30 */}
    {/* Label: text-[12.5px] font-semibold text-white/60 mb-2 block */}
    {/* Submit button: variant="gold" size="xl" className="w-full mt-6" */}
    {/* Footer: <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/50"> */}
    {/*   <ShieldCheck className="size-3.5 text-champagne" /> Staff access is limited & secure */}
    {/* </div> */}
  </div>
</div>

Import WedPassWordmark from "@/components/shared/wedpass-wordmark".
Import ShieldCheck from lucide-react (or use Shield icon).

CHANGE 3 — Scan button in check-in page (src/app/staff/[weddingId]/checkin/page.tsx).
Read the file first.
Find the "Scan QR Code" button and update it:
  <Button
    variant="navy"
    className="w-full flex-col gap-2 rounded-[20px] min-h-[132px]"
    onClick={...existing handler...}
  >
    <ScanLine className="size-10 text-champagne" />
    <span className="text-[19px] font-semibold">Scan QR Code</span>
    <span className="text-[12.5px] font-medium text-white/60">Point the camera at a guest pass</span>
  </Button>
(Use ScanLine or Scan icon from lucide-react — check which exists.)

Find the manual search input/button area below the scan button.
If it's an <Input> or a styled div acting as a search trigger, add border-2 border-navy to the search element.

CHANGE 4 — Check-in success state (src/app/staff/[weddingId]/checkin/[guestId]/page.tsx).
Read the file fully first. Find the success/checked-in state rendering.
Update the success circle:
  <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-success-light text-success">
    <CheckCircle className="size-12" strokeWidth={2} />
  </div>
Update the "Continue Scanning" or "Next Guest" CTA:
  <Button variant="gold" size="xl" className="w-full" onClick={...}>Continue Scanning</Button>
Preserve all existing state and navigation logic exactly.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: Phase 36 to Completed Phases (today's date), Current Phase → Phase 30.
4. Stage and commit:
   git add src/components/staff/sync-status-bar.tsx src/app/staff/[weddingId]/login/page.tsx src/app/staff/[weddingId]/checkin/page.tsx "src/app/staff/[weddingId]/checkin/[guestId]/page.tsx" PROGRESS.md
   git commit -m "feat: staff mode visual polish"
```
