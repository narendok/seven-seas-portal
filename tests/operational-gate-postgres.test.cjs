const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const root = path.resolve(__dirname, '..');
const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const user=uuid(1), org=uuid(2), dept=uuid(3), project=uuid(4), other=uuid(5), evidence=uuid(6), doc=uuid(7);

test('API accepts exact approval identities and rejects legacy evidence claims', () => {
  const source=fs.readFileSync(path.join(root,'src/lib/operational-gate.schema.ts'),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const module={exports:{}};
  new Function('module','exports','require',compiled)(module,module.exports,require);
  const schema=module.exports.stageGateInputSchema;
  const payload={recordId:project,targetStage:'Stage 3',evidenceManifest:{deliverables:[{document_id:doc,revision:'02',approval_id:uuid(20)}],naRationale:{'SW-SRS':{approval_id:uuid(21)}}}};
  assert.equal(schema.parse(payload).evidenceManifest.deliverables[0].revision,'02');
  for (const bad of ['Stage 10','anything','Stage 3 ignored']) assert.equal(schema.safeParse({...payload,targetStage:bad}).success,false);
  for (const bad of ['contract-review',{record_id:evidence,revision:'01'},{document_id:doc,record_id:evidence,revision:'01',approval_id:uuid(20)}]) {
    assert.equal(schema.safeParse({...payload,evidenceManifest:{deliverables:[bad]}}).success,false);
  }
  assert.equal(schema.safeParse({...payload,evidenceManifest:{naRationale:{'SW-SRS':'not applicable'}}}).success,false);
});

test('real PostgreSQL migrations enforce revision approvals and atomic stage RPC', async t => {
  const db=new PGlite();
  t.after(()=>db.close());
  // Only Supabase platform services are fixtures; all application tables, policies,
  // triggers and gate functions below come directly from repository migrations.
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA public,auth TO authenticated,anon,service_role;
    CREATE SCHEMA storage; CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text);
    CREATE PUBLICATION supabase_realtime;`);
  const migrations=[
    '20260927075123_ac4fb50c-cb14-4750-a34f-24a69522d4b0.sql',
    '20260927075232_f91de181-c465-45aa-948c-2fd7979633e6.sql',
    '20260927090641_a22d2778-36cf-4d5a-9317-87ec60e24b1e.sql',
    '20260927171219_adbe39cb-1238-47c9-ba7c-69ad4ac4dc2d.sql',
    '20261020010000_operational_stage_gate_contract.sql',
    '20261020014346_bind_stage_gate_approval_revisions.sql',
  ];
  for(const name of migrations) await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',name),'utf8'));
  await db.query(`INSERT INTO auth.users VALUES ($1);`,[user]);
  await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`,[user]);
  await db.query(`INSERT INTO organizations(id,name,main_location,created_by) VALUES ($1,'Isolated SQL test','Local',$2)`,[org,user]);
  const member=(await db.query('SELECT id FROM organization_members WHERE user_id=$1',[user])).rows[0].id;
  await db.query(`INSERT INTO departments(id,organization_id,name,department_type,code,lead_member_id) VALUES ($1,$2,'Hardware','engineering','EHW',$3)`,[dept,org,member]);
  for(const [id,title,type] of [[project,'Project A','Project'],[other,'Project B','Project'],[evidence,'Contract Review','Contract Review']]) {
    await db.query(`INSERT INTO operational_records(id,organization_id,department_id,area,record_type,reference,title,status,stage,fields,created_by,updated_by)
      VALUES ($1,$2,$3,'EHW',$4,$1::uuid::text,$5,'approved','Stage 2','{"revision":"01"}',$6,$6)`,[id,org,dept,type,title,user]);
  }
  await db.query(`INSERT INTO record_links(organization_id,source_record_id,target_record_id,relationship,created_by) VALUES ($1,$2,$3,'deliverable',$4)`,[org,project,evidence,user]);
  await db.query(`INSERT INTO documents(id,organization_id,record_id,title,document_type,reference_url,created_by) VALUES ($1,$2,$3,'Contract Review','Contract Review','private',$4)`,[doc,org,evidence,user]);
  async function file(revision,checksum) {
    await db.query(`INSERT INTO controlled_document_files(organization_id,department_id,document_id,revision,storage_path,original_name,content_type,size_bytes,checksum,uploaded_by,uploaded_at)
      VALUES ($1,$2,$3,$4,$4,'contract.pdf','application/pdf',10,$5,$6,now()-interval '1 minute')`,[org,dept,doc,revision,checksum,user]);
  }
  async function approval(id,kind,revision,na=false,requirement=null) {
    return db.query(`INSERT INTO approvals(id,organization_id,department_id,record_id,title,outcome,approver_id,created_by,decided_by,evidence_record_id,evidence_document_id,evidence_revision,evidence_is_na,evidence_requirement)
      VALUES ($1,$2,$3,$4,'Contract Review approval','approved',$5,$6,$6,$7,$8,$9,$10,$11)`,[id,org,dept,evidence,member,user,kind==='record'?evidence:null,kind==='document'?doc:null,revision,na,requirement]);
  }
  async function gate(target='Stage 3',manifest={},record=project) {
    await db.exec('SET ROLE authenticated');
    try{return (await db.query('SELECT verify_and_advance_stage_gate($1,$2,$3::jsonb) AS result',[record,target,JSON.stringify(manifest)])).rows[0].result;}
    finally{await db.exec('RESET ROLE');}
  }
  async function verify(manifest=[],na={},allow=false,pattern='Contract Review') {
    // The internal helper is deliberately not remotely callable by authenticated.
    return (await db.query('SELECT verify_approved_stage_deliverable($1,$2,$3,$4::jsonb,$5::jsonb,$6) AS ok',[org,project,pattern,JSON.stringify(manifest),JSON.stringify(na),allow])).rows[0].ok;
  }
  await t.test('unbound legacy approval cannot satisfy a freeze; denial leaves no writes',async()=>{
    await approval(uuid(10),null,null);
    await assert.rejects(gate(),/GATE_FREEZE_VIOLATION/);
    assert.equal((await db.query('SELECT stage FROM operational_records WHERE id=$1',[project])).rows[0].stage,'Stage 2');
    assert.equal((await db.query('SELECT count(*)::integer AS n FROM audit_events')).rows[0].n,0);
  });
  await file('01','a'.repeat(64));
  await approval(uuid(11),'document','01');
  await t.test('server binds actual checksum and authenticated signer',async()=>{
    assert.equal((await db.query('SELECT evidence_checksum FROM approvals WHERE id=$1',[uuid(11)])).rows[0].evidence_checksum,'a'.repeat(64));
    await assert.rejects(db.query('UPDATE approvals SET evidence_revision=$1 WHERE id=$2',['02',uuid(11)]),/APPROVED_EVIDENCE_IMMUTABLE/);
    await db.query(`SELECT set_config('request.jwt.claim.sub','',false)`);
    await assert.rejects(approval(uuid(12),'document','01'),/AUTH_REQUIRED/);
    await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`,[user]);
  });
  await t.test('same-organization unrelated project cannot reuse evidence',async()=>{
    await assert.rejects(gate('Stage 3',{},other),/GATE_FREEZE_VIOLATION/);
  });
  await db.query('UPDATE controlled_document_files SET superseded_at=now() WHERE document_id=$1',[doc]);
  await file('02','b'.repeat(64));
  await t.test('old signed revision does not approve a new file',async()=>{
    await assert.rejects(gate(),/GATE_FREEZE_VIOLATION/);
  });
  await approval(uuid(13),'document','02');
  await t.test('explicit stale revision or approval cannot fall back to another candidate',async()=>{
    for(const item of [{document_id:doc,revision:'01',approval_id:uuid(11)},{document_id:doc,revision:'02',approval_id:uuid(11)}]) {
      await assert.rejects(gate('Stage 3',{deliverables:[item]}),/GATE_FREEZE_VIOLATION/);
    }
    await db.query('UPDATE controlled_document_files SET checksum=$1 WHERE revision=$2',['c'.repeat(64),'02']);
    assert.equal(await verify(),false);
    await db.query('UPDATE controlled_document_files SET checksum=$1 WHERE revision=$2',['b'.repeat(64),'02']);
  });
  await t.test('record approvals bind content as well as revision',async()=>{
    await approval(uuid(14),'record','01');
    const item={record_id:evidence,revision:'01',approval_id:uuid(14)};
    assert.equal(await verify([item]),true);
    await db.query(`UPDATE operational_records SET fields=fields || '{"changed":true}'::jsonb WHERE id=$1`,[evidence]);
    assert.equal(await verify([item]),false);
  });
  await t.test('N/A requires an exact requirement-specific bound approval',async()=>{
    await approval(uuid(15),'record','01',true,'SW-SRS');
    assert.equal(await verify([],{'SW-SRS':{approval_id:uuid(15)}},true,'SW-SRS'),true);
    assert.equal(await verify([],{'FW-FRS':{approval_id:uuid(15)}},true,'FW-FRS'),false);
    assert.equal(await verify([],{'SW-SRS':{approval_id:uuid(10)}},true,'SW-SRS'),false);
    assert.equal(await verify([],{'SW-SRS':{approval_id:uuid(15)}},false,'SW-SRS'),false);
  });
  await t.test('invalid stage and unauthenticated calls fail closed',async()=>{
    await assert.rejects(gate('Stage 10'),/INVALID_TARGET_STAGE/);
    await assert.rejects(gate(null),/INVALID_TARGET_STAGE/);
    await db.query(`SELECT set_config('request.jwt.claim.sub','',false)`);
    await assert.rejects(gate(),/AUTH_REQUIRED/);
    await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`,[user]);
  });
  await t.test('checked RPC commits stage, approval and user-attributed audit atomically and retries once',async()=>{
    const manifest={deliverables:[{document_id:doc,revision:'02',approval_id:uuid(13)}]};
    const result=await gate('Stage 3',manifest);
    assert.equal(result.success,true);
    assert.equal(result.idempotent,false);
    const audit=(await db.query('SELECT actor_id FROM audit_events WHERE id=$1',[result.audit_id])).rows[0];
    assert.equal(audit.actor_id,user);
    assert.equal((await gate('Stage 3',manifest)).idempotent,true);
    assert.equal((await gate('3',manifest)).idempotent,true);
    assert.equal((await db.query('SELECT count(*)::integer AS n FROM audit_events')).rows[0].n,1);
    await db.exec('SET ROLE authenticated');
    try{await assert.rejects(db.query(`SELECT verify_approved_stage_deliverable($1,$2,'Contract Review','[]','{}',false)`,[org,project]),/permission denied/);}
    finally{await db.exec('RESET ROLE');}
  });
});
