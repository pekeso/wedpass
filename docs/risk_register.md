# WedPass Risk Register

## 1. Document Purpose

This document defines the risk register for **WedPass V1.0**.

It identifies major risks that could affect:

- Product success
- Technical reliability
- Offline check-in
- Media uploads
- Security
- Beta adoption
- Cost control
- Implementation speed

For each risk, this document defines:

- Risk description
- Category
- Likelihood
- Impact
- Severity
- Mitigation
- Contingency
- Early warning signs

---

## 2. Risk Rating Method

### Likelihood

```text
Low       Unlikely to happen
Medium    Possible
High      Likely or expected
```

### Impact

```text
Low       Minor inconvenience
Medium    Noticeable product or user impact
High      Major disruption
Critical  Could break event-day trust or beta viability
```

### Severity

```text
Low
Medium
High
Critical
```

---

## 3. Highest Priority Risks

The highest priority V1.0 risks are:

1. Offline sync failure
2. Check-in data loss
3. Multi-device duplicate handling bug
4. Staff device not prepared before event
5. Media upload failures under poor network
6. Public upload abuse
7. Feature creep
8. Low guest participation in media upload

These risks must be reviewed before beta launch.

---

# Part 1 — Technical Risks

## 4. Risk: Offline Sync Failure

Category: Technical / Core Product  
Likelihood: Medium  
Impact: Critical  
Severity: Critical

### Description

Check-ins are created offline but fail to sync correctly when internet returns.

### Why it matters

Offline sync is WedPass's core differentiator. If it fails, the product loses trust.

### Mitigation

- Use append-only local sync queue.
- Do not delete queue items before server acknowledgement.
- Implement idempotent sync endpoint.
- Unit test sync result processing.
- Integration test failed sync retry.
- Display pending sync clearly in staff UI.
- Store sync logs on server.

### Contingency

- Preserve local queue.
- Add manual export of pending queue if needed.
- Provide support instructions to recover unsynced data.
- Avoid clearing local data until sync is confirmed.

### Early Warning Signs

- Pending sync count does not decrease.
- Staff reports repeated sync failures.
- Sync logs show high error count.
- Duplicate queue items appear.
- Staff devices show inconsistent check-in totals.

Owner: Engineering

---

## 5. Risk: Check-In Data Loss

Category: Technical / Data Integrity  
Likelihood: Low  
Impact: Critical  
Severity: Critical

### Description

A guest is checked in locally, but the data is lost due to browser refresh, IndexedDB failure, or faulty sync handling.

### Mitigation

- Use IndexedDB transactions.
- Write guest state and queue item atomically.
- Test browser refresh scenarios.
- Do not store check-ins only in memory.
- Avoid clearing local data when unsynced items exist.
- Add visible pending sync count.

### Contingency

- Recover from local IndexedDB if available.
- Use recent check-ins list for staff verification.
- Provide manual reconciliation if a device fails.

### Early Warning Signs

- Staff sees checked-in guest disappear after refresh.
- Queue count does not match recent check-ins.
- Sync status shows impossible counts.
- IndexedDB errors appear in Sentry.

Owner: Engineering

---

## 6. Risk: Multi-Device Duplicate Handling Bug

Category: Technical / Sync  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Two devices check in the same guest offline and the server fails to resolve the conflict correctly.

### Mitigation

- Implement deterministic conflict rule.
- Earliest valid timestamp wins.
- Use server transactions.
- Add duplicate check-in tests.
- Add multi-device sync integration tests.
- Store duplicate records for audit during beta.

### Contingency

- Show authoritative timestamp in dashboard.
- Review sync logs manually.
- Patch conflict logic before broader beta.

### Early Warning Signs

- Same guest appears checked in twice.
- Dashboard counts exceed guest count.
- Duplicate records are not marked duplicate.
- Staff reports conflicting check-in states.

Owner: Engineering

---

## 7. Risk: Snapshot Mismatch

