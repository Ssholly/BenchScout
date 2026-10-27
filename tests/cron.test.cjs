const {prisma}=require('./register.cjs');const {test,beforeEach}=require('node:test');const assert=require('node:assert/strict');
const scanner=require('../lib/job-scanner.ts');const matching=require('../lib/job-matching.ts');const {GET}=require('../app/api/cron/daily-digest/route.ts');
const secret='c'.repeat(64);let account;
beforeEach(()=>{process.env.CRON_SECRET=secret;account={id:'owner',location:'Lagos',autoSendEmail:true,lastScheduledAt:null};prisma.authSession.deleteMany=prisma.rateLimit.deleteMany=async()=>({count:0});prisma.user.findMany=async()=>[account];matching.scheduleDue=()=>true;});
const request=()=>new Request('http://localhost:3000/api/cron/daily-digest',{headers:{authorization:`Bearer ${secret}`}});
test('scheduled scans use the saved scheduler location and enabled email setting',async()=>{
 let inputs;prisma.user.updateMany=async()=>({count:1});scanner.runJobScan=async(...args)=>{inputs=args;};
 const response=await GET(request());assert.equal(response.status,200);assert.equal((await response.json()).processed,1);assert.deepEqual(inputs.slice(0,3),['owner',{autoSend:true,location:'Lagos'},'Automated']);
});
test('overlapping cron claims cannot run or count an already claimed schedule',async()=>{
 prisma.user.updateMany=async()=>({count:0});scanner.runJobScan=async()=>{throw new Error('Must not run');};
 const result=await (await GET(request())).json();assert.equal(result.processed,0);assert.equal(result.failed,0);
});
test('a scan failure releases the daily claim for a later retry',async()=>{
 const writes=[];prisma.user.updateMany=async args=>{writes.push(args);return {count:1};};scanner.runJobScan=async()=>{throw new Error('Sources offline');};
 const result=await (await GET(request())).json();assert.equal(result.failed,1);assert.equal(writes.length,2);assert.deepEqual(writes[1].data,{lastScheduledAt:null});
});
test('an authenticated dry run verifies due accounts without scans or writes',async()=>{
 account.autoSendEmail=true;
 prisma.authSession.deleteMany=prisma.rateLimit.deleteMany=prisma.user.updateMany=async()=>{throw new Error('Dry run must not write');};
 scanner.runJobScan=async()=>{throw new Error('Dry run must not scan or email');};
 const req=new Request('http://localhost:3000/api/cron/daily-digest?dryRun=1',{headers:{authorization:`Bearer ${secret}`}});
 const response=await GET(req);assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true,dryRun:true,dueAccounts:1,emailEnabledAccounts:1});
});
