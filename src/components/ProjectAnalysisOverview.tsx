import { useMemo, useState } from "react";
import { FolderKanban, Search, ArrowRight, Layers } from "lucide-react";
import { ResponsiveFilterBar, CompactFilterSelect } from "@/components/ResponsiveFilterBar";
import {
  projectAnalysis,
  enquiryAnalysis,
  analysisComplete,
  approvedInput,
  inputState,
  type AnalysisRecord,
  type AnalysisDocument,
} from "@/lib/project-analysis-data";

export function ProjectAnalysisOverview({
  projects,
  records,
  documents,
  onOpenProject,
}: {
  projects: AnalysisRecord[];
  records: AnalysisRecord[];
  documents: AnalysisDocument[];
  onOpenProject?: ((project: AnalysisRecord) => void) | undefined;
}) {
  const [projectId, setProjectId] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"analysis" | "intake">("analysis");
  const visible = projects.filter(
    (p) =>
      (projectId === "all" || p.id === projectId) &&
      `${p.reference} ${p.title}`.toLowerCase().includes(query.toLowerCase()),
  );
  const analyses = useMemo(
    () => visible.map((p) => projectAnalysis(p, records, documents)),
    [visible, records, documents],
  );
  const enquiries = enquiryAnalysis(records).filter(
    ({ enquiry: e }) =>
      `${e.reference} ${e.title} ${e.fields["customer"] || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (projectId === "all" ||
        [e.fields["projectId"], e.fields["projectCode"]].some(
          (key) => key === projectId || key === projects.find((p) => p.id === projectId)?.reference,
        )),
  );
  const dependencies = analyses.flatMap((a) =>
    a.dependencies.map((d) => ({ ...d, project: a.project.reference })),
  );
  const inputs = analyses.flatMap((a) => a.inputs);
  const approved = inputs.filter((r) => approvedInput(r.status)).length;
  const deptCodes = Array.from(
    new Set(analyses.flatMap((a) => a.departments.map((d) => d.code))),
  ).sort();
  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h1 className="text-xl font-semibold">Project Analysis</h1>
          <p className="text-xs text-muted-foreground">
            Saved inputs, reviews and dependencies within your access.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          <button
            className={`rounded px-3 py-1.5 ${tab === "analysis" ? "bg-background shadow-xs" : ""}`}
            onClick={() => setTab("analysis")}
          >
            Overview
          </button>
          <button
            className={`rounded px-3 py-1.5 ${tab === "intake" ? "bg-background shadow-xs" : ""}`}
            onClick={() => setTab("intake")}
          >
            Enquiry inputs
          </button>
        </div>
      </header>
      <ResponsiveFilterBar label="Project analysis filters">
        <div className="filter-search">
          <Search />
          <input
            aria-label="Search project analysis"
            placeholder="Search code, title or client…"
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
      {tab === "intake" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {!enquiries.length && (
            <p className="text-sm text-muted-foreground">
              No permitted enquiry inputs in this context.
            </p>
          )}
          {enquiries.map(({ enquiry: e, responses }) => (
            <article
              key={e.id}
              className="rounded-xl border border-border/70 bg-card p-4 text-xs space-y-3"
            >
              <div>
                <p className="font-mono text-primary">{e.reference}</p>
                <h2 className="text-sm font-semibold">{e.title}</h2>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["Client", e.fields["customer"]],
                  ["Owner", e.fields["owner"]],
                  ["Project", e.fields["projectId"] || e.fields["projectCode"] || "Not linked yet"],
                  ["Target", e.fields["targetDate"]],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v || "Not recorded"}</dd>
                  </div>
                ))}
              </dl>
              <p className="whitespace-pre-wrap">
                {e.fields["scope"] || e.notes || "Client requirements not recorded."}
              </p>
              <p>
                Status: <strong>{e.status}</strong>
              </p>
              <div className="border-t border-border/50 pt-2 space-y-2">
                <h3 className="font-medium">Department responses ({responses.length})</h3>
                {responses.length ? (
                  responses.map((r) => (
                    <div key={r.id} className="rounded border border-border/50 p-2">
                      <span className="font-mono">{r.reference}</span>
                      <p>
                        {r.title} · {inputState(r.status)}
                      </p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {r.fields["scope"] ||
                          r.fields["notes"] ||
                          r.notes ||
                          "No response details recorded"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No linked department responses.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Projects", analyses.length],
              ["Approved input records", `${approved} / ${inputs.length}`],
              ["Open dependencies", dependencies.filter((d) => d.blocked).length],
              ["Departments with inputs", deptCodes.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border/70 bg-card p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold mt-1">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Counts describe permitted saved records, not certified lifecycle completion. Unmapped
            requirements remain unknown.
          </p>
          <section className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <h2 className="text-sm font-semibold">Department inputs</h2>
            <div className="flex flex-wrap gap-2">
              {deptCodes.length ? (
                deptCodes.map((code) => {
                  const rows = analyses
                    .flatMap((a) => a.departments)
                    .filter((d) => d.code === code);
                  return (
                    <div key={code} className="rounded-lg border border-border/60 p-3 text-xs">
                      <strong>{code}</strong>
                      <p>
                        {rows.reduce((n, d) => n + d.approved, 0)} /{" "}
                        {rows.reduce((n, d) => n + d.total, 0)} approved input records
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No department inputs recorded.</p>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-border/70 bg-card overflow-hidden">
            <div className="border-b border-border/60 p-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="size-4" />
                Dependencies
              </h2>
              <p className="text-xs text-muted-foreground">
                Required input → provider / owner → waiting department → status → next action
              </p>
            </div>
            {!dependencies.length && (
              <p className="p-4 text-xs text-muted-foreground">
                No explicit dependency links recorded. This does not mean the project has no
                blockers.
              </p>
            )}
            {dependencies.map((d) => (
              <div
                key={`${d.project}:${d.id}`}
                className="border-b border-border/40 p-3 text-xs grid gap-2 md:grid-cols-3"
              >
                <div>
                  <p className="font-mono text-primary">
                    {d.project} · {d.reference}
                  </p>
                  <strong>{d.needed}</strong>
                  <p>
                    {d.provider} / {d.owner} → {d.waiting}
                  </p>
                </div>
                <div>
                  <span
                    className={`rounded border px-2 py-1 ${d.blocked ? "text-amber-600 border-amber-500/30" : "text-emerald-600 border-emerald-500/30"}`}
                  >
                    {d.state}
                  </span>
                  <p className="mt-2">Dependent record: {d.waitingRecord}</p>
                  <p>Milestone: {d.milestone}</p>
                </div>
                <p>{d.nextAction}</p>
              </div>
            ))}
          </section>
          <div className="grid gap-3 lg:grid-cols-2">
            {analyses.map((a) => (
              <article
                key={a.project.id}
                className="rounded-xl border border-border/70 bg-card p-4 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-primary">{a.project.reference}</p>
                    <h2 className="text-sm font-semibold">{a.project.title}</h2>
                  </div>
                  <span className="rounded border border-border px-2 py-1">{a.project.status}</span>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    [
                      "Current stage",
                      a.project.fields["currentStage"] ||
                        a.project.fields["lifecycleStage"] ||
                        "Not recorded",
                    ],
                    ["Target", a.project.fields["targetDate"] || "Not recorded"],
                    [
                      "Tasks completed",
                      `${a.tasks.filter((r) => analysisComplete(r.status)).length} / ${a.tasks.length}`,
                    ],
                    ["Linked documents", a.documents.length],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <details>
                  <summary className="cursor-pointer font-medium">
                    Inputs & reviews ({a.inputs.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {a.inputs.map((r) => (
                      <div key={r.id} className="border border-border/50 rounded p-2">
                        <p>
                          {r.reference} · {r.title}
                        </p>
                        <p className="text-muted-foreground">
                          {r.area?.toUpperCase() ||
                            r.fields["department"] ||
                            "Department not recorded"}{" "}
                          · {inputState(r.status)}
                        </p>
                        <p className="whitespace-pre-wrap">
                          {r.fields["scope"] || r.fields["nextAction"] || r.notes || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
                {onOpenProject && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-secondary"
                    onClick={() => onOpenProject(a.project)}
                  >
                    Open project workspace
                    <ArrowRight className="size-3" />
                  </button>
                )}
              </article>
            ))}
          </div>
          {!analyses.length && (
            <p className="text-sm text-muted-foreground">No permitted projects match this view.</p>
          )}
        </>
      )}
    </div>
  );
}
