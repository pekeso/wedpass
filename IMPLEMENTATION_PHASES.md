# WedPass V1.0 — Implementation Phases

## Purpose

This document is the roadmap for implementing WedPass V1.0.

WedPass is an offline-first wedding guest check-in and photo/video collection platform for Central, East, and West Africa.

Implementation is split into focused phases so each can be executed in a fresh Claude Code session, committed separately, and tracked independently.

---

## How to Use This Document

1. Find the current phase in `PROGRESS.md`.
2. Open the corresponding phase file in `/phases/`.
3. Read the phase file — it contains a complete, self-contained prompt.
4. Copy the **Claude Code Implementation Prompt** section into a new Claude Code session.
5. After the phase is complete, update `PROGRESS.md`.
6. Commit the phase with the recommended commit message.
7. Move to the next phase.

---

## Planning Principles

- Build incrementally — one phase at a time.
- Test before committing.
- The offline check-in core is prioritized early — it is the main WedPass differentiator.
- Do not implement features outside V1.0 scope.
- Follow CLAUDE.md engineering rules in every phase.
- Every phase ends with tests, manual QA, a `PROGRESS.md` update, and a git commit.

---

## Phase Overview

| Phase | Name | Depends On | Status | Phase File | Recommended Commit |
|---|---|---|---|---|---|
| 00 | Repository Review and Planning | None | Completed | `phases/phase_00_repository_review_and_planning.md` | `docs: add implementation phase roadmap` |
| 01 | Project Setup and Tooling | 00 | Planned | `phases/phase_01_project_setup_and_tooling.md` | `chore: initialize wedpass project shell` |
| 02 | Tailwind, shadcn/ui, and Design Tokens | 01 | Planned | `phases/phase_02_design_system_and_shadcn.md` | `chore: configure tailwind shadcn and design tokens` |
| 03 | Base Layouts and Shared Components | 02 | Planned | `phases/phase_03_base_layouts_and_shared_components.md` | `feat: add shared layout and base components` |
| 04 | Prisma Database Foundation | 01 | Planned | `phases/phase_04_prisma_database_foundation.md` | `feat: add prisma database foundation` |
| 05 | Auth Foundation | 03, 04 | Planned | `phases/phase_05_auth_foundation.md` | `feat: implement organizer authentication` |
| 06 | Wedding CRUD Foundation | 05 | Planned | `phases/phase_06_wedding_crud_foundation.md` | `feat: add wedding crud foundation` |
| 07 | Guest Management | 06 | Planned | `phases/phase_07_guest_management.md` | `feat: implement guest management` |
| 08 | CSV Import and QR/Pass Generation | 07 | Planned | `phases/phase_08_csv_import_and_qr_generation.md` | `feat: add csv import and qr generation` |
| 09 | Offline IndexedDB Foundation | 01 | Planned | `phases/phase_09_offline_indexeddb_foundation.md` | `feat: add offline indexeddb foundation` |
| 10 | Staff Device Access Foundation | 05, 09 | Planned | `phases/phase_10_staff_device_access_foundation.md` | `feat: add staff device access foundation` |
| 11 | Event Mode and Snapshot Creation | 08, 10 | Planned | `phases/phase_11_event_mode_and_snapshot_creation.md` | `feat: add event mode and snapshot creation` |
| 12 | Offline Pack Download | 11 | Planned | `phases/phase_12_offline_pack_download.md` | `feat: add offline pack download` |
| 13A | Staff Local Guest Search | 12 | Planned | `phases/phase_13a_staff_local_guest_search.md` | `feat: implement staff local guest search` |
| 13B | Staff QR Scanner | 13A | Planned | `phases/phase_13b_staff_qr_scanner.md` | `feat: add staff qr scanner` |
| 14A | Staff Local Check-In Transaction | 13A | Planned | `phases/phase_14a_staff_local_checkin_transaction.md` | `feat: implement staff local checkin transaction` |
| 14B | Staff Check-In UI | 14A, 13B | Planned | `phases/phase_14b_staff_checkin_ui.md` | `feat: add staff checkin ui` |
| 15 | Client Sync Queue and Sync Engine | 14A | Planned | `phases/phase_15_client_sync_queue_and_engine.md` | `feat: add client sync queue and engine` |
| 16 | Check-In Sync Backend | 15 | Planned | `phases/phase_16_checkin_sync_backend.md` | `feat: implement checkin sync backend` |
| 17 | Multi-Device Conflict Handling Tests | 16 | Planned | `phases/phase_17_multi_device_conflict_tests.md` | `test: add multi-device conflict handling tests` |
| 18 | Event Readiness Command Center | 11 | Planned | `phases/phase_18_event_readiness_command_center.md` | `feat: add event readiness command center` |
| 19 | Staff Device Readiness UI | 18 | Planned | `phases/phase_19_staff_device_readiness_ui.md` | `feat: add staff device readiness ui` |
| 20 | Check-In Stats and Post-Event Sync Closeout | 17, 18 | Planned | `phases/phase_20_checkin_stats_and_closeout.md` | `feat: add post-event sync closeout` |
| 21 | Guest Public Wedding Page | 06 | Planned | `phases/phase_21_guest_public_wedding_page.md` | `feat: add guest public wedding page` |
| 22 | Media Upload Signed URL Flow | 21 | Planned | `phases/phase_22_media_upload_signed_url_flow.md` | `feat: implement media upload signed url flow` |
| 23 | Guest Gallery | 22 | Planned | `phases/phase_23_guest_gallery.md` | `feat: add guest gallery` |
| 24 | Organizer Media Moderation | 22 | Planned | `phases/phase_24_organizer_media_moderation.md` | `feat: add organizer media moderation` |
| 25 | Gallery Privacy Settings | 23, 24 | Planned | `phases/phase_25_gallery_privacy_settings.md` | `feat: add gallery privacy settings` |
| 26 | Bilingual English/French Foundation | 03 | Planned | `phases/phase_26_bilingual_foundation.md` | `feat: add bilingual foundation` |
| 27 | Analytics and Monitoring Foundation | 20 | Planned | `phases/phase_27_analytics_and_monitoring.md` | `feat: add analytics and monitoring foundation` |
| 28 | Security Hardening | 25, 27 | Planned | `phases/phase_28_security_hardening.md` | `chore: harden security controls` |
| 29 | End-to-End Testing | 28 | Planned | `phases/phase_29_end_to_end_testing.md` | `test: add end-to-end beta readiness tests` |
| 30 | Deployment Preparation | 29 | Planned | `phases/phase_30_deployment_preparation.md` | `chore: prepare production deployment` |
| 31 | Beta Wedding Readiness | 30 | Planned | `phases/phase_31_beta_wedding_readiness.md` | `docs: add beta wedding readiness workflow` |

