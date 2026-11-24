'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStore, validateRecord } = require('./project-memory');

test('requires project scope and valid type', () => {
  assert.throws(() => validateRecord({ id: 'x', type: 'fact', content: {} }), /projectId/);
  assert.throws(() => validateRecord({
    projectId: 'p', id: 'x', type: 'bad', content: {}
  }), /unsupported record type/);
});

test('isolates records by project', () => {
  const store = createMemoryStore();
  store.add({ projectId: 'alpha', id: 'a1', type: 'fact', content: { value: 1 } });
  store.add({ projectId: 'beta', id: 'b1', type: 'fact', content: { value: 2 } });
  assert.deepEqual(store.getProjectContext('alpha').map(x => x.id), ['a1']);
  assert.deepEqual(store.getProjectContext('beta').map(x => x.id), ['b1']);
  assert.deepEqual(store.getProjectContext('missing'), []);
});

test('returns defensive copies', () => {
  const store = createMemoryStore();
  store.add({ projectId: 'p', id: 'c1', type: 'character', content: { name: 'A' } });
  const result = store.get('p', 'c1');
  result.content.name = 'changed';
  assert.equal(store.get('p', 'c1').content.name, 'A');
});

test('rejects duplicate ids within a project', () => {
  const store = createMemoryStore();
  const record = { projectId: 'p', id: 'same', type: 'event', content: {} };
  store.add(record);
  assert.throws(() => store.add(record), /already exists/);
});

test('filters context by record type', () => {
  const store = createMemoryStore();
  store.add({ projectId: 'p', id: 'c', type: 'character', content: {} });
  store.add({ projectId: 'p', id: 'e', type: 'event', content: {} });
  assert.deepEqual(store.getProjectContext('p', { types: ['event'] }).map(x => x.id), ['e']);
});
