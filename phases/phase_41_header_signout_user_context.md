# Phase 41 — Dashboard Header Sign-Out and User Context

## Goal

Wire the "Sign out" button in the dashboard header to the auth store so it actually logs the user out. Also ensure the user's name is correctly displayed in the header on mobile (where the sidebar profile card is hidden).

## Why This Phase Matters

The AppHeader currently renders a ghost "Sign out" button with no `onClick` handler. Clicking it does nothing. The `userName` prop is also never passed from the layout — so even the name display is dead. These are broken UX paths that any beta user will encounter.

Additionally, the dashboard layout passes nothing to AppHeader's `userName` prop because `DashboardLayout` doesn't read from the auth store itself. This needs to be fixed so the header shows the logged-in organizer's name.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/components/layout/app-header.tsx` — the file to fix
- `src/components/layout/dashboard-layout.tsx` — the layout that renders AppHeader
- `src/app/dashboard/layout.tsx` — the Next.js layout wrapper
- `src/stores/auth-store.ts` — the auth store (look for clearAuth or logout method)
- `src/lib/api/auth-client.ts` — the logout API function

## Dependencies

- Phase 05 complete (auth foundation — auth store and logout endpoint exist)

## Scope

### 1. Wire Sign-Out in AppHeader

`src/components/layout/app-header.tsx` is already a client component (`"use client"`).

The "Sign out" button currently is:
```tsx
<Button variant="ghost" size="sm">
  Sign out
</Button>
```

Change it to call the auth store's `clearAuth` and navigate to `/login`:

```tsx
const { clearAuth } = useAuthStore()
const router = useRouter()

function handleSignOut() {
  // POST to logout endpoint (fire and forget — don't block UI)
  fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {})
  clearAuth()
  router.replace("/login")
}

// In JSX:
<Button variant="ghost" size="sm" onClick={handleSignOut}>
  Sign out
</Button>
```

Import: `useAuthStore` from `"@/stores/auth-store"`, `useRouter` from `"next/navigation"`.

### 2. Show User Name in Header

The `userName` prop currently comes from `DashboardLayout` props, but no caller passes it. Instead, read `user` directly from `useAuthStore` in `AppHeader` (it's already a client component):

```tsx
const { user, clearAuth } = useAuthStore()
```

Then replace the `userName` prop usage with `user?.fullName`:
```tsx
{user?.fullName && (
  <span className="hidden text-sm text-muted-foreground sm:inline truncate max-w-[160px]">
    {user.fullName}
  </span>
)}
```

Since `AppHeader` now reads the user itself, the `userName` prop on `AppHeaderProps` can remain for backward compat but doesn't need to be used. Remove it from the props signature if no callers pass it, or mark it optional and simply ignore it.

### 3. Clean Up DashboardLayout Props

`DashboardLayout` has `weddingName`, `weddingDate`, `status`, and `userName` props that are never populated by callers — the `dashboard/layout.tsx` passes no data at all to them:

```tsx
<DashboardLayout>{children}</DashboardLayout>
```

Since these props are unused, simplify `DashboardLayout` to remove the dead props (`weddingName`, `weddingDate`, `status`, `userName`). Also remove them from `AppHeader`'s props for the same reason.

Keep `weddingId` since the sidebar needs it (and AppHeader's mobile Sheet uses it for nav).

The `weddingName` and `status` display in AppHeader's header bar can be removed — these aren't populated and show nothing. The page-level `PageHeader` component on each page already shows the wedding name and status badge.

## Files to Modify

- `src/components/layout/app-header.tsx`
- `src/components/layout/dashboard-layout.tsx`

## Files to NOT Touch

- `src/app/dashboard/layout.tsx` (it just renders DashboardLayout with no props — leave it)
- Auth store, auth service, or API routes

## Implementation Tasks

1. Read `src/stores/auth-store.ts` to confirm the method name is `clearAuth` (or `logout` — verify first).
2. Update `app-header.tsx`:
   - Import `useAuthStore` and `useRouter`
   - Add `handleSignOut` function
   - Wire `onClick={handleSignOut}` to the Sign out button
   - Read `user` from auth store and display `user?.fullName` in the header
   - Remove the dead `userName`, `weddingName`, `weddingDate`, `status` props from `AppHeaderProps`
3. Update `dashboard-layout.tsx`:
   - Remove the dead props (`weddingName`, `weddingDate`, `status`, `userName`) from `DashboardLayoutProps` and the `AppHeader` call
   - Keep `weddingId` prop
4. Run `npx tsc --noEmit` — fix all type errors.
5. Run `npm run lint` — fix all lint errors.
6. Update `PROGRESS.md`: add Phase 41 to Completed Phases, set Current Phase to 42.
7. Commit:
   ```
   git commit -m "feat: wire dashboard header sign-out and user context"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Manual QA:
- Log in as an organizer — header shows the user's name
- Click "Sign out" — clears session and redirects to `/login`
- Verify auth guard on dashboard redirects after sign-out
- Header renders correctly on mobile (name hidden at small breakpoints)

## Acceptance Criteria

- [ ] Sign out button calls `clearAuth()` and navigates to `/login`
- [ ] User name displayed in the header from the auth store (not prop)
- [ ] Dead props removed from `AppHeaderProps` and `DashboardLayoutProps`
- [ ] TypeScript and lint pass

## Git Commit

```
feat: wire dashboard header sign-out and user context
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 41 to Completed Phases with today's date
- Set Current Phase to 42
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 41: Dashboard Header Sign-Out and User Context.

Before starting, read ALL of these files:
- CLAUDE.md
- src/components/layout/app-header.tsx
- src/components/layout/dashboard-layout.tsx
- src/stores/auth-store.ts  ← read this first to confirm method names
- src/lib/api/auth-client.ts ← confirm logout function name

Step 1: Read src/stores/auth-store.ts. Identify the method to clear auth state (likely clearAuth or logout). Note the exact method name.

Step 2: Update src/components/layout/app-header.tsx.

a) Add these imports at the top:
   import { useAuthStore } from "@/stores/auth-store"
   import { useRouter } from "next/navigation"

b) Inside the AppHeader function body (before the return), add:
   const { user, clearAuth } = useAuthStore()  // use exact method name from store
   const router = useRouter()

   function handleSignOut() {
     fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {})
     clearAuth()
     router.replace("/login")
   }

c) Remove the unused props from AppHeaderProps: userName, weddingName, weddingDate, status. Keep weddingId.

d) Remove the dead weddingName/status display block in the header middle section. Replace with an empty flex spacer:
   <div className="flex-1" />

e) Replace the userName span with:
   {user?.fullName && (
     <span className="hidden text-sm text-muted-foreground sm:inline truncate max-w-[160px]">
       {user.fullName}
     </span>
   )}

f) Wire the Sign out button:
   <Button variant="ghost" size="sm" onClick={handleSignOut}>
     Sign out
   </Button>

Step 3: Update src/components/layout/dashboard-layout.tsx.

Remove the unused interface fields weddingName, weddingDate, status, userName from DashboardLayoutProps. Remove the same props from the AppHeader call. Keep weddingId.

The resulting DashboardLayoutProps should be:
  interface DashboardLayoutProps {
    children: React.ReactNode
    weddingId?: string
  }

And the AppHeader call should be:
  <AppHeader weddingId={weddingId} />

Step 4:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 41 to Completed Phases (today's date), set Current Phase to 42.
4. Stage and commit:
   git add src/components/layout/app-header.tsx src/components/layout/dashboard-layout.tsx PROGRESS.md
   git commit -m "feat: wire dashboard header sign-out and user context"
```
