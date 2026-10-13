import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { ApiError, applicationOrigin } from "@/lib/security";
import { runJobScan } from "@/lib/job-scanner";
export const maxDuration = 60;
export const POST = withApi("candidate", async (request, session) => {
  const body = await request.json();
  if (body.minScore !== undefined && (!Number.isInteger(body.minScore) || body.minScore < 0 || body.minScore > 100)) throw new ApiError(400, "Invalid minimum score.");
  const result = await runJobScan(session!.id, {
    ...(typeof body.targetLocation === "string" ? { location: body.targetLocation.slice(0,250) } : {}),
    ...(typeof body.keywords === "string" ? { keywords: body.keywords.slice(0,2000) } : {}),
    ...(typeof body.minScore === "number" ? { minScore: body.minScore } : {}),
    ...(typeof body.strict_mls === "boolean" ? { strictMls: body.strict_mls } : {}),
    ...(typeof body.includeTier3 === "boolean" ? { includeTier3: body.includeTier3 } : {}),
    ...(typeof body.autoSend === "boolean" ? { autoSend: body.autoSend } : {}),
  }, "Manual", applicationOrigin(request));
  return NextResponse.json(result);
}, { limit: 2 });
