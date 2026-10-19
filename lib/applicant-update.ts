import type { ClientApplication } from "@/lib/types";

export type ApplicantDecision = {
  applicationId: string;
  status: "rejected" | "shortlisted";
  interviewDate?: string;
  interviewTime?: string;
  interviewLoc?: string;
};

export async function updateApplicant(decision: ApplicantDecision) {
  const response = await fetch("/api/jobs/applicants", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decision),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || result.application?.id !== decision.applicationId) {
    throw new Error(result?.error || "Could not update this application. Please retry.");
  }
  return { application: result.application as ClientApplication, emailDelivered: result.emailDelivered === true };
}
