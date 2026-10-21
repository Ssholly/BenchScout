import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { documentCleanupStatus, processDocumentCleanup } from "@/lib/document-cleanup";
export const maxDuration = 60;
export const POST = withApi("admin", async request => {
  const body = await request.json();
  if (body.action === "status") return NextResponse.json(await documentCleanupStatus());
  if (body.action !== "process" || body.confirm !== "PROCESS PENDING DELETIONS") throw new ApiError(400, "Confirm processing the pending deletion queue.");
  return NextResponse.json(await processDocumentCleanup());
}, { limit: 3 });
