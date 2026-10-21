import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { documentFields, privateBlobToken } from "@/lib/documents";
import { backupConfiguration, backupEnabled, backupPath, backupDocument, readPrivateBytes, restoreDocumentBytes, purgeDocumentBackup } from "@/lib/document-backup";

const fields = Object.entries(documentFields);
const maxUsers = 100;
const maxFiles = 10;
const planLifetime = 15 * 60 * 1000;
type Reference = { userId: string; field: string; kind: string; source: string };
type Plan = { version: 1; purpose: string; target: string; configuration: string; manifest: string; expiresAt: number };

async function targetConfiguration(expected: unknown) {
  if (process.env.VERCEL_ENV !== "production" || process.env.DOCUMENT_BACKUP_TEST_MODE === "true") throw new ApiError(403, "Use Production with synthetic test mode off.");
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected)) throw new ApiError(400, "Enter the independently verified database fingerprint.");
  if (!backupEnabled()) throw new ApiError(503, "Enable document backups first.");
  const { token, key } = backupConfiguration();
  const sourceToken = privateBlobToken();
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 32) throw new ApiError(503, "Administrator configuration needs attention.");
  let url: URL;
  try { url = new URL(process.env.DATABASE_URL || ""); } catch { throw new ApiError(503, "Database configuration needs attention."); }
  const name = decodeURIComponent(url.pathname.slice(1));
  const target = createHash("sha256").update(`${url.hostname.replace(/-pooler(?=\.)/, "")}/${name}`).digest("hex");
  if (target !== expected) throw new ApiError(409, "Database target differs from the approved fingerprint. No files copied.");
  const connected = await prisma.$queryRaw<Array<{ name: string }>>`SELECT current_database() AS name`;
  if (connected[0]?.name !== name) throw new ApiError(409, "Connected database does not match its configured target.");
  const applyEnabled = process.env.DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED === "true";
  const configuration = createHmac("sha256", secret).update(JSON.stringify([sourceToken, token, key.toString("hex"), applyEnabled])).digest("hex");
  return { target, configuration, secret, sourceToken, applyEnabled };
}

async function snapshot() {
  const rows = await prisma.user.findMany({ take: maxUsers + 1, orderBy: { id: "asc" }, select: { id: true, ...Object.fromEntries(fields.map(([, field]) => [field, true])) } });
  if (rows.length > maxUsers) throw new ApiError(409, "Inventory exceeds the reviewed pilot limit. Prepare a bounded batch plan.");
  const references: Reference[] = [];
  let blockedReferences = 0;
  const kinds = Object.fromEntries(fields.map(([kind]) => [kind, 0]));
  const manifestRows: Array<[string, string, unknown]> = [];
  for (const raw of rows) {
    const row = raw as unknown as { id: string } & Record<string, unknown>;
    for (const [kind, field] of fields) {
      const source = row[field];
      // Include missing fields too: adding/removing any vault reference invalidates approval.
      manifestRows.push([row.id, field, source ?? null]);
      if (!source) continue;
      try {
        if (typeof source !== "string") throw new Error("Invalid source");
        const url = new URL(source);
        if (url.port || url.pathname === "/") throw new Error("Unsupported source");
        backupPath(source); // Strict HTTPS/private URL validation without storage access.
        references.push({ userId: row.id, kind, field, source });
        kinds[kind]++;
      } catch { blockedReferences++; }
    }
  }
  const manifest = createHash("sha256").update(JSON.stringify(manifestRows)).digest("hex");
  const sources = [...new Set(references.map(reference => reference.source))];
  return { references, sources, manifest, summary: { eligibleReferences: references.length, uniqueFiles: sources.length, blockedReferences, kinds, limit: maxFiles } };
}

