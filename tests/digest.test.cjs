require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildJobDigest } = require('../lib/digest.ts');
const { listingUrl } = require('../lib/listing-url.ts');
const job = { title: 'Scientist', company: 'Lab', loc: 'Lagos', score: 90, tier: 1, url: 'https://example.com/jobs/123?a=1&b=2' };
test('digest links are real anchors with escaped attributes and a plain-text fallback', () => {
  const digest = buildJobDigest([job], { isNew: true, appUrl: 'https://benchscout.example', date: new Date('2026-10-10T23:30:00Z') });
  assert.equal(digest.count, 1);
  assert.ok(digest.html.includes('href="https://example.com/jobs/123?a=1&amp;b=2"'));
  assert.ok(digest.html.includes('11 October 2026'));
  assert.ok(digest.html.includes('1 new listing to explore'));
  assert.ok(digest.html.includes('https://benchscout.example/matches'));
  assert.ok(digest.text.includes(job.url));
});
test('untrusted job text cannot introduce HTML or script links into an email', () => {
  const digest = buildJobDigest([{ ...job, title: '<img src=x onerror=alert(1)>', company: '"<script>' }, { ...job, url: 'javascript:alert(1)' }], { name: '<iframe>', appUrl: 'javascript:alert(1)' });
  assert.equal(digest.count, 1);
  assert.ok(digest.html.includes('&lt;img'));
  assert.ok(!digest.html.includes('<script>'));
  assert.ok(!digest.html.includes('<iframe>'));
  assert.ok(!digest.html.includes('javascript:'));
});
test('posting URLs never treat mailbox, mailto, internal paths or credentials as vacancies', () => {
  for (const url of ['mailto:hr@example.com', 'https://mail.google.com/mail/u/0/', 'https://outlook.live.com/mail/', '/matches/direct/123', 'https://user:secret@example.com/job', 'javascript:alert(1)', '#']) assert.equal(listingUrl(url), null);
  assert.equal(listingUrl(job.url), job.url);
  assert.equal(buildJobDigest([{...job, isDirectPost: true}]).count, 0);
});
