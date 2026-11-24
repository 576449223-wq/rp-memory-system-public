# RP Memory System

A project-scoped memory and continuity starter for roleplay.

## Public edition
This is a clean starter separate from the private RPMS repository. It excludes private archives, user-specific project data, internal deployment configuration, and historical review records. It is not a drop-in replacement for the private Runtime or Workbench.

## Requirements
Node.js 18 or later

## Run tests
`npm test`

## Example
```js
const { createMemoryStore } = require('./project-memory');
const memory = createMemoryStore();
memory.add({
  projectId: 'my-story',
  type: 'character',
  id: 'c1',
  content: { name: 'Example Character' }
});
const context = memory.getProjectContext('my-story');
```

A context request only returns records from the exact requested project. Never commit credentials, private archives, personal data, or production identifiers.
