/** Policy for the browser-local register. Authenticated shared decisions need server enforcement. */
export type DecisionActor = {
  id: string;
  kind: string;
  name: string;
  role: string;
  department: string;
};
type Decision = {
  id: string;
  authorId?: string | undefined;
  actor: string;
  actorRole: string;
  departmentCode?: string | undefined;
  scope?: string | undefined;
  projectCode: string;
  stage?: string | undefined;
  title: string;
  rationale: string;
  status?: string | undefined;
};
const legacyDepartments: Record<string, string> = {
  "DEC-AI4T-2026-001": "SAL",
  "DEC-AI4T-2026-002": "EHW",
  "DEC-AI4T-2026-003": "QA",
};
export function decisionDepartment(decision: Pick<Decision, "id" | "departmentCode">): string {
  return decision.departmentCode ?? legacyDepartments[decision.id] ?? "";
}
export function isDecisionVisible(decision: Decision, actor: DecisionActor): boolean {
  if (actor.kind === "admin") return true;
  if (!actor.department || decisionDepartment(decision) !== actor.department) return false;
  if (actor.kind === "lead") return true;
  return actor.kind === "member" && Boolean(actor.id) && decision.authorId === actor.id;
}
export function assertDecisionSubmission(
  decision: Decision,
  actor: DecisionActor,
  permittedProjects: string[],
  stages: string[],
): void {
  if (
    !["admin", "lead", "member"].includes(actor.kind) ||
    !actor.id ||
    decision.authorId !== actor.id ||
    decision.actor !== actor.name ||
    decision.actorRole !== actor.role
  )
    throw new Error("Decision author no longer matches the signed-in session.");
  if (!actor.department || decision.departmentCode !== actor.department)
    throw new Error("Decision department no longer matches this session.");
  if (!decision.title.trim() || !decision.rationale.trim())
    throw new Error("Decision title and reason are required.");
  if (decision.status !== (actor.kind === "member" ? "Pending lead review" : "Recorded"))
    throw new Error("A submission cannot grant its own approval.");
  if (decision.scope === "common") {
    if (decision.projectCode || decision.stage)
      throw new Error("Common decisions cannot contain a hidden project or stage.");
    return;
  }
  if (
    !["internal", "client"].includes(decision.scope ?? "") ||
    !permittedProjects.includes(decision.projectCode)
  )
    throw new Error("Choose an existing permitted project.");
  if (!decision.stage || !stages.includes(decision.stage))
    throw new Error("Choose the applicable workflow stage.");
}
