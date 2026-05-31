# Phase 13A — Staff Local Guest Search

## Goal

Build the staff manual guest search UI that searches IndexedDB locally. Staff can type a name or phone number and get instant results from the local snapshot, without any network call. This is the fallback when QR scanning fails.

## Why This Phase Matters

Manual search is a critical fallback for when QR codes are not available, cameras fail, or guests don't have the QR. On a busy wedding day, search must be fast (under 200ms) and work completely offline. This phase makes the check-in experience resilient.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Section 14 — Manual Search Flow)
- `docs/components.md`
- `docs/ui_ux.md`

## Dependencies

- Phase 09 complete (IndexedDB foundation with guest search)
- Phase 12 complete (snapshot download — local guests exist)

## Scope

### Frontend Only

- `src/app/staff/[weddingId]/search/page.tsx`:
  - Search input (auto-focus on mount)
  - Live search as user types (debounced 150ms)
  - Results list: each shows guest name, phone, check-in status
  - Selecting a guest navigates to check-in confirmation page
  - Shows "No guests found" empty state
  - Shows offline warning banner if offline
- `src/components/staff/manual-search-results.tsx` — results list component
- `src/hooks/use-local-guest-search.ts` — hook wrapping `searchGuests()` from `src/lib/offline/guests/guest-search.ts`

## Explicitly Out of Scope

- QR scanner (Phase 13B)
- Check-in action (Phase 14A)
- Server-side search

## Implementation Tasks

1. Create `src/hooks/use-local-guest-search.ts`:
   ```ts
   export function useLocalGuestSearch(weddingId: string) {
     const [query, setQuery] = useState("");
     const [results, setResults] = useState<LocalGuest[]>([]);
     const [isSearching, setIsSearching] = useState(false);

     // debounce query by 150ms, then call searchGuests()
     // returns { query, setQuery, results, isSearching }
   }
   ```
2. Create `src/components/staff/manual-search-results.tsx`:
   - List of `GuestSearchResultItem` components
   - Each item: guest name (large, bold), phone number, check-in status badge
   - Tappable (navigate to check-in confirmation)
   - Empty state: "No guests found for '[query]'"
3. Build `src/app/staff/[weddingId]/search/page.tsx`:
   - Search input auto-focused on mount
   - Calls `useLocalGuestSearch`
   - Shows `ManualSearchResults`
   - Shows `OfflineWarningBanner` if offline
   - Shows `SyncStatusBar` at top
   - Mobile-first layout
4. Ensure check-in status is visible in results (checked-in guests should show a clear indicator).
5. Add a "Back" navigation button.

## Performance Requirement

Search must complete in under 200ms for 1,000 guests.

Test this by loading a snapshot of 1,000 guests in IndexedDB (use the seed script or a dev utility), then typing in the search box and observing timing.

## Files and Folders Likely to Be Created or Modified

- `src/hooks/use-local-guest-search.ts`
- `src/components/staff/manual-search-results.tsx`
- `src/app/staff/[weddingId]/search/page.tsx`

## Testing Requirements

Unit tests:
- `useLocalGuestSearch` debounces correctly
- `searchGuests` returns correct filtered results (from Phase 09 tests — verify still passing)

Manual offline test:
1. Download snapshot with staff device
2. Open DevTools → Network → set to Offline
3. Open search page
4. Type part of a guest name
5. Confirm results appear (from IndexedDB, no network calls)
6. Confirm results appear in under 200ms

`npm run lint` passes
`npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Search input is auto-focused
- [ ] Typing shows results from local IndexedDB
- [ ] No network requests are made during search
- [ ] Results are filtered as user types
- [ ] Checked-in guests show a clear checked-in indicator
- [ ] "No guests found" shows for empty results
- [ ] Selecting a result navigates to check-in confirmation (placeholder OK at this stage)
- [ ] Works offline (no internet)
- [ ] Mobile-friendly touch targets

## Acceptance Criteria

- [ ] Guest search uses only IndexedDB (no API calls)
- [ ] Results update within 150ms debounce + search time
- [ ] Checks offline — search works without internet
- [ ] Checked-in status visible in results
- [ ] TypeScript types correct

## Git Commit Recommendation

```
feat: implement staff local guest search
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 13A to Completed Phases
- Set Current Phase to Phase 13B and Phase 14A
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 13A: Staff Local Guest Search.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Section 14 — Manual Search Flow)
- docs/ui_ux.md (Staff mode UX requirements)

Your task is to build the staff manual guest search UI using local IndexedDB data.

1. Create src/hooks/use-local-guest-search.ts:
   - Takes weddingId
   - State: query string, results (LocalGuest[]), isSearching
   - Debounces search calls by 150ms
   - Calls searchGuests() from src/lib/offline/guests/guest-search.ts
   - Returns { query, setQuery, results, isSearching }

2. Create src/components/staff/manual-search-results.tsx:
   - Renders a list of guest search results
   - Each item: guest full name (large), phone number, check-in status badge
   - Tappable items — pass an onSelect callback
   - Empty state: "No guests found"

3. Build src/app/staff/[weddingId]/search/page.tsx:
   - Mobile-first layout
   - Auto-focused search input at top
   - Uses useLocalGuestSearch hook
   - Shows ManualSearchResults
   - Shows SyncStatusBar at top
   - Shows OfflineWarningBanner when offline
   - On guest selection: navigate to /staff/[weddingId]/checkin/[guestId]

RULES:
- Do NOT make any API calls in the search flow — only IndexedDB
- Search must work when device is offline
- Use h-14 minimum touch targets on result items
- Do not implement the check-in action in this phase — navigate to placeholder check-in page

After completing:
- Manually test: download snapshot, go offline in DevTools, search for a guest
- Confirm results appear with no network requests
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 13A completed, Current Phase → Phase 13B and Phase 14A.

Commit with:
git commit -m "feat: implement staff local guest search"
```
