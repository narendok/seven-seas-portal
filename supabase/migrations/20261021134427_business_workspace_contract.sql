-- New business modules share authenticated membership and original project IDs.
-- No DEMO data is imported. Only guarded RPCs can access these tables.
CREATE TABLE public.business_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id),
 kind text NOT NULL CHECK(kind IN ('allocation','expense','ticket','profile','template','assignment','channel','message')),
 owner_id uuid REFERENCES public.organization_members(id), department_id uuid REFERENCES public.departments(id),
 project_id uuid REFERENCES public.operational_records(id), payload jsonb NOT NULL DEFAULT '{}',
 version integer NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX business_items_org_kind ON public.business_items(organization_id,kind);
CREATE INDEX business_items_owner ON public.business_items(organization_id,owner_id);
CREATE UNIQUE INDEX business_assignment_cycle ON public.business_items(organization_id,owner_id,(payload->>'templateId'),(payload->>'cycle')) WHERE kind='assignment';
CREATE UNIQUE INDEX business_profile_identity ON public.business_items(organization_id,owner_id) WHERE kind='profile';
CREATE TABLE private.business_requests(organization_id uuid NOT NULL,actor_id uuid NOT NULL,request_id uuid NOT NULL,signature text NOT NULL,result jsonb NOT NULL,PRIMARY KEY(organization_id,actor_id,request_id));
CREATE TABLE private.business_answers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,template_id uuid NOT NULL REFERENCES public.business_items(id),assignment_id uuid UNIQUE REFERENCES public.business_items(id),member_id uuid,answers jsonb NOT NULL,day date NOT NULL DEFAULT current_date,
 CHECK((assignment_id IS NULL)=(member_id IS NULL)));
CREATE TABLE private.business_votes(message_id uuid NOT NULL REFERENCES public.business_items(id),member_id uuid NOT NULL REFERENCES public.organization_members(id),choice integer NOT NULL,PRIMARY KEY(message_id,member_id));
ALTER TABLE public.business_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.business_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.business_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.business_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.business_items,private.business_requests,private.business_answers,private.business_votes FROM PUBLIC,anon,authenticated;

CREATE FUNCTION private.business_visible(p public.business_items,a jsonb) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE dept text:=a->>'department_code'; mid uuid:=(a->>'membership_id')::uuid; role text:=a->>'role';
BEGIN
 IF p.organization_id IS DISTINCT FROM (a->>'organization_id')::uuid THEN RETURN false; END IF;
 IF p.kind='ticket' THEN
  RETURN p.owner_id=mid OR role='admin' OR (role<>'viewer' AND dept='SIT') OR (role<>'viewer' AND p.payload->>'source'='Client' AND dept='SAL' AND (p.project_id IS NULL OR private.shared_test_record_visible(p.project_id)));
 END IF;
 IF role='viewer' THEN RETURN false; END IF;
 IF p.kind='allocation' THEN RETURN role='admin' OR (role='department_lead' AND (dept='FIN' OR p.department_id=private.shared_test_member_department(mid))); END IF;
 IF p.kind='expense' THEN RETURN p.owner_id=mid OR role='admin' OR (role='department_lead' AND (dept='FIN' OR p.department_id=private.shared_test_member_department(mid))); END IF;
 IF p.kind='profile' THEN RETURN p.owner_id=mid OR role='admin' OR (role='department_lead' AND dept IN ('HR','HROPS')); END IF;
 IF p.kind='assignment' THEN RETURN p.owner_id=mid OR role='admin' OR (role='department_lead' AND dept IN ('HR','HROPS')); END IF;
 IF p.kind='template' THEN RETURN role='admin' OR (role='department_lead' AND dept IN ('HR','HROPS')) OR EXISTS(SELECT 1 FROM business_items i WHERE i.kind='assignment' AND i.owner_id=mid AND i.organization_id=p.organization_id AND i.payload->>'templateId'=p.id::text); END IF;
 IF p.kind='channel' THEN RETURN p.payload->'memberIds' ? mid::text; END IF;
 IF p.kind='message' THEN RETURN EXISTS(SELECT 1 FROM business_items c WHERE c.kind='channel' AND c.organization_id=p.organization_id AND c.id=(p.payload->>'channelId')::uuid AND c.payload->'memberIds' ? mid::text); END IF;
 RETURN false;
END $$;
REVOKE ALL ON FUNCTION private.business_visible(public.business_items,jsonb) FROM PUBLIC,anon,authenticated;

