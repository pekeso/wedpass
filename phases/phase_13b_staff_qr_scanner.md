# Phase 13B — Staff QR Scanner

## Goal

Build the QR code scanner for staff check-in. The scanner uses the device camera to read QR codes, extracts the `qrToken`, looks up the guest in IndexedDB, and navigates to the check-in confirmation screen — all without any network call.

## Why This Phase Matters

QR scanning is the primary and fastest check-in method. On a wedding day with hundreds of guests, scanning is much faster than manual search. The scanner must be fast, reliable, and fail gracefully by offering manual search fallback.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Section 13 — QR Check-In Flow)
- `docs/ui_ux.md`
- `docs/components.md`

## Dependencies

- Phase 13A complete (local guest search — uses same local guest repository)

## Scope

### Frontend Only

- `src/app/staff/[weddingId]/scan/page.tsx`:
  - Camera permission request
  - QR scanner using `@zxing/library` or `react-qr-scanner` or similar
  - On scan: extracts qrToken, looks up in IndexedDB
  - If found: navigate to check-in confirmation
  - If not found: show error + manual search button
  - Shows `SyncStatusBar` at top
  - Manual search fallback always visible

- `src/components/staff/scanner-frame.tsx` — camera viewfinder with overlay guidance

## Explicitly Out of Scope

- QR scanning on server (all local)
- Check-in action (Phase 14A)

## Implementation Tasks

1. Install a QR scanning library. Recommended: `html5-qrcode` (widely used, good mobile support):
   ```bash
   npm install html5-qrcode
   ```
   Alternative: `@zxing/library` or `react-qr-scanner`.
2. Create `src/components/staff/scanner-frame.tsx`:
   - Camera viewfinder with a visual scanning frame overlay
   - Start/stop controls
   - Mobile-optimized (full-width on mobile)
3. Build `src/app/staff/[weddingId]/scan/page.tsx`:
   - On mount: initialize scanner
   - On successful scan:
     - Extract qrToken from payload `wedpass://checkin/<qrToken>`
     - Look up guest in IndexedDB via `findGuestByQrToken(weddingId, qrToken)`
     - If found: navigate to `/staff/[weddingId]/checkin/[guestId]`
     - If not found: show error message ("QR code not recognized. Please use manual search.")
   - Manual search button always visible at bottom
   - Back navigation
4. Handle camera permission errors gracefully:
   - Show a clear message if camera access is denied
   - Direct staff to manual search
5. Avoid double-scanning the same QR code within a short window (add 2-second cooldown after a scan).

## QR Payload Format

Scan payload: `wedpass://checkin/<qrToken>`

Parse with:
```ts
const token = payload.replace("wedpass://checkin/", "").trim();
```

## Files and Folders Likely to Be Created or Modified

- `src/components/staff/scanner-frame.tsx`
- `src/app/staff/[weddingId]/scan/page.tsx`

## Testing Requirements

Manual tests (requires a real device or simulator with camera):
1. Scan a valid QR code — verify navigates to check-in confirmation
2. Scan an unknown QR code — verify error message + search fallback shown
3. Deny camera permission — verify graceful error message
4. Go offline in DevTools, scan QR — verify still works (local only)
5. Scan same QR twice quickly — verify 2-second cooldown prevents double navigation

`npm run lint` passes
`npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Scanner page loads and requests camera permission
- [ ] Camera viewfinder is visible with overlay
- [ ] Scanning a valid QR navigates to check-in page
- [ ] Invalid QR shows error and manual search button
- [ ] Camera denied shows helpful message
- [ ] Works offline (no network calls during scan)
- [ ] Manual search link is always visible

## Acceptance Criteria

- [ ] QR scanning works on mobile browser
- [ ] qrToken extracted and looked up in IndexedDB (no API call)
- [ ] Graceful fallback for unrecognized QR
- [ ] Camera denial handled
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add staff qr scanner
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 13B to Completed Phases
- Set Current Phase to Phase 14B (14A should be done in parallel or just before)
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 13B: Staff QR Scanner.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Section 13 — QR Check-In Flow)

Your task is to build the staff QR code scanner.

1. Install html5-qrcode (or @zxing/library or react-qr-scanner — choose one that works well on mobile):
   npm install html5-qrcode

2. Create src/components/staff/scanner-frame.tsx:
   - Camera viewfinder with visual scanning overlay
   - Mobile-optimized full-width view

3. Build src/app/staff/[weddingId]/scan/page.tsx:
   - Initialize scanner on mount
   - On scan success:
     a. Extract qrToken from payload "wedpass://checkin/<qrToken>"
     b. Call findGuestByQrToken(weddingId, qrToken) from src/lib/offline/guests/guest-local-repository.ts
     c. If guest found: navigate to /staff/[weddingId]/checkin/[guestId]
     d. If not found: show error "QR code not recognized. Please use manual search."
   - Manual search button always visible
   - Add 2-second cooldown after each successful scan to prevent double-scanning
   - If camera permission denied: show clear message directing to manual search
   - Show SyncStatusBar at top

RULES:
- Do NOT call any API during QR scanning — only IndexedDB
- QR scanning must work offline
- Scanning is "use client" only — Dexie cannot run on server

After completing:
- Test on a mobile device or browser with camera access
- Test invalid QR, denied camera permission
- Test offline scanning
- Run npm run lint — must pass

Update PROGRESS.md: Phase 13B completed, Current Phase → Phase 14B.

Commit with:
git commit -m "feat: add staff qr scanner"
```
