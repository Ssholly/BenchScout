const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { POST } = require('../app/api/employer/talent/route.ts');
const { PUT } = require('../app/api/jobs/status/route.ts');
const req = (path, method, body) => new Request(`http://localhost:3000${path}`, { method, headers: { cookie: `benchscout_session=${'a'.repeat(64)}`, Origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
let job, writes;
beforeEach(() => {
    job = { id: 'vacancy', employerId: 'lab', userId: null, isDirectPost: true, status: 'active', role: 'Scientist', jobType:'full-time' };
    writes = 0;
    prisma.authSession.findUnique = async () => ({ subjectId: 'lab', role: 'employer', expiresAt: new Date(Date.now() + 60000) });
    prisma.employer.findUnique = async () => ({ id: 'lab', email: 'lab@example.com', companyName: 'Lab', isVerified: true });
    prisma.user.findUniqueOrThrow = async () => ({careerPhase:"licensed"});
    prisma.job.findUnique = prisma.job.findUniqueOrThrow = async () => job;
    prisma.application.findFirst = async () => ({ id: 'previous-application' });
    prisma.rateLimit.upsert = async () => ({ count: 1 });
    prisma.notification.create = async () => { writes++; return { createdAt: new Date() }; };
});
test('only an active vacancy owned by the reviewed employer can receive an invitation', async () => {
    assert.equal((await POST(req('/api/employer/talent', 'POST', { candidateId: 'scientist', jobId: 'vacancy' }))).status, 200);
    assert.equal(writes, 1);
    for (const status of ['applied', 'interviewing', 'closed', 'cleared']) {
        job.status = status;
        const response = await POST(req('/api/employer/talent', 'POST', { candidateId: 'scientist', jobId: 'vacancy' }));
        assert.equal(response.status, 400);
        assert.match((await response.json()).error, /no longer active/);
    }
    job.employerId = 'other-lab';
    assert.equal((await POST(req('/api/employer/talent', 'POST', { candidateId: 'scientist', jobId: 'vacancy' }))).status, 403);
    assert.equal(writes, 1);
});
test('candidate stage updates cannot overwrite the status of a legacy employer-posted vacancy', async () => {
    prisma.authSession.findUnique = async () => ({ subjectId: 'scientist', role: 'candidate', expiresAt: new Date(Date.now() + 60000) });
    prisma.user.findUnique = async () => ({ id: 'scientist', email: 'scientist@example.com', name: 'Scientist', isVerified: true });
    job.userId = 'scientist';
    prisma.job.updateMany = async ({ where }) => {
        assert.deepEqual(where, { id: 'vacancy', isDirectPost: false });
        if (job.isDirectPost) return { count: 0 };
        writes++; return { count: 1 };
    };
    const response = await PUT(req('/api/jobs/status', 'PUT', { jobId: 'vacancy', status: 'interviewing' }));
    assert.equal(response.status, 400);
    assert.equal(writes, 0);
    job.isDirectPost = false;
    assert.equal((await PUT(req('/api/jobs/status', 'PUT', { jobId: 'vacancy', status: 'interviewing' }))).status, 200);
    assert.equal(writes, 1);
});
