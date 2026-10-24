const {prisma}=require('./register.cjs');
const {test,beforeEach,after}=require('node:test');
const assert=require('node:assert/strict');
const cleanup=require('../lib/document-cleanup.ts');
const {recordedDocumentCleanup,recentDocumentCleanupRuns}=require('../lib/document-cleanup-runs.ts');
const {GET}=require('../app/api/cron/document-cleanup/route.ts');
const {POST}=require('../app/api/admin/document-cleanup/route.ts');
let rows,work,events,createFails,workerFails,finishFails;
const originalWorker=cleanup.processDocumentCleanup;
const names=['CRON_SECRET','ADMIN_SECRET','VERCEL_DEPLOYMENT_ID','NEXT_PUBLIC_APP_URL','NODE_ENV'];
const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
const counts={attempted:2,completed:2,failed:0,referenced:0,skippedLeased:0};
beforeEach(()=>{
 rows=[];events=[];work=0;createFails=false;workerFails=false;finishFails=false;
 Object.assign(process.env,{CRON_SECRET:'c'.repeat(40),ADMIN_SECRET:'a'.repeat(40),VERCEL_DEPLOYMENT_ID:'dpl_fixture',NEXT_PUBLIC_APP_URL:'http://localhost:3000',NODE_ENV:'test'});
 prisma.documentCleanupRun.create=async({data})=>{if(createFails)throw new Error('Audit unavailable');const row={...data,startedAt:new Date()};rows.push(row);events.push('start');return row;};
 prisma.documentCleanupRun.update=async({where,data})=>{if(finishFails)throw new Error('Audit finish unavailable');events.push('finish');Object.assign(rows.find(r=>r.id===where.id),data);return rows[0];};
 prisma.documentCleanupRun.findMany=async args=>{assert.equal(args.take,20);assert.deepEqual(args.orderBy,{startedAt:'desc'});assert.equal('sourceUrl' in args.select,false);return rows;};
 prisma.rateLimit.upsert=async()=>({count:1});
 prisma.documentCleanup.count=async()=>0;
 cleanup.processDocumentCleanup=async()=>{work++;events.push('work');if(workerFails)throw new Error('Private source https://secret.invalid/private-document');return {...counts};};
});
after(()=>{cleanup.processDocumentCleanup=originalWorker;for(const k of names){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}});
const cron=(path='',key=process.env.CRON_SECRET,agent='vercel-cron/1.0')=>new Request('http://localhost:3000/api/cron/document-cleanup'+path,{headers:{authorization:`Bearer ${key}`,'user-agent':agent}});
const admin=(body,key=process.env.ADMIN_SECRET)=>new Request('http://localhost:3000/api/admin/document-cleanup',{method:'POST',headers:{origin:'http://localhost:3000','content-type':'application/json'},body:JSON.stringify({...body,adminSecret:key})});
test('successful authenticated cron records start before work and durable completion counts',async()=>{
 const res=await GET(cron());assert.equal(res.status,200);const result=await res.json();assert.deepEqual(events,['start','work','finish']);assert.equal(rows.length,1);assert.equal(rows[0].id,result.runId);assert.equal(rows[0].status,'SUCCEEDED');assert.equal(rows[0].source,'cron-endpoint');assert.equal(rows[0].cronAgentHint,true);assert.equal(rows[0].deploymentId,'dpl_fixture');assert.equal(rows[0].completed,2);assert.ok(rows[0].finishedAt>=rows[0].startedAt);
});
test('missing or wrong cron authentication cannot create run evidence or process deletion',async()=>{
 assert.equal((await GET(cron('','wrong'))).status,401);assert.equal((await GET(new Request('http://localhost:3000/api/cron/document-cleanup'))).status,401);assert.equal(rows.length,0);assert.equal(work,0);
});
test('read-only dry run and administrator history never invoke cleanup or write audit rows',async()=>{
 assert.equal((await GET(cron('?dryRun=1'))).status,200);const res=await POST(admin({action:'runs'}));assert.equal(res.status,200);assert.deepEqual((await res.json()).runs,[]);assert.deepEqual(await recentDocumentCleanupRuns(),[]);assert.equal(work,0);assert.deepEqual(events,[]);
});
test('audit start failure prevents physical cleanup',async()=>{
 createFails=true;await assert.rejects(()=>recordedDocumentCleanup('cron-endpoint'));assert.equal(work,0);assert.equal(rows.length,0);
});
test('worker failure records generic outcome without persisting private provider errors',async()=>{
 workerFails=true;await assert.rejects(()=>recordedDocumentCleanup('cron-endpoint'));assert.equal(rows[0].status,'FAILED');assert.equal(rows[0].errorCode,'EXECUTION_OR_RECORDING_FAILED');assert.equal(JSON.stringify(rows).includes('secret.invalid'),false);assert.ok(rows[0].finishedAt);
});
test('partial, referenced or leased work is marked for attention instead of a clean pass',async()=>{
 for(const key of ['failed','referenced','skippedLeased']){cleanup.processDocumentCleanup=async()=>({...counts,[key]:1});await recordedDocumentCleanup('admin');assert.equal(rows.at(-1).status,'ATTENTION');assert.equal(rows.at(-1).cronAgentHint,false);}
});
test('audit completion failure rejects success and leaves unfinished evidence for inspection',async()=>{
 finishFails=true;await assert.rejects(()=>recordedDocumentCleanup('cron-endpoint'));assert.equal(work,1);assert.equal(rows[0].status,'RUNNING');assert.equal(rows[0].finishedAt,undefined);
});
test('administrator history requires its own key and processing still requires explicit confirmation',async()=>{
 assert.equal((await POST(admin({action:'runs'},'wrong'))).status,401);assert.equal((await POST(admin({action:'process'}))).status,400);assert.equal(work,0);
 assert.equal((await POST(admin({action:'process',confirm:'PROCESS PENDING DELETIONS'}))).status,200);assert.equal(rows[0].source,'admin');assert.equal(rows[0].cronAgentHint,false);
});
test('a manual cron request without provider agent remains labelled as endpoint execution only',async()=>{
 assert.equal((await GET(cron('',process.env.CRON_SECRET,'manual-qa'))).status,200);assert.equal(rows[0].source,'cron-endpoint');assert.equal(rows[0].cronAgentHint,false);
});
