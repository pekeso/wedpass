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
  "search.title": "Search Guest",
  "search.placeholder": "Name or phone…",
  "search.noGuestsFound": "No guests found",
  "search.noResultsFor": 'No results for "{query}"',
  "search.checkedIn": "Checked in",
  "search.notIn": "Not checked in",
  "search.allowed": "allowed",
  "search.resultCount": "{count} results",
  "search.notRightGuest": "Not the right guest?",
  "search.tryAnotherSpelling": "Try another spelling, or send the guest to the manual desk.",

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
  "checkin.eventMode": "Event Mode",
  "checkin.searchPlaceholder": "Search guest by name or phone",
  "checkin.syncStatus": "Sync status",
  "checkin.checkedInLabel": "Checked in",
  "checkin.synced": "Synced",
  "checkin.pending": "Pending",
  "checkin.qrVerified": "QR verified",
  "checkin.phoneEnding": "Phone ending",
  "checkin.peopleAllowed": "people allowed under this pass",
  "checkin.notYetCheckedIn": "Not yet checked in",
  "checkin.isIn": "{firstName} is in!",
  "checkin.savedLocally": "Saved on this device. Will sync when internet returns.",
  "checkin.continueScan": "Continue Scanning",
  "checkin.guests": "guests",

  // ── Guest card ────────────────────────────────────────────────────────────
  "guestCard.label": "Guest",
  "guestCard.singleGuest": "1 guest",
  "guestCard.guestCount": "{count} guests allowed",
  "guestCard.alreadyCheckedIn": "Already checked in",
  "guestCard.checkedInAt": "Checked in at {time}",
  "guestCard.checkInGuest": "Check In Guest",
  "guestCard.checkingIn": "Checking in...",

  // ── Download page ─────────────────────────────────────────────────────────
  "download.title": "Download Offline Pack",
  "download.prepareDevice": "Prepare this device for event-day check-in.",
  "download.eventMode": "Event Mode",
  "download.step": "Step 1 of 2 · Prepare device",
  "download.weddingLabel": "Wedding",
  "download.dateLabel": "Date",
  "download.guestsLabel": "Guests",
  "download.downloadBefore": "Do this before guests arrive.",
  "download.readyForEventDay": "Ready for Event Day",
  "download.devicePrepared": "This device is prepared for offline check-in.",
  "download.offlinePackDownloaded": "Offline pack downloaded",
  "download.guestsLoaded": "Guests loaded",
  "download.lastDownloaded": "Last downloaded",
  "download.snapshotVersion": "Snapshot",
  "download.unknown": "Unknown",
  "download.startCheckin": "Start Check-In",
  "download.redownloadPack": "Re-download pack",
  "download.downloading": "Downloading...",
  "download.retryDownload": "Retry Download",
  "download.downloadOfflinePack": "Download Offline Pack",
  "download.viewHelpGuide": "View full staff help guide",
  "download.guestDataNote":
    "Guest data is stored on this device only. Keep this tab open during the event.",
  "download.guestCount": "{count} guests",
  "download.zeroGuests": "0 guests",
  "download.canCheckinOffline": "This device can check in guests even without internet.",
  "download.downloadingPack": "Downloading offline pack…",
  "download.savingGuestList": "Saving guest list to this device. Do not close this tab.",

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
  "sync.savedLocally": "Saved locally",
  "sync.syncedToCloud": "Synced to cloud",
  "sync.pendingStat": "Pending",
  "sync.failedStat": "Failed",
  "sync.pendingSafeMessage": "Pending check-ins are safely saved on this device.",
  "sync.doNotClearWarning":
    "Do not clear browser data or leave with this device until pending sync is 0.",
  "sync.lastSuccessfulSync": "Last successful sync",
  "sync.back": "Back",

  // ── Offline warning banner ────────────────────────────────────────────────
  "offlineBanner.message":
    "Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.",

  // ── Login page ────────────────────────────────────────────────────────────
  "login.title": "Event Mode",
  "login.description":
    "Enter your staff access to begin checking in guests.",
  "login.tokenLabel": "Wedding access code",
  "login.tokenPlaceholder": "Enter your access code",
  "login.pinLabel": "Device PIN (optional)",
  "login.tokenRequired": "Please enter a staff access token.",
  "login.tokenInvalid":
    "Invalid or expired staff token. Please check and try again.",
  "login.verifying": "Verifying...",
  "login.button": "Enter Event Mode",
  "login.securityNote": "Staff access is limited & secure",
  "login.deviceNote":
    "This device will temporarily store guest check-in data for this wedding.",

  // ── Help page ─────────────────────────────────────────────────────────────
  "help.title": "Help & Emergency",
  "help.subtitle": "Quick fixes when something goes wrong at the door.",
  "help.qrScannerQ": "QR scanner not working?",
  "help.qrScannerA": "Use Search Guest and find them by name or phone.",
  "help.noQrQ": "Guest has no QR code?",
  "help.noQrA": "Search their name manually, then check them in.",
  "help.notFoundQ": "Guest not found?",
  "help.notFoundA": "Try another spelling, or send them to the manual desk.",
  "help.alreadyCheckedInQ": "Already checked in?",
  "help.alreadyCheckedInA": "Check the timestamp. If unsure, allow entry and note it.",
  "help.offlineQ": "Internet offline?",
  "help.offlineA": "Keep going. Check-ins are saved and sync automatically later.",
  "help.tooManyQ": "Too many people under one pass?",
  "help.tooManyA": "Allow the listed number. Send extras to the manual desk.",
  "help.back": "Back",
  "help.helpButton": "Help",

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
  "guest.wereGettingMarried": "We're getting married",
  "guest.poweredBy": "Powered by WedPass",
  "guest.sharePhotos": "Upload Photos / Videos",
  "guest.viewGallery": "View Gallery",
  "guest.privacyNote":
    "Your uploads are shared only with the couple and their guests.",
  "guest.upcomingMessage":
    "We can't wait to celebrate with you. See you soon!",
  "guest.pastMessage":
    '"Thank you for celebrating with us. Help us remember every moment — share the photos and videos you capture today."',

  // ── Upload page ───────────────────────────────────────────────────────────
  "upload.pageTitle": "Share your memories",
  "upload.pageSubtitle": "No account needed. Add as many as you like.",
  "upload.privacyNote":
    "Photos and videos are shared only with the couple and their guests.",
  "upload.fromGallery": "From gallery",
  "upload.takePhotoVideo": "Take photo / video",
  "upload.yourName": "Your name (optional)",
  "upload.guidelinePhotosVideos": "Photos and short videos only",
  "upload.guidelineVideosSlower": "Videos may take longer on slow connections",
  "upload.guidelineLargeRejected": "Very large videos may be rejected",
  "upload.yourUploads": "Your uploads",
  "upload.statusUploaded": "Uploaded",
  "upload.statusUploading": "Uploading…",
  "upload.statusPaused": "Paused · will retry",
  "upload.statusQueued": "Queued offline",
  "upload.statusFailed": "Failed · tap to retry",
  "upload.statusTooLarge": "Too large — shorter clip",
  "upload.addMore": "Add",
  "upload.viewGallery": "View Gallery",
  "upload.selectFile": "Select a photo or video",
  "upload.unsupportedType":
    "Unsupported file type. Please upload a JPEG, PNG, or MP4 file.",
  "upload.photoTooLarge": "Image is too large. Maximum size is 10MB.",
  "upload.videoTooLarge":
    "This video is too large. Please upload a shorter clip.",
  "upload.tapToChoose": "Tap to choose a file",
  "upload.hint": "JPEG, PNG, or MP4 · Photos up to 10MB · Videos up to 100MB",
  "upload.offlinePaused":
    "Upload paused. We'll retry when your connection improves.",
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
  "gallery.title": "Gallery",
  "gallery.add": "Add",
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
  "gallery.download": "Download",
  "gallery.tapToPlay": "Tap to play video",
  "gallery.previous": "Previous",
  "gallery.next": "Next",
  "gallery.sharedBy": "Shared by {name}",

  // ── Dashboard sidebar ─────────────────────────────────────────────────────
  "sidebar.dashboard": "Dashboard",
  "sidebar.readiness": "Readiness",
  "sidebar.guests": "Guests",
  "sidebar.qrCodes": "QR Codes",
  "sidebar.eventMode": "Event Mode",
  "sidebar.staffDevices": "Staff Devices",
  "sidebar.checkIns": "Check-Ins",
  "sidebar.syncCloseout": "Sync Closeout",
  "sidebar.memories": "Memories",
  "sidebar.settings": "Settings",
  "sidebar.organizerRole": "Organizer",

  // ── Dashboard header ──────────────────────────────────────────────────────
  "header.signOut": "Sign out",

  // ── QR pass card (printed artifact) ──────────────────────────────────────
  "pass.guestLabel": "Guest",
  "pass.seat": "Seat",
  "pass.allowedCount": "{count} allowed",
  "pass.scanAtEntrance": "Scan at entrance",

  // ── QR codes page ─────────────────────────────────────────────────────────
  "qrPage.title": "Passes & QR Codes",
  "qrPage.description": "Download, print, and hand out guest passes",
  "qrPage.passPreview": "Pass preview",
  "qrPage.customizeStyle": "Customize pass style",
  "qrPage.qrInfo": "QR codes are passes, not ID. They show the guest name and how many people are allowed — nothing more.",
  "qrPage.print": "Print",
  "qrPage.downloadThisPass": "Download this pass",
  "qrPage.allGuests": "All guests",
  "qrPage.downloadAll": "Download All QR Codes",
  "qrPage.downloadGuestPasses": "Download Guest Passes",
  "qrPage.noGuestsTitle": "No guests yet",
  "qrPage.noGuestsDesc": "Add guests to your wedding to generate QR codes and passes.",
  "qrPage.allowedCount": "{count} allowed",

  // ── Common ────────────────────────────────────────────────────────────────
  "common.back": "Back",
  "common.cancel": "Cancel",

  // ── Public navigation ─────────────────────────────────────────────────────
  "nav.howItWorks": "How it works",
  "nav.forStaff": "For staff",
  "nav.memories": "Memories",
  "nav.login": "Login",
  "nav.tagline": "Two halves, one pass.",

  // ── Organizer auth (login / register pages) ───────────────────────────────
  "auth.emailLabel": "Email",
  "auth.passwordLabel": "Password",
  "auth.fullNameLabel": "Full name",
  "auth.fullNamePlaceholder": "Your full name",
  "auth.passwordMinPlaceholder": "Min. 8 characters",
  "auth.forgotPassword": "Forgot password?",
  "auth.loginButton": "Login",
  "auth.signingIn": "Signing in…",
  "auth.createAccount": "Create account",
  "auth.creatingAccount": "Creating account…",
  "auth.newToWedPass": "New to WedPass?",
  "auth.alreadyHaveAccount": "Already have an account?",
  "auth.hidePassword": "Hide password",
  "auth.showPassword": "Show password",
  "auth.trust": "Your private wedding workspace",

  // ── Home / landing page ───────────────────────────────────────────────────
  "home.heroLine1": "Smart check-in that works",
  "home.heroLine2": "even when the wifi doesn't.",
  "home.heroDesc":
    "WedPass checks guests in by QR or name, keeps working offline, and collects every photo and video your guests capture — all in one calm system.",
  "home.joinBeta": "Join Free Beta",
  "home.featureOffline": "Offline-first",
  "home.featureBilingual": "Bilingual EN/FR",
  "home.featureNoAccounts": "No guest accounts",
  "home.howItWorksEyebrow": "How it works",
  "home.howItWorksHeading": "Three steps, one calm event",
  "home.step1Title": "1 — Build your list",
  "home.step1Desc":
    "Import guests, generate QR passes, and prepare staff phones — all before the day.",
  "home.step2Title": "2 — Check in fast",
  "home.step2Desc":
    "Staff scan QR or search by name. It keeps working offline and syncs when internet returns.",
  "home.step3Title": "3 — Keep the memories",
  "home.step3Desc":
    "Guests upload photos and videos to a beautiful gallery you fully control.",
  "home.benefit1Title": "Built for unreliable internet",
  "home.benefit1Desc":
    "Venues lose signal. WedPass doesn't lose check-ins — everything is saved on the device and syncs later.",
  "home.benefit2Title": "Calm under pressure",
  "home.benefit2Desc":
    "Big buttons, manual search fallback, and clear sync status so staff never feel lost at the door.",
  "home.benefit3Title": "Every memory, collected",
  "home.benefit3Desc":
    "Guests upload without an account. You moderate, hide, or share — you stay in control.",
  "home.whoItsForEyebrow": "Who it's for",
  "home.tagCouples": "Couples",
  "home.tagPlanners": "Wedding planners",
  "home.tagFamily": "Family organizers",
  "home.tagStaff": "Event staff",
  "home.ctaHeading": "Be one of our first weddings",
  "home.ctaDesc": "The beta is free. English and French supported from day one.",
} as const

export type TranslationKey = keyof typeof en
