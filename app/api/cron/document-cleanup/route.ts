import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { documentCleanupStatus, processDocumentCleanup } from "@/lib/document-cleanup";
export const maxDuration = 60;
export const GET = withApi("cron", async request => {
  if (new URL(request.url).searchParams.get("dryRun") === "1") return NextResponse.json({ dryRun: true, ...await documentCleanupStatus() });
  return NextResponse.json(await processDocumentCleanup());
});
