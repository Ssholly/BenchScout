// One-time loopback-only credential entry for the approved isolated recovery drill.
// No environment loading, external requests, logging of values, or browser storage.
const {validateRecoveryEntries}=require('./recovery-entry-guards.cjs');
const http=require('node:http'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const port=3196,origin=`http://127.0.0.1:${port}`;
if(!Array.isArray(config.allowedDatabaseHosts)||config.allowedDatabaseHosts.length!==2||!config.sourceStoreId||!config.backupStoreId||config.sourceStoreId===config.backupStoreId)throw new Error('Approved recovery targets required');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'benchscout-recovery-private-'));fs.chmodSync(directory,0o700);
const destination=path.join(directory,'credentials.json');const csrf=crypto.randomBytes(32).toString('hex');let saved=false;
const fields=[['databaseUrl','Recovery branch DATABASE_URL'],['sourceToken','Testing documents BLOB_PRIVATE_READ_WRITE_TOKEN'],['backupToken','Testing backups BLOB_BACKUP_READ_WRITE_TOKEN'],['encryptionKey','Testing DOCUMENT_BACKUP_ENCRYPTION_KEY'],['candidatePassword','Existing synthetic candidate password']];
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const render=body=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BenchScout private testing recovery</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#f2f7f8;color:#12263d;font:16px/1.5 system-ui}main{max-width:640px;margin:auto;background:white;padding:24px;border:1px solid #dce7eb;border-radius:18px}h1{font-size:25px}p,aside{color:#526777}label{display:block;font-weight:650;margin-top:16px}input{width:100%;padding:12px;border:1px solid #aebfc9;border-radius:8px;font:inherit}button{margin-top:24px;width:100%;padding:14px;color:white;background:#12304f;border:0;border-radius:8px;font:inherit}aside{font-size:13px;margin-top:18px}</style><main>${body}</main></html>`;
const reply=(res,status,body)=>{res.writeHead(status,headers);res.end(render(body));};
const server=http.createServer((req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403);return res.end();}
 if(req.method==='GET'&&req.url==='/')return reply(res,200,saved?'<h1>Recovery entries saved privately</h1><p>Return to chat and reply saved. No restore or external request has run from this form.</p>':`<h1>Private testing recovery entries</h1><p>Only for qa-full-recovery-20261024 in BenchScout Testing. Use the new recovery connection, the existing testing document/backup credentials and the existing QA candidate password. Do not use Production values.</p><form method="post" action="/save" autocomplete="off"><input type="hidden" name="csrf" value="${csrf}">${fields.map(([key,label])=>`<label for="${key}">${label}</label><input type="password" name="${key}" id="${key}" required maxlength="2048" autocomplete="off" spellcheck="false">`).join('')}<button>Save privately for the isolated drill</button></form><aside>Values are saved once in an owner-only temporary file outside Git. The recovery helper will use the database connection only for the approved branch, storage credentials only for the two testing stores, and the candidate password only for a local restored-app login. No value is displayed or sent from this form to an external service. Do not save them in the browser.</aside>`);
 if(req.method!=='POST'||req.url!=='/save'||saved||req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded'))return reply(res,403,'<h1>Request rejected</h1><p>Use the prepared local form.</p>');
 let body='';req.on('data',chunk=>{body+=chunk;if(Buffer.byteLength(body)>12000)req.destroy();});req.on('end',()=>{
  const form=new URLSearchParams(body),values=Object.fromEntries(fields.map(([key])=>[key,form.get(key)||'']));
  try{
   if(form.get('csrf')!==csrf)throw new Error();
   validateRecoveryEntries(values,config);
   fs.writeFileSync(destination,JSON.stringify(values),{mode:0o600,flag:'wx'});saved=true;body='';res.writeHead(303,{'Location':'/','Cache-Control':'no-store'});res.end();
  }catch{body='';reply(res,400,'<h1>Entries could not be saved</h1><p>Check the recovery branch connection, the two testing store tokens, 64-character hexadecimal testing key and existing QA password. No value was displayed or checked externally. Return to the form and try again.</p>');}
 });
});
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({url:origin,credentialFile:destination,loopbackOnly:true,externalRequests:false})));
