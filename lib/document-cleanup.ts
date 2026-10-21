export { enqueueDocumentCleanup } from "@/lib/document-cleanup-queue";
import { prisma } from "@/lib/prisma";
import { documentFields, removeDocument } from "@/lib/documents";
import { sendBackupAlert } from "@/lib/document-backup";

export async function documentCleanupStatus() {
  const now = new Date();
  const [pending, failed, due] = await Promise.all([
    prisma.documentCleanup.count(),
    prisma.documentCleanup.count({ where: { lastErrorCode: { not: null } } }),
    prisma.documentCleanup.count({ where: { nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }] } }),
  ]);
  return { pending, failed, due };
}

/** Only server-recorded deletion intents; callers never supply source URLs. */
export async function processDocumentCleanup(ids?: string[]) {
  const now = new Date();
  const jobs = await prisma.documentCleanup.findMany({ where: {
    ...(ids ? { id: { in: ids.slice(0, 5) } } : {}),
    nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
  }, orderBy: { createdAt: "asc" }, take: 5 });
  const result = { attempted: 0, completed: 0, failed: 0, referenced: 0, skippedLeased: 0 };
  for (const job of jobs) {
    const leaseUntil = new Date(Date.now() + 5 * 60_000);
    const claimed = await prisma.documentCleanup.updateMany({ where: { id: job.id, nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }] }, data: { leaseUntil, attempts: { increment: 1 } } });
    if (!claimed.count) { result.skippedLeased++; continue; }
    result.attempted++;
    try {
      // Application grants are version-bound to these current fields. A shared
      // source must not be purged while any current vault still references it.
      const active = await prisma.user.findFirst({ where: { OR: Object.values(documentFields).map(field => ({ [field]: job.sourceUrl })) }, select: { id: true } });
      if (active) {
        await prisma.documentCleanup.updateMany({ where: { id: job.id, leaseUntil }, data: { leaseUntil: null, nextAttemptAt: new Date(Date.now() + 60 * 60_000), lastErrorCode: "STILL_REFERENCED" } });
        result.referenced++; continue;
      }
      await removeDocument(job.sourceUrl);
      // If this acknowledgement fails or the function dies, the durable task
      // remains and idempotent deletion can be attempted after lease expiry.
      const acknowledged = await prisma.documentCleanup.deleteMany({ where: { id: job.id, leaseUntil } });
      if (acknowledged.count) result.completed++; else result.skippedLeased++;
    } catch {
      result.failed++;
      const delay = Math.min(24 * 60 * 60_000, 60_000 * 2 ** Math.min(job.attempts, 20));
      await prisma.documentCleanup.updateMany({ where: { id: job.id, leaseUntil }, data: { leaseUntil: null, nextAttemptAt: new Date(Date.now() + delay), lastErrorCode: "CLEANUP_FAILED" } }).catch(() => console.error("Document cleanup retry acknowledgement unavailable"));
      if (job.attempts + 1 === 3) await sendBackupAlert("document-cleanup").catch(() => console.error("Document cleanup alert unavailable"));
    }
  }
  return result;
}

export async function tryDocumentCleanup(id: string | null) {
  if (!id) return false;
  try {
    await processDocumentCleanup([id]);
    return !!await prisma.documentCleanup.findUnique({ where: { id }, select: { id: true } });
  } catch { console.error("Document cleanup remains queued"); return true; }
}
