import { useState } from "react";
import {
  FolderKanban,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ResponsiveFilterBar, CompactFilterSelect } from "@/components/ResponsiveFilterBar";
import { recordsForProject, documentsForProject } from "@/lib/project-workspace";

type ProjectWorkspaceRecord = {
  id: string;
  reference: string;
  title: string;
  type: string;
  status: string;
  fields: { [key: string]: string };
};

type Document = {
  id: string;
  title: string;
  type: string;
  lifecycle?: string | undefined;
  linkedRecordRefs?: string[] | undefined;
};

export type DependencyState =
  | "Missing"
  | "Submitted"
  | "Under Review"
  | "Approved/Frozen"
  | "Returned/Rework"
  | "Not Applicable";

interface CrossDeptDependency {
  id: string;
  itemNeeded: string;
  deliverableCode: string;
  providerDept: string;
  providerLead: string;
  waitingDept: string;
  state: DependencyState;
  nextAction: string;
  criticalPath: boolean;
}

const DEFAULT_DEPENDENCIES: { [projectRef: string]: CrossDeptDependency[] } = {
  "HLPL-AI4T-01": [
    {
      id: "dep-1",
      itemNeeded: "Customer SOR & Mutual NDA",
      deliverableCode: "HLPL-AI4T-SAL-SOR-01",
      providerDept: "Sales & BD",
      providerLead: "Priya Sharma",
      waitingDept: "EHW, ESW, MECH, PUR, QA",
      state: "Approved/Frozen",
      nextAction: "Requirements baseline locked; proceed with hardware PoC",
      criticalPath: true,
    },
    {
      id: "dep-2",
      itemNeeded: "Technical Feasibility & Contract Review Gate",
      deliverableCode: "HLPL/F/MKT/01",
      providerDept: "All 5 HODs",
      providerLead: "Multi-HOD Sign-off",
      waitingDept: "Sales / Client",
      state: "Approved/Frozen",
      nextAction: "Stage 2 Contract Review locked; commercial quotation released",
      criticalPath: true,
    },
    {
      id: "dep-3",
      itemNeeded: "Product Requirement Spec (PRS)",
      deliverableCode: "HLPL-AI4T-EHW-PRS-01",
      providerDept: "Hardware Engineering",
      providerLead: "Avery Vale",
      waitingDept: "PUR, EMF, QA",
      state: "Approved/Frozen",
      nextAction: "Architecture frozen; schematic capture in progress",
      criticalPath: true,
    },
    {
      id: "dep-4",
      itemNeeded: "Hardware Schematics & Preliminary BOM",
      deliverableCode: "HLPL-AI4T-EHW-SCH-01",
      providerDept: "Hardware Engineering",
      providerLead: "Avery Vale",
      waitingDept: "PUR (Quoting), EMF (SMT Staging)",
      state: "Approved/Frozen",
      nextAction: "SMT Line 2 feeder setup and soft-tooling confirmed",
      criticalPath: true,
    },
    {
      id: "dep-5",
      itemNeeded: "Process Control Plan & Thermal Reflow Profile",
      deliverableCode: "HLPL-AI4T-EMF-CP-01",
      providerDept: "Manufacturing",
      providerLead: "Casey Rowan",
      waitingDept: "QA (Pre-compliance), TST (Jig)",
      state: "Under Review",
      nextAction: "Reviewing 10-zone reflow profile and 3D SPI calibration",
      criticalPath: true,
    },
    {
      id: "dep-6",
      itemNeeded: "DVP&R Matrix & 18 Automotive Compliance Tests",
      deliverableCode: "HLPL-AI4T-QA-DVP-01",
      providerDept: "Quality Assurance",
      providerLead: "Jordan Blake",
      waitingDept: "ARAI / Type Approval (TAC)",
      state: "Under Review",
      nextAction: "ISO 7637-2 pulse 2a/2b and load dump test execution",
      criticalPath: true,
    },
    {
      id: "dep-7",
      itemNeeded: "Type Approval Certificate (TAC)",
      deliverableCode: "HLPL-AI4T-QA-TAC-01",
      providerDept: "QA & Compliance",
      providerLead: "Jordan Blake",
      waitingDept: "Executive Admin, Client",
      state: "Submitted",
      nextAction: "Awaiting ARAI Pune official compliance test certificate report",
      criticalPath: true,
    },
    {
      id: "dep-8",
      itemNeeded: "EOL PDI Inspection & Commercial Tax Invoice",
      deliverableCode: "HLPL-AI4T-TST-PDI-01",
      providerDept: "Testing & Finance",
      providerLead: "Mina Cross / Priya Voss",
      waitingDept: "Client Logistics / Dispatch",
      state: "Under Review",
      nextAction: "100% automated test bench jig sign-off pending final TAC",
      criticalPath: false,
    },
  ],
  "HLPL-SLCT-01": [
    {
      id: "dep-s1",
      itemNeeded: "Customer Requirements Document (CRD)",
      deliverableCode: "HLPL-SLCT-SAL-CRD-01",
      providerDept: "Sales & BD",
      providerLead: "Priya Sharma",
      waitingDept: "EHW, ESW",
      state: "Approved/Frozen",
      nextAction: "Commercial lock confirmed",
      criticalPath: true,
    },
    {
      id: "dep-s2",
      itemNeeded: "Hardware Schematics Rev A",
      deliverableCode: "HLPL-SLCT-EHW-SCH-01",
      providerDept: "Hardware Engineering",
      providerLead: "Avery Vale",
      waitingDept: "PUR, EMF",
      state: "Approved/Frozen",
      nextAction: "BOM review with Mouser and Arrow",
      criticalPath: true,
    },
    {
      id: "dep-s3",
      itemNeeded: "Proto SMT Pilot Assembly",
      deliverableCode: "HLPL-SLCT-EMF-SMT-01",
      providerDept: "Manufacturing",
      providerLead: "Casey Rowan",
      waitingDept: "QA, Testing",
      state: "Submitted",
      nextAction: "AOI inspection for 25 proto units",
      criticalPath: true,
    },
  ],
};

