const { prisma, mailer } = require('./register.cjs');
const Module = require('node:module');
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const map = new Map(); let writes=0, failWrites=0, alerts=0, deleted=[], lastAlert;
const load=Module._load;
Module._load=function(name,parent,main) {
 if(name==='@vercel/blob') return {
  BlobNotFoundError:class BlobNotFoundError extends Error {},
  put:async(path,body,options)=>{writes++;if(failWrites-->0)throw new Error('provider failure');assert.equal(options.access,'private');const url=`https://${options.token}.private.blob.vercel-storage.com/${path}`;map.set(url,Buffer.from(body));return {url};},
  get:async(path,options)=>{assert.equal(options.access,'private');assert.equal(options.useCache,false);const url=path.startsWith('https:')?path:`https://${options.token}.private.blob.vercel-storage.com/${path}`;const bytes=map.get(url);if(!bytes)return null;return {statusCode:200,blob:{size:bytes.length},stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};},
  del:async(path,options)=>{const url=path.startsWith('https:')?path:`https://${options.token}.private.blob.vercel-storage.com/${path}`;deleted.push(url);map.delete(url);}
 };
 return load.call(this,name,parent,main);
};
const backup=require('../lib/document-backup.ts');
const { storeDocument, removeDocument }=require('../lib/documents.ts');
const { POST }=require('../app/api/admin/document-backups/route.ts');
const names=['DOCUMENT_BACKUP_ENABLED','BLOB_BACKUP_READ_WRITE_TOKEN','DOCUMENT_BACKUP_ENCRYPTION_KEY','BLOB_PRIVATE_READ_WRITE_TOKEN','DOCUMENT_BACKUP_ALERT_EMAIL','DOCUMENT_BACKUP_TEST_MODE','VERCEL_ENV','ADMIN_SECRET','DATABASE_URL','VERCEL_GIT_COMMIT_SHA'];
const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
beforeEach(()=>{map.clear();writes=0;failWrites=0;alerts=0;deleted=[];lastAlert=null;Object.assign(process.env,{DOCUMENT_BACKUP_ENABLED:'true',BLOB_BACKUP_READ_WRITE_TOKEN:'backup',DOCUMENT_BACKUP_ENCRYPTION_KEY:'ab'.repeat(32),BLOB_PRIVATE_READ_WRITE_TOKEN:'live',DOCUMENT_BACKUP_ALERT_EMAIL:'operator@example.com',DOCUMENT_BACKUP_TEST_MODE:'true',VERCEL_ENV:'preview',ADMIN_SECRET:'s'.repeat(40)});prisma.rateLimit.upsert=async()=>({count:1});mailer.sendEmail=async(...args)=>{alerts++;lastAlert=args;};});
after(()=>{for(const k of names){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}});
const source='https://live.private.blob.vercel-storage.com/documents/qa/resume/v1.pdf';
test('binary backup authenticates bytes, identity and key; ciphertext is randomized',()=>{
 const key=randomBytes(32),bytes=Buffer.concat([Buffer.from('%PDF-'),randomBytes(1000)]);
 const one=backup.sealBackup(bytes,source,key),two=backup.sealBackup(bytes,source,key);
 assert.notDeepEqual(one,two);assert.deepEqual(backup.openBackup(one,source,key),bytes);
 assert.throws(()=>backup.openBackup(one,source+'other',key));assert.throws(()=>backup.openBackup(one,source,randomBytes(32)));
 one[70]^=1;assert.throws(()=>backup.openBackup(one,source,key));
});
test('invalid source and excessive size are rejected before archive writes',()=>{
 assert.throws(()=>backup.backupPath('http://public.example/doc'));assert.throws(()=>backup.backupPath(source+'?token=secret'));
 assert.throws(()=>backup.sealBackup(Buffer.alloc(4*1024*1024+1),source,randomBytes(32)));
});
test('upload writes encrypted copy and verifies private bytes before returning',async()=>{
 const file=new File(['%PDF-QA binary\0data'],'qa.pdf',{type:'application/pdf'});
 const doc=await storeDocument(file,'resume','qa');assert.equal(map.size,2);
 assert.deepEqual(await backup.restoreDocumentBytes(doc.url),doc.buffer);
 const archive=map.get(`https://backup.private.blob.vercel-storage.com/${backup.backupPath(doc.url)}`);
 assert.equal(archive.includes(doc.buffer),false);
});
test('transient backup failure retries and then succeeds without alert',async()=>{
 failWrites=2;await backup.backupDocument(source,Buffer.from('QA'));assert.equal(writes,3);assert.equal(alerts,0);
});
test('persistent failure alerts operator and prevents upload success',async()=>{
 failWrites=3;await assert.rejects(()=>backup.backupDocument(source,Buffer.from('QA')),e=>e.status===503);assert.equal(alerts,1);assert.equal(writes,3);
});
test('enabled misconfiguration fails closed; disabled backups preserve existing upload mode',async()=>{
 delete process.env.DOCUMENT_BACKUP_ENCRYPTION_KEY;await assert.rejects(()=>backup.backupDocument(source,Buffer.from('QA')),e=>e.status===503);assert.equal(writes,0);
 process.env.DOCUMENT_BACKUP_ENABLED='false';await backup.backupDocument(source,Buffer.from('QA'));assert.equal(writes,0);
});
test('configured backup purge also runs after disabling new backups',async()=>{
 map.set(source,Buffer.from('QA'));await backup.backupDocument(source,Buffer.from('QA'));
 process.env.DOCUMENT_BACKUP_ENABLED='false';await removeDocument(source);assert.equal(map.size,0);assert.match(deleted[0],/document-backups/);
});
function request(body,secret=process.env.ADMIN_SECRET){return new Request('http://localhost:3000/api/admin/document-backups',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({adminSecret:secret,...body})});}
test('operator recovery route denies wrong key and production execution before storage',async()=>{
 assert.equal((await POST(request({action:'status'},'wrong'))).status,401);assert.equal(writes,0);
 process.env.VERCEL_ENV='production';assert.equal((await POST(request({action:'synthetic-restore',confirm:'DELETE QA ONLY'}))).status,403);assert.equal(writes,0);
});
test('synthetic loss-and-restore removes source, decrypts exact bytes and reads new private object without DB grants',async()=>{
 const response=await POST(request({action:'synthetic-restore',confirm:'DELETE QA ONLY'}));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.sourceLossVerified,true);assert.equal(data.restoredPrivateReadMatches,true);assert.equal(data.databaseChanged,false);assert.equal(data.applicationGrantsChanged,false);assert.match(data.sha256,/^[a-f0-9]{64}$/);assert.equal(map.size,0);
});
test('confirmation is mandatory for synthetic loss test; status contains no credentials',async()=>{
 assert.equal((await POST(request({action:'synthetic-restore'}))).status,400);assert.equal(writes,0);
 const response=await POST(request({action:'status'}));const text=await response.text();assert.equal(text.includes('ab'.repeat(32)),false);assert.match(text,/"configured":true/);
});
test('older QA backfill copies only current fixture vault fields and decrypt-verifies both files',async()=>{
 const certificate=source.replace('v1.pdf','certificate.pdf');
 map.set(source,Buffer.from('%PDF-qa-cv\0binary'));map.set(certificate,Buffer.from('%PDF-qa-certificate'));
 prisma.user.findMany=async args=>{assert.equal(args.where.id,'2b0901c4-bbcc-4e55-b61d-8fe598e1f465');assert.equal(args.where.name,'QA ONLY - Synthetic Candidate 20261020');return [{id:'qa',resumeUrl:source,certificateUrl:certificate}];};
 prisma.user.findUnique=async args=>({[Object.keys(args.select)[0]]:Object.keys(args.select)[0]==='resumeUrl'?source:certificate});
 const response=await POST(request({action:'synthetic-backfill',userId:'a-real-account',url:'https://attacker.invalid'}));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.passed,true);assert.equal(data.eligible,2);assert.equal(data.verified,2);assert.equal(data.databaseChanged,false);assert.equal(data.applicationGrantsChanged,false);assert.equal(map.size,4);assert.equal(JSON.stringify(data).includes('blob.vercel-storage.com'),false);
});
test('backfill purges a file reference replaced concurrently instead of counting it protected',async()=>{
 map.set(source,Buffer.from('QA original'));
 prisma.user.findMany=async()=>[{id:'qa',resumeUrl:source}];prisma.user.findUnique=async()=>({resumeUrl:source+'new'});
 const response=await POST(request({action:'synthetic-backfill'}));const data=await response.json();assert.equal(data.stalePurged,1);assert.equal(data.verified,0);assert.equal(data.passed,false);assert.equal(map.size,1);
});
test('ambiguous/missing QA fixture and disabled/production backfill never copy files',async()=>{
 prisma.user.findMany=async()=>[];assert.equal((await POST(request({action:'synthetic-backfill'}))).status,409);
 process.env.DOCUMENT_BACKUP_ENABLED='false';assert.equal((await POST(request({action:'synthetic-backfill'}))).status,503);
 process.env.VERCEL_ENV='production';for(const action of ['synthetic-backfill','test-alert'])assert.equal((await POST(request({action}))).status,403);assert.equal(writes,0);assert.equal(alerts,0);
});
test('alert test uses the configured recipient and shared mail path without inducing a failure',async()=>{
 const response=await POST(request({action:'test-alert',to:'attacker@example.com'}));const data=await response.json();assert.equal(response.status,200);assert.equal(data.alertSubmitted,true);assert.match(data.inboxReceipt,/confirmation/);assert.equal(alerts,1);assert.equal(lastAlert[0],'operator@example.com');assert.match(lastAlert[1],/^QA ONLY/);assert.match(lastAlert[3],/No backup failure has been induced/);assert.equal(writes,0);
});
test('missing recipient or rejected mail transport cannot return alert submission success',async()=>{
 delete process.env.DOCUMENT_BACKUP_ALERT_EMAIL;assert.equal((await POST(request({action:'test-alert'}))).status,503);assert.equal(alerts,0);
 process.env.DOCUMENT_BACKUP_ALERT_EMAIL='operator@example.com';mailer.sendEmail=async()=>{throw new Error('private provider details');};const response=await POST(request({action:'test-alert'}));assert.equal(response.status,503);assert.equal((await response.text()).includes('private provider details'),false);
});

