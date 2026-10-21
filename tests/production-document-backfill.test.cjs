const {prisma,mailer}=require('./register.cjs');
const Module=require('node:module');
const {test,beforeEach,after}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const files=new Map();let rows,reads,writes,deletions,onRead,onWrite;
const source='https://live.private.blob.vercel-storage.com/documents/private-person-id-example/resume/private-cv.pdf';
const fields=['resumeUrl','licenseUrl','provisionalUrl','degreeUrl','statementOfResultUrl','placementLetterUrl','certificateUrl','avatarUrl'];
const load=Module._load;
Module._load=function(name,parent,main){
 if(name==='@vercel/blob')return{
  put:async(path,bytes,options)=>{assert.equal(options.access,'private');writes++;const url=`https://${options.token}.private.blob.vercel-storage.com/${path}`;files.set(url,Buffer.from(bytes));if(onWrite)onWrite();return{url};},
  get:async(path,options)=>{assert.equal(options.access,'private');assert.equal(options.useCache,false);const url=path.startsWith('https:')?path:`https://${options.token}.private.blob.vercel-storage.com/${path}`;if(url===source){reads++;if(onRead)onRead();}const bytes=files.get(url);return bytes?{statusCode:200,blob:{size:bytes.length},stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})}:null;},
  del:async(path,options)=>{const url=path.startsWith('https:')?path:`https://${options.token}.private.blob.vercel-storage.com/${path}`;deletions.push(url);files.delete(url);}
 };
 return load.call(this,name,parent,main);
};
const {previewProductionBackfill,applyProductionBackfill}=require('../lib/production-document-backfill.ts');
const {POST}=require('../app/api/admin/document-backups/route.ts');
const expected=createHash('sha256').update('expected.example/neondb').digest('hex');
const names=['VERCEL_ENV','NODE_ENV','NEXT_PUBLIC_APP_URL','DOCUMENT_BACKUP_TEST_MODE','DOCUMENT_BACKUP_ENABLED','DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED','DATABASE_URL','ADMIN_SECRET','BLOB_PRIVATE_READ_WRITE_TOKEN','BLOB_BACKUP_READ_WRITE_TOKEN','DOCUMENT_BACKUP_ENCRYPTION_KEY','DOCUMENT_BACKUP_ALERT_EMAIL'];
const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
beforeEach(()=>{
 Object.assign(process.env,{VERCEL_ENV:'production',NODE_ENV:'production',NEXT_PUBLIC_APP_URL:'https://staged.example',DOCUMENT_BACKUP_TEST_MODE:'false',DOCUMENT_BACKUP_ENABLED:'true',DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED:'true',DATABASE_URL:'postgresql://private-user:private-password@expected-pooler.example/neondb?sslmode=require',ADMIN_SECRET:'s'.repeat(40),BLOB_PRIVATE_READ_WRITE_TOKEN:'live',BLOB_BACKUP_READ_WRITE_TOKEN:'archive',DOCUMENT_BACKUP_ENCRYPTION_KEY:'ab'.repeat(32),DOCUMENT_BACKUP_ALERT_EMAIL:'operator@example.com'});
 files.clear();rows=[{id:'private-person-id-example',resumeUrl:source}];files.set(source,Buffer.from('%PDF-QA bytes'));reads=0;writes=0;deletions=[];onRead=null;onWrite=null;
 prisma.user.findMany=async args=>{assert.equal(args.take,101);assert.deepEqual(Object.keys(args.select).sort(),['id',...fields].sort());return structuredClone(rows);};
 prisma.$queryRaw=async()=>[{name:'neondb'}];prisma.rateLimit.upsert=async()=>({count:1});mailer.sendEmail=async()=>{};
});
after(()=>{for(const k of names){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}});
const confirm='COPY CURRENT PRIVATE FILES';
function request(body,key=process.env.ADMIN_SECRET){return new Request('https://staged.example/api/admin/document-backups',{method:'POST',headers:{'content-type':'application/json',origin:'https://staged.example','sec-fetch-site':'same-origin'},body:JSON.stringify({adminSecret:key,...body})});}
test('Production preview inventories all vault kinds without reading/copying files or returning identities',async()=>{
 const p=await previewProductionBackfill(expected);assert.equal(p.dryRun,true);assert.equal(p.uniqueFiles,1);assert.equal(p.eligibleReferences,1);assert.equal(p.kinds.resume,1);assert.equal(p.canApply,true);assert.ok(p.planToken);assert.equal(reads,0);assert.equal(writes,0);
 for(const privateValue of [source,'private-person-id-example','private-user','private-password'])assert.equal(JSON.stringify(p).includes(privateValue),false);
});
test('apply is separately disabled by default while read-only inventory remains available',async()=>{
 const previousPlan=await previewProductionBackfill(expected);delete process.env.DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED;
 const preview=await previewProductionBackfill(expected);assert.equal(preview.inventoryReady,true);assert.equal(preview.applyEnabled,false);assert.equal(preview.canApply,false);assert.equal(preview.planToken,null);
 await assert.rejects(()=>applyProductionBackfill(expected,previousPlan.planToken,confirm),e=>e.status===403);assert.equal(reads,0);assert.equal(writes,0);
});
test('wrong administrator key and cross-site preview are denied before inventory or file access',async()=>{
 let queried=false;prisma.user.findMany=async()=>{queried=true;return rows;};
 assert.equal((await POST(request({action:'production-backfill-preview',expectedTargetFingerprint:expected},'wrong'))).status,401);
 const cross=new Request('https://staged.example/api/admin/document-backups',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.example'},body:JSON.stringify({adminSecret:process.env.ADMIN_SECRET,action:'production-backfill-preview',expectedTargetFingerprint:expected})});
 assert.equal((await POST(cross)).status,403);assert.equal(queried,false);assert.equal(reads,0);assert.equal(writes,0);
});
test('Production, test-mode-off and exact verified target are mandatory',async()=>{
 process.env.VERCEL_ENV='preview';await assert.rejects(()=>previewProductionBackfill(expected),e=>e.status===403);
 process.env.VERCEL_ENV='production';process.env.DOCUMENT_BACKUP_TEST_MODE='true';await assert.rejects(()=>previewProductionBackfill(expected),e=>e.status===403);
 process.env.DOCUMENT_BACKUP_TEST_MODE='false';await assert.rejects(()=>previewProductionBackfill('0'.repeat(64)),e=>e.status===409);
 prisma.$queryRaw=async()=>[{name:'wrong_database'}];await assert.rejects(()=>previewProductionBackfill(expected),e=>e.status===409);assert.equal(writes,0);assert.equal(reads,0);
});
test('legacy/malformed references and oversized inventories cannot receive a usable approval plan',async()=>{
 rows[0].licenseUrl=source+'?token=private';let p=await previewProductionBackfill(expected);assert.equal(p.blockedReferences,1);assert.equal(p.canApply,false);assert.equal(p.planToken,null);
 rows=[0,1].map(i=>({id:`u${i}`,...Object.fromEntries(fields.map((f,j)=>[f,source+`-${i}-${j}`]))}));p=await previewProductionBackfill(expected);assert.equal(p.uniqueFiles,16);assert.equal(p.canApply,false);assert.equal(p.planToken,null);
 rows=Array.from({length:101},(_,i)=>({id:`u${i}`}));await assert.rejects(()=>previewProductionBackfill(expected),e=>e.status===409);assert.equal(writes,0);assert.equal(reads,0);
});
test('missing confirmation, altered plan and expired plan never copy files',async()=>{
 const p=await previewProductionBackfill(expected);await assert.rejects(()=>applyProductionBackfill(expected,p.planToken,''),e=>e.status===400);
 await assert.rejects(()=>applyProductionBackfill(expected,p.planToken.slice(0,-1)+'!',confirm),e=>e.status===400);
 const now=Date.now;try{Date.now=()=>now()+16*60*1000;await assert.rejects(()=>applyProductionBackfill(expected,p.planToken,confirm),e=>e.status===409);}finally{Date.now=now;}
 assert.equal(reads,0);assert.equal(writes,0);
});
test('changed inventory or encryption configuration rejects an approved plan before file reads',async()=>{
 let p=await previewProductionBackfill(expected);rows[0].resumeUrl=source+'replacement';await assert.rejects(()=>applyProductionBackfill(expected,p.planToken,confirm),e=>e.status===409);
 rows[0].resumeUrl=source;p=await previewProductionBackfill(expected);process.env.DOCUMENT_BACKUP_ENCRYPTION_KEY='cd'.repeat(32);await assert.rejects(()=>applyProductionBackfill(expected,p.planToken,confirm),e=>e.status===409);assert.equal(reads,0);assert.equal(writes,0);
});
test('approved copy verifies encrypted private bytes, deduplicates references and preserves source records/grants',async()=>{
 rows[0].licenseUrl=source;const p=await previewProductionBackfill(expected);const before=structuredClone(rows);const result=await applyProductionBackfill(expected,p.planToken,confirm);
 assert.equal(result.passed,true);assert.equal(result.eligibleReferences,2);assert.equal(result.uniqueFiles,1);assert.equal(result.verified,1);assert.equal(writes,1);assert.deepEqual(rows,before);assert.equal(files.get(source).toString(),'%PDF-QA bytes');assert.equal(deletions.includes(source),false);
 const archive=[...files].find(([url])=>url.includes('archive.private'));assert.ok(archive);assert.equal(archive[1].includes(files.get(source)),false);assert.equal(result.businessRecordsChanged,false);assert.equal(result.applicationGrantsChanged,false);assert.equal(JSON.stringify(result).includes('blob.vercel-storage'),false);
});
test('a source removed during reading is skipped before any archive write',async()=>{
 const p=await previewProductionBackfill(expected);onRead=()=>{delete rows[0].resumeUrl;};const result=await applyProductionBackfill(expected,p.planToken,confirm);assert.equal(result.passed,false);assert.equal(result.skippedChanged,1);assert.equal(writes,0);assert.equal(result.inventoryChanged,true);assert.equal(deletions.includes(source),false);
});
test('a source removed during copying has its stale archive purged without deleting its source file',async()=>{
 const p=await previewProductionBackfill(expected);onWrite=()=>{delete rows[0].resumeUrl;};const result=await applyProductionBackfill(expected,p.planToken,confirm);assert.equal(result.passed,false);assert.equal(result.stalePurged,1);assert.equal(result.verified,0);assert.equal([...files.keys()].some(u=>u.includes('archive.private')),false);assert.equal(files.has(source),true);assert.equal(deletions.includes(source),false);
});
test('unreadable source reports failure instead of a protection pass',async()=>{
 const p=await previewProductionBackfill(expected);files.delete(source);const result=await applyProductionBackfill(expected,p.planToken,confirm);assert.equal(result.passed,false);assert.equal(result.failed,1);assert.equal(result.verified,0);assert.equal(writes,0);
});
test('protected API preview and apply use the signed inventory, ignoring arbitrary caller URLs/accounts',async()=>{
 const preview=await POST(request({action:'production-backfill-preview',expectedTargetFingerprint:expected,userId:'attacker-target',url:'https://attacker.example'}));assert.equal(preview.status,200);const plan=await preview.json();
 const response=await POST(request({action:'production-backfill-apply',expectedTargetFingerprint:expected,planToken:plan.planToken,confirm,userId:'attacker-target',url:'https://attacker.example'}));assert.equal(response.status,200);assert.equal((await response.json()).passed,true);assert.equal(writes,1);
});