Category: Technical / Offline  
Likelihood: Low  
Impact: High  
Severity: Medium

### Description

A staff device uses an outdated snapshot while the server expects a newer snapshot.

### Mitigation

- Lock guest list in Event Mode.
- Allow only one active snapshot.
- Require snapshot version in sync request.
- Warn staff when snapshot is outdated.
- Avoid mid-event guest list changes.

### Contingency

- Preserve local check-in queue.
- Require staff to refresh offline pack.
- Manually reconcile if needed.

### Early Warning Signs

- Sync endpoint returns `SNAPSHOT_MISMATCH`.
- Staff device shows old guest count.
- Guests added after Event Mode are missing.

Owner: Engineering / Operations

---

## 8. Risk: IndexedDB Storage Issues

Category: Technical / Browser Storage  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Browser storage limitations, private browsing mode, or device constraints prevent reliable offline storage.

### Mitigation

- Test on low-end Android devices.
- Show offline pack readiness confirmation.
- Detect failed snapshot storage.
- Keep snapshot data minimal.
- Avoid storing large unnecessary data in IndexedDB.
- Keep media queue separate from check-in queue.

### Contingency

- Use another staff device.
- Re-download snapshot.
- Use manual paper backup for first beta events if needed.

### Early Warning Signs

- Offline pack download fails.
- IndexedDB write errors occur.
- Device cannot persist after refresh.
- Browser private mode issues appear.

Owner: Engineering / Event Operations

---

## 9. Risk: QR Scanner Fails on Some Devices

Category: Device / UX  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Camera access or QR scanning fails on low-end phones, older browsers, or poor lighting.

### Mitigation

- Provide manual search fallback.
- Test QR scanner on Android devices.
- Use high-contrast QR codes.
- Keep QR print quality high.
- Add clear invalid QR message.

### Contingency

- Staff uses manual guest search.
- Use printed guest list as backup in first beta if needed.

### Early Warning Signs

- Staff reports camera permission issues.
- QR scans are slow.
- Many guests checked in through manual search.
- Invalid QR errors increase.

Owner: Engineering / UX

---

## 10. Risk: Sync Storm After Internet Returns

Category: Technical / Performance  
Likelihood: Medium  
Impact: Medium  
Severity: Medium

### Description

Multiple staff devices reconnect at the same time and send large sync batches, causing API load or contention.

### Mitigation

- Batch sync requests.
- Use exponential backoff.
- Keep API stateless.
- Add database indexes.
- Avoid very large payloads.
- Use idempotent processing.

### Contingency

- Increase sync interval.
- Temporarily reduce batch size.
- Add rate limiting per staff device.

### Early Warning Signs

- Sync endpoint latency spikes.
- API timeouts after reconnect.
- Many failed sync attempts happen at the same time.

Owner: Engineering

---

# Part 2 — Media Risks

## 11. Risk: Media Upload Failure Under Poor Network

Category: Media / Network  
Likelihood: High  
Impact: Medium  
Severity: High

### Description

Guests cannot upload photos/videos due to poor internet, large files, or interrupted uploads.

### Mitigation

- Compress images client-side.
- Enforce video size limits.
- Show upload progress.
- Queue/retry uploads where feasible.
- Use signed direct-to-R2 uploads.
- Provide reassuring error messages.

### Contingency

- Encourage upload after event when internet is better.
- Allow guests to retry.
- Keep upload page accessible after wedding.

### Early Warning Signs

- High upload failure rate.
- Many queued uploads.
- Guests abandon upload screen.
- Large videos frequently fail.

Owner: Engineering / UX

---

## 12. Risk: Video Uploads Increase Cost and Complexity

Category: Cost / Media  
Likelihood: High  
Impact: Medium  
Severity: High

### Description

Videos consume large storage and bandwidth, increasing cost and upload failure rates.

### Mitigation

- Limit video size.
- Warn users before uploading large videos.
- Track storage usage.
- Avoid server-side transcoding in V1.
- Consider paid tier for higher video limits in V1.1.

