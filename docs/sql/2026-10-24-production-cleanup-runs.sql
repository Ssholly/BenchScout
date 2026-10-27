BEGIN;
DO $$ BEGIN IF current_database() <> 'neondb' THEN RAISE EXCEPTION 'Wrong database'; END IF; IF EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name='20261024000000_document_cleanup_runs') THEN RAISE EXCEPTION 'Migration already recorded'; END IF; END $$;
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

INSERT INTO "_prisma_migrations" (id,checksum,finished_at,migration_name,started_at,applied_steps_count) VALUES ('59664bfe-fca6-4fd4-b98e-f02a7f46ef54','dc004200c77fadfcf3a95aeae351b8226e66bdfb77dff792ac12523e91d74a92',CURRENT_TIMESTAMP,'20261024000000_document_cleanup_runs',CURRENT_TIMESTAMP,1);
COMMIT;
SELECT current_database() AS database, (SELECT count(*) FROM "DocumentCleanupRun") AS audit_rows, (SELECT checksum='dc004200c77fadfcf3a95aeae351b8226e66bdfb77dff792ac12523e91d74a92' FROM "_prisma_migrations" WHERE migration_name='20261024000000_document_cleanup_runs' AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS checksum_matches;
