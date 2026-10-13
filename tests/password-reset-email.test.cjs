require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { passwordResetEmail } = require('../lib/password-reset-email.ts');

test('reset email embeds the PNG logo and preserves the complete role-specific recovery URL', async () => {
  const url='https://bench-scout.vercel.app/reset-password?token=preview&email=test%40example.com&role=employer';
  const content=await passwordResetEmail(url);
  assert.equal(content.images.length,1);
  assert.equal(content.images[0].contentId,'benchscout-logo');
  assert.equal(content.images[0].content.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.match(content.html,/src="cid:benchscout-logo"/);
  const href=content.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');
  assert.equal(href,url);assert.ok(content.text.includes(url));
  assert.match(content.text,/one hour/);assert.match(content.text,/used once/);
});
