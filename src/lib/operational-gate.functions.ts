import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export interface OperationalMembership {
  organizationId: string;
  organizationName: string;
  membershipId: string;
  displayName: string;
  role: "admin" | "department_lead" | "member" | "viewer";
  departmentId: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  isLead: boolean;
  canSignStageGates: boolean;
}

export const stageGateInputSchema = z.object({
  recordId: z.string().uuid(),
  targetStage: z.string().trim().min(1).max(50),
  evidenceManifest: z
    .object({
      deliverables: z.array(z.string().trim().min(1)).default([]),
      naRationale: z.record(z.string(), z.string()).default({}),
      canonicalContentHash: z.string().trim().default(""),
      notes: z.string().trim().default(""),
      signers: z.array(z.record(z.string(), z.unknown())).default([]),
    })
    .default({
      deliverables: [],
      naRationale: {},
      canonicalContentHash: "",
      notes: "",
      signers: [],
    }),
});

export type StageGateInput = z.infer<typeof stageGateInputSchema>;

export interface StageGateAdvanceResult {
  success: boolean;
  recordId: string;
  previousStage?: string | undefined;
  newStage?: string | undefined;
  stage?: string | undefined;
  approverId?: string | undefined;
  approvalId?: string | undefined;
  auditId?: string | undefined;
  approvedAt?: string | undefined;
  idempotent: boolean;
  message?: string | undefined;
}

interface StageGateRpcPayload {
  success?: boolean;
  record_id?: string;
  previous_stage?: string;
  new_stage?: string;
  stage?: string;
  approver_id?: string;
  approval_id?: string;
  audit_id?: string;
  approved_at?: string;
  idempotent?: boolean;
  message?: string;
}

/**
 * Resolves the authenticated user's active operational organization membership,
 * department alignment, and designated stage gate signing authority.
 * Strictly distinct from the TEST ONLY helper.
 */
export const getOperationalMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OperationalMembership> => {
    const { data: rows, error } = await context.supabase.rpc("resolve_operational_membership");
    if (error) throw error;
    const membership = rows?.[0];
    if (!membership) {
      throw new Error("This authenticated account has no active operational organization membership.");
    }

    return {
      organizationId: membership.organization_id,
      organizationName: membership.organization_name,
      membershipId: membership.membership_id,
      displayName: membership.display_name,
      role: membership.role,
      departmentId: membership.department_id,
      departmentCode: membership.department_code,
      departmentName: membership.department_name,
      isLead: membership.is_lead,
      canSignStageGates: membership.can_sign_stage_gates,
    };
  });

/**
 * Executes an atomic server-side stage gate advance with strict session derivation,
 * APQP freeze deliverable verification, row locking, approval recording, and immutable audit logging.
 */
export const advanceOperationalStageGate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => stageGateInputSchema.parse(data))
  .handler(async ({ data, context }): Promise<StageGateAdvanceResult> => {
    const { data: result, error } = await context.supabase.rpc("verify_and_advance_stage_gate", {
      p_record_id: data.recordId,
      p_target_stage: data.targetStage,
      p_evidence_manifest: {
        deliverables: data.evidenceManifest.deliverables,
        na_rationale: data.evidenceManifest.naRationale,
        canonical_content_hash: data.evidenceManifest.canonicalContentHash,
        notes: data.evidenceManifest.notes,
        signers: data.evidenceManifest.signers,
      } as unknown as Json,
    });

    if (error) {
      throw new Error(error.message || "Failed to advance stage gate.");
    }

    const res = (result ?? {}) as StageGateRpcPayload;
    return {
      success: Boolean(res.success),
      recordId: res.record_id ? String(res.record_id) : data.recordId,
      previousStage: res.previous_stage ? String(res.previous_stage) : undefined,
      newStage: res.new_stage ? String(res.new_stage) : undefined,
      stage: res.stage ? String(res.stage) : undefined,
      approverId: res.approver_id ? String(res.approver_id) : undefined,
      approvalId: res.approval_id ? String(res.approval_id) : undefined,
      auditId: res.audit_id ? String(res.audit_id) : undefined,
      approvedAt: res.approved_at ? String(res.approved_at) : undefined,
      idempotent: Boolean(res.idempotent),
      message: res.message ? String(res.message) : undefined,
    };
  });

/**
 * Validates caller's authorization to access a private controlled document attachment
 * and returns file metadata including SHA-256 digest and storage path.
 */
export const getControlledFileAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ fileId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("get_controlled_file_access", {
      p_file_id: data.fileId,
    });
    if (error) throw new Error(error.message || "Access to this private controlled file was denied.");
    const file = rows?.[0];
    if (!file) throw new Error("Controlled document file not found or access denied.");
    return file;
  });
