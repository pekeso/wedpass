# WedPass Event Operations Guide

## 1. Document Purpose

This document defines the practical event-day operations model for **WedPass V1.0**.

WedPass is not only a software platform. In a real wedding, it becomes part of the event operations system.

This guide explains how WedPass should be used before, during, and after a wedding so that guest check-in and photo/video collection run smoothly.

It focuses on practical realities:

- unreliable internet
- personal phones used by staff
- guests without QR codes
- last-minute confusion
- battery issues
- duplicate names
- large guest lists
- staff under pressure
- media uploads on weak networks
- English/French operational communication

---

## 2. Operational Philosophy

WedPass must support the wedding, not slow it down.

The operational rule is:

> The wedding entrance must keep moving, even when internet, QR scanning, or guest data is imperfect.

WedPass operations should prioritize:

1. Fast guest movement
2. Reliable offline check-in
3. Clear staff instructions
4. Visible sync status
5. Practical fallback procedures
6. Post-event data safety
7. Simple media collection

---

## 3. Wedding Lifecycle

WedPass operations follow this lifecycle:

```text
1. Setup Wedding
2. Add Guests
3. Generate Passes / QR Codes
4. Prepare Event Mode
5. Prepare Staff Devices
6. Run Guest Check-In
7. Sync All Devices
8. Collect Memories
9. Review Media and Reports
10. Close Event
```

Each phase should have clear actions and clear success criteria.

---

# Part 1 — Before the Wedding

## 4. Setup Wedding

The organizer creates the wedding with:

- Wedding name
- Couple names
- Wedding date
- Venue/location
- Country
- Optional cover image
- Gallery setting

Operational goal:

> Create the wedding early enough to prepare guests, staff devices, QR codes, and media upload materials.

Avoid setting up the wedding on the event day unless it is a small controlled test.

---

## 5. Guest List Preparation

The guest list is the foundation of check-in.

Required guest data:

- Full name
- Allowed guest count
- Optional phone number
- Optional email

Recommended operational rule:

> One guest record represents one invitation/pass.

If a guest is allowed to come with one person, the allowed guest count should be:

```text
2 people total under this pass
```

The staff UI should avoid ambiguous wording like:

```text
Allowed guests: 2
```

Better wording:

```text
Total allowed under this pass: 2 people
```

---

## 6. Guest List Quality Checks

Before Event Mode, the organizer should check:

- Duplicate guest names
- Missing names
- Unclear family/group entries
- Incorrect allowed guest count
- Missing phone numbers where possible
- CSV import errors
- VIP or special guests if relevant

Typical real-world problems:

- Same person appears twice
- Guest uses nickname
- Guest comes with family
- Guest name is misspelled
- Guest was invited verbally
- Guest appears in WhatsApp list but not CSV

WedPass should help detect duplicates, but staff must also have a fallback process.

---

## 7. QR Code / Pass Preparation

WedPass can generate guest QR codes, but operations must define how they will be used.

Possible QR distribution methods:

- Download and send manually through WhatsApp
- Print QR cards
- Export QR codes for invitation design
- Use QR only internally at reception desk
- Use manual search for guests without QR

Important operational note:

> The wedding should not depend only on guests having QR codes.

Many guests will arrive without QR codes.

Manual search must be available.

---

## 8. Event Mode Preparation

Event Mode is the point where the guest list becomes operationally locked for offline check-in.

Before enabling Event Mode, confirm:

- Wedding details are correct
- Guest list is final enough
- QR codes are generated
- Staff devices are known
- Organizer understands that the guest list will be locked
- Offline check-in is the priority

Event Mode warning:

```text
Once Event Mode is enabled, the guest list will be locked for offline check-in consistency.
```

Operational recommendation:

> Enable Event Mode only when the guest list is stable enough for event-day operations.

---

## 9. Staff Device Preparation

Each staff device should be prepared before guests arrive.

For each device, confirm:

- Device label assigned
- Staff access works
- Offline pack downloaded
- Guest count displayed correctly
- QR scanner tested
- Manual search tested
- Sync status understood
- Device is charged
- Staff knows what to do offline