---

## Dependency Order

The critical path is:

```
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 11
                              ↓                  ↓
                     09 → 10 → 12 → 13A → 13B → 14A → 14B → 15 → 16 → 17
                                                                         ↓
                                              18 → 19 → 20 → 27 → 28 → 29 → 30 → 31
                              ↓
                     06 → 21 → 22 → 23 → 24 → 25
```

The offline check-in core (Phases 09–17) must be built before media and polish phases.

---

## Phase Status Key

```text
Planned       Not started
In Progress   Actively being implemented
Completed     Implemented, tested, committed
Blocked       Waiting on dependency or external factor
Skipped       Intentionally not implemented in V1.0
```

---

## Important Reminders

- Run `npm run type-check` and `npm run lint` before every commit.
- Run unit tests with `npm run test` before every commit.
- Update `PROGRESS.md` after completing each phase.
- Commit after each completed phase using the recommended commit message.
- Do not start the next phase until the current phase passes its acceptance criteria.

---

## Not Included in V1.0

The following features are explicitly out of scope for V1.0 and must not be implemented:

- RSVP automation
- Invitation builder / digital invitation templates
- Seating chart
- Vendor marketplace
- Payment processing / ticketing
- AI photo curation or AI assistant
- Automatic social media posting
- Native iOS/Android app
- Real-time WebSocket dashboard
- Multi-tenant enterprise organization management
- White-label planner portal
- Advanced analytics beyond operational stats
- Guest comments or reactions
- Public event discovery
- Server-side video transcoding

These features belong in `docs/backlog.md` and should only be planned for V1.1 or later.
