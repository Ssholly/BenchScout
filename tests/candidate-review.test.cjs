const {prisma}=require('./register.cjs');
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const load=Module._load;
let blobReads=0;
Module._load=function(name,parent,main){if(name==='@/lib/document-cleanup')return {enqueueDocumentCleanup:async()=>null,tryDocumentCleanup:async()=>false};if(name==='@vercel/blob')return {
 get:async()=>{blobReads++;return {statusCode:200,blob:{contentType:'application/pdf'},stream:new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('%PDF-synthetic'));controller.close();}})};},
 put:async()=>({url:'https://store.private.blob.vercel-storage.com/new-evidence.pdf'}),del:async()=>{},
};return load.call(this,name,parent,main);};
const {GET,POST}=require('../app/api/admin/reviews/route.ts');
const career=require('../app/api/user/career/route.ts').POST;
const {candidateProfile}=require('../lib/candidate-profile.ts');
const {currentCredentialReview}=require('../lib/credential-review.ts');
let user,audits,race,auditFails;
const req=(body,query='',authorized=true)=>new Request(`http://localhost:3000/api/admin/reviews${query}`,{method:body?'POST':'GET',headers:{Origin:'http://localhost:3000',...(authorized?{Authorization:`Bearer ${process.env.ADMIN_SECRET}`} : {}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
const decision=()=>({kind:'candidate',candidateId:user.id,email:user.email,revision:user.credentialRevision,approved:true,reviewer:'Test reviewer',reference:'Independent authority record checked on review date.',checks:{document:'Inspected private evidence and matched the candidate identity.',registration:'Checked registration and validity against independent issuing authority records.'}});
beforeEach(()=>{
 process.env.ADMIN_SECRET='s'.repeat(40);process.env.BLOB_PRIVATE_READ_WRITE_TOKEN='synthetic';blobReads=0; audits=[];race=false;auditFails=false;
 user={id:'candidate',name:'Test Scientist',email:'candidate@example.com',isVerified:true,careerPhase:'licensed',credentialRevision:3,licenseReviewRevision:null,isLicenseVerified:false,licenseReviewedAt:null,licenseReviewReference:null,licenseUrl:'https://store.private.blob.vercel-storage.com/license.pdf',licenseNumber:'TEST-123',licenseExpiry:new Date('2035-01-01'),candidateProfile:candidateProfile({})};
 prisma.rateLimit.upsert=async()=>({count:1});
 prisma.user.findUnique=prisma.user.findUniqueOrThrow=async()=>structuredClone(user);
 prisma.user.updateMany=async({where,data})=>{
   if(race){user.credentialRevision++;user.licenseUrl='https://store.private.blob.vercel-storage.com/replaced.pdf';race=false;}
   if(where.id!==user.id || where.credentialRevision!==user.credentialRevision)return {count:0};
   for(const [key,value] of Object.entries(data))user[key]=key==='credentialRevision'?user[key]+value.increment:value;
   return {count:1};
 };
 prisma.safetyReview.create=async({data})=>{if(auditFails)throw new(require('../lib/security.ts').ApiError)(503,'Audit unavailable');audits.push(data);return data;};
 prisma.$transaction=async fn=>{const snapshot=structuredClone({user,audits});try{return await fn(prisma);}catch(error){if(auditFails)({user,audits}=snapshot);throw error;}};
});
test('candidate lookup is administrator-only, minimised and bound to private evidence revision',async()=>{
 assert.equal((await GET(req(null,'?candidate=candidate@example.com',false))).status,401);
 const response=await GET(req(null,'?candidate=candidate@example.com'));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.candidate.revision,3);assert.equal(data.candidate.privateDocumentAvailable,true);
 assert.match(data.candidate.documentFingerprint,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(data).includes('.blob.vercel-storage.com'));assert.equal(data.candidate.candidateProfile,undefined);
});
test('approval requires loaded candidate identity, current revision, private evidence and independent check notes',async()=>{
 for(const change of [{revision:undefined},{candidateId:undefined},{checks:{}},{reviewer:''}])assert.equal((await POST(req({...decision(),...change}))).status,400);
 for(const change of [{revision:2},{candidateId:'other'}])assert.equal((await POST(req({...decision(),...change}))).status,409);
 for(const url of [null,'https://store.public.blob.vercel-storage.com/license.pdf']){user.licenseUrl=url;assert.equal((await POST(req(decision()))).status,400);}
 user.licenseUrl='https://store.private.blob.vercel-storage.com/license.pdf';user.licenseExpiry=new Date('2000-01-01');assert.equal((await POST(req(decision()))).status,400);assert.equal(audits.length,0);
});
test('approval consumes a revision, records evidence atomically and rejects a second reviewer using the old record',async()=>{
 const body=decision();assert.equal((await POST(req(body))).status,200);
 assert.equal(user.credentialRevision,4);assert.equal(user.licenseReviewRevision,4);assert.equal(currentCredentialReview(user),true);assert.equal(audits.length,1);assert.equal(audits[0].kind,'candidate');assert.equal(audits[0].evidence.revision,3);assert.ok(!JSON.stringify(audits).includes('.blob.vercel-storage.com'));
 assert.equal((await POST(req(body))).status,409);assert.equal(audits.length,1);
});
test('replacement between read and conditional approval cannot inherit a stale decision',async()=>{
 race=true;assert.equal((await POST(req(decision()))).status,409);assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewRevision,null);assert.equal(audits.length,0);
});
test('audit persistence failure rolls back candidate approval',async()=>{
 auditFails=true;assert.equal((await POST(req(decision()))).status,503);assert.equal(user.credentialRevision,3);assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewRevision,null);assert.equal(audits.length,0);
});
test('revocation is revision-checked and audited without requiring a current private document',async()=>{
 user.licenseUrl=null;assert.equal((await POST(req({...decision(),approved:false,checks:{}}))).status,200);assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewRevision,null);assert.equal(audits[0].decision,'revoked');
});
test('legacy, mismatched and replaced review markers never produce a current badge',()=>{
 const reviewed={...user,isLicenseVerified:true,licenseReviewedAt:new Date(),licenseReviewRevision:3};assert.equal(currentCredentialReview(reviewed),true);
 for(const licenseReviewRevision of [null,undefined,2])assert.equal(currentCredentialReview({...reviewed,licenseReviewRevision}),false);
 assert.equal(currentCredentialReview({...reviewed,credentialRevision:4}),false);
});
test('intern approvals use private provisional evidence and current provisional details',async()=>{
 user.careerPhase='internship';user.provisionalUrl='https://store.private.blob.vercel-storage.com/provisional.pdf';user.candidateProfile.provisionalNumber='TEST-PROV';
 assert.equal((await POST(req(decision()))).status,200);assert.equal(currentCredentialReview(user),true);
 user.candidateProfile.provisionalExpiry='2000-01-01';assert.equal((await POST(req(decision()))).status,400);
});
test('admin evidence downloads fail closed for stale revisions and legacy public credentials',async()=>{
 assert.equal((await GET(req(null,'?candidate=candidate@example.com&document=1&revision=2'))).status,409);
 user.licenseUrl='https://store.public.blob.vercel-storage.com/license.pdf';assert.equal((await GET(req(null,'?candidate=candidate@example.com&document=1&revision=3'))).status,404);
});
test('a stale career-profile write cannot restore credential details after a review or replacement',async()=>{
 prisma.authSession.findUnique=async()=>({role:'candidate',subjectId:user.id,expiresAt:new Date(Date.now()+60000)});
 prisma.user.update=async({where})=>{assert.equal(where.credentialRevision,3);throw {code:'P2025'};};
 const request=new Request('http://localhost:3000/api/user/career',{method:'POST',headers:{Origin:'http://localhost:3000',cookie:`benchscout_session=${'a'.repeat(64)}`,'Content-Type':'application/json'},body:JSON.stringify({careerPhase:'licensed',profile:user.candidateProfile})});
 assert.equal((await career(request)).status,409);
});

