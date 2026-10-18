const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/portal-store.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const store = { exports: {} };
new Function('module', 'exports', compiled)(store, store.exports);
const { commitLatestState, patchRecord } = store.exports;

test('two queued tab edits read latest state instead of overwriting each other with stale snapshots', async () => {
  let saved = { tasks: [], approvals: [] };
  let queue = Promise.resolve();
  const lock = commit => { const result = queue.then(commit); queue = result.then(() => undefined, () => undefined); return result; };
  const taskTab = commitLatestState(() => saved, next => { saved = next; }, current => ({ ...current, tasks: [...current.tasks, 'task'] }), lock);
  const approvalTab = commitLatestState(() => saved, next => { saved = next; }, current => ({ ...current, approvals: [...current.approvals, 'approval'] }), lock);
  await Promise.all([taskTab, approvalTab]);
  assert.deepEqual(saved, { tasks: ['task'], approvals: ['approval'] });
});

test('reassignment preserves task project, due date and other structured fields', () => {
  const original = { id: 'task', fields: { assignee: 'First', projectId: 'PROJECT', dueDate: '2026-11-01', evidence: 'file' } };
  const changed = patchRecord(original, { fields: { assignee: 'Second' } });
  assert.deepEqual(changed.fields, { ...original.fields, assignee: 'Second' });
  assert.equal(original.fields.assignee, 'First');
});

test('a rejected transaction does not persist a partially changed record', async () => {
  let writes = 0;
  await assert.rejects(commitLatestState(() => ({ value: 1 }), () => { writes++; }, () => { throw new Error('Already decided'); }, async commit => commit()), /Already decided/);
  assert.equal(writes, 0);
});
