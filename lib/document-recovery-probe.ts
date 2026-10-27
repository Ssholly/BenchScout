import { randomUUID, createHash } from "node:crypto";
import { put, get, del, BlobNotFoundError } from "@vercel/blob";
import { ApiError } from "@/lib/security";
import { privateBlobToken } from "@/lib/documents";
import { backupDocument, purgeDocumentBackup, readPrivateBytes, restoreDocumentBytes } from "@/lib/document-backup";

// Generates its own QA paths; never accepts existing files or account identifiers.
export async function runDocumentRecoveryProbe() {
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
  return { passed: true, sourceLossVerified: true, decryptedBytesMatch: true, restoredPrivateReadMatches: true, bytes: original.length, sha256: createHash("sha256").update(original).digest("hex"), cleanupSubmitted: true, databaseChanged: false, applicationGrantsChanged: false };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(JSON.stringify({ event: "document_recovery_probe_failed" }));
    throw new ApiError(503, "Synthetic recovery could not complete. Inspect QA objects privately; no restore pass is established.");
  }
}
