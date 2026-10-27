BEGIN;
ALTER TABLE "User" ADD COLUMN "licenseReviewedAt" TIMESTAMP(3);
ALTER TABLE "SalaryReport" ADD COLUMN "ownerKey" TEXT;
CREATE UNIQUE INDEX "SalaryReport_ownerKey_key" ON "SalaryReport"("ownerKey");
CREATE TABLE "AuthSession" (
  "tokenHash" TEXT NOT NULL PRIMARY KEY,
  "subjectId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuthSession_subjectId_role_idx" ON "AuthSession"("subjectId", "role");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
CREATE TABLE "RateLimit" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
ALTER TABLE "User" ADD COLUMN "scanTime" TEXT NOT NULL DEFAULT '09:00';
ALTER TABLE "User" ADD COLUMN "scanDays" TEXT NOT NULL DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday';
ALTER TABLE "User" ADD COLUMN "scanTimezone" TEXT NOT NULL DEFAULT 'Africa/Lagos';
ALTER TABLE "User" ADD COLUMN "lastScheduledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "scanLeaseUntil" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN "source" TEXT;
ALTER TABLE "Job" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "licenseReviewReference" TEXT;
ALTER TABLE "Employer" ADD COLUMN "verificationReference" TEXT;
ALTER TABLE "Employer" ADD COLUMN "verifiedAt" TIMESTAMP(3);

COMMIT;
