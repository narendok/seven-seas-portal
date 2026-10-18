import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Briefcase,
  Users,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  UserPlus,
  SlidersHorizontal,
  FolderKanban,
  Table as TableIcon,
  Sparkles,
  Award,
  Layers,
  ArrowUpDown,
  Tag,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TeamMember {
  name: string;
  area: string;
  role: string;
  score: string;
  level: string;
  skills: string[];
}

export interface TaskRecord {
  id: string;
  area: string;
  type: string;
  title: string;
  status: "Draft" | "Open" | "In review" | "Approved" | "Released" | "Archived";
  priority: "Low" | "Normal" | "High" | "Critical";
  reference: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  fields: Record<string, string>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  customer: string;
  currentStage: string;
  targetDate: string;
  volume: string;
  deliverable?: string;
  progress?: number;
}

interface DepartmentLeadCoordinationCenterProps {
  departmentCode: string; // e.g. "EHW", "SAL", "PUR", "QA"
  departmentName: string;
  departmentLead: string;
  records: TaskRecord[];
  teamMembers: TeamMember[];
  projects?: ProjectSummary[] | undefined;
  projectScope: string;
  onProjectScopeChange: (scope: string) => void;
  onUpdateTaskAssignee: (taskId: string, newAssignee: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskRecord["status"]) => void;
  onCreateTask: (task: {
    title: string;
    priority: "Low" | "Normal" | "High" | "Critical";
    assignee: string;
    projectId: string;
    dueDate: string;
    notes: string;
  }) => boolean | void | Promise<boolean | void>;
  onAddTeamMember?: ((member: TeamMember) => void) | undefined;
  readOnly?: boolean | undefined;
}

const DEFAULT_PROJECTS: ProjectSummary[] = [
  {
    id: "HLPL-AI4T-01",
    name: "Tata Ace EV 4G AIS-140 Telematics Gateway",
    customer: "Tata Motors Limited (EV Fleet Division, Pune)",
    currentStage: "Stage 7 · Production Release & PPAP L3",
    targetDate: "2026-11-30",
    volume: "50,000 units/year",
    deliverable: "Schematics Rev 2.1, Production Gerber & DVP&R Approval",
    progress: 92,
  },
  {
    id: "HLPL-SLCT-01",
    name: "AIS-140 High-Reliability Telematics Gateway",
    customer: "Select Motors Ltd",
    currentStage: "Stage 8 · Type Approval ARAI TAC",
    targetDate: "2026-12-15",
    volume: "10,000 units/year",
    deliverable: "Type Approval TAC #842 Dossier & SMT Line 2 Control Plan",
    progress: 88,
  },
  {
    id: "HLPL-XLINK-03",
    name: "Commercial Vehicle Fleet Gateway (Dual CAN + OBD-II)",
    customer: "Commercial Logistics & Transport Fleets",
    currentStage: "Stage 4 · Design PoC & Bring-up",
    targetDate: "2027-02-28",
    volume: "25,000 units/year",
    deliverable: "Dual CAN J1939 Transceiver Layout & FreeRTOS Telemetry Stack",
    progress: 58,
  },
  {
    id: "HLPL-OBD4-01",
    name: "Ashok Leyland OBD-II Telematics & Diagnostics Gateway",
    customer: "Ashok Leyland Limited (Chennai)",
    currentStage: "Stage 3 · Commercial Lock & PRS Freeze",
    targetDate: "2027-04-15",
    volume: "20,000 units/year",
    deliverable: "Customer SOR Sign-off & Technical Architecture Specification",
    progress: 45,
  },
];

