const {prisma}=require('./register.cjs');
const Module=require('node:module');
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const {ApiError}=require('../lib/security.ts');
const load=Module._load;
const fields={resume:'resumeUrl',license:'licenseUrl',provisional:'provisionalUrl',degree:'degreeUrl',result:'statementOfResultUrl',placement:'placementLetterUrl',certificate:'certificateUrl',avatar:'avatarUrl'};
const oldUrl='https://fixture.private.blob.vercel-storage.com/old.pdf';
let state,jobs,sources,stored,removed,flags;
Module._load=function(name,parent,main){
 if(name==='@/lib/documents')return {documentFields:fields,
  documentKind:value=>{if(!fields[value])throw new ApiError(400,'Unsupported document type.');return value;},
  storeDocument:async()=>{if(flags.storageFails)throw new ApiError(503,'Storage unavailable.');const url=`https://fixture.private.blob.vercel-storage.com/new-${++stored}.pdf`;sources.add(url);return {url,buffer:Buffer.from('%PDF-fixture')};},
  resumeText:async()=> 'Synthetic CV',
  removeDocument:async url=>{removed.push(url);assert.notEqual(state.resumeUrl,url,'never delete the current file');if(flags.cleanupFails)throw new Error('private provider diagnostic');sources.delete(url);},
 };
 return load.call(this,name,parent,main);
};
const upload=require('../app/api/upload/route.ts');
const cleanup=require('../lib/document-cleanup.ts');
const admin=require('../app/api/admin/document-cleanup/route.ts').POST;
const cron=require('../app/api/cron/document-cleanup/route.ts').GET;
const clone=v=>structuredClone(v);
function request(method='POST',email='candidate@example.invalid',authenticated=true){
 const headers={Origin:'http://localhost:3000',...(authenticated?{cookie:`benchscout_session=${'a'.repeat(64)}`}:{})};
 if(method==='DELETE')return new Request('http://localhost:3000/api/upload',{method,headers:{...headers,'content-type':'application/json'},body:JSON.stringify({documentType:'resume',email,fileUrl:'https://attacker.invalid/never-delete'})});
 const form=new FormData();form.set('email',email);form.set('documentType','resume');form.set('file',new File(['%PDF-fixture'],'qa.pdf',{type:'application/pdf'}));return new Request('http://localhost:3000/api/upload',{method,headers,body:form});
}
function leaseMatches(job,where){if(where.leaseUntil)return +job.leaseUntil===+where.leaseUntil;if(where.OR)return !job.leaseUntil||job.leaseUntil<=where.OR[1].leaseUntil.lte;return true;}
function due(job,where){return (!where.id||where.id.in.includes(job.id))&&job.nextAttemptAt<=where.nextAttemptAt.lte&&leaseMatches(job,where);}
function makeDue(){for(const j of jobs.values()){j.nextAttemptAt=new Date(0);j.leaseUntil=null;}}
beforeEach(()=>{
 state={id:'candidate',email:'candidate@example.invalid',name:'Synthetic',isVerified:true,careerPhase:'licensed',credentialRevision:0,resumeUrl:oldUrl};jobs=new Map();sources=new Set([oldUrl]);stored=0;removed=[];flags={};
 process.env.ADMIN_SECRET='s'.repeat(40);process.env.CRON_SECRET='c'.repeat(40);
 prisma.authSession.findUnique=async()=>({subjectId:'candidate',role:'candidate',expiresAt:new Date(Date.now()+60000)});
 prisma.user.findUnique=prisma.user.findUniqueOrThrow=async()=>clone(state);
 prisma.user.findFirst=async({where})=>where.OR.some(x=>Object.entries(x).some(([key,value])=>state[key]===value))?{id:state.id}:null;
 prisma.user.updateMany=async({where,data})=>{
  if(flags.writeFails)throw new ApiError(503,'Metadata unavailable.');
  if(Object.entries(where).some(([k,v])=>k!=='id'&&(state[k]??null)!==v))return {count:0};
  for(const [k,v] of Object.entries(data))state[k]=k==='credentialRevision'?state[k]+v.increment:v;return {count:1};
 };
 prisma.$transaction=async fn=>{if(flags.race){state.resumeUrl='https://fixture.private.blob.vercel-storage.com/concurrent.pdf';sources.add(state.resumeUrl);flags.race=false;}const saved=clone({state,jobs});try{const result=await fn(prisma);if(flags.ambiguousCommit)throw new ApiError(503,'Ambiguous commit.');if(flags.commitFails)throw new ApiError(503,'Commit unavailable.');return result;}catch(e){if(!flags.ambiguousCommit){state=saved.state;jobs=saved.jobs;}throw e;}};
 prisma.documentCleanup.upsert=async({where,create})=>{if(flags.enqueueFails)throw new ApiError(503,'Queue unavailable.');if(!jobs.has(where.id))jobs.set(where.id,{...create,attempts:0,nextAttemptAt:new Date(0),leaseUntil:null,lastErrorCode:null,createdAt:new Date()});return clone(jobs.get(where.id));};
 prisma.documentCleanup.findMany=async({where,take})=>{if(flags.workerUnavailable)throw new Error('Worker unavailable');return [...jobs.values()].filter(j=>due(j,where)).slice(0,take).map(clone);};
 prisma.documentCleanup.findUnique=async({where})=>jobs.has(where.id)?{id:where.id}:null;
 prisma.documentCleanup.count=async({where}={})=>[...jobs.values()].filter(j=>!where||((!where.userId||where.userId===j.userId)&&(!where.kind||where.kind===j.kind)&&(!where.lastErrorCode||j.lastErrorCode!==null)&&(!where.nextAttemptAt||due(j,where)))).length;
 prisma.documentCleanup.updateMany=async({where,data})=>{const j=jobs.get(where.id);if(!j||!leaseMatches(j,where)||(where.nextAttemptAt&&j.nextAttemptAt>where.nextAttemptAt.lte))return {count:0};for(const [k,v]of Object.entries(data))j[k]=k==='attempts'?j[k]+v.increment:v;return {count:1};};
 prisma.documentCleanup.deleteMany=async({where})=>{if(flags.ackFails)throw new Error('Queue acknowledgement unavailable');const j=jobs.get(where.id);if(j&&leaseMatches(j,where)){jobs.delete(where.id);return {count:1};}return {count:0};};
 prisma.rateLimit.upsert=async()=>({count:1});
});
test('anonymous and another-account upload/delete are rejected before storage or metadata',async()=>{
 assert.equal((await upload.POST(request('POST','candidate@example.invalid',false))).status,401);
 assert.equal((await upload.POST(request('POST','other@example.invalid'))).status,403);
 assert.equal((await upload.DELETE(request('DELETE','other@example.invalid'))).status,403);
 assert.equal(stored,0);assert.deepEqual(removed,[]);assert.equal(state.resumeUrl,oldUrl);
});
test('unestablished backup/storage never commits a new vault reference',async()=>{
 flags.storageFails=true;assert.equal((await upload.POST(request())).status,503);assert.equal(state.resumeUrl,oldUrl);assert.equal(jobs.size,0);assert.deepEqual(removed,[]);
});
test('metadata failure cleans only uncommitted new source and preserves previous reference',async()=>{
 flags.writeFails=true;assert.equal((await upload.POST(request())).status,503);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,['https://fixture.private.blob.vercel-storage.com/new-1.pdf']);assert.equal(jobs.size,0);
});
test('failed uncommitted cleanup queues retry and preserves the primary metadata error',async()=>{
 flags.writeFails=true;flags.cleanupFails=true;const response=await upload.POST(request());assert.equal(response.status,503);assert.equal(state.resumeUrl,oldUrl);assert.equal(jobs.size,1);assert.equal((await response.text()).includes('private provider'),false);
 flags.writeFails=false;flags.cleanupFails=false;makeDue();await cleanup.processDocumentCleanup();assert.equal(jobs.size,0);assert.equal(sources.has(oldUrl),true);
});
test('deletion database failure never touches stored source or archive',async()=>{
 flags.writeFails=true;assert.equal((await upload.DELETE(request('DELETE'))).status,503);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,[]);assert.equal(jobs.size,0);assert.equal(sources.has(oldUrl),true);
});
test('queue insertion or transaction commit failure rolls back unlinking before physical removal',async()=>{
 for(const name of ['enqueueFails','commitFails']){flags[name]=true;assert.equal((await upload.DELETE(request('DELETE'))).status,503);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,[]);assert.equal(jobs.size,0);flags[name]=false;}
});
test('successful deletion unlinks before storage, ignores caller URL and removes durable intent after acknowledgement',async()=>{
 const response=await upload.DELETE(request('DELETE'));assert.equal(response.status,200);assert.equal((await response.json()).cleanupPending,false);assert.equal(state.resumeUrl,null);assert.deepEqual(removed,[oldUrl]);assert.equal(jobs.size,0);assert.equal(sources.size,0);
});
test('storage interruption retains durable retry while removed document stays unshared',async()=>{
 flags.cleanupFails=true;const response=await upload.DELETE(request('DELETE'));assert.equal(response.status,200);assert.equal((await response.json()).cleanupPending,true);assert.equal(state.resumeUrl,null);assert.equal(jobs.size,1);assert.equal(sources.has(oldUrl),true);
 const job=[...jobs.values()][0];assert.equal(job.lastErrorCode,'CLEANUP_FAILED');assert.ok(job.nextAttemptAt>new Date());
 flags.cleanupFails=false;makeDue();assert.equal((await cleanup.processDocumentCleanup()).completed,1);assert.equal(jobs.size,0);assert.equal(sources.size,0);
});
test('function interruption after commit leaves a recoverable intent',async()=>{
 flags.workerUnavailable=true;const response=await upload.DELETE(request('DELETE'));assert.equal((await response.json()).cleanupPending,true);assert.equal(state.resumeUrl,null);assert.equal(jobs.size,1);assert.deepEqual(removed,[]);
 flags.workerUnavailable=false;assert.equal((await cleanup.processDocumentCleanup()).completed,1);
});
test('failed acknowledgement after file removal retries idempotently instead of resurrecting metadata',async()=>{
 flags.ackFails=true;await upload.DELETE(request('DELETE'));assert.equal(state.resumeUrl,null);assert.equal(sources.size,0);assert.equal(jobs.size,1);
 flags.ackFails=false;makeDue();assert.equal((await cleanup.processDocumentCleanup()).completed,1);assert.equal(jobs.size,0);assert.equal(state.resumeUrl,null);
});
test('shared current reference blocks permanent cleanup until the last vault reference is gone',async()=>{
 const id=await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');let result=await cleanup.processDocumentCleanup([id]);assert.equal(result.referenced,1);assert.deepEqual(removed,[]);assert.equal(sources.has(oldUrl),true);
 state.resumeUrl=null;makeDue();assert.equal((await cleanup.processDocumentCleanup([id])).completed,1);
});
test('active worker lease prevents duplicate work; expired lease permits recovery',async()=>{
 const id=await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');state.resumeUrl=null;jobs.get(id).leaseUntil=new Date(Date.now()+60000);assert.equal((await cleanup.processDocumentCleanup()).attempted,0);assert.deepEqual(removed,[]);
 jobs.get(id).leaseUntil=new Date(0);assert.equal((await cleanup.processDocumentCleanup()).completed,1);
});
test('overlapping workers claim only one deletion attempt',async()=>{
 await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');state.resumeUrl=null;const results=await Promise.all([cleanup.processDocumentCleanup(),cleanup.processDocumentCleanup()]);assert.equal(results.reduce((n,x)=>n+x.completed,0),1);assert.equal(removed.length,1);
});
test('worker batch is bounded and status contains counts without identities or URLs',async()=>{
 state.resumeUrl=null;for(let i=0;i<7;i++)await cleanup.enqueueDocumentCleanup(prisma,oldUrl+'-'+i,'candidate','resume');assert.equal((await cleanup.processDocumentCleanup()).attempted,5);assert.equal(jobs.size,2);const result=await cleanup.documentCleanupStatus();assert.equal(result.pending,2);assert.equal(JSON.stringify(result).includes('candidate'),false);assert.equal(JSON.stringify(result).includes('blob'),false);
});
test('concurrent replacement prevents stale deletion from clearing or deleting newer file',async()=>{
 flags.race=true;assert.equal((await upload.DELETE(request('DELETE'))).status,409);assert.deepEqual(removed,[]);assert.equal(jobs.size,0);assert.match(state.resumeUrl,/concurrent/);
});
test('upload conflict removes only its own uncommitted source',async()=>{
 flags.race=true;assert.equal((await upload.POST(request())).status,409);assert.deepEqual(removed,['https://fixture.private.blob.vercel-storage.com/new-1.pdf']);assert.equal(sources.has(oldUrl),true);
});
test('successful replacement queues only old source after new metadata commit',async()=>{
 const response=await upload.POST(request());assert.equal(response.status,200);assert.match(state.resumeUrl,/new-1/);assert.deepEqual(removed,[oldUrl]);assert.equal(sources.has(state.resumeUrl),true);assert.equal(jobs.size,0);
});
test('repeat removal returns pending status without creating duplicate intent',async()=>{
 flags.cleanupFails=true;await upload.DELETE(request('DELETE'));const response=await upload.DELETE(request('DELETE'));assert.equal((await response.json()).cleanupPending,true);assert.equal(jobs.size,1);
});
test('operator and cron require independent authentication; status/dry-run do not delete',async()=>{
 await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');
 const adminRequest=(body,key='s'.repeat(40))=>new Request('http://localhost:3000/api/admin/document-cleanup',{method:'POST',headers:{Origin:'http://localhost:3000','content-type':'application/json'},body:JSON.stringify({adminSecret:key,...body})});
 assert.equal((await admin(adminRequest({action:'status'},'wrong'))).status,401);
 assert.equal((await admin(adminRequest({action:'process'}))).status,400);
 assert.equal((await admin(adminRequest({action:'status'}))).status,200);
 assert.equal((await cron(new Request('http://localhost:3000/api/cron/document-cleanup?dryRun=1'))).status,401);
 assert.equal((await cron(new Request('http://localhost:3000/api/cron/document-cleanup?dryRun=1',{headers:{authorization:'Bearer '+'c'.repeat(40)}}))).status,200);assert.deepEqual(removed,[]);
});

