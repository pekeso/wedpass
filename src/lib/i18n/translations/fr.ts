import type { TranslationKey } from "./en"

export const fr: Record<TranslationKey, string> = {
  // ── Scan page ────────────────────────────────────────────────────────────
  "scan.title": "Scanner le QR code",
  "scan.hint": "Pointez la caméra sur le QR code de l'invité",
  "scan.cameraAccessDenied": "Accès caméra refusé",
  "scan.cameraAccessDeniedDesc":
    "Autorisez l'accès à la caméra dans les paramètres de votre navigateur, puis rafraîchissez la page.",
  "scan.qrNotRecognized":
    "QR code non reconnu. Veuillez utiliser la recherche manuelle.",
  "scan.cameraUnavailable":
    "Caméra indisponible. Veuillez utiliser la recherche manuelle.",
  "scan.searchManually": "Rechercher un invité manuellement",

  // ── Search page ───────────────────────────────────────────────────────────
  "search.title": "Rechercher un invité",
  "search.placeholder": "Nom ou téléphone…",
  "search.noGuestsFound": "Aucun invité trouvé",
  "search.noResultsFor": 'Aucun résultat pour "{query}"',
  "search.checkedIn": "Enregistré",
  "search.notIn": "Pas enregistré",
  "search.allowed": "autorisés",
  "search.resultCount": "{count} résultats",
  "search.notRightGuest": "Pas le bon invité ?",
  "search.tryAnotherSpelling": "Essayez une autre orthographe ou envoyez l'invité au bureau manuel.",

  // ── Check-in page & guest card ────────────────────────────────────────────
  "checkin.title": "Enregistrement",
  "checkin.guestCheckinTitle": "Enregistrement de l'invité",
  "checkin.helpLink": "Aide & procédures d'urgence",
  "checkin.guestNotFound": "Invité introuvable",
  "checkin.guestNotFoundDesc":
    "Cet invité n'a pas été trouvé dans le pack hors ligne. Essayez de télécharger un nouveau pack hors ligne.",
  "checkin.backToCheckin": "Retour à l'enregistrement",
  "checkin.wrongGuest": "Mauvais invité ? Revenir",
  "checkin.checkedInSuccessfully": "Arrivée enregistrée avec succès",
  "checkin.alreadyCheckedIn": "Déjà enregistré",
  "checkin.originallyCheckedIn": "Initialement enregistré à {time}",
  "checkin.nextGuest": "Invité suivant",
  "checkin.noCheckins":
    "Aucun enregistrement pour l'instant. Scannez un QR code ou recherchez un invité.",
  "checkin.recentCheckins": "Enregistrements récents",
  "checkin.loading": "Chargement...",
  "checkin.unknownGuest": "Invité inconnu",
  "checkin.eventMode": "Mode Événement",
  "checkin.searchPlaceholder": "Rechercher par nom ou téléphone",
  "checkin.syncStatus": "État de synchro",
  "checkin.checkedInLabel": "Enregistrés",
  "checkin.synced": "Synchronisé",
  "checkin.pending": "En attente",
  "checkin.qrVerified": "QR vérifié",
  "checkin.phoneEnding": "Tél.",
  "checkin.peopleAllowed": "personnes autorisées",
  "checkin.notYetCheckedIn": "Pas encore enregistré",
  "checkin.isIn": "{firstName} est entré·e !",
  "checkin.savedLocally": "Enregistré sur cet appareil. La synchronisation se fera quand Internet reviendra.",
  "checkin.continueScan": "Continuer à scanner",
  "checkin.guests": "invités",

  // ── Guest card ────────────────────────────────────────────────────────────
  "guestCard.label": "Invité",
  "guestCard.singleGuest": "1 invité",
  "guestCard.guestCount": "{count} invités autorisés",
  "guestCard.alreadyCheckedIn": "Déjà enregistré",
  "guestCard.checkedInAt": "Enregistré à {time}",
  "guestCard.checkInGuest": "Enregistrer l'arrivée",
  "guestCard.checkingIn": "Enregistrement en cours...",

  // ── Download page ─────────────────────────────────────────────────────────
  "download.title": "Télécharger le pack hors ligne",
  "download.prepareDevice": "Préparez cet appareil pour l'enregistrement le jour J.",
  "download.eventMode": "Mode Événement",
  "download.step": "Étape 1 sur 2 · Préparer l'appareil",
  "download.weddingLabel": "Mariage",
  "download.dateLabel": "Date",
  "download.guestsLabel": "Invités",
  "download.downloadBefore": "Faites ceci avant l'arrivée des invités.",
  "download.readyForEventDay": "Prêt pour le jour J",
  "download.devicePrepared":
    "Cet appareil est prêt pour l'enregistrement hors ligne.",
  "download.offlinePackDownloaded": "Pack hors ligne téléchargé",
  "download.guestsLoaded": "Invités chargés",
  "download.lastDownloaded": "Dernier téléchargement",
  "download.snapshotVersion": "Version",
  "download.unknown": "Inconnu",
  "download.startCheckin": "Commencer l'enregistrement",
  "download.redownloadPack": "Retélécharger le pack",
  "download.downloading": "Téléchargement en cours...",
  "download.retryDownload": "Réessayer le téléchargement",
  "download.downloadOfflinePack": "Télécharger le pack hors ligne",
  "download.viewHelpGuide": "Voir le guide d'aide complet",
  "download.guestDataNote":
    "Les données des invités sont stockées uniquement sur cet appareil. Gardez cet onglet ouvert pendant l'événement.",
  "download.guestCount": "{count} invités",
  "download.zeroGuests": "0 invités",
  "download.canCheckinOffline": "Cet appareil peut enregistrer les invités même sans Internet.",
  "download.downloadingPack": "Téléchargement du pack hors ligne…",
  "download.savingGuestList": "Sauvegarde de la liste des invités sur cet appareil. Ne fermez pas cet onglet.",

  // ── Offline pack status card ──────────────────────────────────────────────
  "offlinePack.ready": "Pack hors ligne prêt",
  "offlinePack.guestCount": "{count} invités chargés",
  "offlinePack.lastDownloaded": "Dernier téléchargement : {time}",
  "offlinePack.downloading": "Téléchargement du pack hors ligne...",
  "offlinePack.savingGuestList":
    "Sauvegarde de la liste des invités sur cet appareil. Ne fermez pas cet onglet.",
  "offlinePack.downloadFailed": "Échec du téléchargement",
  "offlinePack.downloadFailedDesc":
    "Vérifiez votre connexion et réessayez.",
  "offlinePack.notPrepared": "Non préparé",
  "offlinePack.noOfflineData":
    "Cet appareil n'a pas encore de données d'invités hors ligne.",

  // ── Sync status bar ───────────────────────────────────────────────────────
  "syncBar.offlineWithCount": "Hors ligne · {count} en attente",
  "syncBar.offlineNone": "Hors ligne · Aucune attente",
  "syncBar.syncingWithCount": "Sync · {count} en attente",
  "syncBar.syncing": "Synchronisation...",
  "syncBar.failed": "Échec sync · Nouvelle tentative",
  "syncBar.allSynced": "En ligne · Tout synchronisé",
  "syncBar.syncedAt": "Synchronisé {time}",

  // ── Sync page ─────────────────────────────────────────────────────────────
  "sync.title": "État de la synchronisation",
  "sync.allSynced": "Tous les enregistrements sont synchronisés.",
  "sync.pendingCheckins": "Enregistrements en attente",
  "sync.lastSynced": "Dernière synchronisation",
  "sync.never": "Jamais",
  "sync.connection": "Connexion",
  "sync.online": "En ligne",
  "sync.offline": "Hors ligne",
  "sync.syncNow": "Synchroniser maintenant",
  "sync.syncing": "Synchronisation...",
  "sync.offlineModeActive":
    "Mode hors ligne actif. Les présences sont enregistrées sur cet appareil et seront synchronisées quand Internet reviendra.",
  "sync.syncFailed":
    "Échec de la synchronisation. Vos enregistrements sont toujours sauvegardés sur cet appareil. Nous réessaierons automatiquement.",
  "sync.clearLocalData": "Effacer les données locales",
  "sync.clearLocalDataDesc":
    "Effacez uniquement après que tous les enregistrements ont été synchronisés. Cela supprime la liste des invités et l'historique hors ligne.",
  "sync.cannotClear":
    "Impossible d'effacer : {count} enregistrement(s) non synchronisé(s). Synchronisez d'abord.",
  "sync.clearButton": "Effacer les données locales",
  "sync.clearing": "Effacement...",
  "sync.clearDialogTitle": "Effacer les données locales ?",
  "sync.clearDialogDesc":
    "Cela supprimera la liste des invités et tous les enregistrements synchronisés de cet appareil. Cette action est irréversible. Continuez uniquement si tous les enregistrements ont été synchronisés.",
  "sync.yesClearData": "Oui, effacer",
  "sync.keepData": "Conserver les données",
  "sync.snapshotMismatch":
    "Cet appareil utilise un instantané d'événement obsolète. Veuillez rafraîchir le pack hors ligne avant de continuer.",
  "sync.savedLocally": "Enregistrées",
  "sync.syncedToCloud": "Synchronisées",
  "sync.pendingStat": "En attente",
  "sync.failedStat": "Échecs",
  "sync.pendingSafeMessage": "Les présences en attente sont enregistrées en sécurité sur cet appareil.",
  "sync.doNotClearWarning":
    "N'effacez pas les données du navigateur et ne partez pas avec cet appareil tant que les éléments en attente ne sont pas à 0.",
  "sync.lastSuccessfulSync": "Dernière synchro réussie",
  "sync.back": "Retour",

  // ── Offline warning banner ────────────────────────────────────────────────
  "offlineBanner.message":
    "Mode hors ligne actif. Les présences sont enregistrées sur cet appareil et seront synchronisées quand Internet reviendra.",

  // ── Login page ────────────────────────────────────────────────────────────
  "login.title": "Mode événement",
  "login.description":
    "Entrez votre accès personnel pour commencer à enregistrer les invités.",
  "login.tokenLabel": "Code d'accès",
  "login.tokenPlaceholder": "Entrez votre code d'accès",
  "login.pinLabel": "Code PIN (facultatif)",
  "login.tokenRequired": "Veuillez entrer un code d'accès du personnel.",
  "login.tokenInvalid":
    "Code d'accès invalide ou expiré. Veuillez vérifier et réessayer.",
  "login.verifying": "Vérification...",
  "login.button": "Entrer en mode événement",
  "login.securityNote": "Accès limité et sécurisé",
  "login.deviceNote":
    "Cet appareil stockera temporairement les données d'enregistrement des invités.",

  // ── Help page ─────────────────────────────────────────────────────────────
  "help.title": "Aide & urgence",
  "help.subtitle": "Solutions rapides en cas de problème à l'entrée.",
  "help.qrScannerQ": "Scanner en panne ?",
  "help.qrScannerA": "Utilisez la recherche par nom ou téléphone.",
  "help.noQrQ": "L'invité n'a pas de QR ?",
  "help.noQrA": "Recherchez leur nom, puis enregistrez-les.",
  "help.notFoundQ": "Invité introuvable ?",
  "help.notFoundA": "Essayez une autre orthographe ou envoyez-le au bureau manuel.",
  "help.alreadyCheckedInQ": "Déjà enregistré ?",
  "help.alreadyCheckedInA": "Vérifiez l'heure. En cas de doute, laissez entrer.",
  "help.offlineQ": "Hors ligne ?",
  "help.offlineA": "Continuez. Les présences sont enregistrées et synchronisées plus tard.",
  "help.tooManyQ": "Trop de personnes sur un pass ?",
  "help.tooManyA": "Autorisez le nombre indiqué. Envoyez les autres au bureau manuel.",
  "help.back": "Retour",
  "help.helpButton": "Aide",

  // ── Staff help FAQ (inline accordion) ────────────────────────────────────
  "helpFAQ.q1": "Que faire si le scan QR ne fonctionne pas ?",
  "helpFAQ.a1": "Utilisez la recherche manuelle.",
  "helpFAQ.q1s1": "Appuyez sur Rechercher un invité en bas de l'écran.",
  "helpFAQ.q1s2": "Tapez le nom ou le numéro de téléphone.",
  "helpFAQ.q1s3": "Sélectionnez le bon invité dans les résultats.",
  "helpFAQ.q1s4": "Appuyez sur Enregistrer l'arrivée.",
  "helpFAQ.q2": "Que faire si je perds Internet ?",
  "helpFAQ.a2":
    "Continuez l'enregistrement. Les présences sont sauvegardées sur cet appareil et se synchroniseront automatiquement quand Internet reviendra.",
  "helpFAQ.q2s1":
    "Vous verrez une barre de statut orange « Hors ligne » en haut.",
  "helpFAQ.q2s2": "Continuez à scanner et enregistrer les invités normalement.",
  "helpFAQ.q2s3":
    "Quand Internet revient, les présences se synchronisent automatiquement.",
  "helpFAQ.q2s4":
    "Appuyez sur Synchroniser maintenant pour forcer la synchronisation.",
  "helpFAQ.q3": "Que faire si un invité n'est pas dans la liste ?",
  "helpFAQ.a3":
    "Essayez d'autres termes de recherche, puis envoyez l'invité à l'organisateur si toujours introuvable.",
  "helpFAQ.q3s1": "Essayez une version plus courte du nom.",
  "helpFAQ.q3s2": "Essayez de rechercher par numéro de téléphone.",
  "helpFAQ.q3s3": "Essayez d'autres orthographes.",
  "helpFAQ.q3s4":
    "Si toujours introuvable, envoyez l'invité à l'organisateur ou au bureau manuel.",
  "helpFAQ.q3s5": "Ne bloquez pas l'entrée — gardez la file fluide.",
  "helpFAQ.q4": "Que faire si mon appareil tombe en panne ?",
  "helpFAQ.a4":
    "Utilisez un autre appareil. Vos enregistrements ne sont pas perdus — ils sont liés au code d'accès de cet appareil.",
  "helpFAQ.q4s1": "Demandez un autre téléphone ou appareil à l'organisateur.",
  "helpFAQ.q4s2": "Connectez-vous avec le même code d'accès.",
  "helpFAQ.q4s3": "Téléchargez le pack hors ligne sur le nouvel appareil.",
  "helpFAQ.q4s4": "Continuez à enregistrer les invités.",
  "helpFAQ.q4s5":
    "Récupérez l'appareil d'origine plus tard — il a encore des enregistrements locaux à synchroniser.",
  "helpFAQ.title": "Aide & Dépannage",

  // ── Guest-facing pages ────────────────────────────────────────────────────
  "guest.wereGettingMarried": "Nous nous marions",
  "guest.poweredBy": "Propulsé par WedPass",
  "guest.sharePhotos": "Ajouter des photos / vidéos",
  "guest.viewGallery": "Voir la galerie",
  "guest.privacyNote":
    "Vos ajouts sont partagés uniquement avec les mariés et leurs invités.",
  "guest.upcomingMessage":
    "Nous avons hâte de célébrer avec vous. À très bientôt !",
  "guest.pastMessage":
    '« Merci de célébrer avec nous. Aidez-nous à garder chaque instant — partagez vos photos et vidéos. »',

  // ── Upload page ───────────────────────────────────────────────────────────
  "upload.pageTitle": "Partagez vos souvenirs",
  "upload.pageSubtitle": "Aucun compte requis. Ajoutez-en autant que vous voulez.",
  "upload.privacyNote":
    "Photos et vidéos partagées uniquement avec les mariés et leurs invités.",
  "upload.fromGallery": "Depuis la galerie",
  "upload.takePhotoVideo": "Prendre une photo",
  "upload.yourName": "Votre nom (facultatif)",
  "upload.guidelinePhotosVideos": "Photos et courtes vidéos uniquement",
  "upload.guidelineVideosSlower": "Les vidéos peuvent être plus longues",
  "upload.guidelineLargeRejected": "Les très grandes vidéos peuvent être refusées",
  "upload.yourUploads": "Vos ajouts",
  "upload.statusUploaded": "Ajouté",
  "upload.statusUploading": "Téléversement…",
  "upload.statusPaused": "En pause · réessai",
  "upload.statusQueued": "En file hors ligne",
  "upload.statusFailed": "Échec · réessayer",
  "upload.statusTooLarge": "Trop volumineux",
  "upload.addMore": "Ajouter",
  "upload.viewGallery": "Galerie",
  "upload.selectFile": "Sélectionnez une photo ou une vidéo",
  "upload.unsupportedType":
    "Type de fichier non pris en charge. Veuillez télécharger un fichier JPEG, PNG ou MP4.",
  "upload.photoTooLarge": "Image trop grande. Taille maximale : 10 Mo.",
  "upload.videoTooLarge":
    "Cette vidéo est trop volumineuse. Veuillez ajouter une vidéo plus courte.",
  "upload.tapToChoose": "Appuyez pour choisir un fichier",
  "upload.hint": "JPEG, PNG ou MP4 · Photos jusqu'à 10 Mo · Vidéos jusqu'à 100 Mo",
  "upload.offlinePaused":
    "Téléversement en pause. Nous réessayerons lorsque la connexion s'améliorera.",
  "upload.offlineQueue":
    "Vous êtes hors ligne. Votre fichier sera sauvegardé et téléchargé quand vous vous reconnecterez.",
  "upload.uploadingPhoto": "Téléchargement de la photo...",
  "upload.uploadingVideo": "Téléchargement de la vidéo...",
  "upload.success": "Votre photo/vidéo a été partagée avec succès. Merci !",
  "upload.savedForLater":
    "Sauvegardé ! Le téléchargement se fera automatiquement quand vous vous reconnecterez.",
  "upload.failedToSave": "Échec de la sauvegarde pour téléchargement ultérieur.",
  "upload.failed": "Échec du téléchargement. Veuillez réessayer.",
  "upload.shareAnother": "Partager une autre",
  "upload.shareButton": "Partager une photo / vidéo",
  "upload.saveForLater": "Sauvegarder pour plus tard",
  "upload.tryDifferent": "Essayer un autre fichier",
  "upload.progress": "Téléchargement...",

  // ── Gallery page ──────────────────────────────────────────────────────────
  "gallery.title": "Galerie",
  "gallery.add": "Ajouter",
  "gallery.addPhotos": "Ajouter vos photos",
  "gallery.all": "Tout",
  "gallery.photos": "Photos",
  "gallery.videos": "Vidéos",
  "gallery.notAvailable": "Galerie non disponible",
  "gallery.notAvailableDesc":
    "La galerie de ce mariage n'est pas activée pour le moment.",
  "gallery.noPhotos": "Aucune photo pour l'instant",
  "gallery.beFirst": "Soyez le premier à partager un moment du mariage.",
  "gallery.beFistWithName":
    "Soyez le premier à partager un moment du mariage de {coupleNames}.",
  "gallery.loading": "Chargement…",
  "gallery.loadMore": "Charger plus",
  "gallery.playVideo": "Lire la vidéo",
  "gallery.viewPhoto": "Voir la photo",
  "gallery.close": "Fermer",
  "gallery.download": "Télécharger",
  "gallery.tapToPlay": "Toucher pour lire",
  "gallery.previous": "Précédent",
  "gallery.next": "Suivant",
  "gallery.sharedBy": "Partagé par {name}",

  // ── Common ────────────────────────────────────────────────────────────────
  "common.back": "Retour",
  "common.cancel": "Annuler",

  // ── Public navigation ─────────────────────────────────────────────────────
  "nav.howItWorks": "Comment ça marche",
  "nav.forStaff": "Pour le personnel",
  "nav.memories": "Souvenirs",
  "nav.login": "Connexion",
  "nav.tagline": "Deux moitiés, un seul pass.",

  // ── Organizer auth (login / register pages) ───────────────────────────────
  "auth.emailLabel": "E-mail",
  "auth.passwordLabel": "Mot de passe",
  "auth.fullNameLabel": "Nom complet",
  "auth.fullNamePlaceholder": "Votre nom complet",
  "auth.passwordMinPlaceholder": "8 caractères min.",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "auth.loginButton": "Connexion",
  "auth.signingIn": "Connexion en cours…",
  "auth.createAccount": "Créer un compte",
  "auth.creatingAccount": "Création du compte…",
  "auth.newToWedPass": "Nouveau sur WedPass ?",
  "auth.alreadyHaveAccount": "Vous avez déjà un compte ?",
  "auth.hidePassword": "Masquer le mot de passe",
  "auth.showPassword": "Afficher le mot de passe",
  "auth.trust": "Votre espace mariage privé",

  // ── Home / landing page ───────────────────────────────────────────────────
  "home.heroLine1": "Un enregistrement intelligent qui fonctionne",
  "home.heroLine2": "même sans wifi.",
  "home.heroDesc":
    "WedPass enregistre les invités par QR ou par nom, continue à fonctionner hors ligne, et collecte chaque photo et vidéo de vos invités — dans un système calme et unique.",
  "home.joinBeta": "Rejoindre la bêta gratuite",
  "home.featureOffline": "Hors ligne d'abord",
  "home.featureBilingual": "Bilingue FR/EN",
  "home.featureNoAccounts": "Pas de compte requis",
  "home.howItWorksEyebrow": "Comment ça marche",
  "home.howItWorksHeading": "Trois étapes, un événement serein",
  "home.step1Title": "1 — Préparez votre liste",
  "home.step1Desc":
    "Importez les invités, générez des passes QR et préparez les téléphones du personnel — tout avant le jour J.",
  "home.step2Title": "2 — Enregistrez rapidement",
  "home.step2Desc":
    "Le personnel scanne le QR ou recherche par nom. Ça marche hors ligne et se synchronise au retour d'Internet.",
  "home.step3Title": "3 — Gardez les souvenirs",
  "home.step3Desc":
    "Les invités partagent photos et vidéos dans une galerie que vous contrôlez entièrement.",
  "home.benefit1Title": "Conçu pour les connexions instables",
  "home.benefit1Desc":
    "Les salles perdent le signal. WedPass ne perd pas les enregistrements — tout est sauvegardé sur l'appareil et synchronisé plus tard.",
  "home.benefit2Title": "Calme sous pression",
  "home.benefit2Desc":
    "Grands boutons, recherche manuelle de secours et statut de synchronisation clair pour que le personnel ne soit jamais perdu à l'entrée.",
  "home.benefit3Title": "Chaque souvenir, collecté",
  "home.benefit3Desc":
    "Les invités partagent sans compte. Vous modérez, masquez ou partagez — vous restez maître.",
  "home.whoItsForEyebrow": "Pour qui",
  "home.tagCouples": "Couples",
  "home.tagPlanners": "Organisateurs de mariage",
  "home.tagFamily": "Organisateurs familiaux",
  "home.tagStaff": "Personnel d'événement",
  "home.ctaHeading": "Soyez parmi nos premiers mariages",
  "home.ctaDesc": "La bêta est gratuite. Anglais et français disponibles dès le premier jour.",
}
