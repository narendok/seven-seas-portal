import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Layers,
  FileText,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  Clock,
  X,
} from "lucide-react";
import {
  type DepartmentChronicle,
  type RaciRole,
  type RaciMatrix,
  DEFAULT_DEPARTMENT_CHRONICLES,
  CANONICAL_STAGES,
  CANONICAL_DEPARTMENTS,
  deriveRaciMatrixFromChronicles,
} from "@/lib/department-chronicles";

export type DepartmentChroniclesManagerProps = {
  chronicles: DepartmentChronicle[];
  onUpdateChronicles: (updated: DepartmentChronicle[]) => void;
  onLog?: (action: string, detail: string) => void;
};

const STAGE_LABELS = [
  "Stage 1: Client & Sales Intake",
  "Stage 2: Feasibility & Contract Review",
  "Stage 3: Requirement Freeze & Commercial Lock",
  "Stage 4: Design & Development PoC",
  "Stage 5: Pilot Build & Manufacturing Readiness",
  "Stage 6: DVP&R Pre-Compliance Verification",
  "Stage 7: Production Release, DFMEA & PPAP",
  "Stage 8: Type Approval & Regulatory Certification",
  "Stage 9: PDI, Field Mounting & Commercial Invoicing",
];

export function DepartmentChroniclesManager({
  chronicles,
  onUpdateChronicles,
  onLog,
}: DepartmentChroniclesManagerProps) {
  const [selectedStageFilter, setSelectedStageFilter] = useState<number | "ALL">("ALL");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"chronicles" | "raci">("chronicles");

  // Derive Dynamic RACI matrix directly from active chronicles
  const raciMatrix = deriveRaciMatrixFromChronicles(chronicles, CANONICAL_STAGES, CANONICAL_DEPARTMENTS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChronicle, setEditingChronicle] = useState<DepartmentChronicle | null>(null);

  // Form Fields
  const [formStageIndex, setFormStageIndex] = useState<number>(1);
  const [formDeptCode, setFormDeptCode] = useState<string>("FW");
  const [formTitle, setFormTitle] = useState("");
  const [formDeliverableCode, setFormDeliverableCode] = useState("");
  const [formDocumentType, setFormDocumentType] = useState("PRS");
  const [formRaciRole, setFormRaciRole] = useState<"R" | "A" | "C" | "I">("R");
  const [formMandatory, setFormMandatory] = useState(true);
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"Draft" | "Pending" | "In review" | "Approved" | "Completed">("Approved");

  // Notification message
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const openCreateModal = () => {
    setEditingChronicle(null);
    setFormStageIndex(selectedStageFilter === "ALL" ? 1 : selectedStageFilter);
    setFormDeptCode(selectedDeptFilter === "ALL" ? "FW" : selectedDeptFilter);
    setFormTitle("");
    setFormDeliverableCode("");
    setFormDocumentType("PRS");
    setFormRaciRole("R");
    setFormMandatory(true);
    setFormDescription("");
    setFormStatus("Approved");
    setIsModalOpen(true);
  };

  const openEditModal = (chronicle: DepartmentChronicle) => {
    setEditingChronicle(chronicle);
    setFormStageIndex(chronicle.stageIndex);
    setFormDeptCode(chronicle.departmentCode);
    setFormTitle(chronicle.title);
    setFormDeliverableCode(chronicle.deliverableCode);
    setFormDocumentType(chronicle.documentType);
    setFormRaciRole(chronicle.raciRole);
    setFormMandatory(chronicle.mandatory);
    setFormDescription(chronicle.description);
    setFormStatus(chronicle.status);
    setIsModalOpen(true);
  };

  const handleSaveChronicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDeliverableCode.trim()) return;

    if (editingChronicle) {
      // Update existing
      const updated = chronicles.map((c) =>
        c.id === editingChronicle.id
          ? {
              ...c,
              stageIndex: formStageIndex,
              stageName: STAGE_LABELS[formStageIndex] || `Stage ${formStageIndex + 1}`,
              departmentCode: formDeptCode,
              title: formTitle.trim(),
              deliverableCode: formDeliverableCode.trim(),
              documentType: formDocumentType.trim().toUpperCase(),
              raciRole: formRaciRole,
              mandatory: formMandatory,
              description: formDescription.trim(),
              status: formStatus,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      onUpdateChronicles(updated);
      onLog?.("Department chronicle updated", `${formDeliverableCode} (${formDeptCode}) in Stage ${formStageIndex + 1}`);
      showNotification(`Chronicle ${formDeliverableCode} updated! Whole portal synchronized.`);
    } else {
      // Create new
      const newChronicle: DepartmentChronicle = {
        id: `CHRON-${Date.now()}-${formDeptCode}`,
        stageIndex: formStageIndex,
        stageName: STAGE_LABELS[formStageIndex] || `Stage ${formStageIndex + 1}`,
        departmentCode: formDeptCode,
        title: formTitle.trim(),
        deliverableCode: formDeliverableCode.trim(),
        documentType: formDocumentType.trim().toUpperCase(),
        raciRole: formRaciRole,
        mandatory: formMandatory,
        description: formDescription.trim(),
        status: formStatus,
        updatedAt: new Date().toISOString(),
      };
      const updated = [...chronicles, newChronicle];
      onUpdateChronicles(updated);
      onLog?.("Department chronicle created", `${formDeliverableCode} (${formDeptCode}) in Stage ${formStageIndex + 1}`);
      showNotification(`New chronicle ${formDeliverableCode} added! Portal RACI & stages synchronized.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteChronicle = (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete chronicle deliverable "${code}"? The RACI matrix and stage player will update immediately.`)) {
      return;
    }
    const updated = chronicles.filter((c) => c.id !== id);
    onUpdateChronicles(updated);
    onLog?.("Department chronicle deleted", `Removed deliverable ${code}`);
    showNotification(`Chronicle ${code} deleted. Whole portal re-aligned.`);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Reset all department chronicles back to the master IATF 16949 automotive standard defaults?")) {
      onUpdateChronicles(DEFAULT_DEPARTMENT_CHRONICLES);
      onLog?.("Department chronicles reset", "Reverted to master baseline");
      showNotification("Chronicles reset to master defaults. Whole portal synchronized.");
    }
  };

  // Filtered List
  const filteredChronicles = chronicles.filter((c) => {
    if (selectedStageFilter !== "ALL" && c.stageIndex !== selectedStageFilter) return false;
    if (selectedDeptFilter !== "ALL" && c.departmentCode !== selectedDeptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.deliverableCode.toLowerCase().includes(q) ||
        c.departmentCode.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Department Chronicles & Milestone Registry
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Dynamic Synchronization Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure domain requirements, stage deliverables, and RACI roles. Any creation, modification, or deletion immediately synchronizes the Project Lifecycle Player, RACI matrix, Dossier, and Department Workspaces.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            <span>Add Chronicle</span>
          </button>
        </div>
      </div>

      {/* Real-time sync confirmation pill */}
      {feedbackNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{feedbackNotice}</span>
          </div>
          <span className="font-mono text-[10px] uppercase">Zero Conflicts</span>
        </div>
      )}

      {/* Unified View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/30 p-2 rounded-xl border border-border">
        <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setViewMode("chronicles")}
            className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === "chronicles"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Chronicles & Deliverables ({chronicles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("raci")}
            className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === "raci"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>Dynamic Responsibility Matrix (RACI)</span>
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground font-mono">
          {viewMode === "chronicles" ? (
            <span>Showing {filteredChronicles.length} of {chronicles.length} deliverables</span>
          ) : (
            <span>9 Stages × 12 Departments (108 Responsibility Nodes)</span>
          )}
        </div>
      </div>

      {viewMode === "raci" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Automotive Lifecycle Responsibility Matrix (RACI)
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Governed Single Source of Truth · Mathematically derived from active Department Chronicles. Click any cell to jump to that deliverable.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition"
              >
                <Plus className="size-3" />
                <span>+ Add Deliverable</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 min-w-44">Lifecycle Stage</th>
                    {CANONICAL_DEPARTMENTS.map((dept) => (
                      <th key={dept} className="py-2.5 px-2 text-center font-bold text-foreground">
                        {dept}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CANONICAL_STAGES.map(([stageKey, stageTitle], sIdx) => {
                    const row = raciMatrix[stageKey] ?? {};
                    return (
                      <tr key={stageKey} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-foreground">{stageKey}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">{stageTitle}</div>
                        </td>
                        {CANONICAL_DEPARTMENTS.map((dept) => {
                          const role = row[dept] || "";
                          const matchingChronicles = chronicles.filter(
                            (c) => c.stageIndex === sIdx && c.departmentCode.toUpperCase() === dept
                          );
                          const hasChronicles = matchingChronicles.length > 0;

                          return (
                            <td key={dept} className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStageFilter(sIdx);
                                  setSelectedDeptFilter(dept);
                                  setViewMode("chronicles");
                                }}
                                title={`${dept} in ${stageKey}: ${role || "None"}\n${
                                  hasChronicles
                                    ? matchingChronicles.map((c) => `• [${c.raciRole}] ${c.deliverableCode}: ${c.title}`).join("\n")
                                    : "Click to filter chronicles"
                                }`}
                                className={`size-7 rounded font-mono font-bold text-xs inline-flex items-center justify-center transition-all ${
                                  role === "R"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:scale-110 shadow-xs"
                                    : role === "A"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:scale-110 shadow-xs"
                                    : role === "C"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:scale-110 shadow-xs"
                                    : role === "I"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:scale-110"
                                    : "text-muted-foreground/40 hover:bg-muted"
                                }`}
                              >
                                {role || "—"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RACI Legend & Guidance */}
            <div className="border-t border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-muted-foreground">Legend:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">R</span>
                  <span className="text-[11px] text-muted-foreground">Responsible (Executes work)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">A</span>
                  <span className="text-[11px] text-muted-foreground">Accountable (Approves gate)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">C</span>
                  <span className="text-[11px] text-muted-foreground">Consulted (Interface / Review)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">I</span>
                  <span className="text-[11px] text-muted-foreground">Informed (Downstream notification)</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Click any cell to filter and edit its deliverable chronicle
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === "chronicles" && (
        <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by deliverable code, title, or department..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={selectedStageFilter}
              onChange={(e) =>
                setSelectedStageFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-semibold"
            >
              <option value="ALL">All Stages (1 to 9)</option>
              {STAGE_LABELS.map((label, idx) => (
                <option key={idx} value={idx}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedDeptFilter("ALL")}
            className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition-colors ${
              selectedDeptFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            ALL DEPARTMENTS ({chronicles.length})
          </button>
          {CANONICAL_DEPARTMENTS.map((dept) => {
            const count = chronicles.filter((c) => c.departmentCode === dept).length;
            const isSelected = selectedDeptFilter === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDeptFilter(dept)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronicles Table / Cards */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Deliverable Code</th>
                <th className="py-3 px-4 min-w-[220px]">Chronicle Title & Purpose</th>
                <th className="py-3 px-4 text-center">RACI</th>
                <th className="py-3 px-4 text-center">Gate Gatekeeper</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChronicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No chronicles match the selected stage and department filter. Click <strong>Add Chronicle</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredChronicles.map((chronicle) => (
                  <tr key={chronicle.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] rounded bg-secondary px-2 py-0.5 text-foreground">
                        Stage {chronicle.stageIndex + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary">
                        {chronicle.departmentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-foreground">
                      {chronicle.deliverableCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{chronicle.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {chronicle.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-grid size-6 place-items-center rounded-md font-mono text-xs font-bold ${
                          chronicle.raciRole === "R"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : chronicle.raciRole === "A"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : chronicle.raciRole === "C"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title={`${
                          chronicle.raciRole === "R"
                            ? "Responsible (Executes deliverable)"
                            : chronicle.raciRole === "A"
                            ? "Accountable (Approves gate)"
                            : chronicle.raciRole === "C"
                            ? "Consulted (Provides input)"
                            : "Informed (Notified on completion)"
                        }`}
                      >
                        {chronicle.raciRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {chronicle.mandatory ? (
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400">
                          Mandatory
                        </span>
                      ) : (
                        <span className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {chronicle.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(chronicle)}
                        className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        title="Edit Chronicle"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChronicle(chronicle.id, chronicle.deliverableCode)}
                        className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Chronicle"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      {/* Modal for Creating or Editing a Chronicle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-card-foreground">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {editingChronicle ? "Modify Department Chronicle" : "Create New Department Chronicle"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Updates will sync immediately across the RACI matrix and Project Lifecycle Player.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChronicle} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Project Stage</label>
                  <select
                    value={formStageIndex}
                    onChange={(e) => setFormStageIndex(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {STAGE_LABELS.map((label, idx) => (
                      <option key={idx} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Owning Department</label>
                  <select
                    value={formDeptCode}
                    onChange={(e) => setFormDeptCode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono font-bold"
                  >
                    {CANONICAL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Deliverable Code (e.g. FW-FRS-01)
                  </label>
                  <input
                    type="text"
                    required
                    value={formDeliverableCode}
                    onChange={(e) => setFormDeliverableCode(e.target.value)}
                    placeholder="e.g. FW-FRS-01"
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground font-mono font-bold placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Document Family Type</label>
                  <input
                    type="text"
                    required
                    value={formDocumentType}
                    onChange={(e) => setFormDocumentType(e.target.value)}
                    placeholder="e.g. FRS, PRS, DVP, CP, BOM"
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Chronicle Title / Deliverable Name
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Firmware Product Requirement Sheet & Memory Map"
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">RACI Assignment</label>
                  <select
                    value={formRaciRole}
                    onChange={(e) => setFormRaciRole(e.target.value as "R" | "A" | "C" | "I")}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground font-bold focus:border-primary focus:outline-none"
                  >
                    <option value="R">R — Responsible (Executes Work)</option>
                    <option value="A">A — Accountable (Approves Gate)</option>
                    <option value="C">C — Consulted (Interfaces / Review)</option>
                    <option value="I">I — Informed (Downstream Notification)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Approved">Approved</option>
                    <option value="In review">In review</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formMandatory"
                  checked={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary size-4"
                />
                <label htmlFor="formMandatory" className="text-xs font-medium text-foreground cursor-pointer">
                  Mandatory Deliverable (Required for Stage Gate Sign-Off)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Description & Automotive Acceptance Criteria
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe technical scope, regulatory standard, verification criteria, and IATF 16949 requirements..."
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                >
                  {editingChronicle ? "Save Changes" : "Create Chronicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
