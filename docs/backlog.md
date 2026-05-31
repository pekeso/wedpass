# WedPass Backlog

## 1. Document Purpose

This document captures future product ideas for **WedPass**.

The backlog protects V1.0 from scope creep by giving every good idea a safe place to live without forcing it into the current build.

V1.0 is frozen around:

> Offline-first wedding guest check-in and photo/video collection.

Anything outside that focus belongs here unless the V1.0 scope is formally updated.

---

## 2. Backlog Rules

1. Do not build backlog items during V1.0 unless formally approved.
2. Add every new idea here instead of interrupting the implementation plan.
3. Prioritize backlog items only after beta feedback.
4. Separate user-requested features from founder ideas.
5. Do not assume every idea should become a feature.
6. Use real beta evidence to decide V1.1 priorities.

---

## 3. Priority Labels

Use these priority labels:

```text
P0  Critical after V1 if beta proves need
P1  Strong candidate for V1.1
P2  Useful later
P3  Nice-to-have
P4  Parked idea
```

---

## 4. Status Labels

Use these status labels:

```text
New
Needs Validation
Validated
Rejected
Planned
In Progress
Done
```

---

## 5. Product Areas

Backlog items are grouped by:

- V1.1 operational improvements
- Guest and media engagement
- Monetization
- Wedding planning expansion
- AI features
- Social features
- Mobile apps
- Planner/agency features
- Infrastructure and scale
- Security and compliance
- Localization
- Analytics

---

# Part 1 — Strong V1.1 Candidates

---

## 6. Real-Time-ish Check-In Dashboard

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Add a dashboard that refreshes check-in stats every 5–10 seconds during the event.

Why:

- Organizers/planners may want live visibility.
- Easier than WebSockets.
- Useful during check-in rush.

V1.1 approach:

- Use polling.
- Avoid WebSockets initially.
- Show last updated time.

Success signal:

- Organizers ask to monitor check-in progress live.

---

## 7. CSV Export

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to export:

- Guest list
- Check-in report
- Media metadata

Why:

- Useful for post-event reporting.
- Simple to implement.
- High perceived professionalism.

Success signal:

- Organizers ask for a copy of attendance/check-in data.

---

## 8. Multiple Weddings per Account

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Allow one organizer account to manage multiple weddings.

Why:

- Needed for planners.
- Schema already supports it.
- Unlocks repeat usage.

Success signal:

- Wedding planners or organizers manage more than one event.

---

## 9. Basic Wedding Branding

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to customize:

- Cover image
- Accent color
- Couple message
- Gallery visibility

Why:

- Makes guest pages feel more personal.
- Low complexity.
- Improves emotional value.

Success signal:

- Couples ask to personalize the guest upload/gallery page.

---

## 10. Media ZIP Download

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to download all wedding photos/videos as a ZIP archive.

Why:

- High value after event.
- Strong monetization candidate.
- Couples want to keep all memories.

Implementation note:

- May require background job if media count is large.
- Simple V1.1 option: select-and-download individual/batches.
- Full ZIP export may require worker service later.

Success signal:

- Organizers ask, “How do I download everything?”

---

## 11. Storage Limits

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Introduce storage limits per wedding.

Example:

```text
Free beta: limited storage
Paid: higher storage
```

Why:

- Controls cost.
- Prepares monetization.
- Prevents abuse.

Success signal:

- Media usage grows quickly or video uploads increase cost.

---

## 12. Light Role-Based Permissions

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Add simple roles:

- Owner
- Co-organizer
- Staff

Why:

- Useful for planners and family delegation.
- Avoid full enterprise RBAC.

Success signal:

- Organizers want someone else to help manage the wedding dashboard.

---

# Part 2 — Guest and Media Engagement

---

## 13. Guest Upload Link Sharing

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Make it easier to share the upload link through:

- WhatsApp
- SMS copy
- QR poster
- Copy link button

Why:

- Guest participation depends on easy sharing.
- WhatsApp is a major behavior in target markets.

Success signal:

- Low guest upload participation in beta.

---

## 14. Upload QR Poster Generator

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Generate a printable QR poster for guest media upload.

Poster includes:

- Couple names
- QR code
- Short instruction
- WedPass branding

Why:

- Helps guests discover upload page at venue.
- Simple and useful.

Success signal:

- Organizers manually create posters or ask how to share upload link.

---

## 15. Guest Media Attribution

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow guests to add their name when uploading media.

Why:

- Couple may want to know who shared a memory.
- Already partly planned as optional field.

Success signal:

- Couples ask who uploaded specific photos/videos.

---

## 16. Guest Comments on Media

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow guests to comment on media.

Why:

- Could increase engagement.
- Also increases moderation complexity.

Risks:

- Abuse
- Moderation burden
- Scope creep into social network behavior

Success signal:

- Guests/organizers ask for interaction around photos.

---

## 17. Guest Likes/Reactions

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow reactions on media.

Why:

- Engagement feature.
- Could help identify best moments.

Risks:

- Makes product feel more like social media.
- May distract from core value.

---

## 18. Best Photo Voting

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow guests to vote on favorite photos.

Why:

