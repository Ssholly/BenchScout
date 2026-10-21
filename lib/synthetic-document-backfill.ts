import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { documentFields, isPrivateBlob, privateBlobToken } from "@/lib/documents";
import { backupDocument, purgeDocumentBackup, readPrivateBytes, restoreDocumentBytes } from "@/lib/document-backup";

// Deliberately fixed to the existing synthetic acceptance fixture. This tool
// cannot accept a caller-supplied real candidate ID, URL or destination.
const fixtureId = "2b0901c4-bbcc-4e55-b61d-8fe598e1f465";
const fixtureName = "QA ONLY - Synthetic Candidate 20261020";
export async function backfillSyntheticDocuments() {
  const fields = Object.values(documentFields);
  const select = { id: true, ...Object.fromEntries(fields.map(field => [field, true])) } as const;
  const users = await prisma.user.findMany({ where: { id: fixtureId, name: fixtureName }, select });
  if (users.length !== 1) throw new ApiError(409, "The expected synthetic candidate was not found uniquely. No files copied.");
  const user = users[0] as unknown as { id: string } & Record<string, string | null>;
  const report = { eligible: 0, verified: 0, stalePurged: 0, failed: 0, skipped: 0 };
  const token = privateBlobToken();
  for (const field of fields) {
    const source = user[field];
    if (!source) continue;
    if (!isPrivateBlob(source)) { report.skipped++; continue; }
    report.eligible++;
    try {
      const bytes = await readPrivateBytes(source, token, 4 * 1024 * 1024);
      await backupDocument(source, bytes);
      const recovered = await restoreDocumentBytes(source);
      if (!recovered.equals(bytes)) throw new Error("Backfill integrity mismatch");
      const latest = await prisma.user.findUnique({ where: { id: user.id }, select: { [field]: true } });
      if (!latest || (latest as Record<string, unknown>)[field] !== source) {
        await purgeDocumentBackup(source);
        report.stalePurged++;
      } else report.verified++;
    } catch {
      report.failed++;
      console.error(JSON.stringify({ event: "synthetic_backfill_item_failed" }));
    }
  }
  return { ...report, passed: report.eligible > 0 && report.verified === report.eligible && report.failed === 0 && report.skipped === 0, databaseChanged: false, applicationGrantsChanged: false };
}
