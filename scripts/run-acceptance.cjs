// Live-service acceptance against an isolated schema. No real accounts or external mail.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const { get, list, del } = require('@vercel/blob');
const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const authOnly = args.has('--auth-only');
const runId = crypto.randomBytes(5).toString('hex');
const schema = `qa_acceptance_${runId}`;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'benchscout-acceptance-'));
fs.chmodSync(work, 0o700);
const output = path.join(work, 'report.json');
const log = fs.openSync(path.join(work, 'server.log'), 'a', 0o600);
const report = { runId, scope: authOnly ? 'isolated PostgreSQL schema; real authenticated HTTP; local SMTP capture; no private storage' : 'isolated PostgreSQL schema; real HTTP and private Blob; local SMTP capture', startedAt: new Date().toISOString(), checks: [], cleanup: {}, limitations: ['Not a hosted Vercel acceptance run', 'SMTP capture does not establish external inbox delivery', 'No backup/restore or load certification'] };
let db, control, app, smtp, smtpPort, base, childEnv;
const createdUsers = new Set();
const messages = [];
const sockets = new Set();
const password = 'BenchScout-QA-Only-2026!'; // Only synthetic, loopback-only accounts.
const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
const adminSecret = crypto.randomBytes(32).toString('hex');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function save() { fs.writeFileSync(output, JSON.stringify(report, null, 2), {mode:0o600}); }
async function step(name, action) { const start=Date.now();try {await action();report.checks.push({name,status:'passed',elapsedMs:Date.now()-start});process.stdout.write(`PASS ${name}\n`);}catch(error){report.checks.push({name,status:'failed',error:error.message});throw error;}finally{save();} }
async function command(binary, argv, env) { await new Promise((resolve,reject)=>{const child=spawn(binary,argv,{cwd:root,env,stdio:['ignore',log,log]});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`${path.basename(binary)} failed (${code}); private log retained`)));}); }
function fixturePdf() {
 const stream='BT /F1 12 Tf 40 750 Td (Synthetic BenchScout acceptance fixture - no real candidate data) Tj ET';
 const parts=['%PDF-1.4\n'];const offsets=[0];
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(parts.join('')));parts.push(`${i+1} 0 obj\n${object}\nendobj\n`);});
 const xref=Buffer.byteLength(parts.join(''));parts.push(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);return Buffer.from(parts.join(''));
}
const pdf=fixturePdf();
fs.writeFileSync(path.join(work,'synthetic.pdf'),pdf,{mode:0o600});
async function startSmtp() {
 smtp=net.createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));let buffer='',data=false,lines=[],recipient='';socket.write('220 localhost acceptance capture\r\n');socket.on('data',chunk=>{buffer+=chunk.toString();let end;while((end=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+2);if(data){if(line==='.') {messages.push({recipient,raw:lines.join('\r\n')});data=false;lines=[];socket.write('250 captured locally\r\n');}else lines.push(line.startsWith('..')?line.slice(1):line);continue;}if(/^EHLO|^HELO/i.test(line))socket.write('250-localhost\r\n250 SIZE 1048576\r\n');else if(/^MAIL FROM:/i.test(line))socket.write('250 OK\r\n');else if(/^RCPT TO:/i.test(line)){recipient=line.match(/<([^>]+)>/)?.[1]||'';socket.write('250 OK\r\n');}else if(line==='DATA'){data=true;socket.write('354 End with dot\r\n');}else if(line==='QUIT'){socket.end('221 Bye\r\n');}else socket.write('250 OK\r\n');}});});
 await new Promise((resolve,reject)=>{smtp.once('error',reject);smtp.listen(0,'127.0.0.1',resolve);});smtpPort=smtp.address().port;
}
function mailLink(email, pathname) {
 const candidates=messages.filter(message=>message.recipient===email).reverse();
 for(const message of candidates){const decoded=message.raw.replace(/=\r\n/g,'').replace(/=([0-9A-F]{2})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16))).replace(/&amp;/g,'&');const links=decoded.match(/https?:\/\/[^\s<>"']+/g)||[];for(const value of links){try{const url=new URL(value);if(url.origin===base&&url.pathname===pathname)return url;}catch{/* Ignore MIME fragments. */}}}
 throw new Error(`No locally captured ${pathname} link`);
}
function client() {return {cookie:''};}
async function call(actor, method, pathname, body, expected=200) {
 const response=await fetch(`${base}${pathname}`,{method,redirect:'manual',signal:AbortSignal.timeout(90000),headers:{...(actor?.admin?{Authorization:`Bearer ${adminSecret}`} : {}),...(actor?.cookie?{cookie:actor.cookie}:{}),...(method==='GET'?{}:{Origin:base}),...(body && !(body instanceof FormData)?{'Content-Type':'application/json'}:{})},...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{})});
 const cookie=response.headers.get('set-cookie');if(cookie&&actor)actor.cookie=cookie.split(';')[0];
 const json=response.headers.get('content-type')?.includes('application/json');const data=json?await response.json():Buffer.from(await response.arrayBuffer());
 assert.equal(response.status,expected,`${method} ${pathname.split('?')[0]} expected ${expected}, received ${response.status}${json && data.error ? `: ${data.error}`:''}`);
 return {data,response};
}
async function registerCandidate(label, phase) {
 const actor={...client(),email:`${label}-${runId}@example.invalid`};const form=new FormData();for(const [key,value] of Object.entries({name:`QA ${label}`,email:actor.email,password,careerPhase:phase}))form.set(key,value);
 await call(null,'POST','/api/auth/register',form);
 await call(actor,'POST','/api/auth/login',{email:actor.email,password},403);
 const link=mailLink(actor.email,'/verify');await call(null,'POST','/api/auth/verify',{email:actor.email,token:link.searchParams.get('token')});
 const login=await call(actor,'POST','/api/auth/login',{email:actor.email,password});actor.id=login.data.user.id;createdUsers.add(actor.id);return actor;
}
async function registerEmployer(label) {
 const actor={...client(),email:`${label}-${runId}@example.invalid`,companyName:`QA ${label} Laboratory`};await call(null,'POST','/api/auth/employer',{action:'register',email:actor.email,password,companyName:actor.companyName});
 await call(actor,'POST','/api/auth/employer',{action:'login',email:actor.email,password},403);
 const link=mailLink(actor.email,'/verify');await call(null,'POST','/api/auth/verify',{email:actor.email,role:'employer',token:link.searchParams.get('token')});
 const login=await call(actor,'POST','/api/auth/employer',{action:'login',email:actor.email,password});actor.id=login.data.employer.id;return actor;
}
async function upload(actor, kind) {const form=new FormData();form.set('documentType',kind);form.set('file',new File([pdf],`${kind}.pdf`,{type:'application/pdf'}));await call(actor,'POST','/api/upload',form);}
const admin={admin:true};
const companyChecks={registration:'Synthetic fixture registration checked in isolated schema.',recruiter:'Synthetic recruiter authority checked in isolated schema.',presence:'Synthetic official contact and address checked in isolated schema.',operatingCredentials:'Synthetic operating evidence checked; no real approval claim.'};
async function approveCompany(actor) {
 await call(actor,'POST','/api/employer/verification',{organisationType:'registered-business',legalName:actor.companyName,registrationNumber:'QA-NOT-A-REAL-CAC-RECORD',address:'Synthetic acceptance address',website:'https://example.invalid',recruiterName:'QA Recruiter',recruiterRole:'QA HR',workEmail:actor.email,phone:'00000000000',authorityEvidence:'Synthetic authority fixture only.',operatingCredentials:'Synthetic operating fixture only.',noFees:true,authorised:true});
 const current=await call(actor,'GET','/api/employer/verification');await call(admin,'POST','/api/admin/reviews',{kind:'employer',email:actor.email,revision:current.data.verificationRevision,approved:true,decision:'approved',reviewer:'Acceptance runner',feedback:'Synthetic fixture accepted only in isolated schema.',reference:'Isolated QA fixture; not an independent real company approval.',checks:companyChecks});
}
async function createJob(actor, type='full-time', title='Medical Laboratory Scientist') {
 const created=await call(actor,'POST','/api/jobs/direct',{role:title,company:actor.companyName,loc:'Lagos',skills:'MLS, quality control',jobType:type,noFees:true});const job=created.data.job;assert.equal(job.status,'pending-review');
 await call(admin,'POST','/api/admin/reviews',{kind:'vacancy',jobId:job.id,jobUpdatedAt:job.updatedAt,approved:true,reviewer:'Acceptance runner',reference:'Isolated synthetic vacancy; never published to the normal schema.',checks:{authority:'Synthetic recruiter authority confirmed.',vacancy:'Synthetic vacancy details confirmed.',noFees:'Synthetic no-fees and information requirements checked.'}});return job;
}
async function options(actor, kinds) {const result=await call(actor,'GET','/api/user');return result.data.applicationDocuments.filter(item=>kinds.includes(item.kind)).map(({kind,revision})=>({kind,revision}));}
async function apply(actor,job,kinds=['resume']) {return call(actor,'POST','/api/apply',{jobId:job.id,selectedDocuments:await options(actor,kinds)});}
async function blobAbsent(url) {const result=await get(url,{access:'private',token:privateToken,useCache:false});assert.equal(result,null,'Old private file must no longer be retrievable');}
async function cleanup() {
 report.mailCaptured=messages.length;
 if(app && app.exitCode===null){app.kill('SIGTERM');await Promise.race([new Promise(resolve=>app.once('exit',resolve)),pause(5000)]);}
 for(const socket of sockets)socket.destroy();if(smtp)await new Promise(resolve=>smtp.close(resolve));
 try {
  if(db){for(const user of await db.user.findMany({select:{id:true}}))createdUsers.add(user.id);}
  let removed=0;for(const id of authOnly ? [] : createdUsers){let cursor;do{const page=await list({prefix:`documents/${id}/`,token:privateToken,cursor});const urls=page.blobs.filter(blob=>blob.pathname.startsWith(`documents/${id}/`)).map(blob=>blob.url);if(urls.length){await del(urls,{token:privateToken});removed+=urls.length;}cursor=page.hasMore?page.cursor:undefined;}while(cursor);const remaining=await list({prefix:`documents/${id}/`,token:privateToken});assert.equal(remaining.blobs.length,0,'Synthetic file prefix must be empty after cleanup');}
  report.cleanup.privateFiles={status:authOnly?'not-used':'passed',removed};
 }catch(error){report.cleanup.privateFiles={status:'failed',error:error.message};}
 try{if(control && /^qa_acceptance_[a-f0-9]{10}$/.test(schema)){await control.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);report.cleanup.schema='removed';}}catch(error){report.cleanup.schema={status:'failed',error:error.message};}
 await db?.$disconnect();await control?.$disconnect();report.finishedAt=new Date().toISOString();save();fs.closeSync(log);
}
async function main() {
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
 if(args.has('--keep') && !process.stdin.isTTY)throw new Error('--keep requires an interactive terminal (allocate a TTY) so stop can trigger cleanup');
 const source=new URL(process.env.DATABASE_URL);const sourceSchema=source.searchParams.get('schema')||'public';
 if(!args.has('--run')){process.stdout.write(JSON.stringify({databaseConfigured:true,sourceSchema,privateStorageConfigured:!!privateToken,action:'Read-only preflight. Use --run for isolated live-service acceptance.'},null,2)+'\n');return;}
 if(!authOnly&&!privateToken)throw new Error('Private storage must be configured for acceptance');
 process.stdout.write(`ACCEPTANCE_REPORT ${output}\n`);
 const isolated=new URL(source);isolated.searchParams.set('schema',schema);
 control=new PrismaClient({datasourceUrl:source.toString()});db=new PrismaClient({datasourceUrl:isolated.toString()});
 await startSmtp();const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve);});const httpPort=probe.address().port;await new Promise(resolve=>probe.close(resolve));base=`http://127.0.0.1:${httpPort}`;
 childEnv={...process.env,DATABASE_URL:isolated.toString(),NODE_ENV:'development',NEXT_PUBLIC_APP_URL:base,ADMIN_SECRET:adminSecret,CRON_SECRET:crypto.randomBytes(32).toString('hex'),SALARY_OWNER_SECRET:crypto.randomBytes(32).toString('hex'),SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtpPort),SMTP_USER:'',SMTP_PASSWORD:'',SMTP_SECURE:'false',EMAIL_FROM:'BenchScout QA <qa@example.invalid>',RESEND_API_KEY:'',GMAIL_USER:'',GMAIL_APP_PASSWORD:'',EMAIL_USER:'',EMAIL_PASS:'',GEMINI_API_KEY:'',APIFY_API_KEY:'',VERCEL:''};
 if(authOnly)Object.assign(childEnv,{BLOB_PRIVATE_READ_WRITE_TOKEN:'',BLOB_BACKUP_READ_WRITE_TOKEN:'',DOCUMENT_BACKUP_ENABLED:'false',DOCUMENT_BACKUP_TEST_MODE:'false',DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED:'false'});
 await step('isolated schema migrations and empty account boundary',async()=>{await command(process.execPath,[path.join(root,'node_modules/prisma/build/index.js'),'migrate','deploy'],childEnv);assert.equal(await db.user.count(),0);assert.equal(await db.employer.count(),0);const tables=await control.$queryRawUnsafe('SELECT table_name FROM information_schema.tables WHERE table_schema=$1',schema);assert.ok(tables.some(row=>row.table_name==='Application'));});
 app=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',String(httpPort)],{cwd:root,env:childEnv,stdio:['ignore',log,log]});
 await step('isolated HTTP server and local-only mail transport',async()=>{let ready=false;for(let i=0;i<90;i++){if(app.exitCode!==null)throw new Error('Acceptance server exited; inspect private log');try{if(!fs.readFileSync(path.join(work,'server.log'),'utf8').includes('Ready in')){await pause(500);continue;}const response=await fetch(`${base}/api/auth/session`,{signal:AbortSignal.timeout(1500)});if(response.status===401){ready=true;break;}}catch{/* Server may still compile. */}await pause(500);}assert.equal(ready,true);});
 let licensed,seeking,training,employer,other,job1,job2,internJob,app1;
 await step('candidate signup, captured confirmation and blocked unverified login',async()=>{licensed=await registerCandidate('licensed','licensed');seeking=await registerCandidate('seeking','internship');training=await registerCandidate('training','internship');});
 await step('employer confirmation stays separate from company approval',async()=>{employer=await registerEmployer('employer');other=await registerEmployer('other');await call(employer,'POST','/api/jobs/direct',{role:'QA vacancy',company:employer.companyName,loc:'Lagos',skills:'MLS',noFees:true},403);assert.equal((await call(employer,'GET','/api/employer/verification')).data.isVerified,false);});
 if(authOnly){
  await step('authenticated sessions persist and reject cross-account identity',async()=>{
   for(const actor of [licensed,seeking,training]){
    const session=(await call(actor,'GET','/api/auth/session')).data.session;
    assert.equal(session.id,actor.id);assert.equal(session.email,actor.email);
    assert.equal((await call(actor,'GET','/api/auth/session')).data.session.id,actor.id);
   }
   await call(licensed,'GET',`/api/user?email=${encodeURIComponent(seeking.email)}`,null,403);
   await db.authSession.updateMany({where:{subjectId:training.id},data:{expiresAt:new Date(0)}});
   await call(training,'GET','/api/auth/session',null,401);
   const login=await call(training,'POST','/api/auth/login',{email:training.email,password});
   assert.equal(login.data.user.id,training.id);
   const cookie=login.response.headers.get('set-cookie');
   assert.match(cookie,/HttpOnly/i);assert.match(cookie,/SameSite=lax/i);assert.match(cookie,/Path=\//i);
   assert.equal((await call(training,'GET','/api/auth/session')).data.session.id,training.id);
  });
  await step('real HTTP salary ownership, duplicate submission and anonymous legacy preservation',async()=>{
   const fields={role:'QA ONLY MLS',location:'Lagos',salary:250000,experience:'1-3 years'};
   const legacy=await db.salaryReport.create({data:fields});
   const bob=(await call(seeking,'POST','/api/salary',fields)).data.id;
   const alice=(await call(licensed,'POST','/api/salary',{...fields,ownerKey:'caller-cannot-choose-owner'})).data.id;
   assert.equal((await call(licensed,'POST','/api/salary',{...fields,salary:300000})).data.id,alice);
   assert.equal(await db.salaryReport.count(),3);
   await call(null,'DELETE','/api/salary',{id:alice},401);
   await call(employer,'PUT','/api/salary',{...fields,id:alice},403);
   await call(licensed,'PUT','/api/salary',{...fields,id:alice,salary:350000});
   await call(licensed,'PUT','/api/salary',{...fields,id:bob},404);
   await call(licensed,'PUT','/api/salary',{...fields,id:legacy.id},404);
   for(const id of [bob,legacy.id])await call(licensed,'DELETE','/api/salary',{id},404);
   const publicResult=(await call(null,'GET','/api/salary')).data;
   assert.equal(publicResult.count,3);assert.ok(!JSON.stringify(publicResult).includes('ownerKey'));
   assert.equal((await db.salaryReport.findUnique({where:{id:alice}})).salary,350000);
   await call(licensed,'DELETE','/api/salary',{id:alice});
   assert.equal(await db.salaryReport.count(),2);
   assert.equal((await db.salaryReport.findUnique({where:{id:bob}})).salary,fields.salary);
   assert.deepEqual(await db.salaryReport.findUnique({where:{id:legacy.id}}),legacy);
  });
  await step('logout invalidates previously valid candidate and employer cookies',async()=>{
   for(const actor of [licensed,employer]){
    const cookie=actor.cookie;
    await call(actor,'GET','/api/auth/session');
    await call(actor,'POST','/api/auth/logout');
    await call({cookie},'GET','/api/auth/session',null,401);
    await call(null,'GET','/api/auth/session',null,401);
   }
  });
  await step('no synthetic accounts were written to the normal schema',async()=>{
   assert.equal(await control.user.count({where:{email:{in:[licensed.email,seeking.email,training.email]}}}),0);
   assert.equal(await control.employer.count({where:{email:{in:[employer.email,other.email]}}}),0);
  });
  report.mailCaptured=messages.length;report.status='passed';save();return;
 }
 await step('private CV, license and provisional uploads with owner and cross-account reads',async()=>{for(const actor of [licensed,seeking,training])await upload(actor,'resume');await upload(licensed,'license');for(const actor of [seeking,training])await upload(actor,'provisional');const owner=await call(licensed,'GET',`/api/documents?userId=${licensed.id}&kind=resume`);assert.deepEqual(owner.data,pdf);assert.equal(owner.response.headers.get('cache-control'),'private, no-store');const stored=(await db.user.findUnique({where:{id:licensed.id}})).resumeUrl;const anonymous=await fetch(stored,{redirect:'manual'});assert.ok([401,403,404].includes(anonymous.status),'Direct private Blob URL must deny anonymous reads');await anonymous.body?.cancel();await call(seeking,'GET',`/api/documents?userId=${licensed.id}&kind=resume`,null,403);await call(null,'GET',`/api/documents?userId=${licensed.id}&kind=resume`,null,401);await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=resume`,null,403);});
 await step('licensed, seeking and in-training profiles persist through HTTP',async()=>{await call(licensed,'POST','/api/user/compliance',{licenseNumber:'QA-TEST-123',expiryDate:'2035-01-01'});for(const [actor,stage]of [[seeking,'seeking'],[training,'training']]){const current=await call(actor,'GET','/api/user');await call(actor,'POST','/api/user/career',{careerPhase:'internship',profile:{...current.data.user.candidateProfile,placementStage:stage,relocation:false,provisionalNumber:'QA-PROV',provisionalExpiry:'2035-01-01',...(stage==='training'?{placementInstitution:'Synthetic placement',placementStart:'2026-01-01'}:{})}});}assert.equal((await db.user.findUnique({where:{id:training.id}})).candidateProfile.placementStage,'training');});
 await step('real-database candidate review compare-and-set permits only one competing decision',async()=>{const snapshot=(await call(admin,'GET',`/api/admin/reviews?candidate=${encodeURIComponent(licensed.email)}`)).data.candidate;const body={kind:'candidate',candidateId:licensed.id,email:licensed.email,revision:snapshot.revision,approved:true,reviewer:'Acceptance runner',reference:'Synthetic credential only; isolated test not a real registration approval.',checks:{document:'Inspected generated synthetic PDF fixture.',registration:'Compared synthetic registration fields to isolated fixture.'}};const request=()=>fetch(`${base}/api/admin/reviews`,{method:'POST',headers:{Origin:base,Authorization:`Bearer ${adminSecret}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const results=await Promise.all([request(),request()]);assert.deepEqual(results.map(result=>result.status).sort(),[200,409]);assert.equal(await db.safetyReview.count({where:{kind:'candidate',subjectId:licensed.id}}),1);});
 await step('real-database audit failure rolls back candidate approval',async()=>{let current=await db.user.findUnique({where:{id:licensed.id}});await call(admin,'POST','/api/admin/reviews',{kind:'candidate',candidateId:licensed.id,email:licensed.email,revision:current.credentialRevision,approved:false,reviewer:'Acceptance runner',reference:'Synthetic revocation before rollback injection.'});current=await db.user.findUnique({where:{id:licensed.id}});await db.$executeRawUnsafe(`CREATE FUNCTION "${schema}".qa_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.kind = 'candidate' THEN RAISE EXCEPTION 'Synthetic audit persistence failure'; END IF; RETURN NEW; END; $$`);await db.$executeRawUnsafe(`CREATE TRIGGER qa_audit_failure BEFORE INSERT ON "${schema}"."SafetyReview" FOR EACH ROW EXECUTE FUNCTION "${schema}".qa_reject_audit()`);try{await call(admin,'POST','/api/admin/reviews',{kind:'candidate',candidateId:licensed.id,email:licensed.email,revision:current.credentialRevision,approved:true,reviewer:'Acceptance runner',reference:'Synthetic rollback assertion only.',checks:{document:'Synthetic private PDF inspected.',registration:'Synthetic registration fixture confirmed.'}},500);const after=await db.user.findUnique({where:{id:licensed.id}});assert.equal(after.credentialRevision,current.credentialRevision);assert.equal(after.isLicenseVerified,false);}finally{await db.$executeRawUnsafe(`DROP TRIGGER qa_audit_failure ON "${schema}"."SafetyReview"`);await db.$executeRawUnsafe(`DROP FUNCTION "${schema}".qa_reject_audit()`);}});
 await step('company and vacancy moderation with stage-aware discovery',async()=>{await approveCompany(employer);await approveCompany(other);job1=await createJob(employer);job2=await createJob(employer);internJob=await createJob(employer,'internship','Medical Laboratory Science Intern');const licensedFeed=(await call(licensed,'GET','/api/jobs')).data;const internFeed=(await call(seeking,'GET','/api/jobs')).data;assert.ok(licensedFeed.some(job=>job.id===job1.id));assert.ok(!licensedFeed.some(job=>job.id===internJob.id));assert.ok(internFeed.some(job=>job.id===internJob.id));assert.ok(!internFeed.some(job=>job.id===job1.id));await call(seeking,'POST','/api/apply',{jobId:job1.id,selectedDocuments:await options(seeking,['resume'])},400);});
 await step('selected document submissions, duplicates and scoped employer access',async()=>{await apply(licensed,job1);await apply(licensed,job2,['resume','license']);await apply(seeking,internJob,['resume','provisional']);await apply(training,internJob);await apply(licensed,job1);assert.equal(await db.application.count({where:{userId:licensed.id,jobId:job1.id}}),1);const first=(await call(employer,'GET',`/api/jobs/applicants?jobId=${job1.id}`)).data.applications[0];app1=first.id;assert.equal(first.user.licenseUrl,null);assert.ok(!JSON.stringify(first).includes('.blob.vercel-storage.com'));assert.deepEqual((await call(employer,'GET',first.user.resumeUrl)).data,pdf);await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=license&applicationId=${app1}`,null,403);assert.deepEqual((await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=license`)).data,pdf);assert.ok((await call(employer,'GET',`/api/jobs/applicants?jobId=${job2.id}`)).data.applications[0].id);});
 await step('unrelated employer and candidate IDs cannot borrow application access',async()=>{await call(other,'GET',`/api/jobs/applicants?jobId=${job1.id}`,null,403);await call(other,'GET',`/api/documents?userId=${licensed.id}&kind=resume`,null,403);await call(seeking,'DELETE','/api/apply',{jobId:job1.id},404);await call(other,'PATCH','/api/jobs/applicants',{applicationId:app1,status:'hired'},403);});
 await step('interview persists, notifies the candidate and delivers to captured SMTP',async()=>{const before=messages.length;const result=await call(employer,'PATCH','/api/jobs/applicants',{applicationId:app1,status:'shortlisted',interviewDate:'2030-01-01',interviewTime:'10:30',interviewLoc:'Synthetic QA interview room'});assert.equal(result.data.emailDelivered,true);assert.equal(messages.length,before+1);assert.equal(await db.notification.count({where:{userId:licensed.id,title:'Interview scheduled'}}),1);assert.equal((await db.application.findUnique({where:{id:app1}})).status,'shortlisted');});
 await step('closure preserves history; withdrawal removes only its application grant',async()=>{await call(employer,'DELETE','/api/jobs/direct',{jobId:job1.id});assert.equal(await db.application.count({where:{id:app1}}),1);assert.deepEqual((await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=resume&applicationId=${app1}`)).data,pdf);await call(licensed,'DELETE','/api/apply',{jobId:job1.id});await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=resume&applicationId=${app1}`,null,403);await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=resume`);});
 await step('replacement never shares the new file and removes the previous private object',async()=>{const old=(await db.user.findUnique({where:{id:licensed.id}})).resumeUrl;await upload(licensed,'resume');await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=resume`,null,403);await call(licensed,'GET',`/api/documents?userId=${licensed.id}&kind=resume`);await blobAbsent(old);await apply(licensed,job2,['resume','license']);assert.equal((await call(employer,'GET',`/api/jobs/applicants?jobId=${job2.id}`)).data.applications[0].user.resumeUrl,null);});
 await step('last withdrawal revokes access; private deletion removes owner access and stored object',async()=>{await call(licensed,'DELETE','/api/apply',{jobId:job2.id});await call(employer,'GET',`/api/documents?userId=${licensed.id}&kind=license`,null,403);const old=(await db.user.findUnique({where:{id:licensed.id}})).licenseUrl;await call(licensed,'DELETE','/api/upload',{documentType:'license'});await call(licensed,'GET',`/api/documents?userId=${licensed.id}&kind=license`,null,404);await blobAbsent(old);});
 await step('suspension blocks existing employer sessions, submissions and document reads',async()=>{const current=(await call(employer,'GET','/api/employer/verification')).data;await call(admin,'POST','/api/admin/reviews',{kind:'employer',email:employer.email,revision:current.verificationRevision,approved:false,decision:'suspended',reviewer:'Acceptance runner',feedback:'Synthetic suspension test.',reference:'Isolated synthetic safety restriction.'});await call(employer,'GET',`/api/jobs/applicants?jobId=${internJob.id}`,null,403);await call(employer,'GET',`/api/documents?userId=${seeking.id}&kind=resume`,null,403);await call(employer,'POST','/api/jobs/direct',{role:'Synthetic',company:employer.companyName,loc:'Lagos',skills:'MLS',noFees:true},403);await call(training,'POST','/api/apply',{jobId:internJob.id,selectedDocuments:await options(training,['resume'])},403);});
 await step('logout revokes the actual persisted session',async()=>{const old=other.cookie;await call(other,'POST','/api/auth/logout');await call({cookie:old},'GET','/api/auth/session',null,401);});
 await step('no synthetic accounts were written to the normal schema',async()=>{assert.equal(await control.user.count({where:{email:{in:[licensed.email,seeking.email,training.email]}}}),0);assert.equal(await control.employer.count({where:{email:{in:[employer.email,other.email]}}}),0);});
 report.mailCaptured=messages.length;report.status='passed';save();
 if(args.has('--keep')){await call(other,'POST','/api/auth/employer',{action:'login',email:other.email,password});const browserJob=await createJob(other);report.browser={url:base.replace("127.0.0.1","localhost"),candidateEmail:licensed.email,employerEmail:other.email,jobId:browserJob.id};save();process.stdout.write(`BROWSER_READY ${JSON.stringify(report.browser)}\nSend stop to clean up the isolated run.\n`);await new Promise(resolve=>process.stdin.once('data',resolve));}
}
(async()=>{try{await main();}catch(error){report.status='failed';report.failure=error.message;process.stdout.write(`FAIL ${error.message}\n`);process.exitCode=1;}finally{if(args.has('--run'))await cleanup();else fs.closeSync(log);if(args.has('--run')){if(report.cleanup.privateFiles?.status==='failed'||report.cleanup.schema!=='removed')process.exitCode=1;process.stdout.write(`REPORT ${output}\n`);}}})();
