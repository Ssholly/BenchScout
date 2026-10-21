import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { put, get, del } from "@vercel/blob";
import { sendEmail } from "@/lib/mailer";
import { ApiError } from "@/lib/security";

const MAX_BYTES = 4 * 1024 * 1024;
const MAGIC = Buffer.from("BSB1");
export const backupEnabled = () => process.env.DOCUMENT_BACKUP_ENABLED === "true";
export function backupConfiguration() {
  const token = process.env.BLOB_BACKUP_READ_WRITE_TOKEN;
  const key = process.env.DOCUMENT_BACKUP_ENCRYPTION_KEY;
  if (!token || !key || !/^[a-f0-9]{64}$/i.test(key) || token === process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) {
    throw new ApiError(503, "Private backup configuration needs operator attention.");
  }
  return { token, key: Buffer.from(key, "hex") };
}
function sourceIdentity(source: string) {
  const url = new URL(source);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".private.blob.vercel-storage.com") || url.username || url.password || url.search || url.hash) throw new Error("Invalid private backup source");
  return createHash("sha256").update(source).digest();
}
export function backupPath(source: string) { return `document-backups/v1/${sourceIdentity(source).toString("hex")}.bin`; }
export function sealBackup(bytes: Buffer, source: string, key: Buffer) {
  if (!bytes.length || bytes.length > MAX_BYTES || key.length !== 32) throw new Error("Invalid backup input");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(sourceIdentity(source));
  const payload = Buffer.concat([createHash("sha256").update(bytes).digest(), bytes]);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), encrypted]);
}
export function openBackup(envelope: Buffer, source: string, key: Buffer) {
  if (envelope.length <= 64 || envelope.length > MAX_BYTES + 64 || !envelope.subarray(0, 4).equals(MAGIC)) throw new Error("Invalid backup envelope");
  const decipher = createDecipheriv("aes-256-gcm", key, envelope.subarray(4, 16));
  decipher.setAAD(sourceIdentity(source));
  decipher.setAuthTag(envelope.subarray(16, 32));
  const payload = Buffer.concat([decipher.update(envelope.subarray(32)), decipher.final()]);
  const bytes = payload.subarray(32);
  if (!createHash("sha256").update(bytes).digest().equals(payload.subarray(0, 32))) throw new Error("Backup checksum mismatch");
  return bytes;
}
export async function readPrivateBytes(path: string, token: string, limit = MAX_BYTES + 64) {
  const result = await get(path, { access: "private", token, useCache: false });
  if (!result || result.statusCode !== 200 || result.blob.size > limit) throw new Error("Private object unavailable");
  const reader = result.stream.getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > limit) throw new Error("Private object exceeds backup limit");
      chunks.push(Buffer.from(next.value));
    }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks);
}
async function retry<T>(action: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await action(); } catch {
      if (attempt === 2) throw new Error("Backup operation exhausted retries");
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}
async function failure(operation: string): Promise<never> {
  // Deliberately omit provider errors: they may contain private URLs/tokens.
  console.error(JSON.stringify({ event: "document_backup_failure", operation }));
  const recipient = process.env.DOCUMENT_BACKUP_ALERT_EMAIL;
  if (recipient) {
    const message = `BenchScout document backup operation failed: ${operation}. Review protected deployment logs. No document data is included. The operation did not establish successful backup or recovery.`;
    await sendEmail(recipient, "BenchScout document backup needs attention", `<p>${message}</p>`, message)
      .catch(() => console.error(JSON.stringify({ event: "document_backup_alert_failed" })));
  }
  throw new ApiError(503, "Document protection is temporarily unavailable. Please try again.");
}
export async function backupDocument(source: string, bytes: Buffer) {
  if (!backupEnabled()) return;
  try {
    const { token, key } = backupConfiguration();
    const envelope = sealBackup(bytes, source, key);
    const blob = await retry(() => put(backupPath(source), envelope, { access: "private", token, contentType: "application/octet-stream", addRandomSuffix: false, allowOverwrite: true }));
    if (new URL(blob.url).hostname === new URL(source).hostname) throw new Error("Backup must use a separate private store");
    const recovered = openBackup(await retry(() => readPrivateBytes(backupPath(source), token)), source, key);
    if (!recovered.equals(bytes)) throw new Error("Backup read-back mismatch");
  } catch { return failure("write-and-verify"); }
}
export async function purgeDocumentBackup(source: string) {
  const token = process.env.BLOB_BACKUP_READ_WRITE_TOKEN;
  if (!backupEnabled() && !token) return;
  try {
    if (!token || token === process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) throw new Error("Backup token unavailable");
    await retry(() => del(backupPath(source), { token }));
  } catch { return failure("purge"); }
}
export async function restoreDocumentBytes(source: string) {
  try {
    const { token, key } = backupConfiguration();
    return openBackup(await retry(() => readPrivateBytes(backupPath(source), token)), source, key);
  } catch { return failure("restore"); }
}
