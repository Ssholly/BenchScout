require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { needsHomeLanding } = require('../lib/home-landing.ts');
test('first visits start at Home, including dashboard and deep app links', () => {
  for (const path of ['/', '/matches', '/settings', '/employer']) assert.equal(needsHomeLanding(path, false), true);
  assert.equal(needsHomeLanding('/home', false), false);
});
test('returning visitors retain their destination and verification/recovery links still work', () => {
  for (const path of ['/', '/matches', '/employer']) assert.equal(needsHomeLanding(path, true), false);
  for (const path of ['/verify', '/reset-password', '/reset', '/admin', '/admin/reviews']) assert.equal(needsHomeLanding(path, false), false);
});
