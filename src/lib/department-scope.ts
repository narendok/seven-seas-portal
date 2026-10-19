/** Canonical department codes used by the browser-local portal. Backend RLS remains authoritative. */
export function departmentCode(value?: string | null): string {
  const code = (value ?? "").trim().toUpperCase();
  return (
    {
      SALES: "SAL",
      HROPS: "HR",
      "HR/OPS": "HR",
      OPS: "HR",
      PRODUCTION: "EMF",
      QUALITY: "QA",
      STORES: "PUR",
      EFW: "FW",
      FW: "FW",
      FIRMWARE: "FW",
      "EMBEDDED FIRMWARE": "FW",
      CSW: "SW",
      SW: "SW",
      SOFTWARE: "SW",
      "CLOUD SOFTWARE": "SW",
      "CLOUD & APPLICATION SOFTWARE": "SW",
      MMF: "MMF",
      "MECHANICAL MANUFACTURING": "MMF",
      "MECH MFG": "MMF",
    } as Record<string, string>
  )[code] ?? code;
}

export function approvalInDepartment(
  approval: { department?: string | undefined; approverAuthority?: string | undefined },
  department?: string,
): boolean {
  const code = departmentCode(department);
  return Boolean(code && (departmentCode(approval.department) === code || departmentCode(approval.approverAuthority) === code));
}

export function canDepartmentSign(approval: { department?: string | undefined; approverAuthority?: string | undefined }, department?: string): boolean {
  const code = departmentCode(department);
  const authority = departmentCode(approval.approverAuthority);
  return Boolean(code && authority && authority !== "ADMIN" && authority === code);
}

/** Compatibility for the three identified legacy DEMO records only. Never infer authority for real records. */
export function approvalScope<T extends { id: string; department?: string | undefined; approverAuthority?: string | undefined }>(approval: T): T {
  const legacy: Record<string, { department: string; approverAuthority: string }> = {
    "demo-approval-quality-release": { department: "QA", approverAuthority: "Admin" },
    "demo-approval-ecn-002": { department: "EHW", approverAuthority: "QA" },
    "demo-approval-fin-advance": { department: "FIN", approverAuthority: "Admin" },
  };
  const defaults = legacy[approval.id];
  return defaults ? { ...defaults, ...approval, department: approval.department ?? defaults.department, approverAuthority: approval.approverAuthority ?? defaults.approverAuthority } : approval;
}

export function projectReferences(record: { reference: string; type: string; fields: Record<string, string> }): string[] {
  const explicit = [record.fields["projectId"], record.fields["projectCode"]].filter((value): value is string => Boolean(value?.trim())).map(value => value.trim());
  const links = [record.fields["project"], record.fields["linkedRecords"]].flatMap(value => (value ?? "").split(/[,·]/).map(part => part.trim()).filter(Boolean));
  if (record.type === "Project") explicit.push(record.reference);
  return [...new Set([...explicit, ...links, ...links.flatMap(value => value.match(/\bHLPL-[A-Z0-9]+-\d+\b/g) ?? [])])];
}
