const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/lib/portal-intake.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};
new Function('module','exports','require',compiled)(mod,mod.exports,require);
const {validateIntakeProject,salesEnquiryFromRecord}=mod.exports;
const project={id:'project-1',reference:'HLPL-OBDTEST-01',type:'Project'};
test('new intake requires explicit existing project and rejects unknown or archived identities',()=>{
 for(const code of ['', 'HLPL-AI4T-01','HLPL-UNKNOWN-01']) assert.throws(()=>validateIntakeProject([project],'Enquiry',code),/Select an existing project/);
 assert.equal(validateIntakeProject([project],'Enquiry',project.reference),project.reference);
 assert.throws(()=>validateIntakeProject([{...project,archived:true}],'Enquiry',project.reference));
});
test('project creation uses a unique canonical project code, including archived identities',()=>{
 assert.equal(validateIntakeProject([],'Project','HLPL-NEW-01'),'HLPL-NEW-01');
 assert.throws(()=>validateIntakeProject([project],'Project',project.reference),/already exists/);
 assert.throws(()=>validateIntakeProject([{...project,archived:true}],'Project',project.reference),/already exists/);
 assert.throws(()=>validateIntakeProject([],'Project','free text'),/unique project code/);
});
test('saved sales record maps to the same enquiry identity, scope and customer without sample data',()=>{
 const record={id:'enquiry-1',reference:'HLPL-OBDTEST-SAL-ENQ-01',type:'Enquiry',title:'Synthetic OEM enquiry',fields:{projectId:project.reference,customer:'Synthetic OEM',scope:'New OBD tracker'},createdAt:'2026-10-20',updatedAt:'2026-10-20'};
 const enquiry=salesEnquiryFromRecord(record,[]);
 assert.equal(enquiry.id,record.id);assert.equal(enquiry.reference,record.reference);
 assert.equal(enquiry.linkedProjectCode,project.reference);assert.equal(enquiry.scopeSummary,record.fields.scope);
 assert.equal(enquiry.customerName,'Synthetic OEM');assert.equal(enquiry.spocEmail,'');
 assert.deepEqual(enquiry.feasibilitySignedDepts,[]);assert.equal(enquiry.status,'Pending Enquiry');
});
