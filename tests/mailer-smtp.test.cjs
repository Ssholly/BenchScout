require('./register.cjs');
const {test,beforeEach,after}=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const load=Module._load;let options,message,providerCalls;
Module._load=function(name,parent,main){if(name==='nodemailer')return {createTransport:config=>{options=config;return {sendMail:async value=>{message=value;}};}};if(name==='resend')return {Resend:class{constructor(){providerCalls++;this.emails={send:async()=>({error:null})};}}};return load.call(this,name,parent,main);};
// register mocks the app mailer, so load the real module by relative filename.
const {sendEmail}=require('../lib/mailer.ts');
const keys=['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','SMTP_SECURE','EMAIL_FROM','RESEND_API_KEY'];
const old=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
beforeEach(()=>{options=null;message=null;providerCalls=0;for(const key of keys)delete process.env[key];process.env.EMAIL_FROM='BenchScout QA <qa@example.invalid>';});
after(()=>{for(const key of keys){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}});
test('explicit loopback SMTP captures complete mail before external provider fallback',async()=>{
 Object.assign(process.env,{SMTP_HOST:'127.0.0.1',SMTP_PORT:'18025',RESEND_API_KEY:'unused'});
 await sendEmail('candidate@example.invalid','Synthetic confirmation','<p>Confirm</p>','Confirm',[{filename:'logo.png',content:Buffer.from('image'),contentId:'logo'}]);
 assert.equal(options.host,'127.0.0.1');assert.equal(options.port,18025);assert.equal(options.auth,undefined);assert.equal(options.requireTLS,false);assert.equal(providerCalls,0);assert.equal(message.to,'candidate@example.invalid');assert.equal(message.text,'Confirm');assert.equal(message.attachments[0].cid,'logo');
});
test('remote SMTP requires credentials and TLS unless using implicit TLS',async()=>{
 Object.assign(process.env,{SMTP_HOST:'smtp.example.invalid',SMTP_PORT:'587'});
 await assert.rejects(()=>sendEmail('candidate@example.invalid','Test','Test'),/SMTP_USER/);assert.equal(message,null);
 Object.assign(process.env,{SMTP_USER:'synthetic-user',SMTP_PASSWORD:'synthetic-password'});
 await sendEmail('candidate@example.invalid','Test','Test');assert.equal(options.requireTLS,true);assert.equal(options.secure,false);
 process.env.SMTP_SECURE='true';process.env.SMTP_PORT='465';await sendEmail('candidate@example.invalid','Test','Test');assert.equal(options.secure,true);assert.equal(options.requireTLS,false);
});
test('invalid custom SMTP port fails before any delivery attempt',async()=>{
 Object.assign(process.env,{SMTP_HOST:'127.0.0.1',SMTP_PORT:'not-a-port'});
 await assert.rejects(()=>sendEmail('candidate@example.invalid','Test','Test'),/SMTP_PORT/);assert.equal(options,null);assert.equal(providerCalls,0);
});

test('existing Resend delivery remains available when no custom SMTP host is configured',async()=>{
 process.env.RESEND_API_KEY='synthetic-provider-key';
 await sendEmail('candidate@example.invalid','Synthetic confirmation','<p>Confirm</p>');
 assert.equal(providerCalls,1);assert.equal(options,null);
});
