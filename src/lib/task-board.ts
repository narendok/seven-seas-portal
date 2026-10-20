import { businessDate } from "./business-date";
export type TaskLane = "today" | "review" | "todo" | "completed";
export function taskLane(task: { status: string; fields: Record<string, string> }, today = businessDate()): TaskLane {
  if (task.status === "Approved" || task.status === "Released") return "completed";
  if (task.status === "In review") return "review";
  const progress = task.fields["workStatus"] ?? task.fields["stage"] ?? "";
  if (/^(in[ -]?progress|progress|active)$/i.test(progress.trim()) || (/^\d{4}-\d{2}-\d{2}$/.test(task.fields["dueDate"] ?? "") && task.fields["dueDate"]! <= today)) return "today";
  return "todo";
}