### Contingency

- Reduce video size limit.
- Temporarily disable video upload for beta events if needed.
- Ask users to upload shorter clips.

### Early Warning Signs

- R2 storage grows rapidly.
- Upload failure rate is higher for videos.
- Costs exceed expected beta budget.

Owner: Product / Engineering

---

## 13. Risk: Public Upload Abuse

Category: Security / Abuse  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Public upload links are abused to upload inappropriate, malicious, or excessive files.

### Mitigation

- Rate limit upload URL endpoint.
- Validate file type.
- Validate file size.
- Reject SVG and executable files.
- Use signed upload URLs.
- Allow organizer to hide/delete media.
- Disable uploads per wedding if needed.

### Contingency

- Temporarily disable uploads.
- Hide/delete abusive media.
- Rotate access link if needed.
- Tighten rate limits.

### Early Warning Signs

- Sudden spike in upload URL requests.
- Unsupported file attempts.
- Many uploads from same IP.
- Organizer reports inappropriate media.

Owner: Security / Engineering

---

## 14. Risk: Hidden or Deleted Media Appears Publicly

Category: Security / Privacy  
Likelihood: Low  
Impact: High  
Severity: High

### Description

Media hidden or deleted by organizer still appears in guest gallery.

### Mitigation

- Public gallery API filters status.
- Test hidden/deleted media visibility.
- Avoid client-side-only filtering.
- Use server-side status checks.

### Contingency

- Disable gallery temporarily.
- Patch gallery endpoint.
- Review affected wedding media.

### Early Warning Signs

- Guest sees hidden media.
- Media moderation does not update public gallery.
- Cache serves stale media list.

Owner: Engineering / Security

---

# Part 3 — Security Risks

## 15. Risk: Cross-Wedding Data Access

Category: Security / Authorization  
Likelihood: Medium  
Impact: Critical  
Severity: Critical

### Description

A user accesses guests, media, or stats from a wedding they do not own.

### Mitigation

- Scope every query by wedding ID and owner ID.
- Add authorization tests.
- Avoid direct `findUnique` without wedding scope.
- Use service-level access checks.
- Validate staff token wedding scope.

### Contingency

- Patch authorization immediately.
- Review logs.
- Notify affected users if needed.
- Rotate tokens if exposure involved.

### Early Warning Signs

- API returns data for wrong wedding.
- Authorization tests fail.
- Staff token accesses organizer endpoint.

Owner: Security / Engineering

---

## 16. Risk: Guessable QR Tokens

Category: Security  
Likelihood: Low  
Impact: High  
Severity: Medium

### Description

QR tokens are predictable and allow unauthorized lookup or check-in attempts.

### Mitigation

- Use crypto-secure random tokens.
- Avoid sequential IDs.
- Avoid phone numbers or names in tokens.
- Validate token against wedding snapshot.
- Keep QR payload minimal.

### Contingency

- Regenerate QR tokens.
- Reissue QR codes.
- Invalidate compromised tokens.

### Early Warning Signs

- QR tokens appear short or sequential.
- Invalid QR attempts increase.
- External users access guest pages unexpectedly.

Owner: Engineering / Security

---

## 17. Risk: Staff Token Misuse

Category: Security / Access Control  
Likelihood: Medium  
Impact: Medium  
Severity: Medium

### Description

Staff token is leaked or reused outside intended scope.

### Mitigation

- Scope token to wedding and staff device.
- Expire staff tokens.
- Allow device revocation.
- Limit staff permissions.
- Do not allow staff token to access organizer APIs.

### Contingency

- Revoke device.
- Generate new staff token.
- Review sync logs for misuse.

### Early Warning Signs

- Unknown staff device appears.
- Staff token used after event.
- Staff token attempts unauthorized APIs.

Owner: Security / Operations

---

## 18. Risk: Secrets Leakage

Category: Security / Infrastructure  
Likelihood: Low  
Impact: Critical  
Severity: High

