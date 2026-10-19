import { createHash } from "node:crypto";
import type { User } from "@prisma/client";
import { candidateProfile } from "@/lib/candidate-profile";
import { isPrivateBlob } from "@/lib/documents";
import { currentCredentialReview } from "@/lib/credential-review";

export const candidateChecks = ["document", "registration"] as const;
export function candidateReviewEvidence(user: User) {
  const intern = user.careerPhase === "internship";
  const profile = candidateProfile(user.candidateProfile);
  const url = intern ? user.provisionalUrl : user.licenseUrl;
  const number = intern ? profile.provisionalNumber : user.licenseNumber;
  const expiry = intern ? profile.provisionalExpiry : user.licenseExpiry?.toISOString();
  return { kind: intern ? "provisional" : "license", url, number, expiry: expiry || null };
}
export function candidateReviewSnapshot(user: User) {
  const evidence = candidateReviewEvidence(user);
  return { id: user.id, name: user.name, email: user.email, careerPhase: user.careerPhase, revision: user.credentialRevision, documentKind: evidence.kind, documentFingerprint: evidence.url ? createHash("sha256").update(evidence.url).digest("hex") : null, privateDocumentAvailable: !!evidence.url && isPrivateBlob(evidence.url), registrationNumber: evidence.number, expiry: evidence.expiry, currentlyReviewed: currentCredentialReview(user) };
}
export function candidateEvidenceComplete(user: User, now = new Date()) {
  const { url, number, expiry } = candidateReviewEvidence(user);
  return !!url && isPrivateBlob(url) && !!number?.trim() && (expiry ? Number.isFinite(Date.parse(expiry)) && new Date(expiry) > now : user.careerPhase === "internship");
}
