export type DraftSource = { reference: string; fields: Record<string, string>; notes?: string | undefined };
export type Section = { title: string; fields: string[] };
export const DOCUMENT_FORMATS: Record<string, Section[]> = {
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

/** Explicit aliases are compatibility inputs; arbitrary substrings never select a template. */
export const DOCUMENT_TEMPLATE_VERSION = "2026-10-19.1";
export const DOCUMENT_TEMPLATE_REGISTRY = Object.fromEntries(Object.keys(DOCUMENT_FORMATS).map(type => [type, {
  type, version: DOCUMENT_TEMPLATE_VERSION, classification: "Internal draft",
  releaseStatus: "Unissued", reviewRequired: true,
  sections: DOCUMENT_FORMATS[type],
}]));

export function draftType(title: string, id: string, explicitType?: string): string | undefined {
  if (explicitType !== undefined) return Object.hasOwn(DOCUMENT_FORMATS, explicitType.toUpperCase()) ? explicitType.toUpperCase() : undefined;
  const value = `${title} ${id}`.toUpperCase();
  const tokens = value.split(/[^A-Z0-9]+/).filter(Boolean);
  const matches = Object.keys(DOCUMENT_FORMATS).filter(type => tokens.includes(type));
  if (tokens.includes("MNDA")) matches.push("NDA");
  if (/CONTRACT REVIEW|MKT\/01/.test(value)) matches.push("REVIEW");
  if (/SKILL MATRIX|HR\/03/.test(value)) matches.push("SKILL");
  if (/PRE.DISPATCH|PRE.DELIVERY/.test(value)) matches.push("PDI");
  if (/CONTROL PLAN/.test(value)) matches.push("CP");
  if (/REQUIREMENT SPEC/.test(value)) matches.push("PRS");
  const unique = [...new Set(matches)];
  return unique.length === 1 ? unique[0] : undefined;
}

/** Values are copied from a referenced source, never inferred from a product family. */
export function buildDocumentDraft(title: string, id: string, source?: DraftSource, project?: DraftSource, explicitType?: string) {
  const type = draftType(title, id, explicitType);
  const sections = type ? DOCUMENT_FORMATS[type] : undefined;
  return {
    type,
    templateVersion: DOCUMENT_TEMPLATE_VERSION,
    missingFields: (sections ?? []).flatMap(section => section.fields).filter(field => !source?.fields[field]?.trim() && !(["customer", "quantity", "targetDate"].includes(field) && project?.fields[field]?.trim())),
    snapshot: {
      templateType: type ?? null, templateVersion: DOCUMENT_TEMPLATE_VERSION,
      source: source ? { ...source, fields: { ...source.fields } } : null,
      project: project ? { ...project, fields: { ...project.fields } } : null,
      releaseStatus: "Unissued", classification: "Internal draft",
    },
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