- Could encourage upload participation.
- Could be fun during/after event.

Risks:

- Adds social mechanics.
- Requires moderation.

---

## 19. Post-Event Upload Reminder

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Send or share a post-event reminder link for guests to upload photos/videos after the wedding.

Why:

- Many guests may upload later when internet improves.
- Useful in low-connectivity venues.

Potential channels:

- WhatsApp copy message
- Email
- SMS later

---

# Part 3 — RSVP and Invitation Expansion

---

## 20. RSVP Workflow

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow guests to confirm attendance before the wedding.

Features may include:

- RSVP yes/no
- Number of attendees
- RSVP deadline
- Organizer RSVP dashboard

Why:

- Common wedding need.
- Related to guest management.

Reason not in V1.0:

- V1.0 focuses on event-day check-in and media.

Success signal:

- Beta users repeatedly ask for RSVP.

---

## 21. Tokenized Guest Invitation Links

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Pre-register guests and send each one a unique invitation link.

The link opens a personalized RSVP page.

Why:

- Solves “anyone with link can RSVP” problem.
- Matches earlier wedding RSVP discussion.

---

## 22. Digital Invitation Builder

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow couples to design personalized digital invites.

Features:

- Template selection
- Couple names
- Date/time
- Venue
- RSVP link
- QR code

Why:

- Strong wedding feature.
- But high design scope.

Reason not in V1.0:

- Could distract from core offline check-in.

---

## 23. Invitation Delivery

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Send invitations through:

- Email
- SMS
- WhatsApp
- Downloadable link

Risks:

- Messaging cost
- Deliverability
- WhatsApp API complexity
- Consent/privacy concerns

---

## 24. RSVP Reminder Messages

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Send reminders to guests who have not RSVP’d.

Future channels:

- Email
- SMS
- WhatsApp

---

# Part 4 — Wedding Planning Expansion

---

## 25. Seating Chart

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to assign guests to tables.

Why:

- Common wedding planning feature.
- Useful after RSVP.

Reason not in V1.0:

- Adds planning complexity.
- Not required for guest check-in validation.

---

## 26. Wedding Schedule / Timeline

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to define wedding day schedule.

Examples:

- Ceremony
- Reception
- Dinner
- Speeches
- Dance

---

## 27. Task Checklist

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Wedding planning task checklist.

Reason parked:

- Moves product toward full planning suite.
- Not core to V1.

---

## 28. Vendor Management

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Track vendors:

- Photographer
- Caterer
- Decorator
- Venue
- DJ

Reason parked:

- Large product area.
- Could become separate module later.

---

## 29. Budget Planner

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Track wedding budget and expenses.

Reason parked:

- Not aligned with V1 check-in/media focus.

---

# Part 5 — AI Features

---

## 30. AI Photo Curation

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Use AI to help select best wedding photos.

Potential features:

- Remove blurry photos
- Highlight smiling/group photos
- Create top memories collection

Reason not in V1:

- Requires AI pipeline.
- Not needed to validate core product.

---

## 31. AI Duplicate Photo Detection

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Detect visually similar photos and group them.

Why:

- Guests may upload many duplicates.
- Helps organizer manage gallery.

---

## 32. AI Highlight Reel

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Create an automatic wedding highlight video from uploaded clips/photos.

Reason parked:

- Complex media processing.
- Requires background jobs and video pipeline.

---

## 33. AI Caption Suggestions

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Generate captions for gallery, posts, or thank-you messages.

---

## 34. AI Wedding Assistant

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

AI assistant to help couples plan their wedding.

Reason parked:

- Moves product toward broad wedding planning.
- Too early for V1/V1.1 unless beta demands it.

---

# Part 6 — Social and Sharing Features

---

## 35. Social Media Sharing

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to share selected media to social platforms.

Potential actions:

- Download optimized image
- Generate caption
- Copy share text
- Manual posting

Important:

- Avoid automatic posting in early versions.

---

## 36. Auto-Post to Organizer Socials

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Automatically post uploaded/approved media to organizer’s social accounts.

Risks:

- Privacy
- Platform API complexity
- Permission handling
- Mistaken public sharing
- Moderation burden

Recommendation:

- Do not build until strong demand and clear consent model.

---

## 37. Wedding Social Wall

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Display approved guest uploads live on a screen at the wedding.

Why:

- Could increase engagement.
- Useful for venues with projectors/screens.

Risks:

- Requires moderation.
- Needs stable display setup.

---

## 38. WhatsApp Sharing Templates

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Generate pre-written WhatsApp messages for:

- Upload link sharing
- Post-event upload reminder
- Thank-you message

Why:

- Strong fit for African markets.
- Low implementation complexity.

---

# Part 7 — Monetization

---

## 39. Paid Plans

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Introduce pricing after beta validation.

Possible plans:

```text
Free / Beta
Basic
Premium
Planner
```

Potential pricing dimensions:

- Guest count
- Staff devices
- Storage
- Video upload
- Media download
- Branding

---

## 40. Manual Invoicing

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Before payment integration, accept manual payments.

Why:

- Faster than payment gateway integration.
- Useful in markets with varied payment preferences.

