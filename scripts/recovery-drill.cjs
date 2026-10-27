// Bounded operator rehearsal. Never loads application .env files or logs provider errors.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Module=require('node:module');
const {validateRecoveryEntries}=require('./recovery-entry-guards.cjs');
const {PrismaClient}=require('@prisma/client');
const {put}=require('@vercel/blob');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const app='/private/tmp/benchscout-timed-recovery-app';
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const credentialPath=process.argv[3];
const verifyOnly=process.argv.includes('--verify-only');
const report={startedAt:new Date().toISOString(),passed:false,checks:[],files:[],productionTouched:false};
let stage='private-input',prisma;
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const check=(name,condition)=>{assert.ok(condition,name);report.checks.push(name);};
// Resolve the isolated source's TypeScript aliases without test mocks or environment loading.
const originalLoad=Module._load,originalTs=require.extensions['.ts'];
const ts=require('typescript');
Module._load=function(request,parent,isMain){return originalLoad.call(this,request.startsWith('@/')?path.join(app,request.slice(2)):request,parent,isMain);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {backupPath,openBackup,readPrivateBytes}=require(path.join(app,'lib/document-backup.ts'));
Module._load=originalLoad;require.extensions['.ts']=originalTs;
async function main(){
 const stat=fs.statSync(credentialPath);check('owner-only-credential-file',(stat.mode&0o077)===0);
 const values=JSON.parse(fs.readFileSync(credentialPath,'utf8'));validateRecoveryEntries(values,config);
 check('approved-testing-targets',config.recoveryPrefix==='qa-full-recovery/20261027'&&config.allowedDatabaseHosts.every(h=>h.startsWith('ep-royal-wildflower-b7tl2l5a')));
 for(const name of ['.env','.env.local','.env.production','.env.production.local'])check(`isolated-app-no-${name}`,!fs.existsSync(path.join(app,name)));
 check('backup-source-matches-reviewed-code',sha(fs.readFileSync(path.join(app,'lib/document-backup.ts')))===sha(fs.readFileSync(path.join(root,'lib/document-backup.ts'))));
 stage='recovery-database';
 prisma=new PrismaClient({datasources:{db:{url:values.databaseUrl}},log:[]});
 const database=await prisma.$queryRawUnsafe('SELECT current_database() AS name');check('testing-database',database[0].name==='benchscout_testing');
 check('copied-sessions-inactive',await prisma.authSession.count({where:{expiresAt:{gt:new Date()}}})===0);
 check('copied-confirmation-links-inactive',await prisma.verificationToken.count({where:{expiresAt:{gt:new Date()}}})===0);
 check('copied-reset-links-inactive',await prisma.passwordResetToken.count({where:{expiresAt:{gt:new Date()}}})===0);
 const migrations=await prisma.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at FROM "_prisma_migrations"');
 const migrationRoot=path.join(app,'prisma/migrations');
 check('nine-reviewed-migrations',migrations.length===9&&migrations.every(m=>m.finished_at&&!m.rolled_back_at&&sha(fs.readFileSync(path.join(migrationRoot,m.migration_name,'migration.sql')))===m.checksum));
 const candidates=await prisma.user.findMany({where:{name:'QA ONLY - Synthetic Candidate 20261020'},select:{id:true,email:true,isVerified:true,resumeUrl:true,degreeUrl:true,certificateUrl:true,applications:{include:{job:{include:{employer:true}}}}}});
 check('unique-synthetic-candidate',candidates.length===1);const user=candidates[0];
 check('verified-qa-email',user.isVerified&&user.email==='sholly246success+benchscout-candidate@gmail.com');
 check('retained-qa-application',user.applications.length===1);
 const application=user.applications[0],employer=application.job.employer;
 check('closed-qa-vacancy',application.job.status==='closed'&&application.job.role.startsWith('QA ONLY'));
 check('suspended-qa-employer',employer?.companyName==='QA ONLY - BenchScout Pilot Laboratory 20261020'&&!employer.isVerified&&employer.verificationStatus==='suspended');
 const fields={resume:'resumeUrl',degree:'degreeUrl',certificate:'certificateUrl'};
 const restored=[];const key=Buffer.from(values.encryptionKey,'hex');
 const expected={resume:'6b8dea6ab428b082e9c3ef63f5af97498d249ead9eff5685b8781b436fe5bea7',degree:'1bd201f4d02fbd95819e5adc23d6ae956bb2b26dda419070168cfae7dcc25c5f'};
 for(const [kind,field] of Object.entries(fields)){
  stage=`decrypt-${kind}`;const source=user[field],url=new URL(source);
  check(`${kind}-testing-private-source`,url.hostname===`${config.sourceStoreId.toLowerCase()}.private.blob.vercel-storage.com`&&url.protocol==='https:');
  const envelope=await readPrivateBytes(backupPath(source),values.backupToken);
  const bytes=openBackup(envelope,source,key);
  check(`${kind}-authenticated-archive`,bytes.subarray(0,5).toString()==='%PDF-'&&bytes.length>0&&bytes.length<=4*1024*1024);
  const digest=sha(bytes);if(expected[kind])check(`${kind}-recorded-fixture-hash`,digest===expected[kind]);
  restored.push({kind,field,source,bytes,sha256:digest});report.files.push({kind,bytes:bytes.length,sha256:digest,recordedFixtureHashCompared:!!expected[kind]});
 }
 report.archivesVerifiedAt=new Date().toISOString();
 if(verifyOnly){report.verificationOnly=true;report.passed=true;return;}
 await restoreAndCheck({values,user,application,employer,restored,fields});
 report.passed=true;
}
async function restoreAndCheck({values,user,application,employer,restored,fields}){
 const http=require('node:http'),https=require('node:https'),{spawn,execFileSync}=require('node:child_process');
 const directory=path.dirname(credentialPath),runId=crypto.randomUUID();
 const prefix=`${config.recoveryPrefix}/${runId}`;
 const manifest={prefix,files:[],databaseBranch:'br-round-mountain-b7uzwvyd'};
 const manifestPath=path.join(directory,'restored-file-manifest.json');
 check('new-recovery-file-manifest',!fs.existsSync(manifestPath));
 const writeManifest=()=>fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2),{mode:0o600});
 const grantSet=(selection,vault)=>Object.entries(fields).filter(([kind,field])=>typeof selection?.[kind]==='string'&&selection[kind]===vault[field]).map(([kind])=>kind).sort();
 check('replacement-cv-unshared',application.documentSelection?.resume!==user.resumeUrl);
 check('optional-certificate-unshared',!application.documentSelection?.certificate);
 const beforeGrants=grantSet(application.documentSelection,user);
 check('no-current-test-documents-shared',beforeGrants.length===0);
 for(const file of restored){
  stage=`restore-${file.kind}`;
  const blob=await put(`${prefix}/${file.kind}.pdf`,file.bytes,{access:'private',token:values.sourceToken,contentType:'application/pdf',addRandomSuffix:true,allowOverwrite:false});
  file.destination=blob.url;manifest.files.push({kind:file.kind,source:file.source,destination:blob.url,sha256:file.sha256});writeManifest();
  check(`${file.kind}-restored-in-testing-store`,new URL(blob.url).hostname===`${config.sourceStoreId.toLowerCase()}.private.blob.vercel-storage.com`);
  const bytes=await readPrivateBytes(blob.url,values.sourceToken);
  check(`${file.kind}-private-readback-matches`,bytes.equals(file.bytes));
  const unsigned=await fetch(blob.url,{redirect:'error',signal:AbortSignal.timeout(15000)});
  check(`${file.kind}-unsigned-object-denied`,unsigned.status===403);await unsigned.body?.cancel();
 }
 stage='remap-recovery-copy';
 await prisma.$transaction(async tx=>{
  const current=await tx.user.findUniqueOrThrow({where:{id:user.id},select:{resumeUrl:true,degreeUrl:true,certificateUrl:true}});
  for(const file of restored)assert.equal(current[file.field],file.source,'Recovery inventory changed');
  const data=Object.fromEntries(restored.map(file=>[file.field,file.destination]));
  await tx.user.update({where:{id:user.id},data});
  // Only an exact current selected version may be remapped; never revive stale grants.
  const selected={...application.documentSelection};
  for(const file of restored)if(selected[file.kind]===file.source)selected[file.kind]=file.destination;
  check('sharing-grants-preserved',JSON.stringify(grantSet(selected,{...current,...data}))===JSON.stringify(beforeGrants));
  if(JSON.stringify(selected)!==JSON.stringify(application.documentSelection))await tx.application.update({where:{id:application.id},data:{documentSelection:selected}});
 });
 report.filesRestoredAt=new Date().toISOString();report.restoredPrefix=prefix;report.cleanupRequired=true;
 stage='local-https-setup';
 const certFile=path.join(directory,'loopback.crt'),keyFile=path.join(directory,'loopback.key');
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',keyFile,'-out',certFile,'-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});fs.chmodSync(keyFile,0o600);
 const origin='https://127.0.0.1:3970',tls={key:fs.readFileSync(keyFile),cert:fs.readFileSync(certFile)};
 const allowedGets=new Set(['/home','/api/auth/session','/api/jobs','/api/documents']);
 const authHashes=[];let child,proxy,smtp,mailAttempts=0;
 const childEnv={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:directory,LANG:'en_US.UTF-8',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_APP_URL:origin,DATABASE_URL:values.databaseUrl,BLOB_PRIVATE_READ_WRITE_TOKEN:values.sourceToken,DOCUMENT_BACKUP_ENABLED:'false',SMTP_HOST:'127.0.0.1',SMTP_PORT:'3972',EMAIL_FROM:'QA ONLY <qa@example.invalid>'};
 const request=(target,{method='GET',cookie,body}={})=>new Promise((resolve,reject)=>{
  const payload=body?JSON.stringify(body):null;
  const req=https.request(origin+target,{method,ca:tls.cert,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(payload?{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)}:{})}},res=>{
   const chunks=[];let size=0;res.on('data',chunk=>{size+=chunk.length;if(size>5*1024*1024){res.destroy();reject(new Error('Response limit'));}else chunks.push(chunk);});
   res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,bytes:Buffer.concat(chunks)}));res.on('error',reject);
  });req.setTimeout(20000,()=>req.destroy(new Error('Local request timeout')));req.on('error',reject);if(payload)req.write(payload);req.end();
 });
 try{
  smtp=require('node:net').createServer(socket=>{mailAttempts++;socket.end('421 QA local mail disabled\r\n');});
  await new Promise((resolve,reject)=>{smtp.once('error',reject);smtp.listen(3972,'127.0.0.1',resolve);});
  proxy=https.createServer(tls,(req,res)=>{
   const url=new URL(req.url,origin);
   const permitted=req.method==='GET'&&(allowedGets.has(url.pathname)||(url.pathname==='/api/jobs/applicants'&&url.searchParams.get('jobId')===application.jobId))||req.method==='POST'&&['/api/auth/login','/api/auth/logout'].includes(url.pathname);
   if(!permitted){res.writeHead(403);return res.end();}
   const forward=body=>{
    const upstream=http.request({host:'127.0.0.1',port:3971,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:3970','x-forwarded-proto':'https'}},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});upstream.setTimeout(20000,()=>upstream.destroy());if(body)upstream.write(body);upstream.end();
   };
   if(req.method==='GET')return forward();
   let body='';req.on('data',chunk=>{body+=chunk;if(body.length>4096)req.destroy();});req.on('end',()=>{
    try{if(url.pathname==='/api/auth/login'&&JSON.parse(body).email!==user.email){res.writeHead(403);return res.end();}forward(body);}catch{res.writeHead(400);res.end();}
   });
  });
  await new Promise((resolve,reject)=>{proxy.once('error',reject);proxy.listen(3970,'127.0.0.1',resolve);});
  child=spawn(process.execPath,[path.join(app,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3971'],{cwd:app,env:childEnv,stdio:'ignore'});
  let ready=false;for(let i=0;i<40;i++){try{if((await request('/home')).status===200){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
  check('isolated-https-app-ready',ready);stage='restored-app-http';
  check('anonymous-session-denied',(await request('/api/auth/session')).status===401);
  const login=await request('/api/auth/login',{method:'POST',body:{email:user.email,password:values.candidatePassword}});
  check('restored-candidate-login',login.status===200);
  const cookie=(login.headers['set-cookie']||[]).find(value=>value.startsWith('benchscout_session='))?.split(';')[0];check('secure-session-cookie',!!cookie&&(login.headers['set-cookie']||[]).some(value=>value.includes('Secure')&&value.includes('HttpOnly')));
  authHashes.push(sha(cookie.split('=')[1]));
  check('restored-candidate-session',(await request('/api/auth/session',{cookie})).status===200);
  const foreign=await prisma.user.findFirst({where:{id:{not:user.id}},select:{id:true}});
  check('distinct-existing-account-for-denial',!!foreign);
  for(const file of restored){
   const query=`/api/documents?userId=${encodeURIComponent(user.id)}&kind=${file.kind}`;
   check(`${file.kind}-anonymous-app-denied`,(await request(query)).status===401);
   const owner=await request(query,{cookie});check(`${file.kind}-owner-http-bytes-match`,owner.status===200&&sha(owner.bytes)===file.sha256);
   check(`${file.kind}-cross-account-denied`,(await request(`/api/documents?userId=${encodeURIComponent(foreign.id)}&kind=${file.kind}`,{cookie})).status===403);
  }
  const expired=crypto.randomBytes(32).toString('hex'),suspended=crypto.randomBytes(32).toString('hex');authHashes.push(sha(expired),sha(suspended));
  await prisma.authSession.createMany({data:[{tokenHash:sha(expired),subjectId:user.id,role:'candidate',expiresAt:new Date(Date.now()-60000)},{tokenHash:sha(suspended),subjectId:employer.id,role:'employer',expiresAt:new Date(Date.now()+60000)}]});
  check('synthetic-expired-token-denied',(await request('/api/auth/session',{cookie:`benchscout_session=${expired}`})).status===401);
  const employerCookie=`benchscout_session=${suspended}`;
  check('suspended-employer-documents-denied',(await request(`/api/documents?userId=${encodeURIComponent(user.id)}&kind=resume&applicationId=${encodeURIComponent(application.id)}`,{cookie:employerCookie})).status===403);
  check('suspended-employer-roster-denied',(await request(`/api/jobs/applicants?jobId=${encodeURIComponent(application.jobId)}`,{cookie:employerCookie})).status===403);
  const jobs=await request('/api/jobs?view=pipeline',{cookie});check('application-history-readable',jobs.status===200);
  const retained=JSON.parse(jobs.bytes).find(job=>job.id===application.jobId);check('closed-application-history-preserved',retained?.status==='closed'&&retained.applied===true&&retained.applications.length===1);
  const latest=await prisma.application.findUniqueOrThrow({where:{id:application.id},include:{user:{select:{resumeUrl:true,degreeUrl:true,certificateUrl:true}},job:{include:{employer:true}}}});
  check('replacement-sharing-still-revoked',grantSet(latest.documentSelection,latest.user).length===0);
  check('closed-and-suspended-state-unchanged',latest.job.status==='closed'&&!latest.job.employer.isVerified&&latest.job.employer.verificationStatus==='suspended');
  check('logout-succeeds',(await request('/api/auth/logout',{method:'POST',cookie,body:{}})).status===200);
  check('logged-out-session-denied',(await request('/api/auth/session',{cookie})).status===401);
  check('no-mail-attempts',mailAttempts===0);report.mailAttempts=mailAttempts;report.cronConfigured=false;report.httpChecksCompletedAt=new Date().toISOString();
 }finally{
  stage=report.httpChecksCompletedAt?'shutdown':stage;
  if(child){child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},3000).unref();});}
  if(proxy){proxy.closeAllConnections();await new Promise(resolve=>proxy.close(resolve));}
  if(smtp)await new Promise(resolve=>smtp.close(resolve));
  if(authHashes.length)await prisma.authSession.updateMany({where:{tokenHash:{in:authHashes}},data:{expiresAt:new Date(0)}});
  report.localServicesStopped=true;
 }
}
main().catch(()=>{report.failedStage=stage;process.exitCode=1;}).finally(async()=>{
 if(prisma)await prisma.$disconnect().catch(()=>{});
 report.finishedAt=new Date().toISOString();
 const output=path.join(path.dirname(credentialPath),verifyOnly?'archive-verification.json':'restoration-result.json');
 fs.writeFileSync(output,JSON.stringify(report,null,2),{mode:0o600});
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
});
