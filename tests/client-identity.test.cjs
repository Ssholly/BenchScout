require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setClientIdentity } = require('../lib/client-identity.ts');

test('switching roles clears previous account hints and invitations, while preserving unrelated settings', () => {
    const original = global.localStorage;
    const store = { benchscout_identity: 'employer:apex', benchscout_active_employer: 'apex', benchscout_invited_v2_apex: 'private', labpro_active_user: 'old', labpro_vault_old: 'private', theme: 'light' };
    Object.defineProperties(store, {
        getItem: { value: key => store[key] ?? null },
        setItem: { value: (key, value) => { store[key] = value; } },
        removeItem: { value: key => { delete store[key]; } },
    });
    global.localStorage = store;
    try {
        setClientIdentity('candidate', 'scientist');
        assert.deepEqual(Object.keys(store).sort(), ['benchscout_identity', 'theme']);
        assert.equal(store.benchscout_identity, 'candidate:scientist');
        store.labpro_career_phase = 'internship';
        setClientIdentity('candidate', 'scientist');
        assert.equal(store.labpro_career_phase, 'internship');
        setClientIdentity('employer', 'apex');
        assert.equal(store.labpro_career_phase, undefined);
        assert.equal(store.benchscout_identity, 'employer:apex');
    } finally {
        if (original === undefined) delete global.localStorage;
        else global.localStorage = original;
    }
});