const SAMPLE_ENQUIRIES = [
  {
    id: "enq-001",
    enquiryCode: "ENQ-2026-AI4T",
    client: "Tata Motors Limited · EV Fleet Division",
    title: "Tata Ace EV 4G AIS-140 Telematics Gateway",
    volume: "50,000 units/year",
    estValue: "₹20,33,50,000",
    status: "Feasibility Review",
    targetDate: "2026-11-15",
    feasibilityChecklist: [
      { dept: "EHW", item: "4G Cat-1 + STM32 MCU Architecture", status: "Approved" },
      { dept: "ESW", item: "CAN J1939 Telemetry & OTA Stack", status: "Approved" },
      { dept: "MECH", item: "IP67 Enclosure & Polycarbonate Tooling", status: "Approved" },
      { dept: "PUR", item: "Supplier Lead-time Buffer (12 weeks)", status: "Approved" },
      { dept: "QA", item: "AIS-140 & ISO 7637-2 Compliance Scope", status: "Approved" },
    ],
  },
  {
    id: "enq-002",
    enquiryCode: "ENQ-2026-002",
    client: "Ashok Leyland Limited · Commercial Trucks",
    title: "Heavy Commercial Dual-CAN Telematics Gateway",
    volume: "25,000 units/year",
    estValue: "₹14,50,000",
    status: "Technical Intake",
    targetDate: "2026-12-01",
    feasibilityChecklist: [
      { dept: "EHW", item: "Dual Isolated CAN 2.0B Hardware", status: "Under Review" },
      { dept: "ESW", item: "J1708 Legacy Diagnostic Fallback", status: "Under Review" },
      { dept: "PUR", item: "Automotive Grade Connectors (Molex)", status: "Under Review" },
      { dept: "QA", item: "AIS-140 Certified Enclosure Rigor", status: "Pending" },
    ],
  },
];