export function DepartmentLeadCoordinationCenter({
  departmentCode,
  departmentName,
  departmentLead,
  records,
  teamMembers,
  projects = DEFAULT_PROJECTS,
  projectScope,
  onProjectScopeChange,
  onUpdateTaskAssignee,
  onUpdateTaskStatus,
  onCreateTask,
  onAddTeamMember,
  readOnly = false,
}: DepartmentLeadCoordinationCenterProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "teams">("tasks");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState<boolean>(false);
  const [prefilledAssignee, setPrefilledAssignee] = useState<string>("");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskProject, setNewTaskProject] = useState<string>(
    projectScope !== "all" ? projectScope : ""
  );
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>(departmentLead);
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Normal" | "High" | "Critical">("Normal");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newTaskNotes, setNewTaskNotes] = useState<string>("");

  // New team member form state
  const [newMemberName, setNewMemberName] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("");
  const [newMemberLevel, setNewMemberLevel] = useState<string>("Level 3");
  const [newMemberScore, setNewMemberScore] = useState<string>("3.70/4");
  const [newMemberSkills, setNewMemberSkills] = useState<string>("");

  // Filter tasks to department tasks
  const deptTasks = useMemo(() => {
    return records.filter((r) => r.type === "Task");
  }, [records]);

  // Scoped tasks based on projectScope, statusFilter, assigneeFilter, and searchQuery
  const filteredTasks = useMemo(() => {
    return deptTasks.filter((task) => {
      // Project scope
      if (projectScope !== "all") {
        const pId = task.fields["projectId"] ?? task.fields["projectCode"] ?? task.reference;
        if (!pId.includes(projectScope) && task.reference !== projectScope) {
          return false;
        }
      }

      // Status
      if (statusFilter !== "ALL") {
        if (statusFilter === "OPEN" && task.status !== "Open" && task.status !== "Draft") return false;
        if (statusFilter === "IN_REVIEW" && task.status !== "In review") return false;
        if (statusFilter === "APPROVED" && task.status !== "Approved" && task.status !== "Released") return false;
      }

      // Assignee
      if (assigneeFilter !== "ALL") {
        const taskAssignee = task.fields["assignee"] ?? departmentLead;
        if (taskAssignee !== assigneeFilter) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchRef = task.reference.toLowerCase().includes(q);
        const matchAssignee = (task.fields["assignee"] ?? "").toLowerCase().includes(q);
        if (!matchTitle && !matchRef && !matchAssignee) return false;
      }

      return true;
    });
  }, [deptTasks, projectScope, statusFilter, assigneeFilter, searchQuery, departmentLead]);

  // Compute workload per team member
  const memberWorkloads = useMemo(() => {
    const counts: Record<string, number> = {};
    teamMembers.forEach((m) => {
      counts[m.name] = 0;
    });
    deptTasks.forEach((t) => {
      const a = t.fields["assignee"] ?? departmentLead;
      if (t.status !== "Approved" && t.status !== "Released") {
        counts[a] = (counts[a] ?? 0) + 1;
      }
    });
    return counts;
  }, [deptTasks, teamMembers, departmentLead]);

  const handleOpenCreateTask = (assignee?: string) => {
    setNewTaskAssignee(assignee ?? departmentLead);
    setNewTaskProject(projectScope !== "all" ? projectScope : "");
    setNewTaskTitle("");
    setNewTaskPriority("Normal");
    setNewTaskDueDate(new Date().toISOString().slice(0, 10));
    setNewTaskNotes("");
    setIsCreateTaskOpen(true);
  };

  const handleSaveNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee) return;
    const saved = await onCreateTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      projectId: newTaskProject,
      dueDate: newTaskDueDate,
      notes: newTaskNotes.trim(),
    });
    if (saved === false) return;
    setIsCreateTaskOpen(false);
  };

  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    const skillsList = newMemberSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onAddTeamMember?.({
      name: newMemberName.trim(),
      area: departmentCode.toLowerCase(),
      role: newMemberRole.trim(),
      level: newMemberLevel,
      score: newMemberScore,
      skills: skillsList.length ? skillsList : ["Department Operations", "IATF 16949"],
    });
    setIsAddMemberOpen(false);
    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberSkills("");
  };

  return (
    <div className="space-y-5">
      {/* Top Department Lead Coordination Header Strip */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                {departmentCode} · COORDINATION HUB
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Lead: <strong className="text-foreground">{departmentLead}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {departmentName} — Operations & Team Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Unified control center to manage department tasks, project commitments, and team member workload
              balancing in 1 click.
            </p>
          </div>

          {/* Quick Scope Selector & Create Task CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5">
              <FolderKanban className="size-3.5 text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Project Scope:
              </span>
              <select
                value={projectScope}
                onChange={(e) => onProjectScopeChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
              >
                <option value="all">All Projects (Rollup)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {p.name.split(" ")[0]} {p.name.split(" ")[1]}
                  </option>
                ))}
              </select>
            </div>

            {!readOnly && (
              <Button
                size="sm"
                onClick={() => handleOpenCreateTask()}
                className="h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="size-3.5" />
                Assign New Task
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === "tasks"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CheckSquare className="size-3.5" />
              Teams Tasks
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "tasks" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {filteredTasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === "projects"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Briefcase className="size-3.5" />
              Department Projects
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "projects" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === "teams"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users className="size-3.5" />
              Department Teams & Capacity
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "teams" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {teamMembers.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle when on Tasks tab */}
          {activeTab === "tasks" && (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderKanban className="size-3" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="size-3" />
                Table
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: TEAMS TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status filter buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === "ALL" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({deptTasks.length})
                </button>
                <button
                  onClick={() => setStatusFilter("OPEN")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === "OPEN" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Open / In Progress
                </button>
                <button
                  onClick={() => setStatusFilter("IN_REVIEW")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === "IN_REVIEW" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Under Review
                </button>
                <button
                  onClick={() => setStatusFilter("APPROVED")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === "APPROVED" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Assignee filter dropdown */}
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs">
                <Users className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Assignee:</span>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="bg-transparent font-semibold text-foreground outline-none cursor-pointer"
                >
                  <option value="ALL">All Team Members</option>
                  {teamMembers.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({memberWorkloads[m.name] ?? 0} tasks)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search box */}
            <div className="relative min-w-60">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks, reference, or assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* KANBAN VIEW */}
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Column 1: Backlog / Open */}
              <KanbanColumn
                title="To Do / Open"
                count={filteredTasks.filter((t) => t.status === "Open" || t.status === "Draft").length}
                tone="blue"
                tasks={filteredTasks.filter((t) => t.status === "Open" || t.status === "Draft")}
                teamMembers={teamMembers}
                onUpdateAssignee={onUpdateTaskAssignee}
                onUpdateStatus={onUpdateTaskStatus}
                departmentLead={departmentLead}
                readOnly={readOnly}
              />

              {/* Column 2: In Progress */}
              <KanbanColumn
                title="In Progress"
                count={
                  filteredTasks.filter(
                    (t) =>
                      t.status === "Open" &&
                      (t.fields["stage"]?.toLowerCase().includes("progress") ||
                        t.notes?.toLowerCase().includes("bring-up") ||
                        t.notes?.toLowerCase().includes("active"))
                  ).length
                }
                tone="amber"
                tasks={filteredTasks.filter(
                  (t) =>
                    t.status === "Open" &&
                    (t.fields["stage"]?.toLowerCase().includes("progress") ||
                      t.notes?.toLowerCase().includes("bring-up") ||
                      t.notes?.toLowerCase().includes("active"))
                )}
                teamMembers={teamMembers}
                onUpdateAssignee={onUpdateTaskAssignee}
                onUpdateStatus={onUpdateTaskStatus}
                departmentLead={departmentLead}
                readOnly={readOnly}
              />

              {/* Column 3: Under Review / Gate */}
              <KanbanColumn
                title="Under Review / Gate"
                count={filteredTasks.filter((t) => t.status === "In review").length}
                tone="purple"
                tasks={filteredTasks.filter((t) => t.status === "In review")}
                teamMembers={teamMembers}
                onUpdateAssignee={onUpdateTaskAssignee}
                onUpdateStatus={onUpdateTaskStatus}
                departmentLead={departmentLead}
                readOnly={readOnly}
              />

              {/* Column 4: Completed / Released */}
              <KanbanColumn
                title="Completed & Released"
                count={filteredTasks.filter((t) => t.status === "Approved" || t.status === "Released").length}
                tone="green"
                tasks={filteredTasks.filter((t) => t.status === "Approved" || t.status === "Released")}
                teamMembers={teamMembers}
                onUpdateAssignee={onUpdateTaskAssignee}
                onUpdateStatus={onUpdateTaskStatus}
                departmentLead={departmentLead}
                readOnly={readOnly}
              />
            </div>
          ) : (
            /* DENSE TABLE VIEW */
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-muted-foreground text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Task & Ref</th>
                    <th className="px-3 py-3">Project</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-primary" />
                        1-Click Assignee Switcher
                      </span>
                    </th>
                    <th className="px-3 py-3">Due Date</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No tasks match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const currentAssignee = task.fields["assignee"] ?? departmentLead;
                      const taskProj = task.fields["projectId"] ?? task.fields["projectCode"] ?? task.reference;

                      return (
                        <tr key={task.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] font-bold text-primary block">
                              {task.reference}
                            </span>
                            <span className="font-semibold text-foreground block text-xs mt-0.5">
                              {task.title}
                            </span>
                            {task.notes && (
                              <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {task.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-secondary-foreground">
                              {taskProj}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative inline-block w-48">
                              <select
                                value={currentAssignee}
                                onChange={(e) => onUpdateTaskAssignee(task.id, e.target.value)}
                                disabled={readOnly}
                                className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground shadow-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50"
                              >
                                {teamMembers.map((m) => (
                                  <option key={m.name} value={m.name}>
                                    {m.name} ({m.role.split(" ")[0]})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">
                            {task.fields["dueDate"] ?? "2026-11-15"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <select
                              value={task.status}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskRecord["status"])}
                              disabled={readOnly}
                              className="h-7 rounded border border-border bg-background px-2 text-[10px] font-semibold outline-none cursor-pointer"
                            >
                              <option value="Open">Open</option>
                              <option value="In review">Review</option>
                              <option value="Approved">Complete</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEPARTMENT PROJECTS */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((proj) => {
            const projectTasks = deptTasks.filter((t) => {
              const pId = t.fields["projectId"] ?? t.fields["projectCode"] ?? t.reference;
              return pId.includes(proj.id) || t.reference === proj.id;
            });
            const openCount = projectTasks.filter((t) => t.status !== "Approved" && t.status !== "Released").length;
            const completedCount = projectTasks.filter((t) => t.status === "Approved" || t.status === "Released").length;

            return (
              <div
                key={proj.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {proj.id}
                      </span>
                      <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-secondary-foreground">
                        {proj.currentStage.split("·")[0]?.trim()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground">{proj.customer}</p>
                  </div>

                  <div className="text-right">
                    <span className="block font-mono text-xs font-bold text-foreground">
                      {proj.progress ?? 85}%
                    </span>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Dept Progress</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${proj.progress ?? 85}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Target: {proj.targetDate}</span>
                    <span>Volume: {proj.volume}</span>
                  </div>
                </div>

                {/* Department Deliverable */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-primary block">
                    Department Deliverable & Milestone:
                  </span>
                  <p className="font-medium text-foreground">
                    {proj.deliverable ?? "Schematic Rev 2.1, Production Gerber & DVP&R Approval"}
                  </p>
                </div>

                {/* Task counts & filter CTA */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{openCount}</strong> Open Tasks
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-foreground">{completedCount}</strong> Completed
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onProjectScopeChange(proj.id);
                      setActiveTab("tasks");
                    }}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    View Project Tasks
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: DEPARTMENT TEAMS & WORKLOAD MANAGEMENT */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Department Team Roster & Competency Matrix
              </h3>
              <p className="text-xs text-muted-foreground">
                View active workloads, engineering competency tiers, and directly assign new tasks to team members.
              </p>
            </div>

            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMemberOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <UserPlus className="size-3.5" />
                Add Team Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => {
              const taskCount = memberWorkloads[member.name] ?? 0;
              const capacityPct = Math.min(100, Math.round((taskCount / 4) * 100));
              const capacityColor =
                capacityPct > 80 ? "bg-rose-500" : capacityPct > 50 ? "bg-amber-500" : "bg-emerald-500";

              return (
                <div
                  key={member.name}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>

                      <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-secondary-foreground">
                        {member.level}
                      </span>
                    </div>

                    {/* Workload Capacity Bar */}
                    <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/20 p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Active Workload
                        </span>
                        <span className="font-semibold text-foreground">
                          {taskCount} Tasks ({capacityPct}% Capacity)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${capacityColor}`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Competency Skills Badges */}
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAssigneeFilter(member.name);
                        setActiveTab("tasks");
                      }}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View Tasks ({taskCount})
                    </Button>

                    {!readOnly && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenCreateTask(member.name)}
                        className="h-7 gap-1 text-xs font-semibold px-2.5"
                      >
                        <Plus className="size-3" />
                        Assign Task
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / ASSIGN NEW TASK */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Assign New Department Task</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateTaskOpen(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSaveNewTask} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schematics SCH-01 draft & MCU bring-up"
                  aria-label="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Project
                  </label>
                  <select
                    aria-label="Task project"
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Department task — no project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} · {p.name.split(" ")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Assignee Team Member *
                  </label>
                  <select
                    aria-label="Task assignee"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.role.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) =>
                      setNewTaskPriority(e.target.value as "Low" | "Normal" | "High" | "Critical")
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Task Scope / Acceptance Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail technical deliverables, compliance references, or handover gates..."
                  aria-label="Task scope"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-semibold">
                  Create & Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEAM MEMBER */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Add Team Member to {departmentCode}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddMemberOpen(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSaveNewMember} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior PCB Layout Engineer"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Competency Level
                  </label>
                  <select
                    value={newMemberLevel}
                    onChange={(e) => setNewMemberLevel(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Level 2">Level 2 - Practitioner</option>
                    <option value="Level 3">Level 3 - Independent</option>
                    <option value="Level 4">Level 4 - Advanced Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Skill Score
                  </label>
                  <input
                    type="text"
                    value={newMemberScore}
                    onChange={(e) => setNewMemberScore(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Core Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Altium Designer, High-Speed Routing, ISO 7637-2"
                  value={newMemberSkills}
                  onChange={(e) => setNewMemberSkills(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-semibold">
                  Add to Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents: Kanban Column & Task Card
function KanbanColumn({
  title,
  count,
  tone,
  tasks,
  teamMembers,
  onUpdateAssignee,
  onUpdateStatus,
  departmentLead,
  readOnly,
}: {
  title: string;
  count: number;
  tone: "blue" | "amber" | "purple" | "green";
  tasks: TaskRecord[];
  teamMembers: TeamMember[];
  onUpdateAssignee: (taskId: string, newAssignee: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskRecord["status"]) => void;
  departmentLead: string;
  readOnly?: boolean | undefined;
}) {
  const headerTone =
    tone === "blue"
      ? "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400"
      : tone === "amber"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
      : tone === "purple"
      ? "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400"
      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-muted/20 p-3 min-h-[460px]">
      <div className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${headerTone}`}>
        <span>{title}</span>
        <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[11px] font-bold text-foreground shadow-xs">
          {count}
        </span>
      </div>

      <div className="mt-3 flex-1 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            No tasks in this lane
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              onUpdateAssignee={onUpdateAssignee}
              onUpdateStatus={onUpdateStatus}
              departmentLead={departmentLead}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanTaskCard({
  task,
  teamMembers,
  onUpdateAssignee,
  onUpdateStatus,
  departmentLead,
  readOnly,
}: {
  task: TaskRecord;
  teamMembers: TeamMember[];
  onUpdateAssignee: (taskId: string, newAssignee: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskRecord["status"]) => void;
  departmentLead: string;
  readOnly?: boolean | undefined;
}) {
  const currentAssignee = task.fields["assignee"] ?? departmentLead;
  const projectRef = task.fields["projectId"] ?? task.fields["projectCode"] ?? task.reference;

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5 hover:border-primary/50 transition-all">
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          {task.reference}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      <p className="text-xs font-bold text-foreground leading-snug tracking-tight">
        {task.title}
      </p>

      {task.notes && (
        <p className="text-[11px] text-muted-foreground line-clamp-2">
          {task.notes}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
        <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-secondary-foreground font-semibold">
          {projectRef}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {task.fields["dueDate"] ?? "2026-11-15"}
        </span>
      </div>

      {/* 1-Click Instant Assignee Switcher */}
      <div className="pt-2 border-t border-border/40">
        <span className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Assigned Engineer (1-Click Switch):
        </span>
        <select
          value={currentAssignee}
          onChange={(e) => onUpdateAssignee(task.id, e.target.value)}
          disabled={readOnly}
          className="h-7 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary"
        >
          {teamMembers.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name} ({m.role.split(" ")[0]})
            </option>
          ))}
        </select>
      </div>

      {/* Quick Move Button */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-1 text-[10px]">
          <span className="text-muted-foreground font-mono">Move:</span>
          <div className="flex items-center gap-1">
            {task.status !== "Open" && (
              <button
                onClick={() => onUpdateStatus(task.id, "Open")}
                className="rounded px-1.5 py-0.5 font-semibold text-muted-foreground hover:bg-muted"
              >
                Open
              </button>
            )}
            {task.status !== "In review" && (
              <button
                onClick={() => onUpdateStatus(task.id, "In review")}
                className="rounded px-1.5 py-0.5 font-semibold text-amber-600 hover:bg-amber-500/10"
              >
                Review
              </button>
            )}
            {task.status !== "Approved" && (
              <button
                onClick={() => onUpdateStatus(task.id, "Approved")}
                className="rounded px-1.5 py-0.5 font-semibold text-emerald-600 hover:bg-emerald-500/10"
              >
                Done ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Critical"
      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
      : priority === "High"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
      : priority === "Normal"
      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
      : "bg-slate-500/10 text-slate-600 border-slate-500/30";

  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${tone}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Approved" || status === "Released"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      : status === "In review"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
      : "bg-blue-500/10 text-blue-600 border-blue-500/30";

  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${tone}`}>
      {status}
    </span>
  );
}
