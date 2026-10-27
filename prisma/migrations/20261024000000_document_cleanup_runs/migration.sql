CREATE TABLE "DocumentCleanupRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "cronAgentHint" BOOLEAN NOT NULL DEFAULT false,
    "deploymentId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "referenced" INTEGER NOT NULL DEFAULT 0,
    "skippedLeased" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DocumentCleanupRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DocumentCleanupRun_startedAt_idx" ON "DocumentCleanupRun"("startedAt");
