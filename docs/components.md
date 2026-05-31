# WedPass Components Blueprint

## 1. Document Purpose

This document defines the frontend component architecture for **WedPass V1.0**.

It describes:

- Component strategy
- shadcn/ui base components
- Product-specific components
- Component folder structure
- Component responsibilities
- Recommended props
- Usage rules
- Build order
- Anti-patterns

WedPass uses:

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod

---

## 2. Component Strategy

WedPass components should be built in layers:

```text
shadcn/ui primitives
        ↓
shared product components
        ↓
domain-specific components
        ↓
screen containers/pages
```

The goal is to keep the UI:

- Reusable
- Consistent
- Easy to test
- Easy for Claude Code to extend
- Free from business logic in low-level components

---

## 3. Core Rule

Low-level UI components must be presentational.

They should:

- Receive props
- Render UI
- Emit callbacks
- Avoid API calls
- Avoid Prisma
- Avoid direct business logic
- Avoid direct IndexedDB access unless explicitly designed as a hook/container

Business logic belongs in:

- Services
- Hooks
- Containers
- Offline library
- API clients

---

## 4. Component Layering Pattern

Use this pattern:

```text
Page
  → Feature Container
    → Domain Components
      → Shared Components
        → shadcn/ui primitives
```

Example:

```text
Guest List Page
  → GuestsPageContainer
    → GuestListToolbar
    → GuestTable
    → GuestCard
    → CsvImportDialog
      → Button/Input/Dialog/Table from shadcn/ui
```

---

## 5. Recommended Component Folder Structure

```text
src/components/
  ui/
    # shadcn/ui generated components

  layout/
    app-sidebar.tsx
    app-header.tsx
    mobile-bottom-nav.tsx
    public-header.tsx
    guest-layout-shell.tsx
    staff-layout-shell.tsx

  shared/
    status-badge.tsx
    stat-card.tsx
    empty-state.tsx
    confirm-dialog.tsx
    page-header.tsx
    section-card.tsx
    loading-state.tsx
    error-state.tsx

  wedding/
    wedding-status-badge.tsx
    wedding-summary-card.tsx
    event-readiness-checklist.tsx
    wedding-hero.tsx
    privacy-note.tsx

  guests/
    guest-table.tsx
    guest-card.tsx
    guest-form.tsx
    guest-list-toolbar.tsx
    csv-import-dialog.tsx
    qr-code-card.tsx
    qr-code-grid.tsx

  staff/
    sync-status-bar.tsx
    offline-warning-banner.tsx
    scan-action-card.tsx
    guest-checkin-card.tsx
    recent-checkins-list.tsx
    scanner-frame.tsx
    manual-search-results.tsx
    offline-pack-status-card.tsx

  media/
    media-card.tsx
    media-grid.tsx
    media-upload-card.tsx
    upload-progress-item.tsx
    upload-queue-list.tsx
    media-moderation-actions.tsx
    media-viewer.tsx

  feedback/
    beta-feedback-form.tsx
```

---

## 6. shadcn/ui Base Components