---

## 41. Payment Gateway Integration

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Potential providers:

- Flutterwave
- Paystack
- Stripe
- Local mobile money integrations later

Reason not in V1:

- Free beta first.
- Payment adds complexity.

---

## 42. Storage-Based Pricing

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Charge based on media storage and video usage.

Why:

- Directly tied to cost.
- Easy for users to understand if packaged well.

---

# Part 8 — Planner and Agency Features

---

## 43. Planner Accounts

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow wedding planners to manage multiple weddings.

Features:

- Multiple weddings
- Client list
- Staff assignment
- Branding options

---

## 44. White-Label Planner Portal

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Allow planners/agencies to use WedPass under their own brand.

Reason parked:

- More complex permissions and branding.
- Better after product-market validation.

---

## 45. Team Members

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow organizer/planner to invite team members.

Roles:

- Owner
- Co-organizer
- Staff

---

# Part 9 — Mobile Apps

---

## 46. Native Android App

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Build native Android app for staff check-in.

Why:

- Better camera performance
- Better offline control
- Better install experience

Reason not in V1:

- Responsive PWA is faster to validate.

---

## 47. Native iOS App

Priority:

```text
P4
```

Status:

```text
Parked
```

Description:

Native iOS app for staff/organizer use.

Reason parked:

- Smaller immediate need in target markets.
- Higher development overhead.

---

# Part 10 — Infrastructure and Scale

---

## 48. Background Jobs

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Add workers for:

- ZIP media generation
- Thumbnail generation
- Media cleanup
- Email sending
- Scheduled reminders

---

## 49. Redis Rate Limiting

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Use Redis for distributed rate limiting if Vercel/API scale requires it.

Reason not in V1:

- Keep infrastructure simple.

---

## 50. WebSocket Live Dashboard

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Realtime dashboard for check-ins and media uploads.

Reason not in V1/V1.1 initially:

- Polling is simpler and likely sufficient.

---

## 51. Media Thumbnails

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Generate thumbnails for uploaded media.

Why:

- Improves gallery performance.
- Especially useful for videos.

Could require background processing.

---

## 52. Media Retention Policy Automation

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Automatically archive/delete old media after a retention period.

Why:

- Controls storage cost.
- Important for paid plans.

---

# Part 11 — Security and Compliance

---

## 53. Email Verification

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Verify organizer email during registration.

---

## 54. Password Reset

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to reset password.

May become necessary before broader beta/public launch.

---

## 55. Audit Log UI

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Show organizer/admin history of:

- Staff device creation
- Snapshot downloads
- Media deletion
- Sync attempts

---

## 56. Data Export and Delete

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow organizer to export or delete wedding data.

Important for privacy and trust.

---

## 57. Optional Staff Event PIN

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Require a short PIN before entering staff Event Mode.

Useful if staff devices are shared.

---

# Part 12 — Localization

---

## 58. French UI

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Add French language support.

Why:

- Central and West Africa include many French-speaking countries.
- User has strong Francophone Africa focus.

---

## 59. English/French Language Toggle

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Allow user to switch between English and French.

---

## 60. Country-Specific Defaults

Priority:

```text
P3
```

Status:

```text
Needs Validation
```

Description:

Adjust phone number formatting, currency, and messaging by country.

---

# Part 13 — Analytics

---

## 61. Product Analytics Events

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Track key product actions:

- Wedding created
- Guests imported
- Event Mode enabled
- Snapshot downloaded
- Guest checked in
- Sync succeeded
- Upload attempted
- Upload succeeded
- Upload failed
- Gallery viewed

---

## 62. Organizer Analytics Dashboard

Priority:

```text
P2
```

Status:

```text
Needs Validation
```

Description:

Show deeper event insights:

- Check-in over time
- Uploads over time
- Staff device performance
- Media participation rate

---

## 63. Beta Analytics Review

Priority:

```text
P1
```

Status:

```text
Needs Validation
```

Description:

Create internal review after each beta wedding.

---

# Part 14 — Backlog Review Process

---

## 64. How to Promote a Backlog Item

A backlog item can move to planned only if:

1. It supports the main product direction.
2. It is requested by real users or strongly supports monetization.
3. It does not weaken offline reliability.
4. It has clear implementation boundaries.
5. It fits V1.1 or later strategy.

---

## 65. How to Reject a Backlog Item

Reject or park an item if:

- It distracts from the core product.
- It is too complex too early.
- It creates high operational burden.
- It lacks user demand.
- It turns WedPass into an unfocused wedding super-app.

---

## 66. Current V1.1 Candidate Shortlist

Most likely V1.1 candidates after beta:

1. CSV export
2. Multiple weddings per account
3. Basic branding customization
4. Media ZIP/bulk download
5. Storage limits
6. Guest upload QR poster
7. WhatsApp sharing templates
8. Password reset
9. Product analytics events
10. Light polling check-in dashboard

---

## 67. Summary

The WedPass backlog contains many valuable ideas, but V1.0 must stay focused.

The backlog exists to protect the build from scope creep.

The guiding rule is:

> Validate offline guest check-in and media collection first. Expand only after real wedding feedback.