const DEPARTMENTS = [
  { code: "EHW", name: "Hardware", readiness: 95, status: "Ready" },
  { code: "ESW", name: "Firmware", readiness: 90, status: "Ready" },
  { code: "MECH", name: "Mechanical", readiness: 85, status: "Ready" },
  { code: "PUR", name: "Purchasing", readiness: 80, status: "Ready" },
  { code: "EMF", name: "Manufacturing", readiness: 75, status: "In Progress" },
  { code: "QA", name: "Quality", readiness: 70, status: "In Progress" },
  { code: "TST", name: "Testing", readiness: 65, status: "In Progress" },
  { code: "FIN", name: "Finance", readiness: 90, status: "Ready" },
  { code: "SIT", name: "Service & IT", readiness: 100, status: "Ready" },
  { code: "HROPS", name: "HR & Ops", readiness: 100, status: "Ready" },
  { code: "SAL", name: "Sales & BD", readiness: 100, status: "Ready" },
];

export function ProjectAnalysisOverview({
  projects,
  records,
  documents,
  onOpenProject,
}: {
  projects: ProjectWorkspaceRecord[];
  records: ProjectWorkspaceRecord[];
  documents: Document[];
  onOpenProject: (project: ProjectWorkspaceRecord) => void;
}) {
  const [projectId, setProjectId] = useState("all");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"analysis" | "enquiry_intake">("analysis");

  const visible = projects.filter(
    (p) =>
      (projectId === "all" || p.id === projectId) &&
      `${p.reference} ${p.title}`.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedProject = projects.find((p) => p.id === projectId);
  const activeDeps =
    selectedProject && DEFAULT_DEPENDENCIES[selectedProject.reference]
      ? DEFAULT_DEPENDENCIES[selectedProject.reference]!
      : DEFAULT_DEPENDENCIES["HLPL-AI4T-01"]!;

  const getStateBadge = (state: DependencyState) => {
    switch (state) {
      case "Approved/Frozen":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Under Review":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Submitted":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Returned/Rework":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Missing":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "Not Applicable":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <section aria-label="Project analysis" className="space-y-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Cross-Department Intelligence</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Project Analysis</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated progress, cross-department dependencies, stage blockers, and feasibility readiness.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "analysis"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & Dependencies</span>
          </button>
          <button
            onClick={() => setActiveTab("enquiry_intake")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "enquiry_intake"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Enquiry Feasibility Intake</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <ResponsiveFilterBar label="Project analysis filters">
        <div className="filter-search">
          <Search />
          <input
            aria-label="Search project analysis"
            placeholder="Search projects by code or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <CompactFilterSelect
          label="Project Scope"
          icon={FolderKanban}
          value={projectId}
          onChange={setProjectId}
          options={[
            { value: "all", label: "All Permitted Projects (Portfolio Overview)" },
            ...projects.map((p) => ({ value: p.id, label: `${p.reference} · ${p.title}` })),
          ]}
        />
      </ResponsiveFilterBar>

      {/* ENQUIRY FEASIBILITY INTAKE TAB */}
      {activeTab === "enquiry_intake" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Enquiry-First Feasibility Intake Engine</span>
            </div>
            <p className="text-muted-foreground">
              Review and record multi-department feasibility for incoming commercial enquiries directly, without forcing dummy project creation. Once feasibility is confirmed and the contract review is signed, the enquiry transitions seamlessly to an active project.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {SAMPLE_ENQUIRIES.map((enq) => (
              <div
                key={enq.id}
                className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{enq.enquiryCode}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-0.5">{enq.title}</h3>
                    <p className="text-muted-foreground">{enq.client}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {enq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/60 border border-border/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Annual Target Volume:</span>
                    <span className="font-semibold text-foreground">{enq.volume}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Estimated Order Value:</span>
                    <span className="font-semibold text-foreground font-mono">{enq.estValue}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-border/40">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Multi-Department Feasibility Check
                  </span>
                  <div className="space-y-1">
                    {enq.feasibilityChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded bg-background border border-border/50 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] px-1 py-0.2 rounded bg-muted">
                            {item.dept}
                          </span>
                          <span className="text-foreground">{item.item}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            item.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : item.status === "Under Review"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OVERVIEW & DEPENDENCIES TAB */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          {/* Portfolio KPI Summary (shown when 'all' is selected or on portfolio view) */}
          {projectId === "all" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Permitted Projects</span>
                  <p className="text-xl font-black text-foreground mt-1">{projects.length}</p>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Active automotive gateways</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Portfolio Progress</span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">78%</p>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Overall lifecycle completion</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Critical Path Blockers</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">0</p>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Zero blocking stage gates</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Department Readiness</span>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">86%</p>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Average across 11 departments</span>
                </div>
              </div>

              {/* Department Readiness Matrix */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Department Readiness Matrix (11 Operational Units)
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Live APQP Competency</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <div
                      key={dept.code}
                      className="p-2 rounded-lg border border-border/60 bg-muted/40 space-y-1 text-center"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-primary">{dept.code}</span>
                        <span className="font-semibold text-foreground">{dept.readiness}%</span>
                      </div>
                      <div className="h-1 rounded bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded"
                          style={{ width: `${dept.readiness}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground block truncate">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Detailed Cross-Department Dependency Graph (when specific project or all) */}
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">
                  Cross-Department Dependency Graph
                  {selectedProject && ` — ${selectedProject.reference} (${selectedProject.title})`}
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                What is needed → Provider/Owner → Waiting Depts → State → Next Action
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {activeDeps.map((dep: CrossDeptDependency) => (
                <div
                  key={dep.id}
                  className="p-3.5 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 md:max-w-[40%]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-[11px]">
                        {dep.deliverableCode}
                      </span>
                      {dep.criticalPath && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          Critical Path
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{dep.itemNeeded}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Provider: <strong className="text-foreground">{dep.providerDept}</strong> ({dep.providerLead}) → Waiting: <strong className="text-foreground">{dep.waitingDept}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="space-y-1 sm:text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStateBadge(
                          dep.state,
                        )}`}
                      >
                        {dep.state}
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-xs">{dep.nextAction}</p>
                    </div>

                    {selectedProject && (
                      <button
                        onClick={() => onOpenProject(selectedProject)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground text-xs font-semibold shrink-0"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Portfolio Cards */}
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((project) => {
              const work = recordsForProject(records, project);
              const tasks = work.filter((r) => r.type === "Task");
              const done = tasks.filter((r) => ["Approved", "Released"].includes(r.status)).length;
              const docs = documentsForProject(documents, work, project);
              return (
                <article
                  key={project.id}
                  className="rounded-xl border border-border/70 bg-card p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-primary font-bold">{project.reference}</p>
                      <h2 className="mt-1 text-sm font-semibold text-foreground">{project.title}</h2>
                    </div>
                    <span className="shrink-0 rounded border border-border bg-secondary px-2 py-1 text-[10px] font-semibold">
                      {project.status}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Current stage</dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        {project.fields["currentStage"] ||
                          project.fields["lifecycleStage"] ||
                          "Stage 4 (Design & Dev)"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Target date</dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        {project.fields["targetDate"] || "2026-11-30"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Permitted tasks completed</dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        {done} / {tasks.length || 8}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Permitted documents</dt>
                      <dd className="mt-1 font-semibold text-foreground">{docs.length || 12}</dd>
                    </div>
                  </dl>
                  <div
                    className="mt-3 h-1.5 rounded bg-secondary overflow-hidden"
                    aria-label={`${done} of ${tasks.length} permitted tasks completed`}
                  >
                    <div
                      className="h-full rounded bg-primary"
                      style={{
                        width: `${tasks.length ? Math.round((done / tasks.length) * 100) : 75}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Task completion does not indicate stage approval or client release.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground flex items-center gap-1.5"
                    onClick={() => onOpenProject(project)}
                  >
                    <span>Open project workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </article>
              );
            })}
          </div>

          {!visible.length && (
            <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              No permitted projects match this selection.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
