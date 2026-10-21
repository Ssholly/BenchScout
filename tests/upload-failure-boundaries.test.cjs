const {prisma}=require('./register.cjs');
const Module=require('node:module');
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const {ApiError}=require('../lib/security.ts');
const load=Module._load;
let state,stored,removed,writeFails,storageFails,cleanupFails;
const oldUrl='https://fixture.private.blob.vercel-storage.com/old.pdf';
const newUrl='https://fixture.private.blob.vercel-storage.com/new.pdf';
Module._load=function(name,parent,main){
 if(name==='@/lib/documents')return {
  documentFields:{resume:'resumeUrl'},documentKind:value=>{if(value!=='resume')throw new ApiError(400,'Unsupported document type.');return value;},
  storeDocument:async()=>{stored++;if(storageFails)throw new ApiError(503,'Storage unavailable.');return {url:newUrl,buffer:Buffer.from('%PDF-fixture')};},
  resumeText:async()=> 'Synthetic CV',
  removeDocument:async url=>{removed.push(url);if(cleanupFails)throw new Error('provider diagnostic must stay private');},
 };
 return load.call(this,name,parent,main);
};
const upload=require('../app/api/upload/route.ts');
function request(method='POST',email='candidate@example.invalid',authenticated=true){
 const headers={Origin:'http://localhost:3000',...(authenticated?{cookie:`benchscout_session=${'a'.repeat(64)}`}:{})};
 if(method==='DELETE')return new Request('http://localhost:3000/api/upload',{method,headers:{...headers,'content-type':'application/json'},body:JSON.stringify({documentType:'resume',email})});
 const form=new FormData();form.set('email',email);form.set('documentType','resume');form.set('file',new File(['%PDF-fixture'],'qa.pdf',{type:'application/pdf'}));return new Request('http://localhost:3000/api/upload',{method,headers,body:form});
}
beforeEach(()=>{
 state={id:'candidate',email:'candidate@example.invalid',name:'Synthetic',isVerified:true,careerPhase:'licensed',credentialRevision:0,resumeUrl:oldUrl};stored=0;removed=[];writeFails=false;storageFails=false;cleanupFails=false;
 prisma.authSession.findUnique=async()=>({subjectId:'candidate',role:'candidate',expiresAt:new Date(Date.now()+60000)});
 prisma.user.findUnique=prisma.user.findUniqueOrThrow=async()=>({...state});
 prisma.user.update=async({where,data})=>{assert.equal(where.id,'candidate');if(writeFails)throw new ApiError(503,'Metadata unavailable.');Object.assign(state,data);return {...state};};
 prisma.rateLimit.upsert=async()=>({count:1});
});
test('anonymous and another-account upload are rejected before storage or metadata',async()=>{
 assert.equal((await upload.POST(request('POST','candidate@example.invalid',false))).status,401);
 assert.equal((await upload.POST(request('POST','other@example.invalid'))).status,403);
 assert.equal(stored,0);assert.deepEqual(removed,[]);assert.equal(state.resumeUrl,oldUrl);
});
test('unestablished backup/storage never commits a new vault reference',async()=>{
 storageFails=true;const response=await upload.POST(request());assert.equal(response.status,503);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,[]);
});
test('metadata failure after storage cleans only the uncommitted new file and preserves previous reference',async()=>{
 writeFails=true;const response=await upload.POST(request());assert.equal(response.status,503);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,[newUrl]);
});
test('failure during uncommitted cleanup still rejects upload and never deletes previous source',async()=>{
 writeFails=true;cleanupFails=true;const response=await upload.POST(request());assert.equal(response.status,500);assert.equal(state.resumeUrl,oldUrl);assert.deepEqual(removed,[newUrl]);assert.equal((await response.text()).includes('provider diagnostic'),false);
});
test('another-account delete is rejected before any removal or metadata write',async()=>{
 assert.equal((await upload.DELETE(request('DELETE','other@example.invalid'))).status,403);assert.deepEqual(removed,[]);assert.equal(state.resumeUrl,oldUrl);
});
test('failed physical removal never reports successful deletion',async()=>{
 cleanupFails=true;const response=await upload.DELETE(request('DELETE'));assert.equal(response.status,500);assert.equal(state.resumeUrl,oldUrl);assert.equal((await response.text()).includes('provider diagnostic'),false);
});
