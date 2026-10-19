import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { candidateProfile } from "@/lib/candidate-profile";
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const zones: Record<string, string> = { WAT: "Africa/Lagos", GMT: "Etc/UTC", CAT: "Africa/Harare", SAST: "Africa/Johannesburg", EAT: "Africa/Nairobi" };
export const POST = withApi("candidate", async (request, session) => {
  const body = await request.json();
  // Accept the old client label while storing the canonical tier value.
  if (body.alertTier === "All Roles") body.alertTier = "All Tiers";
  if (body.jobAlertsEnabled !== undefined && typeof body.jobAlertsEnabled !== "boolean") throw new ApiError(400, "Invalid alert preference.");
  if (body.scanTime !== undefined && (typeof body.scanTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.scanTime))) throw new ApiError(400, "Invalid schedule time.");
  if (body.scanDays !== undefined && (!Array.isArray(body.scanDays) || !body.scanDays.length || !body.scanDays.every((day: unknown) => typeof day === "string" && days.includes(day)))) throw new ApiError(400, "Choose valid schedule days.");
  const zone = typeof body.scanTimezone === "string" ? zones[body.scanTimezone] || body.scanTimezone : undefined;
  if (zone) { try { new Intl.DateTimeFormat("en", { timeZone: zone }); } catch { throw new ApiError(400, "Invalid timezone."); } }
  if (body.alertTier !== undefined && !["Tier 1 Only", "Tier 1 & Tier 2", "All Tiers"].includes(body.alertTier)) throw new ApiError(400, "Invalid alert tier.");
  const user = await prisma.user.update({ where: { id: session!.id, credentialRevision: session!.credentialRevision ?? 0 }, data: {
    ...(typeof body.jobAlertsEnabled === "boolean" ? { alertsActive: body.jobAlertsEnabled } : {}),
    ...(typeof body.autoSendEmail === "boolean" ? { autoSendEmail: body.autoSendEmail } : {}),
    ...(typeof body.targetLocation === "string" ? { location: body.targetLocation.slice(0,250) } : {}),
    ...(typeof body.targetLocation === "string" && body.targetLocation !== session!.location ? {candidateProfile:candidateProfile(session!.candidateProfile)} : {}),
    ...(typeof body.alertKeywords === "string" ? { alertKeywords: body.alertKeywords.slice(0,2000) } : {}),
    ...(typeof body.alertTier === "string" ? { alertTier: body.alertTier } : {}),
    ...(body.scanTime !== undefined ? { scanTime: body.scanTime } : {}),
    ...(body.scanDays !== undefined ? { scanDays: [...new Set(body.scanDays as string[])].join(",") } : {}),
    ...(zone ? { scanTimezone: zone } : {}),
  } }).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") throw new ApiError(409, "Your profile changed. Refresh before saving preferences again.");
    throw error;
  });
  return NextResponse.json({ success: true, user });
});