### Description

Database URL, JWT secret, or R2 credentials are exposed.

### Mitigation

- Use environment variables.
- Gitignore `.env.local`.
- Never commit secrets.
- Use `.env.example`.
- Limit access to Vercel/Supabase/Cloudflare.
- Rotate secrets if exposed.

### Contingency

- Rotate leaked credentials immediately.
- Redeploy.
- Review logs.
- Invalidate affected tokens.

### Early Warning Signs

- Secret appears in repository.
- Secret appears in logs.
- Unexpected database or R2 activity.

Owner: Engineering / Operations

---

# Part 4 — Product and UX Risks

## 19. Risk: Staff Devices Not Prepared Before Event

Category: Operations / UX  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Staff forget to download the offline pack before guests arrive.

### Mitigation

- Clear Event Mode checklist.
- Offline Pack Download screen.
- Strong warning: “Do this before guests arrive.”
- Beta onboarding checklist.
- Staff readiness confirmation.

### Contingency

- Download pack during event if internet exists.
- Use another prepared device.
- Use paper backup if needed.

### Early Warning Signs

- Staff screen says “Not prepared.”
- No snapshot downloaded on devices.
- Organizer unsure whether devices are ready.

Owner: Product / Operations

---

## 20. Risk: Low Guest Participation in Media Uploads

Category: Market / Engagement  
Likelihood: High  
Impact: Medium  
Severity: High

### Description

Guests continue sharing photos on WhatsApp instead of uploading to WedPass.

### Mitigation

- Make upload very simple.
- Use QR posters at venue.
- Ask MC to announce upload link.
- Encourage couple to promote it.
- Add clear value proposition: “Share memories with the couple.”
- Keep upload page mobile-first.

### Contingency

- Allow post-event uploads.
- Share link in WhatsApp groups.
- Test incentives like “best photo.”
- Improve guest messaging.

### Early Warning Signs

- Low upload count.
- Guests ask where to send photos.
- Upload page visits but low completion.
- Couple still asks guests to send media via WhatsApp.

Owner: Product / UX

---

## 21. Risk: Organizer Finds Setup Too Complicated

Category: UX / Adoption  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Organizer struggles to import guests, generate QR codes, or enable Event Mode.

### Mitigation

- Use readiness checklist.
- Provide clear empty states.
- Keep CSV format simple.
- Offer manual onboarding during beta.
- Provide setup checklist.
- Avoid advanced features in V1.

### Contingency

- White-glove beta onboarding.
- Import guest list manually for first users.
- Simplify UI based on feedback.

### Early Warning Signs

- Organizer abandons setup.
- CSV import errors are common.
- Event Mode not enabled before wedding.
- Organizer asks repeated setup questions.

Owner: Product / UX

---

## 22. Risk: Staff Mode UI Too Complex Under Pressure

Category: UX / Event Operations  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

Staff struggle to use the check-in interface during a busy wedding entrance.

### Mitigation

- Mobile-first staff UI.
- Large buttons.
- Always-visible sync state.
- Minimal navigation.
- Manual search fallback.
- Test with non-technical users.

### Contingency

- Simplify staff screens.
- Reduce actions on main screen.
- Add quick training guide.

### Early Warning Signs

- Staff taps wrong buttons.
- Staff asks what offline status means.
- Staff cannot find manual search.
- Check-in line slows down.

Owner: UX / Product

---

# Part 5 — Business and Scope Risks

## 23. Risk: Feature Creep

Category: Founder / Product  
Likelihood: High  
Impact: High  
Severity: Critical

### Description

New ideas such as RSVP, invitation builder, AI, payments, and social media integrations are added before V1.0 is validated.

### Mitigation

- Use frozen V1 scope.
- Add future ideas to backlog.
- Follow implementation plan.
- Build only V1.0 features.
- Review scope before each development stage.

### Contingency

- Stop new feature work.
- Re-baseline against `v1_scope.md`.
- Move unfinished extras to backlog.

