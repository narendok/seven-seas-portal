const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/lib/document-draft.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const draftModule = { exports: {} };
new Function('module', 'exports', compiled)(draftModule, draftModule.exports);
const { buildDocumentDraft } = draftModule.exports;

test('different document types use different sections without hardware boilerplate in commercial or HR records', () => {
  const invoice = buildDocumentDraft('Commercial Tax Invoice', 'HLPL-SLCT-FIN-INV-01');
  const skills = buildDocumentDraft('Annual Skill Matrix', 'HLPL/F/HR/03');
  const bom = buildDocumentDraft('Production BOM', 'HLPL-SLCT-EHW-BOM-01');
  assert.equal(invoice.type, 'INV');
  assert.equal(skills.type, 'SKILL');
  assert.equal(bom.type, 'BOM');
  assert.notDeepEqual(invoice.sections, bom.sections);
  for (const doc of [invoice, skills, bom]) {
    assert.doesNotMatch(JSON.stringify(doc), /STM32|4G LTE|APPROVED|DEMO signature|0-defect/);
    assert.ok(doc.sections.every(section => section.rows.every(row => row[1].startsWith('TBD'))));
  }
});

test('copy source values with provenance; project identification cannot supply invented technical results', () => {
  const source = { reference: 'INV-SOURCE', fields: { buyer: 'Selected buyer', quantity: '12' } };
  const project = { reference: 'PROJECT-B', fields: { quantity: '100', voltage: '24V' } };
  const draft = buildDocumentDraft('Tax Invoice', 'HLPL-B-FIN-INV-01', source, project);
  const rows = draft.sections.flatMap(section => section.rows);
  assert.deepEqual(rows.find(row => row[0] === 'buyer'), ['buyer', 'Selected buyer', 'INV-SOURCE']);
  assert.equal(rows.find(row => row[0] === 'quantity')[1], '12');
  const prs = buildDocumentDraft('Product Requirement Specification', 'HLPL-B-EHW-PRS-01', undefined, project);
  assert.ok(prs.sections.flatMap(section => section.rows).find(row => row[0] === 'voltage')[1].startsWith('TBD'));
});

test('unknown formats explicitly remain unsupported', () => {
  assert.equal(buildDocumentDraft('Unconfigured document', 'CUSTOM-123').supported, false);
});