-- Minimal recipient events; private payloads stay in their original authorized records.
CREATE TABLE private.business_notifications(
 organization_id uuid NOT NULL,recipient_id uuid NOT NULL REFERENCES public.organization_members(id),
 item_id uuid NOT NULL REFERENCES public.business_items(id),event text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(recipient_id,item_id,event)
);
ALTER TABLE private.business_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.business_notifications FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.business_notify(p_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE i business_items%ROWTYPE; recipient record; event text; channel business_items%ROWTYPE;
BEGIN
 SELECT * INTO i FROM business_items WHERE id=p_id;
 IF NOT FOUND THEN RETURN; END IF;
 event:=i.kind||':'||i.version::text;
 IF i.kind='message' THEN SELECT * INTO channel FROM business_items WHERE id=(i.payload->>'channelId')::uuid AND organization_id=i.organization_id AND kind='channel'; END IF;
 FOR recipient IN SELECT m.* FROM organization_members m WHERE m.organization_id=i.organization_id AND m.active AND (m.role<>'viewer' OR (i.kind='ticket' AND m.id=i.owner_id)) AND (
  (i.kind IN ('expense','assignment','ticket') AND m.id=i.owner_id) OR
  (i.kind='ticket' AND (m.role='admin' OR private.shared_test_member_department(m.id) IN (SELECT id FROM departments WHERE organization_id=i.organization_id AND code='SIT'))) OR
  (i.kind='expense' AND m.id<>i.owner_id AND (
   (i.payload->>'status'='Pending_Dept_Review' AND (m.role='admin' OR (m.role='department_lead' AND private.shared_test_member_department(m.id)=i.department_id))) OR
   (i.payload->>'status' IN ('Pending_Finance','Approved') AND (m.role='admin' OR (m.role='department_lead' AND private.shared_test_member_department(m.id) IN (SELECT id FROM departments WHERE organization_id=i.organization_id AND code='FIN')))) OR
   (i.payload->>'status'='Pending_Admin' AND m.role='admin'))) OR
  (i.kind='message' AND m.id<>i.owner_id AND channel.payload->'memberIds' ? m.id::text)
 ) LOOP
  INSERT INTO private.business_notifications(organization_id,recipient_id,item_id,event) VALUES(i.organization_id,recipient.id,i.id,event) ON CONFLICT DO NOTHING;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.business_notify(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION private.business_schedule(p_org uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE t business_items%ROWTYPE; member record; period integer; occurrence date; due date; cycles integer;
BEGIN
 FOR t IN SELECT * FROM business_items WHERE organization_id=p_org AND kind='template' AND COALESCE((payload->>'cadenceDays')::int,0)>0 LOOP
  period:=(t.payload->>'cadenceDays')::int;
  cycles:=floor((current_date-t.created_at::date)::numeric/period)::int;
  IF cycles<1 THEN CONTINUE; END IF;
  occurrence:=t.created_at::date+cycles*period;
  due:=(t.payload->>'dueDate')::date+cycles*period;
  FOR member IN SELECT m.* FROM organization_members m WHERE m.organization_id=p_org AND m.active AND m.role<>'viewer' AND t.payload->'audienceIds' ? m.id::text LOOP
   INSERT INTO business_items(organization_id,kind,owner_id,department_id,payload)
   VALUES(p_org,'assignment',member.id,private.shared_test_member_department(member.id),jsonb_build_object('templateId',t.id,'cycle',occurrence::text,'dueDate',due::text,'status','Pending'))
   ON CONFLICT DO NOTHING;
  END LOOP;
  PERFORM private.business_notify(id) FROM business_items WHERE organization_id=p_org AND kind='assignment' AND payload->>'templateId'=t.id::text AND payload->>'cycle'=occurrence::text;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.business_schedule(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.get_business_workspace() RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE a record; result jsonb; items jsonb;
BEGIN
 SELECT * INTO a FROM resolve_test_membership();
 IF auth.uid() IS NULL OR a.membership_id IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_MEMBERSHIP_REQUIRED'; END IF;
 PERFORM private.business_schedule(a.organization_id);
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',i.id,'kind',i.kind,'ownerId',i.owner_id,'departmentId',i.department_id,'projectId',i.project_id,'version',i.version,'data',
   CASE WHEN i.kind='ticket' AND a.role='viewer' THEN i.payload || jsonb_build_object('replies',COALESCE((SELECT jsonb_agg(r) FROM jsonb_array_elements(COALESCE(i.payload->'replies','[]')) r WHERE COALESCE((r->>'isInternalNote')::boolean,false)=false),'[]'::jsonb))
   WHEN i.kind='template' AND NOT(a.role='admin' OR (a.role='department_lead' AND a.department_code IN ('HR','HROPS'))) THEN i.payload || jsonb_build_object('quizQuestions',COALESCE((SELECT jsonb_agg(q-'correctOptionIndex') FROM jsonb_array_elements(COALESCE(i.payload->'quizQuestions','[]')) q),'[]'::jsonb))
   ELSE i.payload END) ORDER BY i.created_at),'[]') INTO items FROM business_items i WHERE private.business_visible(i,to_jsonb(a));
 RETURN jsonb_build_object('membership',to_jsonb(a),'items',items,'serverTime',now(),
 'members',CASE WHEN a.role<>'viewer' THEN COALESCE((SELECT jsonb_agg(jsonb_build_object('id',m.id,'name',m.display_name,'role',m.role,'departmentId',private.shared_test_member_department(m.id))) FROM organization_members m WHERE m.organization_id=a.organization_id AND m.active AND m.role<>'viewer'),'[]') ELSE '[]'::jsonb END,
 'departments',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',d.id,'code',d.code,'name',d.name)) FROM departments d WHERE d.organization_id=a.organization_id AND d.active),'[]'),
 'projects',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',r.id,'reference',r.reference,'title',r.title)) FROM operational_records r WHERE r.organization_id=a.organization_id AND r.record_type='Project' AND r.archived_at IS NULL AND private.shared_test_record_visible(r.id)),'[]'),
 'surveyResults',CASE WHEN a.role='admin' OR (a.role='department_lead' AND a.department_code IN ('HR','HROPS')) THEN COALESCE((SELECT jsonb_agg(x) FROM (SELECT template_id,count(*) AS response_count,CASE WHEN count(*)>=5 OR NOT COALESCE((t.payload->>'isAnonymous')::boolean,false) THEN jsonb_agg(b.answers) ELSE NULL END AS answers FROM private.business_answers b JOIN business_items t ON t.id=b.template_id WHERE b.organization_id=a.organization_id GROUP BY template_id,t.payload) x),'[]') ELSE '[]'::jsonb END,
 'notifications',COALESCE((SELECT jsonb_agg(jsonb_build_object('itemId',n.item_id,'kind',i.kind,'event',n.event,'at',n.created_at) ORDER BY n.created_at DESC) FROM private.business_notifications n JOIN business_items i ON i.id=n.item_id WHERE n.recipient_id=a.membership_id AND private.business_visible(i,to_jsonb(a))),'[]'),
 'votes',COALESCE((SELECT jsonb_agg(x) FROM (SELECT v.message_id,v.choice,count(*) AS total,bool_or(v.member_id=a.membership_id) AS my_vote FROM private.business_votes v JOIN business_items i ON i.id=v.message_id WHERE private.business_visible(i,to_jsonb(a)) GROUP BY v.message_id,v.choice) x),'[]'));
END $$;
REVOKE ALL ON FUNCTION public.get_business_workspace() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_business_workspace() TO authenticated;

CREATE FUNCTION public.mutate_business_workspace(p_action text,p_payload jsonb,p_request_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE a record; i business_items%ROWTYPE; allocation business_items%ROWTYPE; t business_items%ROWTYPE;
 org uuid; mid uuid; dept uuid; item_id uuid; project uuid; data jsonb; result jsonb; sig text; old_request record; member record;
 amount numeric; actual numeric; available numeric; next_state text; is_fin boolean; is_hr boolean; is_service boolean; q jsonb; answer jsonb; count_q integer; score numeric; cycle text;
BEGIN
 SELECT * INTO a FROM resolve_test_membership();
 IF auth.uid() IS NULL OR a.membership_id IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_MEMBERSHIP_REQUIRED'; END IF;
 IF p_request_id IS NULL OR p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR octet_length(p_payload::text)>131072 THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 org:=a.organization_id; mid:=a.membership_id;
 is_fin:=COALESCE(a.role='admin' OR (a.role='department_lead' AND a.department_code='FIN'),false);
 is_hr:=COALESCE(a.role='admin' OR (a.role='department_lead' AND a.department_code IN ('HR','HROPS')),false);
 is_service:=COALESCE(a.role='admin' OR (a.role<>'viewer' AND a.department_code='SIT'),false);
 -- One organization lock serializes budget reservations, retries and campaign occurrences.
 PERFORM 1 FROM organizations WHERE id=org FOR UPDATE;
 sig:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 SELECT * INTO old_request FROM private.business_requests WHERE organization_id=org AND actor_id=auth.uid() AND request_id=p_request_id;
 IF FOUND THEN IF old_request.signature<>sig THEN RAISE EXCEPTION 'RETRY_PAYLOAD_CHANGED'; END IF; RETURN old_request.result; END IF;
 data:=COALESCE(p_payload->'data','{}'); item_id:=NULLIF(p_payload->>'id','')::uuid;
 IF item_id IS NOT NULL THEN
  SELECT * INTO i FROM business_items WHERE id=item_id AND organization_id=org FOR UPDATE;
  IF NOT FOUND OR NOT COALESCE(private.business_visible(i,to_jsonb(a)),false) THEN RAISE EXCEPTION 'ITEM_UNAVAILABLE'; END IF;
  IF i.version IS DISTINCT FROM (p_payload->>'version')::int THEN RAISE EXCEPTION 'STALE_VERSION'; END IF;
 END IF;
 IF p_action='allocate' THEN
  IF NOT is_fin THEN RAISE EXCEPTION 'FINANCE_AUTHORITY_REQUIRED'; END IF;
  dept:=(data->>'departmentId')::uuid; project:=NULLIF(data->>'projectId','')::uuid;
  IF NOT EXISTS(SELECT 1 FROM departments WHERE id=dept AND organization_id=org AND active) THEN RAISE EXCEPTION 'INVALID_DEPARTMENT'; END IF;
  IF project IS NOT NULL AND NOT EXISTS(SELECT 1 FROM operational_records WHERE id=project AND organization_id=org AND record_type='Project' AND archived_at IS NULL) THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
  amount:=(data->>'allocatedAmount')::numeric;
  IF amount IS NULL OR amount<=0 OR amount>1e12 OR length(trim(COALESCE(data->>'category','')))=0 OR COALESCE(data->>'currency','') !~ '^[A-Z]{3}$' OR NULLIF(trim(data->>'periodId'),'') IS NULL OR (data->>'startDate')::date IS NULL OR (data->>'endDate')::date IS NULL OR (data->>'endDate')::date<(data->>'startDate')::date OR COALESCE((data->>'financeLimit')::numeric,0)<0 THEN RAISE EXCEPTION 'INVALID_ALLOCATION'; END IF;
  -- Allocation revisions are new approved allocations; committed/spent rows cannot be overwritten by client arrays.
  INSERT INTO business_items(organization_id,kind,department_id,project_id,owner_id,payload) VALUES(org,'allocation',dept,project,mid,
   jsonb_build_object('category',data->>'category','allocatedAmount',amount,'committedAmount',0,'spentAmount',0,'currency',data->>'currency','periodId',data->>'periodId','startDate',data->>'startDate','endDate',data->>'endDate','financeLimit',NULLIF(data->>'financeLimit','')::numeric,'approvedBy',a.display_name)) RETURNING id INTO item_id;
 ELSIF p_action='request_expense' THEN
  IF a.role NOT IN ('admin','department_lead','member') THEN RAISE EXCEPTION 'EXPENSE_REQUEST_DENIED'; END IF;
  dept:=private.shared_test_member_department(mid); IF dept IS NULL THEN dept:=NULLIF(data->>'departmentId','')::uuid; END IF;
  IF dept IS NULL OR NOT EXISTS(SELECT 1 FROM departments WHERE id=dept AND organization_id=org AND active) THEN RAISE EXCEPTION 'DEPARTMENT_REQUIRED'; END IF;
  amount:=(data->>'amount')::numeric; project:=NULLIF(data->>'projectId','')::uuid;
  IF amount IS NULL OR amount<=0 OR amount>1e12 OR length(trim(COALESCE(data->>'purpose','')))<3 OR COALESCE(data->>'currency','') !~ '^[A-Z]{3}$' OR NULLIF(trim(data->>'category'),'') IS NULL OR (data->>'requiredDate')::date IS NULL THEN RAISE EXCEPTION 'INVALID_EXPENSE'; END IF;
  IF project IS NOT NULL AND NOT EXISTS(SELECT 1 FROM operational_records WHERE id=project AND organization_id=org AND record_type='Project' AND private.shared_test_record_visible(id) AND archived_at IS NULL) THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
  next_state:=CASE WHEN a.role IN ('department_lead','admin') THEN 'Pending_Finance' ELSE 'Pending_Dept_Review' END;
  -- A Finance lead's own claim is routed to Admin, never back to themselves.
  IF a.role='department_lead' AND a.department_code='FIN' THEN next_state:='Pending_Admin'; END IF;
  INSERT INTO business_items(organization_id,kind,owner_id,department_id,project_id,payload) VALUES(org,'expense',mid,dept,project,
   jsonb_build_object('requesterName',a.display_name,'requesterId',mid,'amount',amount,'currency',data->>'currency','purpose',data->>'purpose','category',data->>'category','requiredDate',data->>'requiredDate','status',next_state,'createdAt',now(),'updatedAt',now())) RETURNING id INTO item_id;
 ELSIF p_action IN ('approve_expense','reject_expense','post_expense') THEN
  IF i.kind IS DISTINCT FROM 'expense' THEN RAISE EXCEPTION 'EXPENSE_REQUIRED'; END IF;
  IF i.owner_id=mid THEN RAISE EXCEPTION 'SELF_APPROVAL_DENIED'; END IF;
  next_state:=i.payload->>'status';
  IF p_action='post_expense' THEN
   IF NOT is_fin OR next_state<>'Approved' THEN RAISE EXCEPTION 'POSTING_AUTHORITY_OR_STATE_DENIED'; END IF;
  ELSE
   IF NOT COALESCE(((next_state='Pending_Dept_Review' AND ((a.role='department_lead' AND i.department_id=private.shared_test_member_department(mid)) OR a.role='admin')) OR (next_state='Pending_Finance' AND is_fin) OR (next_state='Pending_Admin' AND a.role='admin')),false) THEN RAISE EXCEPTION 'REVIEW_AUTHORITY_OR_STATE_DENIED'; END IF;
  END IF;
  IF p_action='reject_expense' THEN
   IF length(trim(COALESCE(data->>'reason','')))<3 THEN RAISE EXCEPTION 'REASON_REQUIRED'; END IF;
   data:=i.payload||jsonb_build_object('status','Rejected','decisionReason',data->>'reason','reviewedBy',mid,'updatedAt',now());
  ELSIF next_state='Pending_Dept_Review' THEN
   data:=i.payload||jsonb_build_object('status','Pending_Finance','departmentApprovedBy',mid,'updatedAt',now());
  ELSE
   amount:=(i.payload->>'amount')::numeric;
   IF p_action='post_expense' THEN
    SELECT * INTO allocation FROM business_items WHERE id=(i.payload->>'allocationId')::uuid AND organization_id=org AND kind='allocation' FOR UPDATE;
   ELSE
    SELECT * INTO allocation FROM business_items WHERE id=(data->>'allocationId')::uuid AND organization_id=org AND kind='allocation' AND department_id=i.department_id AND project_id IS NOT DISTINCT FROM i.project_id AND payload->>'category'=i.payload->>'category' AND payload->>'currency'=i.payload->>'currency' AND current_date BETWEEN (payload->>'startDate')::date AND (payload->>'endDate')::date FOR UPDATE;
   END IF;
   IF NOT FOUND THEN RAISE EXCEPTION 'EXACT_ACTIVE_ALLOCATION_REQUIRED'; END IF;
   available:=(allocation.payload->>'allocatedAmount')::numeric-(allocation.payload->>'spentAmount')::numeric-(allocation.payload->>'committedAmount')::numeric;
   IF p_action='post_expense' THEN
    actual:=(data->>'actualAmount')::numeric;
    IF actual IS NULL OR actual<0 OR actual>1e12 OR length(trim(COALESCE(data->>'postingRef','')))<3 OR length(trim(COALESCE(data->>'evidenceRef','')))<3 OR (allocation.payload->>'committedAmount')::numeric<amount OR actual-amount>available THEN RAISE EXCEPTION 'INVALID_OR_UNFUNDED_POSTING'; END IF;
    UPDATE business_items SET payload=payload||jsonb_build_object('committedAmount',(payload->>'committedAmount')::numeric-amount,'spentAmount',(payload->>'spentAmount')::numeric+actual),version=version+1,updated_at=now() WHERE id=allocation.id;
    data:=i.payload||jsonb_build_object('status','Settled','actualAmount',actual,'postingRef',data->>'postingRef','evidenceRef',data->>'evidenceRef','postedBy',mid,'updatedAt',now());
   ELSE
    IF amount>available THEN RAISE EXCEPTION 'INSUFFICIENT_BUDGET'; END IF;
    IF next_state='Pending_Finance' AND a.role<>'admin' AND ((allocation.payload->>'financeLimit') IS NULL OR amount>(allocation.payload->>'financeLimit')::numeric) THEN
     data:=i.payload||jsonb_build_object('status','Pending_Admin','financeApprovedBy',mid,'updatedAt',now());
    ELSE
     UPDATE business_items SET payload=payload||jsonb_build_object('committedAmount',(payload->>'committedAmount')::numeric+amount),version=version+1,updated_at=now() WHERE id=allocation.id;
     data:=i.payload||jsonb_build_object('status','Approved','allocationId',allocation.id,'approvedBy',mid,'updatedAt',now());
    END IF;
   END IF;
  END IF;
  UPDATE business_items SET payload=data,version=version+1,updated_at=now() WHERE id=i.id;
 ELSIF p_action='ticket_create' THEN
  IF length(trim(COALESCE(data->>'subject','')))<3 OR length(trim(COALESCE(data->>'description','')))<3 THEN RAISE EXCEPTION 'TICKET_DETAILS_REQUIRED'; END IF;
  project:=NULLIF(data->>'projectId','')::uuid;
  IF project IS NOT NULL AND NOT EXISTS(SELECT 1 FROM operational_records WHERE id=project AND organization_id=org AND private.shared_test_record_visible(id)) THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
  IF COALESCE(data->>'priority','') NOT IN ('Critical','High','Normal','Low') THEN RAISE EXCEPTION 'INVALID_PRIORITY'; END IF;
  INSERT INTO business_items(organization_id,kind,owner_id,department_id,project_id,payload) VALUES(org,'ticket',mid,private.shared_test_member_department(mid),project,
   jsonb_build_object('subject',data->>'subject','description',data->>'description','category',data->>'category','priority',data->>'priority','source',CASE WHEN a.role='viewer' THEN 'Client' ELSE 'Internal' END,'requesterName',a.display_name,'status','Open','replies','[]'::jsonb,'history',jsonb_build_array(jsonb_build_object('timestamp',now(),'actor',a.display_name,'action','Created')),'createdAt',now(),'updatedAt',now())) RETURNING id INTO item_id;
 ELSIF p_action IN ('ticket_reply','ticket_status') THEN
  IF i.kind IS DISTINCT FROM 'ticket' THEN RAISE EXCEPTION 'TICKET_REQUIRED'; END IF;
  IF p_action='ticket_reply' THEN
   IF length(trim(COALESCE(data->>'message','')))<1 THEN RAISE EXCEPTION 'MESSAGE_REQUIRED'; END IF;
   IF COALESCE((data->>'isInternalNote')::boolean,false) AND NOT (is_service OR a.department_code='SAL') THEN RAISE EXCEPTION 'INTERNAL_NOTE_DENIED'; END IF;
   data:=i.payload||jsonb_build_object('replies',COALESCE(i.payload->'replies','[]')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'authorName',a.display_name,'authorRole',a.role,'isInternalNote',COALESCE((data->>'isInternalNote')::boolean,false),'message',data->>'message','createdAt',now())),'updatedAt',now());
  ELSE
   IF NOT is_service THEN RAISE EXCEPTION 'SERVICE_AUTHORITY_REQUIRED'; END IF;
   next_state:=data->>'status';
   IF NOT ((i.payload->>'status'='Open' AND next_state='Assigned') OR (i.payload->>'status'='Assigned' AND next_state='In Progress') OR (i.payload->>'status'='In Progress' AND next_state IN ('Waiting','Resolved')) OR (i.payload->>'status'='Waiting' AND next_state='In Progress') OR (i.payload->>'status'='Resolved' AND next_state IN ('Closed','In Progress')) OR (i.payload->>'status'='Closed' AND next_state='Open' AND length(trim(COALESCE(data->>'reason','')))>=3)) THEN RAISE EXCEPTION 'INVALID_TICKET_TRANSITION'; END IF;
   data:=i.payload||jsonb_build_object('status',next_state,'history',COALESCE(i.payload->'history','[]')||jsonb_build_array(jsonb_build_object('timestamp',now(),'actor',a.display_name,'action',next_state,'reason',data->>'reason')),'updatedAt',now());
  END IF;
  UPDATE business_items SET payload=data,version=version+1,updated_at=now() WHERE id=i.id;
 ELSIF p_action='save_profile' THEN
  IF NOT is_hr THEN RAISE EXCEPTION 'HR_AUTHORITY_REQUIRED'; END IF;
  IF NOT EXISTS(SELECT 1 FROM organization_members WHERE id=(data->>'memberId')::uuid AND organization_id=org AND active AND role<>'viewer') THEN RAISE EXCEPTION 'INVALID_EMPLOYEE'; END IF;
  IF i.id IS NOT NULL AND (i.kind<>'profile' OR i.owner_id<>(data->>'memberId')::uuid) THEN RAISE EXCEPTION 'PROFILE_IDENTITY_IMMUTABLE'; END IF;
  data:=jsonb_build_object('employeeCode',data->>'employeeCode','email',data->>'email','phone',data->>'phone','roleTitle',data->>'roleTitle','joiningDate',data->>'joiningDate','facilityLocation',data->>'facilityLocation','emergencyContact',data->>'emergencyContact');
  IF i.id IS NULL THEN
   IF EXISTS(SELECT 1 FROM business_items WHERE organization_id=org AND kind='profile' AND owner_id=(p_payload->'data'->>'memberId')::uuid) THEN RAISE EXCEPTION 'PROFILE_EXISTS'; END IF;
   INSERT INTO business_items(organization_id,kind,owner_id,payload) VALUES(org,'profile',(p_payload->'data'->>'memberId')::uuid,data) RETURNING id INTO item_id;
  ELSE UPDATE business_items SET payload=data,version=version+1,updated_at=now() WHERE id=i.id; END IF;
 ELSIF p_action='publish_template' THEN
  IF NOT is_hr THEN RAISE EXCEPTION 'HR_AUTHORITY_REQUIRED'; END IF;
  IF COALESCE(data->>'type','') NOT IN ('policy','training','form') OR length(trim(COALESCE(data->>'title','')))<3 OR jsonb_typeof(data->'audienceIds') IS DISTINCT FROM 'array' OR jsonb_array_length(data->'audienceIds')<1 THEN RAISE EXCEPTION 'TEMPLATE_DETAILS_REQUIRED'; END IF;
  IF COALESCE((data->>'isAnonymous')::boolean,false) AND data->>'type'<>'form' THEN RAISE EXCEPTION 'ANONYMOUS_FORM_ONLY'; END IF;
  IF (data->>'dueDate')::date IS NULL OR (data->>'dueDate')::date < current_date OR COALESCE((data->>'cadenceDays')::int,0)<0 THEN RAISE EXCEPTION 'INVALID_CAMPAIGN_DATES'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(data->'audienceIds') x WHERE NOT EXISTS(SELECT 1 FROM organization_members m WHERE m.id=x::uuid AND m.organization_id=org AND m.active AND m.role<>'viewer')) THEN RAISE EXCEPTION 'INVALID_AUDIENCE'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(data->'questions','[]')) definition GROUP BY definition->>'id' HAVING count(*)>1) THEN RAISE EXCEPTION 'DUPLICATE_QUESTION_ID'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(COALESCE(data->'questions','[]')) LOOP
   IF COALESCE(q->>'type','') NOT IN ('text','number','choice','rating','boolean','date') OR length(trim(COALESCE(q->>'label','')))=0 OR length(trim(COALESCE(q->>'id','')))=0 THEN RAISE EXCEPTION 'INVALID_QUESTION'; END IF;
   IF q->>'type'='choice' AND (jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options')<2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(q->'options') x WHERE jsonb_typeof(x)<>'string' OR x='""')) THEN RAISE EXCEPTION 'INVALID_CHOICES'; END IF;
  END LOOP;
  IF data->>'type' IN ('form','training') AND jsonb_array_length(COALESCE(data->'questions','[]'))<1 THEN RAISE EXCEPTION 'QUESTIONS_REQUIRED'; END IF;
  INSERT INTO business_items(organization_id,kind,owner_id,payload) VALUES(org,'template',mid,data||jsonb_build_object('revision',1,'publishedAt',now())) RETURNING id INTO item_id;
  FOR member IN SELECT m.* FROM organization_members m WHERE m.organization_id=org AND m.active AND m.role<>'viewer' AND data->'audienceIds' ? m.id::text LOOP
   INSERT INTO business_items(organization_id,kind,owner_id,department_id,payload) VALUES(org,'assignment',member.id,private.shared_test_member_department(member.id),jsonb_build_object('templateId',item_id,'cycle',current_date::text,'dueDate',data->>'dueDate','status','Pending'));
  END LOOP;
 ELSIF p_action='submit_assignment' THEN
  IF i.kind IS DISTINCT FROM 'assignment' OR i.owner_id<>mid OR i.payload->>'status' IN ('Completed','Submitted') THEN RAISE EXCEPTION 'ASSIGNMENT_DENIED'; END IF;
  SELECT * INTO t FROM business_items WHERE id=(i.payload->>'templateId')::uuid AND organization_id=org AND kind='template';
  IF NOT FOUND THEN RAISE EXCEPTION 'PUBLISHED_TEMPLATE_REQUIRED'; END IF;
  IF t.payload->>'type'='policy' THEN
   IF NOT COALESCE((data->>'acknowledged')::boolean,false) THEN RAISE EXCEPTION 'ACKNOWLEDGMENT_REQUIRED'; END IF;
  ELSE
   IF jsonb_typeof(data->'answers') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'ANSWERS_REQUIRED'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_object_keys(data->'answers') k WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(t.payload->'questions','[]')) definition WHERE definition->>'id'=k)) THEN RAISE EXCEPTION 'UNKNOWN_ANSWER_KEY'; END IF;
   FOR q IN SELECT value FROM jsonb_array_elements(COALESCE(t.payload->'questions','[]')) LOOP
    answer:=data->'answers'->(q->>'id');
    IF COALESCE((q->>'required')::boolean,false) AND (answer IS NULL OR answer='null' OR answer='""') THEN RAISE EXCEPTION 'REQUIRED_ANSWER_MISSING'; END IF;
    IF answer IS NOT NULL AND answer<>'null' AND answer<>'""' THEN
     IF q->>'type' IN ('text','date') AND jsonb_typeof(answer)<>'string' THEN RAISE EXCEPTION 'INVALID_TEXT_ANSWER'; END IF;
     IF q->>'type'='date' AND (answer#>>'{}')::date IS NULL THEN RAISE EXCEPTION 'INVALID_DATE_ANSWER'; END IF;
     IF q->>'type' IN ('number','rating') AND (jsonb_typeof(answer)<>'number' OR (q->>'type'='rating' AND (answer::text::numeric<1 OR answer::text::numeric>5))) THEN RAISE EXCEPTION 'INVALID_NUMERIC_ANSWER'; END IF;
     IF q->>'type'='boolean' AND jsonb_typeof(answer)<>'boolean' THEN RAISE EXCEPTION 'INVALID_BOOLEAN_ANSWER'; END IF;
     IF q->>'type'='choice' AND NOT(q->'options' @> jsonb_build_array(answer)) THEN RAISE EXCEPTION 'INVALID_CHOICE'; END IF;
    END IF;
   END LOOP;
   INSERT INTO private.business_answers(organization_id,template_id,assignment_id,member_id,answers) VALUES(org,t.id,
    CASE WHEN COALESCE((t.payload->>'isAnonymous')::boolean,false) THEN NULL ELSE i.id END,
    CASE WHEN COALESCE((t.payload->>'isAnonymous')::boolean,false) THEN NULL ELSE mid END,data->'answers');
  END IF;
  UPDATE business_items SET payload=payload||jsonb_build_object('status',CASE WHEN t.payload->>'type'='training' THEN 'Submitted' ELSE 'Completed' END,'completedDay',current_date),version=version+1,updated_at=date_trunc('day',now()) WHERE id=i.id;
 ELSIF p_action='review_training' THEN
  IF NOT is_hr OR i.kind IS DISTINCT FROM 'assignment' OR i.payload->>'status'<>'Submitted' OR i.owner_id=mid THEN RAISE EXCEPTION 'TRAINING_REVIEW_DENIED'; END IF;
  SELECT * INTO t FROM business_items WHERE id=(i.payload->>'templateId')::uuid AND organization_id=org AND kind='template' AND payload->>'type'='training';
  IF NOT FOUND OR length(trim(COALESCE(data->>'evidenceRef','')))<3 THEN RAISE EXCEPTION 'TRAINING_EVIDENCE_REQUIRED'; END IF;
  UPDATE business_items SET payload=payload||jsonb_build_object('status','Completed','verifiedBy',mid,'verifiedAt',now(),'evidenceRef',data->>'evidenceRef'),version=version+1,updated_at=now() WHERE id=i.id;
 ELSIF p_action='channel_create' THEN
  IF a.role NOT IN ('admin','department_lead') OR jsonb_typeof(data->'memberIds') IS DISTINCT FROM 'array' OR NOT(data->'memberIds' ? mid::text) THEN RAISE EXCEPTION 'CHANNEL_AUTHORITY_REQUIRED'; END IF;
  IF length(trim(COALESCE(data->>'name','')))<2 THEN RAISE EXCEPTION 'CHANNEL_NAME_REQUIRED'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(data->'memberIds') x WHERE NOT EXISTS(SELECT 1 FROM organization_members m WHERE m.id=x::uuid AND m.organization_id=org AND m.active AND m.role<>'viewer')) THEN RAISE EXCEPTION 'INVALID_PARTICIPANT'; END IF;
  INSERT INTO business_items(organization_id,kind,owner_id,payload) VALUES(org,'channel',mid,jsonb_build_object('name',data->>'name','memberIds',data->'memberIds','topic',data->>'topic')) RETURNING id INTO item_id;
 ELSIF p_action='send_message' THEN
  SELECT * INTO t FROM business_items WHERE id=(data->>'channelId')::uuid AND kind='channel' AND private.business_visible(business_items,to_jsonb(a));
  IF NOT FOUND OR length(trim(COALESCE(data->>'text','')))<1 THEN RAISE EXCEPTION 'CHANNEL_OR_MESSAGE_DENIED'; END IF;
  IF data ? 'poll' AND (jsonb_typeof(data->'poll'->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(data->'poll'->'options')<2 OR jsonb_array_length(data->'poll'->'options')>10 OR length(trim(COALESCE(data->'poll'->>'question','')))<1 OR (data->'poll'->>'closesAt')::timestamptz IS NULL OR (data->'poll'->>'closesAt')::timestamptz<=now() OR EXISTS(SELECT 1 FROM jsonb_array_elements(data->'poll'->'options') x WHERE jsonb_typeof(x)<>'string' OR x='""')) THEN RAISE EXCEPTION 'INVALID_POLL'; END IF;
  INSERT INTO business_items(organization_id,kind,owner_id,payload) VALUES(org,'message',mid,jsonb_build_object('channelId',t.id,'text',data->>'text','senderName',a.display_name,'senderDept',a.department_code,'type',COALESCE(data->>'type','update'),'tags',COALESCE(data->'tags','[]'),'createdAt',now(),'poll',CASE WHEN data ? 'poll' THEN jsonb_build_object('question',data->'poll'->>'question','options',data->'poll'->'options','closesAt',data->'poll'->>'closesAt') ELSE NULL END)) RETURNING id INTO item_id;
 ELSIF p_action='poll_vote' THEN
  IF i.kind IS DISTINCT FROM 'message' OR (i.payload->'poll' IS NULL OR i.payload->'poll'='null') OR (i.payload->'poll'->>'closesAt')::timestamptz IS NULL OR (i.payload->'poll'->>'closesAt')::timestamptz<=now() THEN RAISE EXCEPTION 'POLL_CLOSED_OR_UNAVAILABLE'; END IF;
  count_q:=(data->>'choice')::int;
  IF count_q IS NULL OR count_q<0 OR count_q>=jsonb_array_length(i.payload->'poll'->'options') THEN RAISE EXCEPTION 'INVALID_POLL_OPTION'; END IF;
  INSERT INTO private.business_votes(message_id,member_id,choice) VALUES(i.id,mid,count_q) ON CONFLICT(message_id,member_id) DO UPDATE SET choice=excluded.choice;
 ELSE RAISE EXCEPTION 'UNKNOWN_BUSINESS_ACTION'; END IF;
 PERFORM private.business_notify(item_id);
 IF p_action='publish_template' THEN PERFORM private.business_notify(id) FROM business_items WHERE organization_id=org AND kind='assignment' AND payload->>'templateId'=item_id::text; END IF;
 result:=jsonb_build_object('id',item_id,'saved',true);
 INSERT INTO private.business_requests VALUES(org,auth.uid(),p_request_id,sig,result);
 -- Never include survey answers or anonymous response IDs in audit details.
 INSERT INTO audit_events(organization_id,actor_id,entity_type,entity_id,action,detail) VALUES(org,auth.uid(),'business_item',item_id,p_action,jsonb_build_object('version',COALESCE(i.version,0)+1));
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.mutate_business_workspace(text,jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mutate_business_workspace(text,jsonb,uuid) TO authenticated;

-- Coordination summaries share status and explicit dependencies, not private file content.
CREATE FUNCTION public.get_project_coordination() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE a record;
BEGIN
 SELECT * INTO a FROM resolve_test_membership();
 IF auth.uid() IS NULL OR a.membership_id IS NULL OR a.role='viewer' THEN RAISE EXCEPTION 'COORDINATION_ACCESS_DENIED'; END IF;
 RETURN jsonb_build_object('records',COALESCE((SELECT jsonb_agg(jsonb_build_object(
 'id',r.id,'reference',r.reference,'title',CASE WHEN private.shared_test_record_visible(r.id) THEN r.title ELSE r.record_type||' · '||COALESCE(d.code,'department') END,
 'type',r.record_type,'status',r.status,'area',lower(COALESCE(d.code,r.area)),
 'fields',jsonb_strip_nulls(jsonb_build_object(
 'projectId',COALESCE(r.fields->>'projectId',r.fields->>'project_id',(SELECT l.source_record_id::text FROM record_links l JOIN operational_records parent ON parent.id=l.source_record_id WHERE l.organization_id=r.organization_id AND l.target_record_id=r.id AND parent.record_type='Project' AND parent.archived_at IS NULL ORDER BY l.id LIMIT 1)),'projectCode',r.fields->>'projectCode','stage',r.stage,
 'lifecycleStage',r.stage,'targetDate',r.fields->>'targetDate','dependsOn',r.fields->>'dependsOn','requiredInputs',r.fields->>'requiredInputs',
 'enquiryId',r.fields->>'enquiryId','owner',COALESCE(r.fields->>'owner',(SELECT m.display_name FROM organization_members m WHERE m.organization_id=r.organization_id AND m.user_id=r.created_by AND m.active LIMIT 1)),'scope',CASE WHEN private.shared_test_record_visible(r.id) THEN r.fields->>'scope' ELSE r.fields->>'coordinationSummary' END,
 'customer',CASE WHEN private.shared_test_record_visible(r.id) THEN r.fields->>'customer' ELSE NULL END))
 )) FROM operational_records r LEFT JOIN departments d ON d.id=r.department_id WHERE r.organization_id=a.organization_id AND r.archived_at IS NULL),'[]') ||
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',t.id,'reference','TASK-'||left(t.id::text,8),'title',t.title,'type','Task','status',t.status,'area',lower(d.code),'priority',t.priority,
 'fields',jsonb_strip_nulls(jsonb_build_object('projectId',t.record_id,'department',d.code,'dueDate',to_char(t.due_at AT TIME ZONE 'Asia/Kolkata','YYYY-MM-DD'),'assignee',m.display_name))))
 FROM tasks t LEFT JOIN departments d ON d.id=t.department_id LEFT JOIN organization_members m ON m.id=t.assignee_id
 WHERE t.organization_id=a.organization_id AND (private.shared_test_scope(t.organization_id,t.department_id) OR t.assignee_id=a.membership_id)),'[]'),
 'documents',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',d.id,'title',d.title,'type',d.document_type,'linkedRecordRefs',jsonb_build_array(d.record_id::text)))
 FROM documents d WHERE d.organization_id=a.organization_id AND private.shared_test_scope(d.organization_id,d.department_id)),'[]'));

END $$;
REVOKE ALL ON FUNCTION public.get_project_coordination() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_project_coordination() TO authenticated;

-- Owner-only scheduler entry point. Never callable by anon/authenticated.
CREATE FUNCTION private.business_schedule_all() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET timezone='Asia/Kolkata' AS $$
DECLARE org record;
BEGIN
 FOR org IN SELECT DISTINCT organization_id FROM business_items WHERE kind='template' LOOP
  PERFORM 1 FROM organizations WHERE id=org.organization_id FOR UPDATE;
  PERFORM private.business_schedule(org.organization_id);
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.business_schedule_all() FROM PUBLIC,anon,authenticated;
