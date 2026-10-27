import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { DocumentKind } from "@/lib/documents";

export async function enqueueDocumentCleanup(tx: Pick<Prisma.TransactionClient, "documentCleanup">, sourceUrl: string | null, userId: string, kind: DocumentKind) {
  if (!sourceUrl) return null;
  const id = createHash("sha256").update(JSON.stringify([userId, kind, sourceUrl])).digest("hex");
  await tx.documentCleanup.upsert({ where: { id }, create: { id, sourceUrl, userId, kind }, update: {} });
  return id;
}

