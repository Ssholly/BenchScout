import { isPrivateBlob } from "@/lib/documents";
import { candidateProfile } from "@/lib/candidate-profile";
import { currentCredentialReview } from "@/lib/credential-review";
export type ReadinessProfile = {
  isVerified: boolean; resumeUrl: string | null; keywords: string | null;
  careerPhase: string; licenseUrl: string | null; provisionalUrl: string | null;
  licenseNumber: string | null; licenseExpiry: Date | null;
  credentialRevision?: number; licenseReviewRevision?: number | null;
  isLicenseVerified: boolean; licenseReviewedAt: Date | null;
  candidateProfile?: unknown; degreeUrl?: string | null; statementOfResultUrl?: string | null;
};
export function applicationReadiness(user: ReadinessProfile, now = new Date()) {
  const profile = candidateProfile(user.candidateProfile);
  const intern = user.careerPhase === "internship";
  const checks = [
    { key: "email", label: "Email confirmed", done: user.isVerified, href: "/settings" },
    { key: "cv", label: "Private CV uploaded", done: Boolean(user.resumeUrl && isPrivateBlob(user.resumeUrl)), href: "/settings" },
    { key: "skills", label: "Matching skills added", done: Boolean(user.keywords?.trim()), href: "/settings" },
    { key: "license", label: user.careerPhase === "internship" ? "Provisional license uploaded" : "Practicing license uploaded", done: Boolean((user.careerPhase === "internship" ? user.provisionalUrl : user.licenseUrl) && isPrivateBlob((user.careerPhase === "internship" ? user.provisionalUrl : user.licenseUrl)!)), href: "/settings" },
    { key: "expiry", label: intern ? "Provisional registration details recorded" : "License details and expiry recorded", done: intern ? Boolean(profile.provisionalNumber && (!profile.provisionalExpiry || new Date(profile.provisionalExpiry) >= now)) : Boolean(user.licenseNumber && user.licenseExpiry && user.licenseExpiry > now), href: "/settings#career-profile" },
  ];
  if (intern) {
    checks.push({ key: "education", label: "Degree or statement of result uploaded", done: Boolean([user.degreeUrl, user.statementOfResultUrl].some(url => url && isPrivateBlob(url))), href: "/settings" });
    if (profile.placementStage === "seeking") checks.push({ key: "preferences", label: "Placement preferences recorded", done: Boolean(profile.preferredLocations || profile.availabilityDate), href: "/settings#career-profile" });
    if (profile.placementStage === "training") checks.push({ key: "placement", label: "Training institution and start date recorded", done: Boolean(profile.placementInstitution && profile.placementStart), href: "/settings#career-profile" });
  }
  const relevantChecks = intern && profile.placementStage === "training" ? checks.filter(check=>check.key !== "skills") : checks;
  return { checks: relevantChecks, complete: relevantChecks.filter(check => check.done).length, total: relevantChecks.length,
    careerPhase: user.careerPhase,
    placementStage: intern ? profile.placementStage : undefined,
    credentialStatus: currentCredentialReview(user, now) ? "Reviewed" : (intern ? profile.provisionalNumber : user.licenseNumber) ? "Self-reported" : "Not submitted",
    note: "This checklist tracks profile completeness. It does not certify professional eligibility." };
}
