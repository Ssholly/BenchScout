CREATE TABLE "DocumentCleanup" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseUntil" TIMESTAMP(3),
  "lastErrorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentCleanup_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DocumentCleanup_nextAttemptAt_leaseUntil_idx" ON "DocumentCleanup"("nextAttemptAt", "leaseUntil");
CREATE INDEX "DocumentCleanup_userId_kind_idx" ON "DocumentCleanup"("userId", "kind");
