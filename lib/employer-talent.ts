import type { Candidate } from "@/lib/types";

export async function loadEmployerTalent(location: string): Promise<Candidate[]> {
  let response: Response;
  try { response = await fetch(`/api/employer/talent?location=${encodeURIComponent(location)}`, { cache: "no-store" }); }
  catch { throw new Error("Could not connect to load previous applicants. Please retry."); }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(typeof result?.error === "string" ? result.error : "Could not load previous applicants. Please retry.");
  if (!Array.isArray(result.users) || !result.users.every((user: unknown) => user && typeof user === "object" && "id" in user && typeof user.id === "string" && "name" in user && typeof user.name === "string" && "email" in user && typeof user.email === "string")) {
    throw new Error("Could not read the applicant list. Please retry.");
  }
  return result.users;
}
