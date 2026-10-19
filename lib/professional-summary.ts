import { candidateProfile, careerLabel } from "@/lib/candidate-profile";

export type ProfessionalSummary = {
  stage: string;
  fields: { label: string; value: string }[];
};
type SummarySource = { careerPhase?: string; candidateProfile?: unknown; location?: string | null };

// Explicit display allowlist: never spread raw profile JSON into employer responses.
export function professionalSummary(source: SummarySource): ProfessionalSummary {
  const profile = candidateProfile(source.candidateProfile);
  const intern = source.careerPhase === "internship";
  const fields: ProfessionalSummary["fields"] = [];
  const add = (label: string, value: string | null | undefined) => {
    const text = value?.trim().slice(0, 500);
    if (text) fields.push({ label, value: text });
  };
  add("Education", profile.institution);
  add("Graduation year", profile.graduationYear);
  if (!intern) {
    add("Experience (years)", profile.experienceYears);
    add("Specialties", profile.specialties);
    add("Preferred roles", profile.rolePreferences);
  }
  add(intern ? "Preferred placement locations" : "Preferred work locations", profile.preferredLocations || source.location);
  add("Available from", profile.availabilityDate);
  add("Relocation", profile.relocation ? "Open to relocation" : "Not open to relocation");
  return { stage: careerLabel(source.careerPhase, profile), fields };
}

export function sharedProfessionalSummary(source: SummarySource): ProfessionalSummary | null {
  return candidateProfile(source.candidateProfile).shareProfessionalSummary ? professionalSummary(source) : null;
}
