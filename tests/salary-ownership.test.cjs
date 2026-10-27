const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { salaryOwnerKey } = require('../lib/security.ts');
const routes = require('../app/api/salary/route.ts');
const fields = { role: 'MLS', location: 'Lagos', salary: 250000, experience: '1-3 years' };
let actor, role, rows, writes;
function request(method, body, authenticated = true) {
  return new Request('http://localhost:3000/api/salary', {
    method,
    headers: { Origin: 'http://localhost:3000', ...(authenticated ? { cookie: `benchscout_session=${'a'.repeat(64)}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
beforeEach(() => {
  process.env.SALARY_OWNER_SECRET = 'synthetic-salary-test-key'.repeat(2);
  actor = 'alice'; role = 'candidate'; writes = 0;
  rows = [
    { ...fields, id: 'legacy', ownerKey: null },
    { ...fields, id: 'bob-report', ownerKey: salaryOwnerKey('bob') },
  ];
  prisma.authSession.findUnique = async () => ({ subjectId: actor, role, expiresAt: new Date(Date.now() + 60000) });
  prisma.user.findUnique = async () => ({ id: actor, email: `${actor}@example.invalid`, isVerified: true });
  prisma.employer.findUnique = async () => ({ id: actor, email: `${actor}@example.invalid`, isVerified: true });
  prisma.rateLimit.upsert = async () => ({ count: 1 });
  // In-memory adapter exercises real route/auth handlers; no configured DB is loaded.
  prisma.salaryReport.upsert = async ({ where, create, update }) => {
    writes++;
    let row = rows.find(item => item.ownerKey === where.ownerKey);
    if (row) Object.assign(row, update);
    else { row = { id: 'alice-report', ...create }; rows.push(row); }
    return row;
  };
  prisma.salaryReport.updateMany = async ({ where, data }) => {
    writes++;
    const matches = rows.filter(row => row.id === where.id && row.ownerKey === where.ownerKey);
    matches.forEach(row => Object.assign(row, data));
    return { count: matches.length };
  };
  prisma.salaryReport.deleteMany = async ({ where }) => {
    writes++;
    const previous = rows.length;
    rows = rows.filter(row => !(row.id === where.id && row.ownerKey === where.ownerKey));
    return { count: previous - rows.length };
  };
});
test('salary writes reject anonymous and employer sessions before persistence', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    assert.equal((await routes[method](request(method, { ...fields, id: 'legacy' }, false))).status, 401);
    role = 'employer';
    assert.equal((await routes[method](request(method, { ...fields, id: 'legacy' }))).status, 403);
  }
  assert.equal(writes, 0);
});
test('repeat contribution updates only the authenticated owner and ignores supplied ownership', async () => {
  const before = structuredClone(rows);
  const body = { ...fields, ownerKey: salaryOwnerKey('bob'), id: 'legacy' };
  const first = await routes.POST(request('POST', body));
  const second = await routes.POST(request('POST', { ...body, salary: 300000 }));
  assert.equal(first.status, 200); assert.equal(second.status, 200);
  assert.equal((await first.json()).id, (await second.json()).id);
  assert.equal(rows.length, 3); assert.deepEqual(rows.slice(0, 2), before);
  assert.equal(rows[2].ownerKey, salaryOwnerKey('alice')); assert.equal(rows[2].salary, 300000);
});
test('cross-owner and anonymous legacy reports cannot be edited or deleted', async () => {
  const before = structuredClone(rows);
  for (const id of ['bob-report', 'legacy', 'missing']) {
    for (const method of ['PUT', 'DELETE']) {
      assert.equal((await routes[method](request(method, { ...fields, salary: 400000, id }))).status, 404);
      assert.deepEqual(rows, before);
    }
  }
});
test('owner can edit and delete own contribution while preserving unrelated rows', async () => {
  const before = structuredClone(rows);
  await routes.POST(request('POST', fields));
  assert.equal((await routes.PUT(request('PUT', { ...fields, salary: 350000, id: 'alice-report' }))).status, 200);
  assert.equal(rows[2].salary, 350000);
  assert.equal((await routes.DELETE(request('DELETE', { id: 'alice-report' }))).status, 200);
  assert.deepEqual(rows, before);
  assert.equal((await routes.DELETE(request('DELETE', { id: 'alice-report' }))).status, 404);
});
test('missing stable ownership secret fails closed for all salary writes', async () => {
  delete process.env.SALARY_OWNER_SECRET;
  for (const method of ['POST', 'PUT', 'DELETE']) {
    assert.equal((await routes[method](request(method, { ...fields, id: 'legacy' }))).status, 503);
  }
  assert.equal(writes, 0);
});
