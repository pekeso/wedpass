# Phase 26 — Bilingual English/French Foundation

## Goal

Add a translation infrastructure to WedPass so the app can be used in both English and French. Translate all operational strings: staff mode, guest upload, gallery, offline/sync messages, and staff help text. The structure must be clean enough for future additional languages.

## Why This Phase Matters

WedPass targets Central, East, and West Africa — many of which are French-speaking (DRC, Cameroon, Côte d'Ivoire, Senegal, Benin). Without French support, WedPass cannot serve a large portion of its target market. Setting up the translation structure now means future strings can be added without rearchitecting.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/prd.md` (Target market)
- `docs/staff_training_guide.md` (already contains English and French staff instructions — use as source of truth for staff translation strings)
- `docs/event_operations.md` (operational strings used on event day)
- `docs/v1_scope.md` (Target market scope)

**Note:** The prompt specification for this project explicitly requires bilingual English/French support. This phase implements the translation structure and all key operational strings.

## Dependencies

- Phase 03 complete (shared components)

## Scope

### Translation Infrastructure

Use `next-intl` or a simple custom translation hook. For simplicity in V1.0, a lightweight approach is recommended:

- `src/lib/i18n/translations/en.ts` — English strings
- `src/lib/i18n/translations/fr.ts` — French strings
- `src/lib/i18n/use-translations.ts` — hook: `const t = useTranslations()`
- Language detection: browser preference or explicit toggle
- Language stored in localStorage

### Strings to Translate (Priority Order)

1. **Staff Mode Strings (highest priority)**
   - "Scan QR Code", "Search Guest", "Check In", "Already Checked In"
   - "Offline mode active. Check-ins are safely saved on this device."
   - "Sync failed. Your check-ins are still saved. We will retry automatically."
   - "All check-ins are synced."
   - "Sync Now", "Syncing...", "Pending: {n} check-ins"
   - "Download Offline Pack", "Offline Pack Ready", "Not Prepared"
   - "Manual Search", "No guests found"

2. **Guest Upload Strings**
   - "Share Your Photos & Videos"
   - "Upload Photo", "Upload Video"
   - "File too large", "Unsupported file type"
   - "Upload successful!", "Uploading...", "Upload queued for later"

3. **Guest Gallery Strings**
   - "View Gallery", "All", "Photos", "Videos"
   - "No media yet. Be the first to share!"
   - "Gallery is private or unavailable"

4. **Offline/Sync Messages**
   - All error and status messages in SyncStatusBar
   - Staff help messages

5. **Staff Help Messages**
   - Full translation of help panel text

### Language Toggle

- Simple language toggle in:
  - Staff mode: visible toggle (EN/FR) in header
  - Guest pages: visible toggle
  - Organizer dashboard: in settings (or header)

## Explicitly Out of Scope

- Full translation of organizer dashboard (staff/guest-facing strings are priority)
- RTL language support
- Professional translation service integration
- Automatic language detection from URL

## Implementation Tasks

1. Install `next-intl` or implement a lightweight translation hook:
   ```bash
   npm install next-intl
   ```
   Or use a simple custom approach:
   ```ts
   // src/lib/i18n/use-translations.ts
   export function useTranslations() {
     const lang = useLanguage(); // from context or localStorage
     return (key: string, params?: Record<string, string>) => translate(lang, key, params);
   }
   ```
2. Create `src/lib/i18n/translations/en.ts` with all English strings.
3. Create `src/lib/i18n/translations/fr.ts` with all French translations.
4. Create `src/lib/i18n/language-context.tsx`:
   - `LanguageProvider` wrapping the app
   - `useLanguage()` hook
   - Language stored in localStorage, defaults to `en`
5. Create `src/components/shared/language-toggle.tsx`:
   - Simple EN/FR button toggle
   - Updates localStorage and context
6. Add `LanguageToggle` to:
   - Staff layout
   - Guest layout
7. Replace hardcoded strings in:
   - All staff mode pages and components (Phase 13–15 output)
   - All guest-facing pages (`/w/[slug]/*`)
   - SyncStatusBar messages
   - Staff help messages
8. Test that switching language updates all visible text immediately.

## Files and Folders Likely to Be Created or Modified

- `src/lib/i18n/translations/en.ts`
- `src/lib/i18n/translations/fr.ts`
- `src/lib/i18n/use-translations.ts`
- `src/lib/i18n/language-context.tsx`
- `src/components/shared/language-toggle.tsx`
- Staff mode pages (update strings)
- Guest pages (update strings)
- `src/components/shared/sync-status-bar.tsx`
- `src/components/staff/staff-help-messages.tsx`

## Testing Requirements

- Switch to French — verify all staff mode strings change
- Switch to English — verify revert
- Guest upload page shows correct language
- SyncStatusBar messages translate
- Language persists across page refreshes
- `npm run lint` passes

## Manual QA Checklist

- [ ] EN/FR toggle visible in staff layout
- [ ] EN/FR toggle visible in guest layout
- [ ] Switching to French: all staff buttons show French text
- [ ] "Check In" → "Enregistrer l'arrivée" (or equivalent)
- [ ] Offline sync messages shown in selected language
- [ ] Staff help panel shows French text when FR selected
- [ ] Language persists after refresh

## Acceptance Criteria

- [ ] Translation infrastructure in place
- [ ] All priority strings translated (staff mode, guest pages, sync messages)
- [ ] Language toggle works and persists
- [ ] No hardcoded user-visible strings in translated components
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add bilingual foundation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 26 to Completed Phases
- Set Current Phase to Phase 27 and Phase 28
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 26: Bilingual English/French Foundation.

WedPass targets French-speaking African markets alongside English-speaking ones. This phase adds translation infrastructure and translates all operational strings.

Before starting, read:
- CLAUDE.md
- docs/prd.md (Target market section)
- docs/staff_training_guide.md — IMPORTANT: this document already contains the English and French versions of staff instructions. Use it as the source of truth for all French staff mode strings rather than translating from scratch.

Your task is to add English/French translation support.

Approach options:
A) Use next-intl (recommended for Next.js App Router)
B) Implement a lightweight custom hook using a language context + dictionary

Choose option A (next-intl) or B. Implement whichever is simpler to maintain.

1. Create translation files:
   - src/lib/i18n/translations/en.ts — all English strings
   - src/lib/i18n/translations/fr.ts — all French strings

   Priority strings to translate:
   Staff mode: "Scan QR Code", "Search Guest", "Check In", "Already Checked In", all sync/offline messages, help text
   Guest pages: "Share Your Photos & Videos", upload messages, gallery labels
   Common: all error and status messages visible to non-organizer users

2. Create translation hook/provider and language context.
   Store language preference in localStorage, default to "en".

3. Create src/components/shared/language-toggle.tsx — EN/FR toggle button.
   Add to: staff layout, guest layout.

4. Replace all hardcoded user-visible strings in:
   - Staff mode pages and components
   - SyncStatusBar
   - Staff help messages
   - Guest pages (/w/[slug]/*)

5. Test: switch to FR, verify all staff/guest strings change.
   Switch to EN, verify revert. Language persists after refresh.

After completing:
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 26 completed, Current Phase → Phase 27.

Commit with:
git commit -m "feat: add bilingual foundation"
```