### Early Warning Signs

- Implementation deviates from plan.
- New routes appear outside scope.
- AI/social/payment features start early.
- Core offline check-in is delayed.

Owner: Founder / Product

---

## 24. Risk: Free Beta Does Not Produce Useful Feedback

Category: Market / Validation  
Likelihood: Medium  
Impact: Medium  
Severity: Medium

### Description

Beta users use the product but do not provide structured feedback.

### Mitigation

- Add feedback form.
- Schedule post-event feedback call.
- Ask specific questions.
- Track product metrics.
- Personally onboard beta users.

### Contingency

- Offer incentive for feedback.
- Interview staff/organizers manually.
- Observe event usage if possible.

### Early Warning Signs

- Users do not complete feedback form.
- Feedback is vague.
- No post-event conversation.
- Metrics are missing.

Owner: Product / Founder

---

## 25. Risk: Wrong Initial Positioning

Category: Market / Strategy  
Likelihood: Medium  
Impact: Medium  
Severity: Medium

### Description

Target users perceive WedPass as another wedding planning platform instead of a specific guest check-in and memory collection tool.

### Mitigation

- Clear landing page headline.
- Focus message on guest control and memories.
- Avoid broad wedding planning claims.
- Use tagline: guest check-in and wedding memories in one place.

### Contingency

- Refine positioning after beta.
- Test alternate landing page messaging.
- Focus sales conversations on biggest pain point.

### Early Warning Signs

- Users ask about seating, RSVP, vendors first.
- Users do not understand offline check-in value.
- Landing page conversion is low.

Owner: Product / Marketing

---

# Part 6 — Cost and Infrastructure Risks

## 26. Risk: Storage Cost Explosion

Category: Cost / Infrastructure  
Likelihood: Medium  
Impact: Medium  
Severity: Medium

### Description

Large photo/video uploads grow R2 storage faster than expected.

### Mitigation

- Enforce file size limits.
- Track storage per wedding.
- Compress images.
- Limit video size.
- Avoid unlimited free usage after beta.
- Add storage quotas in V1.1.

### Contingency

- Reduce limits.
- Archive/delete old media.
- Introduce paid storage plans.
- Disable video upload temporarily.

### Early Warning Signs

- Storage grows faster than weddings onboarded.
- Video uploads dominate storage.
- Monthly cost exceeds expected beta budget.

Owner: Product / Engineering

---

## 27. Risk: Third-Party Service Outage

Category: Infrastructure  
Likelihood: Low  
Impact: Medium to High  
Severity: Medium

### Description

Vercel, Supabase, Cloudflare R2, or Sentry experiences an outage.

### Mitigation

- Offline check-in reduces dependency during event.
- Keep check-in local-first.
- Use managed providers.
- Avoid critical dependency on Sentry.
- Monitor service status.

### Contingency

- Check-in continues offline if devices prepared.
- Sync later when services recover.
- Communicate with beta organizer.

### Early Warning Signs

- API unavailable.
- R2 upload failures.
- Supabase connection errors.
- Vercel deployment issues.

Owner: Operations / Engineering

---

## 28. Risk: Production Migration Breaks App

Category: Infrastructure / Database  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

A database migration fails or breaks production data.

### Mitigation

- Test migrations locally.
- Prefer additive migrations.
- Avoid destructive migrations during beta.
- Backup before risky changes.
- Use `prisma migrate deploy` in production.

### Contingency

- Roll back app deployment.
- Restore database backup if necessary.
- Patch migration.

### Early Warning Signs

- Migration fails in preview.
- Prisma schema drift.
- Production build expects missing column.

Owner: Engineering

---

# Part 7 — Operational Risks

## 29. Risk: No Support Available During Beta Wedding

Category: Operations  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

A beta wedding encounters an issue and no one is available to help.

### Mitigation

