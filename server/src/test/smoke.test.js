import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

test('FlowDesk Backend Health Smoke Test', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  await t.test('GET /api returns 200 and API metadata', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.name, 'FlowDesk API');
    assert.equal(data.status, 'healthy');
  });

  await t.test('GET /api/health returns operational status and database state', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.status, 'operational');
    assert.ok(data.database);
  });

  await t.test('GET non-existent route returns standard 404 AppError JSON', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/non-existent-route-xyz`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Cannot find route/);
  });

  // Cleanly close server
  await new Promise((resolve) => server.close(resolve));
});

