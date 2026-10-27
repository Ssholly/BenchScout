ALTER TABLE "Employer" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'unsubmitted',
 ADD COLUMN "verificationDetails" JSONB NOT NULL DEFAULT '{}',
 ADD COLUMN "verificationRevision" INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN "verificationFeedback" TEXT;
UPDATE "Employer" SET "verificationStatus" = 'legacy-approved' WHERE "isVerified" = true;
CREATE TABLE "SafetyReview" (
 "id" TEXT NOT NULL PRIMARY KEY, "kind" TEXT NOT NULL, "subjectId" TEXT NOT NULL,
 "decision" TEXT NOT NULL, "reviewer" TEXT NOT NULL, "evidence" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "SafetyReview_kind_subjectId_createdAt_idx" ON "SafetyReview"("kind", "subjectId", "createdAt");
CREATE TABLE "JobReport" (
 "id" TEXT NOT NULL PRIMARY KEY, "jobId" TEXT NOT NULL, "reporterId" TEXT NOT NULL,
 "reason" TEXT NOT NULL, "details" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'open',
 "resolution" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "resolvedAt" TIMESTAMP(3)
);
CREATE UNIQUE INDEX "JobReport_jobId_reporterId_key" ON "JobReport"("jobId", "reporterId");
CREATE INDEX "JobReport_status_createdAt_idx" ON "JobReport"("status", "createdAt");