- Personally onboard first beta weddings.
- Provide event-day checklist.
- Provide emergency troubleshooting guide.
- Ensure staff devices are tested beforehand.
- Avoid scheduling too many beta weddings at once.

### Contingency

- Use manual backup process.
- Collect logs after event.
- Prioritize fix before next beta.

### Early Warning Signs

- Organizer unsure about setup.
- Staff devices not tested.
- Beta event scheduled without readiness check.

Owner: Founder / Operations

---

## 30. Risk: Poor Real-World Device Testing

Category: QA / Operations  
Likelihood: Medium  
Impact: High  
Severity: High

### Description

App works on developer laptop but fails on common phones used at weddings.

### Mitigation

- Test on Android phones.
- Test on low-end devices.
- Test on Chrome mobile.
- Test camera permissions.
- Test offline behavior on real devices.
- Test slow network conditions.

### Contingency

- Use manual search fallback.
- Use another staff phone.
- Patch mobile issues before next beta.

### Early Warning Signs

- Camera does not open.
- UI layout breaks on mobile.
- Buttons too small.
- IndexedDB unavailable in browser mode.

Owner: QA / Engineering

---

# Part 8 — Risk Monitoring

## 31. Risk Metrics to Track During Beta

Track:

- Number of weddings onboarded
- Number of guests per wedding
- Number of staff devices per wedding
- Number of check-ins
- Number of offline check-ins
- Pending sync count per device
- Sync failure count
- Duplicate conflict count
- Media upload attempts
- Media upload failures
- Average media file size
- Video upload count
- Guest upload participation rate
- Organizer feedback rating

---

## 32. Risk Review Cadence

During development:

```text
Review risk register weekly.
```

Before each beta wedding:

```text
Review offline, staff, media, and support risks.
```

After each beta wedding:

```text
Update risk register based on real findings.
```

---

# Part 9 — Risk Summary Table

| ID | Risk | Likelihood | Impact | Severity |
|---|---|---:|---:|---:|
| R1 | Offline sync failure | Medium | Critical | Critical |
| R2 | Check-in data loss | Low | Critical | Critical |
| R3 | Multi-device duplicate bug | Medium | High | High |
| R4 | Snapshot mismatch | Low | High | Medium |
| R5 | IndexedDB storage issues | Medium | High | High |
| R6 | QR scanner device failure | Medium | High | High |
| R7 | Sync storm | Medium | Medium | Medium |
| R8 | Media upload failure | High | Medium | High |
| R9 | Video cost/complexity | High | Medium | High |
| R10 | Public upload abuse | Medium | High | High |
| R11 | Hidden media appears publicly | Low | High | High |
| R12 | Cross-wedding access | Medium | Critical | Critical |
| R13 | Guessable QR tokens | Low | High | Medium |
| R14 | Staff token misuse | Medium | Medium | Medium |
| R15 | Secrets leakage | Low | Critical | High |
| R16 | Staff devices not prepared | Medium | High | High |
| R17 | Low guest media participation | High | Medium | High |
| R18 | Organizer setup too complex | Medium | High | High |
| R19 | Staff UI too complex | Medium | High | High |
| R20 | Feature creep | High | High | Critical |
| R21 | Weak beta feedback | Medium | Medium | Medium |
| R22 | Wrong positioning | Medium | Medium | Medium |
| R23 | Storage cost explosion | Medium | Medium | Medium |
| R24 | Third-party outage | Low | High | Medium |
| R25 | Production migration issue | Medium | High | High |
| R26 | No beta support | Medium | High | High |
| R27 | Poor real-device testing | Medium | High | High |

---

## 33. Summary

WedPass V1.0 risk management should focus on one thing above all:

> Real wedding reliability.

The most dangerous risks are not cosmetic bugs. The most dangerous risks are:

- Lost check-ins
- Failed offline sync
- Poor staff usability
- Public data exposure
- Scope creep delaying the core product

If the system can reliably check guests in offline, preserve data, sync later, and collect media simply, V1.0 will be successful enough for beta validation.
