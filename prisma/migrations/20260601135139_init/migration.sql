-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ORGANIZER');

-- CreateEnum
CREATE TYPE "WeddingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EVENT_MODE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADED', 'APPROVED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "CheckinSyncStatus" AS ENUM ('ACCEPTED', 'DUPLICATE', 'REJECTED');

-- CreateEnum
CREATE TYPE "StaffDeviceStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "UploadSource" AS ENUM ('GUEST', 'ORGANIZER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ORGANIZER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weddings" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coupleNames" TEXT,
    "eventDate" TIMESTAMP(3),
    "location" TEXT,
    "country" TEXT,
    "slug" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "WeddingStatus" NOT NULL DEFAULT 'DRAFT',
    "galleryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "weddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "numberOfAllowedGuests" INTEGER NOT NULL DEFAULT 1,
    "qrToken" TEXT NOT NULL,
    "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wedding_snapshots" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "guestCount" INTEGER NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wedding_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshot_guests" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "numberOfAllowedGuests" INTEGER NOT NULL DEFAULT 1,
    "qrToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshot_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_devices" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "label" TEXT,
    "deviceTokenHash" TEXT,
    "status" "StaffDeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "staff_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "staffDeviceId" TEXT,
    "checkedInAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceQueueId" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "syncStatus" "CheckinSyncStatus" NOT NULL DEFAULT 'ACCEPTED',

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_uploads" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "uploadedByGuestId" TEXT,
    "uploadedByName" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "uploadSource" "UploadSource" NOT NULL DEFAULT 'GUEST',
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT,
    "thumbnailKey" TEXT,
    "thumbnailUrl" TEXT,
    "fileSizeBytes" BIGINT NOT NULL,
    "durationSeconds" INTEGER,
    "mimeType" TEXT NOT NULL,
    "originalFileName" TEXT,
    "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hiddenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "staffDeviceId" TEXT,
    "snapshotId" TEXT,
    "payloadCount" INTEGER NOT NULL,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "syncStartedAt" TIMESTAMP(3) NOT NULL,
    "syncCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beta_feedback" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT,
    "userId" TEXT,
    "rating" INTEGER,
    "workedWell" TEXT,
    "confusing" TEXT,
    "offlineFeedback" TEXT,
    "mediaFeedback" TEXT,
    "generalComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "weddings_slug_key" ON "weddings"("slug");

-- CreateIndex
CREATE INDEX "weddings_organizerId_idx" ON "weddings"("organizerId");

-- CreateIndex
CREATE INDEX "weddings_status_idx" ON "weddings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "guests_qrToken_key" ON "guests"("qrToken");

-- CreateIndex
CREATE INDEX "guests_weddingId_idx" ON "guests"("weddingId");

-- CreateIndex
CREATE INDEX "guests_phoneNumber_idx" ON "guests"("phoneNumber");

-- CreateIndex
CREATE INDEX "guests_fullName_idx" ON "guests"("fullName");

-- CreateIndex
CREATE INDEX "guests_weddingId_isCheckedIn_idx" ON "guests"("weddingId", "isCheckedIn");

-- CreateIndex
CREATE INDEX "wedding_snapshots_weddingId_idx" ON "wedding_snapshots"("weddingId");

-- CreateIndex
CREATE INDEX "wedding_snapshots_weddingId_isActive_idx" ON "wedding_snapshots"("weddingId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "wedding_snapshots_weddingId_version_key" ON "wedding_snapshots"("weddingId", "version");

-- CreateIndex
CREATE INDEX "snapshot_guests_snapshotId_idx" ON "snapshot_guests"("snapshotId");

-- CreateIndex
CREATE INDEX "snapshot_guests_weddingId_idx" ON "snapshot_guests"("weddingId");

-- CreateIndex
CREATE INDEX "snapshot_guests_guestId_idx" ON "snapshot_guests"("guestId");

-- CreateIndex
CREATE INDEX "snapshot_guests_qrToken_idx" ON "snapshot_guests"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_guests_snapshotId_guestId_key" ON "snapshot_guests"("snapshotId", "guestId");

-- CreateIndex
CREATE INDEX "staff_devices_weddingId_idx" ON "staff_devices"("weddingId");

-- CreateIndex
CREATE INDEX "staff_devices_weddingId_status_idx" ON "staff_devices"("weddingId", "status");

-- CreateIndex
CREATE INDEX "check_ins_weddingId_idx" ON "check_ins"("weddingId");

-- CreateIndex
CREATE INDEX "check_ins_guestId_idx" ON "check_ins"("guestId");

-- CreateIndex
CREATE INDEX "check_ins_snapshotId_idx" ON "check_ins"("snapshotId");

-- CreateIndex
CREATE INDEX "check_ins_staffDeviceId_idx" ON "check_ins"("staffDeviceId");

-- CreateIndex
CREATE INDEX "check_ins_checkedInAt_idx" ON "check_ins"("checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_staffDeviceId_sourceQueueId_key" ON "check_ins"("staffDeviceId", "sourceQueueId");

-- CreateIndex
CREATE UNIQUE INDEX "media_uploads_fileKey_key" ON "media_uploads"("fileKey");

-- CreateIndex
CREATE INDEX "media_uploads_weddingId_idx" ON "media_uploads"("weddingId");

-- CreateIndex
CREATE INDEX "media_uploads_weddingId_mediaType_idx" ON "media_uploads"("weddingId", "mediaType");

-- CreateIndex
CREATE INDEX "media_uploads_weddingId_status_idx" ON "media_uploads"("weddingId", "status");

-- CreateIndex
CREATE INDEX "media_uploads_createdAt_idx" ON "media_uploads"("createdAt");

-- CreateIndex
CREATE INDEX "sync_logs_weddingId_idx" ON "sync_logs"("weddingId");

-- CreateIndex
CREATE INDEX "sync_logs_staffDeviceId_idx" ON "sync_logs"("staffDeviceId");

-- CreateIndex
CREATE INDEX "sync_logs_createdAt_idx" ON "sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "beta_feedback_weddingId_idx" ON "beta_feedback"("weddingId");

-- CreateIndex
CREATE INDEX "beta_feedback_userId_idx" ON "beta_feedback"("userId");

-- AddForeignKey
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wedding_snapshots" ADD CONSTRAINT "wedding_snapshots_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_guests" ADD CONSTRAINT "snapshot_guests_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "wedding_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_guests" ADD CONSTRAINT "snapshot_guests_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_devices" ADD CONSTRAINT "staff_devices_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "wedding_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_staffDeviceId_fkey" FOREIGN KEY ("staffDeviceId") REFERENCES "staff_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_uploadedByGuestId_fkey" FOREIGN KEY ("uploadedByGuestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_staffDeviceId_fkey" FOREIGN KEY ("staffDeviceId") REFERENCES "staff_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "wedding_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beta_feedback" ADD CONSTRAINT "beta_feedback_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
