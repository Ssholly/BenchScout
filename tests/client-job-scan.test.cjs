require('./register.cjs');
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const scan = require('../lib/client-job-scan.ts');
const originals = { fetch: global.fetch, window: global.window, localStorage: global.localStorage };
let storage, events;
beforeEach(() => {
 storage=new Map([['benchscout_identity','candidate:owner'],['labpro_active_user','owner@example.com']]);
 global.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 events=[];global.window={dispatchEvent:event=>events.push(event.type)};scan.syncScanIdentity();
});
afterEach(()=>{for(const [key,value] of Object.entries(originals)){if(value===undefined)delete global[key];else global[key]=value;}});
const options={targetLocation:'All Nigeria',includeTier3:true,autoSend:false};
test('navigation subscriptions can be replaced without cancelling or duplicating the running request',async()=>{
 let complete,calls=0;global.fetch=()=>{calls++;return new Promise(resolve=>complete=resolve);};
 const unsubscribe=scan.subscribeScan(()=>{});const operation=scan.startJobScan(options);await Promise.resolve();
 assert.equal(scan.getScanSnapshot().running,true);unsubscribe();
 let changes=0;const next=scan.subscribeScan(()=>changes++);
 assert.equal(scan.startJobScan(options),operation);assert.equal(calls,1);
 complete(Response.json({success:true,message:'3 new matches',warnings:['Private source diagnostics']}));await operation;next();
 assert.equal(scan.getScanSnapshot().running,false);assert.equal(scan.getScanSnapshot().progress,100);assert.ok(changes>0);
 assert.deepEqual(events,['jobsUpdated','userStateChanged']);assert.ok(storage.has('labpro_last_run'));
 assert.equal(scan.getScanSnapshot().logs.some(log=>log.msg.includes('Private source')),false);
});
test('an account switch discards old scan progress and completion side effects',async()=>{
 let complete;global.fetch=()=>new Promise(resolve=>complete=resolve);
 const operation=scan.startJobScan(options);await Promise.resolve();
 storage.set('benchscout_identity','candidate:other');storage.set('labpro_active_user','other@example.com');scan.syncScanIdentity();
 assert.equal(scan.getScanSnapshot().running,false);
 complete(Response.json({success:true,message:'Old account matches'}));await operation;
 assert.equal(scan.getScanSnapshot().result,null);assert.deepEqual(events,[]);assert.equal(storage.has('labpro_last_run'),false);
});
test('failed requests release the running state and a later scan can succeed',async()=>{
 global.fetch=async()=>Response.json({success:false,error:'Already running'},{status:409});await scan.startJobScan(options);
 assert.equal(scan.getScanSnapshot().running,false);assert.equal(scan.getScanSnapshot().error,'Already running');
 global.fetch=async()=>Response.json({success:true,message:'Done'});await scan.startJobScan(options);
 assert.equal(scan.getScanSnapshot().error,null);assert.equal(scan.getScanSnapshot().result.message,'Done');
});
