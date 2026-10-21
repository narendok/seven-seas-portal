// Input collections must already be permission-filtered by the caller.
// Search refines an authorized collection; it does not grant access.
type SearchRecord = {
  id: string;
  reference: string;
  title: string;
  type: string;
  notes?: string;
  departmentId?: string | undefined;
  archived?: boolean | undefined;
};
type SearchDocument = {
  id: string;
  title: string;
  type: string;
  departmentId?: string | undefined;
  group?: string | undefined;
  device?: string | undefined;
  part?: string | undefined;
};
export function searchVisibleItems<R extends SearchRecord, D extends SearchDocument>(
  records: R[],
  documents: D[],
  query: string,
  kind: string,
  department: string,
  allowedProjectIds: string[] = [],
) {
  const needle = query.trim().toLocaleLowerCase();
  const matches = (text: string) => text.toLocaleLowerCase().includes(needle);
  const matchingKind = (r: R) =>
    kind === "All" ||
    (kind === "Clients" && /^(Customer|Client)$/i.test(r.type)) ||
    (kind === "Projects" && r.type === "Project") ||
    (kind === "Tasks" && r.type === "Task") ||
    (kind === "Audits" && /audit|inspection|ncr|capa|review/i.test(r.type)) ||
    (kind === "Processes" && !["Project", "Task", "Customer", "Client"].includes(r.type));
  const unique = <T extends { id: string }>(items: T[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };
  return {
    records: unique(
      records.filter(
        (r) =>
          !r.archived &&
          (department === "All departments" ||
            r.departmentId === department ||
            (r.type === "Project" && allowedProjectIds.includes(r.id))),
      ),
    ).filter(
      (r) => matchingKind(r) && matches(`${r.reference} ${r.title} ${r.type} ${r.notes ?? ""}`),
    ),
    documents: unique(
      documents.filter((d) => department === "All departments" || d.departmentId === department),
    ).filter(
      (d) =>
        (kind === "All" || kind === "Documents") &&
        matches(`${d.title} ${d.type} ${d.group ?? ""} ${d.device ?? ""} ${d.part ?? ""}`),
    ),
  };
}