const candidateReq=(path,body,method='POST')=>new Request(`http://localhost:3000/api/${path}`,{method,headers:{Origin:'http://localhost:3000',cookie:`benchscout_session=${'a'.repeat(64)}`, 'Content-Type':'application/json'},body:JSON.stringify(body)});
function candidateSession(){prisma.authSession.findUnique=async()=>({role:'candidate',subjectId:user.id,expiresAt:new Date(Date.now()+60000)});}
function applyUserWrite({where,data}){assert.equal(where.id || where.email,where.id ? user.id : user.email);for(const [key,value] of Object.entries(data))user[key]=key==='credentialRevision'?user[key]+value.increment:value;return user;}
test('current private review evidence streams only to an authenticated administrator',async()=>{
 const query='?candidate=candidate@example.com&document=1&revision=3';
 assert.equal((await GET(req(null,query,false))).status,401);assert.equal(blobReads,0);
 const response=await GET(req(null,query));assert.equal(response.status,200);assert.equal(await response.text(),'%PDF-synthetic');assert.equal(blobReads,1);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.match(response.headers.get('content-disposition'),/^attachment/);
});
test('credential upload and deletion invalidate the review and increment revision even for an inactive credential kind',async()=>{
 candidateSession();const upload=require('../app/api/upload/route.ts');prisma.user.update=async args=>applyUserWrite(args);
 prisma.documentCleanup.count=async()=>0;
 for(const kind of ['license','provisional']){
  user.isLicenseVerified=true;user.licenseReviewedAt=new Date();user.licenseReviewRevision=user.credentialRevision;
  const before=user.credentialRevision;const form=new FormData();form.set('documentType',kind);form.set('file',new File(['%PDF-synthetic'],'evidence.pdf',{type:'application/pdf'}));
  const request=new Request('http://localhost:3000/api/upload',{method:'POST',headers:{Origin:'http://localhost:3000',cookie:`benchscout_session=${'a'.repeat(64)}`},body:form});
  assert.equal((await upload.POST(request)).status,200);assert.equal(user.credentialRevision,before+1);assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewRevision,null);
  assert.equal((await upload.DELETE(candidateReq('upload',{documentType:kind},'DELETE'))).status,200);assert.equal(user.credentialRevision,before+2);assert.equal(user[kind==='license'?'licenseUrl':'provisionalUrl'],null);
 }
});
test('registration edits clear and advance review markers; ordinary career preferences preserve a current review',async()=>{
 candidateSession();prisma.user.update=async args=>applyUserWrite(args);user.careerPhase='internship';user.isLicenseVerified=true;user.licenseReviewRevision=3;user.licenseReviewedAt=new Date();user.candidateProfile.provisionalNumber='PROV-OLD';
 let profile={...user.candidateProfile,preferredLocations:'Lagos'};
 assert.equal((await career(candidateReq('user/career',{careerPhase:'internship',profile}))).status,200);assert.equal(user.credentialRevision,3);assert.equal(user.isLicenseVerified,true);
 profile={...profile,provisionalNumber:'PROV-NEW'};
 assert.equal((await career(candidateReq('user/career',{careerPhase:'internship',profile}))).status,200);assert.equal(user.credentialRevision,4);assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewRevision,null);
});
test('location and preference JSON writes cannot overwrite a newer credential version',async()=>{
 candidateSession();prisma.user.findFirst=async()=>structuredClone(user);
 prisma.user.update=async({where})=>{assert.equal(where.credentialRevision,3);throw {code:'P2025'};};
 const profile=require('../app/api/user/route.ts').POST;
 assert.equal((await profile(candidateReq('user',{name:user.name,email:user.email,location:'Lagos',minScore:70}))).status,409);
 const preferences=require('../app/api/user/preferences/route.ts').POST;
 assert.equal((await preferences(candidateReq('user/preferences',{targetLocation:'Lagos'}))).status,409);
});
