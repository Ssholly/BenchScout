import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { documentCleanupStatus } from "@/lib/document-cleanup";
import { recentDocumentCleanupRuns, recordedDocumentCleanup } from "@/lib/document-cleanup-runs";
export const maxDuration = 60;
export const POST = withApi("admin", async request => {
  const body = await request.json();
  if (body.action === "status") return NextResponse.json(await documentCleanupStatus());
  if (body.action === "runs") return NextResponse.json({ runs: await recentDocumentCleanupRuns(), provenanceNotice: "Cron agent is a request hint, not independent proof of automatic scheduling. A RUNNING record without a finish time has an unknown outcome." });
  if (body.action !== "process" || body.confirm !== "PROCESS PENDING DELETIONS") throw new ApiError(400, "Confirm processing the pending deletion queue.");
  return NextResponse.json(await recordedDocumentCleanup("admin"));
}, { limit: 3 });