function signature(payload: string, secret: string) { return createHmac("sha256", secret).update(payload).digest("base64url"); }
function decodePlan(token: unknown, secret: string): Plan {
  if (typeof token !== "string" || token.length > 3000) throw new ApiError(400, "Create a fresh backfill preview first.");
  const parts = token.split(".");
  if (parts.length !== 2) throw new ApiError(400, "Invalid backfill plan.");
  const expected = signature(parts[0], secret);
  if (parts[1].length !== expected.length || !timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expected))) throw new ApiError(400, "Backfill plan was changed. Preview again.");
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); } catch { throw new ApiError(400, "Invalid backfill plan."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new ApiError(400, "Invalid backfill plan.");
  const plan = parsed as Plan;
  if (plan.version !== 1 || plan.purpose !== "production-current-private-files" || !Number.isFinite(plan.expiresAt) || plan.expiresAt <= Date.now() || plan.expiresAt > Date.now() + planLifetime) throw new ApiError(409, "Backfill plan expired or is invalid. Preview again.");
  return plan;
}

export async function previewProductionBackfill(expected: unknown) {
  const config = await targetConfiguration(expected);
  const inventory = await snapshot();
  const inventoryReady = inventory.sources.length > 0 && inventory.sources.length <= maxFiles && inventory.summary.blockedReferences === 0;
  const canApply = inventoryReady && config.applyEnabled;
  const expiresAt = Date.now() + planLifetime;
  const plan: Plan = { version: 1, purpose: "production-current-private-files", target: config.target, configuration: config.configuration, manifest: inventory.manifest, expiresAt };
  const payload = Buffer.from(JSON.stringify(plan)).toString("base64url");
  return { dryRun: true, ...inventory.summary, inventoryReady, applyEnabled: config.applyEnabled, canApply, expiresAt: new Date(expiresAt).toISOString(), planToken: canApply ? `${payload}.${signature(payload, config.secret)}` : null, fileContentsRead: false, businessRecordsChanged: false, applicationGrantsChanged: false };
}

export async function applyProductionBackfill(expected: unknown, token: unknown, confirm: unknown) {
  if (confirm !== "COPY CURRENT PRIVATE FILES") throw new ApiError(400, "Confirm the reviewed current-file copy and stale-archive cleanup.");
  if (process.env.DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED !== "true") throw new ApiError(403, "Backfill apply is disabled. Review live backup hooks or an approved write pause before enabling it.");
  const config = await targetConfiguration(expected);
  const plan = decodePlan(token, config.secret);
  if (plan.target !== config.target || plan.configuration !== config.configuration) throw new ApiError(409, "Target or backup configuration changed. Preview again.");
  const inventory = await snapshot();
  if (plan.manifest !== inventory.manifest || inventory.summary.blockedReferences || !inventory.sources.length || inventory.sources.length > maxFiles) throw new ApiError(409, "Current file inventory changed or is outside the reviewed limit. Preview again; no files copied.");
  let verified = 0, stalePurged = 0, skippedChanged = 0, failed = 0;
  for (const source of inventory.sources) {
    try {
      const current = await snapshot();
      const approved = inventory.references.filter(reference => reference.source === source);
      const stillApproved = approved.every(reference => current.references.some(item => item.userId === reference.userId && item.field === reference.field && item.source === source));
      if (!stillApproved) { skippedChanged++; continue; }
      const bytes = await readPrivateBytes(source, config.sourceToken, 4 * 1024 * 1024);
      const beforeWrite = await snapshot();
      if (!approved.every(reference => beforeWrite.references.some(item => item.userId === reference.userId && item.field === reference.field && item.source === source))) { skippedChanged++; continue; }
      await backupDocument(source, bytes);
      const recovered = await restoreDocumentBytes(source);
      if (!recovered.equals(bytes)) throw new Error("Backfill integrity mismatch");
      const latest = await snapshot();
      if (!latest.references.some(reference => reference.source === source)) {
        await purgeDocumentBackup(source);
        stalePurged++;
      } else verified++;
    } catch {
      failed++;
      console.error(JSON.stringify({ event: "production_backfill_item_failed" }));
    }
  }
  const inventoryChanged = (await snapshot()).manifest !== inventory.manifest;
  return { dryRun: false, ...inventory.summary, verified, stalePurged, skippedChanged, failed, inventoryChanged, passed: verified === inventory.sources.length && !failed && !stalePurged && !skippedChanged && !inventoryChanged, businessRecordsChanged: false, applicationGrantsChanged: false };
}
