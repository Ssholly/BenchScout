import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { backupEnabled, backupConfiguration, sendBackupAlert } from "@/lib/document-backup";
import { backfillSyntheticDocuments } from "@/lib/synthetic-document-backfill";
import { runDocumentRecoveryProbe } from "@/lib/document-recovery-probe";
import { prisma } from "@/lib/prisma";
import { previewProductionBackfill, applyProductionBackfill } from "@/lib/production-document-backfill";

export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = withApi("admin", async request => {
  const body = await request.json();
  if (body.action === "production-backfill-preview") return NextResponse.json(await previewProductionBackfill(body.expectedTargetFingerprint), { headers: { "Cache-Control": "no-store" } });
  if (body.action === "production-backfill-apply") return NextResponse.json(await applyProductionBackfill(body.expectedTargetFingerprint, body.planToken, body.confirm), { headers: { "Cache-Control": "no-store" } });
  if (body.action === "status") {
    let configured = false;
    try { backupConfiguration(); configured = true; } catch { /* Presence check only. */ }
    return NextResponse.json({ enabled: backupEnabled(), configured, alertConfigured: Boolean(process.env.DOCUMENT_BACKUP_ALERT_EMAIL), syntheticToolEnabled: process.env.DOCUMENT_BACKUP_TEST_MODE === "true" && process.env.VERCEL_ENV !== "production" }, { headers: { "Cache-Control": "no-store" } });
  }
  if (body.action === "runtime-readiness") {
    const rows = await prisma.$queryRaw<Array<{ name: string }>>`SELECT current_database() AS name`;
    let targetFingerprint: string | null = null;
    let configuredDatabaseMatches = false;
    try {
      const url = new URL(process.env.DATABASE_URL || "");
      const name = decodeURIComponent(url.pathname.slice(1));
      targetFingerprint = createHash("sha256").update(`${url.hostname.replace(/-pooler(?=\.)/, "")}/${name}`).digest("hex");
      configuredDatabaseMatches = rows[0]?.name === name;
    } catch { /* Report invalid target without returning connection details. */ }
    let configured = false;
    try { backupConfiguration(); configured = true; } catch { /* No credential output. */ }
    return NextResponse.json({ databaseConnected: true, configuredDatabaseMatches, targetFingerprint, environment: process.env.VERCEL_ENV || "local", buildCommit: process.env.VERCEL_GIT_COMMIT_SHA || null, backupEnabled: backupEnabled(), backupConfigured: configured, alertConfigured: Boolean(process.env.DOCUMENT_BACKUP_ALERT_EMAIL), testModeOff: process.env.DOCUMENT_BACKUP_TEST_MODE !== "true", businessRecordsChanged: false }, { headers: { "Cache-Control": "no-store" } });
  }
  if (["runtime-storage-check", "runtime-alert"].includes(body.action)) {
    if (process.env.VERCEL_ENV !== "production") throw new ApiError(403, "Use the Production deployment for this check.");
    if (process.env.DOCUMENT_BACKUP_TEST_MODE === "true") throw new ApiError(403, "Disable synthetic test mode before Production checks.");
    const confirmation = body.action === "runtime-storage-check" ? "DELETE RUNTIME QA ONLY" : "SEND RUNTIME ALERT";
    if (body.confirm !== confirmation) throw new ApiError(400, "Confirm the scoped runtime check.");
    if (body.action === "runtime-alert") {
      await sendBackupAlert("runtime-delivery-test", true);
      return NextResponse.json({ alertSubmitted: true, inboxReceipt: "Await recipient confirmation", documentDataIncluded: false }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!backupEnabled()) throw new ApiError(503, "Enable document backups before this check.");
    backupConfiguration();
    return NextResponse.json(await runDocumentRecoveryProbe(), { headers: { "Cache-Control": "no-store" } });
  }
  if (!["synthetic-restore", "synthetic-backfill", "test-alert"].includes(body.action)) throw new ApiError(400, "Choose a supported backup check.");
  if (process.env.DOCUMENT_BACKUP_TEST_MODE !== "true" || process.env.VERCEL_ENV === "production") throw new ApiError(403, "Synthetic recovery is disabled here.");
  if (body.action === "test-alert") {
    await sendBackupAlert("synthetic-test", true);
    return NextResponse.json({ alertSubmitted: true, inboxReceipt: "Await recipient confirmation", documentDataIncluded: false }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!backupEnabled()) throw new ApiError(503, "Enable testing document backups before this check.");
  backupConfiguration();
  if (body.action === "synthetic-backfill") return NextResponse.json(await backfillSyntheticDocuments(), { headers: { "Cache-Control": "no-store" } });
  if (body.confirm !== "DELETE QA ONLY") throw new ApiError(400, "Confirm the synthetic recovery check.");
  return NextResponse.json(await runDocumentRecoveryProbe(), { headers: { "Cache-Control": "no-store" } });
}, { limit: 3 });
