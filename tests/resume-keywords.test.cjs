const {prisma}=require('./register.cjs');
const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const {roleKeywords,validRoleKeywords}=require('../lib/role-keywords.ts');
const {POST:extract}=require('../app/api/extract-resume/route.ts');
const {POST:save,GET:reload}=require('../app/api/user/route.ts');
let user,originalFetch,originalKey,providerCalls,writes;
const cookie='benchscout_session='+'a'.repeat(64);
const request=(path,body,authenticated=true)=>new Request('http://localhost:3000'+path,{method:body?'POST':'GET',headers:{...(authenticated?{cookie}:{}),...(body?{'Content-Type':'application/json',Origin:'http://localhost:3000'}:{})},...(body?{body:JSON.stringify(body)}:{})});
beforeEach(()=>{
 user={id:'candidate',email:'candidate@example.invalid',name:'Synthetic Candidate',isVerified:true,keywords:'Manual skill',location:'All Nigeria',minScore:50,credentialRevision:0,resumeUrl:'https://store.private.blob.vercel-storage.com/resume.pdf',cvParsedText:'Synthetic medical laboratory scientist CV. Hematology, microscopy and quality control.'};
 providerCalls=0;writes=0;originalFetch=global.fetch;originalKey=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-key';
 prisma.authSession.findUnique=async()=>({role:'candidate',subjectId:user.id,expiresAt:new Date(Date.now()+60000)});
 prisma.user.findUnique=async()=>({...user});prisma.user.findUniqueOrThrow=async()=>({...user});prisma.user.findFirst=async()=>({...user});
 prisma.user.update=async({where,data})=>{assert.equal(where.id,user.id);writes++;Object.assign(user,data);return {...user};};
 prisma.rateLimit.upsert=async()=>({count:1});
 global.fetch=async(url,options)=>{providerCalls++;assert.match(url,/generativelanguage.googleapis.com/);assert.equal(JSON.parse(options.body).contents[0].parts[0].text,user.cvParsedText);return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({keywords:['Hematology','Microscopy','hematology']})}]}}]});};
});
afterEach(()=>{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;});
test('phrases retain spaces and punctuation while delimiters, empty tags and case duplicates normalize',()=>{
 assert.deepEqual(roleKeywords(['Medical Laboratory Scientist,  Quality  Control','quality control; RT-PCR\nBlood banking',' , ']),['Medical Laboratory Scientist','Quality Control','RT-PCR','Blood banking']);
 assert.equal(validRoleKeywords(['a'.repeat(101)]),false);assert.equal(validRoleKeywords(Array.from({length:61},(_,index)=>String(index))),false);
});
test('manual keyword save persists normalized chips and clearing them survives a new GET',async()=>{
 const body={name:user.name,location:user.location,minScore:50,keywords:'Medical Laboratory Scientist, Quality Control; quality control\nMicroscopy'};
 assert.equal((await save(request('/api/user',body))).status,200);
 assert.equal(user.keywords,'Medical Laboratory Scientist, Quality Control, Microscopy');
 assert.equal((await (await reload(request('/api/user'))).json()).user.keywords,user.keywords);
 body.keywords=[];assert.equal((await save(request('/api/user',body))).status,200);assert.equal((await (await reload(request('/api/user'))).json()).user.keywords,'');
});
test('oversized and invalid keyword input is rejected without overwriting stored keywords',async()=>{
 for(const keywords of [{bad:true},['a'.repeat(101)],Array.from({length:61},(_,i)=>'Keyword '+i)])assert.equal((await save(request('/api/user',{name:user.name,location:user.location,minScore:50,keywords}))).status,400);
 assert.equal(writes,0);assert.equal(user.keywords,'Manual skill');
});
test('extraction requires authentication, explicit consent and matching account before calling AI',async()=>{
 assert.equal((await extract(request('/api/extract-resume',{consent:true},false))).status,401);
 assert.equal((await extract(request('/api/extract-resume',{consent:false}))).status,400);
 assert.equal((await extract(request('/api/extract-resume',{consent:true,email:'another@example.invalid'}))).status,403);
 assert.equal(providerCalls,0);assert.equal(writes,0);
});
test('missing, legacy and unreadable CVs leave manual keywords intact and never reach AI',async()=>{
 for(const resumeUrl of [null,'https://public.blob.vercel-storage.com/resume.pdf']){user.resumeUrl=resumeUrl;assert.equal((await extract(request('/api/extract-resume',{consent:true}))).status,409);}
 user.resumeUrl='https://store.private.blob.vercel-storage.com/resume.pdf';user.cvParsedText='  ';
 assert.equal((await extract(request('/api/extract-resume',{consent:true}))).status,422);assert.equal(providerCalls,0);assert.equal(writes,0);
});
test('AI suggestions are deduplicated, private CV text is not returned, and nothing is saved before review',async()=>{
 const response=await extract(request('/api/extract-resume',{consent:true}));assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{success:true,keywords:['Hematology','Microscopy']});assert.equal(writes,0);assert.equal(user.keywords,'Manual skill');assert.equal(providerCalls,1);
});
test('a replaced or deleted CV invalidates an in-flight extraction result',async()=>{
 const fetch=global.fetch;global.fetch=async(...args)=>{const response=await fetch(...args);user.resumeUrl=null;user.cvParsedText=null;return response;};
 assert.equal((await extract(request('/api/extract-resume',{consent:true}))).status,409);assert.equal(writes,0);
});
test('unavailable AI and malformed provider output cannot erase manual preferences',async()=>{
 delete process.env.GEMINI_API_KEY;assert.equal((await extract(request('/api/extract-resume',{consent:true}))).status,503);assert.equal(providerCalls,0);
 process.env.GEMINI_API_KEY='test-key';
 for(const output of ['bad JSON','{"keywords":[42]}','{"keywords":["'+ 'a'.repeat(101)+'"]}']){
   global.fetch=async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:output}]}}]});
   assert.equal((await extract(request('/api/extract-resume',{consent:true}))).status,502);
 }
 assert.equal(writes,0);assert.equal(user.keywords,'Manual skill');
});
