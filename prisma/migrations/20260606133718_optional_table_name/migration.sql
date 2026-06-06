-- AlterTable
ALTER TABLE "guests" ALTER COLUMN "tableName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "snapshot_guests" ALTER COLUMN "tableName" DROP NOT NULL;
