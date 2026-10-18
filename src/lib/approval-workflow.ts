import { approvalScope, canDepartmentSign } from "./department-scope";

export function assertApprovalDecision(
  approval: { id: string; outcome: string; department?: string | undefined; approverAuthority?: string | undefined } | undefined,
  actor: { kind: string; departmentId?: string | undefined },
): void {
  if (!approval) throw new Error("This approval no longer exists.");
  if (approval.outcome !== "Pending") throw new Error("This approval has already been decided. Refresh the record before continuing.");
  if (actor.kind !== "admin" && !(actor.kind === "lead" && canDepartmentSign(approvalScope(approval), actor.departmentId))) {
    throw new Error("Only the designated approver can decide this request.");
  }
}