Install these first:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add sheet
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add form
npx shadcn@latest add textarea
npx shadcn@latest add select
```

Optional later:

```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add command
```

---

## 7. shadcn/ui Usage Map

| WedPass Need | shadcn/ui Component |
|---|---|
| Primary actions | Button |
| Text fields | Input |
| Field labels | Label |
| Dashboard cards | Card |
| Status labels | Badge |
| Modals | Dialog |
| Mobile navigation drawer | Sheet |
| Guest list table | Table |
| Filters | Tabs |
| Action menus | DropdownMenu |
| Upload progress | Progress |
| Alerts and warnings | Alert |
| Loading states | Skeleton |
| Forms | Form |
| Long comments | Textarea |
| Dropdown choices | Select |

---

## 8. Layout Components

## 8.1 AppSidebar

Path:

```text
src/components/layout/app-sidebar.tsx
```

Used for:

- Organizer dashboard desktop navigation

Navigation items:

- Dashboard
- Guests
- QR Codes
- Event Mode
- Staff Access
- Check-In Stats
- Gallery
- Settings

Responsibilities:

- Render navigation
- Highlight active route
- Use Lucide icons
- Collapse gracefully on smaller screens

Must not:

- Fetch wedding data directly
- Perform authorization logic

---

## 8.2 AppHeader

Path:

```text
src/components/layout/app-header.tsx
```

Used for:

- Organizer dashboard pages

Props:

```ts
type AppHeaderProps = {
  weddingName?: string;
  weddingDate?: string;
  status?: "DRAFT" | "ACTIVE" | "EVENT_MODE" | "COMPLETED";
  userName?: string;
};
```

Responsibilities:

- Show wedding context
- Show status badge
- Show account menu
- Support mobile sidebar trigger

---

## 8.3 PublicHeader

Path:

```text
src/components/layout/public-header.tsx
```

Used for:

- Landing page
- Login/register pages
- Beta signup

Responsibilities:

- Show WedPass logo
- Show Login link
- Show Join Beta CTA

---

## 8.4 StaffLayoutShell

Path:

```text
src/components/layout/staff-layout-shell.tsx
```

Used for:

- Staff event mode screens

Responsibilities:

- Mobile-first container
- Full-height layout
- Optional top sync bar slot
- Minimal chrome

---

## 8.5 GuestLayoutShell

Path:

```text
src/components/layout/guest-layout-shell.tsx
```

Used for:

- Guest wedding pages

Responsibilities:

- Warm background
- Centered content
- Responsive width constraints
- Guest-friendly spacing

---

# Part 2 — Shared Components

---

## 9. StatusBadge

Path:

```text
src/components/shared/status-badge.tsx
```

Purpose:

Render consistent status badges across the app.

### Props

```ts
type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "offline"
  | "neutral";

type StatusBadgeProps = {
  label: string;
  variant: StatusBadgeVariant;
};
```

### Examples

```tsx
<StatusBadge label="Checked In" variant="success" />
<StatusBadge label="Pending Sync" variant="warning" />
<StatusBadge label="Offline" variant="offline" />
<StatusBadge label="Failed" variant="danger" />
```

### Used In

- Guest list
- Staff mode
- Sync status
- Media moderation
- Dashboard
- Event Mode

---

## 10. StatCard

Path:

```text
src/components/shared/stat-card.tsx
```

Purpose:

Render dashboard and stats cards.

### Props

```ts
type StatCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: StatCardVariant;
};
```

### Used For

- Total guests
- Checked in
- Pending check-ins
- Media uploads
- Sync failures

---

## 11. PageHeader

Path:

```text
src/components/shared/page-header.tsx
```

Purpose:

Consistent page title and actions.

### Props

```ts
type PageHeaderProps = {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};
```

### Used In

- Dashboard pages
- Guest list
- Event Mode setup
- Media moderation
- Staff access

---

## 12. SectionCard

Path:

```text
src/components/shared/section-card.tsx
```

Purpose:

Reusable card wrapper for page sections.

### Props

```ts
type SectionCardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};
```

---

## 13. EmptyState

Path:

```text
src/components/shared/empty-state.tsx
```

Purpose:

Guide users when there is no data.

### Props

```ts
type EmptyStateProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};
```

### Examples

Guest list:

```text
No guests yet.
Add guests manually or import a CSV to prepare your wedding check-in list.
```

Gallery:

```text
No memories uploaded yet.
Share the QR code with your guests so they can add photos and videos.
```

---

## 14. ConfirmDialog

Path:

```text
src/components/shared/confirm-dialog.tsx
```

Purpose:

Confirm destructive or irreversible actions.

### Props

```ts
type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};
```

### Required For

- Enable Event Mode
- Delete media
- Delete guest
- Revoke staff device
- Clear local offline data

---

## 15. LoadingState

Path:

```text
src/components/shared/loading-state.tsx
```

Purpose:

Consistent loading indicator or skeleton wrapper.

Use shadcn `Skeleton`.

---

## 16. ErrorState

Path:

```text
src/components/shared/error-state.tsx
```

Purpose:

Consistent error display with friendly language.

### Props

```ts
type ErrorStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};
```

---

# Part 3 — Wedding Components

---

## 17. WeddingStatusBadge

Path:

```text
src/components/wedding/wedding-status-badge.tsx
```

Purpose:

Display wedding status.

Statuses:

```text
DRAFT
ACTIVE
EVENT_MODE
COMPLETED
```

Mapping:

```text
DRAFT       neutral
ACTIVE      info
EVENT_MODE  warning or info
COMPLETED   success
```

---

## 18. WeddingSummaryCard

Path:

```text
src/components/wedding/wedding-summary-card.tsx
```

Purpose:

Display basic wedding information.

### Props

```ts
type WeddingSummaryCardProps = {
  name: string;
  coupleNames?: string;
  eventDate?: string;
  location?: string;
  country?: string;
  status: "DRAFT" | "ACTIVE" | "EVENT_MODE" | "COMPLETED";
  coverImageUrl?: string;
};
```

---

## 19. EventReadinessChecklist

Path:

```text
src/components/wedding/event-readiness-checklist.tsx
```

Purpose:

Show readiness before Event Mode.

### Props

```ts
type ReadinessItem = {
  key: string;
  label: string;
  passed: boolean;
  actionLabel?: string;
  actionHref?: string;
};

