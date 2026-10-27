const { prisma, mailer } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { storedAccountToken } = require('../lib/account-tokens.ts');
const { getSession } = require('../lib/auth.ts');
const verify = require('../app/api/auth/verify/route.ts').POST;
const reset = require('../app/api/auth/reset/route.ts').POST;
const forgot = require('../app/api/auth/forgot/route.ts').POST;
const resend = require('../app/api/auth/resend-verification/route.ts').POST;
const login = require('../app/api/auth/login/route.ts').POST;
const employerLogin = require('../app/api/auth/employer/route.ts').POST;
const raw = 'b'.repeat(64);
const req = (path, body, cookie) => new Request(`http://localhost:3173${path}`, {
    method: body ? 'POST' : 'GET', headers: { Origin: 'http://localhost:3173', ...(body ? {'Content-Type':'application/json'} : {}), ...(cookie ? {cookie:`benchscout_session=${cookie}`} : {}) }, ...(body ? {body:JSON.stringify(body)} : {}),
});
let tokens, account, employer, emails, sessions, updates;
const matches = (row, where) => row && (!where.id || where.id === row.id) && where.email === row.email && where.token.in.includes(row.token) && row.expiresAt > where.expiresAt.gt;
beforeEach(async () => {
    tokens = new Map(); emails = []; sessions = []; updates = [];
    account = { id:'scientist', email:'shared@example.com', name:'Test Scientist', careerPhase:'internship', isVerified:false, password:await bcrypt.hash('correct test password',4) };
    employer = { id:'lab', email:account.email, companyName:'Test Lab', isVerified:false, passwordHash:account.password };
    prisma.rateLimit.upsert = async () => ({count:1});
    prisma.$transaction = async ops => typeof ops === 'function' ? ops(prisma) : Promise.all(ops);
    prisma.user.findUnique = async ({where}) => where.email === account.email || where.id === account.id ? account : null;
    prisma.employer.findUnique = async ({where}) => where.email === employer.email || where.id === employer.id ? employer : null;
    prisma.user.update = async ({data}) => { updates.push({role:'candidate',data}); Object.assign(account,data); return account; };
    prisma.employer.update = async ({data}) => { updates.push({role:'employer',data}); Object.assign(employer,data); return employer; };
    prisma.authSession.create = async ({data}) => { sessions.push(data); return data; };
    prisma.authSession.deleteMany = async ({where}) => { updates.push({revoked:where}); return {count:1}; };
    for (const [table, kind] of [[prisma.verificationToken,'verify'],[prisma.passwordResetToken,'reset']]) {
        table.upsert = async ({where,create,update}) => { const key=`${kind}:${where.email}`;const row=tokens.has(key)?{...tokens.get(key),...update}:{id:key,...create};tokens.set(key,row);return row; };
        table.findFirst = async ({where}) => { const row=tokens.get(`${kind}:${where.email}`);return matches(row,where)?row:null; };
        table.deleteMany = async ({where}) => { const key=`${kind}:${where.email}`,row=tokens.get(key);if(!matches(row,where))return {count:0};tokens.delete(key);return {count:1}; };
    }
    mailer.sendEmail = async (to,subject,html) => { emails.push({to,subject,html}); };
});
function seed(kind,email,token=storedAccountToken(raw),expiresAt=new Date(Date.now()+60000)) { tokens.set(`${kind}:${email}`, {id:`${kind}:${email}`,email,token,expiresAt}); }
test('verification normalizes email, consumes tokens once and rejects malformed/expired links', async () => {
    seed('verify',account.email);
    assert.equal((await verify(req('/api/auth/verify',{email:' SHARED@EXAMPLE.COM ',token:raw}))).status,200);assert.equal(account.isVerified,true);
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:raw}))).status,400);
    account.isVerified=false;seed('verify',account.email,storedAccountToken(raw),new Date(Date.now()-1));
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:raw}))).status,400);assert.equal(account.isVerified,false);
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:{bad:true}}))).status,400);
});
test('already-issued verification links remain valid until expiry', async () => {
    seed('verify',account.email,raw);
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:raw}))).status,200);
});
test('resending confirmation invalidates the old link and stores only the digest of the new token', async () => {
    seed('verify',account.email);
    assert.equal((await resend(req('/api/auth/resend-verification',{email:' SHARED@EXAMPLE.COM '}))).status,200);
    const row=tokens.get(`verify:${account.email}`),issued=new URL(emails[0].html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&')).searchParams.get('token');
    assert.equal(row.token,storedAccountToken(issued));assert.notEqual(row.token,issued);
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:raw}))).status,400);
    assert.equal((await verify(req('/api/auth/verify',{email:account.email,token:issued}))).status,200);
});
test('candidate and employer recovery with the same email stay independent', async () => {
    for(const role of ['candidate','employer']) {
        assert.equal((await forgot(req('/api/auth/forgot',{email:' SHARED@EXAMPLE.COM ',role}))).status,200);
        const link=new URL(emails.at(-1).html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&')),issued=link.searchParams.get('token');
        assert.equal(link.searchParams.get('role'),role);
        const key=role==='employer'?`employer@${account.email}`:account.email;
        assert.equal(tokens.get(`reset:${key}`).token,storedAccountToken(issued));
    }
    assert.equal(tokens.size,2);
    assert.equal((await forgot(req('/api/auth/forgot',{email:'missing@example.com',role:'employer'}))).status,200);assert.equal(emails.length,2);
    assert.equal((await forgot(req('/api/auth/forgot',{email:account.email,role:'admin'}))).status,400);
});
test('recovery and confirmation responses do not disclose accounts when email delivery fails', async () => {
    mailer.sendEmail = async () => { throw new Error('Mock provider unavailable'); };
    for (const [handler,path] of [[forgot,'/api/auth/forgot'],[resend,'/api/auth/resend-verification']]) {
        const known=await handler(req(path,{email:account.email}));
        const unknown=await handler(req(path,{email:'missing@example.com'}));
        assert.equal(known.status,200);assert.equal(unknown.status,200);
        assert.deepEqual(await known.json(),await unknown.json());
    }
    assert.equal(updates.length,0);assert.equal(sessions.length,0);
});
test('reset changes only the selected role, consumes its token and revokes its sessions', async () => {
    for(const role of ['candidate','employer']) {
        const key=role==='employer'?`employer@${account.email}`:account.email;seed('reset',key);
        const body={email:account.email,token:raw,role,newPassword:'my new test password'};
        assert.equal((await reset(req('/api/auth/reset',body))).status,200);
        assert.equal(await bcrypt.compare(body.newPassword,role==='employer'?employer.passwordHash:account.password),true);
        assert.deepEqual(updates.at(-1),{revoked:{subjectId:role==='employer'?'lab':'scientist',role}});
        const previous=updates.length;assert.equal((await reset(req('/api/auth/reset',body))).status,400);assert.equal(updates.length,previous);
    }
});
test('expired, cross-role and concurrently replaced reset tokens cannot change credentials', async () => {
    const body={email:account.email,token:raw,newPassword:'a new test password'};
    seed('reset',account.email,storedAccountToken(raw),new Date(Date.now()-1));
    assert.equal((await reset(req('/api/auth/reset',body))).status,400);
    seed('reset',account.email);
    assert.equal((await reset(req('/api/auth/reset',{...body,role:'employer'}))).status,400);
    prisma.passwordResetToken.deleteMany=async()=>({count:0});
    assert.equal((await reset(req('/api/auth/reset',body))).status,400);assert.equal(updates.length,0);
});
test('candidate login requires verification and restores internship phase; expired sessions fail', async () => {
    const body={email:account.email,password:'correct test password'};
    assert.equal((await login(req('/api/auth/login',body))).status,403);assert.equal(sessions.length,0);
    account.isVerified=true;assert.equal((await login(req('/api/auth/login',{...body,password:'wrong'}))).status,401);
    const response=await login(req('/api/auth/login',body));assert.equal(response.status,200);
    const cookie=response.headers.get('set-cookie').match(/benchscout_session=([a-f0-9]+)/)[1];
    prisma.authSession.findUnique=async()=>sessions[0];
    assert.equal((await getSession(req('/api/auth/session',null,cookie))).careerPhase,'internship');
    sessions[0].expiresAt=new Date(Date.now()-1);await assert.rejects(()=>getSession(req('/api/auth/session',null,cookie)),error=>error.status===401);
});
test('employer login establishes an employer session without granting review approval', async () => {
    const body={action:'login',email:employer.email,password:'correct test password'};
    assert.equal((await employerLogin(req('/api/auth/employer',{...body,password:'wrong'}))).status,401);
    const response=await employerLogin(req('/api/auth/employer',body));assert.equal(response.status,200);
    assert.equal(sessions[0].role,'employer');assert.equal((await response.json()).employer.isVerified,false);
});
test('new employers must confirm their email; confirmation never grants company review approval', async () => {
    employer.emailVerificationRequired=true;
    seed('verify',`employer@${employer.email}`);
    const body={action:'login',email:employer.email,password:'correct test password'};
    assert.equal((await employerLogin(req('/api/auth/employer',body))).status,403);assert.equal(sessions.length,0);
    assert.equal((await verify(req('/api/auth/verify',{email:employer.email,token:raw,role:'candidate'}))).status,400);
    assert.equal((await verify(req('/api/auth/verify',{email:employer.email,token:raw,role:'employer'}))).status,200);
    assert.ok(employer.emailVerifiedAt instanceof Date);assert.equal(employer.isVerified,false);assert.equal(account.isVerified,false);
    assert.equal((await employerLogin(req('/api/auth/employer',body))).status,200);
    prisma.authSession.findUnique=async()=>sessions[0];
    const cookie='a'.repeat(64);
    assert.equal((await getSession(req('/api/auth/session',null,cookie))).verified,false);
    employer.emailVerifiedAt=null;
    await assert.rejects(()=>getSession(req('/api/auth/session',null,cookie)),error=>error.status===401);
});
test('employer signup creates a confirmation token without creating a session or granting review', async () => {
    prisma.employer.findUnique=async()=>null;
    prisma.employer.create=async({data})=>{employer={id:'new-lab',isVerified:false,...data};return employer;};
    prisma.verificationToken.create=async({data})=>{tokens.set(`verify:${data.email}`,data);return data;};
    const response=await employerLogin(req('/api/auth/employer',{action:'register',email:'NEW@EXAMPLE.COM',companyName:'New Lab',password:'correct test password'}));
    assert.equal(response.status,200);assert.equal((await response.json()).requiresEmailVerification,true);
    assert.equal(employer.emailVerificationRequired,true);assert.equal(employer.isVerified,false);assert.equal(sessions.length,0);
    assert.match(tokens.get('verify:employer@new@example.com').token,/^sha256:/);
    assert.equal(emails.length,1);
});
