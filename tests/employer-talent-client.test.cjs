require('./register.cjs');
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {loadEmployerTalent}=require('../lib/employer-talent.ts');
const originalFetch=global.fetch;
after(()=>{global.fetch=originalFetch;});
test('company approval denial is preserved instead of becoming an empty applicant list',async()=>{
 global.fetch=async()=>Response.json({success:false,error:'Your employer account needs review before publishing jobs or accessing candidates.'},{status:403});
 await assert.rejects(()=>loadEmployerTalent(''),/needs review/);
});
test('server failures and malformed applicant payloads cannot look like a successful empty directory',async()=>{
 for(const response of [new Response('Unavailable',{status:503}),Response.json({success:false}),Response.json({success:true}),Response.json({success:true,users:[null]}),Response.json({success:true,users:[{id:'synthetic',name:'Candidate'}]})]) {
  global.fetch=async()=>response;await assert.rejects(()=>loadEmployerTalent(''));
 }
});
test('a successful empty directory and a successful filtered result remain distinct from errors',async()=>{
 global.fetch=async(url,options)=>{assert.equal(url,'/api/employer/talent?location=FCT%20-%20Abuja');assert.equal(options.cache,'no-store');return Response.json({success:true,users:[]});};
 assert.deepEqual(await loadEmployerTalent('FCT - Abuja'),[]);
 const users=[{id:'synthetic',name:'QA Candidate',email:'qa@example.invalid',resumeUrl:null,licenseUrl:null,degreeUrl:null}];
 global.fetch=async()=>Response.json({success:true,users});assert.deepEqual(await loadEmployerTalent(''),users);
});
test('a network outage produces a retryable connection message',async()=>{
 global.fetch=async()=>{throw new TypeError('Failed to fetch');};
 await assert.rejects(()=>loadEmployerTalent(''),/Could not connect.*retry/);
});
