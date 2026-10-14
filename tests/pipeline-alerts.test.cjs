const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { GET } = require('../app/api/jobs/route.ts');
const { POST } = require('../app/api/user/preferences/route.ts');
const token = 'a'.repeat(64);
const request = (path, body) => new Request(`http://localhost:3000${path}`, { method: body ? 'POST' : 'GET', headers: { cookie: `benchscout_session=${token}`, Origin: 'http://localhost:3000', ...(body ? {'Content-Type':'application/json'} : {}) }, ...(body ? {body:JSON.stringify(body)} : {}) });
let userReads;
beforeEach(() => {
  userReads = 0;
  prisma.rateLimit.upsert = async () => ({count:1});
  prisma.authSession.findUnique = async () => ({ subjectId:'owner', role:'candidate', expiresAt:new Date(Date.now()+60000) });
  prisma.user.findUnique = async () => { userReads++; return {id:'owner',email:'owner@example.com',isVerified:true}; };
});
test('pipeline asks only for candidate-owned tracked jobs and their direct applications', async () => {
  let query;
  prisma.notification.findMany = async () => { throw new Error('Pipeline must not query invitations'); };
  prisma.job.findMany = async input => { query=input; return [{id:'direct',url:'/matches/direct/employer',isDirectPost:true,applied:false,applications:[{status:'pending'}],employer:{isVerified:true}}]; };
  const response = await GET(request('/api/jobs?view=pipeline'));
  assert.equal(response.status, 200);
  assert.deepEqual(query.where.OR, [{userId:'owner',applied:true},{isDirectPost:true,applications:{some:{userId:'owner'}}}]);
  assert.deepEqual(query.include.applications, {where:{userId:'owner'},select:{status:true,interviewDate:true,interviewTime:true,interviewLoc:true}});
  assert.equal(userReads, 1); // Session validation only, no duplicate lookup.
  assert.equal((await response.json())[0].applied, true);
});
test('pipeline database failures are visible as a retryable response rather than an empty board', async () => {
  prisma.job.findMany = async () => { throw {code:'P1001'}; };
  const response = await GET(request('/api/jobs?view=pipeline'));
  assert.equal(response.status,503);
  assert.ok((await response.json()).error.includes('retry'));
});
test('priority alerts accept the current all-tier option and migrate the old client label', async () => {
  for (const alertTier of ['All Tiers','All Roles']) {
    let saved;
    prisma.user.update = async ({where,data}) => { assert.equal(where.id,'owner'); saved=data; return {id:'owner',...data}; };
    const response = await POST(request('/api/user/preferences',{alertTier,alertKeywords:'hematology',autoSendEmail:true}));
    assert.equal(response.status,200);
    assert.deepEqual(saved,{alertKeywords:'hematology',alertTier:'All Tiers',autoSendEmail:true});
  }
});
test('invalid tiers are rejected without overwriting saved preferences', async () => {
  prisma.user.update = async () => { throw new Error('Must not write'); };
  const response = await POST(request('/api/user/preferences',{alertTier:'Invalid'}));
  assert.equal(response.status,400);
});
test('returning a tracked external application restores the active match',async()=>{
 const {DELETE}=require('../app/api/apply/route.ts');let saved;
 prisma.job.findUnique=async()=>({id:'owned',userId:'owner',isDirectPost:false,status:'applied'});
 prisma.job.findUniqueOrThrow=prisma.job.findUnique;
 prisma.job.update=async input=>{saved=input;};
 const req=request('/api/apply',{jobId:'owned'});const response=await DELETE(new Request(req,{method:'DELETE'}));
 assert.equal(response.status,200);assert.deepEqual(saved.data,{applied:false,status:'active'});
});
test('returning a direct vacancy removes only this candidate’s application',async()=>{
 const {DELETE}=require('../app/api/apply/route.ts');let removed;
 prisma.job.findUnique=async()=>({id:'direct',userId:null,isDirectPost:true,status:'active'});
 prisma.job.findUniqueOrThrow=prisma.job.findUnique;
 prisma.application.deleteMany=async args=>{removed=args;return {count:1};};
 prisma.job.update=async()=>{throw new Error('Must not change an employer vacancy');};
 const req=request('/api/apply',{jobId:'direct'});const response=await DELETE(new Request(req,{method:'DELETE'}));
 assert.equal(response.status,200);assert.deepEqual(removed.where,{jobId:'direct',userId:'owner'});
});
test('another candidate’s tracked job cannot be returned by this account',async()=>{
 const {DELETE}=require('../app/api/apply/route.ts');
 prisma.job.findUnique=async()=>({id:'other',userId:'other',isDirectPost:false,status:'applied'});
 prisma.job.update=async()=>{throw new Error('Must not update another candidate');};
 const req=request('/api/apply',{jobId:'other'});assert.equal((await DELETE(new Request(req,{method:'DELETE'}))).status,403);
});
test('priority email tests apply saved tier filters before limiting the digest and send only to the session account',async()=>{
 const {mailer}=require('./register.cjs');const route=require('../app/api/send-digest/route.ts');let sent;
 prisma.user.findUniqueOrThrow=async()=>({id:'owner',email:'owner@example.com',name:'Owner',careerPhase:'licensed',candidateProfile:{},location:'All Nigeria',alertTier:'Tier 1 Only',alertKeywords:'haematology'});
 prisma.job.findMany=async()=>[{role:'Medical Laboratory Scientist',company:'Higher relevance, wrong keyword',loc:'Lagos',jobType:'full-time',url:'https://example.com/skip',tier:1,desc:'Microbiology',score:99},{role:'Medical Laboratory Scientist',company:'Matching lab',loc:'Lagos',jobType:'full-time',url:'https://example.com/include',tier:1,desc:'Haematology',score:90}];
 mailer.sendEmail=async(...args)=>{sent=args;};
 const response=await route.POST(request('/api/send-digest',{triggerType:'PRIORITY_TEST'}));
 assert.equal(response.status,200);assert.equal(sent[0],'owner@example.com');assert.equal(sent[1],'BenchScout: priority alert delivery test');assert.equal(sent[2].includes('wrong keyword'),false);assert.ok(sent[2].includes('Matching lab'));
});