type EventReadinessChecklistProps = {
  items: ReadinessItem[];
};
```

Checklist items:

- Wedding details completed
- Guest list imported
- QR codes generated
- Staff access prepared
- Offline snapshot ready

---

## 20. WeddingHero

Path:

```text
src/components/wedding/wedding-hero.tsx
```

Purpose:

Guest-facing wedding header.

### Props

```ts
type WeddingHeroProps = {
  coupleNames: string;
  weddingDate?: string;
  location?: string;
  coverImageUrl?: string;
  message?: string;
};
```

Rules:

- Use Playfair Display only for couple names.
- Use warm visual styling.
- Keep mobile-first.

---

## 21. PrivacyNote

Path:

```text
src/components/wedding/privacy-note.tsx
```

Purpose:

Show friendly privacy reassurance.

Example:

```text
Only guests with this link can access this wedding page.
```

---

# Part 4 — Guest Management Components

---

## 22. GuestTable

Path:

```text
src/components/guests/guest-table.tsx
```

Purpose:

Desktop guest list display.

### Props

```ts
type GuestListItem = {
  id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  numberOfAllowedGuests: number;
  qrGenerated: boolean;
  isCheckedIn: boolean;
  checkedInAt?: string;
};

type GuestTableProps = {
  guests: GuestListItem[];
  onEdit: (guestId: string) => void;
  onDelete: (guestId: string) => void;
  onViewQr: (guestId: string) => void;
};
```

Rules:

- Desktop only or hidden on mobile.
- Do not fetch data inside component.
- Use status badges.
- Use dropdown menu for actions.

---

## 23. GuestCard

Path:

```text
src/components/guests/guest-card.tsx
```

Purpose:

Mobile guest list display.

### Props

```ts
type GuestCardProps = {
  guest: GuestListItem;
  onEdit: (guestId: string) => void;
  onDelete: (guestId: string) => void;
  onViewQr: (guestId: string) => void;
};
```

Rules:

- Use stacked card layout.
- Show guest name prominently.
- Show check-in badge.
- Actions should be in dropdown menu.

---

## 24. GuestForm

Path:

```text
src/components/guests/guest-form.tsx
```

Purpose:

Add/edit guest.

### Fields

- Full name
- Phone number
- Email
- Number of allowed guests

Use:

- React Hook Form
- Zod
- shadcn Form/Input/Button

### Props

```ts
type GuestFormValues = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  numberOfAllowedGuests: number;
};

type GuestFormProps = {
  defaultValues?: Partial<GuestFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: GuestFormValues) => void | Promise<void>;
};
```

---

## 25. GuestListToolbar

Path:

```text
src/components/guests/guest-list-toolbar.tsx
```

Purpose:

Search and top-level actions for guest list.

### Props

```ts
type GuestListToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddGuest: () => void;
  onImportCsv: () => void;
};
```

---

## 26. CsvImportDialog

Path:

```text
src/components/guests/csv-import-dialog.tsx
```

Purpose:

Import guests from CSV.

### States

- Empty upload
- Preview
- Validation errors
- Importing
- Success

### Props

```ts
type CsvImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: GuestFormValues[]) => Promise<void>;
};
```

Rules:

- Keep CSV parsing logic in a utility or service.
- Component displays results and validation feedback.
- Do not call API directly unless used as a container.

---

## 27. QrCodeCard

Path:

```text
src/components/guests/qr-code-card.tsx
```

Purpose:

Display guest QR code.

### Props

```ts
type QrCodeCardProps = {
  guestName: string;
  qrPayload: string;
  onDownload?: () => void;
};
```

---

## 28. QrCodeGrid

Path:

```text
src/components/guests/qr-code-grid.tsx
```

Purpose:

Render multiple QR code cards.

---

# Part 5 — Staff Components

---

## 29. SyncStatusBar

Path:

```text
src/components/staff/sync-status-bar.tsx
```

Purpose:

Show online/offline and sync status on staff screens.

### Props

```ts
type SyncState = "idle" | "syncing" | "failed" | "offline";

