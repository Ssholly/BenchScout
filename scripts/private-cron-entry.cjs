const http=require('node:http');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const port=3195,origin=`http://127.0.0.1:${port}`;
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'benchscout-private-cron-'));fs.chmodSync(directory,0o700);
const destination=path.join(directory,'production-cron-key.txt');
const csrf=crypto.randomBytes(24).toString('hex');let saved=false;
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const shell=content=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BenchScout · Private cron check</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#f2f7f8;color:#12263d;font:16px/1.5 system-ui,sans-serif}main{max-width:550px;margin:8vh auto;background:white;border:1px solid #dce7eb;border-radius:18px;padding:28px;box-shadow:0 12px 40px #15354d0b}small{color:#178777;font-weight:700;letter-spacing:.08em}h1{font-size:25px;line-height:1.25}p{color:#526777}label{display:block;font-weight:650;margin:24px 0 8px}input{width:100%;border:1px solid #aebfc9;border-radius:9px;padding:13px;font:inherit}button{width:100%;margin-top:18px;border:0;border-radius:9px;background:#12304f;color:white;padding:14px;font:600 15px system-ui}aside{font-size:13px;border-top:1px solid #e3ebef;padding-top:16px;margin-top:22px;color:#526777}</style><main>${content}</main></html>`;
function reply(res,status,content){res.writeHead(status,headers);res.end(shell(content));}
const server=http.createServer((req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403);return res.end();}
 if(req.method==='GET'&&req.url==='/'){
  if(saved)return reply(res,200,'<small>BENCHSCOUT · LOCAL OPERATOR TOOL</small><h1>Key saved privately</h1><p>The key is ready for the approved read-only cron check. Return to the chat and reply “saved”.</p><aside>The key is not displayed. No test or external request has run from this form.</aside>');
  return reply(res,200,`<small>BENCHSCOUT · LOCAL OPERATOR TOOL</small><h1>Private Production cron key</h1><p>Paste your existing Production <strong>CRON_SECRET</strong>. This form runs only on this computer and saves an owner-only temporary file outside the repository.</p><form method="post" action="/key" autocomplete="off"><input type="hidden" name="csrf" value="${csrf}"><label for="key">Production CRON_SECRET</label><input type="password" id="key" name="key" required minlength="32" maxlength="512" autocomplete="off" spellcheck="false" autofocus><button type="submit">Save key for one-time cron test</button></form><aside>The test sends this key only to the approved BenchScout candidate’s cleanup dry-run endpoint. It does not run cleanup or send emails. The temporary key file will be removed afterward. Do not save the key in the browser.</aside>`);
 }
 if(req.method==='GET'&&req.url==='/connection-check')return reply(res,200,`<small>BENCHSCOUT · LOCAL OPERATOR TOOL</small><h1>Check local form connection</h1><p>This submits a non-sensitive connection check without a key or file.</p><form method="post" action="/connection-check"><input type="hidden" name="csrf" value="${csrf}"><button type="submit">Check local form connection</button></form>`);
 if(req.method==='POST'&&req.url==='/connection-check'){
  const validOrigin=req.headers.origin===origin;
  const validType=!!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded');
  return reply(res,validOrigin&&validType?200:403,`<h1>${validOrigin&&validType?'Local form connection passed':'Local form connection rejected'}</h1><p>Origin check: ${validOrigin?'passed':'failed'}. Form encoding: ${validType?'passed':'failed'}.</p><p>No key was requested or saved.</p>`);
 }
 if(req.method==='POST'&&req.url==='/key'){
  if(saved||req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded'))return reply(res,403,'<h1>Request rejected</h1><p>Use the local entry form.</p>');
  let body='';req.on('data',chunk=>{body+=chunk;if(Buffer.byteLength(body)>4096)req.destroy();});
  req.on('end',()=>{
   const form=new URLSearchParams(body),key=form.get('key')||'';
   if(form.get('csrf')!==csrf||key.length<32||key.length>512||/[\x00-\x1f\x7f]/.test(key))return reply(res,400,'<h1>Entry could not be saved</h1><p>Return to the local form and paste only the existing key value, without quotes or line breaks.</p>');
   try{fs.writeFileSync(destination,key,{mode:0o600,flag:'wx'});saved=true;}catch{return reply(res,500,'<h1>Entry could not be saved</h1><p>No test has run. Return to chat for assistance.</p>');}
   body='';res.writeHead(303,{'Location':'/','Cache-Control':'no-store'});res.end();
  });return;
 }
 reply(res,404,'<h1>Page not found</h1>');
});
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({url:origin,keyFile:destination,loopbackOnly:true})));
