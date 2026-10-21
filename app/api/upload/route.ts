import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, documentUrl } from "@/lib/security";
import { documentFields, documentKind, resumeText, storeDocument, type DocumentKind } from "@/lib/documents";
import { enqueueDocumentCleanup, tryDocumentCleanup } from "@/lib/document-cleanup";

export const maxDuration = 60;

function reviewReset(kind: DocumentKind) {
  return {
    ...(kind === "license" ? { licenseNumber: null, licenseExpiry: null } : {}),
    ...(["license", "provisional"].includes(kind) ? { credentialRevision: { increment: 1 }, licenseReviewRevision: null, isLicenseVerified: false, licenseReviewedAt: null, licenseReviewReference: null } : {}),
  };
}
export const POST = withApi("candidate", async (request, session) => {
  const form = await request.formData();
  if (form.get("email") && form.get("email") !== session!.email) throw new ApiError(403, "Account identity does not match your session.");
  const kind = documentKind(form.get("documentType"));
  const field = documentFields[kind];
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  const blob = await storeDocument(form.get("file"), kind, user.id);
  let committed;
  try {
    const parsedText = kind === "resume" ? await resumeText(blob.buffer) : undefined;
    committed = await prisma.$transaction(async tx => {
      const changed = await tx.user.updateMany({ where: { id: user.id, [field]: user[field] ?? null, credentialRevision: user.credentialRevision }, data: {
        [field]: blob.url, ...reviewReset(kind), ...(kind === "resume" ? { cvParsedText: parsedText } : {}),
      } });
      if (!changed.count) throw new ApiError(409, "Your document changed. Refresh your profile and try again.");
      const cleanupId = await enqueueDocumentCleanup(tx, user[field], user.id, kind);
      return { user: await tx.user.findUniqueOrThrow({ where: { id: user.id } }), cleanupId };
    });
  } catch (error) {
    // A network error during commit can have an ambiguous outcome. Never
    // directly delete the new source: queue it and recheck current references.
    try {
      const cleanupId = await enqueueDocumentCleanup(prisma, blob.url, user.id, kind);
      await tryDocumentCleanup(cleanupId);
    } catch { console.error("Uncommitted file reconciliation needs operator attention"); }
    throw error;
  }
  const cleanupPending = await tryDocumentCleanup(committed.cleanupId);
  return NextResponse.json({ success: true, url: documentUrl(user.id, kind), user: committed.user, cleanupPending,
    ...(kind === "resume" ? { resumeTextReady: Boolean(committed.user.cvParsedText?.trim()) } : {}),
  });
}, { limit: 10 });

export const DELETE = withApi("candidate", async (request, session) => {
  const body = await request.json();
  const kind = documentKind(body.documentType);
  const field = documentFields[kind];
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  if (!user[field]) return NextResponse.json({ success: true, cleanupPending: !!await prisma.documentCleanup.count({ where: { userId: user.id, kind } }) });
  const cleanupId = await prisma.$transaction(async tx => {
    const changed = await tx.user.updateMany({ where: { id: user.id, [field]: user[field] ?? null, credentialRevision: user.credentialRevision }, data: {
      [field]: null, ...reviewReset(kind), ...(kind === "resume" ? { cvParsedText: null } : {}),
    } });
    if (!changed.count) throw new ApiError(409, "Your document changed. Refresh your profile and try again.");
    return enqueueDocumentCleanup(tx, user[field], user.id, kind);
  });
  const cleanupPending = await tryDocumentCleanup(cleanupId);
  return NextResponse.json({ success: true, cleanupPending });
});
