-- AlterTable guests: add seatNumber (optional) and tableName (required, backfill existing rows with 'TBD')
ALTER TABLE "guests" ADD COLUMN "seatNumber" TEXT;
ALTER TABLE "guests" ADD COLUMN "tableName" TEXT NOT NULL DEFAULT 'TBD';
ALTER TABLE "guests" ALTER COLUMN "tableName" DROP DEFAULT;

-- AlterTable snapshot_guests: same pattern
ALTER TABLE "snapshot_guests" ADD COLUMN "seatNumber" TEXT;
ALTER TABLE "snapshot_guests" ADD COLUMN "tableName" TEXT NOT NULL DEFAULT 'TBD';
ALTER TABLE "snapshot_guests" ALTER COLUMN "tableName" DROP DEFAULT;
