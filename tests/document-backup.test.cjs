const { prisma, mailer } = require('./register.cjs');
const Module = require('node:module');
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const map = new Map(); let writes=0, failWrites=0, alerts=0, deleted=[];
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
const names=['DOCUMENT_BACKUP_ENABLED','BLOB_BACKUP_READ_WRITE_TOKEN','DOCUMENT_BACKUP_ENCRYPTION_KEY','BLOB_PRIVATE_READ_WRITE_TOKEN','DOCUMENT_BACKUP_ALERT_EMAIL','DOCUMENT_BACKUP_TEST_MODE','VERCEL_ENV','ADMIN_SECRET'];
const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
beforeEach(()=>{map.clear();writes=0;failWrites=0;alerts=0;deleted=[];Object.assign(process.env,{DOCUMENT_BACKUP_ENABLED:'true',BLOB_BACKUP_READ_WRITE_TOKEN:'backup',DOCUMENT_BACKUP_ENCRYPTION_KEY:'ab'.repeat(32),BLOB_PRIVATE_READ_WRITE_TOKEN:'live',DOCUMENT_BACKUP_ALERT_EMAIL:'operator@example.com',DOCUMENT_BACKUP_TEST_MODE:'true',VERCEL_ENV:'preview',ADMIN_SECRET:'s'.repeat(40)});prisma.rateLimit.upsert=async()=>({count:1});mailer.sendEmail=async()=>{alerts++;};});
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
