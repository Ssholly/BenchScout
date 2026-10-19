const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const verification = require('../app/api/employer/verification/route.ts');
const reviews = require('../app/api/admin/reviews/route.ts');
const report = require('../app/api/jobs/report/route.ts').POST;
const direct = require('../app/api/jobs/direct/route.ts');
const apply = require('../app/api/apply/route.ts').POST;
const feed = require('../app/api/jobs/route.ts').GET;
let employer, job, role, audits, reports;
function req(path, body, admin=false, method='POST') { return new Request(`http://localhost:3173/api/${path}`, {method, headers:{Origin:'http://localhost:3173',cookie:`benchscout_session=${'a'.repeat(64)}`,...(admin?{Authorization:`Bearer ${process.env.ADMIN_SECRET}`} : {}),...(method==='GET'?{}:{'Content-Type':'application/json'})},...(method==='GET'?{}:{body:JSON.stringify(body)})}); }
const submission = () => ({organisationType:'registered-business',legalName:'Example Lab Ltd',registrationNumber:'RC123456',address:'12 Example Street, Abuja',website:'https://example.com',recruiterName:'Recruiter',recruiterRole:'HR manager',workEmail:'hr@example.com',phone:'08000000000',authorityEvidence:'Call the published switchboard and request HR.',operatingCredentials:'Facility registration reference to be checked.',noFees:true,authorised:true});
const companyDecision = () => ({kind:'employer',email:employer.email,approved:true,decision:'approved',revision:employer.verificationRevision,reviewer:'Administrator',feedback:'Company checks completed.',reference:'Independent checks recorded on official sources.',checks:{registration:'Matched name and CAC reference at the official public search.',recruiter:'Called independently obtained switchboard and confirmed HR authority.',presence:'Confirmed address and official contact details independently.',operatingCredentials:'Checked applicable facility credentials with issuing authority.'}});
const vacancyDecision = () => ({kind:'vacancy',jobId:job.id,jobUpdatedAt:job.updatedAt.toISOString(),approved:true,reviewer:'Administrator',reference:'Called official HR contact to confirm this opening.',checks:{authority:'Official HR authorised this recruiter.',vacancy:'Confirmed role, location, terms and availability.',noFees:'Confirmed no fees and checked requested information.'}});
beforeEach(()=>{
 role='employer';audits=[];reports=[];
 process.env.ADMIN_SECRET='s'.repeat(40);
 employer={id:'lab',email:'hr@example.com',companyName:'Example Lab',isVerified:false,emailVerificationRequired:true,emailVerifiedAt:new Date(),verificationStatus:'pending',verificationRevision:1,verificationDetails:submission()};
 job={id:'vacancy',employerId:'lab',userId:null,isDirectPost:true,status:'pending-review',role:'Scientist',company:'Example Lab',loc:'Abuja',skills:'QMS',salary:'Competitive',jobType:'full-time',updatedAt:new Date('2026-10-16T10:00:00Z'),listingDetails:{noFees:true},applications:[],url:'/matches/direct/lab'};
 prisma.authSession.findUnique=async()=>({subjectId:role==='employer'?'lab':'candidate',role,expiresAt:new Date(Date.now()+60000)});
 prisma.employer.findUnique=prisma.employer.findUniqueOrThrow=async()=>employer;
 prisma.user.findUnique=prisma.user.findUniqueOrThrow=async()=>({id:'candidate',email:'candidate@example.com',isVerified:true,resumeUrl:'private',careerPhase:'licensed'});
 prisma.rateLimit.upsert=async()=>({count:1});
 prisma.$transaction=async fn=>{const snapshot=structuredClone({employer,job,audits,reports});try{return await fn(prisma);}catch(e){({employer,job,audits,reports}=snapshot);throw e;}};
 prisma.employer.updateMany=async({where,data})=>{
   if ((where.verificationStatus?.not===employer.verificationStatus)||(where.verificationRevision!==undefined && where.verificationRevision!==employer.verificationRevision)||(where.isVerified!==undefined && where.isVerified!==employer.isVerified))return {count:0};
   for(const [key,value] of Object.entries(data)) employer[key]=key==='verificationRevision'?employer[key]+value.increment:value;
   return {count:1};
 };
 prisma.job.findUnique=prisma.job.findUniqueOrThrow=async()=>job;
 prisma.job.updateMany=async({where,data})=>{if((where.status && where.status!==job.status)||(where.updatedAt && +where.updatedAt!==+job.updatedAt))return {count:0};Object.assign(job,data);return {count:1};};
 prisma.job.update=async({data})=>Object.assign(job,data);
 prisma.job.create=async({data})=>{Object.assign(job,data);return job;};
 prisma.job.findMany=async()=>[{...job,employer:{isVerified:employer.isVerified}}];
 prisma.notification.findMany=async()=>[];
 prisma.safetyReview.create=async({data})=>{audits.push(data);return data;};
 prisma.jobReport.upsert=async({create})=>{if(!reports.length)reports.push({id:'report',status:'open',...create});return reports[0];};
 prisma.jobReport.findUniqueOrThrow=async()=>reports[0];
 prisma.jobReport.updateMany=async({data})=>{if(reports[0].status!=='open')return {count:0};Object.assign(reports[0],data);return {count:1};};
});
test('company submission resets approval and active listings but cannot lift suspension',async()=>{
 employer.isVerified=true;job.status='active';
 assert.equal((await verification.POST(req('employer/verification',submission()))).status,200);
 assert.equal(employer.isVerified,false);assert.equal(employer.verificationStatus,'pending');assert.equal(employer.verificationRevision,2);assert.equal(job.status,'pending-review');
 employer.verificationStatus='suspended';
 assert.equal((await verification.POST(req('employer/verification',submission()))).status,403);assert.equal(employer.verificationStatus,'suspended');
});
test('submission rejects missing authority, fees acknowledgement and unsafe URLs',async()=>{
 for(const changes of [{noFees:false},{authorised:false},{registrationNumber:''},{website:'javascript:alert(1)'},{workEmail:'invalid'}]) assert.equal((await verification.POST(req('employer/verification',{...submission(),...changes}))).status,400);
 assert.equal(employer.verificationRevision,1);
});
test('company approval requires every independent check and confirmed email',async()=>{
 const body=companyDecision();delete body.checks.recruiter;
 assert.equal((await reviews.POST(req('admin/reviews',body,true))).status,400);assert.equal(audits.length,0);
 employer.emailVerifiedAt=null;
 assert.equal((await reviews.POST(req('admin/reviews',companyDecision(),true))).status,400);
});
test('approval retains submission snapshot and stale decisions cannot overwrite new submissions',async()=>{
 const stale=companyDecision();stale.revision=0;
 assert.equal((await reviews.POST(req('admin/reviews',stale,true))).status,409);assert.equal(audits.length,0);
 assert.equal((await reviews.POST(req('admin/reviews',companyDecision(),true))).status,200);
 assert.equal(employer.isVerified,true);assert.equal(employer.verificationStatus,'approved');assert.equal(audits[0].evidence.submission.legalName,'Example Lab Ltd');
});
test('suspension blocks existing sessions from candidate access and pauses vacancies',async()=>{
 employer.isVerified=true;job.status='active';
 const body={...companyDecision(),approved:false,decision:'suspended',checks:{},feedback:'Investigating impersonation report.'};
 assert.equal((await reviews.POST(req('admin/reviews',body,true))).status,200);assert.equal(job.status,'pending-review');
 assert.equal((await require('../app/api/employer/talent/route.ts').GET(req('employer/talent',null,false,'GET'))).status,403);
 assert.equal((await direct.POST(req('jobs/direct',{role:'Scientist'}))).status,403);
});
test('audit failure rolls back an approval',async()=>{
 prisma.safetyReview.create=async()=>{throw new (require('../lib/security.ts').ApiError)(503,'Audit unavailable');};
 assert.equal((await reviews.POST(req('admin/reviews',companyDecision(),true))).status,503);assert.equal(employer.isVerified,false);
});
test('vacancy approval requires an approved company, independent checks, and current revision',async()=>{
 assert.equal((await reviews.POST(req('admin/reviews',vacancyDecision(),true))).status,400);
 employer.isVerified=true;
 const stale=vacancyDecision();stale.jobUpdatedAt='2026-10-15T10:00:00Z';
 assert.equal((await reviews.POST(req('admin/reviews',stale,true))).status,409);
 assert.equal((await reviews.POST(req('admin/reviews',vacancyDecision(),true))).status,200);assert.equal(job.status,'active');assert.equal(audits[0].kind,'vacancy');
});
test('new and edited vacancies require moderation and employer cannot self-publish',async()=>{
 employer.isVerified=true;
 const body={role:'Scientist',company:'Example Lab',loc:'Abuja',skills:'QMS',noFees:true,status:'active'};
 assert.equal((await direct.POST(req('jobs/direct',{...body,noFees:false}))).status,400);
 assert.equal((await direct.POST(req('jobs/direct',body))).status,200);assert.equal(job.status,'pending-review');
 job.status='active';
 assert.equal((await direct.PATCH(req('jobs/direct',{jobId:job.id,role:'Updated scientist',loc:'Abuja',skills:'QMS',status:'active'}))).status,200);assert.equal(job.status,'pending-review');
});
test('discovery hides pending vacancies and unapproved companies, keeping application history',async()=>{
 role='candidate';job.status='active';
 assert.deepEqual(await (await feed(req('jobs',null,false,'GET'))).json(),[]);
 employer.isVerified=true;job.status='pending-review';
 assert.deepEqual(await (await feed(req('jobs',null,false,'GET'))).json(),[]);
 job.status='active';assert.equal((await (await feed(req('jobs',null,false,'GET'))).json()).length,1);
 employer.isVerified=false;job.applications=[{status:'pending'}];assert.equal((await (await feed(req('jobs',null,false,'GET'))).json()).length,1);
});
test('direct applications reject a company whose review was revoked',async()=>{
 role='candidate';job.status='active';
 assert.equal((await apply(req('apply',{jobId:job.id}))).status,403);
});
test('reports are candidate-only, deduplicated, and cannot target another private external listing',async()=>{
 const body={jobId:job.id,reason:'payment',details:'Recruiter requested an interview processing fee.'};
 assert.equal((await report(req('jobs/report',body))).status,403);
 role='candidate';assert.equal((await report(req('jobs/report',body))).status,200);assert.equal((await report(req('jobs/report',body))).status,200);assert.equal(reports.length,1);
 job.isDirectPost=false;job.userId='another-candidate';assert.equal((await report(req('jobs/report',body))).status,404);
});
test('report resolution removes listing, records evidence and cannot be repeated',async()=>{
 role='candidate';await report(req('jobs/report',{jobId:job.id,reason:'payment',details:'Asked for interview fees by this recruiter.'}));job.status='active';
 const body={kind:'report',reportId:'report',decision:'removed',approved:false,reviewer:'Admin',reference:'Confirmed fee demand through official contact.'};
 assert.equal((await reviews.POST(req('admin/reviews',body,true))).status,200);assert.equal(job.status,'removed');assert.equal(audits.length,1);
 assert.equal((await reviews.POST(req('admin/reviews',body,true))).status,409);
});
test('company and report review queues require the admin secret',async()=>{
 assert.equal((await reviews.GET(req('admin/reviews',null,false,'GET'))).status,401);
 assert.equal((await reviews.POST(req('admin/reviews',companyDecision()))).status,401);
});
