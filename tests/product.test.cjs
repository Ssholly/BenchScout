require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreJob, scheduleDue } = require('../lib/job-matching.ts');
const { normalizeApifyJob } = require('../lib/job-sources.ts');
const { applicationReadiness } = require('../lib/readiness.ts');
const { validateDocument } = require('../lib/documents.ts');
const job = { title: 'Medical Laboratory Scientist', company: 'Lab', loc: 'Lagos', url: 'https://jobs.example/123', desc: 'Blood bank and hematology', source: 'Test' };
const preferences = { careerPhase: 'licensed', location: 'Lagos', keywords: 'blood bank, hematology', minScore: 0, strictMls: true, includeTier3: true };
test('matching explains relevant keywords and ignores empty keywords', () => {
  assert.equal(scoreJob(job, preferences).skills, 'blood bank, hematology');
  assert.equal(scoreJob(job, { ...preferences, keywords: ',,, ' }).score, 80);
});
test('matching respects location, profession, phase, and threshold', () => {
  assert.equal(scoreJob(job, { ...preferences, location: 'Abuja' }), null);
  assert.equal(scoreJob({ ...job, title: 'Nurse' }, preferences), null);
  assert.equal(scoreJob(job, { ...preferences, careerPhase: 'internship' }), null);
  assert.equal(scoreJob({ ...job, title: 'Medical Laboratory Intern' }, preferences), null);
  assert.equal(scoreJob(job, { ...preferences, minScore: 99 }), null);
});
test('source normalization refuses missing links and unsafe schemes', () => {
  assert.equal(normalizeApifyJob({ title: 'Scientist' }, 'Test'), null);
  assert.equal(normalizeApifyJob({ title: 'Scientist', url: 'javascript:alert(1)' }, 'Test'), null);
  assert.equal(normalizeApifyJob({ title: 'Scientist', company: { name: 'Lab' }, url: 'https://example.com/job' }, 'Test').company, 'Lab');
});
test('scheduled scans use the configured timezone and run once per local day', () => {
  const user = { scanTime: '09:00', scanDays: 'Friday', scanTimezone: 'Africa/Lagos', lastScheduledAt: null };
  assert.equal(scheduleDue(user, new Date('2026-10-09T07:59:00Z')), false);
  assert.equal(scheduleDue(user, new Date('2026-10-09T08:00:00Z')), true);
  assert.equal(scheduleDue({ ...user, lastScheduledAt: new Date('2026-10-09T08:00:00Z') }, new Date('2026-10-09T10:00:00Z')), false);
  assert.equal(scheduleDue(user, new Date('2026-10-10T08:00:00Z')), false);
});
test('readiness does not turn self-reported license data into verification', () => {
  const user = { isVerified: true, resumeUrl: 'https://test.private.blob.vercel-storage.com/cv.pdf', keywords: 'Blood bank', careerPhase: 'licensed', licenseUrl: 'https://test.private.blob.vercel-storage.com/license.pdf', provisionalUrl: null, licenseNumber: '123', licenseExpiry: new Date('2030-01-01'), isLicenseVerified: true, credentialRevision: 1, licenseReviewRevision: 1, licenseReviewedAt: null };
  const result = applicationReadiness(user, new Date('2026-10-09'));
  assert.equal(result.complete, 5); assert.equal(result.credentialStatus, 'Self-reported');
  assert.equal(applicationReadiness({ ...user, licenseReviewedAt: new Date() }).credentialStatus, 'Reviewed');
});
test('upload validation checks file content and size instead of trusting MIME alone', async () => {
  await assert.rejects(() => validateDocument(new File(['<script>'], 'cv.pdf', { type: 'application/pdf' }), 'resume'), error => error.status === 400);
  await assert.rejects(() => validateDocument(new File([new Uint8Array(6*1024*1024)], 'cv.pdf', { type: 'application/pdf' }), 'resume'), error => error.status === 413);
  const pdf = new File(['%PDF-1.7\nTest'], 'cv.pdf', { type: 'application/pdf' });
  assert.equal((await validateDocument(pdf, 'resume')).mime, 'application/pdf');
  await assert.rejects(() => validateDocument(pdf, 'avatar'), error => error.status === 400);
});

test('countdown uses the selected timezone across date boundaries', () => {
  const { nextScheduledRun } = require('../lib/schedule.ts');
  assert.equal(nextScheduledRun('00:30', ['Saturday'], 'WAT', new Date('2026-10-09T22:00:00Z')).toISOString(), '2026-10-09T23:30:00.000Z');
  assert.equal(nextScheduledRun('09:00', ['Friday'], 'EAT', new Date('2026-10-09T05:00:00Z')).toISOString(), '2026-10-09T06:00:00.000Z');
  assert.equal(nextScheduledRun('09:00', [], 'WAT'), null);
});

test('legacy public files do not count as ready for private sharing', () => {
 const user = {isVerified:true,resumeUrl:'https://test.public.blob.vercel-storage.com/cv.pdf',keywords:'MLS',careerPhase:'licensed',licenseUrl:'https://test.public.blob.vercel-storage.com/license.pdf',provisionalUrl:null,licenseNumber:'123',licenseExpiry:new Date('2030-01-01'),isLicenseVerified:false,licenseReviewedAt:null};
 const result=applicationReadiness(user);
 assert.equal(result.checks.find(check=>check.key==='cv').done,false);
 assert.equal(result.checks.find(check=>check.key==='license').done,false);
});

const { csvCell } = require('../lib/csv.ts');
test('CSV exports quote embedded commas, quotes and multiline values', () => {
  assert.equal(csvCell('A,"B"\nC'), '"A,""B""\nC"');
});
test('CSV exports neutralize formula and control prefixes', () => {
  for (const value of ['=1+1', '+SUM(A1)', '@SUM(A1)', '-1+1', '  =1+1', '\t=1+1']) assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('Scientist'), '"Scientist"');
});
