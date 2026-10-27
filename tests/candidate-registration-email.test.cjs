const {prisma,mailer}=require('./register.cjs');
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const bcrypt=require('bcryptjs');
const {storedAccountToken}=require('../lib/account-tokens.ts');
const register=require('../app/api/auth/register/route.ts').POST;
const origin='https://bench-scout-git-testing-sholly.vercel.app';
let created,token,email;
beforeEach(()=>{
 process.env.NODE_ENV='production';process.env.NEXT_PUBLIC_APP_URL=origin;
 created=null;token=null;email=null;
 prisma.rateLimit.upsert=async()=>({count:1});
 prisma.user.findUnique=async()=>null;
 prisma.user.create=async({data})=>{created=data;return data;};
 prisma.verificationToken.create=async({data})=>{token=data;return data;};
 prisma.$transaction=async ops=>Promise.all(ops);
 mailer.sendEmail=async(to,subject,html,text)=>{email={to,subject,html,text};};
});
function request(){const data=new FormData();for(const [key,value]of Object.entries({name:'Synthetic QA',email:'QA@EXAMPLE.INVALID',password:'synthetic test password',careerPhase:'licensed'}))data.set(key,value);return new Request(origin+'/api/auth/register',{method:'POST',headers:{Origin:origin},body:data});}
test('candidate signup delivers one role-scoped confirmation with plaintext, expiry and a hashed stored token',async()=>{
 const response=await register(request());assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true});
 assert.equal(created.email,'qa@example.invalid');assert.equal(created.isVerified,false);assert.equal(await bcrypt.compare('synthetic test password',created.password),true);
 assert.equal(email.to,created.email);assert.equal(email.subject,'Confirm your BenchScout account');
 const href=email.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');const url=new URL(href);
 assert.equal(url.origin,origin);assert.equal(url.pathname,'/verify');assert.equal(url.searchParams.get('role'),'candidate');assert.equal(url.searchParams.get('email'),created.email);
 assert.equal(token.email,created.email);assert.equal(token.token,storedAccountToken(url.searchParams.get('token')));assert.notEqual(token.token,url.searchParams.get('token'));
 assert.match(email.html,/24 hours/);assert.match(email.text,/24 hours/);assert.ok(email.text.includes(href));
 assert.equal(token.expiresAt>new Date(Date.now()+23*60*60*1000),true);
});
test('confirmation delivery failure preserves the unconfirmed account and retry warning',async()=>{
 mailer.sendEmail=async()=>{throw Error('Synthetic delivery failure');};
 const response=await register(request());const body=await response.json();assert.equal(response.status,200);assert.equal(body.success,true);assert.match(body.warning,/Resend verification/);
 assert.equal(created.isVerified,false);assert.match(token.token,/^sha256:/);assert.equal(token.email,created.email);
});
