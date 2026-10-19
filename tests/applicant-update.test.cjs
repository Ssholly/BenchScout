require('./register.cjs');
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { updateApplicant } = require('../lib/applicant-update.ts');
const originalFetch = global.fetch;
after(() => { global.fetch = originalFetch; });

test('employer decisions reject HTTP failures and malformed responses instead of reporting success', async () => {
  for (const response of [Response.json({ error: 'Company review required' }, { status: 403 }), Response.json({ success: false }), new Response('Unavailable', { status: 503 }), Response.json({ success: true, application: { id: 'other' } })]) {
    global.fetch = async () => response;
    await assert.rejects(() => updateApplicant({ applicationId: 'mine', status: 'rejected' }));
  }
});

test('a confirmed interview returns actual server fields and email delivery separately', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, '/api/jobs/applicants'); assert.equal(options.method, 'PATCH');
    assert.equal(JSON.parse(options.body).applicationId, 'mine');
    return Response.json({ success: true, application: { id: 'mine', status: 'shortlisted', interviewDate: '2030-01-10' }, emailDelivered: false });
  };
  const result = await updateApplicant({ applicationId: 'mine', status: 'shortlisted' });
  assert.equal(result.application.status, 'shortlisted'); assert.equal(result.emailDelivered, false);
});
