import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { ApiError } from "@/lib/security";
import { backupDocument, purgeDocumentBackup } from "@/lib/document-backup";
export const documentFields = { resume: "resumeUrl", license: "licenseUrl", provisional: "provisionalUrl", degree: "degreeUrl", result: "statementOfResultUrl", placement: "placementLetterUrl", certificate: "certificateUrl", avatar: "avatarUrl" } as const;
export type DocumentKind = keyof typeof documentFields;
export function documentKind(value: unknown): DocumentKind {
  if (typeof value !== "string" || !Object.hasOwn(documentFields, value)) throw new ApiError(400, "Unsupported document type.");
  return value as DocumentKind;
}
export async function validateDocument(file: FormDataEntryValue | null, kind: DocumentKind) {
  if (!(file instanceof File) || file.size === 0) throw new ApiError(400, "Choose a file to upload.");
  if (file.size > 4 * 1024 * 1024) throw new ApiError(413, "Files must be 4 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdf = buffer.subarray(0, 5).toString() === "%PDF-";
  const png = buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  const mime = pdf ? "application/pdf" : png ? "image/png" : jpg ? "image/jpeg" : null;
  if (!mime || file.type !== mime || (kind === "avatar" && pdf) || (kind === "resume" && !pdf)) throw new ApiError(400, kind === "resume" ? "Upload your CV as a PDF." : "Upload a PDF, PNG or JPEG file. Avatars must be PNG or JPEG.");
  return { buffer, mime, extension: pdf ? "pdf" : png ? "png" : "jpg" };
}
export function privateBlobToken(): string {
  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!token) throw new ApiError(503, "Private document storage is not configured yet.");
  return token;
}
export async function storeDocument(file: FormDataEntryValue | null, kind: DocumentKind, userId: string) {
  const validated = await validateDocument(file, kind);
  const blob = await put(`documents/${userId}/${kind}/${randomUUID()}.${validated.extension}`, validated.buffer, { access: "private", contentType: validated.mime, token: privateBlobToken() });
  try { await backupDocument(blob.url, validated.buffer); }
  catch (error) {
    await purgeDocumentBackup(blob.url).catch(() => console.error("Uncommitted backup cleanup needs operator attention"));
    await del(blob.url, { token: privateBlobToken() }).catch(() => console.error("Uncommitted document cleanup failed"));
    throw error;
  }
  return { ...blob, buffer: validated.buffer };
}
export function isPrivateBlob(url: string) {
  try { return new URL(url).hostname.endsWith(".private.blob.vercel-storage.com"); } catch { return false; }
}
export async function removeDocument(url: string | null) {
  if (!url) return;
  const host = new URL(url).hostname;
  if (!host.endsWith(".blob.vercel-storage.com")) throw new ApiError(400, "Unknown document storage location.");
  if (isPrivateBlob(url)) await purgeDocumentBackup(url);
  await del(url, { token: isPrivateBlob(url) ? privateBlobToken() : process.env.BLOB_READ_WRITE_TOKEN });
}
export async function resumeText(buffer: Buffer) {
  try {
    const { pdfToText } = await import("pdf-ts");
    return (await pdfToText(buffer)).slice(0, 50000);
  } catch { return null; }
}
