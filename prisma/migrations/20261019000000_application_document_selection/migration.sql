ALTER TABLE "Application" ADD COLUMN "documentSelection" JSONB;
-- Existing applications keep only their previously authorised current private CV.
-- Optional documents now require a new explicit selection; never backfill all files.
UPDATE "Application" AS a SET "documentSelection" = jsonb_build_object('resume', u."resumeUrl")
FROM "User" AS u WHERE a."userId" = u.id
AND u."resumeUrl" ~ '^https://[^/]+\.private\.blob\.vercel-storage\.com/';
