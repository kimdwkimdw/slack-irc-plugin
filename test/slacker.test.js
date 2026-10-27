const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Slacker } = require('../lib/slacker');

test('Slack transport keeps the token in the POST body and refuses redirects', async (t) => {
    const args = { channel: '#test', text: 'a & b' };
    t.mock.method(global, 'fetch', async (url, options) => {
        assert.equal(url, 'https://slack.com/api/chat.postMessage');
        assert.equal(options.method, 'POST');
        assert.equal(options.redirect, 'error');
        assert.ok(options.signal instanceof AbortSignal);
        assert.equal(options.body.get('token'), 'test-token');
        assert.equal(options.body.get('text'), 'a & b');
        return { ok: true, json: async () => ({ ok: true }) };
    });
    await new Slacker({ token: 'test-token' }).send('chat.postMessage', args);
    assert.deepEqual(args, { channel: '#test', text: 'a & b' });
});

test('Slack and network failures are handled without unhandled rejections', async (t) => {
    const errors = [];
    t.mock.method(console, 'log', (...args) => errors.push(args));
    const fetch = t.mock.method(global, 'fetch', async () => ({
        ok: false, status: 429, json: async () => ({ ok: false, error: 'ratelimited' })
    }));
    const client = new Slacker({ token: 'test-token' });
    await client.send('chat.postMessage');
    fetch.mock.mockImplementation(async () => { throw new Error('network failed'); });
    await client.send('chat.postMessage');
    assert.deepEqual(errors, [['Error:', 'ratelimited'], ['Error:', 'network failed']]);
});
