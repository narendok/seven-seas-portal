import type { EnquiryOpportunity } from "../components/SalesWorkspaceAndCustomerRegister";

type IntakeRecord = { id: string; reference: string; type: string; title: string; fields: Record<string,string>; createdAt: string; updatedAt: string; archived?: boolean };

export function validateIntakeProject(records: Pick<IntakeRecord,"id"|"reference"|"type"|"archived">[], type: string, projectId: string): string {
  const code = projectId.trim();
  if (type === "Project") {
    if (!/^HLPL-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code)) throw new Error("Enter a unique project code, for example HLPL-OBDTEST-01.");
    if (records.some(record => record.reference.toUpperCase() === code)) throw new Error("This project code already exists, including archived records.");
    return code;
  }
  if (!code || !records.some(record => record.type === "Project" && !record.archived && [record.id,record.reference].includes(code))) {
    throw new Error("Select an existing project, or create a project first.");
  }
  return code;
}

export function salesEnquiryFromRecord(record: IntakeRecord, customers: {code:string;name:string;spocName:string;spocEmail:string}[]): EnquiryOpportunity {
  const customer = customers.find(item => item.name === record.fields["customer"]);
  return {
    id: record.id, reference: record.reference, kind: record.type === "Opportunity" ? "opportunity" : "enquiry",
    title: record.title, customerCode: customer?.code ?? "", customerName: customer?.name ?? record.fields["customer"] ?? "Not recorded",
    spocName: customer?.spocName ?? "", spocEmail: customer?.spocEmail ?? "",
    scopeSummary: record.fields["scope"] ?? "", targetVolume: record.fields["quantity"] ?? "Not recorded",
    targetClosureDate: record.fields["targetDate"] ?? "", salesOwner: record.fields["owner"] ?? "Not assigned",
    status: "Pending Enquiry", feasibilitySignedDepts: [], totalFeasibilityDepts: 0,
    linkedProjectCode: record.fields["projectId"] ?? "", createdAt: record.createdAt, updatedAt: record.updatedAt,
  };
}
