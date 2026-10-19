const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/lib/stage-gates.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const gateModule = { exports: {} };
new Function('module', 'exports', compiled)(gateModule, gateModule.exports);
const { verifyStageTransition } = gateModule.exports;

test('backward movement and staying in same stage is always permitted', () => {
  const result = verifyStageTransition({
    targetStageIndex: 1,
    currentStageIndex: 2,
    documents: [],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, true);
  assert.equal(result.gateIndex, 2);
});

test('production mode blocks client-side gate progression without server transaction', () => {
  const result = verifyStageTransition({
    targetStageIndex: 2,
    currentStageIndex: 1,
    documents: [{ part: 'HLPL/F/MKT/01', title: 'Contract Review', lifecycle: 'Approved' }],
    records: [],
    isDemo: false,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.mode, 'production_enforced');
  assert.match(result.reason, /verified authenticated server contract/);
});

test('Stage 2 Feasibility Freeze blocks advancing to Stage 3 when Contract Review is missing', () => {
  const result = verifyStageTransition({
    targetStageIndex: 2,
    currentStageIndex: 1,
    documents: [],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.gateIndex, 2);
  assert.equal(result.gateName, 'Stage 2 Multi-Department Feasibility Freeze');
  assert.deepEqual(result.missingDocuments, ['HLPL/F/MKT/01']);
  assert.match(result.reason, /HLPL\/F\/MKT\/01/);
});

test('Stage 2 Feasibility Freeze allows advancing to Stage 3 when Contract Review is approved', () => {
  const result = verifyStageTransition({
    targetStageIndex: 2,
    currentStageIndex: 1,
    documents: [{ part: 'HLPL/F/MKT/01', title: 'Contract Review Record', lifecycle: 'Approved' }],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, true);
});

test('Stage 3 Requirements Baseline Freeze blocks advancing to Stage 4 when requirements are missing', () => {
  const result = verifyStageTransition({
    targetStageIndex: 3,
    currentStageIndex: 2,
    documents: [{ part: 'HLPL/F/MKT/01', title: 'Contract Review Record', lifecycle: 'Approved' }],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.gateIndex, 3);
  assert.equal(result.gateName, 'Stage 3 Requirements Baseline Freeze');
  assert.ok(result.missingDocuments.length > 0);
});

test('Stage 3 Requirements Baseline Freeze allows advancing when PRS and QUO are approved', () => {
  const result = verifyStageTransition({
    targetStageIndex: 3,
    currentStageIndex: 2,
    documents: [
      { part: 'HLPL/F/MKT/01', title: 'Contract Review Record', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-EHW-PRS-01', title: 'Product Requirement Spec', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-SAL-QUO-01', title: 'Commercial Quotation', lifecycle: 'Approved' },
    ],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, true);
});

test('Stage 4 Hardware Schematic Prerequisite blocks advancing to Stage 5 without schematic', () => {
  const result = verifyStageTransition({
    targetStageIndex: 4,
    currentStageIndex: 3,
    documents: [
      { part: 'HLPL/F/MKT/01', title: 'Contract Review Record', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-EHW-PRS-01', title: 'Product Requirement Spec', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-SAL-QUO-01', title: 'Commercial Quotation', lifecycle: 'Approved' },
    ],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.gateIndex, 4);
  assert.equal(result.gateName, 'Stage 4 Hardware Schematic Prerequisite');
  assert.deepEqual(result.missingDocuments, ['EHW-SCH-01']);
});

test('Stage 4 Hardware Schematic Prerequisite allows advancing when schematic is approved', () => {
  const result = verifyStageTransition({
    targetStageIndex: 4,
    currentStageIndex: 3,
    documents: [
      { part: 'HLPL/F/MKT/01', title: 'Contract Review Record', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-EHW-PRS-01', title: 'Product Requirement Spec', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-SAL-QUO-01', title: 'Commercial Quotation', lifecycle: 'Approved' },
      { part: 'HLPL-SLCT-EHW-SCH-01', title: 'Hardware Schematics', lifecycle: 'Approved' },
    ],
    records: [],
    isDemo: true,
  });
  assert.equal(result.allowed, true);
});
