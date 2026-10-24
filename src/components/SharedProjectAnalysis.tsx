import { useQuery } from "@tanstack/react-query";
import { useServerFn, createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ProjectAnalysisOverview } from "./ProjectAnalysisOverview";
import type { TestMembership } from "@/lib/test-auth.functions";
import type { AnalysisRecord, AnalysisDocument } from "@/lib/project-analysis-data";
import type { Json } from "@/integrations/supabase/types";
export const getCoordination = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const rpc = context.supabase as unknown as {
      rpc(name: string): Promise<{ data: Json; error: { message: string } | null }>;
    };
    const { data, error } = await rpc.rpc("get_project_coordination");
    if (error) throw new Error(error.message);
    return data as unknown as { records: AnalysisRecord[]; documents: AnalysisDocument[] };
  });
export function SharedProjectAnalysis({
  membership,
  onOpenProject,
}: {
  membership: TestMembership;
  onOpenProject?: ((project: AnalysisRecord) => void) | undefined;
}) {
  const load = useServerFn(getCoordination);
  const query = useQuery({
    queryKey: ["project-coordination", membership.organizationId, membership.membershipId],
    queryFn: () => load(),
    refetchInterval: 15000,
    retry: 1,
  });
  if (query.isPending) return <p>Loading project inputs…</p>;
  if (query.error || !query.data)
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Project Analysis</h1>
        <p role="alert" className="text-sm text-destructive mt-2">
          {query.error instanceof Error ? query.error.message : "Shared project inputs unavailable"}
        </p>
        <button
          className="border rounded px-3 py-2 text-sm mt-3"
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    );
  const records = query.data.records;
  return (
    <ProjectAnalysisOverview
      projects={records.filter((r) => r.type === "Project")}
      records={records}
      documents={query.data.documents}
      onOpenProject={onOpenProject}
    />
  );
}