Device labels should be practical:

```text
Main Entrance Phone 1
VIP Entrance Phone
Bride Family Desk
Groom Family Desk
```

Avoid vague labels like:

```text
Phone
Staff
Device 1
```

---

## 10. Event Readiness Command Center

The organizer dashboard should show operational readiness.

Suggested readiness indicators:

```text
Wedding details: Ready
Guest list: Ready
QR codes: Ready
Event Mode: Enabled
Staff devices: 3 of 4 ready
Offline packs: 3 of 4 downloaded
Upload poster: Downloaded
Staff instructions: Confirmed
```

Readiness should not only be technical. It should also be operational.

---

## 11. Venue Preparation

Before the wedding, confirm:

- Where staff will stand
- Number of entrances
- Whether there is Wi-Fi
- Whether mobile data works near the entrance
- Whether devices can sync after the event
- Where staff can charge phones
- Whether power banks are available
- Where QR posters will be placed
- Who handles exception cases

Important message:

```text
Internet is not required during check-in if devices are prepared.
Each staff device needs internet before the event to download the offline pack and after the event to sync.
```

---

## 12. Guest Upload Activation

Media upload will not succeed automatically. Guests need to be prompted.

Prepare:

- Guest upload QR poster
- WhatsApp message
- MC announcement
- Post-event reminder message
- Upload link copied and tested

Recommended guest message:

```text
Help us collect beautiful memories from the wedding.
Upload your favorite photos and short videos here: [WedPass link]
```

French version:

```text
Aidez-nous à rassembler les plus beaux souvenirs du mariage.
Ajoutez vos photos et courtes vidéos ici : [lien WedPass]
```

---

# Part 2 — During the Wedding

## 13. Staff Check-In Principles

Staff should follow a simple process:

```text
1. Scan QR code if guest has one.
2. Confirm guest name.
3. Check allowed guest count.
4. Tap Check In.
5. Continue to next guest.
```

If QR fails:

```text
Search manually by name or phone.
```

If guest is not found:

```text
Send guest to the manual/organizer desk.
```

Staff should not stop check-in because internet is offline.

---

## 14. Offline Mode Behavior

If internet fails, staff should see:

```text
Offline mode active.
Check-ins are safely saved on this device and will sync when internet returns.
```

French version:

```text
Mode hors ligne actif.
Les présences sont enregistrées sur cet appareil et seront synchronisées quand Internet reviendra.
```

Operational rule:

> Staff should continue check-in while offline.

Offline is not failure if the offline pack was downloaded.

---

## 15. Manual Search Procedure

Manual search should be used when:

- Guest has no QR code
- QR code is unreadable
- Camera fails
- QR belongs to wrong wedding
- Guest screenshot is blurry
- Guest is elderly or not using smartphone

Search by:

- Full name
- Partial name
- Phone number where available

If multiple similar names appear:

- Ask guest to confirm phone number
- Check allowed guest count
- Ask which family/group invited them if needed
- Send to manual desk if uncertain

---

## 16. Exception Handling

Common exceptions:

- Guest not found
- QR already used
- Guest name misspelled
- Guest has more people than allowed
- VIP guest not on list
- Family member comes instead of invited guest
- Guest arrives without phone/QR

Recommended V1 process:

```text
Do not let normal staff create new guests during Event Mode.
Send exceptions to the organizer/manual desk.
```

Manual desk responsibilities:

- Decide whether guest may enter
- Record exception outside WedPass if necessary
- Inform organizer
- Avoid blocking main entrance

Future V1.1 can include an exception list, but V1 should keep check-in simple.

---

## 17. Duplicate Check-In Handling

If a guest is already checked in, staff should see:

```text
Already checked in at 18:42
```

French version:

```text
Déjà enregistré à 18:42
```

Staff should not override this during rush unless organizer approves manually.

If two devices check in the same guest offline, the server will reconcile later.

Operational rule:

> Do not argue with the system at the entrance. Move questionable cases to manual desk.

---

## 18. Staff Device Monitoring During Event

Organizer or lead staff should occasionally check:

