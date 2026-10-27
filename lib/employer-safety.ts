import { ApiError, textField, emailField, safeExternalUrl } from "@/lib/security";

export const companyChecks = ["registration", "recruiter", "presence", "operatingCredentials"] as const;
export const vacancyChecks = ["authority", "vacancy", "noFees"] as const;
export function verificationSubmission(body: Record<string, unknown>) {
  const organisationType = textField(body.organisationType, "organisation type");
  if (!["registered-business", "public-institution"].includes(organisationType)) throw new ApiError(400, "Choose an organisation type.");
  if (body.noFees !== true || body.authorised !== true) throw new ApiError(400, "Confirm your recruitment authority and no applicant fees policy.");
  const website = body.website ? safeExternalUrl(body.website) : "";
  return {
    organisationType,
    legalName: textField(body.legalName, "registered or official name"),
    registrationNumber: textField(body.registrationNumber, organisationType === "public-institution" ? "establishing authority or official directory reference" : "CAC registration number"),
    address: textField(body.address, "physical address", 600),
    website,
    recruiterName: textField(body.recruiterName, "recruiter name"),
    recruiterRole: textField(body.recruiterRole, "recruiter role"),
    workEmail: emailField(body.workEmail),
    phone: textField(body.phone, "contact phone", 40),
    authorityEvidence: textField(body.authorityEvidence, "recruitment authority evidence", 1500),
    operatingCredentials: textField(body.operatingCredentials, "operating credentials or applicability explanation", 1500),
    noFees: true, authorised: true, submittedAt: new Date().toISOString(),
  };
}
export function reviewEvidence(body: Record<string, unknown>, keys: readonly string[]) {
  const checks = body.checks as Record<string, unknown> | undefined;
  if (!checks || keys.some(key => typeof checks[key] !== "string" || (checks[key] as string).trim().length < 10)) {
    throw new ApiError(400, "Record independent evidence for every required check.");
  }
  return Object.fromEntries(keys.map(key => [key, textField(checks[key], `${key} evidence`, 1500)]));
}
