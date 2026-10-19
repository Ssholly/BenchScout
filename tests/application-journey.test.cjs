const { prisma, mailer } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const apply = require('../app/api/apply/route.ts');
const applicants = require('../app/api/jobs/applicants/route.ts');
const documents = require('../app/api/documents/route.ts');
const vacancies = require('../app/api/jobs/direct/route.ts');
const { currentCredentialReview } = require('../lib/credential-review.ts');
const { documentRevision } = require('../lib/application-documents.ts');
const { sanitizeResponse } = require('../lib/security.ts');
let role, user, job, applications, notifications, writes;
const req = (path, method, body) => new Request(`http://localhost:3000/api/${path}`, {
  method, headers: { cookie: `benchscout_session=${'d'.repeat(64)}`, Origin: 'http://localhost:3000', ...(body ? { 'Content-Type': 'application/json' } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
beforeEach(() => {
  role = 'candidate'; applications = []; notifications = []; writes = 0;
  user = { id: 'candidate', name: 'Test Candidate', email: 'candidate@example.com', isVerified: true, careerPhase: 'licensed', resumeUrl: 'https://store.private.blob.vercel-storage.com/cv.pdf' };
  job = { id: 'vacancy', role: 'Medical Laboratory Scientist', company: 'Test Lab', userId: null, employerId: 'employer', isDirectPost: true, jobType: 'full-time', status: 'active', listingDetails: {} };
  prisma.authSession.findUnique = async () => ({ role, subjectId: role === 'candidate' ? 'candidate' : 'employer', expiresAt: new Date(Date.now() + 60000) });
  prisma.user.findUnique = prisma.user.findUniqueOrThrow = async () => user;
  prisma.employer.findUnique = async () => ({ id: 'employer', email: 'hr@example.com', companyName: 'Test Lab', isVerified: true });
  prisma.job.findUnique = prisma.job.findUniqueOrThrow = async () => job;
  prisma.job.update = async () => { writes++; return job; };
  prisma.rateLimit.upsert = async () => ({ count: 1 });
  prisma.application.upsert = async ({ create }) => {
    const existing = applications.find(row => row.userId === create.userId && row.jobId === create.jobId);
    if (existing) return existing;
    const application = { id: 'application', status: 'pending', ...create };
    applications.push(application); writes++; return application;
  };
  prisma.application.deleteMany = async ({ where }) => {
    const before = applications.length;
    applications = applications.filter(row => row.jobId !== where.jobId || row.userId !== where.userId);
    return { count: before - applications.length };
  };
  prisma.application.findMany = async ({ where }) => applications.filter(row=>row.userId === where.userId && (!where.id || row.id === where.id) && job.employerId === where.job.employerId);
  prisma.application.findFirst = async ({ where }) => applications.find(row => row.userId === where.userId && job.employerId === where.job.employerId) || null;
  prisma.application.findUnique = async ({ where }) => {
    const row = applications.find(row => row.id === where.id);
    return row ? { ...row, job } : null;
  };
  prisma.application.update = async ({ where, data }) => {
    const row = applications.find(row => row.id === where.id);
    if (!row) throw new Error('Missing application');
    Object.assign(row, data); writes++; return { ...row, job };
  };
  prisma.notification.create = async ({ data }) => { notifications.push(data); return data; };
  prisma.$transaction = async callback => callback(prisma);
  mailer.sendEmail = async () => {};
});

test('direct application requires a private CV, and duplicate submission preserves the existing stage', async () => {
  for (const cv of [null, 'https://store.public.blob.vercel-storage.com/cv.pdf', 'not-a-url']) {
    user.resumeUrl = cv;
    assert.equal((await apply.POST(req('apply', 'POST', { jobId: job.id }))).status, 400);
  }
  assert.equal(writes, 0);
  user.resumeUrl = 'https://store.private.blob.vercel-storage.com/cv.pdf';
  assert.equal((await apply.POST(req('apply', 'POST', { jobId: job.id, selectedDocuments: [{kind:'resume',revision:documentRevision(user.resumeUrl)}] }))).status, 200);
  applications[0].status = 'shortlisted';
  assert.equal((await apply.POST(req('apply', 'POST', { jobId: job.id, selectedDocuments: [{kind:'resume',revision:documentRevision(user.resumeUrl)}] }))).status, 200);
  assert.equal(applications.length, 1); assert.equal(applications[0].status, 'shortlisted');
});

test('withdrawal is scoped to the candidate and remains possible after the vacancy closes or is suspended', async () => {
  for (const status of ['active', 'closed', 'pending-review', 'cleared']) {
    job.status = status;
    applications = [{ id: 'mine', jobId: job.id, userId: 'candidate' }, { id: 'theirs', jobId: job.id, userId: 'other' }];
    assert.equal((await apply.DELETE(req('apply', 'DELETE', { jobId: job.id, selectedDocuments: [{kind:'resume',revision:documentRevision(user.resumeUrl)}] }))).status, 200);
    assert.deepEqual(applications.map(row => row.id), ['theirs']);
  }
  assert.equal((await apply.DELETE(req('apply', 'DELETE', { jobId: job.id }))).status, 404);
});

test('withdrawal cannot modify another candidate external listing or accept a malformed job ID', async () => {
  job.isDirectPost = false; job.userId = 'other';
  assert.equal((await apply.DELETE(req('apply', 'DELETE', { jobId: job.id }))).status, 403);
  assert.equal((await apply.DELETE(req('apply', 'DELETE', {}))).status, 400);
  assert.equal(writes, 0);
});

test('withdrawing the final employer application revokes document access before storage is called', async () => {
  applications = [{ id: 'mine', jobId: job.id, userId: 'candidate' }]; job.status = 'closed';
  assert.equal((await apply.DELETE(req('apply', 'DELETE', { jobId: job.id, selectedDocuments: [{kind:'resume',revision:documentRevision(user.resumeUrl)}] }))).status, 200);
  role = 'employer';
  assert.equal((await documents.GET(req('documents?userId=candidate&kind=resume', 'GET'))).status, 403);
});

test('interview persists and notifies in-app even when email fails, without claiming delivery', async () => {
  role = 'employer'; applications = [{ id: 'application', userId: user.id, jobId: job.id, status: 'pending' }];
  mailer.sendEmail = async () => { throw new Error('Simulated delivery failure'); };
  const response = await applicants.PATCH(req('jobs/applicants', 'PATCH', { applicationId: 'application', status: 'shortlisted', interviewDate: '2030-01-10', interviewTime: '10:30', interviewLoc: 'Video call' }));
  assert.equal(response.status, 200); assert.equal((await response.json()).emailDelivered, false);
  assert.equal(applications[0].status, 'shortlisted'); assert.equal(notifications.length, 1);
});

test('invalid or cross-employer interview updates write neither status nor notifications', async () => {
  role = 'employer'; applications = [{ id: 'application', userId: user.id, jobId: job.id, status: 'pending' }];
  const body = { applicationId: 'application', status: 'shortlisted', interviewDate: '2030-02-30', interviewTime: '10:30', interviewLoc: 'Video call' };
  assert.equal((await applicants.PATCH(req('jobs/applicants', 'PATCH', body))).status, 400);
  job.employerId = 'other'; body.interviewDate = '2030-02-20';
  assert.equal((await applicants.PATCH(req('jobs/applicants', 'PATCH', body))).status, 403);
  assert.equal(writes, 0); assert.equal(notifications.length, 0);
});

test('closing a vacancy preserves applications and uses an employer-scoped update instead of deletion', async () => {
  role = 'employer'; applications = [{ id: 'application', userId: user.id, jobId: job.id }];
  prisma.job.deleteMany = async () => { throw new Error('Must not cascade-delete application history'); };
  prisma.job.updateMany = async ({ where, data }) => {
    assert.deepEqual(where, { id: job.id, employerId: 'employer' });
    Object.assign(job, data); return { count: 1 };
  };
  assert.equal((await vacancies.DELETE(req('jobs/direct', 'DELETE', { jobId: job.id, selectedDocuments: [{kind:'resume',revision:documentRevision(user.resumeUrl)}] }))).status, 200);
  assert.equal(job.status, 'closed'); assert.equal(applications.length, 1);
});

test('bulk applicant deletion is disabled even for the owning employer', async () => {
  role = 'employer'; applications = [{ id: 'application', userId: user.id, jobId: job.id }];
  prisma.application.deleteMany = async () => { throw new Error('History must be preserved'); };
  assert.equal((await applicants.DELETE(req('jobs/applicants', 'DELETE', { jobId: job.id }))).status, 409);
  assert.equal(applications.length, 1);
});

test('expired and undated practicing licenses cannot retain a current reviewed badge', () => {
  const now = new Date('2026-10-19T12:00:00Z');
  const reviewed = { isLicenseVerified: true, licenseReviewedAt: '2026-10-01', careerPhase: 'licensed', licenseExpiry: '2030-01-01' };
  assert.equal(currentCredentialReview(reviewed, now), true);
  for (const expiry of [null, 'invalid', '2026-10-18', '2026-10-19T12:00:00Z']) assert.equal(currentCredentialReview({ ...reviewed, licenseExpiry: expiry }, now), false);
  assert.equal(currentCredentialReview({ ...reviewed, licenseReviewedAt: 'invalid' }, now), false);
  assert.equal(sanitizeResponse({ ...reviewed, licenseExpiry: '2000-01-01' }).isLicenseVerified, false);
});

test('provisional review uses provisional validity rather than a past practicing license', async () => {
  user = { ...user, careerPhase: 'internship', isLicenseVerified: true, licenseReviewedAt: new Date('2026-01-01'), licenseExpiry: new Date('2000-01-01'), candidateProfile: { provisionalExpiry: '2030-01-01', nextAction: 'Private reminder' } };
  assert.equal(currentCredentialReview(user), true);
  role = 'employer';
  prisma.application.findMany = async () => [{ id: 'application', user }];
  const result = await (await applicants.GET(req('jobs/applicants?jobId=vacancy', 'GET'))).json();
  assert.equal(result.applications[0].user.isLicenseVerified, true);
  assert.equal(result.applications[0].user.candidateProfile, undefined);
  assert.ok(!JSON.stringify(result).includes('Private reminder'));
  user.candidateProfile.provisionalExpiry = '2000-01-01';
  const expired = await (await applicants.GET(req('jobs/applicants?jobId=vacancy', 'GET'))).json();
  assert.equal(expired.applications[0].user.isLicenseVerified, false);
});

test('submission captures only explicitly selected private files and rejects stale or forged selections', async () => {
  user.licenseUrl = 'https://store.private.blob.vercel-storage.com/license.pdf';
  const selectedDocuments = [{kind:'resume',revision:documentRevision(user.resumeUrl)}];
  for (const invalid of [undefined, [], [{kind:'avatar',revision:'x'}], [...selectedDocuments,...selectedDocuments], [...selectedDocuments,{kind:'degree',revision:'x'}]]) {
    assert.equal((await apply.POST(req('apply','POST',{jobId:job.id,selectedDocuments:invalid}))).status,400);
  }
  assert.equal((await apply.POST(req('apply','POST',{jobId:job.id,selectedDocuments:[{kind:'resume',revision:'stale'}]}))).status,409);
  assert.equal(writes,0);
  assert.equal((await apply.POST(req('apply','POST',{jobId:job.id,selectedDocuments}))).status,200);
  assert.deepEqual(applications[0].documentSelection,{resume:user.resumeUrl});
  const original = {...applications[0].documentSelection};
  assert.equal((await apply.POST(req('apply','POST',{jobId:job.id,selectedDocuments:[...selectedDocuments,{kind:'license',revision:documentRevision(user.licenseUrl)}]}))).status,200);
  assert.deepEqual(applications[0].documentSelection,original);
});

test('employer responses withhold unselected files and preserve application-specific guarded links', async () => {
  role='employer'; user.licenseUrl='https://store.private.blob.vercel-storage.com/license.pdf';
  prisma.application.findMany=async()=>[{id:'application',user,documentSelection:{resume:user.resumeUrl}}];
  const result=await (await applicants.GET(req('jobs/applicants?jobId=vacancy','GET'))).json();
  assert.equal(result.applications[0].documentSelection,undefined);
  assert.equal(result.applications[0].user.licenseUrl,null);
  assert.match(result.applications[0].user.resumeUrl,/applicationId=application/);
  assert.ok(!JSON.stringify(result).includes('.blob.vercel-storage.com'));
  assert.deepEqual(result.applications[0].selectedDocumentKinds,['resume']);
});
