# WedPass UI/UX Design

## 1. Document Purpose

This document defines the UI/UX direction for **WedPass V1.0**.

**Design File:**

[WedPass Prototype](https://api.anthropic.com/v1/design/h/_SHtyNUR4OD5RI1lvQvGyw?open_file=WedPass+Prototype.html) — Interactive HTML prototype for the WedPass V1.0 UI.

It covers:

- Product UI personality
- Visual design direction
- Design system tokens
- User experience principles
- Screen inventory
- Layout rules
- Mobile-first rules
- Staff mode UX requirements
- Guest experience requirements
- Organizer dashboard requirements
- Claude Design guidance
- Claude Code implementation guidance

WedPass V1.0 is a responsive web app, not a native mobile app.

---

## 2. Product UI Positioning

WedPass should feel like:

> A premium wedding operations platform that is warm for guests, calm for organizers, and reliable for event staff.

It should not feel like:

- A generic SaaS dashboard
- A heavy enterprise tool
- A social media clone
- A full wedding planning suite
- An overly decorative wedding website

The UI must balance:

- Wedding warmth
- Operational clarity
- Mobile-first usability
- Offline confidence

---

## 3. UI Experience Modes

WedPass has three main UI modes.

---

## 3.1 Organizer Experience

User:

- Couple
- Wedding organizer
- Wedding planner

Personality:

- Calm
- Professional
- Premium
- Organized
- Reassuring

Main question the UI must answer:

> Is my wedding guest and media system under control?

Visual style:

- Modern SaaS dashboard
- Clean cards
- Deep navy structure
- Champagne accents
- Clear stats
- Subtle wedding warmth

Primary screens:

- Dashboard
- Guest list
- Event Mode setup
- Staff access
- Check-in stats
- Media moderation
- Settings

---

## 3.2 Staff Event Mode

User:

- Event staff
- Door attendants
- Family helpers
- Wedding coordinators

Personality:

- Fast
- Clear
- Bold
- Operational
- Reliable

Main question the UI must answer:

> Can I find this guest and check them in quickly?

Visual style:

- Mobile-first
- Large touch targets
- High contrast
- Minimal decoration
- Always-visible offline/sync state
- Practical interface

Primary screens:

- Staff login
- Offline pack download
- Check-in home
- QR scanner
- Manual search
- Guest confirmation
- Sync status

---

## 3.3 Guest Experience

User:

- Wedding guests

Personality:

- Warm
- Simple
- Joyful
- Elegant
- Friendly

Main question the UI must answer:

> How do I share or view wedding memories easily?

Visual style:

- Ivory background
- Champagne accents
- Couple names prominent
- Clean upload CTA
- Lightweight gallery
- Simple privacy reassurance

Primary screens:

- Guest wedding landing
- Upload photos/videos
- Upload queue
- Gallery
- Media viewer

---

## 4. Design Direction

Recommended visual direction:

> Modern African Wedding Elegance + Operational Reliability

Meaning:

- Warm but not childish
- Elegant but not luxury-only
- Premium but accessible
- African-market aware but globally polished
- Simple enough for real event conditions

Short design mantra:

> Beautiful for guests. Calm for couples. Bulletproof for staff.

---

## 5. Design System Tokens

## 5.1 Primary Colors

### Deep Navy

```text
HEX: #172033
Use: primary brand color, dashboard navigation, primary buttons, serious actions
```

### Midnight Navy

```text
HEX: #101827
Use: primary hover state, stronger emphasis
```

### Primary Soft

```text
HEX: #EEF2F8
Use: subtle dashboard background, selected nav item, quiet panels
```

---

## 5.2 Wedding Accent Colors

### Champagne Gold

```text
HEX: #C8A45D
Use: wedding accents, guest-facing CTA, premium highlight
```

### Ivory

```text
HEX: #FAF7F1
Use: guest page background, warm sections
```

### Soft Blush

```text
HEX: #F6D8D5
Use: warm emotional sections, subtle guest-facing decorative background
```

### Warm Beige

```text
HEX: #E8DCC8
Use: borders, section dividers, warm surfaces
```

### Terracotta

```text
HEX: #B76E50
Use: secondary accent, African warmth, subtle highlights
```

Terracotta should be used carefully and not dominate the interface.

---

## 5.3 Neutral Colors

```text
Text Primary:   #1F2937
Text Secondary: #6B7280
Text Muted:     #9CA3AF

Background Main: #FFFFFF
Background Soft: #F9FAFB
Background Warm: #FAF7F1

Border Light:  #E5E7EB
Border Medium: #D1D5DB
```

---

## 5.4 Operational Status Colors

### Success

```text
Success:      #16A34A
Success Soft: #DCFCE7
Use: checked in, synced, successful upload
```

### Warning

```text
Warning:      #D97706
Warning Soft: #FEF3C7
Use: pending sync, unstable connection, upload paused
```

### Danger

```text
Danger:      #DC2626
Danger Soft: #FEE2E2
Use: failed sync, invalid QR, destructive actions
```

### Info / Syncing

```text
Info:      #2563EB
Info Soft: #DBEAFE
Use: syncing, upload in progress, processing
```

### Offline

```text
Offline:      #374151
Offline Soft: #F3F4F6
Use: offline mode indicator
```

---

## 6. Typography

## 6.1 Primary Font

Use:

```text
Inter
```

Use for:

- Dashboard
- Staff mode
- Guest UI
- Forms
- Tables
- Buttons
- Navigation

Why:

- Highly readable
- Excellent on mobile
- Professional
- Neutral and modern

---

## 6.2 Optional Display Font

Use:

```text
Playfair Display
```

Only for:

- Couple names
- Wedding title
- Guest-facing emotional headings

Do not use display font for:

- Forms
- Staff mode
- Buttons
- Tables
- Operational screens

---

## 6.3 Typography Scale

```text
Display:     40px / 48px / 700
H1:          32px / 40px / 700
H2:          24px / 32px / 600
H3:          20px / 28px / 600
Body Large:  18px / 28px / 400
Body:        16px / 24px / 400
Body Small:  14px / 20px / 400
Caption:     12px / 16px / 400
```

---

## 6.4 Staff Mode Typography Exception

Staff mode must prioritize readability.

Recommended:

```text
Main action text: 20px–24px
Guest name:       22px–28px
Status label:     16px–18px
Search input:     18px+
```

---

## 7. Spacing System

Use an 8px-based spacing system.

```text
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
3xl:  64px
```

Mobile minimum horizontal padding:

```text
16px
```

Guest pages can use:

```text
20px–24px
```

Staff mode should use:

```text
16px with large touch targets
```

---

## 8. Border Radius

```text
Small:  8px
Medium: 12px
Large:  16px
XL:     24px
Full:   9999px
```

Recommended defaults:

```text
Cards:       16px
Buttons:     12px
Modals:      24px
Media cards: 16px
Guest cards: 24px
```

---

## 9. Shadows

Use subtle shadows only.

```text
Card Shadow:
0 4px 16px rgba(15, 23, 42, 0.06)

Elevated Shadow:
0 12px 32px rgba(15, 23, 42, 0.10)

Modal Shadow:
0 24px 64px rgba(15, 23, 42, 0.18)
```

Avoid heavy shadows.

---

## 10. Button Rules

## 10.1 Primary Button

Use for main actions.

```text
Background: Deep Navy
Text: White
Radius: 12px
Height: 44px desktop / 48px mobile
```

Examples:

- Create Wedding
- Prepare Event Mode
- Check In Guest
- Upload Media

---

## 10.2 Wedding Accent Button

Use on guest-facing pages.

```text
Background: Champagne Gold
Text: Deep Navy
Radius: 12px
Height: 48px
```

Examples:

- Upload Photos/Videos
- View Gallery

---

## 10.3 Secondary Button

```text
Background: White
Border: Border Medium
Text: Text Primary
```

Examples:

- Cancel
- Back
- View Details

---

## 10.4 Danger Button

```text
Background: Danger
Text: White
```

Examples:

- Delete Media
- Remove Guest
- Revoke Staff Device

Danger actions must require confirmation.

---

## 11. Card Rules

## 11.1 Dashboard Card

```text
Background: White
Border: Border Light
Radius: 16px
Padding: 20px
Shadow: subtle
```

Used for:

- Stats
- Dashboard sections
- Guest summaries
- Media counts

---

## 11.2 Guest Wedding Card

```text
Background: Ivory or White
Border: Warm Beige
Radius: 24px
Padding: 24px
```

Used for:

- Guest upload
- Gallery intro
- Privacy reassurance

---

## 11.3 Staff Operational Card

```text
Background: White
Border: Border Medium
Radius: 16px
Padding: 16px
High contrast labels
```

Used for:

- Scanned guest result
- Sync status
- Recent check-ins

---

## 12. Form Input Rules

Default input:

```text
Height: 44px desktop / 48px mobile
Border: Border Medium
Radius: 10px
Focus Ring: Champagne Gold or Info Blue
```

Staff mode search input:

```text
Height: 56px
Font: 18px+
Auto-focus where appropriate
```

All forms must show:

- Label
- Placeholder when useful
- Error message
- Disabled/loading state

---

## 13. Status Badge Rules

Badges are critical for clarity.

Badge variants:

```text
success
warning
danger
info
offline
neutral
```

Examples:

```text
Checked In        success
Synced            success
Pending Sync      warning
Offline           offline
Failed            danger
Hidden            neutral
Approved          success
Event Mode        info
```

---

## 14. Icon System

Use:

```text
Lucide React
```

Recommended icons:

- QRCode
- Camera
- Upload
- CheckCircle
- AlertTriangle
- WifiOff
- RefreshCw
- Users
- Image
- Video
- Download
- Shield
- Search
- Trash
- Eye
- EyeOff

Icon sizes:

```text
Standard UI: 18–24px
Staff mode: 24–32px
```

---

## 15. Motion and Animation

Keep animation subtle.

Allowed:

- Fade in
- Slide up
- Loading skeleton
- Progress indicators
- Quick success flash

Avoid:

- Heavy decorative animation
- Complex transitions
- Animation that delays staff actions

Staff mode rule:

> No decorative animation in check-in mode.

Functional feedback only.

---

## 16. Responsive Design Rules

Breakpoints:

```text
Mobile:        375px+
Tablet:        768px+
Desktop:       1024px+
Large Desktop: 1280px+
```

Mobile-first screens:

- Staff check-in
- QR scanner
- Manual search
- Guest upload
- Guest gallery
- Offline pack download

Dashboard screens must also work on mobile, but may be richer on desktop.

---

# Part 2 — Screen Inventory

---

## 17. Public / Marketing Screens

### 17.1 Landing Page

Purpose:

- Explain WedPass
- Capture beta interest

Sections:

- Hero
- Value proposition
- How it works
- Offline check-in benefit
- Photo/video memory collection benefit
- Free beta CTA

Primary CTA:

```text
Join Free Beta
```

Secondary CTA:

```text
Login
```

---

### 17.2 Beta Signup Page

Fields:

- Full name
- Email
- Country
- Wedding date
- Estimated guest count
- Preferred language

Primary CTA:

```text
Submit Beta Request
```

---

### 17.3 Login Page

Fields:

- Email
- Password

Primary CTA:

```text
Login
```

---

### 17.4 Register Page

Fields:

- Full name
- Email
- Password
- Confirm password

Primary CTA:

```text
Create Account
```

---

## 18. Organizer Screens

### 18.1 Organizer Dashboard

Purpose:

- Show system status at a glance

Core content:

- Wedding name
- Wedding date
- Status badge
- Total guests
- Checked-in count
- Pending count
- Media uploads
- Event Mode readiness checklist

Primary CTA:

```text
Prepare Event Mode
```

---

### 18.2 Create Wedding

Fields:

- Wedding name
- Couple names
- Wedding date
- Location
- Country
- Optional cover image

Primary CTA:

```text
Create Wedding
```

---

### 18.3 Guest List

Core content:

- Search
- Add guest
- Import CSV
- Guest table on desktop
- Guest cards on mobile
- Check-in badges
- QR status badges

Primary CTA:

```text
Add Guest
```

Secondary CTA:

```text
Import CSV
```

---

### 18.4 CSV Import Dialog

Core content:

- Upload CSV
- Download template
- Preview rows
- Validation errors
- Import summary

Primary CTA:

```text
Import Guests
```

---

### 18.5 QR Codes Screen

Core content:

- Guest list with QR status
- Individual QR preview
- Download individual QR
- Download all QR codes

Primary CTA:

```text
Download All QR Codes
```

---

### 18.6 Event Mode Setup

Core content:

- Readiness checklist
- Snapshot status
- Staff preparation
- Warning about guest list lock

Primary CTA:

```text
Enable Event Mode
```

---

### 18.7 Staff Access

Core content:

- Generate staff access
- List staff devices
- Device label
- Last seen
- Revoke access

Primary CTA:

```text
Generate Staff Access
```

---

### 18.8 Check-In Stats

Core content:

- Total guests
- Checked in
- Pending
- Check-in percentage
- Device sync summary

Primary CTA:

```text
Refresh Stats
```

---

### 18.9 Media Moderation

Core content:

- Media grid
- Filters: all/photos/videos/hidden
- Preview
- Hide
- Delete
- Download

---

### 18.10 Settings

Core content:

- Wedding settings
- Gallery visibility
- Account settings
- Logout

---

## 19. Staff Screens

### 19.1 Staff Access Login

Fields:

- Staff access token or code
- Optional PIN

Primary CTA:

```text
Enter Event Mode
```

---

### 19.2 Offline Pack Download

Core content:

- Wedding name
- Snapshot version
- Guest count
- Download status
- Last downloaded time

Primary CTA:

```text
Download Offline Pack
```

Critical message:

```text
Do this before guests arrive.
```

---

### 19.3 Staff Check-In Home

Core content:

- Sync status bar
- Wedding name
- Scan QR button
- Manual search input
- Recent check-ins

Primary CTA:

```text
Scan QR Code
```

Secondary action:

```text
Search Guest
```

---

### 19.4 QR Scanner

Core content:

- Camera scanning area
- QR scanning frame
- Offline/sync status
- Manual search fallback

---

### 19.5 Manual Guest Search

Core content:

- Large search input
- Search results
- Status badges
- Select guest action

---

### 19.6 Guest Check-In Confirmation

Core content:

- Guest name
- Phone number
- Allowed guest count
- Check-in status
- Check-in button
- Already checked-in warning if applicable

Primary CTA:

```text
Check In Guest
```

---

### 19.7 Sync Status

Core content:

- Online/offline state
- Pending sync count
- Last successful sync
- Failed attempts
- Manual sync button

Primary CTA:

```text
Sync Now
```

---

## 20. Guest Screens

### 20.1 Guest Wedding Landing

Core content:

- Cover image
- Couple names
- Wedding date
- Short welcome message
- Privacy note

Primary CTA:

```text
Upload Photos/Videos
```

Secondary CTA:

```text
View Gallery
```

---

### 20.2 Guest Media Upload

Core content:

- Upload card
- File picker
- Camera option
- Optional uploader name
- Upload guidelines
- Progress states

Primary CTA:

```text
Upload
```

---

### 20.3 Upload Queue

Core content:

- Pending uploads
- Uploading items
- Failed items
- Retry button

Primary CTA:

```text
Retry Uploads
```

---

### 20.4 Guest Gallery

Core content:

- Couple names
- Upload more button
- Filter tabs
- Responsive media grid
- Empty state

---

### 20.5 Media Viewer

Core content:

- Fullscreen image/video
- Close button
- Previous/next
- Download optional

---

## 21. System Screens

Required utility screens:

- Offline fallback
- Not found
- Unauthorized
- Expired access
- Error fallback
- Maintenance message

---

# Part 3 — UX Rules

---

## 22. Global UX Rules

- Mobile-first
- No guest account required
- Clear primary CTA per screen
- Avoid overloaded screens
- Privacy by default
- Human-readable errors
- Always show loading states
- Always show empty states
- Avoid technical language in user-facing messages

---

## 23. Staff Mode UX Rules

Staff mode must:

- Always show sync/offline state
- Always provide manual search fallback
- Use large buttons
- Use large text
- Avoid decorative UI
- Make success/failure obvious
- Never block check-in because of internet state
- Reassure staff that pending check-ins are saved

Required message when offline:

```text
Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.
```

---

## 24. Guest Upload UX Rules

Guest upload must:

- Be simple
- Be mobile-first
- Allow photo and short video
- Show upload progress
- Explain slow video uploads
- Queue or retry when network fails
- Avoid technical errors

Good message:

```text
Upload paused. We’ll retry when your connection improves.
```

Bad message:

```text
Network error.
```

---

## 25. Organizer UX Rules

Organizer dashboard must:

- Show readiness clearly
- Make Event Mode consequences obvious
- Avoid hidden destructive actions
- Require confirmation before locking guest list
- Clearly show check-in stats
- Make media moderation easy

---

## 26. Error Message Tone

Use calm, reassuring language.

Examples:

```text
Connection lost. Your check-ins are safely saved on this device and will sync when internet returns.
```

```text
This QR code is not recognized for this wedding. Try searching for the guest manually.
```

```text
This video is too large. Please upload a shorter clip.
```

---

# Part 4 — Claude Design Guidance

---

## 27. Global Claude Design Prompt

Use this when generating screens in Claude Design:

```text
Design a responsive web app for WedPass, an offline-first wedding guest and photo/video management platform for Central, East, and West Africa.

The product helps wedding organizers manage guest lists, perform offline QR check-in with multiple staff devices, and collect guest photos/videos in one secure gallery.

Visual direction:
- Modern African Wedding Elegance
- Warm and premium for guest-facing pages
- Calm and professional for organizer dashboard
- Bold and operational for staff event mode

Brand colors:
- Deep Navy #172033
- Champagne Gold #C8A45D
- Ivory #FAF7F1
- Soft Blush #F6D8D5
- Terracotta #B76E50

Status colors:
- Success #16A34A
- Warning #D97706
- Danger #DC2626
- Info #2563EB
- Offline #374151

Typography:
- Inter for all UI
- Playfair Display only for couple names or wedding title

Design priorities:
- Mobile-first
- Large touch targets
- Low cognitive load
- Clear offline/sync states
- Clean cards
- Minimal decoration in staff mode
- Elegant warmth in guest pages

Create polished low-fidelity screens suitable for implementation with Next.js, TailwindCSS, and shadcn/ui.
```

---

## 28. Priority Screens for Claude Design

Design in this order:

1. Staff Check-In Home
2. Guest Check-In Confirmation
3. Sync Status
4. Guest Upload
5. Guest Gallery
6. Organizer Dashboard
7. Guest List
8. Event Mode Setup
9. Media Moderation
10. Landing Page

Staff screens come first because they are mission-critical.

---

# Part 5 — Claude Code UI Guidance

---

## 29. UI Implementation Principles

Claude Code must follow these rules:

- Use shadcn/ui primitives
- Use Tailwind design tokens
- Keep components reusable
- Keep components presentational where possible
- Do not call APIs directly from low-level components
- Do not put business logic inside UI components
- Use TypeScript props
- Use responsive layouts
- Keep staff screens mobile-first

---

## 30. Component Layers

Use this pattern:

```text
Page
  → Feature Container
    → Product Components
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
```

---

## 31. shadcn/ui Components to Use

Install:

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
```

---

## 32. Product-Specific Components

Recommended component folders:

```text
components/
  ui/
  layout/
  shared/
  wedding/
  guests/
  staff/
  media/
  feedback/
```

Key components:

```text
StatusBadge
StatCard
PageHeader
SectionCard
EmptyState
ConfirmDialog
EventReadinessChecklist
GuestTable
GuestCard
GuestForm
CsvImportDialog
SyncStatusBar
OfflineWarningBanner
ScanActionCard
GuestCheckinCard
RecentCheckinsList
WeddingHero
MediaUploadCard
UploadProgressItem
MediaGrid
MediaCard
MediaModerationActions
PrivacyNote
```

---

## 33. Responsive Rules for Implementation

Organizer dashboard:

```text
Desktop: sidebar + grid
Tablet: collapsed sidebar
Mobile: stacked cards + sheet nav
```

Staff mode:

```text
Mobile-first
Large buttons
Sticky sync bar
56px minimum button height
```

Guest pages:

```text
Mobile-first
Centered layout
Warm background
2-column mobile gallery grid
4–5 column desktop gallery grid
```

---

## 34. Accessibility Requirements

V1.0 should include basic accessibility:

- Visible focus states
- Sufficient color contrast
- Buttons with accessible labels
- Forms with labels
- Error messages linked to fields
- QR scanner fallback via manual search
- Do not rely only on color to show status

---

## 35. UI Anti-Patterns

Do not:

- Use dense tables on mobile
- Hide offline status
- Use small buttons in staff mode
- Autoplay videos
- Use decorative animations in staff mode
- Use raw hex colors everywhere instead of tokens
- Put business logic in visual components
- Use display font for operational screens
- Make guests create accounts
- Show technical error messages to normal users

---

## 36. Summary

WedPass UI/UX must create three connected experiences:

1. **Organizer**: calm control center
2. **Staff**: fast offline event tool
3. **Guest**: warm wedding memory space

The interface must be beautiful, but reliability and clarity matter more than decoration.

The most important UI rule is:

> During check-in, staff must always know that their actions are saved, even when the internet is not working.
