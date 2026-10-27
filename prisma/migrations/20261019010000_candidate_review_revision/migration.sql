ALTER TABLE "User" ADD COLUMN "credentialRevision" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "licenseReviewRevision" INTEGER;
-- Historical flags remain as history, but are not a version-bound current review.
