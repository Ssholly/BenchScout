import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { processDocumentCleanup } from "@/lib/document-cleanup";

/** Authenticated entry-point evidence, not proof of scheduler provenance. */
export async function recordedDocumentCleanup(source: "cron-endpoint" | "admin", cronAgentHint = false) {
  const id = randomUUID();
  // Fail closed before physical work when the audit table is unavailable.
  await prisma.documentCleanupRun.create({ data: {
    id, source, cronAgentHint, status: "RUNNING",
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
  } });
  try {
    const result = await processDocumentCleanup();
    await prisma.documentCleanupRun.update({ where: { id }, data: {
      finishedAt: new Date(), status: result.failed || result.referenced || result.skippedLeased ? "ATTENTION" : "SUCCEEDED",
      ...result,
    } });
    return { ...result, runId: id };
  } catch (error) {
    // Raw errors may contain private database/storage details: never persist them.
    await prisma.documentCleanupRun.update({ where: { id }, data: {
      finishedAt: new Date(), status: "FAILED", errorCode: "EXECUTION_OR_RECORDING_FAILED",
    } }).catch(() => console.error("Cleanup run outcome could not be recorded"));
    throw error;
  }
}

export async function recentDocumentCleanupRuns() {
  return prisma.documentCleanupRun.findMany({ orderBy: { startedAt: "desc" }, take: 20, select: {
    id: true, source: true, cronAgentHint: true, deploymentId: true,
    startedAt: true, finishedAt: true, status: true, errorCode: true,
    attempted: true, completed: true, failed: true, referenced: true, skippedLeased: true,
  } });
}
