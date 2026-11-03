require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {APPEARANCE_BOOTSTRAP,APPEARANCE_KEY,setAppearance,subscribeAppearance,currentAppearance}=require('../lib/appearance.ts');

function browser({saved=null,dark=false,blocked=false}={}) {
  const events=new EventTarget(), media=new EventTarget(); media.matches=dark;
  const dataset={},meta={content:null,setAttribute(_name,value){this.content=value;}};
  const storage={getItem(){if(blocked)throw new Error('denied');return saved;},setItem(_key,value){if(blocked)throw new Error('denied');saved=value;}};
  const document={documentElement:{dataset},querySelector(){return meta;},querySelectorAll(){return [meta];}};
  const window={matchMedia:()=>media,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
  return {window,document,localStorage:storage,media,meta,boot(){vm.runInNewContext(APPEARANCE_BOOTSTRAP,{window,document,localStorage:storage});}};
}
function globals(b,work){const prior={window:global.window,document:global.document,localStorage:global.localStorage};Object.assign(global,{window:b.window,document:b.document,localStorage:b.localStorage});try{work();}finally{Object.assign(global,prior);}}
test('first visit follows device appearance; a saved explicit light choice wins over dark device settings',()=>{
  const first=browser({dark:true});first.boot();assert.equal(first.document.documentElement.dataset.theme,'dark');
  const saved=browser({dark:true,saved:'light'});saved.boot();assert.equal(saved.document.documentElement.dataset.theme,'light');assert.equal(saved.meta.content,'#edf5fd');
});
test('toggle persists across document reload, updates browser chrome and notifies the button',()=>{
  const b=browser();b.boot();globals(b,()=>{let changed=0;const off=subscribeAppearance(()=>changed++);setAppearance('dark');assert.equal(currentAppearance(),'dark');assert.equal(b.meta.content,'#0c1625');assert.equal(changed,1);b.document.documentElement.dataset.theme='light';b.boot();assert.equal(currentAppearance(),'dark');setAppearance('light');assert.equal(b.meta.content,'#edf5fd');assert.equal(currentAppearance(),'light');b.document.documentElement.dataset.theme='dark';b.boot();assert.equal(currentAppearance(),'light');off();});
});
test('blocked local storage leaves first paint and manual switching usable',()=>{
  const b=browser({blocked:true,dark:true});assert.doesNotThrow(()=>b.boot());globals(b,()=>{assert.doesNotThrow(()=>setAppearance('light'));assert.equal(currentAppearance(),'light');});
});
test('device changes follow system until an explicit choice, and cross-tab updates/clears synchronize',()=>{
  const b=browser();b.boot();globals(b,()=>{let changed=0;const off=subscribeAppearance(()=>changed++);b.media.matches=true;b.media.dispatchEvent(new Event('change'));assert.equal(currentAppearance(),'dark');setAppearance('light');b.media.dispatchEvent(new Event('change'));assert.equal(currentAppearance(),'light');
    const update=new Event('storage');Object.assign(update,{key:APPEARANCE_KEY,newValue:'dark'});b.window.dispatchEvent(update);assert.equal(currentAppearance(),'dark');
    const clear=new Event('storage');Object.assign(clear,{key:null,newValue:null});b.window.dispatchEvent(clear);assert.equal(currentAppearance(),'dark');assert.equal(b.document.documentElement.dataset.appearanceExplicit,'false');
    off();const count=changed;b.media.matches=false;b.media.dispatchEvent(new Event('change'));assert.equal(changed,count);
  });
});

test('all theme-colour entries reconcile after hydration and switch back to light',()=>{
  const b=browser({saved:'dark'});b.boot();
  const hoisted={content:'#edf5fd',setAttribute(_name,value){this.content=value;}};
  b.document.querySelectorAll=()=>[b.meta,hoisted];
  globals(b,()=>{const off=subscribeAppearance(()=>{});assert.equal(hoisted.content,'#0c1625');setAppearance('light');assert.equal(hoisted.content,'#edf5fd');assert.equal(b.meta.content,'#edf5fd');off();});
});
