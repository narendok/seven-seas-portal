import { projectReferences } from "./department-scope";
type LinkedRecord = { id: string; reference: string; type: string; fields: Record<string, string> };
export function recordsForProject<T extends LinkedRecord>(records: T[], project?: {id: string; reference: string}): T[] {
  if (!project) return [];
  const keys = new Set([project.id, project.reference]);
  return records.filter(record => record.id === project.id || projectReferences(record).some(key => keys.has(key)));
}
export function documentsForProject<T extends { linkedRecordRefs?: string[] | undefined }>(documents: T[], records: LinkedRecord[], project: {id: string; reference: string}): T[] {
  const keys = new Set([project.id, project.reference, ...records.flatMap(record => [record.id, record.reference])]);
  return documents.filter(document => document.linkedRecordRefs?.some(reference => keys.has(reference)));
}