test('ambiguous transaction outcome never destroys a successfully committed replacement',async()=>{
 flags.ambiguousCommit=true;assert.equal((await upload.POST(request())).status,503);assert.match(state.resumeUrl,/new-1/);assert.equal(sources.has(state.resumeUrl),true);assert.deepEqual(removed,[]);assert.equal([...jobs.values()].some(j=>j.sourceUrl===state.resumeUrl&&j.lastErrorCode==='STILL_REFERENCED'),true);
});

test('a stale worker snapshot cannot bypass newly deferred retry time',async()=>{
 const id=await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');state.resumeUrl=null;const update=prisma.documentCleanup.updateMany;let delayed=false;
 prisma.documentCleanup.updateMany=async args=>{if(args.data.attempts&&!delayed){jobs.get(id).nextAttemptAt=new Date(Date.now()+60000);delayed=true;}return update(args);};
 assert.equal((await cleanup.processDocumentCleanup()).attempted,0);assert.deepEqual(removed,[]);
});
test('lost acknowledgement lease cannot be counted as completed',async()=>{
 const id=await cleanup.enqueueDocumentCleanup(prisma,oldUrl,'candidate','resume');state.resumeUrl=null;const acknowledge=prisma.documentCleanup.deleteMany;
 prisma.documentCleanup.deleteMany=async args=>{jobs.get(id).leaseUntil=new Date(Date.now()+600000);return acknowledge(args);};
 const result=await cleanup.processDocumentCleanup();assert.equal(result.completed,0);assert.equal(jobs.size,1);
});
