const { prisma } = require('./register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const sources = require('../lib/job-sources.ts');
const { runJobScan } = require('../lib/job-scanner.ts');
let released, history, writes;
beforeEach(() => {
  released = false; history = []; writes = 0;
  prisma.user.updateMany = async () => ({ count: 1 });
  prisma.user.update = async () => { released = true; };
  prisma.user.findUniqueOrThrow = async () => ({ id: 'owner', email: 'owner@example.com', careerPhase: 'licensed', location: 'Lagos', keywords: '', minScore: 0, strictMls: true, autoSendEmail: true, alertTier: 'All Tiers' });
  prisma.runHistory.create = async ({ data }) => { history.push(data); };
  prisma.job.findMany = async () => [];
  prisma.job.create = async () => { writes++; };
  prisma.job.update = async () => { writes++; };
  prisma.$transaction = async operations => Promise.all(operations);
});
test('unavailable sources preserve saved jobs and release the scan lease', async () => {
  sources.collectJobs = async () => ({ jobs: [], successful: 0, warnings: [] });
  await assert.rejects(() => runJobScan('owner'), error => error.status === 502);
  assert.equal(writes, 0); assert.equal(released, true); assert.equal(history[0].status, 'failed');
});
test('repeat scans refresh an existing match without counting it as new', async () => {
  const url = 'https://example.com/vacancy';
  sources.collectJobs = async () => ({ jobs: [{ title: 'Medical Laboratory Scientist', company: 'Lab', loc: 'Lagos', url, desc: 'Laboratory work', source: 'Test' }], successful: 1, warnings: [] });
  prisma.job.findMany = async () => [{ id: 'existing', url, applied: true, status: 'applied' }];
  prisma.job.update = async ({ data }) => { writes++; assert.equal(data.status, undefined); };
  const result = await runJobScan('owner');
  assert.equal(result.success, true); assert.equal(writes, 1);
  assert.equal(history[0].matches, 0); assert.equal(history[0].status, 'run only'); assert.equal(released, true);
});
test('a concurrent scan is refused before reading job sources', async () => {
  prisma.user.updateMany = async () => ({ count: 0 });
  sources.collectJobs = async () => { throw new Error('Sources must not be called'); };
  await assert.rejects(() => runJobScan('owner'), error => error.status === 409);
  assert.equal(writes, 0);
});
