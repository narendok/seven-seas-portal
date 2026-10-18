/** Repair absent seed collections without discarding user-created records or revisions. */
export function repairDemoState<T extends { documents: { id: string }[]; records: unknown[]; departments: unknown[] }>(saved: T, seed: T): T {
  const existing = new Set(saved.documents.map(document => document.id));
  return {
    ...saved,
    documents: [...saved.documents, ...seed.documents.filter(document => !existing.has(document.id))],
    records: saved.records.length ? saved.records : seed.records,
    departments: saved.departments.length ? saved.departments : seed.departments,
  };
}