type SyncStatusBarProps = {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt?: string;
  syncState: SyncState;
};
```

Display examples:

```text
Online · All synced
Offline · 12 pending
Syncing · 8 pending
Sync failed · Retrying
```

Rules:

- Sticky at top.
- Present on every staff operational screen.
- Must be easy to see.
- Use status colors consistently.

---

## 30. OfflineWarningBanner

Path:

```text
src/components/staff/offline-warning-banner.tsx
```

Purpose:

Reassure staff while offline.

Message:

```text
Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.
```

---

## 31. ScanActionCard

Path:

```text
src/components/staff/scan-action-card.tsx
```

Purpose:

Main scan/search action card.

### Props

```ts
type ScanActionCardProps = {
  onScan: () => void;
  onSearch: () => void;
};
```

Rules:

- Scan QR button must be the dominant action.
- Minimum button height: 56px.
- Use large icon.

---

## 32. GuestCheckinCard

Path:

```text
src/components/staff/guest-checkin-card.tsx
```

Purpose:

Display guest details and check-in action.

### Props

```ts
type GuestCheckinCardProps = {
  guest: {
    guestId: string;
    fullName: string;
    phoneNumber?: string;
    allowedGuests: number;
    checkedIn: boolean;
    checkedInAt?: string;
  };
  isSubmitting?: boolean;
  onCheckIn: () => void;
  onContinueScanning: () => void;
};
```

States:

- Not checked in
- Checked in locally
- Already checked in
- Sync pending
- Synced

Rules:

- Guest name must be large.
- Check-in button must be large.
- Already checked-in state must be obvious.

---

## 33. RecentCheckinsList

Path:

```text
src/components/staff/recent-checkins-list.tsx
```

Purpose:

Show recent local check-ins.

### Props

```ts
type RecentCheckinItem = {
  guestId: string;
  fullName: string;
  checkedInAt: string;
  synced: boolean;
};

type RecentCheckinsListProps = {
  items: RecentCheckinItem[];
};
```

---

## 34. ScannerFrame

Path:

```text
src/components/staff/scanner-frame.tsx
```

Purpose:

Visual wrapper for QR scanner camera view.

Rules:

- Keep scanner UI uncluttered.
- Always provide manual search fallback.
- Do not implement QR library logic directly inside this presentational component.

---

## 35. ManualSearchResults

Path:

```text
src/components/staff/manual-search-results.tsx
```

Purpose:

Show local guest search results.

### Props

```ts
type ManualSearchResultsProps = {
  results: GuestListItem[];
  onSelectGuest: (guestId: string) => void;
};
```

Rules:

- Search results must be large enough to tap.
- Show check-in status badge.
- Prefer card list on mobile.

---

## 36. OfflinePackStatusCard

Path:

```text
src/components/staff/offline-pack-status-card.tsx
```

Purpose:

Show offline pack readiness.

### Props

```ts
type OfflinePackStatus =
  | "not_prepared"
  | "downloading"
  | "ready"
  | "failed"
  | "outdated";

type OfflinePackStatusCardProps = {
  status: OfflinePackStatus;
  snapshotVersion?: number;
  guestCount?: number;
  lastDownloadedAt?: string;
  onDownload: () => void;
};
```

---

# Part 6 — Media Components

---

## 37. MediaUploadCard

Path:

```text
src/components/media/media-upload-card.tsx
```

Purpose:

Guest-facing upload UI.

### Props

```ts
type MediaUploadCardProps = {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  disabled?: boolean;
};
```

Responsibilities:

- Render file picker
- Render camera/gallery option
- Show guidelines
- Emit selected files

Must not:

- Upload files directly
- Request signed URLs
- Store blobs directly

---

## 38. UploadProgressItem

Path:

```text
src/components/media/upload-progress-item.tsx
```

Purpose:

Show upload queue item status.

### Props

```ts
type UploadStatus = "pending" | "uploading" | "failed" | "uploaded";

