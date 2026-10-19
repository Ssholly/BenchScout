const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { professionalSummary, sharedProfessionalSummary } = require('../lib/professional-summary.ts');
const { candidateProfile } = require('../lib/candidate-profile.ts');
const applicants = require('../app/api/jobs/applicants/route.ts').GET;
const talent = require('../app/api/employer/talent/route.ts').GET;
const ownProfile = require('../app/api/user/route.ts').GET;
const saveProfile = require('../app/api/user/career/route.ts').POST;
let user, role, approved, job, writes;
function req(path, body) {
  return new Request(`http://localhost:3000/api/${path}`, { method: body ? 'POST' : 'GET', headers: { cookie: `benchscout_session=${'e'.repeat(64)}`, Origin: 'http://localhost:3000', ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
beforeEach(() => {
  role = 'employer'; approved = true; writes = 0;
  user = { id: 'candidate', name: 'Test Scientist', email: 'candidate@example.com', isVerified: true, careerPhase: 'licensed', location: 'Abuja', candidateProfile: { ...candidateProfile({}), institution: 'Example University', graduationYear: '2020', experienceYears: '4', specialties: 'Haematology', rolePreferences: 'Permanent', availabilityDate: '2030-01-01', relocation: true, shareProfessionalSummary: true, salaryPreference: 'SECRET-SALARY', provisionalNumber: 'SECRET-REG', placementInstitution: 'SECRET-PLACEMENT', nextAction: 'SECRET-REMINDER', nextActionDate: '2030-02-01', lastScan: { location: 'SECRET-SCAN' }, injected: 'SECRET-EXTRA' } };
  job = { id: 'job', employerId: 'employer', userId: null, isDirectPost: true, status: 'active' };
  prisma.authSession.findUnique = async () => ({ role, subjectId: role === 'candidate' ? 'candidate' : 'employer', expiresAt: new Date(Date.now() + 60000) });
  prisma.employer.findUnique = async () => ({ id: 'employer', companyName: 'Test Lab', email: 'hr@example.com', isVerified: approved });
  prisma.user.findUnique = prisma.user.findUniqueOrThrow = async () => user;
  prisma.user.findFirst = async ({ where }) => { assert.equal(where.email, user.email); return user; };
  prisma.job.findUnique = async () => job;
  prisma.application.findMany = async ({ where }) => { assert.deepEqual(where, { jobId: 'job' }); return [{ id: 'application', user }]; };
  prisma.user.findMany = async ({ where }) => { assert.equal(where.applications.some.job.employerId, 'employer'); return [user]; };
  prisma.rateLimit.upsert = async () => ({ count: 1 });
  prisma.user.update = async ({ where, data }) => { assert.equal(where.id, 'candidate'); Object.assign(user, data); writes++; return user; };
});

test('summary uses an explicit professional field list and never includes private profile metadata', () => {
  const summary = professionalSummary(user);
  assert.equal(summary.stage, 'Licensed scientist');
  assert.equal(summary.fields.find(field => field.label === 'Specialties').value, 'Haematology');
  assert.equal(summary.fields.find(field => field.label === 'Preferred work locations').value, 'Abuja');
  assert.ok(!JSON.stringify(summary).includes('SECRET-'));
  assert.equal(summary.isLicenseVerified, undefined);
});

test('legacy profiles and non-boolean consent values fail closed; intern previews omit licensed experience fields', () => {
  for (const value of [undefined, false, 'true', 1]) {
    user.candidateProfile.shareProfessionalSummary = value;
    assert.equal(sharedProfessionalSummary(user), null);
  }
  user.careerPhase = 'internship'; user.candidateProfile.placementStage = 'training';
  const summary = professionalSummary(user);
  assert.equal(summary.stage, 'Intern · In training');
  assert.ok(!summary.fields.some(field => ['Experience (years)', 'Specialties', 'Preferred roles'].includes(field.label)));
  assert.ok(!JSON.stringify(summary).includes('SECRET-'));
});

test('employer APIs and candidate application preview return the same consented summary without raw JSON', async () => {
  const expected = professionalSummary(user);
  const applicantResult = await (await applicants(req('jobs/applicants?jobId=job'))).json();
  const talentResult = await (await talent(req('employer/talent'))).json();
  assert.deepEqual(applicantResult.applications[0].user.professionalSummary, expected);
  assert.deepEqual(talentResult.users[0].professionalSummary, expected);
  assert.equal(applicantResult.applications[0].user.candidateProfile, undefined);
  assert.equal(applicantResult.applications[0].user.location, undefined);
  assert.ok(!JSON.stringify([applicantResult, talentResult]).includes('SECRET-'));
  role = 'candidate';
  const ownResult = await (await ownProfile(req('user'))).json();
  assert.deepEqual(ownResult.professionalSummary, expected);
});

test('turning sharing off stops both employer summary responses while retaining basic application access', async () => {
  user.candidateProfile.shareProfessionalSummary = false;
  for (const response of [await applicants(req('jobs/applicants?jobId=job')), await talent(req('employer/talent'))]) {
    assert.equal(response.status, 200);
    const body = await response.json();
    const candidate = body.users?.[0] || body.applications[0].user;
    assert.equal(candidate.professionalSummary, null);
    assert.equal(candidate.email, user.email);
    assert.ok(!JSON.stringify(body).includes('Haematology'));
  }
});

test('unreviewed or unrelated employers cannot retrieve applicant summaries', async () => {
  approved = false;
  assert.equal((await talent(req('employer/talent'))).status, 403);
  assert.equal((await applicants(req('jobs/applicants?jobId=job'))).status, 403);
  approved = true; job.employerId = 'other';
  assert.equal((await applicants(req('jobs/applicants?jobId=job'))).status, 403);
});

test('candidate can persist and revoke summary consent; older clients preserve saved choice', async () => {
  role = 'candidate';
  let profile = { ...candidateProfile(user.candidateProfile), shareProfessionalSummary: false };
  assert.equal((await saveProfile(req('user/career', { careerPhase: 'licensed', profile }))).status, 200);
  assert.equal(user.candidateProfile.shareProfessionalSummary, false);
  profile.shareProfessionalSummary = true;
  assert.equal((await saveProfile(req('user/career', { careerPhase: 'licensed', profile }))).status, 200);
  profile = { ...profile }; delete profile.shareProfessionalSummary;
  assert.equal((await saveProfile(req('user/career', { careerPhase: 'licensed', profile }))).status, 200);
  assert.equal(user.candidateProfile.shareProfessionalSummary, true);
  assert.equal(writes, 3);
});

test('invalid consent is rejected before saving and employer sessions cannot change it', async () => {
  role = 'candidate';
  const profile = { ...candidateProfile(user.candidateProfile), shareProfessionalSummary: 'true' };
  assert.equal((await saveProfile(req('user/career', { careerPhase: 'licensed', profile }))).status, 400);
  role = 'employer'; profile.shareProfessionalSummary = true;
  assert.equal((await saveProfile(req('user/career', { careerPhase: 'licensed', profile }))).status, 403);
  assert.equal(writes, 0);
});
