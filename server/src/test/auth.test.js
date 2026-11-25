import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { generateAccessToken, verifyAccessToken } from '../utils/token.js';

test('FlowDesk Phase 2: Authentication & Token Logic', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  await t.test('JWT token generation and verification roundtrip', () => {
    const payload = { userId: 'user123', email: 'test@flowdesk.app', role: 'OWNER' };
    const token = generateAccessToken(payload);
    assert.ok(token);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.userId, 'user123');
    assert.equal(decoded.email, 'test@flowdesk.app');
    assert.equal(decoded.role, 'OWNER');
  });

  await t.test('POST /api/auth/register fails with 422 if data violates schema', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: '123' }), // Missing name, bad password
    });

    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(Array.isArray(data.errors));
    assert.ok(data.errors.some((e) => e.field === 'name'));
  });

  await t.test('GET /api/auth/me returns 401 when token is missing', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /not logged in/i);
  });

  await t.test('GET /api/auth/me returns 401 when token is malformed', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' },
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Gracefully close test server
  await new Promise((resolve) => server.close(resolve));
});

