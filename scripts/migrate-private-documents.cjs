// Dry-run by default. Requires explicit --apply after database and blob backups.
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { put, del } = require('@vercel/blob');
try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const prisma = new PrismaClient();
const fields = ['resumeUrl', 'licenseUrl', 'provisionalUrl', 'degreeUrl', 'avatarUrl'];
async function main() {
  const apply = process.argv.includes('--apply');
  const users = await prisma.user.findMany({ select: { id: true, resumeUrl: true, licenseUrl: true, provisionalUrl: true, degreeUrl: true, avatarUrl: true } });
  const groups = new Map();
  for (const user of users) for (const field of fields) {
    const value = user[field]; if (!value) continue;
    let url; try { url = new URL(value); } catch { continue; }
    if (!url.hostname.endsWith('.public.blob.vercel-storage.com')) continue;
    const refs = groups.get(value) || []; refs.push({ id: user.id, field }); groups.set(value, refs);
  }
  console.log(`${groups.size} public objects referenced by ${users.length} accounts. Mode: ${apply ? 'APPLY' : 'DRY RUN'}.`);
  if (!apply) { console.log('No files changed. Configure a separate PRIVATE blob store token and rerun with --apply after backup.'); return; }
  if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN || !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Both private and legacy public store tokens are required.');
  let migrated = 0;
  for (const [oldUrl, refs] of groups) {
    const response = await fetch(oldUrl, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Migration stopped: a legacy object could not be read (${response.status}).`);
    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const extension = contentType.includes('pdf') ? 'pdf' : contentType.includes('png') ? 'png' : 'jpg';
    const blob = await put(`migrated/${randomUUID()}.${extension}`, Buffer.from(bytes), { access: 'private', contentType, token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN });
    try {
      await prisma.$transaction(async tx => {
        for (const ref of refs) {
          const changed = await tx.user.updateMany({ where: { id: ref.id, [ref.field]: oldUrl }, data: { [ref.field]: blob.url, ...(["licenseUrl","provisionalUrl"].includes(ref.field) ? {credentialRevision:{increment:1},licenseReviewRevision:null,isLicenseVerified:false,licenseReviewedAt:null,licenseReviewReference:null} : {}) } });
          if (changed.count !== 1) throw new Error('Document changed during migration. Retry during maintenance.');
        }
      });
    } catch (error) { await del(blob.url, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN }); throw error; }
    // Remove the old public object only after all references point to the private copy.
    try { await del(oldUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }); }
    catch { console.error(`Public cleanup failed for migration ${migrated + 1}. The object pathname is ${new URL(oldUrl).pathname}. Remove it from the old store before reopening access.`); process.exitCode = 1; }
    migrated++;
  }
  console.log(`Migrated ${migrated} objects. Previously shared public links require deletion from the legacy store to stop serving.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