test('runtime readiness queries deployed database and fingerprints target without returning credentials',async()=>{
 process.env.DATABASE_URL='postgresql://private-user:private-password@intended-pooler.example.com/neondb?sslmode=require';
 prisma.$queryRaw=async()=>[{name:'neondb'}];
 const response=await POST(request({action:'runtime-readiness'}));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.databaseConnected,true);assert.equal(data.configuredDatabaseMatches,true);
 assert.equal(data.targetFingerprint,require('node:crypto').createHash('sha256').update('intended.example.com/neondb').digest('hex'));
 const text=JSON.stringify(data);for(const value of ['private-user','private-password','intended-pooler.example.com'])assert.equal(text.includes(value),false);
 assert.equal(writes,0);assert.equal(alerts,0);
 prisma.$queryRaw=async()=>[{name:'different_database'}];assert.equal((await (await POST(request({action:'runtime-readiness'}))).json()).configuredDatabaseMatches,false);
});
test('runtime readiness rejects wrong administrator key before querying database',async()=>{
 let queried=false;prisma.$queryRaw=async()=>{queried=true;return [{name:'neondb'}];};
 assert.equal((await POST(request({action:'runtime-readiness'},'wrong'))).status,401);assert.equal(queried,false);assert.equal(writes,0);
});
test('Production QA storage requires Production, test mode off and explicit confirmation',async()=>{
 assert.equal((await POST(request({action:'runtime-storage-check',confirm:'DELETE RUNTIME QA ONLY'}))).status,403);
 process.env.VERCEL_ENV='production';assert.equal((await POST(request({action:'runtime-storage-check',confirm:'DELETE RUNTIME QA ONLY'}))).status,403);
 process.env.DOCUMENT_BACKUP_TEST_MODE='false';assert.equal((await POST(request({action:'runtime-storage-check'}))).status,400);
 assert.equal(writes,0);
 const response=await POST(request({action:'runtime-storage-check',confirm:'DELETE RUNTIME QA ONLY',url:source,userId:'real-person'}));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.sourceLossVerified,true);assert.equal(data.decryptedBytesMatch,true);assert.equal(data.restoredPrivateReadMatches,true);assert.equal(map.size,0);assert.equal(deleted.includes(source),false);
 assert.equal((await POST(request({action:'synthetic-restore',confirm:'DELETE QA ONLY'}))).status,403);
});
test('Production alert requires confirmation and uses only configured recipient',async()=>{
 process.env.VERCEL_ENV='production';process.env.DOCUMENT_BACKUP_TEST_MODE='false';
 assert.equal((await POST(request({action:'runtime-alert'}))).status,400);assert.equal(alerts,0);
 const response=await POST(request({action:'runtime-alert',confirm:'SEND RUNTIME ALERT',to:'attacker@example.com'}));assert.equal(response.status,200);assert.equal(alerts,1);assert.equal(lastAlert[0],'operator@example.com');assert.equal(writes,0);assert.equal((await response.json()).alertSubmitted,true);
});
