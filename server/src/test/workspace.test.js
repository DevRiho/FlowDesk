import test from 'node:test';
import assert from 'node:assert/strict';
import { requireWorkspaceRole } from '../middleware/workspace.middleware.js';
import { createWorkspaceSchema } from '../validators/workspace.validators.js';

test('FlowDesk Phase 3: Workspace & RBAC Scoping Logic', async (t) => {
  await t.test('createWorkspaceSchema rejects empty workspace name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '' });
    assert.equal(result.success, false);
    assert.ok(result.error.errors.some((e) => e.path.includes('name')));
  });

  await t.test('createWorkspaceSchema accepts valid workspace parameters', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'Acme Digital Agency',
      currency: 'USD',
      timezone: 'America/New_York',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.name, 'Acme Digital Agency');
  });

  await t.test('requireWorkspaceRole allows matching role to pass through', (t, done) => {
    const middleware = requireWorkspaceRole('OWNER', 'ADMIN');
    const req = { membership: { role: 'OWNER' } };
    const res = {};

    middleware(req, res, (err) => {
      assert.equal(err, undefined);
      done();
    });
  });

  await t.test('requireWorkspaceRole rejects insufficient role with 403 AppError', (t, done) => {
    const middleware = requireWorkspaceRole('OWNER', 'ADMIN');
    const req = { membership: { role: 'MEMBER' } };
    const res = {};

    middleware(req, res, (err) => {
      assert.ok(err);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /Permission denied/);
      done();
    });
  });
});