type UploadProgressItemProps = {
  fileName: string;
  mediaType: "image" | "video";
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
  onRetry?: () => void;
  onRemove?: () => void;
};
```

---

## 39. UploadQueueList

Path:

```text
src/components/media/upload-queue-list.tsx
```

Purpose:

Render pending/uploading/failed uploads.

---

## 40. MediaGrid

Path:

```text
src/components/media/media-grid.tsx
```

Purpose:

Responsive gallery layout.

### Props

```ts
type MediaGridProps = {
  children: React.ReactNode;
};
```

Responsive behavior:

```text
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4–5 columns
```

---

## 41. MediaCard

Path:

```text
src/components/media/media-card.tsx
```

Purpose:

Display photo/video thumbnail.

### Props

```ts
type MediaCardProps = {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl?: string;
  fileUrl?: string;
  status?: "UPLOADED" | "APPROVED" | "HIDDEN" | "DELETED";
  createdAt?: string;
  uploadedByName?: string;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
};
```

Rules:

- Show play icon overlay for video.
- Do not autoplay video.
- Lazy load images.
- Show hidden status clearly for organizer.

---

## 42. MediaModerationActions

Path:

```text
src/components/media/media-moderation-actions.tsx
```

Purpose:

Render organizer media actions.

### Props

```ts
type MediaModerationActionsProps = {
  mediaId: string;
  status: "UPLOADED" | "APPROVED" | "HIDDEN" | "DELETED";
  onPreview: () => void;
  onHide: () => void;
  onDelete: () => void;
  onDownload: () => void;
};
```

Rules:

- Delete requires confirmation.
- Use dropdown menu on mobile.
- Inline actions are acceptable on desktop.

---

## 43. MediaViewer

Path:

```text
src/components/media/media-viewer.tsx
```

Purpose:

Fullscreen media preview.

### Props

```ts
type MediaViewerProps = {
  mediaType: "IMAGE" | "VIDEO";
  fileUrl: string;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
```

Rules:

- Videos should not autoplay.
- Provide close button.
- Keep mobile-friendly.

---

# Part 7 — Feedback Components

---

## 44. BetaFeedbackForm

Path:

```text
src/components/feedback/beta-feedback-form.tsx
```

Purpose:

Collect beta user feedback.

Fields:

- Rating 1–10
- What worked well?
- What was confusing?
- Offline check-in feedback
- Media upload feedback
- General comment

Use:

- React Hook Form
- Zod
- Textarea
- Select or radio buttons

---

# Part 8 — Component Build Order

---

## 45. Stage 1: shadcn/ui and Theme

Build first:

```text
1. Install shadcn/ui base components
2. Configure Tailwind theme tokens
3. Configure global styles
4. Add Lucide icons
```

---

## 46. Stage 2: Shared Components

Build:

```text
StatusBadge
StatCard
PageHeader
SectionCard
EmptyState
ConfirmDialog
LoadingState
ErrorState
```

---

## 47. Stage 3: Staff Components

Build:

```text
SyncStatusBar
OfflineWarningBanner
ScanActionCard
GuestCheckinCard
RecentCheckinsList
ScannerFrame
ManualSearchResults
OfflinePackStatusCard
```

Reason:

Staff mode is the core differentiator.

---

## 48. Stage 4: Guest Management Components

Build:

```text
GuestTable
GuestCard
GuestForm
GuestListToolbar
CsvImportDialog
QrCodeCard
QrCodeGrid
```

---

## 49. Stage 5: Wedding Components

Build:

```text
WeddingStatusBadge
WeddingSummaryCard
EventReadinessChecklist
WeddingHero
PrivacyNote
```

---

## 50. Stage 6: Media Components

Build:

```text
MediaUploadCard
UploadProgressItem
UploadQueueList
MediaGrid
MediaCard
MediaModerationActions
MediaViewer
```

---

## 51. Stage 7: Feedback Components

Build:

```text
BetaFeedbackForm
```

---

# Part 9 — Styling Rules

---

## 52. Tailwind Token Usage

Use semantic Tailwind classes instead of raw hex values.

Good:

```tsx
<Button className="bg-navy text-white hover:bg-navy-hover" />
```

Avoid:

```tsx
<Button className="bg-[#172033]" />
```

---

## 53. Staff Mode Touch Targets

Minimum:

```text
44px
```

Recommended:

```text
56px+
```

Use large buttons for:

- Scan QR
- Check In Guest
- Sync Now
- Continue Scanning

---

## 54. Guest Gallery Grid

Rules:

```text
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4–5 columns
```

Use:

- rounded media cards
- lazy loading
- video icon overlay
- no autoplay

---

## 55. Dashboard Layout

Desktop:

```text
sidebar + main content grid
```

Mobile:

```text
stacked cards + sheet/drawer navigation
```

---

# Part 10 — Component Testing

---

## 56. Unit Tests

Unit test components with important logic:

- StatusBadge variant rendering
- GuestCheckinCard states
- SyncStatusBar states
- EventReadinessChecklist
- UploadProgressItem states

---

## 57. Visual/Interaction Tests

Use Playwright for:

- Staff Check-In Home
- Guest Check-In Confirmation
- Guest Upload
- Guest Gallery
- Guest List responsive behavior

---

# Part 11 — Claude Code Prompts

---

## 58. Prompt: Build Shared Components

```text
Create the shared UI components for WedPass.

Components:
- StatusBadge
- StatCard
- PageHeader
- SectionCard
- EmptyState
- ConfirmDialog
- LoadingState
- ErrorState

Requirements:
- Use shadcn/ui primitives.
- Use Tailwind design tokens.
- Use TypeScript props.
- Components must be presentational.
- No API calls.
- No business logic.
- Keep each component small and readable.
```

---

## 59. Prompt: Build Staff Components

```text
Create the staff mode UI components for WedPass.

Components:
- SyncStatusBar
- OfflineWarningBanner
- ScanActionCard
- GuestCheckinCard
- RecentCheckinsList
- ScannerFrame
- ManualSearchResults
- OfflinePackStatusCard

Requirements:
- Mobile-first.
- Large touch targets.
- Always make offline/sync state clear.
- Use shadcn/ui and Tailwind.
- Components must be presentational.
- No IndexedDB logic inside these components.
- Use props and callbacks only.
```

---

## 60. Prompt: Build Media Components

```text
Create the media UI components for WedPass.

Components:
- MediaUploadCard
- UploadProgressItem
- UploadQueueList
- MediaGrid
- MediaCard
- MediaModerationActions
- MediaViewer

Requirements:
- Support photos and videos.
- Do not autoplay videos.
- Use lazy loading for thumbnails.
- Show video play icon overlay.
- Use dropdown actions on mobile.
- Delete action must be designed for confirmation by parent.
- No upload API logic inside presentational components.
```

---

## 61. Prompt: Build Guest Components

```text
Create guest management components for WedPass.

Components:
- GuestTable
- GuestCard
- GuestForm
- GuestListToolbar
- CsvImportDialog
- QrCodeCard
- QrCodeGrid

Requirements:
- Desktop uses GuestTable.
- Mobile uses GuestCard.
- GuestForm uses React Hook Form and Zod.
- CsvImportDialog supports preview and validation states.
- Components must be reusable and strongly typed.
```

---

# Part 12 — Anti-Patterns

---

## 62. Component Anti-Patterns

Do not:

- Put API calls inside low-level components
- Put Prisma calls in components
- Put sync logic in visual components
- Store all server data in Zustand
- Use dense tables on mobile
- Use tiny buttons in staff mode
- Autoplay videos
- Use raw hex colors everywhere
- Duplicate status badge styles
- Create one giant component per page
- Mix organizer, guest, and staff visual styles carelessly

---

## 63. Component Size Rule

Recommended:

```text
Presentational components: under 150 lines
Feature containers: under 250 lines
Pages: thin wrappers where possible
```

If a component grows too large, split it.

---

## 64. Summary

The WedPass component system should be:

- Simple
- Typed
- Reusable
- Mobile-first
- shadcn/ui-based
- Tailwind-token-driven
- Operationally clear
- Easy for Claude Code to extend

The most important implementation rule is:

> Components render UI; services and hooks handle behavior.
