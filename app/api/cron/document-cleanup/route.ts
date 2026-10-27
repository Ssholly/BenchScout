import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { documentCleanupStatus } from "@/lib/document-cleanup";
import { recordedDocumentCleanup } from "@/lib/document-cleanup-runs";
export const maxDuration = 60;
export const GET = withApi("cron", async request => {
  if (new URL(request.url).searchParams.get("dryRun") === "1") return NextResponse.json({ dryRun: true, ...await documentCleanupStatus() });
  return NextResponse.json(await recordedDocumentCleanup("cron-endpoint", request.headers.get("user-agent") === "vercel-cron/1.0"));
});
