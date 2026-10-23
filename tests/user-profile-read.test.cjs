const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const profile = require('../app/api/user/route.ts').GET;
const sessionRoute = require('../app/api/auth/session/route.ts').GET;
let user, role, expiresAt, sessionReads, accountReads, selections;
function request(email = 'owner@example.invalid', cookie = true) {
  return new Request(`http://localhost:3000/api/user?email=${encodeURIComponent(email)}`, {
    headers: cookie ? { cookie: `benchscout_session=${'a'.repeat(64)}` } : {},
  });
}
beforeEach(() => {
  role = 'candidate'; expiresAt = new Date(Date.now() + 60000);
  sessionReads = 0; accountReads = 0; selections = [];
  user = { id: 'owner', email: 'owner@example.invalid', name: 'QA scientist', isVerified: true,
    careerPhase: 'licensed', candidateProfile: {}, location: 'Lagos', minScore: 70, keywords: 'Haematology',
    credentialRevision: 2, licenseReviewRevision: null, isLicenseVerified: false,
    resumeUrl: 'https://example.private.blob.vercel-storage.com/private.pdf',
    password: 'must-not-be-selected', cvParsedText: 'private text must not be selected' };
  prisma.authSession.findUnique = async () => { sessionReads++; return { subjectId: 'owner', role, expiresAt }; };
  prisma.user.findUnique = async ({ where, select }) => {
    accountReads++; selections.push(select); assert.equal(where.id, 'owner');
    return Object.fromEntries(Object.keys(select).map(key => [key, user[key]]));
  };
  prisma.user.findFirst = async () => { throw new Error('Redundant profile lookup must not run'); };
  prisma.employer.findUnique = async () => ({ id: 'employer', email: 'hr@example.invalid', name: 'QA lab', isVerified: true });
});
test('verified profile read reuses the guarded owner snapshot with only two database reads', async () => {
  const response = await profile(request());
  assert.equal(response.status, 200); assert.equal(sessionReads, 1); assert.equal(accountReads, 1);
  assert.equal(selections[0].password, undefined); assert.equal(selections[0].cvParsedText, undefined);
  const data = await response.json();
  assert.equal(data.user.keywords, 'Haematology'); assert.equal(data.user.minScore, 70);
  assert.match(data.user.resumeUrl, /^\/api\/documents\?/);
  assert.equal(data.user.documentStatus.resume, 'private');
  assert.ok(data.applicationDocuments.some(doc => doc.kind === 'resume'));
  assert.doesNotMatch(JSON.stringify(data), /must.not.be.selected|private\.blob/);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
});
test('profile query identity cannot override the authenticated snapshot owner', async () => {
  assert.equal((await profile(request('other@example.invalid'))).status, 403);
});
test('fresh profile requests observe changes and verification revocation without account caching', async () => {
  assert.equal((await profile(request())).status, 200);
  user.keywords = 'Microbiology';
  assert.equal((await (await profile(request())).json()).user.keywords, 'Microbiology');
  user.isVerified = false;
  assert.equal((await profile(request())).status, 401);
  assert.equal(sessionReads, 3); assert.equal(accountReads, 3);
});
test('anonymous, expired and employer sessions cannot obtain a candidate profile snapshot', async () => {
  assert.equal((await profile(request(undefined, false))).status, 401);
  assert.equal(sessionReads, 0);
  expiresAt = new Date(0);
  assert.equal((await profile(request())).status, 401); assert.equal(accountReads, 0);
  expiresAt = new Date(Date.now() + 60000); role = 'employer';
  assert.equal((await profile(request())).status, 403); assert.equal(accountReads, 0);
});
test('ordinary session responses keep the slim projection and omit the private request snapshot', async () => {
  const response = await sessionRoute(request()); const data = await response.json();
  assert.equal(response.status, 200); assert.equal(data.session.id, 'owner');
  assert.equal(data.session.candidateAccount, undefined);
  assert.equal(selections[0].resumeUrl, undefined); assert.equal(selections[0].keywords, undefined);
});
