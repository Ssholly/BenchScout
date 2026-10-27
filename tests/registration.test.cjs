const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
let created, verification;
beforeEach(() => {
  created = null; verification = null;
  prisma.rateLimit.upsert = async () => ({ count: 1 });
  prisma.user.findUnique = async () => null;
  prisma.user.create = async ({ data }) => { created = data; return data; };
  prisma.verificationToken.create = async ({ data }) => { verification = data; return data; };
  prisma.$transaction = async operations => Promise.all(operations);
});
function registration(extra = {}) {
  const data = new FormData();
  data.set('name','Test Scientist'); data.set('email','scientist@example.com'); data.set('password','a long test password'); data.set('careerPhase','licensed');
  for (const [key,value] of Object.entries(extra)) data.set(key,value);
  return new Request('http://localhost:3173/api/auth/register', { method:'POST',headers:{Host:'127.0.0.1:3173',Origin:'http://127.0.0.1:3173'},body:data });
}
test('signup can create an account before private CV storage is configured', async () => {
  const response = await require('../app/api/auth/register/route.ts').POST(registration());
  assert.equal(response.status,200); assert.equal((await response.json()).success,true);
  assert.equal(created.resumeUrl,null); assert.equal(created.cvParsedText,null); assert.equal(created.isVerified,false);
  assert.equal(verification.email,created.email); assert.ok(verification.token);
  assert.notEqual(created.password,'a long test password');
});
test('optional CV uploads still reject forged PDFs before creating an account', async () => {
  const response = await require('../app/api/auth/register/route.ts').POST(registration({resume:new File(['bad data'],'cv.pdf',{type:'application/pdf'})}));
  assert.equal(response.status,400); assert.equal(created,null);
});
test('existing accounts cannot be replaced by signing up with the same email', async () => {
  prisma.user.findUnique = async () => ({id:'existing'});
  const response = await require('../app/api/auth/register/route.ts').POST(registration());
  assert.equal(response.status,400); assert.equal(created,null);
});
test('legacy passwords shorter than the new signup minimum can still log in', async () => {
  const password = 'legacy8!';
  prisma.user.findUnique = async () => ({id:'existing',email:'scientist@example.com',name:'Test Scientist',password:await bcrypt.hash(password,4),isVerified:true,careerPhase:'licensed'});
  let session;
  prisma.authSession.create = async ({data}) => {session=data;};
  const req = new Request('http://localhost:3173/api/auth/login',{method:'POST',headers:{Host:'127.0.0.1:3173',Origin:'http://127.0.0.1:3173','Sec-Fetch-Site':'same-origin','Content-Type':'application/json'},body:JSON.stringify({email:'scientist@example.com',password})});
  const response = await require('../app/api/auth/login/route.ts').POST(req);
  assert.equal(response.status,200); assert.equal((await response.json()).success,true);
  assert.equal(session.subjectId,'existing'); assert.match(response.headers.get('set-cookie'),/HttpOnly/);
});
