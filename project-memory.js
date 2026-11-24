'use strict';

const ALLOWED_TYPES = new Set([
  'character', 'relationship', 'event', 'fact',
  'knowledge-boundary', 'open-item'
]);

function validateRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError('record must be an object');
  }
  if (typeof record.projectId !== 'string' || !record.projectId.trim()) {
    throw new TypeError('projectId is required');
  }
  if (typeof record.id !== 'string' || !record.id.trim()) {
    throw new TypeError('id is required');
  }
  if (!ALLOWED_TYPES.has(record.type)) {
    throw new TypeError('unsupported record type');
  }
  if (!Object.hasOwn(record, 'content')) {
    throw new TypeError('content is required');
  }
  return {
    projectId: record.projectId.trim(),
    id: record.id.trim(),
    type: record.type,
    content: structuredClone(record.content),
    createdAt: record.createdAt || new Date().toISOString()
  };
}

function createMemoryStore() {
  const byProject = new Map();

  return Object.freeze({
    add(input) {
      const record = validateRecord(input);
      let bucket = byProject.get(record.projectId);
      if (!bucket) {
        bucket = new Map();
        byProject.set(record.projectId, bucket);
      }
      if (bucket.has(record.id)) {
        throw new Error('record id already exists in this project');
      }
      bucket.set(record.id, record);
      return structuredClone(record);
    },

    getProjectContext(projectId, options = {}) {
      if (typeof projectId !== 'string' || !projectId.trim()) {
        throw new TypeError('projectId is required');
      }
      const bucket = byProject.get(projectId.trim());
      if (!bucket) return [];
      const types = options.types ? new Set(options.types) : null;
      return [...bucket.values()]
        .filter(record => !types || types.has(record.type))
        .map(record => structuredClone(record));
    },

    get(projectId, id) {
      const record = byProject.get(projectId)?.get(id);
      return record ? structuredClone(record) : null;
    },

    count(projectId) {
      return byProject.get(projectId)?.size || 0;
    }
  });
}

module.exports = { createMemoryStore, validateRecord };
