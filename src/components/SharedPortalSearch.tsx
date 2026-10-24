import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSharedTestWorkspace } from "@/lib/shared-test.functions";
import { getBusinessWorkspace } from "@/lib/business-workspace.functions";
import type { TestMembership } from "@/lib/test-auth.functions";
type Result = {
  id: string;
  title: string;
  type: string;
  summary: string;
  view: string;
  details: string;
};
export function SharedPortalSearch({
  membership,
  query,
  onQueryChange,
  onOpen,
}: {
  membership: TestMembership;
  query: string;
  onQueryChange: (q: string) => void;
  onOpen: (view: string) => void;
}) {
  const loadRecords = useServerFn(getSharedTestWorkspace),
    loadBusiness = useServerFn(getBusinessWorkspace);
  const records = useQuery({
    queryKey: ["shared-search-records", membership.organizationId, membership.membershipId],
    queryFn: () => loadRecords(),
    retry: 1,
  });
  const business = useQuery({
    queryKey: ["business-workspace", membership.organizationId, membership.membershipId],
    queryFn: () => loadBusiness(),
    retry: 1,
  });
  const [selected, setSelected] = useState<Result | null>(null);
  const [type, setType] = useState("all");
  const options: Result[] = [
    ...((records.error ? undefined : records.data)?.records || []).map((r) => ({
      id: r.id,
      title: r.title,
      type: r.record_type,
      summary: r.reference,
      view: r.record_type === "Project" ? "Projects" : "Records",
      details: r.notes,
    })),
    ...((records.error ? undefined : records.data)?.tasks || []).map((r) => ({
      id: r.id,
      title: r.title,
      type: "Task",
      summary: r.status,
      view: "Tasks",
      details: r.due_at || "",
    })),
    ...((records.error ? undefined : records.data)?.documents || []).map((r) => ({
      id: r.id,
      title: r.title,
      type: "Document",
      summary: r.document_type,
      view: "Documents",
      details: "Open the document register for its original controlled revision.",
    })),
    ...((business.error ? undefined : business.data)?.items || [])
      .filter((i) => ["expense", "ticket", "message"].includes(i.kind))
      .map((i) => ({
        id: i.id,
        title: String(i.data["subject"] || i.data["purpose"] || i.data["text"] || i.kind),
        type: i.kind,
        summary: [
          i.data["status"],
          i.data["type"],
          ...(Array.isArray(i.data["tags"]) ? i.data["tags"] : []),
        ]
          .filter(Boolean)
          .join(" · "),
        view: i.kind === "ticket" ? "tickets" : i.kind === "message" ? "communication" : "budgets",
        details: i.kind === "ticket" ? String(i.data["description"] || "") : "",
      })),
  ];
  const visible = options
    .filter(
      (r) =>
        (type === "all" || r.type === type) &&
        `${r.title} ${r.summary}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 50);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          autoFocus
          aria-label="Search shared records"
          className="min-w-0 flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setSelected(null);
          }}
          placeholder="Search records, tasks, tickets or tags…"
        />
        <select
          aria-label="Record type"
          className="max-w-36 rounded border border-input bg-background px-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All types</option>
          {Array.from(new Set(options.map((r) => r.type)))
            .sort()
            .map((t) => (
              <option key={t}>{t}</option>
            ))}
        </select>
      </div>
      {(records.isPending || business.isPending) && (
        <p className="text-xs text-muted-foreground">Loading permitted records…</p>
      )}
      {(records.error || business.error) && (
        <p role="alert" className="text-xs text-destructive">
          Some shared sources are unavailable. No local examples are included.
        </p>
      )}
      {selected ? (
        <article className="rounded-lg border border-border p-3 space-y-2">
          <button className="text-xs text-primary" onClick={() => setSelected(null)}>
            Back to results
          </button>
          <h2 className="text-sm font-semibold">{selected.title}</h2>
          <p className="text-xs">{selected.summary}</p>
          <p className="text-sm whitespace-pre-wrap">{selected.details}</p>
          <button
            className="rounded border border-border px-3 py-2 text-xs"
            onClick={() => onOpen(selected.view)}
          >
            Open original register
          </button>
        </article>
      ) : (
        <div className="max-h-[45vh] overflow-y-auto space-y-1">
          {visible.map((r) => (
            <button
              key={`${r.type}:${r.id}`}
              className="block w-full rounded-lg border border-border/50 p-3 text-left hover:bg-muted"
              onClick={() => setSelected(r)}
            >
              <p className="text-xs text-primary">
                {r.type} · {r.summary}
              </p>
              <p className="text-sm line-clamp-2">{r.title}</p>
            </button>
          ))}
          {!visible.length && !records.isPending && !business.isPending && (
            <p className="p-3 text-sm text-muted-foreground">No permitted results.</p>
          )}
        </div>
      )}
    </div>
  );
}
