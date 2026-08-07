-- AlterTable
DELETE FROM "Payment";
DELETE FROM "Booking";

ALTER TABLE "Booking" ADD COLUMN "email" TEXT NOT NULL;
