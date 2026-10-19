const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/portal-store.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const store = { exports: {} };
new Function('module', 'exports', compiled)(store, store.exports);
const { commitLatestState, patchRecord } = store.exports;

function loadSource(name) {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/' + name + '.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  new Function('module', 'exports', 'require', compiled)(loaded, loaded.exports, imported => imported.startsWith('./') ? loadSource(imported.slice(2)) : require(imported));
  return loaded.exports;
}

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

test('approval authority is rechecked against the current pending record', () => {
  const { assertApprovalDecision } = loadSource('approval-workflow');
  const approval = { id: 'request', outcome: 'Pending', department: 'EHW', approverAuthority: 'QA' };
  assert.doesNotThrow(() => assertApprovalDecision(approval, { kind: 'lead', departmentId: 'qa' }));
  assert.throws(() => assertApprovalDecision(approval, { kind: 'lead', departmentId: 'ehw' }), /designated approver/);
  assert.throws(() => assertApprovalDecision({ ...approval, outcome: 'Approved' }, { kind: 'admin' }), /already been decided/);
  assert.throws(() => assertApprovalDecision(undefined, { kind: 'admin' }), /no longer exists/);
});

test('two concurrent decisions cannot overwrite the first saved outcome', async () => {
  const { assertApprovalDecision } = loadSource('approval-workflow');
  let saved = { id: 'request', outcome: 'Pending', department: 'EHW', approverAuthority: 'QA' };
  let queue = Promise.resolve();
  const lock = commit => { const result = queue.then(commit); queue = result.then(() => undefined, () => undefined); return result; };
  const decide = outcome => commitLatestState(() => saved, next => { saved = next; }, current => { assertApprovalDecision(current, { kind: 'lead', departmentId: 'qa' }); return { ...current, outcome }; }, lock);
  const results = await Promise.allSettled([decide('Approved'), decide('Rejected')]);
  assert.equal(saved.outcome, 'Approved');
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].status, 'rejected');
});

test('business due dates use the India calendar across the UTC midnight boundary', () => {
  const { businessDate } = loadSource('business-date');
  assert.equal(businessDate(new Date('2026-10-18T20:00:00Z')), '2026-10-19');
  assert.equal(businessDate(new Date('2026-10-18T17:00:00Z')), '2026-10-18');
});

 test('task lanes are exclusive: today/progress, review, backlog and completion cannot duplicate a task', () => {
  const { taskLane } = loadSource('task-board');
  const today = '2026-10-19';
  const task = (status, fields = {}) => ({ status, fields });
  assert.equal(taskLane(task('Open', {dueDate: today}), today), 'today');
  assert.equal(taskLane(task('Open', {workStatus: 'In progress'}), today), 'today');
  assert.equal(taskLane(task('Open', {stage: 'In progress'}), today), 'today');
  assert.equal(taskLane(task('Open', {dueDate: '2026-10-20'}), today), 'todo');
  assert.equal(taskLane(task('Draft'), today), 'todo');
  assert.equal(taskLane(task('In review', {dueDate: today, workStatus: 'In progress'}), today), 'review');
  for (const status of ['Approved', 'Released']) assert.equal(taskLane(task(status, {dueDate: today, workStatus: 'In progress'}), today), 'completed');
});
