export type DraftSource = { reference: string; fields: Record<string, string>; notes?: string | undefined };
type Section = { title: string; fields: string[] };
const formats: Record<string, Section[]> = {
  SOR: [{ title: "Customer scope", fields: ["customer", "scope", "quantity", "targetDate"] }, { title: "Requirements and acceptance", fields: ["requirements", "interfaces", "acceptanceCriteria", "constraints"] }],
  NDA: [{ title: "Parties and purpose", fields: ["parties", "purpose", "effectiveDate"] }, { title: "Confidentiality and execution", fields: ["obligations", "exclusions", "term", "governingLaw", "executionEvidence"] }],
  QUO: [{ title: "Commercial offer", fields: ["customer", "lineItems", "quantity", "currency", "unitPrice", "toolingCost"] }, { title: "Terms and validity", fields: ["taxBasis", "paymentTerms", "leadTime", "validUntil", "exclusions"] }],
  REVIEW: [{ title: "Feasibility review", fields: ["requirements", "technicalFeasibility", "capacity", "sourcing", "costImpact", "scheduleImpact"] }, { title: "Decision and actions", fields: ["risks", "actions", "decision", "reviewEvidence"] }],
  PRS: [{ title: "Requirements baseline", fields: ["scope", "requirements", "architecture", "interfaces"] }, { title: "Design limits and verification", fields: ["voltage", "temperatureRange", "environmental", "compliance", "acceptanceCriteria", "verificationLinks"] }],
  BOM: [{ title: "Controlled bill of materials", fields: ["bomRevision", "lineItems", "mpn", "manufacturer", "quantity", "unit"] }, { title: "Sourcing and cost", fields: ["alternates", "qualificationEvidence", "unitCost", "currency", "leadTime"] }],
  DFMEA: [{ title: "Design risk analysis", fields: ["function", "failureMode", "effect", "cause", "preventionControls", "detectionControls"] }, { title: "Assessment and actions", fields: ["methodVersion", "severity", "occurrence", "detection", "actionPriority", "actions", "actionOwner", "verificationEvidence"] }],
  CP: [{ title: "Process control", fields: ["processStep", "machine", "characteristic", "specification", "measurementMethod"] }, { title: "Sampling and reaction", fields: ["sampleSize", "frequency", "reactionPlan", "owner", "evidence"] }],
  DVP: [{ title: "Verification plan", fields: ["requirementId", "testId", "method", "standardVersion", "testConditions", "sampleConfiguration", "acceptanceCriteria"] }, { title: "Actual results", fields: ["plannedDate", "actualDate", "measuredResult", "testEvidence", "disposition"] }],
  PDI: [{ title: "Inspection scope", fields: ["batch", "serialRange", "quantity", "configuration", "testRig", "calibrationEvidence"] }, { title: "Inspection results", fields: ["checks", "acceptanceCriteria", "measuredResult", "failures", "rework", "releaseEvidence"] }],
  INV: [{ title: "Invoice parties and references", fields: ["seller", "buyer", "consignee", "orderReference", "dispatchReference"] }, { title: "Invoice calculation", fields: ["lineItems", "quantity", "unitPrice", "currency", "taxClassification", "taxRate", "taxAmount", "total", "paymentTerms"] }],
  SKILL: [{ title: "Competency assessment", fields: ["employee", "role", "skill", "requiredLevel", "observedLevel", "assessor", "assessmentEvidence"] }, { title: "Training and review", fields: ["gap", "trainingPlan", "dueDate", "reassessment"] }],
};

export function draftType(title: string, id: string): string | undefined {
  const value = `${title} ${id}`.toUpperCase();
  if (/DFMEA/.test(value)) return "DFMEA";
  if (/CONTRACT REVIEW|MKT\/01/.test(value)) return "REVIEW";
  if (/SKILL MATRIX|HR\/03/.test(value)) return "SKILL";
  if (/PRE.DISPATCH|PRE.DELIVERY/.test(value)) return "PDI";
  if (/CONTROL PLAN|[-/]CP[-/]/.test(value)) return "CP";
  if (/REQUIREMENT SPEC|[-/]PRS[-/]/.test(value)) return "PRS";
  return ["SOR", "NDA", "QUO", "BOM", "DVP", "PDI", "INV"].find(type => value.includes(type));
}

/** Values are copied from a referenced source, never inferred from a product family. */
export function buildDocumentDraft(title: string, id: string, source?: DraftSource, project?: DraftSource) {
  const type = draftType(title, id);
  const sections = type ? formats[type] : undefined;
  return {
    type,
    supported: Boolean(sections),
    sections: (sections ?? [{ title: "Source document", fields: ["scope", "requirements", "evidence"] }]).map(section => ({
      title: section.title,
      rows: section.fields.map(field => {
        const own = source?.fields[field]?.trim();
        // Only shared identification fields may come from a project record.
        const baseline = ["customer", "quantity", "targetDate"].includes(field) ? project?.fields[field]?.trim() : undefined;
        return [field.replace(/([a-z])([A-Z])/g, '$1 $2'), own || baseline || "TBD — owner confirmation required", own ? source!.reference : baseline ? project!.reference : "No source provided"];
      }),
    })),
  };
}
