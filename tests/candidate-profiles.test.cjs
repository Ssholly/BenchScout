const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { candidateProfile, opportunityForPhase, opportunityForPreferences, internshipApproval } = require('../lib/candidate-profile.ts');
const { applicationReadiness } = require('../lib/readiness.ts');
const save = require('../app/api/user/career/route.ts').POST;
const feed = require('../app/api/jobs/route.ts').GET;
const apply = require('../app/api/apply/route.ts').POST;
let user,writes,role;
const request=(path,body)=>new Request(`http://localhost:3000${path}`,{method:body?'POST':'GET',headers:{Origin:'http://localhost:3000',cookie:`benchscout_session=${'c'.repeat(64)}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
beforeEach(()=>{
 user={id:'intern',email:'intern@example.com',name:'Intern',isVerified:true,careerPhase:'internship',candidateProfile:{},resumeUrl:'https://test.private.blob.vercel-storage.com/cv.pdf',provisionalUrl:'https://test.private.blob.vercel-storage.com/provisional.pdf',licenseUrl:null,licenseNumber:null};writes=[];role='candidate';
 prisma.authSession.findUnique=async()=>({subjectId:'intern',role,expiresAt:new Date(Date.now()+60000)});
 prisma.user.findUnique=prisma.user.findUniqueOrThrow=async()=>user;
 prisma.employer.findUnique=async()=>({id:'intern',email:'lab@example.com',isVerified:true});
 prisma.user.update=async({where,data})=>{assert.equal(where.id,'intern');writes.push(data);Object.assign(user,data);return user;};
 prisma.rateLimit.upsert=async()=>({count:1});
});
test('placement stage is saved on the authenticated account, and training needs an institution/start date',async()=>{
 const profile=candidateProfile({placementStage:'training'});
 assert.equal((await save(request('/api/user/career',{careerPhase:'internship',profile}))).status,400);assert.equal(writes.length,0);
 Object.assign(profile,{placementInstitution:'Test Teaching Hospital',placementStart:'2026-10-01',placementEnd:'2027-10-01'});
 assert.equal((await save(request('/api/user/career',{careerPhase:'internship',profile}))).status,200);
 assert.equal(user.candidateProfile.placementStage,'training');assert.equal(user.resumeUrl,'https://test.private.blob.vercel-storage.com/cv.pdf');
});
test('invalid dates, stage values and backwards training dates cannot be saved',async()=>{
 for(const changes of [{placementStage:'complete'},{availabilityDate:'2026-02-30'},{placementStart:'2026-10-10',placementEnd:'2026-10-01'},{experienceYears:'-1'}]){
  const profile={...candidateProfile({}),...changes};assert.equal((await save(request('/api/user/career',{careerPhase:'internship',profile}))).status,400);
 }
 assert.equal(writes.length,0);
});
test('professional transition requires confirmation and licensed details, without promoting credential approval',async()=>{
 const body={careerPhase:'licensed',profile:candidateProfile({})};
 assert.equal((await save(request('/api/user/career',body))).status,400);
 body.confirmStageChange=true;assert.equal((await save(request('/api/user/career',body))).status,400);
 user.licenseUrl='https://test.private.blob.vercel-storage.com/license.pdf';user.licenseNumber='TEST-REG';user.licenseExpiry=new Date('2030-01-01');user.isLicenseVerified=true;
 assert.equal((await save(request('/api/user/career',body))).status,200);assert.equal(user.careerPhase,'licensed');assert.equal(user.isLicenseVerified,false);assert.equal(user.licenseReviewedAt,null);
});
test('changing provisional registration details clears previous review, and employer role cannot update a candidate profile',async()=>{
 user.isLicenseVerified=true;user.licenseReviewedAt=new Date();
 const body={careerPhase:'internship',profile:candidateProfile({provisionalNumber:'NEW-REG'})};
 assert.equal((await save(request('/api/user/career',body))).status,200);assert.equal(user.isLicenseVerified,false);
 role='employer';assert.equal((await save(request('/api/user/career',body))).status,403);
});
test('intern feed separates direct vacancies while retaining historic applications',async()=>{
 prisma.notification.findMany=async()=>[];
 const jobs=[{id:'placement',role:'Laboratory intern',jobType:'internship',status:'active',isDirectPost:true,employer:{isVerified:true},applications:[],url:'/matches/direct/lab'}, {id:'licensed',role:'Scientist',jobType:'full-time',status:'active',isDirectPost:true,employer:{isVerified:true},applications:[],url:'/matches/direct/lab'}, {id:'historic',role:'Scientist',jobType:'full-time',status:'closed',isDirectPost:true,applications:[{status:'pending'}],url:'/matches/direct/lab'}];
 prisma.job.findMany=async()=>jobs;
 const result=await feed(request('/api/jobs'));assert.equal(result.status,200);assert.deepEqual((await result.json()).map(job=>job.id),['placement','historic']);
});
test('a completed nationwide scan remains visible despite saved Abuja preferences',async()=>{
 user.location='Abuja';user.candidateProfile={preferredLocations:'Abuja',lastScan:{location:'All Nigeria',careerPhase:'internship',scannedAt:'2026-10-13T09:00:00Z',retrieved:2,matched:2,added:2,warnings:[]}};
 prisma.notification.findMany=async()=>[];prisma.job.findMany=async()=>['Abuja','Lagos'].map(loc=>({id:loc,loc,role:'Medical Laboratory Science Interns',jobType:'internship',status:'active',applications:[],url:`https://example.com/${loc}`}));
 const response=await feed(request('/api/jobs'));assert.deepEqual((await response.json()).map(job=>job.loc),['Abuja','Lagos']);
});
test('career edits preserve server scan metadata and reject forged scan scope',async()=>{
 const scan={location:'All Nigeria',careerPhase:'internship',scannedAt:'2026-10-13T09:00:00Z',retrieved:2,matched:2,added:2,warnings:[]};user.candidateProfile={lastScan:scan};
 const body={careerPhase:'internship',profile:{...candidateProfile({}),lastScan:{...scan,location:'Fake location'}}};
 assert.equal((await save(request('/api/user/career',body))).status,200);assert.equal(user.candidateProfile.lastScan.location,'All Nigeria');
 body.profile.preferredLocations='Enugu';assert.equal((await save(request('/api/user/career',body))).status,200);assert.equal(user.candidateProfile.lastScan,undefined);
});
test('intern cannot apply to a licensed vacancy by bypassing the discovery UI',async()=>{
 const job={id:'licensed',userId:null,employerId:'lab',isDirectPost:true,status:'active',jobType:'full-time',role:'Scientist'};
 prisma.job.findUnique=prisma.job.findUniqueOrThrow=async()=>job;
 const response=await apply(request('/api/apply',{jobId:'licensed'}));assert.equal(response.status,400);assert.match((await response.json()).error,/professional stage/);
});
test('classification uses explicit internship type, rejects senior intern titles and keeps unknown vacancies unclassified',()=>{
 assert.equal(opportunityForPhase({role:'Medical Laboratory Scientist',jobType:'internship'},'internship'),true);
 assert.equal(opportunityForPhase({role:'Internal auditor'},'internship'),false);
 assert.equal(opportunityForPhase({role:'Senior laboratory intern',jobType:'internship'},'internship'),false);
 assert.equal(opportunityForPhase({role:'Opportunity'},'licensed'),false);
});
test('intern readiness uses provisional details and education evidence, and approval needs official reviewed evidence',()=>{
 const profile=candidateProfile({provisionalNumber:'TEST',preferredLocations:'Lagos'});
 const ready=applicationReadiness({...user,candidateProfile:profile,degreeUrl:'https://test.private.blob.vercel-storage.com/degree.pdf',keywords:'MLS',isLicenseVerified:false,licenseReviewedAt:null});
 assert.equal(ready.complete,7);assert.equal(ready.credentialStatus,'Self-reported');
 const training=applicationReadiness({...user,candidateProfile:{...profile,placementStage:'training',placementInstitution:'Test Lab',placementStart:'2026-10-01'},degreeUrl:'https://test.private.blob.vercel-storage.com/degree.pdf',keywords:'MLS',isLicenseVerified:false,licenseReviewedAt:null});
 assert.equal(training.total,6);assert.ok(!training.checks.some(check=>check.key==='skills'||check.key==='preferences'));
 assert.equal(internshipApproval({isMlscnApproved:true}),false);
 assert.equal(internshipApproval({isMlscnApproved:true,listingDetails:{approvalSource:'https://web.mlscn.gov.ng/approved',approvalReviewedAt:'2026-10-12T12:00:00Z'}}),true);
 assert.equal(internshipApproval({isMlscnApproved:true,listingDetails:{approvalSource:'https://mlscn.gov.ng.attacker.example/',approvalReviewedAt:'2026-10-12T12:00:00Z'}}),false);
});
test('saved locations and role preferences filter discovery without inventing unknown requirements',()=>{
 const job={loc:'Lagos',jobType:'locum'};
 assert.equal(opportunityForPreferences(job,'licensed',{preferredLocations:'Lagos, Abuja',rolePreferences:'Locum'}),true);
 assert.equal(opportunityForPreferences(job,'licensed',{preferredLocations:'Abuja'}),false);
 assert.equal(opportunityForPreferences(job,'licensed',{rolePreferences:'Permanent'}),false);
 assert.equal(opportunityForPreferences({...job,listingDetails:{deadline:'2000-01-01'}},'licensed',{}),false);
});
test('employers receive placement stage without a candidate’s private reminder or training notes',async()=>{
 const talent=require('../app/api/employer/talent/route.ts').GET;
 role='employer';
 prisma.user.findMany=async()=>[{id:'intern',name:'Intern',applications:[],careerPhase:'internship',candidateProfile:{placementStage:'training',nextAction:'Private personal reminder'}}];
 const response=await talent(request('/api/employer/talent'));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.users[0].placementStage,'training');assert.equal(data.users[0].candidateProfile,undefined);
 assert.ok(!JSON.stringify(data).includes('Private personal reminder'));
});
