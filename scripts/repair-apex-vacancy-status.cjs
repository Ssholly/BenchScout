// Targeted repair approved by the vacancy owner; never changes application stages.
require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const approved = [
    { id: 'cmq22y5xf0003sbw0u7ogz31b', loc: 'Garki, FCT-Abuja', status: 'interviewing' },
    { id: 'cmpzoqmf70001sb0oghlk4u22', loc: 'Wuse II, FCT-Abuja', status: 'applied' },
];
async function main() {
    const jobs = await prisma.job.findMany({
        where: { id: { in: approved.map(job => job.id) }, employer: { email: 'recruiting@apexlab.ng' }, isDirectPost: true },
        select: { id: true, loc: true, status: true },
    });
    if (jobs.length !== approved.length || approved.some(expected => !jobs.some(job => job.id === expected.id && job.loc === expected.loc && [expected.status, 'active'].includes(job.status)))) {
        throw new Error('Vacancies no longer match the approved repair. No changes made.');
    }
    if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ vacancies: jobs, apply: false })); return; }
    const result = await prisma.$transaction(approved.map(job => prisma.job.updateMany({
        where: { id: job.id, loc: job.loc, status: job.status, isDirectPost: true, employer: { email: 'recruiting@apexlab.ng' } },
        data: { status: 'active' },
    })));
    console.log(JSON.stringify({ restored: result.reduce((sum, entry) => sum + entry.count, 0), statuses: await prisma.job.findMany({ where: { id: { in: approved.map(job => job.id) } }, select: { loc: true, status: true } }) }));
}
main().catch(error => { console.error('Vacancy repair failed:', error.code || error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
