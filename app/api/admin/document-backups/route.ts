import { randomUUID, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { put, get, del, BlobNotFoundError } from "@vercel/blob";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { privateBlobToken } from "@/lib/documents";
import { backupEnabled, backupConfiguration, backupDocument, purgeDocumentBackup, readPrivateBytes, restoreDocumentBytes, sendBackupAlert } from "@/lib/document-backup";
import { backfillSyntheticDocuments } from "@/lib/synthetic-document-backfill";

export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = withApi("admin", async request => {
  const body = await request.json();
  if (body.action === "status") {
    let configured = false;
    try { backupConfiguration(); configured = true; } catch { /* Presence check only. */ }
    return NextResponse.json({ enabled: backupEnabled(), configured, alertConfigured: Boolean(process.env.DOCUMENT_BACKUP_ALERT_EMAIL), syntheticToolEnabled: process.env.DOCUMENT_BACKUP_TEST_MODE === "true" && process.env.VERCEL_ENV !== "production" }, { headers: { "Cache-Control": "no-store" } });
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
  try {
  const token = privateBlobToken();
  const id = randomUUID();
  const original = Buffer.from(`QA ONLY - BenchScout recovery ${id}\nNo personal data.\n`);
  const options = { access: "private" as const, token, contentType: "application/octet-stream", addRandomSuffix: false };
  const source = await put(`qa-recovery/${id}/source.bin`, original, options);
  await backupDocument(source.url, original);
  await del(source.url, { token });
  // A provider/network/auth error is not evidence that the source disappeared.
  let absent = false;
  try { absent = (await get(source.url, { access: "private", token, useCache: false })) === null; }
  catch (error) { if (error instanceof BlobNotFoundError) absent = true; else throw error; }
  if (!absent) throw new ApiError(503, "Synthetic source deletion was not verified.");
  const recovered = await restoreDocumentBytes(source.url);
  if (!recovered.equals(original)) throw new ApiError(503, "Synthetic restoration integrity failed.");
  const restored = await put(`qa-recovery/${id}/restored.bin`, recovered, options);
  const readBack = await readPrivateBytes(restored.url, token);
  if (!readBack.equals(original)) throw new ApiError(503, "Restored private object read-back failed.");
  // Explicit operator confirmation covers only these newly generated QA objects.
  await del(restored.url, { token });
  await purgeDocumentBackup(source.url);
  return NextResponse.json({ passed: true, sourceLossVerified: true, decryptedBytesMatch: true, restoredPrivateReadMatches: true, bytes: original.length, sha256: createHash("sha256").update(original).digest("hex"), cleanupSubmitted: true, databaseChanged: false, applicationGrantsChanged: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(JSON.stringify({ event: "document_recovery_probe_failed" }));
    throw new ApiError(503, "Synthetic recovery could not complete. Inspect QA objects privately; no restore pass is established.");
  }
}, { limit: 3 });
