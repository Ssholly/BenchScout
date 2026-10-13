require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signOutToHome } = require('../lib/client-logout.ts');

test('logout revokes the session before clearing account state and replacing the page with Home', async () => {
    const originals = { fetch: global.fetch, localStorage: global.localStorage, window: global.window };
    const storage = { benchscout_identity: 'employer:apex', benchscout_active_employer: 'apex', labpro_active_user: 'old', theme: 'light' };
    Object.defineProperty(storage, 'removeItem', { value: key => { delete storage[key]; } });
    let destination;
    global.localStorage = storage;
    global.window = { location: { replace: path => { destination = path; assert.deepEqual(Object.keys(storage), ['theme']); } } };
    try {
        global.fetch = async (url, options) => {
            assert.equal(url, '/api/auth/logout'); assert.equal(options.method, 'POST');
            assert.equal(storage.benchscout_active_employer, 'apex');
            return new Response(null, { status: 503 });
        };
        assert.equal(await signOutToHome(), false);
        assert.equal(destination, undefined);
        assert.equal(storage.benchscout_active_employer, 'apex');
        global.fetch = async () => { throw new Error('offline'); };
        assert.equal(await signOutToHome(), false);
        assert.equal(destination, undefined);
        global.fetch = async () => new Response(null, { status: 200 });
        assert.equal(await signOutToHome(), true);
        assert.equal(destination, '/home');
    } finally {
        for (const [key, value] of Object.entries(originals)) {
            if (value === undefined) delete global[key]; else global[key] = value;
        }
    }
});
