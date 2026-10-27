// Operator-only tool. Credentials must be supplied through a private environment.
// Intentionally does not load the normal local .env (which may target Production).
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const load = Module._load;
Module._load = function(name, parent, main) { return load.call(this, name.startsWith('@/') ? path.join(root, name.slice(2)) : name, parent, main); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const backup = require('../lib/document-backup.ts');
const args = process.argv.slice(2);
const value = flag => { const i=args.indexOf(flag); return i<0 ? undefined : args[i+1]; };
async function main() {
 if (args[0] === 'restore') {
  const sourceFile=value('--source-file'), destination=value('--output-dir');
  if(!sourceFile || !destination) throw new Error('Use restore --source-file /protected/source-url.txt --output-dir /protected/restore-directory');
  const output=path.resolve(destination), relative=path.relative(root,output);
  if(!relative.startsWith('..'+path.sep) && relative!=='..') throw new Error('Restore outside the repository');
  fs.mkdirSync(output,{recursive:true,mode:0o700});
  if((fs.statSync(output).mode & 0o077)!==0) throw new Error('Restore directory must have mode 0700');
  const source=fs.readFileSync(sourceFile,'utf8').trim();
  const bytes=await backup.restoreDocumentBytes(source);
  const filename=path.join(output,'restored-document.bin');
  fs.writeFileSync(filename,bytes,{flag:'wx',mode:0o600});
  const sha256=require('node:crypto').createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
  console.log(JSON.stringify({restored:true,bytes:bytes.length,sha256,databaseChanged:false,grantsChanged:false}));
  return;
 }
 if(args[0]!=='backfill') throw new Error('Choose backfill (dry-run by default) or restore');
 if(value('--confirm-target')!=='testing' || process.env.DOCUMENT_BACKUP_OPERATOR_TARGET!=='testing') throw new Error('Explicit testing target confirmation required');
 if(!process.env.DATABASE_URL) throw new Error('Supply dedicated testing DATABASE_URL privately');
 const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();
 try {
  const fields=['resumeUrl','licenseUrl','provisionalUrl','degreeUrl','statementOfResultUrl','placementLetterUrl','certificateUrl','avatarUrl'];
  const select=Object.fromEntries(['id',...fields].map(k=>[k,true]));
  const users=await prisma.user.findMany({select});
  let candidates=0,verified=0,stalePurged=0,failed=0;
  for(const user of users) for(const field of fields) {
   const source=user[field];if(!source || !source.startsWith('https://') || !source.includes('.private.blob.vercel-storage.com/'))continue;
   candidates++;
   if(!args.includes('--apply'))continue;
   try {
    if(!backup.backupEnabled())throw new Error('Enable backups before applying backfill');
    const bytes=await backup.readPrivateBytes(source,process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,4*1024*1024);
    await backup.backupDocument(source,bytes);
    const latest=await prisma.user.findUnique({where:{id:user.id},select:{[field]:true}});
    if(!latest || latest[field]!==source){await backup.purgeDocumentBackup(source);stalePurged++;}else verified++;
   } catch { failed++; }
  }
  console.log(JSON.stringify({dryRun:!args.includes('--apply'),candidates,verified,stalePurged,failed}));
  if(failed)process.exitCode=1;
 } finally {await prisma.$disconnect();}
}
main().catch(()=>{console.error('Document backup operation failed. Review configuration privately; no credential or file URL is logged.');process.exitCode=1;});
