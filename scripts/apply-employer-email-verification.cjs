// Additive upgrade only; existing employer access and review approvals are preserved.
require('@next/env').loadEnvConfig(process.cwd());
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const statements = fs.readFileSync('prisma/migrations/20261012000000_employer_email_confirmation/migration.sql','utf8').split(';').map(sql=>sql.trim()).filter(Boolean);
    await prisma.$transaction(statements.map(sql=>prisma.$executeRawUnsafe(sql)));
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Employer' AND column_name IN ('emailVerificationRequired', 'emailVerifiedAt')`;
    console.log(JSON.stringify({ employerEmailColumnsPresent: columns.length === 2 }));
}
main().catch(error=>{ console.error('Employer email upgrade failed:',error.code||error.name);process.exitCode=1; }).finally(()=>prisma.$disconnect());
