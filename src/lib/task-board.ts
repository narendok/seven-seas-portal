import { businessDate } from "./business-date";

export type TaskLane = "today" | "review" | "todo" | "completed";

export function taskLane(task: { status: string; fields: Record<string, string> }, today = businessDate()): TaskLane {
  if (task.status === "Approved" || task.status === "Released" || task.status === "Complete" || task.status === "Completed") return "completed";
  if (task.status === "In review") return "review";
  const progress = task.fields["workStatus"] ?? task.fields["stage"] ?? "";
  if (/^(in[ -]?progress|progress|active)$/i.test(progress.trim()) || (/^\d{4}-\d{2}-\d{2}$/.test(task.fields["dueDate"] ?? "") && task.fields["dueDate"]! <= today)) return "today";
  return "todo";
}

export function isTaskOverdue(task: { fields: Record<string, string> }, today = businessDate()): boolean {
  const due = task.fields["dueDate"];
  return Boolean(due && /^\d{4}-\d{2}-\d{2}$/.test(due) && due < today);
}

const PRIORITY_WEIGHT: Record<string, number> = {
  Critical: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};

export function sortTaskRecords<T extends { id: string; priority?: string; fields: Record<string, string> }>(
  tasks: T[],
  today = businessDate()
): T[] {
  return [...tasks].sort((a, b) => {
    // 1. Priority: Critical -> High -> Normal -> Low
    const pA = PRIORITY_WEIGHT[a.priority ?? "Normal"] ?? 2;
    const pB = PRIORITY_WEIGHT[b.priority ?? "Normal"] ?? 2;
    if (pA !== pB) return pB - pA;

    // 2. Overdue first within equal priority
    const overdueA = isTaskOverdue(a, today);
    const overdueB = isTaskOverdue(b, today);
    if (overdueA && !overdueB) return -1;
    if (!overdueA && overdueB) return 1;

    // 3. Earliest applicable due date
    const dueA = a.fields["dueDate"] ?? "";
    const dueB = b.fields["dueDate"] ?? "";
    if (dueA && dueB && dueA !== dueB) {
      return dueA.localeCompare(dueB);
    }
    if (dueA && !dueB) return -1;
    if (!dueA && dueB) return 1;

    // 4. Stable tie-breaker: ID
    return a.id.localeCompare(b.id);
  });
}
