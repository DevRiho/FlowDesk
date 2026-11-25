import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createClientSchema,
  createProjectSchema,
  createTaskSchema,
} from '../validators/business.validators.js';

test('FlowDesk Phase 4: Business Schemas & Rules Tests', async (t) => {
  await t.test('createClientSchema validates required email and company name', () => {
    const invalid = createClientSchema.safeParse({ name: 'Bob', email: 'not-an-email' });
    assert.equal(invalid.success, false);

    const valid = createClientSchema.safeParse({
      name: 'Bob Vance',
      email: 'bob@vancerefrigeration.com',
      company: 'Vance Refrigeration',
    });
    assert.equal(valid.success, true);
    assert.equal(valid.data.status, 'ACTIVE');
  });

  await t.test('createProjectSchema validates budget, priority, and deadline', () => {
    const invalid = createProjectSchema.safeParse({
      title: 'App Build',
      client: '123',
      budget: -500, // Negative budget should fail
    });
    assert.equal(invalid.success, false);

    const valid = createProjectSchema.safeParse({
      title: 'Enterprise CRM Migration',
      client: '65e012345678901234567890',
      deadline: '2026-12-31',
      budget: 15000,
      priority: 'HIGH',
    });
    assert.equal(valid.success, true);
    assert.equal(valid.data.priority, 'HIGH');
  });

  await t.test('createTaskSchema assigns default status to TODO', () => {
    const valid = createTaskSchema.safeParse({
      project: '65e012345678901234567890',
      title: 'Implement OAuth callback',
    });
    assert.equal(valid.success, true);
    assert.equal(valid.data.status, 'TODO');
    assert.equal(valid.data.priority, 'MEDIUM');
  });
});

