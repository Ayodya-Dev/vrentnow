-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- Existing reviews were already public; keep them visible.
UPDATE "Review" SET "status" = 'APPROVED';

-- DropIndex
DROP INDEX IF EXISTS "Review_vehicleId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Review_vehicleId_status_createdAt_idx" ON "Review"("vehicleId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");
