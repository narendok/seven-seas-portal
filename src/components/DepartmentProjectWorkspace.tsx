import { DepartmentLeadCoordinationCenter, type TaskRecord, type TeamMember } from "./DepartmentLeadCoordinationCenter";
import type { ApprovalRecord } from "./ApprovalsFullPageView";
import { recordsForProject, documentsForProject } from "@/lib/project-workspace";

type WorkspaceDocument = { id: string; title: string; type: string; lifecycle?: string | undefined; revision?: string | undefined; linkedRecordRefs?: string[] | undefined };
type Props = {
  departmentCode: string; departmentName: string; lead: string;
  records: TaskRecord[]; projects: TaskRecord[]; documents: WorkspaceDocument[]; approvals: ApprovalRecord[]; team: TeamMember[];
  projectScope: string; onProjectChange: (value: string) => void;
  onCreateRecord: () => void;
  onOpenRecord: (id: string) => void; onOpenDocument: (id: string) => void;
  onUpdateTask: (id: string, patch: Partial<TaskRecord>, action: string) => void;
  onCreateTask: (task: {title: string; priority: TaskRecord["priority"]; assignee: string; projectId: string; dueDate: string; notes: string}) => boolean | void | Promise<boolean | void>;
};

export function DepartmentProjectWorkspace(props: Props) {
  const { departmentCode, departmentName, lead, projects, projectScope } = props;
  const project = projects.find(item => item.reference === projectScope || item.id === projectScope);
  const all = projectScope === "all";
  const records = all ? props.records : recordsForProject(props.records, project);
  const documents = all ? props.documents : project ? documentsForProject(props.documents, records, project) : [];
  const sourceIds = new Set(records.map(record => record.id));
  const approvals = props.approvals.filter(approval => all || sourceIds.has(approval.recordId) || Boolean(project && [project.id, project.reference].includes(approval.project ?? "")));
  const work = records.filter(record => record.type !== "Project" && record.status !== "Archived");
  const completed = work.filter(record => record.status === "Approved" || record.status === "Released").length;
  const progress = work.length ? Math.round(completed / work.length * 100) : 0;
  const owners = new Set(records.filter(record => record.type === "Task").map(record => record.fields["assignee"]));
  const team = all ? props.team : props.team.filter(member => owners.has(member.name));
  const shownProjects = all ? projects : project ? [project] : [];
  return <main className="space-y-6" aria-label="Department project workspace">
    <header className="rounded-xl border border-border bg-card p-5 space-y-3">
      <p className="text-xs text-muted-foreground">{departmentCode} · Department workspace</p>
      <h1 className="text-2xl font-semibold">{departmentName} — Project Workspace</h1>
      <p className="text-sm text-muted-foreground">Select a project to see its department work, tasks, documents, reviews and assigned team together.</p>
      <label className="block text-sm font-medium">Project
        <select aria-label="Workspace project" value={projectScope} onChange={event => props.onProjectChange(event.target.value)} className="mt-2 block w-full rounded-lg border border-input bg-background p-3 sm:max-w-2xl">
          <option value="all">All projects — department overview</option>
          {!all && !project && <option value={projectScope}>Selected project unavailable</option>}
          {projects.map(item => <option key={item.id} value={item.reference}>{item.reference} · {item.title}</option>)}
        </select>
      </label>
      <button type="button" onClick={props.onCreateRecord} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Add department record</button>
      {!all && !project && <p role="status" className="text-sm text-muted-foreground">This project is not linked to your department. Choose an available project.</p>}
    </header>
    {project && <section aria-label="Selected project overview" className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xl font-semibold">{project.title}</h2><p className="mt-1 text-sm text-muted-foreground">{project.reference} · {project.status}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">{[["Customer", project.fields["customer"]], ["Stage", project.fields["lifecycleStage"]], ["Target date", project.fields["targetDate"]]].map(([label,value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">{value || "Not recorded"}</dd></div>)}</dl>
    </section>}
    <section aria-label="Workspace summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Department progress", `${progress}%`, `${completed} of ${work.length} records complete`], ["Tasks", records.filter(record => record.type === "Task").length, "In selected scope"], ["Documents", documents.length, "Authorized linked documents"], ["Pending approvals", approvals.filter(approval => approval.outcome === "Pending").length, "In selected scope"]].map(([label,value,detail]) => <div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>)}
    </section>
    {all && <section aria-label="Department projects" className="grid gap-3 md:grid-cols-2">{projects.length ? projects.map(item => <button key={item.id} onClick={() => props.onProjectChange(item.reference)} className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary"><strong>{item.title}</strong><p className="mt-1 text-xs text-muted-foreground">{item.reference} · {item.status}</p></button>) : <p>No projects linked to this department yet.</p>}</section>}
    <DepartmentLeadCoordinationCenter key={`${departmentCode}:${projectScope}`} hideProjectSelector recordsAreScoped departmentCode={departmentCode} departmentName={departmentName} departmentLead={lead}
      records={records} teamMembers={props.team} projects={shownProjects.map(item => ({id:item.reference,name:item.title,customer:item.fields["customer"] || "Not recorded",currentStage:item.fields["lifecycleStage"] || "Not recorded",targetDate:item.fields["targetDate"] || "Not recorded",volume:item.fields["quantity"] || "Not recorded"}))}
      projectScope={projectScope} onProjectScopeChange={props.onProjectChange} onCreateTask={props.onCreateTask}
      onUpdateTaskAssignee={(id, assignee) => props.onUpdateTask(id, {fields:{assignee}}, "Task reassigned")}
      onUpdateTaskStatus={(id,status) => props.onUpdateTask(id, {status, ...(status === "Open" ? {fields:{workStatus:"To do"}} : {})}, "Task status updated")}
      onStartTask={id => props.onUpdateTask(id, {status:"Open",fields:{workStatus:"In progress"}}, "Task started")}
      onOpenTask={task => props.onOpenRecord(task.id)} />
    <div className="grid gap-5 lg:grid-cols-2">
      <section aria-label="Project documents" className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Documents & References ({documents.length})</h2><div className="mt-3 space-y-2">{documents.length ? documents.map(doc => <button key={doc.id} onClick={() => props.onOpenDocument(doc.id)} className="block w-full rounded-lg border border-border p-3 text-left hover:bg-secondary"><strong className="text-sm">{doc.title}</strong><p className="mt-1 text-xs text-muted-foreground">{doc.type} · {doc.lifecycle || "Draft"} · Rev {doc.revision || "Not recorded"}</p></button>) : <p className="text-sm text-muted-foreground">No authorized documents linked to this project scope.</p>}</div></section>
      <section aria-label="Project approvals" className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Approvals & Reviews ({approvals.length})</h2><div className="mt-3 space-y-2">{approvals.length ? approvals.map(approval => <article key={approval.id} className="rounded-lg border border-border p-3"><strong className="text-sm">{approval.title}</strong><p className="mt-1 text-xs text-muted-foreground">{approval.outcome} · Reviewer: {approval.approverAuthority || "Not assigned"}</p>{sourceIds.has(approval.recordId) && <button onClick={() => props.onOpenRecord(approval.recordId)} className="mt-2 text-xs text-primary underline">Open source record</button>}</article>) : <p className="text-sm text-muted-foreground">No approvals in this project scope.</p>}</div></section>
      <section aria-label="Project records" className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Department Records ({work.filter(record => record.type !== "Task").length})</h2><div className="mt-3 space-y-2">{work.filter(record => record.type !== "Task").map(record => <button key={record.id} onClick={() => props.onOpenRecord(record.id)} className="block w-full rounded-lg border border-border p-3 text-left hover:bg-secondary"><strong className="text-sm">{record.title}</strong><p className="text-xs text-muted-foreground">{record.reference} · {record.status}</p></button>)}{!work.some(record => record.type !== "Task") && <p className="text-sm text-muted-foreground">No department records in this project scope.</p>}</div></section>
      <section aria-label="Project team" className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">{all ? "Department Team" : "Assigned Task Owners"} ({team.length})</h2><div className="mt-3 space-y-2">{team.map(member => <div key={member.name} className="rounded-lg border border-border p-3"><strong className="text-sm">{member.name}</strong><p className="text-xs text-muted-foreground">{member.role}</p></div>)}{!team.length && <p className="text-sm text-muted-foreground">No department task owners recorded in this project scope.</p>}</div></section>
    </div>
  </main>;
}
