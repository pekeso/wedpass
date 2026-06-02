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
  "search.title": "Trouver un invité",
  "search.placeholder": "Nom ou numéro de téléphone...",
  "search.noGuestsFound": "Aucun invité trouvé",
  "search.noResultsFor": 'Aucun résultat pour "{query}"',
  "search.checkedIn": "Enregistré",
  "search.notIn": "Non enregistré",

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

  // ── Guest card ────────────────────────────────────────────────────────────
  "guestCard.label": "Invité",
  "guestCard.singleGuest": "1 invité",
  "guestCard.guestCount": "{count} invités autorisés",
  "guestCard.alreadyCheckedIn": "Déjà enregistré",
  "guestCard.checkedInAt": "Enregistré à {time}",
  "guestCard.checkInGuest": "Enregistrer l'arrivée",
  "guestCard.checkingIn": "Enregistrement en cours...",

  // ── Download page ─────────────────────────────────────────────────────────
  "download.title": "Pack hors ligne",
  "download.prepareDevice": "Préparez cet appareil pour l'enregistrement le jour J.",
  "download.downloadBefore":
    "Téléchargez ce pack hors ligne avant l'arrivée des invités.",
  "download.readyForEventDay": "Prêt pour le jour J",
  "download.devicePrepared":
    "Cet appareil est prêt pour l'enregistrement hors ligne.",
  "download.offlinePackDownloaded": "Pack hors ligne téléchargé",
  "download.guestsLoaded": "Invités chargés",
  "download.lastDownloaded": "Dernier téléchargement",
  "download.snapshotVersion": "Version de l'instantané",
  "download.unknown": "Inconnu",
  "download.startCheckin": "Commencer l'enregistrement",
  "download.redownloadPack": "Re-télécharger le pack",
  "download.downloading": "Téléchargement en cours...",
  "download.retryDownload": "Réessayer le téléchargement",
  "download.downloadOfflinePack": "Télécharger le pack hors ligne",
  "download.viewHelpGuide": "Voir le guide d'aide complet",
  "download.guestDataNote":
    "Les données des invités sont stockées uniquement sur cet appareil. Gardez cet onglet ouvert pendant l'événement.",
  "download.guestCount": "{count} invités",
  "download.zeroGuests": "0 invités",

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

  // ── Offline warning banner ────────────────────────────────────────────────
  "offlineBanner.message":
    "Mode hors ligne actif. Les présences sont enregistrées sur cet appareil et seront synchronisées quand Internet reviendra.",

  // ── Login page ────────────────────────────────────────────────────────────
  "login.title": "Accès du personnel",
  "login.description":
    "Entrez le code d'accès du personnel fourni par l'organisateur du mariage.",
  "login.tokenLabel": "Code d'accès du personnel",
  "login.tokenPlaceholder": "Collez votre code d'accès ici",
  "login.tokenRequired": "Veuillez entrer un code d'accès du personnel.",
  "login.tokenInvalid":
    "Code d'accès invalide ou expiré. Veuillez vérifier et réessayer.",
  "login.verifying": "Vérification...",
  "login.button": "Accéder au Mode événement",
  "login.deviceNote":
    "Cet appareil stockera temporairement les données d'enregistrement des invités.",

  // ── Help page ─────────────────────────────────────────────────────────────
  "help.title": "Guide d'aide du personnel",
  "help.description": "Procédures d'urgence et dépannage",
  "help.goldenRule": "La règle d'or",
  "help.goldenStep1": "Scanner ou rechercher l'invité.",
  "help.goldenStep2": "Confirmer le nom.",
  "help.goldenStep3": "Appuyer sur Enregistrer l'arrivée.",
  "help.goldenStep4": "Passer à l'invité suivant.",
  "help.goldenStep5":
    "Si hors ligne, continuer — les présences sont sauvegardées.",
  "help.goldenStep6":
    "Avant de partir, vérifiez que les éléments en attente sont à 0.",
  "help.ifSomethingWrong": "En cas de problème",
  "help.qrDoesntWork": "Le scan QR ne fonctionne pas",
  "help.qrIssues": "Problème de caméra, QR flou, mauvaise lumière",
  "help.qrFix1": "Appuyez sur Rechercher un invité.",
  "help.qrFix2": "Tapez le nom ou le numéro de téléphone.",
  "help.qrFix3": "Sélectionnez le bon invité dans la liste.",
  "help.qrFix4": "Appuyez sur Enregistrer l'arrivée.",
  "help.internetOff": "Internet ne fonctionne plus",
  "help.internetOff1":
    "Vous verrez une barre orange « Hors ligne » en haut",
  "help.internetOff2": "Ne vous arrêtez pas. Continuez à enregistrer les invités.",
  "help.internetOff3": "Les présences sont sauvegardées sur cet appareil.",
  "help.internetOff4":
    "La synchronisation se fait automatiquement quand Internet revient.",
  "help.internetOff5":
    "Appuyez sur Synchroniser maintenant pour forcer la synchronisation.",
  "help.guestNotInList": "L'invité n'est pas dans la liste",
  "help.notFoundSearch": "Introuvable après recherche par nom",
  "help.notFoundFix1": "Essayez un nom plus court ou une autre orthographe.",
  "help.notFoundFix2": "Recherchez par numéro de téléphone si disponible.",
  "help.notFoundFix3":
    "Si toujours introuvable, envoyez l'invité au bureau de l'organisateur.",
  "help.notFoundFix4": "Ne bloquez pas l'entrée — gardez la file fluide.",
  "help.deviceCrash": "L'appareil tombe en panne ou la batterie est vide",
  "help.deviceCrashRecovery": "Vous pouvez récupérer avec un autre appareil",
  "help.deviceCrashFix1": "Demandez un autre téléphone ou appareil à l'organisateur.",
  "help.deviceCrashFix2": "Connectez-vous avec le même code d'accès.",
  "help.deviceCrashFix3": "Téléchargez le pack hors ligne sur le nouvel appareil.",
  "help.deviceCrashFix4": "Continuez à enregistrer les invités normalement.",
  "help.deviceCrashFix5":
    "Récupérez l'appareil d'origine plus tard pour synchroniser ses présences.",
  "help.importantRules": "Règles très importantes",
  "help.doLabel": "À faire :",
  "help.dontLabel": "À ne pas faire :",
  "help.do1": "Garder l'entrée fluide.",
  "help.do2": "Utiliser la recherche manuelle si le QR échoue.",
  "help.do3": "Continuer si le mode hors ligne est actif.",
  "help.do4": "Vérifier la synchronisation avant de partir.",
  "help.do5": "Demander à l'organisateur pour les cas exceptionnels.",
  "help.dont1": "Effacer les données du navigateur.",
  "help.dont2": "Utiliser le mode navigation privée.",
  "help.dont3": "Partir avec des synchronisations en attente.",
  "help.dont4": "Créer de nouveaux invités pendant le Mode événement.",
  "help.dont5": "Paniquer si Internet se coupe.",
  "help.dont6": "Passer trop de temps sur un invité problématique.",
  "help.beforeLeave": "Avant de quitter le mariage",
  "help.beforeLeave1": "Ouvrez l'écran de synchronisation.",
  "help.beforeLeave2":
    "Appuyez sur Synchroniser maintenant et attendez la fin.",
  "help.beforeLeave3": "Confirmez que les éléments en attente sont à 0.",
  "help.beforeLeave4":
    "S'ils ne sont pas à 0, ne fermez pas l'application — informez l'organisateur.",
  "help.beforeLeave5": "Une fois à 0, vous pouvez partir.",
  "help.back": "Retour",
  "help.goToCheckin": "Aller à l'enregistrement",

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
  "guest.sharePhotos": "Partagez vos photos et vidéos",
  "guest.viewGallery": "Voir la galerie",
  "guest.privacyNote":
    "Vos photos et vidéos sont partagées uniquement avec les mariés et leurs invités.",
  "guest.upcomingMessage":
    "Nous avons hâte de célébrer avec vous. À très bientôt !",
  "guest.pastMessage":
    "Merci d'avoir célébré avec nous. Partagez vos meilleurs moments de la journée.",

  // ── Upload page ───────────────────────────────────────────────────────────
  "upload.pageTitle": "Partagez vos moments",
  "upload.pageSubtitle": "Téléchargez photos et vidéos de {weddingName}",
  "upload.privacyNote":
    "Photos et vidéos partagées uniquement avec les mariés et leurs invités.",
  "upload.selectFile": "Sélectionnez une photo ou une vidéo",
  "upload.unsupportedType":
    "Type de fichier non pris en charge. Veuillez télécharger un fichier JPEG, PNG ou MP4.",
  "upload.photoTooLarge": "Image trop grande. Taille maximale : 10 Mo.",
  "upload.videoTooLarge": "Vidéo trop grande. Taille maximale : 100 Mo.",
  "upload.tapToChoose": "Appuyez pour choisir un fichier",
  "upload.hint": "JPEG, PNG ou MP4 · Photos jusqu'à 10 Mo · Vidéos jusqu'à 100 Mo",
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
  "gallery.title": "Galerie du mariage",
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

  // ── Common ────────────────────────────────────────────────────────────────
  "common.cancel": "Annuler",
}
