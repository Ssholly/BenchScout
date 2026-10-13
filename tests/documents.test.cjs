const { prisma } = require('./register.cjs');
const Module = require('node:module');
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
let blobCalls, subject, verified, shared, storedUrl;
const load = Module._load;
Module._load = function(name, parent, main) {
  if (name === '@vercel/blob') return { get: async (_url, options) => { blobCalls++; assert.equal(options.access, 'private'); assert.equal(options.useCache, false); return { statusCode: 200, blob: { contentType: 'application/pdf' }, stream: new ReadableStream({start(controller) {controller.enqueue(new TextEncoder().encode('%PDF-test'));controller.close();}}) }; } };
  return load.call(this, name, parent, main);
};
const { GET } = require('../app/api/documents/route.ts');
const oldToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
const cookie = 'benchscout_session=' + 'a'.repeat(64);
beforeEach(() => {
  blobCalls = 0; subject = 'candidate'; verified = true; shared = true;
  storedUrl = 'https://store.private.blob.vercel-storage.com/doc.pdf';
  process.env.BLOB_PRIVATE_READ_WRITE_TOKEN = 'mock-private-token';
  prisma.authSession.findUnique = async () => ({role: subject === 'candidate' ? 'candidate' : 'employer',subjectId: subject,expiresAt:new Date(Date.now()+60000)});
  prisma.user.findUnique = async () => ({id:'candidate',email:'candidate@example.com',name:'Candidate',isVerified:true,resumeUrl:storedUrl});
  prisma.employer.findUnique = async () => ({id:'employer',email:'employer@example.com',companyName:'Lab',isVerified:verified});
  prisma.application.findFirst = async args => {assert.equal(args.where.job.employerId,'employer');return shared ? {id:'application'} : null;};
});
after(() => { if(oldToken === undefined) delete process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;else process.env.BLOB_PRIVATE_READ_WRITE_TOKEN=oldToken; });
function request(user='candidate',download=false) {return new Request(`http://localhost:3000/api/documents?userId=${user}&kind=resume${download?'&download=1':''}`,{headers:{cookie}});}
test('owner receives private streamed document with no-store and sandbox headers', async () => {
  const response=await GET(request());assert.equal(response.status,200);assert.equal(await response.text(),'%PDF-test');assert.equal(blobCalls,1);
  assert.equal(response.headers.get('cache-control'),'private, no-store');assert.match(response.headers.get('content-security-policy'),/sandbox/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');
});
test('verified employer can download an applicant document through guarded route', async () => {
  subject='employer';const response=await GET(request('candidate',true));assert.equal(response.status,200);assert.match(response.headers.get('content-disposition'),/^attachment/);assert.equal(blobCalls,1);
});
test('unverified employers cannot fetch private documents', async () => {
  subject='employer';verified=false;assert.equal((await GET(request())).status,403);assert.equal(blobCalls,0);
});
test('employers without an application cannot reach storage', async () => {
  subject='employer';shared=false;assert.equal((await GET(request())).status,403);assert.equal(blobCalls,0);
});
test('legacy public files fail closed without being fetched', async () => {
  storedUrl='https://store.public.blob.vercel-storage.com/doc.pdf';assert.equal((await GET(request())).status,409);assert.equal(blobCalls,0);
});
test('missing private storage token produces configuration failure before fetch', async () => {
  delete process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;assert.equal((await GET(request())).status,503);assert.equal(blobCalls,0);
});

test('server document limit rejects files above 4 MiB before storage', async () => {
  const {validateDocument}=require('../lib/documents.ts');
  const file=new File([new Uint8Array(4*1024*1024+1)],'resume.pdf',{type:'application/pdf'});
  await assert.rejects(()=>validateDocument(file,'resume'),error=>error.status===413);
  assert.equal(blobCalls,0);
});
test('new result, placement and certificate documents retain owner and employer-application guards', async () => {
 const {documentFields}=require('../lib/documents.ts');
 prisma.user.findUnique=async()=>({id:'candidate',email:'candidate@example.com',isVerified:true,...Object.fromEntries(Object.values(documentFields).map(field=>[field,storedUrl]))});
 for(const kind of ['result','placement','certificate']) {
  const req=user=>new Request(`http://localhost:3000/api/documents?userId=${user}&kind=${kind}`,{headers:{cookie}});
  subject='candidate';assert.equal((await GET(req('candidate'))).status,200);
  assert.equal((await GET(req('other'))).status,403);
  subject='employer';shared=false;assert.equal((await GET(req('candidate'))).status,403);
 }
 assert.equal(blobCalls,3);
});
