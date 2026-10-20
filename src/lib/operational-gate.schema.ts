import { z } from "zod";

const revision = z.string().trim().min(1);
export const stageGateDeliverableSchema = z.union([
  z.object({ record_id: z.string().uuid(), revision, approval_id: z.string().uuid() }).strict(),
  z.object({ document_id: z.string().uuid(), revision, approval_id: z.string().uuid() }).strict(),
]);

export const stageGateInputSchema = z.object({
  recordId: z.string().uuid(),
  targetStage: z.string().trim().regex(/^(?:Stage [1-9]|[1-9])$/),
  evidenceManifest: z.object({
    deliverables: z.array(stageGateDeliverableSchema).default([]),
    naRationale: z.record(z.string(), z.object({ approval_id: z.string().uuid() }).strict()).default({}),
    canonicalContentHash: z.string().trim().default(""),
    notes: z.string().trim().default(""),
    signers: z.array(z.record(z.string(), z.unknown())).default([]),
  }).default({ deliverables: [], naRationale: {}, canonicalContentHash: "", notes: "", signers: [] }),
});
export type StageGateInput = z.infer<typeof stageGateInputSchema>;
