require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sharedPageRequest, invalidateSharedPageRequests } = require('../lib/shared-page-request.ts');

test('overlapping page reads share transport, allow separate bodies, and never cache across completion or identities', async () => {
  const originalFetch = global.fetch;
  const originalStorage = global.localStorage;
  let identity = 'candidate:one';
  let calls = 0;
  const resolvers = [];
  global.localStorage = { getItem: () => identity };
  global.fetch = (_, options) => {
    calls++;
    assert.equal(options.cache, 'no-store');
    return new Promise(resolve => resolvers.push(resolve));
  };
  try {
    const one = sharedPageRequest('/api/user?email=one');
    const two = sharedPageRequest('/api/user?email=one');
    assert.equal(calls, 1);
    resolvers.shift()(Response.json({ name: 'One' }));
    assert.deepEqual(await (await one).json(), { name: 'One' });
    assert.deepEqual(await (await two).json(), { name: 'One' });
    const fresh = sharedPageRequest('/api/user?email=one');
    assert.equal(calls, 2);
    identity = 'candidate:two';
    const switched = sharedPageRequest('/api/user?email=one');
    assert.equal(calls, 3);
    resolvers.shift()(Response.json({ name: 'One' }));
    resolvers.shift()(Response.json({ name: 'Two' }));
    await fresh;
    assert.deepEqual(await (await switched).json(), { name: 'Two' });
    global.fetch = async () => { calls++; throw new Error('offline'); };
    await assert.rejects(sharedPageRequest('/api/jobs'), /offline/);
    await assert.rejects(sharedPageRequest('/api/jobs'), /offline/);
    assert.equal(calls, 5);
  } finally {
    global.fetch = originalFetch;
    if (originalStorage === undefined) delete global.localStorage;
    else global.localStorage = originalStorage;
  }
});
test('saving preferences invalidates an overlapping old read before the next refresh',async()=>{
 const oldFetch=global.fetch,oldStorage=global.localStorage;const resolvers=[];
 global.localStorage={getItem:()=> 'candidate:one'};
 global.fetch=()=>new Promise(resolve=>resolvers.push(resolve));
 try {
  const old=sharedPageRequest('/api/user');invalidateSharedPageRequests();const fresh=sharedPageRequest('/api/user');
  assert.equal(resolvers.length,2);resolvers[0](Response.json({stage:'seeking'}));resolvers[1](Response.json({stage:'training'}));
  assert.deepEqual(await (await fresh).json(),{stage:'training'});await old;
 } finally {global.fetch=oldFetch;global.localStorage=oldStorage;invalidateSharedPageRequests();}
});
test('a timed-out shared read rejects both consumers and permits a fresh retry', async () => {
 const originalFetch=global.fetch,originalStorage=global.localStorage,originalTimeout=AbortSignal.timeout;
 let calls=0;
 global.localStorage={getItem:()=> 'candidate:timeout'};
 AbortSignal.timeout=milliseconds=>{assert.equal(milliseconds,15000);return AbortSignal.abort(new DOMException('Timed out','TimeoutError'));};
 global.fetch=async (_url,{signal})=>{calls++;signal.throwIfAborted();throw new Error('Expected an aborted deadline');};
 try{
  const one=sharedPageRequest('/api/user?email=timeout'),two=sharedPageRequest('/api/user?email=timeout');
  await assert.rejects(one,{name:'TimeoutError'});await assert.rejects(two,{name:'TimeoutError'});
  assert.equal(calls,1);
  global.fetch=async()=>{calls++;return Response.json({success:true});};
  assert.equal((await sharedPageRequest('/api/user?email=timeout')).status,200);assert.equal(calls,2);
 }finally{global.fetch=originalFetch;AbortSignal.timeout=originalTimeout;if(originalStorage===undefined)delete global.localStorage;else global.localStorage=originalStorage;invalidateSharedPageRequests();}
});
