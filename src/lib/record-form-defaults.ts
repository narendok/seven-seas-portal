/** Remove hidden, unrelated defaults without discarding explicit context or provenance fields. */
export function scopeRecordDefaults(
  values: Record<string, string>,
  visibleKeys: string[],
): Record<string, string> {
  const result = { ...values };
  const visible = new Set(visibleKeys);
  for (const key of ["hwStage", "gate", "procurementTrack", "qualityStage", "assignee"]) {
    if (!visible.has(key)) delete result[key];
  }
  return result;
}