- Devices still have battery
- Offline pack remains available
- Pending sync count is visible
- Staff understand offline status
- Check-in line is moving
- Manual search is being used correctly

Do not force constant syncing during heavy entrance traffic.

Priority during rush:

```text
Keep check-in moving.
```

Priority after rush:

```text
Sync all devices.
```

---

## 19. Media Upload During Event

Guests may upload photos/videos during the wedding.

Operational actions:

- Display upload QR poster
- Ask MC to announce upload link
- Share link in WhatsApp group
- Encourage short videos
- Remind guests that videos may take longer

If upload fails:

```text
Ask guests to retry later or after the event.
```

Media upload failure must never affect guest check-in.

---

# Part 3 — After the Wedding

## 20. Post-Event Sync Closeout

This is critical.

Before staff leave, each device should open the Sync Status screen.

The organizer should confirm:

```text
Device 1 — All synced
Device 2 — All synced
Device 3 — 0 pending
Device 4 — Last seen / pending checked
```

Do not mark event complete until all known devices are synced or accounted for.

Staff instruction:

```text
Do not clear browser data or close out the device until pending sync is 0.
```

French version:

```text
N’effacez pas les données du navigateur et ne quittez pas l’appareil tant que les éléments en attente ne sont pas à 0.
```

---

## 21. Final Check-In Review

After sync closeout, organizer reviews:

- Total guests
- Checked-in guests
- Pending/not checked-in guests
- Duplicate conflicts
- Staff device sync status
- Any manual exceptions

This is the moment to export or capture attendance results if needed.

---

## 22. Media Review

After the event, organizer reviews uploaded media.

Actions:

- View photos/videos
- Hide unwanted media
- Delete inappropriate media
- Download important items
- Decide whether public gallery remains active

Suggested post-event action:

```text
Share upload link again for guests who want to add photos/videos later.
```

---

## 23. Device Data Clearing

Only clear local staff data after:

- Pending sync count is zero
- Organizer confirms data is synced
- Event is complete

If there are unsynced items, clearing local data should be blocked or strongly discouraged.

---

## 24. Event Closeout

Closeout checklist:

```text
All devices synced
Final check-in count reviewed
Media uploaded and visible
Organizer feedback collected
Staff feedback collected if possible
Local staff device data cleared where appropriate
Event marked completed
```

---

# Part 4 — English and French Operations

## 25. Bilingual Beta Requirement

Because WedPass targets Central, East, and West Africa, the beta should support both:

```text
English
French
```

This does not necessarily mean every advanced screen must be perfectly localized from day one, but the core operational flows should be bilingual.

Priority bilingual areas:

1. Staff check-in screens
2. Offline/sync messages
3. Guest upload page
4. Guest gallery page
5. Event readiness checklist
6. Error and fallback messages
7. Staff training guide
8. Guest upload poster text
9. Beta onboarding messages

---

## 26. Bilingual Operational Terms

| English | French |
|---|---|
| Check In | Enregistrer l’arrivée |
| Guest | Invité |
| Guests | Invités |
| Offline Mode | Mode hors ligne |
| Sync Now | Synchroniser maintenant |
| Pending Sync | Synchronisation en attente |
| All Synced | Tout est synchronisé |
| Scan QR Code | Scanner le QR code |
| Search Guest | Rechercher un invité |
| Upload Photos/Videos | Ajouter des photos/vidéos |
| View Gallery | Voir la galerie |
| Event Mode | Mode événement |
| Offline Pack | Pack hors ligne |
| Guest List | Liste des invités |

---

## 27. Operational Success Criteria

A wedding operation is successful if:

- Staff devices were prepared before the event
- Check-in continued even if internet failed
- Manual search worked when QR failed
- No local check-in data was lost
- All devices synced after the event
- Organizer understood final stats
- Guests were able to upload media
- Organizer could review media
- Feedback was collected

---

## 28. Summary

WedPass operations should be designed around real wedding pressure.

The product succeeds operationally when:

> Staff can keep guests moving, organizers can trust the data, and guests can share memories without friction.

Technology alone is not enough. The product must guide people through the wedding-day process.
