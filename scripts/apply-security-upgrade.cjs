// Applies only the reviewed additive security migration to the configured database.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cli = require.resolve('prisma/build/index.js');
function run(args, allowed = [0]) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding:'utf8' });
  if (!allowed.includes(result.status)) throw new Error(`Database upgrade stopped at ${args.slice(0,2).join(' ')}. No later steps were run.`);
  return result;
}
async function main() {
  const sql = fs.readFileSync('prisma/migrations/20261009000000_security_foundation/migration.sql','utf8');
  if (/DROP\s+(TABLE|COLUMN)|DELETE\s+FROM|TRUNCATE/i.test(sql)) throw new Error('Refusing a destructive migration.');
  const diff = run(['migrate','diff','--from-schema-datasource','prisma/schema.prisma','--to-schema-datamodel','/private/tmp/benchscout-original-schema.prisma','--script','--exit-code'], [0,2]);
  if (diff.status !== 0) throw new Error('The database no longer matches the reviewed original schema. Re-check it before upgrading.');
  const history = await prisma.$queryRaw`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations') AS present`;
  if (history[0].present) throw new Error('Migration history appeared after review. Check it before proceeding.');
  const before = await prisma.$queryRaw`SELECT (SELECT COUNT(*)::int FROM "User") AS users, (SELECT COUNT(*)::int FROM "Employer") AS employers, (SELECT COUNT(*)::int FROM "Job") AS jobs, (SELECT COUNT(*)::int FROM "Application") AS applications`;
  run(['migrate','resolve','--applied','20260527000000_baseline']);
  run(['migrate','deploy']);
  const after = await prisma.$queryRaw`SELECT (SELECT COUNT(*)::int FROM "User") AS users, (SELECT COUNT(*)::int FROM "Employer") AS employers, (SELECT COUNT(*)::int FROM "Job") AS jobs, (SELECT COUNT(*)::int FROM "Application") AS applications`;
  const preserved = Object.keys(before[0]).every(key => after[0][key] >= before[0][key]);
  console.log(JSON.stringify({ applied:true, existingRecordsPreserved:preserved },null,2));
  if (!preserved) throw new Error('Existing record counts decreased. Check concurrent activity before continuing.');
}
main().catch(error => { console.error(error.message); process.exitCode=1; }).finally(() => prisma.$disconnect());
