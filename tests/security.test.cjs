const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { withApi } = require('../lib/api.ts');
const { hashToken, assertJobAccess, sanitizeResponse, secretMatches, salaryOwnerKey, passwordField } = require('../lib/security.ts');
const { getSession, startSession } = require('../lib/auth.ts');
const { NextResponse } = require('next/server');
const token = 'a'.repeat(64);
let accountRole, sessionRecord, accountVerified, currentJob;
const request = (path = '/api/user', body, cookie = true, method = 'POST') => new Request(`http://localhost:3000${path}`, {
  method, headers: { ...(cookie ? { cookie: `benchscout_session=${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), Origin: 'http://localhost:3000' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});
beforeEach(() => {
  accountRole = 'candidate'; accountVerified = true;
  sessionRecord = { tokenHash: hashToken(token), subjectId: 'owner', role: accountRole, expiresAt: new Date(Date.now() + 100000) };
  currentJob = { userId: 'owner', employerId: 'employer', isDirectPost: false, status: 'active' };
  prisma.authSession.findUnique = async () => sessionRecord;
  prisma.user.findUnique = async () => ({ id: 'owner', name: 'Scientist', email: 'owner@example.com', isVerified: accountVerified });
  prisma.employer.findUnique = async () => ({ id: 'employer', companyName: 'Lab', email: 'lab@example.com', isVerified: accountVerified });
  prisma.rateLimit.upsert = async () => ({ count: 1 });
  prisma.job.findUnique = async () => currentJob;
  delete process.env.ADMIN_SECRET; delete process.env.CRON_SECRET;
});
test('missing cookies cannot invoke protected handlers', async () => {
  let called = false;
  const response = await withApi('candidate', async () => { called = true; return Response.json({}); })(request('/api/user', {}, false));
  assert.equal(response.status, 401); assert.equal(called, false);
});
test('encoded email aliases preserve ownership checks on candidate reads',async()=>{
 const email='owner+placements@example.com';
 prisma.user.findUnique=async()=>({id:'owner',email,isVerified:true,careerPhase:'internship'});
 const response=await withApi('candidate',async incoming=>Response.json({email:new URL(incoming.url).searchParams.get('email')}))(request(`/api/user?email=${encodeURIComponent(email)}`,undefined,true,'GET'));
 assert.equal(response.status,200);assert.equal((await response.json()).email,email);
});
test('public JSON inspection supplies a fresh readable body without relying on request clones', async () => {
  const req=request('/api/auth/verify',{email:'test@example.com',token:'test',role:'employer'},false);
  req.clone=()=>req; // Reproduce a framework wrapper that shares the body stream.
  const handler=withApi('public',async incoming => Response.json(await incoming.json()));
  const response=await handler(req);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{email:'test@example.com',token:'test',role:'employer'});
});
test('multipart signup inspection preserves fields and files for the handler', async () => {
  const form=new FormData();form.set('email','test@example.com');form.set('resume',new Blob(['test resume'],{type:'text/plain'}),'resume.txt');
  const req=new Request('http://localhost:3000/api/auth/register',{method:'POST',headers:{Origin:'http://localhost:3000'},body:form});
  req.clone=()=>req;
  const response=await withApi('public',async incoming => {
    const parsed=await incoming.formData();
    return Response.json({email:parsed.get('email'),resume:await parsed.get('resume').text()});
  })(req);
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{email:'test@example.com',resume:'test resume'});
});
test('forged and expired sessions are rejected', async () => {
  sessionRecord = null; await assert.rejects(() => getSession(request()), error => error.status === 401);
  sessionRecord = { subjectId: 'owner', role: 'candidate', expiresAt: new Date(0) };
  await assert.rejects(() => getSession(request()), error => error.status === 401);
});
test('unverified candidates cannot reuse a session', async () => { accountVerified = false; await assert.rejects(() => getSession(request()), error => error.status === 401); });
test('candidate session cannot access employer APIs', async () => {
  assert.equal((await withApi('employer', async () => Response.json({}))(request())).status, 403);
});
test('email impersonation is denied before handler execution', async () => {
  let called = false;
  const response = await withApi('candidate', async () => { called = true; return Response.json({}); })(request('/api/user', { email: 'victim@example.com' }));
  assert.equal(response.status, 403); assert.equal(called, false);
});
test('identity is filled from session when the client supplies none', async () => {
  const response = await withApi('candidate', async req => Response.json(await req.json()))(request('/api/user', {}));
  assert.equal((await response.json()).email, 'owner@example.com');
});
test('query-string impersonation is denied', async () => {
  const response = await withApi('candidate', async () => Response.json({}))(request('/api/user?email=victim@example.com', undefined, true, 'GET'));
  assert.equal(response.status, 403);
});
test('cross-origin mutations are denied', async () => {
  const req = request('/api/user', {}); req.headers.set('Origin', 'https://attacker.example');
  assert.equal((await withApi('candidate', async () => Response.json({}))(req)).status, 403);
});
test('malformed JSON returns 400 instead of entering the handler', async () => {
  const req = new Request('http://localhost:3000/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await withApi('candidate', async () => Response.json({}))(req)).status, 400);
});
test('resource ownership cannot be replaced by knowing a record ID', async () => {
  currentJob.userId = 'victim';
  const response = await withApi('candidate', async () => Response.json({}), { job: 'candidate' })(request('/api/jobs/status', { jobId: 'known-id' }));
  assert.equal(response.status, 403);
});
test('missing job ID is never passed into a deleteMany filter', async () => {
  sessionRecord.role = 'employer';
  const response = await require('../app/api/jobs/applicants/route.ts').DELETE(request('/api/jobs/applicants', {}));
  assert.equal(response.status, 400);
});
test('verified employers cannot access another employer application', async () => {
  sessionRecord.role = 'employer';
  prisma.application.findUnique = async () => ({ job: { employerId: 'different', userId: null, isDirectPost: true } });
  assert.equal((await require('../app/api/jobs/applicants/route.ts').PATCH(request('/api/jobs/applicants', { applicationId: 'known-id', status: 'hired' }))).status, 403);
});
test('unverified employer is blocked from applicants', async () => {
  sessionRecord.role = 'employer'; accountVerified = false;
  assert.equal((await require('../app/api/jobs/applicants/route.ts').GET(request('/api/jobs/applicants?jobId=owned', undefined, true, 'GET'))).status, 403);
});
test('candidate can read only their own document', async () => {
  assert.equal((await require('../app/api/documents/route.ts').GET(request('/api/documents?userId=victim&kind=resume', undefined, true, 'GET'))).status, 403);
});
test('employer document access requires an application to that employer', async () => {
  sessionRecord.role = 'employer'; prisma.application.findFirst = async () => null;
  assert.equal((await require('../app/api/documents/route.ts').GET(request('/api/documents?userId=candidate&kind=resume', undefined, true, 'GET'))).status, 403);
});
test('private credential fields and password hashes never leave JSON responses', async () => {
  const response = await withApi('candidate', async () => Response.json({ user: { id: 'owner', password: 'hash', cvParsedText: 'private', resumeUrl: 'https://private.blob/file', isLicenseVerified: true, licenseReviewedAt: null }, nested: [{ passwordHash: 'hash', ownerKey: 'secret' }] }))(request('/api/user', undefined, true, 'GET'));
  const data = await response.json();
  assert.equal(data.user.password, undefined); assert.equal(data.user.cvParsedText, undefined);
  assert.equal(data.user.resumeUrl, '/api/documents?userId=owner&kind=resume');
  assert.equal(data.user.isLicenseVerified, false); assert.deepEqual(data.nested, [{}]);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});
test('default and missing admin secrets fail closed', async () => {
  assert.equal(secretMatches('admin123', undefined), false); assert.equal(secretMatches('admin123', 'admin123'), false);
  const handler = withApi('admin', async () => Response.json({ success: true }));
  assert.equal((await handler(request('/api/admin/jobs', { passcode: 'admin123' }, false))).status, 401);
  process.env.ADMIN_SECRET = 's'.repeat(40);
  const req = request('/api/admin/jobs', undefined, false, 'GET'); req.headers.set('authorization', `Bearer ${process.env.ADMIN_SECRET}`);
  assert.equal((await handler(req)).status, 200);
});
test('cron cannot authenticate with the literal undefined secret', async () => {
  const req = request('/api/cron/daily-digest', undefined, false, 'GET'); req.headers.set('authorization', 'Bearer undefined');
  assert.equal((await withApi('cron', async () => Response.json({}))(req)).status, 401);
});
test('session tokens are random, hashed in storage, and HttpOnly', async () => {
  let stored; prisma.authSession.create = async input => { stored = input.data; };
  const response = await startSession(NextResponse.json({ success: true }), request('/api/auth/login', {}, false), 'owner', 'candidate');
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=lax/i);
  const raw = cookie.match(/benchscout_session=([a-f0-9]+)/)[1];
  assert.equal(raw.length, 64); assert.notEqual(raw, stored.tokenHash); assert.equal(hashToken(raw), stored.tokenHash);
});
test('logout deletes the persisted session and clears the cookie', async () => {
  let removed; prisma.authSession.deleteMany = async input => { removed = input.where.tokenHash; sessionRecord = null; return { count: 1 }; };
  const response = await require('../app/api/auth/logout/route.ts').POST(request('/api/auth/logout'));
  assert.equal(response.status, 200); assert.equal(removed, hashToken(token)); assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  await assert.rejects(() => getSession(request()), error => error.status === 401);
});
test('duplicate applications use an idempotent per-candidate upsert', async () => {
  currentJob = { id: 'job', jobType:'full-time', userId: null, employerId: 'employer', isDirectPost: true, status: 'active' };
  prisma.job.findUniqueOrThrow = async () => currentJob;
  prisma.user.findUniqueOrThrow = async () => ({ id: 'owner', resumeUrl: 'private' });
  const records = new Set(); prisma.application.upsert = async input => { records.add(`${input.where.jobId_userId.jobId}:${input.where.jobId_userId.userId}`); return {}; };
  const apply = require('../app/api/apply/route.ts').POST;
  assert.equal((await apply(request('/api/apply', { jobId: 'job' }))).status, 200);
  assert.equal((await apply(request('/api/apply', { jobId: 'job' }))).status, 200); assert.equal(records.size, 1);
});
test('salary ownership is opaque and edits must match both owner and ID', async () => {
  process.env.SALARY_OWNER_SECRET = 'salary'.repeat(8);
  assert.notEqual(salaryOwnerKey('owner'), salaryOwnerKey('other'));
  let filter; prisma.salaryReport.updateMany = async input => { filter = input.where; return { count: 0 }; };
  const response = await require('../app/api/salary/route.ts').PUT(request('/api/salary', { id: 'victim-report', role: 'MLS', location: 'Lagos', salary: 200000, experience: '1-3 years' }));
  assert.equal(response.status, 404); assert.equal(filter.ownerKey, salaryOwnerKey('owner'));
});
test('rate-limited actions never reach their handler', async () => {
  prisma.rateLimit.upsert = async () => ({ count: 100 });
  assert.equal((await withApi('candidate', async () => { throw new Error('Should not run'); }, { limit: 5 })(request('/api/scrape', {}))).status, 429);
});
test('database outage during rate limiting fails closed with a safe retry message', async () => {
  prisma.rateLimit.upsert = async () => { throw Object.assign(new Error('private database detail'), { code: 'P1001' }); };
  let called = false;
  const response = await withApi('candidate', async () => { called = true; return Response.json({}); }, { limit: 5 })(request('/api/scrape', {}));
  assert.equal(response.status, 503); assert.equal(called, false);
  assert.equal(response.headers.get('Retry-After'), '5');
  const body = await response.json(); assert.match(body.error, /database connection is temporarily unavailable/i);
  assert.doesNotMatch(JSON.stringify(body), /private database detail/);
});
test('legacy reset endpoints are permanently disabled', async () => {
  assert.equal((await require('../app/api/setup/route.ts').GET()).status, 410);
  assert.equal((await require('../app/api/test-email/route.ts').GET()).status, 410);
});
test('password policy does not silently truncate bcrypt inputs', () => {
  assert.throws(() => passwordField('short')); assert.throws(() => passwordField('é'.repeat(40))); assert.equal(passwordField(' long password '), ' long password ');
});
test('job access distinguishes owned records from available direct vacancies', () => {
  assert.throws(() => assertJobAccess(null, 'owner', 'candidate'));
  assert.doesNotThrow(() => assertJobAccess({ userId: null, employerId: 'lab', isDirectPost: true, status: 'active' }, 'owner', 'available'));
  assert.throws(() => assertJobAccess({ userId: null, employerId: 'lab', isDirectPost: true, status: 'cleared' }, 'owner', 'available'));
  assert.deepEqual(sanitizeResponse({ passwordHash: 'x' }), {});
});
test('local Host is used when Next normalizes the request URL to localhost', () => {
  const { assertSameOrigin } = require('../lib/security.ts');
  const req = new Request('http://localhost:3173/api/auth/login', { method: 'POST', headers: { Host: '127.0.0.1:3173', Origin: 'http://127.0.0.1:3173', 'Sec-Fetch-Site': 'same-origin' } });
  assert.doesNotThrow(() => assertSameOrigin(req));
  req.headers.set('Origin', 'http://127.0.0.1:9999');
  assert.throws(() => assertSameOrigin(req), error => error.status === 403);
  req.headers.set('Origin', 'https://attacker.example');
  assert.throws(() => assertSameOrigin(req), error => error.status === 403);
});
test('production origin cannot be replaced by a supplied Host header', () => {
  const { assertSameOrigin } = require('../lib/security.ts');
  const previousMode = process.env.NODE_ENV, previousUrl = process.env.NEXT_PUBLIC_APP_URL;
  try {
    process.env.NODE_ENV = 'production'; process.env.NEXT_PUBLIC_APP_URL = 'https://benchscout.example';
    const req = new Request('https://localhost/api/auth/login', { method: 'POST', headers: { Host: 'attacker.example', Origin: 'https://attacker.example' } });
    assert.throws(() => assertSameOrigin(req), error => error.status === 403);
    req.headers.set('Origin', 'https://benchscout.example');
    assert.doesNotThrow(() => assertSameOrigin(req));
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousMode;
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL; else process.env.NEXT_PUBLIC_APP_URL = previousUrl;
  }
});

test('auth email links follow the local browser origin and production canonical URL', () => {
 const {applicationOrigin}=require('../lib/security.ts');
 const mode=process.env.NODE_ENV, configured=process.env.NEXT_PUBLIC_APP_URL;
 try {
  process.env.NODE_ENV='development'; process.env.NEXT_PUBLIC_APP_URL='https://live.example';
  const req=new Request('http://localhost:3173/api/auth/register',{headers:{Host:'127.0.0.1:3173'}});
  assert.equal(applicationOrigin(req),'http://127.0.0.1:3173');
  process.env.NODE_ENV='production';
  assert.equal(applicationOrigin(req),'https://live.example');
  delete process.env.NEXT_PUBLIC_APP_URL;
  assert.throws(()=>applicationOrigin(req),error=>error.status===503);
 } finally {
  if(mode===undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV=mode;
  if(configured===undefined) delete process.env.NEXT_PUBLIC_APP_URL; else process.env.NEXT_PUBLIC_APP_URL=configured;
 }
});
test('document status identifies private and legacy files without revealing storage URLs', () => {
 const result=sanitizeResponse({id:'owner',resumeUrl:'https://test.private.blob.vercel-storage.com/cv.pdf',licenseUrl:'https://test.public.blob.vercel-storage.com/license.pdf',degreeUrl:null});
 assert.equal(result.documentStatus.resume,'private'); assert.equal(result.documentStatus.license,'legacy'); assert.equal(result.documentStatus.degree,'missing');
 assert.equal(JSON.stringify(result).includes('vercel-storage.com'),false);
});
