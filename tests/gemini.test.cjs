require('./register.cjs');
const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const {generateText,licenseSchema,parseLicense}=require('../lib/gemini.ts');
let originalFetch, originalKey, originalModel;
beforeEach(()=>{originalFetch=global.fetch;originalKey=process.env.GEMINI_API_KEY;originalModel=process.env.GEMINI_MODEL;process.env.GEMINI_API_KEY='test-secret';process.env.GEMINI_MODEL='gemini-2.5-flash';});
afterEach(()=>{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;if(originalModel===undefined)delete process.env.GEMINI_MODEL;else process.env.GEMINI_MODEL=originalModel;});
test('AI credentials remain in a header and extraction requests require JSON structure',async()=>{
 let request;
 global.fetch=async(url,options)=>{request={url,options};return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'internal reasoning'},{text:'{"licenseNumber":"RA123","fullName":"Test Scientist","expiryDate":"2030-12-31"}'}]}}]});};
 const text=await generateText([{text:'Synthetic test document'}],{schema:licenseSchema});
 assert.equal(request.url.includes('test-secret'),false);assert.equal(request.options.headers['x-goog-api-key'],'test-secret');assert.equal(request.options.redirect,'error');assert.ok(request.options.signal);
 assert.equal(JSON.parse(request.options.body).generationConfig.responseMimeType,'application/json');assert.equal(text.includes('internal reasoning'),false);assert.equal(parseLicense(text).licenseNumber,'RA123');
});
test('unconfigured AI never invokes a provider',async()=>{delete process.env.GEMINI_API_KEY;global.fetch=()=>{throw Error('Must not call');};await assert.rejects(()=>generateText([{text:'test'}]),error=>error.status===503);});
test('model names cannot redirect requests to arbitrary paths',async()=>{process.env.GEMINI_MODEL='../attacker?key=secret';await assert.rejects(()=>generateText([{text:'test'}]),error=>error.status===503);});
test('provider quota and network failures give useful errors without leaking provider details',async()=>{
 global.fetch=async()=>Response.json({error:{message:'private provider detail'}},{status:429});await assert.rejects(()=>generateText([{text:'test'}]),error=>error.status===503&&!error.message.includes('private'));
 global.fetch=async()=>{throw Error('test-secret');};await assert.rejects(()=>generateText([{text:'test'}]),error=>error.status===503&&!error.message.includes('test-secret'));
});
test('blocked, truncated, malformed and empty generation responses are rejected',async()=>{
 for(const payload of [null,{candidates:[]},{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial'}]}}]},{candidates:[{finishReason:'SAFETY'}]},{candidates:[{content:{parts:'bad'}}]}]){global.fetch=async()=>Response.json(payload);await assert.rejects(()=>generateText([{text:'test'}]),error=>error.status===502);}
});
test('license extraction rejects impossible dates and unexpected shapes',()=>{
 for(const text of ['not JSON','[]','{"fullName":"Test","licenseNumber":"RA123","expiryDate":"2030-02-30"}','{"fullName":1,"licenseNumber":"RA123","expiryDate":"2030-01-01"}'])assert.throws(()=>parseLicense(text),error=>error.status===502);
 assert.deepEqual(parseLicense('{"fullName":"Not Found","licenseNumber":"","expiryDate":""}'),{fullName:'',licenseNumber:'',expiryDate:''});
});
