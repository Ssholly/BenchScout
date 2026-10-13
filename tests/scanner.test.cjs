const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const sources = require('../lib/job-sources.ts');
const { runJobScan } = require('../lib/job-scanner.ts');
let released, history, writes;
beforeEach(() => {
  released = false; history = []; writes = 0;
  prisma.user.updateMany = async () => ({ count: 1 });
  prisma.user.update = async () => { released = true; };
  prisma.user.findUniqueOrThrow = async () => ({ id: 'owner', email: 'owner@example.com', careerPhase: 'licensed', location: 'Lagos', keywords: '', minScore: 0, strictMls: true, autoSendEmail: true, alertTier: 'All Tiers' });
  prisma.runHistory.create = async ({ data }) => { history.push(data); };
  prisma.job.findMany = async () => [];
  prisma.job.create = async () => { writes++; };
  prisma.job.update = async () => { writes++; };
  prisma.$transaction = async operations => Promise.all(operations);
});
test('unavailable sources preserve saved jobs and release the scan lease', async () => {
  sources.collectJobs = async () => ({ jobs: [], successful: 0, warnings: [] });
  await assert.rejects(() => runJobScan('owner'), error => error.status === 502);
  assert.equal(writes, 0); assert.equal(released, true); assert.equal(history[0].status, 'failed');
});
test('repeat scans refresh an existing match without counting it as new', async () => {
  const url = 'https://example.com/vacancy';
  sources.collectJobs = async () => ({ jobs: [{ title: 'Medical Laboratory Scientist', company: 'Lab', loc: 'Lagos', url, desc: 'Laboratory work', source: 'Test' }], successful: 1, warnings: [] });
  prisma.job.findMany = async () => [{ id: 'existing', url, applied: true, status: 'applied' }];
  prisma.job.update = async ({ data }) => { writes++; assert.equal(data.status, undefined); };
  const result = await runJobScan('owner');
  assert.equal(result.success, true); assert.equal(writes, 1);
  assert.equal(history[0].matches, 0); assert.equal(history[0].status, 'run only'); assert.equal(released, true);
});
test('a concurrent scan is refused before reading job sources', async () => {
  prisma.user.updateMany = async () => ({ count: 0 });
  sources.collectJobs = async () => { throw new Error('Sources must not be called'); };
  await assert.rejects(() => runJobScan('owner'), error => error.status === 409);
  assert.equal(writes, 0);
});
test('All Nigeria overrides an Abuja profile and persists the actual scan scope and counts',async()=>{
 const user={id:'owner',email:'owner@example.com',careerPhase:'licensed',location:'Abuja',candidateProfile:{preferredLocations:'Abuja'},keywords:'',minScore:0,strictMls:true,autoSendEmail:false};
 prisma.user.findUniqueOrThrow=async()=>user;let saved;
 prisma.user.update=async({data})=>{if(data.candidateProfile)saved=data.candidateProfile;};
 sources.collectJobs=async(phase,location)=>{assert.equal(phase,'licensed');assert.equal(location,'Nigeria');return {jobs:['Lagos','Abuja'].map(loc=>({title:'Medical Laboratory Scientist',company:'Test Lab',loc,url:`https://example.com/${loc}`,desc:'Laboratory work',source:'Test'})),successful:1,warnings:[]};};
 const result=await runJobScan('owner',{location:'All Nigeria',autoSend:false});assert.equal(result.report.matched,2);assert.equal(result.report.retrieved,2);assert.equal(saved.lastScan.location,'All Nigeria');assert.equal(saved.preferredLocations,'Abuja');
});
test('intern scan rejects ordinary scientist posts and saves plural intern titles',async()=>{
 prisma.user.findUniqueOrThrow=async()=>({id:'owner',email:'owner@example.com',careerPhase:'internship',location:'All Nigeria',candidateProfile:{},keywords:'',minScore:70,strictMls:true,autoSendEmail:false});
 sources.collectJobs=async()=>({jobs:['Medical Laboratory Scientist','Medical Laboratory Science Interns'].map((title,index)=>({title,company:'Test Hospital',loc:'Enugu',url:`https://example.com/${index}`,desc:'Laboratory work',source:'Test'})),successful:1,warnings:[]});
 let saved;prisma.job.create=async({data})=>{saved=data;};const result=await runJobScan('owner',{autoSend:false});assert.equal(result.report.matched,1);assert.equal(saved.role,'Medical Laboratory Science Interns');assert.equal(saved.jobType,'internship');
});
