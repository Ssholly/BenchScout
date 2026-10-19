type CredentialRecord = {
  isLicenseVerified?: unknown;
  licenseReviewedAt?: unknown;
  careerPhase?: unknown;
  licenseExpiry?: unknown;
  candidateProfile?: unknown;
};

// A historical review must not imply that an expired credential is current.
export function currentCredentialReview(record: CredentialRecord, now = new Date()) {
  if (record.isLicenseVerified !== true || !record.licenseReviewedAt) return false;
  const reviewedAt = new Date(record.licenseReviewedAt as string | Date);
  if (!Number.isFinite(reviewedAt.getTime()) || reviewedAt > now) return false;
  const profile = record.candidateProfile && typeof record.candidateProfile === "object"
    ? record.candidateProfile as Record<string, unknown> : {};
  const intern = record.careerPhase === "internship";
  const expiry = intern ? profile.provisionalExpiry : record.licenseExpiry;
  // Provisional expiry is optional; a practicing license requires a recorded expiry.
  if (!expiry) return intern;
  const expiresAt = new Date(expiry as string | Date);
  return Number.isFinite(expiresAt.getTime()) && expiresAt > now;
}
