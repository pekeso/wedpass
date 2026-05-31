# Phase 08 — CSV Import and QR/Pass Generation

## Goal

Implement CSV guest import with validation, and build the QR code display/download page for the organizer. Guests can be bulk-imported from a CSV file and each guest has a downloadable QR code.

## Why This Phase Matters

Most African wedding organizers have guest lists in spreadsheets. CSV import removes the biggest friction barrier to onboarding. QR code generation is what enables fast scanning at event entrance. Both features must be solid before Event Mode begins.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 3 Section 18, Part 4 — QR Code API)
- `docs/v1_scope.md` (Sections 7.3 and 7.4)
- `docs/components.md`

## Dependencies

- Phase 07 complete (guest management)

## Scope

### CSV Import

- Client-side CSV parsing with `papaparse`
- Column mapping: `fullName` (required), `phoneNumber`, `email`, `numberOfAllowedGuests`
- Validation of each row with Zod
- Duplicate detection (same phone number as existing guest)
- Server-side batch import endpoint
- Import results summary (imported, failed, errors)
- CSV import UI dialog on guest list page

### QR Code Generation

- QR code display per guest using `qrcode.react`
- Individual QR code download as PNG
- QR codes page: `src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx`
- Shows all guests with their QR code and a download button
- QR payload format: `wedpass://checkin/<qrToken>`

## Explicitly Out of Scope

- Batch QR download as ZIP (future enhancement)
- Designed invitation cards
- NFC tokens
- QR code scanning (Phase 13B)

## Implementation Tasks

1. Install dependencies:
   ```bash
   npm install papaparse qrcode.react
   npm install -D @types/papaparse
   ```
2. Create `src/app/api/v1/weddings/[weddingId]/guests/import/route.ts`:
   ```ts
   POST /api/v1/weddings/:weddingId/guests/import
   ```
   - Auth: organizer required
   - Request body: `{ guests: CreateGuestDTO[] }` (pre-validated array)
   - Server validates each guest with `createGuestSchema`
   - Generates QR token for each valid guest
   - Returns: `{ importedCount, failedCount, errors: [{ row, message }] }`
3. Create `src/components/guests/csv-import-dialog.tsx`:
   - File input for `.csv` files
   - Client-side parsing with papaparse
   - Column preview / mapping
   - Validation summary
   - Submit to import API endpoint
   - Shows import results
4. Wire `CsvImportDialog` into the guest list page (add "Import CSV" button alongside "Add Guest").
5. Create `src/components/guests/guest-qr-code.tsx`:
   - Uses `qrcode.react` (QRCodeSVG or QRCodeCanvas)
   - Shows QR code for `wedpass://checkin/<qrToken>`
   - Download button: converts to PNG and triggers download
6. Build `src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx`:
   - Fetches all guests for wedding
   - Shows grid of `GuestQrCode` components (name + QR code)
   - Each has a download button
7. Add QR data API routes:
   - `GET /api/v1/weddings/:weddingId/guests/:guestId/qr`
   - `GET /api/v1/weddings/:weddingId/qr-codes` (all)
8. Create sample CSV template for download (optional but helpful for beta users).

## CSV Format Expected

```csv
fullName,phoneNumber,email,numberOfAllowedGuests
Michael Okoro,+2348012345678,michael@example.com,2
Sarah Adebayo,+2348099876543,,1
```

## Files and Folders Likely to Be Created or Modified

- `src/app/api/v1/weddings/[weddingId]/guests/import/route.ts`
- `src/app/api/v1/weddings/[weddingId]/guests/[guestId]/qr/route.ts`
- `src/app/api/v1/weddings/[weddingId]/qr-codes/route.ts`
- `src/components/guests/csv-import-dialog.tsx`
- `src/components/guests/guest-qr-code.tsx`
- `src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx`

## Testing Requirements

- Import 5 valid guests via CSV — verify all created with unique QR tokens
- Import CSV with 1 missing name — verify row error returned, others imported
- Import after Event Mode — verify `EVENT_MODE_LOCKED` error
- View QR codes page — verify QR codes render for all guests
- Download individual QR code — verify PNG file downloaded
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] "Import CSV" button opens dialog
- [ ] CSV file is parsed and previewed
- [ ] Import results show count and any row errors
- [ ] QR codes page shows all guests with QR images
- [ ] QR code scan (by phone camera) resolves to `wedpass://checkin/<token>`
- [ ] Download button saves PNG file
- [ ] Invalid CSV rows are reported with row number and message

## Acceptance Criteria

- [ ] CSV import API handles batch guests correctly
- [ ] Row-level validation errors reported
- [ ] QR token generated for every imported guest
- [ ] QR codes page renders correctly
- [ ] Individual QR download works
- [ ] Event Mode lock applies to CSV import

## Git Commit Recommendation

```
feat: add csv import and qr generation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 08 to Completed Phases
- Set Current Phase to Phase 09 and Phase 11 (can now proceed toward Event Mode)
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 08: CSV Import and QR/Pass Generation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Parts 3 and 4)

Your task is to implement CSV guest import and QR code display/download.

1. Install: papaparse (with @types/papaparse) and qrcode.react.

2. Create POST /api/v1/weddings/:weddingId/guests/import route handler.
   - Parse body as { guests: CreateGuestDTO[] }
   - Validate each with createGuestSchema
   - Generate QR token for each valid guest
   - Return { importedCount, failedCount, errors: [{ row, message }] }
   - Enforce Event Mode lock

3. Create src/components/guests/csv-import-dialog.tsx:
   - CSV file input, papaparse parsing, column mapping
   - Submit to import endpoint, show results

4. Wire CsvImportDialog into the guest list page.

5. Create GET /api/v1/weddings/:weddingId/qr-codes route handler.

6. Create src/components/guests/guest-qr-code.tsx:
   - QR code using qrcode.react
   - Payload: wedpass://checkin/<qrToken>
   - Download button (canvas-to-PNG)

7. Build src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx:
   - Grid of GuestQrCode components, one per guest

Rules:
- QR token must be generated by server, not client
- Event Mode lock must apply to CSV import too
- Validate each CSV row — partial imports are OK, report errors per row

After completing:
- Test CSV import with valid and invalid data
- Test QR display and download
- Run npm run lint — must pass

Update PROGRESS.md: Phase 08 completed, Current Phase → Phase 09.

Commit with:
git commit -m "feat: add csv import and qr generation"
```
