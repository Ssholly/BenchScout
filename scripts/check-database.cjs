// Read-only compatibility report. Never prints connection strings or user records.
require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const columns = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`;
  const needed = {
    DocumentCleanup: ['id','userId','kind','sourceUrl','attempts','nextAttemptAt','leaseUntil','lastErrorCode','createdAt'],
    User: ['credentialRevision','licenseReviewRevision','licenseReviewedAt','licenseReviewReference','scanTime','scanDays','scanTimezone','lastScheduledAt','scanLeaseUntil'],
    Employer: ['verificationReference','verifiedAt','verificationStatus','verificationDetails','verificationRevision','verificationFeedback'],
    SafetyReview: ['id','kind','subjectId','decision','reviewer','evidence','createdAt'],
    JobReport: ['id','jobId','reporterId','reason','details','status','resolution','createdAt','resolvedAt'],
    Application: ['documentSelection'],
    Job: ['source','lastSeenAt'], SalaryReport: ['ownerKey'],
    AuthSession: ['tokenHash','subjectId','role','expiresAt','createdAt'], RateLimit: ['key','count','expiresAt'],
  };
  const missing = Object.entries(needed).flatMap(([table, fields]) => fields.filter(field => !columns.some(row => row.table_name === table && row.column_name === field)).map(field => `${table}.${field}`));
  const history = columns.some(row => row.table_name === '_prisma_migrations');
  console.log(JSON.stringify({ missing, migrationHistoryPresent: history, compatible: missing.length === 0 }, null, 2));
}
main().catch(error => { console.error('Read-only database check failed:', error.code || error.name); process.exitCode = 1; }).finally(() => prisma.$disconnect());
