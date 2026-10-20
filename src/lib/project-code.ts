// Suggestions are for new local drafts; final save still checks the latest state.
export function suggestProjectCode(
  records: { type: string; reference: string }[],
  prefix = "HLPL",
): string {
  const candidate = prefix.trim().toUpperCase();
  const safePrefix = /^HLPL(?:-[A-Z0-9]+)*$/.test(candidate) ? candidate : "HLPL";
  const used = new Set(
    records.filter((r) => r.type === "Project").map((r) => r.reference.trim().toUpperCase()),
  );
  let sequence = 1;
  while (used.has(`${safePrefix}-PRJ-${String(sequence).padStart(4, "0")}`)) sequence++;
  return `${safePrefix}-PRJ-${String(sequence).padStart(4, "0")}`;
}
