const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (mod,filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const routes = require('../app/[[...path]]/route.ts');
const methods=['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'];
for(const pathname of ['/','/settings','/employer','/verify?token=private','/api/setup','/api/reset','/api/upload','/api/auth/login','/api/cron/daily-digest','/api/test-email','/api/user?email=someone@example.invalid']) {
 test('terminal containment for '+pathname, async()=>{
  for(const method of methods){const response=routes[method](new Request('https://example.invalid'+pathname,{method}));assert.equal(response.status,503);assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('retry-after'),'300');const body=await response.text();assert.equal(body.includes('private'),false);assert.equal(body.includes('someone@'),false);if(method==='HEAD')assert.equal(body,'');else if(pathname.startsWith('/api/'))assert.equal(JSON.parse(body).code,'SERVICE_TEMPORARILY_UNAVAILABLE');else assert.match(body,/Sign-in, applications and document uploads are temporarily paused/);}
 });
}
test('only terminal catch-all remains in app; no legacy handler can shadow it',()=>{
 const files=[];function walk(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,x.name);if(x.isDirectory())walk(p);else files.push(path.relative(path.join(__dirname,'../app'),p));}}walk(path.join(__dirname,'../app'));assert.deepEqual(files,['[[...path]]/route.ts']);
 const source=fs.readFileSync(path.join(__dirname,'../lib/legacy-containment.ts'),'utf8');assert.equal(/(?:prisma|process\.env|fetch\(|from ["'])/.test(source),false);
});
