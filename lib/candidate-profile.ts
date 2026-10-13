export const profileFields = ["institution", "graduationYear", "provisionalNumber", "provisionalExpiry", "preferredLocations", "availabilityDate", "placementInstitution", "placementStart", "placementEnd", "experienceYears", "specialties", "rolePreferences", "salaryPreference", "nextAction", "nextActionDate"] as const;
export type CandidateProfile = Record<typeof profileFields[number], string> & { placementStage: "seeking" | "training"; relocation: boolean };
export function candidateProfile(value: unknown): CandidateProfile {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return { ...Object.fromEntries(profileFields.map(key => [key, typeof record[key] === "string" ? record[key] : ""])), placementStage: record.placementStage === "training" ? "training" : "seeking", relocation: record.relocation === true } as CandidateProfile;
}
export function careerLabel(phase?: string, profile?: unknown) {
  return phase === "internship" ? candidateProfile(profile).placementStage === "training" ? "Intern · In training" : "Intern · Seeking placement" : "Licensed scientist";
}
export function opportunityType(job: { jobType?: string; role?: string; title?: string }) {
  const title = job.role || job.title || "";
  if (/\bintern(ship)?\b|housemanship/i.test(title) || job.jobType === "internship") return "internship";
  if (["full-time", "locum", "contract", "part-time"].includes(job.jobType || "")) return "licensed";
  return "unknown";
}
export function opportunityForPhase(job: Parameters<typeof opportunityType>[0], phase: string) {
  const type = opportunityType(job);
  return phase === "internship" ? type === "internship" && !/\b(senior|principal|chief)\b/i.test(job.role || job.title || "") : type === "licensed";
}
export function opportunityForPreferences(job: { loc?: string; jobType?: string; listingDetails?: unknown }, phase: string, profileValue: unknown, primaryLocation = "All Nigeria") {
  const profile = candidateProfile(profileValue);
  const locations = (profile.preferredLocations || primaryLocation).split(",").map(value => value.trim().toLowerCase().replace("fct - ", "")).filter(Boolean);
  const anywhere = !locations.length || locations.some(location => ["all nigeria", "all", "nigeria"].includes(location));
  const loc = (job.loc || "").toLowerCase();
  if (!anywhere && !locations.some(location => loc.includes(location) || (/abuja|fct/.test(location) && /abuja|fct/.test(loc)))) return false;
  if (phase !== "internship" && profile.rolePreferences) {
    const types: Record<string, string> = { permanent:"full-time", "full-time":"full-time", locum:"locum", contract:"contract", "part-time":"part-time" };
    const chosen = profile.rolePreferences.toLowerCase().split(",").map(value=>types[value.trim()]).filter(Boolean);
    if (chosen.length && !chosen.includes(job.jobType || "")) return false;
  }
  const details = listingDetails(job.listingDetails);
  if (details.deadline && details.deadline < new Date().toISOString().slice(0,10)) return false;
  return true;
}
export type ListingDetails = { deadline: string; requiredDocuments: string; approvalSource: string; approvalReviewedAt: string };
export function listingDetails(value: unknown): ListingDetails {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return Object.fromEntries(["deadline", "requiredDocuments", "approvalSource", "approvalReviewedAt"].map(key => [key, typeof record[key] === "string" ? record[key] : ""])) as ListingDetails;
}
export function internshipApproval(job: { isMlscnApproved?: boolean; listingDetails?: unknown }) {
  const details = listingDetails(job.listingDetails);
  return job.isMlscnApproved === true && /^https:\/\/(?:[\w-]+\.)*mlscn\.gov\.ng\//.test(details.approvalSource) && Number.isFinite(Date.parse(details.approvalReviewedAt));
}
