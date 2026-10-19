import type { DepartmentChronicle } from "./department-chronicles";

/** Local configuration history only. Backend approval and signer authority remain unverified. */
export type ResponsibilityVersion = {
  id: string;
  effectiveAt: string;
  status: "Draft";
  chronicles: DepartmentChronicle[];
};

type Configuration = {
  chronicles?: DepartmentChronicle[] | undefined;
  responsibilityVersions?: ResponsibilityVersion[] | undefined;
  records: { type: string; fields: Record<string, string>; [key: string]: unknown }[];
};

export function evolveResponsibilityConfiguration<T extends Configuration>(state: T, previous: DepartmentChronicle[], updated: DepartmentChronicle[], effectiveAt: string): T {
  const versions = [...(state.responsibilityVersions ?? [])];
  const snapshot = (chronicles: DepartmentChronicle[]): ResponsibilityVersion => ({
    id: `local-responsibility-${versions.length + 1}`, effectiveAt, status: "Draft",
    chronicles: chronicles.map(chronicle => ({ ...chronicle })),
  });
  if (!versions.length) versions.push(snapshot(previous));
  const baseline = versions[versions.length - 1]!;
  const records = state.records.map(record => record.type === "Project" && !record.fields["responsibilityVersion"]
    ? { ...record, fields: { ...record.fields, responsibilityVersion: baseline.id } } : record);
  versions.push(snapshot(updated));
  return { ...state, records, chronicles: updated, responsibilityVersions: versions };
}

export function resolveProjectChronicles(versions: ResponsibilityVersion[] | undefined, versionId: string | undefined, current: DepartmentChronicle[]): DepartmentChronicle[] {
  if (!versionId) return current;
  // A missing pinned version cannot silently inherit the newest configuration.
  return versions?.find(version => version.id === versionId)?.chronicles ?? [];
}
