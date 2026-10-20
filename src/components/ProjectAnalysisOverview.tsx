import { useState } from "react";
import { FolderKanban, Search } from "lucide-react";
import { ResponsiveFilterBar, CompactFilterSelect } from "@/components/ResponsiveFilterBar";
import { recordsForProject, documentsForProject } from "@/lib/project-workspace";
type Record = {
  id: string;
  reference: string;
  title: string;
  type: string;
  status: string;
  fields: { [key: string]: string };
};
type Document = {
  id: string;
  title: string;
  type: string;
  lifecycle?: string | undefined;
  linkedRecordRefs?: string[] | undefined;
};
export function ProjectAnalysisOverview({
  projects,
  records,
  documents,
  onOpenProject,
}: {
  projects: Record[];
  records: Record[];
  documents: Document[];
  onOpenProject: (project: Record) => void;
}) {
  const [projectId, setProjectId] = useState("all");
  const [query, setQuery] = useState("");
  const visible = projects.filter(
    (p) =>
      (projectId === "all" || p.id === projectId) &&
      `${p.reference} ${p.title}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section aria-label="Project analysis" className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold">Project analysis</h1>
        <p className="text-xs text-muted-foreground">
          Overview of permitted projects. Select a project for its recorded progress; open its
          workspace to edit permitted work.
        </p>
      </header>
      <ResponsiveFilterBar label="Project analysis filters">
        <div className="filter-search">
          <Search />
          <input
            aria-label="Search project analysis"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <CompactFilterSelect
          label="Project"
          icon={FolderKanban}
          value={projectId}
          onChange={setProjectId}
          options={[
            { value: "all", label: "All permitted projects" },
            ...projects.map((p) => ({ value: p.id, label: `${p.reference} · ${p.title}` })),
          ]}
        />
      </ResponsiveFilterBar>
      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((project) => {
          const work = recordsForProject(records, project);
          const tasks = work.filter((r) => r.type === "Task");
          const done = tasks.filter((r) => ["Approved", "Released"].includes(r.status)).length;
          const docs = documentsForProject(documents, work, project);
          return (
            <article
              key={project.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-primary">{project.reference}</p>
                  <h2 className="mt-1 text-sm font-semibold">{project.title}</h2>
                </div>
                <span className="shrink-0 rounded border border-border bg-secondary px-2 py-1 text-[10px]">
                  {project.status}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Current stage</dt>
                  <dd className="mt-1">
                    {project.fields["currentStage"] ||
                      project.fields["lifecycleStage"] ||
                      "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Target date</dt>
                  <dd className="mt-1">{project.fields["targetDate"] || "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Permitted tasks completed</dt>
                  <dd className="mt-1">
                    {done} / {tasks.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Permitted documents</dt>
                  <dd className="mt-1">{docs.length}</dd>
                </div>
              </dl>
              <div
                className="mt-3 h-1.5 rounded bg-secondary"
                aria-label={`${done} of ${tasks.length} permitted tasks completed`}
              >
                <div
                  className="h-full rounded bg-primary"
                  style={{
                    width: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Task completion does not indicate stage approval or client release.
              </p>
              <button
                type="button"
                className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                onClick={() => onOpenProject(project)}
              >
                Open project workspace
              </button>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No permitted projects match this selection.
        </p>
      )}
    </section>
  );
}
