/** Apply edits to the most recent saved state while a caller-provided shared lock is held. */
export async function commitLatestState<T>(
  load: () => T,
  save: (state: T) => void,
  recipe: (state: T) => T,
  lock: (commit: () => T) => Promise<T>,
): Promise<T> {
  return lock(() => {
    const next = recipe(load());
    save(next);
    return next;
  });
}

export function patchRecord<T extends { fields: Record<string, string> }>(record: T, patch: Partial<T>): T {
  return { ...record, ...patch, fields: { ...record.fields, ...patch.fields } };
}
