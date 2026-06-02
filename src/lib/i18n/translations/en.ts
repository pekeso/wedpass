export const en = {
  // ── Scan page ────────────────────────────────────────────────────────────
  "scan.title": "Scan QR Code",
  "scan.hint": "Point the camera at a guest's QR code",
  "scan.cameraAccessDenied": "Camera access denied",
  "scan.cameraAccessDeniedDesc":
    "Allow camera access in your browser settings, then refresh this page.",
  "scan.qrNotRecognized": "QR code not recognized. Please use manual search.",
  "scan.cameraUnavailable": "Camera unavailable. Please use manual search.",
  "scan.searchManually": "Search guest manually",

  // ── Search page ───────────────────────────────────────────────────────────
  "search.title": "Find Guest",
  "search.placeholder": "Name or phone number...",
  "search.noGuestsFound": "No guests found",
  "search.noResultsFor": 'No results for "{query}"',
  "search.checkedIn": "Checked In",
  "search.notIn": "Not In",

  // ── Check-in page & guest card ────────────────────────────────────────────
  "checkin.title": "Check-In",
  "checkin.guestCheckinTitle": "Guest Check-In",
  "checkin.helpLink": "Help & emergency procedures",
  "checkin.guestNotFound": "Guest not found",
  "checkin.guestNotFoundDesc":
    "This guest was not found in the offline pack. Try downloading a fresh offline pack.",
  "checkin.backToCheckin": "Back to Check-In",
  "checkin.wrongGuest": "Wrong guest? Go back",
  "checkin.checkedInSuccessfully": "Checked in successfully",
  "checkin.alreadyCheckedIn": "Already checked in",
  "checkin.originallyCheckedIn": "Originally checked in at {time}",
  "checkin.nextGuest": "Next Guest",
  "checkin.noCheckins": "No check-ins yet. Scan a QR code or search for a guest.",
  "checkin.recentCheckins": "Recent Check-Ins",
  "checkin.loading": "Loading...",
  "checkin.unknownGuest": "Unknown Guest",

  // ── Guest card ────────────────────────────────────────────────────────────
  "guestCard.label": "Guest",
  "guestCard.singleGuest": "1 guest",
  "guestCard.guestCount": "{count} guests allowed",
  "guestCard.alreadyCheckedIn": "Already checked in",
  "guestCard.checkedInAt": "Checked in at {time}",
  "guestCard.checkInGuest": "Check In Guest",
  "guestCard.checkingIn": "Checking in...",

  // ── Download page ─────────────────────────────────────────────────────────
  "download.title": "Offline Pack",
  "download.prepareDevice": "Prepare this device for event-day check-in.",
  "download.downloadBefore": "Download this offline pack before guests arrive.",
  "download.readyForEventDay": "Ready for Event Day",
  "download.devicePrepared": "This device is prepared for offline check-in.",
  "download.offlinePackDownloaded": "Offline pack downloaded",
  "download.guestsLoaded": "Guests loaded",
  "download.lastDownloaded": "Last downloaded",
  "download.snapshotVersion": "Snapshot version",
  "download.unknown": "Unknown",
  "download.startCheckin": "Start Check-In",
  "download.redownloadPack": "Re-download Pack",
  "download.downloading": "Downloading...",
  "download.retryDownload": "Retry Download",
  "download.downloadOfflinePack": "Download Offline Pack",
  "download.viewHelpGuide": "View full staff help guide",
  "download.guestDataNote":
    "Guest data is stored on this device only. Keep this tab open during the event.",
  "download.guestCount": "{count} guests",
  "download.zeroGuests": "0 guests",

  // ── Offline pack status card ──────────────────────────────────────────────
  "offlinePack.ready": "Offline Pack Ready",
  "offlinePack.guestCount": "{count} guests loaded",
  "offlinePack.lastDownloaded": "Last downloaded: {time}",
  "offlinePack.downloading": "Downloading offline pack...",
  "offlinePack.savingGuestList":
    "Saving guest list to this device. Do not close this tab.",
  "offlinePack.downloadFailed": "Download failed",
  "offlinePack.downloadFailedDesc": "Check your connection and try again.",
  "offlinePack.notPrepared": "Not prepared",
  "offlinePack.noOfflineData": "This device has no offline guest data yet.",

  // ── Sync status bar ───────────────────────────────────────────────────────
  "syncBar.offlineWithCount": "Offline · {count} pending",
  "syncBar.offlineNone": "Offline · No pending",
  "syncBar.syncingWithCount": "Syncing · {count} pending",
  "syncBar.syncing": "Syncing...",
  "syncBar.failed": "Sync failed · Retrying",
  "syncBar.allSynced": "Online · All synced",
  "syncBar.syncedAt": "Synced {time}",

  // ── Sync page ─────────────────────────────────────────────────────────────
  "sync.title": "Sync Status",
  "sync.allSynced": "All check-ins are synced.",
  "sync.pendingCheckins": "Pending check-ins",
  "sync.lastSynced": "Last synced",
  "sync.never": "Never",
  "sync.connection": "Connection",
  "sync.online": "Online",
  "sync.offline": "Offline",
  "sync.syncNow": "Sync Now",
  "sync.syncing": "Syncing...",
  "sync.offlineModeActive":
    "Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.",
  "sync.syncFailed":
    "Sync failed. Your check-ins are still saved on this device. We will retry automatically.",
  "sync.clearLocalData": "Clear Local Event Data",
  "sync.clearLocalDataDesc":
    "Only clear after all check-ins have synced. This removes the offline guest list and check-in history from this device.",
  "sync.cannotClear":
    "Cannot clear: {count} unsynced check-in(s) remain. Sync first.",
  "sync.clearButton": "Clear Local Data",
  "sync.clearing": "Clearing...",
  "sync.clearDialogTitle": "Clear local event data?",
  "sync.clearDialogDesc":
    "This will remove the offline guest list and all synced check-in records from this device. This cannot be undone. Only continue if all check-ins have been synced.",
  "sync.yesClearData": "Yes, clear data",
  "sync.keepData": "Keep data",
  "sync.snapshotMismatch":
    "This device is using an outdated event snapshot. Please refresh the offline pack before continuing.",

  // ── Offline warning banner ────────────────────────────────────────────────
  "offlineBanner.message":
    "Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.",

  // ── Login page ────────────────────────────────────────────────────────────
  "login.title": "Staff Access",
  "login.description":
    "Enter the staff access token provided by the wedding organizer.",
  "login.tokenLabel": "Staff Access Token",
  "login.tokenPlaceholder": "Paste your staff token here",
  "login.tokenRequired": "Please enter a staff access token.",
  "login.tokenInvalid":
    "Invalid or expired staff token. Please check and try again.",
  "login.verifying": "Verifying...",
  "login.button": "Access Event Mode",
  "login.deviceNote":
    "This device will temporarily store guest check-in data for this wedding.",

  // ── Help page ─────────────────────────────────────────────────────────────
  "help.title": "Staff Help Guide",
  "help.description": "Emergency procedures and troubleshooting",
  "help.goldenRule": "The golden rule",
  "help.goldenStep1": "Scan or search the guest.",
  "help.goldenStep2": "Confirm the name.",
  "help.goldenStep3": "Tap Check In.",
  "help.goldenStep4": "Move to the next guest.",
  "help.goldenStep5": "If offline, continue — check-ins are saved.",
  "help.goldenStep6": "Before leaving, make sure pending sync is 0.",
  "help.ifSomethingWrong": "If something goes wrong",
  "help.qrDoesntWork": "QR scan does not work",
  "help.qrIssues": "Camera issues, blurry code, bad lighting",
  "help.qrFix1": "Tap Search Guest instead.",
  "help.qrFix2": "Type the guest's name or phone number.",
  "help.qrFix3": "Select the correct guest from the list.",
  "help.qrFix4": "Tap Check In Guest.",
  "help.internetOff": "Internet goes offline",
  "help.internetOff1": 'You will see an orange "Offline" bar at the top',
  "help.internetOff2": "Do not stop. Keep checking in guests.",
  "help.internetOff3": "Check-ins are saved safely on this device.",
  "help.internetOff4": "When internet returns, sync happens automatically.",
  "help.internetOff5": "Tap Sync Now on the Sync screen to force a sync.",
  "help.guestNotInList": "Guest is not in the list",
  "help.notFoundSearch": "Not found after searching by name",
  "help.notFoundFix1": "Try a shorter name or different spelling.",
  "help.notFoundFix2": "Search by phone number if available.",
  "help.notFoundFix3": "If still not found, send guest to the organizer desk.",
  "help.notFoundFix4": "Do not block the entrance — keep the line moving.",
  "help.deviceCrash": "Device crashes or battery dies",
  "help.deviceCrashRecovery": "You can recover using another device",
  "help.deviceCrashFix1": "Ask the organizer for another phone or tablet.",
  "help.deviceCrashFix2": "Log in using the same staff access token.",
  "help.deviceCrashFix3": "Download the offline pack on the new device.",
  "help.deviceCrashFix4": "Continue checking in guests normally.",
  "help.deviceCrashFix5":
    "Retrieve the original device later — it still has check-ins that need syncing.",
  "help.importantRules": "Very important rules",
  "help.doLabel": "Do:",
  "help.dontLabel": "Do not:",
  "help.do1": "Keep the entrance moving.",
  "help.do2": "Use manual search if QR fails.",
  "help.do3": "Continue if offline mode is active.",
  "help.do4": "Check Sync Status before leaving.",
  "help.do5": "Ask the organizer for exception cases.",
  "help.dont1": "Clear browser data.",
  "help.dont2": "Use private browsing mode.",
  "help.dont3": "Leave with pending sync count above 0.",
  "help.dont4": "Create new guests during Event Mode.",
  "help.dont5": "Panic when internet goes offline.",
  "help.dont6": "Spend too long on one problematic guest.",
  "help.beforeLeave": "Before you leave the wedding",
  "help.beforeLeave1": "Open the Sync screen.",
  "help.beforeLeave2": "Tap Sync Now and wait for it to complete.",
  "help.beforeLeave3": "Confirm that pending sync count is 0.",
  "help.beforeLeave4":
    "If it is not 0, do not close the app — inform the organizer.",
  "help.beforeLeave5": "Once at 0, you may leave.",
  "help.back": "Back",
  "help.goToCheckin": "Go to Check-In",

  // ── Staff help FAQ (inline accordion) ────────────────────────────────────
  "helpFAQ.q1": "What if QR scanning does not work?",
  "helpFAQ.a1": "Use Manual Search instead.",
  "helpFAQ.q1s1": "Tap Search Guest at the bottom of the scanner screen.",
  "helpFAQ.q1s2": "Type the guest's name or phone number.",
  "helpFAQ.q1s3": "Select the correct guest from the results.",
  "helpFAQ.q1s4": "Tap Check In Guest.",
  "helpFAQ.q2": "What if I lose internet?",
  "helpFAQ.a2":
    "Keep checking in. Your check-ins are saved on this device and will sync automatically when internet returns.",
  "helpFAQ.q2s1": 'You will see an orange "Offline" status bar at the top.',
  "helpFAQ.q2s2": "Continue scanning and checking in guests as normal.",
  "helpFAQ.q2s3": "When internet returns, check-ins sync automatically.",
  "helpFAQ.q2s4": "Tap Sync Now on the Sync screen to force a sync.",
  "helpFAQ.q3": "What if a guest is not in the list?",
  "helpFAQ.a3":
    "Try different search terms, then send the guest to the organizer if still not found.",
  "helpFAQ.q3s1": "Try a shorter version of their name.",
  "helpFAQ.q3s2": "Try searching by phone number.",
  "helpFAQ.q3s3": "Try alternate spellings.",
  "helpFAQ.q3s4": "If still not found, send the guest to the organizer or manual desk.",
  "helpFAQ.q3s5": "Do not block the entrance — keep the line moving.",
  "helpFAQ.q4": "What if my device crashes or runs out of battery?",
  "helpFAQ.a4":
    "Use another device. Your check-ins are not lost — they are tied to this device's staff token.",
  "helpFAQ.q4s1": "Ask the organizer for another phone or device.",
  "helpFAQ.q4s2": "Log in using the same staff access token.",
  "helpFAQ.q4s3": "Download the offline pack on the new device.",
  "helpFAQ.q4s4": "Continue checking in guests.",
  "helpFAQ.q4s5":
    "Retrieve the original device later — it still has local check-ins that need syncing.",
  "helpFAQ.title": "Help & Troubleshooting",

  // ── Guest-facing pages ────────────────────────────────────────────────────
  "guest.sharePhotos": "Share Your Photos & Videos",
  "guest.viewGallery": "View Gallery",
  "guest.privacyNote":
    "Your photos and videos are shared only with the couple and their guests.",
  "guest.upcomingMessage":
    "We can't wait to celebrate with you. See you soon!",
  "guest.pastMessage":
    "Thank you for celebrating with us. Share your favorite moments from the day.",

  // ── Upload page ───────────────────────────────────────────────────────────
  "upload.pageTitle": "Share Your Moments",
  "upload.pageSubtitle": "Upload photos and videos from {weddingName}",
  "upload.privacyNote":
    "Photos and videos are shared only with the couple and their guests.",
  "upload.selectFile": "Select a photo or video",
  "upload.unsupportedType":
    "Unsupported file type. Please upload a JPEG, PNG, or MP4 file.",
  "upload.photoTooLarge": "Image is too large. Maximum size is 10MB.",
  "upload.videoTooLarge": "Video is too large. Maximum size is 100MB.",
  "upload.tapToChoose": "Tap to choose a file",
  "upload.hint": "JPEG, PNG, or MP4 · Photos up to 10MB · Videos up to 100MB",
  "upload.offlineQueue":
    "You are offline. Your file will be saved and uploaded when you reconnect.",
  "upload.uploadingPhoto": "Uploading photo...",
  "upload.uploadingVideo": "Uploading video...",
  "upload.success": "Your photo/video was shared successfully. Thank you!",
  "upload.savedForLater":
    "Saved! Will upload automatically when you reconnect.",
  "upload.failedToSave": "Failed to save file for later upload.",
  "upload.failed": "Upload failed. Please try again.",
  "upload.shareAnother": "Share Another",
  "upload.shareButton": "Share Photo / Video",
  "upload.saveForLater": "Save for Upload Later",
  "upload.tryDifferent": "Try a different file",
  "upload.progress": "Uploading...",

  // ── Gallery page ──────────────────────────────────────────────────────────
  "gallery.title": "Wedding Gallery",
  "gallery.addPhotos": "Add Your Photos",
  "gallery.all": "All",
  "gallery.photos": "Photos",
  "gallery.videos": "Videos",
  "gallery.notAvailable": "Gallery not available",
  "gallery.notAvailableDesc":
    "The gallery for this wedding is not currently enabled.",
  "gallery.noPhotos": "No photos yet",
  "gallery.beFirst": "Be the first to share a moment from the wedding.",
  "gallery.beFistWithName":
    "Be the first to share a moment from {coupleNames}'s wedding.",
  "gallery.loading": "Loading…",
  "gallery.loadMore": "Load More",
  "gallery.playVideo": "Play video",
  "gallery.viewPhoto": "View photo",
  "gallery.close": "Close",

  // ── Common ────────────────────────────────────────────────────────────────
  "common.cancel": "Cancel",
} as const

export type TranslationKey = keyof typeof en
