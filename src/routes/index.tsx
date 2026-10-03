import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Archive,
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Check,
  ChevronsDownUp,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardCheck,
  Factory,
  FileText,
  History,
  Copy,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Plus,
  Upload,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  UserRoundCog,
  UsersRound,
  Wrench,
  X,
  FolderOpen,
  Eye,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { unzipSync, strFromU8 } from "fflate";
import {
  beginControlledDocumentUpload,
  completeControlledDocumentUpload,
  getControlledDocumentDownload,
  listControlledDocumentFiles,
} from "@/lib/controlled-documents.functions";

type AreaId =
  | "home"
  | "sales"
  | "ehw"
  | "esw"
  | "mech"
  | "pur"
  | "qa"
  | "emf"
  | "tst"
  | "fin"
  | "sit"
  | "hrops"
  | "rnd"
  | "stores"
  | "production"
  | "quality"
  | "people"
  | "audit";
type RecordStatus = "Draft" | "Open" | "In review" | "Approved" | "Released" | "Archived";
type Priority = "Low" | "Normal" | "High" | "Critical";
type RecordItem = {
  id: string;
  area: AreaId;
  departmentId?: string | undefined;
  type: string;
  title: string;
  status: RecordStatus;
  priority: Priority;
  reference: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  fields: Record<string, string>;
  archived?: boolean;
};
type Department = {
  id: string;
  name: string;
  code: string;
  departmentType: string;
  customType?: string;
  active: boolean;
  lead: string;
  sortOrder: number;
  settings: DepartmentSettings;
  isDemo?: boolean;
};
type DepartmentSettings = {
  activityTypes: string[];
  statuses: string[];
  priorities: string[];
  templates: string[];
  approvalGates: string[];
  milestones: string[];
  kpis: string[];
  calendar: string;
  notifications: string[];
  prefix: string;
  sequence: number;
  format: string;
};
type DepartmentRole = {
  id: string;
  departmentId: string;
  name: string;
  permissions: string[];
  active: boolean;
  assignee: string;
  isDemo?: boolean;
};
type AuditEvent = { id: string; at: string; action: string; detail: string };
type MasterData = {
  people: string[];
  suppliers: string[];
  parts: string[];
  products: string[];
  customers: string[];
  locations: string[];
  routes: string[];
  documentTypes: string[];
};
type SetupState = {
  company: string;
  location: string;
  workingDays: string;
  timezone: string;
  numbering: string;
  configuration: Record<string, string>;
};
type TemplateSettings = {
  companyName: string;
  techCenter: string;
  plantLocation: string;
  accreditationMarks: string;
  prefix: string;
  logoBadge: string;
  confidentialityNotice: string;
  complianceFooter: string;
};
type ProjectDocumentProfile = {
  name: string;
  customer: string;
  contact: string;
  quantity: string;
  techSpec: string;
  commercialValue: string;
  environmental: string;
  compliance: string;
};
type RaciRole = "R" | "A" | "C" | "I" | "";
type RaciMatrix = Record<string, Record<string, RaciRole>>;
type ControlledDocument = {
  id: string;
  title: string;
  url: string;
  type: string;
  departmentId?: string | undefined;
  group?: string | undefined;
  device?: string | undefined;
  part?: string | undefined;
  revision?: string | undefined;
  phase?: string | undefined;
  lifecycle?: "Draft" | "In review" | "Approved" | "Obsolete" | undefined;
  classification?: string | undefined;
  linkedRecordRefs?: string[] | undefined;
  effectiveDate?: string | undefined;
  approver?: string | undefined;
  history?: string[] | undefined;
  cloudDocumentId?: string | undefined;
  localFiles?: LocalControlledFile[] | undefined;
  draftHtml?: string | undefined;
  releaseNotes?: string | undefined;
  designer?: string | undefined;
  deliverableKind?: "Schematic PDF" | "Gerber ZIP" | "3D STEP" | "Firmware binary" | "BOM tracker" | "Technical document" | undefined;
  lifecycleStage?: string | undefined;
};
type LocalControlledFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploader: string;
  revision: string;
  content: string;
  encoding: "text" | "data-url";
  checksum?: string | undefined;
};
type ControlledFile = {
  id: string;
  revision: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
  superseded_at: string | null;
  audit_note: string;
};
type TeamMember = {
  name: string;
  area: Exclude<AreaId, "home" | "audit" | "rnd" | "stores" | "production" | "quality" | "people">;
  role: string;
  score: string;
  level: string;
  skills: string[];
};
const demoTeam: TeamMember[] = [
  { name: "Riley Stone", area: "sales", role: "Sales Lead", score: "3.85/4", level: "Level 4", skills: ["RFQ intake", "Commercial review", "Client communications", "Contract controls"] },
  { name: "Avery Vale", area: "ehw", role: "Hardware Lead", score: "3.90/4", level: "Level 4", skills: ["Architecture", "Schematics", "PCB release", "DFMEA"] },
  { name: "Devon Lane", area: "esw", role: "Firmware Lead", score: "3.75/4", level: "Level 4", skills: ["CAN/J1939", "Secure telemetry", "CI/CD", "Release governance"] },
  { name: "Samira Holt", area: "mech", role: "Mechanical Lead", score: "3.60/4", level: "Level 4", skills: ["STEP model", "Tolerance stack", "Tooling", "Sealing review"] },
  { name: "Morgan Reed", area: "pur", role: "Purchasing Lead", score: "3.70/4", level: "Level 4", skills: ["Supplier qualification", "PPAP", "Cost controls", "Capacity planning"] },
  { name: "Jordan Blake", area: "qa", role: "Quality Head", score: "3.95/4", level: "Level 4", skills: ["APQP", "DVP&R", "CAPA", "Release approval"] },
  { name: "Casey Rowan", area: "emf", role: "Manufacturing Lead", score: "3.65/4", level: "Level 4", skills: ["PFD", "PFMEA", "Line startup", "Control plan"] },
  { name: "Mina Cross", area: "tst", role: "EOL Test Technician", score: "3.40/4", level: "Level 3", skills: ["Pre-flash", "CAN loopback", "QR labels", "Yield analysis"] },
  { name: "Priya Voss", area: "fin", role: "Finance Controller", score: "3.80/4", level: "Level 4", skills: ["Invoice control", "GRN validation", "Receivables", "Tax close"] },
  { name: "Kai Morgan", area: "sit", role: "IT Administrator", score: "3.50/4", level: "Level 3", skills: ["Telemetry", "Backup assurance", "Support", "ISMS"] },
  { name: "Taylor Quinn", area: "hrops", role: "HR & Operations Manager", score: "3.65/4", level: "Level 4", skills: ["Skill matrix", "TNI", "Compliance calendar", "DMAIC"] },
];
const rfqStages = [
  ["Stage 1", "RFQ logged & mNDA signed", "RFQ-2026-TATA-EV-042 · DEMO Tata Ace EV 4G Telematics Gateway · 50,000 units/year"],
  ["Stage 2", "Contract review signed", "HLPL/F/MKT/01 · six DEMO HOD sign-offs complete"],
  ["Stage 3", "Requirement freeze & quotation accepted", "PRS-02 and illustrative commercial quotation accepted"],
  ["Stage 4", "MCU bring-up & bench PoC passed", "DEMO bring-up, CAN and 4G bench checks passed"],
  ["Stage 5", "Pilot build & tentative BOM released", "Tentative BOM issued for DEMO pilot planning"],
  ["Stage 6", "Pre-compliance & DVP&R approved", "DEMO client-review and DVP&R gate complete"],
  ["Stage 7", "Final Gerber & production BOM released", "Gerber and BOM release package recorded"],
  ["Stage 8", "Type approval & PPAP cleared", "Illustrative AIS-140 TAC #842 reference and PPAP Level 3 gate cleared · not a certification claim"],
  ["Stage 9", "Production & EOL package generated", "DEMO SMT Line 2 · SLCT-2026-0101 to 0120 PASS · FPY 97.4% · QR, PDI and invoice simulated"],
] as const;
const personas: Persona[] = [
  { id: "admin", label: "Executive Admin / MD", person: "Full master access", kind: "admin" },
  { id: "sales", label: "SAL Lead", person: "Priya Sharma · Sales & BD", departmentId: "sales", kind: "lead" },
  { id: "ehw", label: "EHW Lead", person: "Avery Vale · Embedded Hardware", departmentId: "ehw", kind: "lead" },
  { id: "esw", label: "ESW Lead", person: "Devon Lane · Firmware & SW", departmentId: "esw", kind: "lead" },
  { id: "mech", label: "MECH Lead", person: "Samira Holt · Mechanical Engineering", departmentId: "mech", kind: "lead" },
  { id: "pur", label: "PUR Lead", person: "Morgan Reed · Purchasing & SCM", departmentId: "pur", kind: "lead" },
  { id: "qa", label: "QA Lead", person: "Jordan Blake · Quality Assurance", departmentId: "qa", kind: "lead" },
  { id: "emf", label: "EMF Lead", person: "Casey Rowan · Manufacturing", departmentId: "emf", kind: "lead" },
  { id: "tst", label: "TST Lead", person: "Mina Cross · Production & EOL Testing", departmentId: "tst", kind: "lead" },
  { id: "fin", label: "FIN Lead", person: "Priya Voss · Finance & Accounts", departmentId: "fin", kind: "lead" },
  { id: "sit", label: "SIT Lead", person: "Kai Morgan · Service & IT", departmentId: "sit", kind: "lead" },
  { id: "hrops", label: "HR Lead", person: "Taylor Quinn · HR & Operations", departmentId: "hrops", kind: "lead" },
  { id: "client", label: "Client Portal", person: "Rohan Verma · Tata Motors Fleet Manager", kind: "client" },
];
const ai4tStages = [
  ["Stage 1", "Client & Sales Intake", "SOR HLPL-AI4T-SAL-SOR-01 and Mutual NDA HLPL-AI4T-SAL-mNDA-01 are recorded."],
  ["Stage 2", "Feasibility & Contract Review", "EHW, ESW, MECH, PUR and QA feasibility inputs compile Contract Review HLPL/F/MKT/01."],
  ["Stage 3", "Requirement & Commercial Lock", "Frozen PRS HLPL-AI4T-EHW-PRS-01 and quotation HLPL-AI4T-SAL-QUO-01 are generated."],
  ["Stage 4", "Design & Development PoC", "SCH-01, preliminary BOM, MCU bring-up and CAN J1939 firmware PoC are checked."],
  ["Stage 5", "Pilot Build & SMT Setup", "SMT Line 2 thermal profile, EMF-CP-01 and prototype tooling are confirmed."],
  ["Stage 6", "DVP&R Pre-Compliance", "QA-DVP-01 records 18 illustrative electrical and environmental verification checks."],
  ["Stage 7", "Production Release & PPAP", "Gerber Rev B, EHW-DFMEA-01 and supplier PPAP Level 3 package are released."],
  ["Stage 8", "Type Approval & Production Authorization", "Illustrative TAC evidence and the 50,000-unit authorization are human-reviewed."],
  ["Stage 9", "PDI & Commercial Invoice", "TST-PDI-01 and FIN-INV-01 complete the simulated delivery record."],
] as const;
const raciDepartments = ["SAL", "EHW", "ESW", "MECH", "PUR", "QA", "EMF", "TST", "FIN", "SIT", "HR"] as const;
const projectDocumentProfiles: Record<string, ProjectDocumentProfile> = {
  "HLPL-AI4T-01": { name: "Tata Ace EV 4G Telematics Gateway", customer: "Tata Motors Limited · EV Fleet Division, Pune", contact: "Mr. Rajesh Sharma · Lead D&D EV", quantity: "50,000 units / year", techSpec: "4G Cat-1 · IP67 · CAN J1939 · Dual SIM · GNSS", commercialValue: "₹20,33,50,000 · $2.45M", environmental: "12V / 24V · −40°C to +85°C · IP67", compliance: "AIS-140 · AEC-Q100/Q200 · ISO 7637-2 · RoHS / REACH" },
  "HLPL-SLCT-01": { name: "AIS-140 GPS Gateway", customer: "Select Motors · fictional DEMO", contact: "Demo client contact · review required", quantity: "10,000 units / year", techSpec: "AIS-140 GNSS gateway · 4G · OBD-II · IP67", commercialValue: "₹4,12,00,000 · illustrative", environmental: "12V / 24V · −40°C to +85°C · IP67", compliance: "AIS-140 · AEC-Q100 · ISO 7637-2 · RoHS" },
  "HLPL-XLINK-03": { name: "Commercial Fleet Gateway", customer: "Commercial Fleet Programme · fictional DEMO", contact: "Demo fleet programme SPOC", quantity: "25,000 units / year", techSpec: "Dual CAN · OBD-II · GNSS · 4G fleet gateway", commercialValue: "Commercial value pending controlled review", environmental: "12V / 24V · −40°C to +85°C · IP67", compliance: "AEC-Q100 · ISO 7637-2 · RoHS / REACH" },
};
function defaultRaciMatrix(): RaciMatrix {
  return Object.fromEntries(ai4tStages.map(([stage], index) => [stage, Object.fromEntries(raciDepartments.map((department) => [department, department === (index < 3 ? "SAL" : index === 5 ? "QA" : index === 8 ? "TST" : "EHW") ? "R" : department === "SAL" ? "A" : ["EHW", "ESW", "MECH", "PUR", "QA"].includes(department) ? "C" : "I"]))]));
}
const ai4tDossier = [
  ["Customer SOR", "HLPL-AI4T-SAL-SOR-01", "SAL", "Stage 1"],
  ["Mutual NDA", "HLPL-AI4T-SAL-mNDA-01", "SAL", "Stage 1"],
  ["Contract Review Record", "HLPL/F/MKT/01", "SAL", "Stage 2"],
  ["Product Requirement Specification", "HLPL-AI4T-EHW-PRS-01", "EHW", "Stage 3"],
  ["Commercial Quotation", "HLPL-AI4T-SAL-QUO-01", "SAL", "Stage 3"],
  ["Schematic package", "HLPL-AI4T-EHW-SCH-01", "EHW", "Stage 4"],
  ["Preliminary BOM", "HLPL-AI4T-EHW-BOM-01", "EHW", "Stage 4"],
  ["Control Plan", "HLPL-AI4T-EMF-CP-01", "EMF", "Stage 5"],
  ["DVP&R Verification Plan", "HLPL-AI4T-QA-DVP-01", "QA", "Stage 6"],
  ["Hardware DFMEA", "HLPL-AI4T-EHW-DFMEA-01", "EHW", "Stage 7"],
  ["Pre-Dispatch Inspection Certificate", "HLPL-AI4T-TST-PDI-01", "TST", "Stage 9"],
  ["Commercial Tax Invoice", "HLPL-AI4T-FIN-INV-01", "FIN", "Stage 9"],
] as const;
type Persona = {
  id: string;
  label: string;
  person: string;
  departmentId?: AreaId | undefined;
  kind: "admin" | "lead" | "client";
};
type Ai4tSimulation = { stage: number; history: string[] };
type ProjectScope = "all" | "HLPL-AI4T-01" | "HLPL-SLCT-01" | "HLPL-XLINK-03";
type PortalState = {
  demoLoaded: boolean;
  demoSnapshot?: PortalState | undefined;
  setup: SetupState;
  setupStep: number;
  records: RecordItem[];
  masters: MasterData;
  departments: Department[];
  roles: DepartmentRole[];
  approvals: {
    id: string;
    title: string;
    recordId: string;
    outcome: "Pending" | "Approved" | "Rejected" | "Returned";
    updatedAt: string;
  }[];
  documents: ControlledDocument[];
  audit: AuditEvent[];
  notifications: string[];
  alerts: DemoAlert[];
  templateSettings?: TemplateSettings | undefined;
  templateBodies?: Record<string, string> | undefined;
  raciMatrix?: RaciMatrix | undefined;
};
type DemoAlert = {
  id: string;
  severity: "Critical" | "Warning";
  title: string;
  detail: string;
  departmentId: string;
  resolved: boolean;
};

const areas = [
  {
    id: "home" as const,
    name: "Home / Command Center",
    navLabel: "Command Center",
    short: "Home",
    icon: LayoutDashboard,
    recordType: "Task",
    summary: "Today, priority, approvals and lifecycle control",
  },
  {
    id: "sales" as const,
    name: "Sales & Business Development",
    navLabel: "Sales & BD",
    short: "SAL",
    icon: UsersRound,
    recordType: "Lead intake",
    summary: "HLPL-F-SAL-01, mNDA, quotations and contract reviews",
  },
  {
    id: "ehw" as const,
    name: "Embedded Hardware",
    navLabel: "Hardware Eng.",
    short: "EHW",
    icon: Wrench,
    recordType: "Hardware record",
    summary: "HW_01–HW_37, PRS, schematics, BOM and Gerber gates",
  },
  {
    id: "esw" as const,
    name: "Firmware & Software",
    navLabel: "Firmware & SW",
    short: "ESW",
    icon: Settings2,
    recordType: "Software gate",
    summary: "G0–G11, HSI registers and CI/CD telemetry",
  },
  {
    id: "mech" as const,
    name: "Mechanical Engineering",
    navLabel: "Mech Eng.",
    short: "MECH",
    icon: PackageSearch,
    recordType: "Mechanical record",
    summary: "STEP clearance, drawings and mold tooling",
  },
  {
    id: "pur" as const,
    name: "Purchasing & SCM",
    navLabel: "Purchasing",
    short: "PUR",
    icon: PackageSearch,
    recordType: "Procurement record",
    summary: "Rapid prototype / mass production, ASL/ACML and PPAP",
  },
  {
    id: "qa" as const,
    name: "Quality Assurance",
    navLabel: "Quality",
    short: "QA",
    icon: ShieldCheck,
    recordType: "Quality record",
    summary: "APQP, DVP&R, inspection and 8D CAPA",
  },
  {
    id: "emf" as const,
    name: "Manufacturing",
    navLabel: "Manufacturing",
    short: "EMF",
    icon: Factory,
    recordType: "Manufacturing record",
    summary: "PFD, PFMEA, control plan and line startup",
  },
  {
    id: "tst" as const,
    name: "Production",
    navLabel: "Production",
    short: "PRD",
    icon: CheckCircle2,
    recordType: "Production test run",
    summary: "EOL test jig, serial QR labels and first-pass yield",
  },
  {
    id: "fin" as const,
    name: "Accounts & Finance",
    navLabel: "Finance",
    short: "FIN",
    icon: ClipboardCheck,
    recordType: "Finance control",
    summary: "Billing, PO/GRN validation and aging controls",
  },
  {
    id: "sit" as const,
    name: "Service & IT",
    navLabel: "Service & IT",
    short: "SIT",
    icon: Bell,
    recordType: "Service record",
    summary: "Telemetry, backups, support and ISMS",
  },
  {
    id: "hrops" as const,
    name: "HR & Operations",
    navLabel: "HR & Ops",
    short: "HR/OPS",
    icon: Settings2,
    recordType: "People record",
    summary: "Skill matrix, TNI, compliance and DMAIC",
  },
] as const;
const departmentTypes = [
  "R&D/Engineering",
  "Purchasing/Stores",
  "Production/Manufacturing",
  "Quality",
  "Sales/Customer Success",
  "People/HR",
  "Administration",
  "Operations",
  "Finance",
  "IT/Support",
  "Other/custom",
  "Sales & Business Development",
  "Embedded Hardware",
  "Firmware & Software",
  "Mechanical Engineering",
  "Purchasing & SCM",
  "Quality Assurance",
  "Manufacturing",
  "EOL Testing",
  "Accounts & Finance",
  "Service & IT",
  "HR & Operations",
];
const permissionOptions = [
  "records:view",
  "records:create",
  "records:edit",
  "tasks:assign",
  "approvals:routine",
  "documents:manage",
  "settings:manage",
  "audit:manage",
  "documents:approve",
];
const auditStatuses = [
  "Draft",
  "Planned",
  "Scheduled",
  "In progress",
  "Awaiting closure",
  "Closed",
  "Overdue",
];
const documentLifecycles = ["Draft", "In review", "Approved", "Obsolete"];
const automotiveRepositoryRoot = "00_Automotive_Hardware_Audit_Repository";
const automotiveRepositoryGroups = [
  {
    path: "01_Governance_and_QMS",
    title: "Governance and QMS",
    artifacts: "Quality manual, procedures, controlled forms and record-control goals",
  },
  {
    path: "03_Supplier_Quality_and_PPAP",
    title: "Supplier quality and PPAP",
    artifacts: "PPAP, AEC-Q evidence, supplier datasheets and incoming-quality records",
  },
  {
    path: "04_Equipment_and_Calibration",
    title: "Equipment and calibration",
    artifacts: "Calibration, maintenance, laboratory accreditation and equipment history",
  },
] as const;
const automotivePhases = [
  ["Phase_1_Requirements_and_Concept", "HW_01–04", "Requirements, PRS and sign-offs"],
  [
    "Phase_2_Key_Part_Selection",
    "HW_05–12",
    "Selections, BOM, procurement, samples and firmware feasibility",
  ],
  ["Phase_3_Risk_and_Verification_Planning", "HW_13–14", "DFMEA and DVP"],
  ["Phase_4_Schematic_Design", "HW_15–16", "Schematics, ERC and design reviews"],
  ["Phase_5_Mechanical_and_Enclosure", "HW_17–18", "STEP files and fit reports"],
  [
    "Phase_6_BOM_and_PCB_Layout",
    "HW_19–23",
    "Costed BOM, PCB, layout, worst-case analysis and DRC",
  ],
  [
    "Phase_7_Fabrication_and_Precompliance",
    "HW_24–27",
    "Gerber, fabrication, EMC and ESD evidence",
  ],
  ["Phase_8_Hardware_Software_Integration", "HW_28–29", "HSI and bring-up records"],
  ["Phase_9_Production_and_Verification", "HW_30–35", "SMT, DVR, tests, pilot and release records"],
  [
    "Phase_10_Change_Control_and_Compliance",
    "HW_36–37",
    "ECO, reverification, AIS-140, AIS-004, IMDS, RoHS and REACH records",
  ],
] as const;
const automotiveDocumentStatus = (lifecycle: ControlledDocument["lifecycle"]): RecordStatus =>
  lifecycle === "Approved"
    ? "Approved"
    : lifecycle === "Obsolete"
      ? "Archived"
      : lifecycle === "In review"
        ? "In review"
        : "Draft";
const mergeAutomotiveDemoDocuments = (documents: ControlledDocument[]) => {
  const existing = new Set(documents.map((document) => document.id));
  const seed: ControlledDocument[] = [
    {
      id: "demo-repository-template",
      title: "DEMO · Automotive hardware repository path template",
      url: "",
      type: "Repository path template",
      departmentId: "demo-dept-ehw",
      group: "02_Product_Platforms/Automotive_Devices",
      device: "Automotive_Devices · DEMO platform only",
      part: "DEMO-AIS140-OBD-01",
      revision: "A · DEMO",
      phase: "Phase_1_Requirements_and_Concept · HW_01–04",
      lifecycle: "Draft",
      classification: "Internal · DEMO only · Drive path template",
      effectiveDate: "Not effective until human approval",
      approver: "Human approval required",
      history: ["DEMO repository path template loaded"],
      linkedRecordRefs: ["DEMO-RND-001", "DEMO-RND-002", "DEMO-RND-003", "DEMO-RND-005"],
    },
  ];
  return [...documents, ...seed.filter((document) => !existing.has(document.id))];
};
const hasCompleteDemoDocumentSet = (documents: ControlledDocument[]) =>
  ["demo-doc-pmss", "demo-doc-prs", "demo-doc-bom", "demo-doc-datasheet"].every((id) =>
    documents.some((document) => document.id === id),
  );
const setupSteps = [
  "Company, locations, calendars & numbering",
  "Departments, leads, roles & sub-roles",
  "Team members & access",
  "Projects, stages, gates & milestones",
  "Parts, categories, bins, stock rules & suppliers",
  "Customers, pipeline, orders & client sharing",
  "Production, kitting, serials, quality, release & dispatch",
  "Department-owned audit & controlled documents",
  "Retention, access rules & optional Drive references",
  "Notifications, escalations & review routines",
  "User acceptance, training & go-live",
];
const storeKey = "six-sense-portal-v4";
const blankSettings = (): DepartmentSettings => ({
  activityTypes: [],
  statuses: ["Draft", "Open", "In review", "Approved", "Released"],
  priorities: ["Low", "Normal", "High", "Critical"],
  templates: [],
  approvalGates: [],
  milestones: [],
  kpis: [],
  calendar: "Monday – Saturday",
  notifications: [],
  prefix: "",
  sequence: 1,
  format: "{PREFIX}-{YYYY}-{####}",
});
const emptyPortal = (): PortalState => ({
  demoLoaded: false,
  setup: {
    company: "Six Sense Mobility",
    location: "Noida",
    workingDays: "Monday – Saturday",
    timezone: "Asia/Kolkata",
    numbering: "SSM-{AREA}-{YYYY}-{####}",
    configuration: {
      calendar: "India standard · Monday – Saturday",
      fiscalYear: "April – March",
      documentRetention: "7 years · confirm with policy owner",
      accessRule: "Department-owned; internal by default",
      reviewRoutine: "Weekly operations review",
      escalation: "Owner → department lead → administrator",
      training: "Role-based UAT and training required before go-live",
    },
  },
  setupStep: 0,
  records: [],
  masters: {
    people: [],
    suppliers: [],
    parts: [],
    products: [],
    customers: [],
    locations: ["Noida"],
    routes: [],
    documentTypes: [],
  },
  departments: [],
  roles: [],
  approvals: [],
  documents: [],
  audit: [],
  notifications: [],
  alerts: [],
  templateSettings: defaultTemplateSettings(),
  templateBodies: defaultTemplateBodies(),
});

function defaultTemplateSettings(): TemplateSettings {
  return {
    companyName: "Hexense Labs Private Limited / Six Sense Mobility",
    techCenter: "B-12, Sector 63, Noida Tech Center, UP - 201301",
    plantLocation: "Plot 45, Ecotech III, Greater Noida SMT Plant 2, UP - 201306",
    accreditationMarks: "IATF 16949:2016 · ISO 9001:2015 · AIS-140 · CE / RoHS",
    prefix: "HLPL",
    logoBadge: "SS",
    confidentialityNotice: "CONFIDENTIAL & PROPRIETARY — HEXENSE LABS PVT LTD. All rights reserved. Reproduction or distribution without written permission is strictly prohibited.",
    complianceFooter: "IATF 16949:2016 & ISO 9001:2015 Certified Automotive Tier-1 Electronic Systems Facility | Doc Ref: Standard Format 4.2",
  };
}

function defaultTemplateBodies() {
  return Object.fromEntries(autoDraftTemplates.map(([title]) => [title, templateBlueprint(title)]));
}

function templateBlueprint(title: string) {
  const templates: Record<string, string> = {
    "Customer SOR": "OEM requirements, fleet connectivity, CAN telemetry scope, rollout schedule, commercial SLA, warranty and delivery terms.",
    "Mutual NDA": "Confidential information definitions, non-disclosure obligations, intellectual property protections and governing law.",
    "Commercial Quotation": "Tiered volume pricing, NRE engineering costs, tooling charges, payment milestones and delivery lead-time.",
    "Contract Review Record": "Cross-department feasibility matrix for SAL, EHW, ESW, MECH, PUR, QA, EMF and FIN with risk score and human gate approval.",
    "Product Requirement Spec": "STM32/ESP32, 4G LTE Cat-1, GNSS, 9–36V ISO 7637-2 power topology, CAN J1939, IP67 enclosure and pinout definitions.",
    "Production BOM Cost Tracker": "Item number, MPN, manufacturer, description, package, sourcing lead time, unit cost and AEC-Q grade.",
    "Hardware DFMEA": "Severity, occurrence, detection, RPN scoring, potential failure causes, design controls and corrective actions.",
    "Manufacturing Process Flow & Control Plan": "SMT process flow, stencil thickness, 10-zone reflow profile, 3D AOI inspection, ICT fixtures and packaging controls.",
    "DVP&R Verification Plan": "Thermal shock, ISO 7637-2 pulses, ISO 16750-3 vibration, IP67 submersion and CISPR 25 EMC/EMI test cases.",
    "Pre-Dispatch Inspection Certificate": "Serialized IMEI/MAC list, cellular RF test, GPS TTFF, flashing checksum and QA sign-off stamp.",
    "Commercial Tax Invoice": "GST/HSN table, invoice and e-Way bill details, buyer/consignee addresses, tax calculations and bank remittance instructions.",
    "Annual Skill Matrix": "Operator competency scores, IPC-A-610 certifications, ESD safety training and audit validity dates.",
  };
  return templates[title] ?? "Controlled project-specific requirement baseline requiring human review before release.";
}

const templateProjects = ["HLPL-AI4T-01", "HLPL-SLCT-01", "HLPL-XLINK-03", "VCU", "BMS"];
const templateDepartments = ["SAL", "EHW", "ESW", "MECH", "PUR", "QA", "EMF", "PROD", "FIN", "SIT", "HR"];
const templateDocumentTypes = ["PRS", "SOR", "DVP", "DFMEA", "PFMEA", "CP", "BOM", "PPAP", "WI", "SOP", "QUO", "INV"];
const formDocumentTypes = ["Contract Review", "Skill Matrix", "Form"];
const projectSeed = {
  customer: "Tata Motors Limited (EV Fleet Division, Pune)",
  contact: "Mr. Rajesh Sharma (Lead D&D EV)",
  quantity: "50,000 units / annum",
  techSpec: "AIS-140 / 4G Cat-1 / IP67 / CAN J1939 / Dual SIM / GNSS",
  commercialValue: "₹20.33 Cr",
};
const departmentSignatories: Record<string, { author: string; reviewer: string; approver: string }> = {
  SAL: { author: "Priya Sharma", reviewer: "Priya Sharma", approver: "Executive Admin / MD" },
  EHW: { author: "Avery Vale", reviewer: "Jordan Blake · QA HOD", approver: "Tech Director" },
  ESW: { author: "Devon Lane", reviewer: "Jordan Blake · QA HOD", approver: "Tech Director" },
  MECH: { author: "Samira Holt", reviewer: "Jordan Blake · QA HOD", approver: "Tech Director" },
  PUR: { author: "Morgan Reed", reviewer: "Jordan Blake · QA HOD", approver: "Plant Head" },
  QA: { author: "Jordan Blake", reviewer: "Jordan Blake · QA HOD", approver: "Tech Director" },
  EMF: { author: "Casey Rowan", reviewer: "Jordan Blake · QA HOD", approver: "Plant Head" },
  PROD: { author: "Mina Cross", reviewer: "Jordan Blake · QA HOD", approver: "Plant Head" },
  FIN: { author: "Priya Voss", reviewer: "Executive Admin / MD", approver: "Executive Admin / MD" },
  SIT: { author: "Kai Morgan", reviewer: "Executive Admin / MD", approver: "Executive Admin / MD" },
  HR: { author: "Taylor Quinn", reviewer: "Executive Admin / MD", approver: "Executive Admin / MD" },
};

function documentNumber(project: string, department: string, type: string, revision = "01", prefix = "HLPL") {
  const shortProject = project.replace(/^HLPL-/, "").replace(/-\d+$/, "").replace(/[^A-Z0-9]/gi, "").toUpperCase() || "GEN";
  return formDocumentTypes.includes(type) ? `${prefix}/F/${department}/${revision}` : `${prefix}-${shortProject}-${department}-${type}-${revision}`;
}

const demoPortal = (): PortalState => {
  const base = emptyPortal();
  const timestamp = "DEMO · 03 Oct 2026";
  const project = "HLPL-SLCT-01";
  const demoNote =
    "DEMO DATA ONLY · Fictional, illustrative automotive telematics lifecycle. NOT VALIDATED. No real customer, supplier, certification, procurement, billing, production, shipment, or client communication is represented.";
  const departmentSeeds: {
    id: AreaId;
    name: string;
    code: string;
    departmentType: string;
    lead: string;
  }[] = [
    {
      id: "sales",
      name: "Sales & Business Development",
      code: "SAL",
      departmentType: "Sales & Business Development",
      lead: "Riley Stone · demo",
    },
    {
      id: "ehw",
      name: "Embedded Hardware",
      code: "EHW",
      departmentType: "Embedded Hardware",
      lead: "Avery Vale · demo",
    },
    {
      id: "esw",
      name: "Firmware & Software",
      code: "ESW",
      departmentType: "Firmware & Software",
      lead: "Devon Lane · demo",
    },
    {
      id: "mech",
      name: "Mechanical Engineering",
      code: "MECH",
      departmentType: "Mechanical Engineering",
      lead: "Samira Holt · demo",
    },
    {
      id: "pur",
      name: "Purchasing & SCM",
      code: "PUR",
      departmentType: "Purchasing & SCM",
      lead: "Morgan Reed · demo",
    },
    {
      id: "qa",
      name: "Quality Assurance",
      code: "QA",
      departmentType: "Quality Assurance",
      lead: "Jordan Blake · demo",
    },
    {
      id: "emf",
      name: "Manufacturing",
      code: "EMF",
      departmentType: "Manufacturing",
      lead: "Casey Rowan · demo",
    },
    {
      id: "tst",
      name: "EOL Testing",
      code: "TST",
      departmentType: "EOL Testing",
      lead: "Mina Cross · demo",
    },
    {
      id: "fin",
      name: "Accounts & Finance",
      code: "FIN",
      departmentType: "Accounts & Finance",
      lead: "Priya Voss · demo",
    },
    {
      id: "sit",
      name: "Service & IT",
      code: "SIT",
      departmentType: "Service & IT",
      lead: "Kai Morgan · demo",
    },
    {
      id: "hrops",
      name: "HR & Operations",
      code: "HROPS",
      departmentType: "HR & Operations",
      lead: "Taylor Quinn · demo",
    },
  ];
  const departments: Department[] = departmentSeeds.map((seed, sortOrder) => ({
    id: `demo-dept-${seed.id}`,
    name: `DEMO · ${seed.name}`,
    code: `DEMO-${seed.code}`,
    departmentType: seed.departmentType,
    active: true,
    lead: seed.lead,
    sortOrder,
    isDemo: true,
    settings: {
      ...blankSettings(),
      prefix: `DEMO-${seed.code}`,
      activityTypes: ["DEMO controlled work", "DEMO review"],
      approvalGates: ["Human approval required"],
      milestones: ["DEMO Stage 8 readiness"],
      kpis: ["DEMO linked lifecycle progress"],
    },
  }));
  const fields = (stage: string, links: string[], extra: Record<string, string> = {}) => ({
    controlledNumber: project,
    lifecycleId: project,
    lifecycleStage: stage,
    linkedRecords: links.join(" · "),
    demoMarker: "DEMO DATA ONLY · NOT VALIDATED",
    targetDate: "2026-11-30",
    ...extra,
  });
  const make = (
    id: string,
    area: Exclude<
      AreaId,
      "home" | "audit" | "rnd" | "stores" | "production" | "quality" | "people"
    >,
    type: string,
    title: string,
    status: RecordStatus,
    priority: Priority,
    stage: string,
    links: string[],
    extra: Record<string, string> = {},
  ): RecordItem => ({
    id,
    area,
    departmentId: `demo-dept-${area}`,
    type,
    title: `DEMO · ${title}`,
    status,
    priority,
    reference: id,
    createdAt: timestamp,
    updatedAt: timestamp,
    notes: demoNote,
    fields: fields(stage, links, extra),
  });
  const task = (
    id: string,
    area: Exclude<AreaId, "home" | "audit" | "rnd" | "stores" | "production" | "quality" | "people">,
    title: string,
    priority: Priority,
    dueDate: string,
    assignee: string,
    projectId: string,
    projectLabel: string,
    detail: string,
    approval = false,
  ): RecordItem =>
    make(id, area, "Task", title, "Open", priority, "Today / pending checklist", [projectId], {
      dueDate,
      assignee,
      projectId,
      project: projectLabel,
      detail,
      approval: approval ? "Human approval required" : "Not required",
      progress: "0%",
    });
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = nextWorkingDay(today);
  const records: RecordItem[] = [
    make(
      "HLPL-F-SAL-01/2026/088",
      "sales",
      "Lead intake",
      "Fleet telematics RFQ · 50,000 units/year",
      "Approved",
      "High",
      "Lead intake",
      ["HLPL-SLCT-SAL-mNDA-01", "HLPL-SLCT-EHW-PRS-02"],
      {
        customer: "DEMO Ashok Leyland Commercial Vehicles · fictional",
        platform: "DEMO Dost & Bada Dost Fleet · fictional",
        volume: "50,000 units/year · illustrative",
      },
    ),
    make(
      "HLPL-SLCT-SAL-mNDA-01",
      "sales",
      "mNDA",
      "Bilateral mutual NDA",
      "Approved",
      "High",
      "mNDA",
      ["HLPL-F-SAL-01/2026/088", "HLPL-SLCT-SAL-QUO-01"],
      { ndaStatus: "DEMO bilateral signature simulation · no legal effect" },
    ),
    make(
      "HLPL-SLCT-SAL-QUO-01",
      "sales",
      "Commercial quotation",
      "Commercial proposal · $41.20/unit volume tiers",
      "Approved",
      "High",
      "Quotation",
      ["HLPL-SLCT-SAL-mNDA-01", "HLPL/F/MKT/01"],
      { price: "$41.20/unit · illustrative only", tiers: "10k / 25k / 50k volume tiers · DEMO" },
    ),
    make(
      "HLPL/F/MKT/01",
      "sales",
      "Contract review",
      "Cross-department contract review",
      "Approved",
      "Critical",
      "Contract review",
      ["HLPL-SLCT-SAL-QUO-01", "HLPL-SLCT-EHW-PRS-02"],
      { signoffs: "Hardware · Firmware · Quality · Purchase HOD · DEMO approvals only" },
    ),
    make(
      "HLPL-SLCT-01",
      "ehw",
      "Project",
      "AIS-140 Intelligent 4G Telematics Tracker",
      "In review",
      "Critical",
      "Stage 8 · Type Approval & SCM",
      ["HLPL-SLCT-EHW-PRS-01", "HLPL-SLCT-EHW-BOM-01", "HLPL-SLCT-QA-DVP-01", "F-PUR-16/SLCT-01"],
      {
        client: "DEMO Tata Motors EV Fleet · fictional",
        platform: "DEMO Tata Ace EV & Ultra T.7 · fictional",
        pmss: "HLPL-SLCT-PMSS-00",
        currentStage: "Stage 8 · Type Approval & SCM",
        targetBom: "$38.50 · illustrative",
        actualBom: "$35.42 · illustrative",
        voltage: "12V / 24V",
        temperature: "-40°C to +85°C",
        enclosure: "IP67",
        compliance: "AIS-140 · AEC-Q100/Q200 · ISO 7637-2 · targets only, NOT certified",
      },
    ),
    make("HLPL-SLCT-SAL-SOR-01", "sales", "Customer SOR", "Customer SOR · RFQ-2026-TATA-SLCT-088", "Approved", "Critical", "Stage 1 · Sales Intake & Client Portal Form", ["HLPL-SLCT-SAL-mNDA-01", "HLPL/F/MKT/01"], { rfq: "RFQ-2026-TATA-SLCT-088 · DEMO only", customer: "DEMO Tata Motors EV Fleet · fictional" }),
    make("HLPL-SLCT-SAL-mNDA-01", "sales", "mNDA", "Bilateral mutual NDA", "Approved", "High", "Stage 1 · Sales Intake & Client Portal Form", ["HLPL-SLCT-SAL-SOR-01", "HLPL/F/MKT/01"], { ndaStatus: "DEMO bilateral signature simulation · no legal effect" }),
    make("HLPL/F/MKT/01", "sales", "Contract review", "Cross-department feasibility review · five HOD approvals", "Approved", "Critical", "Stage 2 · Cross-Dept Feasibility Analysis", ["HLPL-SLCT-SAL-SOR-01", "HLPL-SLCT-EHW-PRS-01", "HLPL-SLCT-SAL-QUO-01"], { signoffs: "Hardware · Software · Mechanical · Purchase · Quality · all DEMO approvals complete", feasibility: "Approved automatically compiles PRS and quotation" }),
    make("HLPL-SLCT-EHW-PRS-01", "ehw", "PRS", "Auto-compiled Product Requirement Specification", "Approved", "Critical", "Stage 3 · Requirement Freeze & Commercial Confirmation", ["HLPL/F/MKT/01", "HLPL-SLCT-SAL-QUO-01", "HLPL-SLCT-01"], { generatedFrom: "Generated automatically from approved Contract Review HLPL/F/MKT/01", baseline: "Frozen · automated baseline · changes require PMSS amendment", requirements: "12V/24V · GNSS · LTE 4G · CAN/OBD · tamper and power-loss alerts · panic/SOS · illustrative" }),
    make("HLPL-SLCT-SAL-QUO-01", "sales", "Commercial quotation", "Auto-generated commercial quotation", "Approved", "High", "Stage 3 · Requirement Freeze & Commercial Confirmation", ["HLPL/F/MKT/01", "HLPL-SLCT-EHW-PRS-01"], { generatedFrom: "Generated automatically from approved Contract Review HLPL/F/MKT/01", commercial: "₹20.33 Cr total value · DEMO only" }),
    make("PO-TATA-SLCT-2026-9041", "sales", "Order", "Customer purchase order sync · 50,000 units", "Approved", "Critical", "Stage 8 · Type Approval & SCM", ["HLPL-SLCT-01", "HLPL-SLCT-FIN-INV-01", "HLPL-SLCT-EHW-PRS-01"], { volume: "50,000 units · DEMO only", value: "₹20.33 Cr · illustrative only", loi: "Customer LOI confirmed · DEMO simulation" }),
    make("HLPL-SLCT-FIN-INV-01", "fin", "Commercial billing", "Advance deposit verification and tax invoice", "Approved", "Critical", "Stage 8 · Type Approval & SCM", ["PO-TATA-SLCT-2026-9041"], { advance: "₹6.10 Cr · illustrative payment verification only", invoice: "Generated · DEMO only" }),
    make("HLPL-SLCT-EHW-BOM-01", "ehw", "BOM", "Production BOM release", "Approved", "High", "Stage 7 · Final Hardware & Mechanical Design Release", ["HLPL-SLCT-EHW-PRS-01", "PO-TATA-SLCT-2026-9041"], { release: "Final production BOM · DEMO release" }),
    make("HLPL-SLCT-EHW-GER-01", "ehw", "Gerber release", "Final Gerber package release", "Approved", "High", "Stage 7 · Final Hardware & Mechanical Design Release", ["HLPL-SLCT-EHW-BOM-01"], { release: "Final Gerber package · DEMO release" }),
    make("HLPL-SLCT-QA-APQP-01", "qa", "APQP gate", "APQP phases 1–4 closed", "Approved", "Critical", "Stage 8 · Type Approval & SCM", ["HLPL-SLCT-01", "HLPL-SLCT-QA-DVP-01"], { apqp: "Phases 1–4 closed · DEMO only", auditReadiness: "100% IATF 16949 & AIS-140 compliant · 0 NCRs · DEMO assertion only" }),
    make("HLPL-SLCT-QA-DVP-01", "qa", "DVP&R", "AIS-140 evidence pack", "Approved", "Critical", "Stage 8 · Type Approval & SCM", ["HLPL-SLCT-QA-APQP-01"], { tac: "DEMO reference #ARAI/TAC/2026/AIS140-842 · no certification claim" }),
    make(
      "HLPL-SLCT-EHW-PRS-02",
      "ehw",
      "PRS",
      "Product requirement specification",
      "Approved",
      "Critical",
      "PRS",
      ["HLPL-SLCT-01", "HLPL-SLCT-EHW-SCH-02", "HLPL-SLCT-ESW-HSI-01"],
      {
        requirements:
          "Dual CAN · illustrative Quectel 4G EC200U · illustrative u-blox GNSS · illustrative ST 6-axis IMU · ISO 7637-2 TVS",
      },
    ),
    make(
      "HLPL-SLCT-EHW-SCH-02",
      "ehw",
      "Schematic",
      "Approved schematic package",
      "Approved",
      "High",
      "Schematic",
      ["HLPL-SLCT-EHW-PRS-02", "HLPL-SLCT-EHW-BOM-01"],
      { drc: "0 errors · DEMO verification" },
    ),
    make(
      "HLPL-SLCT-EHW-BOM-01",
      "ehw",
      "BOM",
      "Production BOM",
      "Approved",
      "High",
      "BOM & layout",
      ["HLPL-SLCT-EHW-SCH-02", "F-PUR-15/SLCT-01"],
      { components: "Illustrative EC200U-CN · STM32G0B1VET6 · MAX-M10S · AXP2101 · 1000mAh LiPo" },
    ),
    make(
      "HLPL-SLCT-EHW-GER-01",
      "ehw",
      "Gerber release",
      "4-layer PCB Gerber release",
      "Approved",
      "High",
      "Gerber gate",
      ["HLPL-SLCT-EHW-SCH-02", "HLPL-SLCT-PFD-01"],
      { pcb: "4-layer FR4 · ENIG finish · IPC Class 3 target · NOT VALIDATED" },
    ),
    make(
      "HLPL-SLCT-EHW-DFMEA-01",
      "ehw",
      "DFMEA",
      "Hardware design FMEA",
      "Approved",
      "High",
      "Gerber gate",
      ["HLPL-SLCT-EHW-BOM-01", "HLPL-SLCT-QA-DVP-01"],
      { rpn: "All RPNs below 100 · DEMO assessment" },
    ),
    make(
      "HLPL-SLCT-ESW-HSI-01",
      "esw",
      "HSI register",
      "Hardware-software interface specification",
      "Approved",
      "High",
      "HSI & CI/CD",
      ["HLPL-SLCT-EHW-PRS-02", "HLPL-SLCT-ESW-FW-01"],
      { hsi: "CAN J1939 registers · MQTT over TLS 1.3 · AIS-140 emergency packet · illustrative" },
    ),
    make(
      "HLPL-SLCT-ESW-FW-01",
      "esw",
      "Firmware release",
      "Firmware v1.4.2 production candidate",
      "Approved",
      "High",
      "G9–G11",
      ["HLPL-SLCT-ESW-HSI-01", "HLPL-SLCT-TST-EOL-01"],
      { version: "v1.4.2", cicd: "100% pass · 0 critical bugs · DEMO telemetry" },
    ),
    make(
      "HLPL-SLCT-MECH-CAD-01",
      "mech",
      "STEP clearance",
      "3D STEP enclosure model",
      "Approved",
      "High",
      "STEP clearance",
      ["HLPL-SLCT-MECH-DRW-01", "HLPL-SLCT-EHW-GER-01"],
      { enclosure: "Flame-retardant ABS/PC · ultrasonic weld + silicone O-ring · IP67 target" },
    ),
    make(
      "HLPL-SLCT-MECH-DRW-01",
      "mech",
      "2D drawing",
      "2D production drawing",
      "Approved",
      "High",
      "2D drawing",
      ["HLPL-SLCT-MECH-CAD-01", "HLPL-SLCT-EMF-CP-01"],
      { revision: "Rev 01 · DEMO controlled drawing" },
    ),
    make(
      "F-PUR-10/SLCT-01",
      "pur",
      "Rapid prototype request",
      "Prototype soft-tooling sourcing track",
      "Approved",
      "High",
      "Request",
      ["F-PUR-15/SLCT-01", "HLPL-SLCT-EHW-BOM-01"],
      { track: "Rapid prototype · soft tooling · DEMO only" },
    ),
    make(
      "F-PUR-16",
      "pur",
      "F-PUR-16",
      "Supplier capacity assessment",
      "Approved",
      "High",
      "ASL/ACML",
      ["F-PUR-15/SLCT-01", "HLPL-SLCT-01"],
      { capacity: "12,000 units/month rated capacity · illustrative" },
    ),
    make(
      "F-PUR-15/SLCT-01",
      "pur",
      "PPAP Level 3",
      "Supplier PPAP Level 3 dossier",
      "In review",
      "Critical",
      "PPAP",
      ["F-PUR-16", "HLPL-SLCT-EHW-BOM-01"],
      {
        asl: "DEMO Arrow Electronics · DEMO Avnet · DEMO Quectel Direct · DEMO Molex; fictional sample entries",
        procurement: "No PO, payment or shipment executed",
      },
    ),
    make(
      "HLPL-APQP-001",
      "qa",
      "APQP gate",
      "APQP master checklist",
      "In review",
      "Critical",
      "APQP",
      ["HLPL-SLCT-QA-DVP-01", "HLPL-SLCT-01"],
      { phases: "Phases 1–4 closed · Phase 5 in progress · DEMO only" },
    ),
    make(
      "HLPL-SLCT-QA-DVP-01",
      "qa",
      "DVP&R",
      "Design verification plan and report",
      "In review",
      "Critical",
      "DVP&R",
      ["HLPL-APQP-001", "HLPL-SLCT-TST-EOL-01"],
      {
        verification: "Thermal shock · 50G mechanical shock · 15kV ESD · illustrative",
        certificate: "DEMO certificate reference only · no external certification claim",
      },
    ),
    make(
      "HLPL-EMF-CHK-01",
      "emf",
      "Line startup checklist",
      "SMT Line 2 startup verification",
      "Approved",
      "High",
      "Line startup",
      ["HLPL-SLCT-PFD-01", "SS-SLCT-02"],
      { line: "SMT Line 2 · reflow profile verified · paste thickness 120µm · DEMO" },
    ),
    make(
      "HLPL-SLCT-PFD-01",
      "emf",
      "PFD",
      "Process flow diagram",
      "Approved",
      "High",
      "PFD",
      ["SS-SLCT-02", "HLPL-SLCT-EMF-CP-01"],
      { flow: "SMT → assembly → test → inspection → pack · illustrative" },
    ),
    make(
      "SS-SLCT-02",
      "emf",
      "PFMEA",
      "Process FMEA",
      "Approved",
      "High",
      "PFMEA",
      ["HLPL-SLCT-PFD-01", "HLPL-SLCT-EMF-CP-01"],
      { fmea: "DEMO PFMEA for SMT and assembly controls" },
    ),
    make(
      "HLPL-SLCT-EMF-CP-01",
      "emf",
      "Control plan",
      "Production control plan",
      "In review",
      "High",
      "Control plan",
      ["SS-SLCT-02", "HLPL-SLCT-TST-EOL-01"],
      { control: "Illustrative process controls; human release required" },
    ),
    make(
      "HLPL-SLCT-TST-EOL-01",
      "tst",
      "EOL test run",
      "EOL test run batch · SLCT-2026-0101 to 0120",
      "Approved",
      "High",
      "FPY & QR",
      ["HLPL-SLCT-ESW-FW-01", "HLPL-SLCT-QA-DVP-01"],
      {
        serials: "SLCT-2026-0101 to SLCT-2026-0120 · DEMO simulated",
        checks: "MCU pre-flash · GNSS lock · 4G ping · CAN loopback · all PASS in simulation",
        qr: "Serialized QR labels generated in DEMO only",
        fpy: "97.4% · simulated first-pass yield",
      },
    ),
    make(
      "HLPL-INV-2026-089",
      "fin",
      "Commercial billing",
      "Advance batch billing review",
      "In review",
      "High",
      "Billing",
      ["HLPL-SLCT-01", "F-PUR-15/SLCT-01"],
      {
        amount: "$103,000 · illustrative only",
        poGrn: "DEMO verified",
        ageing: "18 days · healthy · no receivable action",
      },
    ),
    make(
      "HLPL-SLCT-SIT-01",
      "sit",
      "Server telemetry",
      "Telematics cloud telemetry and backup review",
      "Approved",
      "Normal",
      "Telemetry",
      ["HLPL-SLCT-ESW-FW-01"],
      {
        telemetry: "DEMO MQTT broker connection · latency 42ms",
        backup: "DEMO offsite database backup verified at 03:00 UTC",
        isms: "Illustrative ISMS monitoring only",
      },
    ),
    make(
      "HLPL/F/HR/03",
      "hrops",
      "Skill matrix",
      "Telematics team competency matrix",
      "Approved",
      "Normal",
      "Skill matrix",
      ["HLPL-SLCT-01"],
      {
        roles: "Telematics SMT Lead · Firmware Architect",
        score: "Level 4 · 3.8/4.0 average · DEMO competency profile",
      },
    ),
    make(
      "HLPL-SLCT-DMAIC-01",
      "hrops",
      "DMAIC tollgate",
      "SMT yield improvement DMAIC",
      "Open",
      "Normal",
      "DMAIC",
      ["HLPL-SLCT-TST-EOL-01", "HLPL/F/HR/03"],
      { dmaic: "Define complete · Measure in progress · DEMO project" },
    ),
    make(
      "HLPL-SLCT-QA-REL-01",
      "qa",
      "Quality release",
      "Human quality release decision",
      "In review",
      "Critical",
      "Quality release",
      ["HLPL-SLCT-QA-DVP-01", "HLPL-SLCT-TST-EOL-01"],
      { approval: "PENDING · NEVER AUTO-APPROVED", release: "Not released" },
    ),
    task("DEMO-TASK-EHW-ECN-002", "ehw", "Review & approve ECN-002 MOSFET package layout change", "Critical", today, "Avery Vale", "HLPL-BCU-02", "HLPL-BCU-02 · Body Control Unit Gen 3", "Thermal dissipation layout review · due today 14:00", true),
    task("DEMO-TASK-QA-CONTRACT", "qa", "Sign Contract Review Record HLPL/F/MKT/01 for Tata Ace EV Telematics", "High", today, "Jordan Blake", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Cross-functional sign-off · due today 16:30", true),
    task("DEMO-TASK-EMF-REFLOW", "emf", "Verify reflow oven 10-zone thermal profile for SMT Line 2 lot BATCH-04", "High", today, "Casey Rowan", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Process verification · due today 11:00"),
    task("DEMO-TASK-ESW-PR142", "esw", "Merge PR #142 CAN J1939 telemetry parser with unit test coverage above 90%", "Normal", today, "Devon Lane", "HLPL-XLINK-03", "HLPL-XLINK-03 · Commercial Vehicle Gateway", "Peer review and CI check · due today 17:00"),
    task("DEMO-TASK-FIN-ADVANCE", "fin", "Approve advance billing payment release for EC200U reel batch", "High", today, "Priya Voss", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Financial commitment · due today 15:00", true),
    task("DEMO-TASK-PUR-FIBOCOM", "pur", "Verify second-source vendor capacity scorecard F-PUR-16 for Fibocom", "Normal", today, "Morgan Reed", "HLPL-XLINK-03", "HLPL-XLINK-03 · Commercial Vehicle Gateway", "Capacity scorecard review · due today 18:00"),
    task("DEMO-TASK-HR-IPC", "hrops", "Log IPC-A-610 workmanship training attendance in Skill Matrix HLPL/F/HR/03", "Low", today, "Taylor Quinn", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Competency record update · due today 17:30"),
    task("DEMO-TASK-SIT-BACKUP", "sit", "Execute offsite encrypted backup replication drill for telemetry DB", "Normal", today, "Kai Morgan", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Recovery evidence capture · due today 19:00"),
    task("DEMO-TASK-MECH-CLEARANCE", "mech", "Conduct 3D STEP clearance check for BCU Gen 3 connector harness", "High", tomorrow, "Samira Holt", "HLPL-BCU-02", "HLPL-BCU-02 · Body Control Unit Gen 3", "Harness clearance review · tomorrow"),
    task("DEMO-TASK-TST-CAL", "tst", "Calibrate automated EOL jig JIG-SLCT-01 optical barcode scanner", "Normal", tomorrow, "Mina Cross", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Jig calibration check · tomorrow"),
    task("DEMO-TASK-SAL-QUO", "sales", "Transmit revised quotation HLPL-BCU-SAL-QUO-02 to Mahindra Electric", "High", tomorrow, "Riley Stone", "HLPL-BCU-02", "HLPL-BCU-02 · Body Control Unit Gen 3", "Commercial response draft · tomorrow"),
    task("DEMO-TASK-QA-PPAP", "qa", "Review Supplier PPAP Level 3 submission F-PUR-15 for Molex connector", "High", tomorrow, "Jordan Blake", "HLPL-SLCT-01", "HLPL-SLCT-01 · AIS-140 GPS/4G Telematics Gateway", "Supplier evidence review · tomorrow"),
    task("DEMO-TASK-EMF-5S", "emf", "Conduct pre-manufacturing 5S audit for through-hole assembly station", "Normal", tomorrow, "Casey Rowan", "HLPL-PST-01", "HLPL-PST-01 · Power Shuttle Transmission Unit", "Readiness audit · tomorrow"),
    task("DEMO-TASK-PUR-MLCC", "pur", "Audit lead-time variance report for passive MLCC capacitors", "Normal", tomorrow, "Morgan Reed", "HLPL-EFAN-01", "HLPL-EFAN-01 · High-Power eFan Speed Controller", "Supply risk review · tomorrow"),
  ];
  const projectProfiles = [
    ["HLPL-SLCT-01", "AIS-140 Intelligent 4G Telematics Tracker", "Tata Motors EV Fleet · fictional DEMO", "Stage 8 · Type Approval & SCM", "12V / 24V", "IP67", "$35.42"],
    ["HLPL-BCU-02", "Body Control Unit Gen 3", "Mahindra Electric · fictional DEMO", "Stage 5 · Pilot Build", "24V", "IP67", "$52.00"],
    ["HLPL-XLINK-03", "Commercial Vehicle Gateway", "Ashok Leyland Fleet · fictional DEMO", "Stage 4 · PoC", "24V", "IP67", "$44.10"],
    ["HLPL-EFAN-01", "High-Power eFan Speed Controller", "Sonalika Tractors · fictional DEMO", "Stage 2 · Feasibility", "48V", "IP68", "$29.80"],
    ["HLPL-PST-01", "Power Shuttle Transmission Unit", "Escorts Kubota · fictional DEMO", "Stage 9 · Mass Production", "24V", "IP67", "$64.50"],
  ] as const;
  projectProfiles.slice(1).forEach(([id, title, client, stage, voltage, enclosure, bom]) => {
    records.push(make(id, "ehw", "Project", title, "In review", "High", stage, [], { client, currentStage: stage, voltage, enclosure, actualBom: `${bom} · illustrative`, pmss: `${id}-PMSS-00` }));
  });
  const roles: DepartmentRole[] = departments.flatMap((department, index) => [
    {
      id: `demo-role-${department.id}-lead`,
      departmentId: department.id,
      name: "DEMO Department lead",
      assignee: department.lead,
      permissions: [...permissionOptions],
      active: true,
      isDemo: true,
    },
    {
      id: `demo-role-${department.id}-coordinator`,
      departmentId: department.id,
      name: "DEMO Coordinator",
      assignee: `Taylor ${index + 1} · demo@example.test`,
      permissions: ["records:view", "records:create", "tasks:assign", "approvals:routine"],
      active: true,
      isDemo: true,
    },
  ]);
  const document = (
    id: string,
    title: string,
    departmentId: string,
    group: string,
    part: string,
    phase: string,
    lifecycle: ControlledDocument["lifecycle"],
    linkedRecordRefs: string[],
  ): ControlledDocument => ({
    id,
    title: `DEMO · ${title}`,
    url: "",
    type: "Controlled technical record",
    departmentId,
    group,
    device: project,
    part,
    revision: "01 · DEMO",
    phase,
    lifecycle,
    classification: "Internal · DEMO only",
    effectiveDate: "Not effective · human approval required",
    approver: "Human approval required",
    history: ["DEMO record seeded for interconnected portal validation"],
    linkedRecordRefs,
    lifecycleStage: phase.match(/Stage\s+\d+/)?.[0],
    deliverableKind: /schematic/i.test(title)
      ? "Schematic PDF"
      : /gerber|pcb/i.test(title)
        ? "Gerber ZIP"
        : /step|cad/i.test(title)
          ? "3D STEP"
          : /bom/i.test(title)
            ? "BOM tracker"
            : undefined,
  });
  return {
    ...base,
    demoLoaded: true,
    setupStep: setupSteps.length - 1,
    setup: {
      ...base.setup,
      configuration: {
        ...base.setup.configuration,
        pmssProject: project,
        pmssStatus: "Controlled baseline",
        pmssVoltage: "12V / 24V",
        pmssTemperature: "-40°C to +85°C",
        pmssIp: "IP67",
        pmssCompliance: "AIS-140 · AEC-Q100 · ISO 7637-2 · RoHS/REACH · DEMO targets only",
        pmssTargetBom: "$38.50 · illustrative",
        pmssActualBom: "$36.80 · illustrative",
        pmssLifecycleStage: "Stage 8 · Type Approval & SCM",
        departmentModel: "11 department DEMO SCMS model",
        projectStages: "Nine-stage lifecycle with human gates",
        qualityRelease: "Human quality release required; never auto-approved",
        auditOwnership: "Department-owned evidence and controlled documents",
        uat: "DEMO test data loaded",
      },
    },
    departments,
    roles,
    records,
    masters: {
      ...base.masters,
      people: departmentSeeds.map((seed) => seed.lead),
      suppliers: ["DEMO Arrow Electronics", "DEMO Avnet", "DEMO Quectel Direct", "DEMO Molex"],
      parts: [
        "DEMO EC200U-CN",
        "DEMO STM32G0B1VET6",
        "DEMO MAX-M10S",
        "DEMO AXP2101",
        "DEMO 1000mAh LiPo",
      ],
      products: ["HLPL-SLCT-01", "HLPL-SLCT-01", "HLPL-BCU-02", "HLPL-XLINK-03", "HLPL-EFAN-01", "HLPL-PST-01"],
      customers: ["DEMO Tata Motors EV · fictional", "DEMO Mahindra Electric · fictional", "DEMO Ashok Leyland Fleet · fictional", "DEMO Sonalika Tractors · fictional", "DEMO Escorts Kubota · fictional"],
      routes: ["DEMO SMT Line 2"],
      documentTypes: [
        "PRS",
        "Schematic",
        "BOM",
        "Gerber",
        "HSI",
        "DVP&R",
        "PFD",
        "PFMEA",
        "Control plan",
      ],
    },
    approvals: [
      { id: "demo-approval-quality-release", title: `DEMO · Human quality release — ${project}`, recordId: "HLPL-SLCT-QA-REL-01", outcome: "Pending", updatedAt: timestamp },
      { id: "demo-approval-ecn-002", title: "DEMO · EHW ECN-002 thermal layout review", recordId: "DEMO-TASK-EHW-ECN-002", outcome: "Pending", updatedAt: timestamp },
      { id: "demo-approval-fin-advance", title: "DEMO · FIN advance billing payment release", recordId: "DEMO-TASK-FIN-ADVANCE", outcome: "Pending", updatedAt: timestamp },
    ],
    documents: mergeAutomotiveDemoDocuments([
      document(
        "demo-doc-pmss",
        "Project master specification sheet",
        "demo-dept-ehw",
        "02_Product_Platforms/Telematics_Gateways",
        "HLPL-SLCT-PMSS-00",
        "Stage 8 · Type Approval & SCM Planning",
        "In review",
        ["HLPL-SLCT-01", "HLPL-SLCT-EHW-PRS-02"],
      ),
      document(
        "demo-doc-prs",
        "Product requirement specification",
        "demo-dept-ehw",
        "03_Engineering/EHW",
        "HLPL-SLCT-EHW-PRS-02",
        "Phase_2_Requirements_and_Architecture",
        "Approved",
        ["HLPL-SLCT-EHW-PRS-02", "HLPL-SLCT-EHW-SCH-02"],
      ),
      document(
        "demo-doc-bom",
        "Production BOM",
        "demo-dept-ehw",
        "03_Engineering/EHW",
        "HLPL-SLCT-EHW-BOM-01",
        "Phase_9_Production_and_Verification",
        "Approved",
        ["HLPL-SLCT-EHW-BOM-01", "F-PUR-15/SLCT-01"],
      ),
      document(
        "demo-doc-dvpr",
        "DVP&R report",
        "demo-dept-qa",
        "04_Quality/Device_Audit_Packs",
        "HLPL-SLCT-QA-DVP-01",
        "Stage 8 · Type Approval & SCM Planning",
        "In review",
        ["HLPL-SLCT-QA-DVP-01", "HLPL-APQP-001"],
      ),
      document(
        "demo-doc-control-plan",
        "Production control plan",
        "demo-dept-emf",
        "05_Manufacturing/Control_Plans",
        "HLPL-SLCT-EMF-CP-01",
        "Phase_9_Production_and_Verification",
        "In review",
        ["HLPL-SLCT-EMF-CP-01", "SS-SLCT-02"],
      ),
      document("demo-doc-quotation", "Commercial quotation · $41.20 unit volume tier", "demo-dept-sales", "Governance/QMS", "HLPL-SLCT-SAL-QUO-01", "Stage 3 · Requirement Freeze", "Approved", ["HLPL-SLCT-SAL-QUO-01"]),
      document("demo-doc-contract", "Cross-functional feasibility record", "demo-dept-sales", "Governance/QMS", "HLPL/F/MKT/01", "Stage 2 · Feasibility", "In review", ["HLPL/F/MKT/01"]),
      document("demo-doc-schematic", "Approved schematic package", "demo-dept-ehw", "Product/Device Audit Packs", "HLPL-SLCT-EHW-SCH-02", "Phase_4_Schematic_Design · HW_15–16", "Approved", ["HLPL-SLCT-EHW-SCH-02"]),
      document("demo-doc-gerber", "Gerber and PCB release", "demo-dept-ehw", "Product/Device Audit Packs", "HLPL-SLCT-EHW-GER-01", "Phase_7_Fabrication_and_Precompliance · HW_24–27", "Approved", ["HLPL-SLCT-EHW-GER-01"]),
      document("demo-doc-hsi", "Hardware-software interface specification", "demo-dept-esw", "Product/Device Audit Packs", "HLPL-SLCT-ESW-HSI-01", "Phase_8_Hardware_Software_Integration · HW_28–29", "Approved", ["HLPL-SLCT-ESW-HSI-01"]),
      document("demo-doc-step", "3D STEP enclosure clearance report", "demo-dept-mech", "Product/Device Audit Packs", "HLPL-SLCT-MECH-CAD-01", "Phase_5_Mechanical_and_Enclosure · HW_17–18", "Approved", ["HLPL-SLCT-MECH-CAD-01"]),
      document("demo-doc-ppap", "Supplier PPAP Level 3 dossier", "demo-dept-pur", "Supplier Quality/IQC", "F-PUR-15/SLCT-01", "Stage 8 · Type Approval & SCM Planning", "In review", ["F-PUR-15/SLCT-01"]),
      document("demo-doc-eol", "Pre-dispatch inspection and serialized EOL certificate", "demo-dept-tst", "Product/Device Audit Packs", "HLPL-SLCT-TST-PDI-01", "Phase_9_Production_and_Verification · HW_30–35", "Approved", ["HLPL-SLCT-TST-EOL-01"]),
      document("demo-doc-invoice", "Commercial tax invoice and e-Way bill", "demo-dept-fin", "Governance/QMS", "HLPL-SLCT-FIN-INV-01", "Stage 9 · Mass Production", "In review", ["HLPL-INV-2026-089"]),
      document("demo-doc-skill", "Annual skill matrix and competency evaluation", "demo-dept-hrops", "Governance/QMS", "HLPL/F/HR/03", "Stage 9 · Mass Production", "Approved", ["HLPL/F/HR/03"]),
    ]),
    audit: [
      {
        id: "demo-audit-slct",
        at: timestamp,
        action: "Complete 11-hub demo lifecycle loaded",
        detail: `${project} Stage 8 sample data loaded. ${demoNote}`,
      },
    ],
    notifications: [`DEMO DATA ONLY · ${project} Stage 8 lifecycle is active`, "Human quality release is pending; no automatic approval is possible."],
    alerts: [
      { id: "ALERT_HW_01", severity: "Critical", title: "Key MOSFET selected on EFAN-01 lacks AEC-Q qualification", detail: "R&D risk waiver is required before the fictional DEMO part selection can advance.", departmentId: "demo-dept-ehw", resolved: false },
      { id: "ALERT_SAL_02", severity: "Warning", title: "Contract Review pending functional sign-offs beyond 48 hours", detail: "DEMO Tata Ace EV contract review is awaiting simulated functional acknowledgement.", departmentId: "demo-dept-sales", resolved: false },
      { id: "ALERT_TST_01", severity: "Critical", title: "First-pass yield below 95% threshold on Line 1", detail: "Current DEMO FPY: 92.4%. Review the simulated failure trend before release.", departmentId: "demo-dept-tst", resolved: false },
      { id: "ALERT_FIN_03", severity: "Warning", title: "Customer payment overdue beyond 45 days for Ashok Leyland Batch 02", detail: "Illustrative exposure: ₹8,40,000. No actual receivable is represented.", departmentId: "demo-dept-fin", resolved: false },
    ],
  };
};
const createId = () => crypto.randomUUID();
const now = () => new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const homeArea = areas[0];
const findAreaDepartment = (departments: Department[], area: AreaId) => {
  const type = areaDepartmentType[area];
  return type
    ? departments.find((department) => department.active && department.departmentType === type)
    : undefined;
};
const areaForDepartment = (department: Department | undefined): AreaId => {
  if (!department) return "home";
  return (
    (Object.entries(areaDepartmentType).find(
      ([, type]) => type === department.departmentType,
    )?.[0] as AreaId | undefined) ?? "home"
  );
};
const areaById = (id: AreaId) => areas.find((area) => area.id === id) ?? homeArea;
const areaDepartmentType: Partial<Record<AreaId, string>> = {
  sales: "Sales & Business Development",
  ehw: "Embedded Hardware",
  esw: "Firmware & Software",
  mech: "Mechanical Engineering",
  pur: "Purchasing & SCM",
  qa: "Quality Assurance",
  emf: "Manufacturing",
  tst: "EOL Testing",
  fin: "Accounts & Finance",
  sit: "Service & IT",
  hrops: "HR & Operations",
  rnd: "Embedded Hardware",
  stores: "Purchasing & SCM",
  production: "Manufacturing",
  quality: "Quality Assurance",
  people: "HR & Operations",
};
const legacyAreaMap: Partial<Record<AreaId, AreaId>> = {
  rnd: "ehw",
  stores: "pur",
  production: "emf",
  quality: "qa",
  people: "hrops",
};
const readPortal = (): PortalState => {
  const base = emptyPortal();
  try {
    const raw =
      window.localStorage.getItem(storeKey) ??
      window.localStorage.getItem("six-sense-portal-v3") ??
      window.localStorage.getItem("six-sense-portal-v2");
    if (!raw) return base;
    const value = JSON.parse(raw) as Partial<PortalState>;
    const demoDocument = demoPortal().documents.find(
      (document) => document.id === "demo-doc-datasheet",
    );
    const documents = Array.isArray(value.documents)
      ? value.documents.map((document) => {
          const isDemoDatasheet = value.demoLoaded === true && document.id === "demo-doc-datasheet";
          const defaults = isDemoDatasheet ? demoDocument : undefined;
          return {
            ...document,
            ...(isDemoDatasheet ? defaults : {}),
            id: document.id,
            title: document.title,
            type: document.type,
            departmentId: defaults?.departmentId ?? document.departmentId,
            group: defaults?.group ?? document.group,
            device: defaults?.device ?? document.device,
            part: defaults?.part ?? document.part,
            revision: defaults?.revision ?? document.revision,
            phase: defaults?.phase ?? document.phase,
            lifecycle: defaults?.lifecycle ?? document.lifecycle,
            classification: defaults?.classification ?? document.classification,
            linkedRecordRefs:
              defaults?.linkedRecordRefs ??
              (Array.isArray(document.linkedRecordRefs) ? document.linkedRecordRefs : []),
            effectiveDate: defaults?.effectiveDate ?? document.effectiveDate,
            approver: defaults?.approver ?? document.approver,
            history: Array.isArray(document.history) ? document.history : [],
          };
        })
      : [];
    const hydrated = {
      ...base,
      ...value,
      demoLoaded: value.demoLoaded === true,
      setup: {
        ...base.setup,
        ...value.setup,
        configuration: { ...base.setup.configuration, ...(value.setup?.configuration ?? {}) },
      },
      masters: { ...base.masters, ...value.masters },
      departments: Array.isArray(value.departments)
        ? value.departments.map((department) => ({
            ...department,
            settings: { ...blankSettings(), ...department.settings },
          }))
        : [],
      roles: Array.isArray(value.roles) ? value.roles : [],
      approvals: Array.isArray(value.approvals) ? value.approvals : [],
      records:
        value.demoLoaded === true
          ? (() => {
              const additions = demoPortal().records.filter((item) => item.reference.startsWith("HLPL-SLCT") || item.reference === "PO-TATA-SLCT-2026-9041");
              const existing = Array.isArray(value.records) ? value.records.map((record) => ({ ...record, area: legacyAreaMap[record.area] ?? record.area })) : [];
              return [...existing, ...additions.filter((item) => !existing.some((record) => record.reference === item.reference))];
            })()
          : Array.isArray(value.records)
            ? value.records.map((record) => ({ ...record, area: legacyAreaMap[record.area] ?? record.area }))
            : [],
      documents: value.demoLoaded === true ? mergeAutomotiveDemoDocuments(documents) : documents,
      audit: Array.isArray(value.audit) ? value.audit : [],
      notifications: Array.isArray(value.notifications) ? value.notifications : [],
      alerts: Array.isArray(value.alerts) ? value.alerts : [],
      raciMatrix: value.raciMatrix ?? defaultRaciMatrix(),
    };
    // A legacy browser snapshot may retain the DEMO marker while losing its arrays.
    // Restore the complete DEMO workspace rather than leaving document controls unreachable.
    if (
      hydrated.demoLoaded &&
      (!hasCompleteDemoDocumentSet(hydrated.documents) || !hydrated.departments.length || !hydrated.records.length)
    ) {
      const restored = demoPortal();
      return {
        ...restored,
        audit: [...hydrated.audit, ...restored.audit].slice(0, 100),
        notifications: [...hydrated.notifications, ...restored.notifications].slice(0, 100),
      };
    }
    return hydrated;
  } catch {
    return base;
  }
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — Six Sense Mobility" },
      { name: "description", content: "Operational workspace for Six Sense Mobility in Noida." },
      { property: "og:title", content: "Command Center — Six Sense Mobility" },
      {
        property: "og:description",
        content: "Operational workspace and setup hub for Six Sense Mobility.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const [portal, setPortal] = useState<PortalState | null>(null);
  const [activeArea, setActiveArea] = useState<AreaId>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<
    "queue" | "detail" | "summary" | "project" | "assignee" | "index" | "pmss"
  >("queue");
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [queueStage, setQueueStage] = useState<string | null>(null);
  const [modal, setModal] = useState<
    "create" | "wizard" | "approvals" | "documents" | "document" | "history" | "admin" | null
  >(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [departmentContext, setDepartmentContext] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>(() => personas[0] ?? { id: "admin", label: "Executive Admin / MD", person: "Full master access", kind: "admin" });
  const [rfqStep, setRfqStep] = useState(0);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [syncHubOpen, setSyncHubOpen] = useState(false);
  const [draftHubOpen, setDraftHubOpen] = useState(false);
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(false);
  const [printTemplate, setPrintTemplate] = useState<PrintableDocument | null>(null);
  const [ai4tOpen, setAi4tOpen] = useState(false);
  const [ai4tSimulation, setAi4tSimulation] = useState<Ai4tSimulation>({ stage: 0, history: [] });
  const [projectScopes, setProjectScopes] = useState<Partial<Record<AreaId, ProjectScope>>>({});
  const [selectedProjectId, setSelectedProjectId] = useState("HLPL-SLCT-01");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  useEffect(() => setPortal(readPortal()), []);
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("hexense-scms-theme");
    setDarkMode(savedTheme !== "light");
  }, []);
  useEffect(() => {
    window.localStorage.setItem("hexense-scms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== "[" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      event.preventDefault();
      setSidebarExpanded((value) => !value);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  useEffect(() => {
    if (portal) window.localStorage.setItem(storeKey, JSON.stringify(portal));
  }, [portal]);
  if (!portal)
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Opening your portal…
      </main>
    );
  const update = (recipe: (state: PortalState) => PortalState) =>
    setPortal((state) => (state ? recipe(state) : state));
  const log = (action: string, detail: string) =>
    update((state) => ({
      ...state,
      audit: [{ id: createId(), at: now(), action, detail }, ...state.audit].slice(0, 100),
      notifications: [detail, ...state.notifications].slice(0, 100),
    }));
  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3500);
  };
  const navigate = (area: AreaId) => {
    setActiveArea(area);
    setView("queue");
    setSelectedId(null);
    setSelectedAssignee(null);
    setQueueStage(null);
    setMobileMenu(false);
  };
  const switchPersona = (next: Persona) => {
    setPersona(next);
    const nextDepartment = next.kind === "lead" ? findAreaDepartment(portal.departments, next.departmentId ?? "home")?.id ?? null : null;
    setDepartmentContext(nextDepartment);
    setActiveArea(next.kind === "lead" && next.departmentId ? next.departmentId : "home");
    setView("queue");
    log("Persona context changed", `${next.label} · ${next.person}`);
    announce(`${next.label} context active.`);
  };
  const loadDemo = () => {
    setPortal(demoPortal());
    setDepartmentContext(null);
    setModal(null);
    announce("DEMO lifecycle loaded. Fictional records are clearly marked and linked.");
  };
  const resetDemo = () => {
    setPortal(emptyPortal());
    setDepartmentContext(null);
    setModal(null);
    announce("Demo lifecycle removed. Your portal is empty again.");
  };
  const addRecord = (input: Omit<RecordItem, "id" | "reference" | "createdAt" | "updatedAt">) => {
    const count = portal.records.filter((record) => record.area === input.area).length + 1;
    const prefix = areaById(input.area)
      .short.toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5);
    const departmentId =
      input.departmentId ??
      departmentContext ??
      findAreaDepartment(portal.departments, input.area)?.id;
    const department = portal.departments.find((item) => item.id === departmentId);
    const projectId = input.fields["projectId"] || input.fields["product"] || "GEN";
    const departmentCode = department?.code.replace(/^DEMO-/, "") || prefix;
    const docType =
      input.type
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .slice(0, 12) || "REC";
    const generatedNumber = documentNumber(projectId, departmentCode, docType, String(count).padStart(2, "0"), portal.templateSettings?.prefix ?? "HLPL");
    const record: RecordItem = {
      ...input,
      departmentId,
      id: createId(),
      reference: input.fields["controlledNumber"] || generatedNumber,
      createdAt: now(),
      updatedAt: now(),
    };
    update((state) => ({ ...state, records: [record, ...state.records] }));
    log("Record created", `${record.reference} created`);
    setSelectedId(record.id);
    setView("detail");
    setModal(null);
    announce(`${record.reference} created.`);
  };
  const updateTask = (taskId: string, patch: Partial<RecordItem>, action: string) => {
    const task = portal.records.find((record) => record.id === taskId);
    if (!task) return;
    update((state) => ({
      ...state,
      records: state.records.map((record) =>
        record.id === taskId ? { ...record, ...patch, updatedAt: now() } : record,
      ),
    }));
    log(action, `${task.reference} · ${task.title}`);
    announce(`${task.title} updated.`);
  };
  const activeRecords = portal.records.filter((record) => !record.archived);
  const selected = activeRecords.find((record) => record.id === selectedId);
  const selectedDocument = portal.documents.find((document) => document.id === selectedDocumentId);
  const selectedProjectProfile = activeRecords.find(
    (record) => record.reference === selectedProjectId && record.type === "Project",
  );
  const active = areaById(activeArea);
  const openRecord = (record: RecordItem) => {
    setActiveArea(record.area);
    setSelectedId(record.id);
    setView("detail");
  };
  const openDocument = (document: ControlledDocument) => {
    setSelectedDocumentId(document.id);
    setModal("document");
  };
  return (
    <main className={`${darkMode ? "dark" : ""} min-h-screen bg-background text-foreground transition-colors duration-200 motion-reduce:transition-none`}>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar p-3 transition-[width] duration-200 motion-reduce:transition-none lg:flex lg:flex-col ${sidebarExpanded ? "w-64" : "w-16"}`}>
        <div className={`relative flex items-center ${sidebarExpanded ? "justify-between" : "justify-center"}`}>
          <Brand compact={!sidebarExpanded} />
          <SidebarToggle
            expanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded((value) => !value)}
            compact={!sidebarExpanded}
          />
        </div>
        <nav className={`mt-6 space-y-1 ${sidebarExpanded ? "" : "flex flex-1 flex-col items-center"}`} aria-label="Primary navigation">
          {areas.map((area) => (
            <AreaNav
              key={area.id}
              area={area}
              active={activeArea === area.id && view !== "index"}
              onClick={() => navigate(area.id)}
              expanded={sidebarExpanded}
              openCount={portal.records.filter((record) => record.area === area.id && !record.archived && !["Approved", "Released", "Archived"].includes(record.status)).length}
            />
          ))}
        </nav>
        <button
          title={sidebarExpanded ? "Portal setup" : "Portal setup"}
          onClick={() => setModal("wizard")}
          className={`mt-auto flex h-10 items-center rounded-lg border border-sidebar-border bg-card text-left text-sm font-semibold transition-colors hover:bg-sidebar-accent ${sidebarExpanded ? "w-full gap-3 px-3" : "w-10 justify-center"}`}
        >
          <Settings2 className="size-4 text-steel" />
          {sidebarExpanded && <><span>Portal setup</span><span className="ml-auto font-mono text-[10px]">{portal.setupStep + 1}/{setupSteps.length}</span></>}
        </button>
        <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((value) => !value)} expanded={sidebarExpanded} />
      </aside>
      <section className={`min-h-screen transition-[padding] duration-200 motion-reduce:transition-none ${sidebarExpanded ? "lg:pl-64" : "lg:pl-16"}`}>
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button
              aria-label="Open menu"
              onClick={() => setMobileMenu(true)}
              className="grid size-10 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <button onClick={() => navigate("home")} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold md:text-base">
                {view === "index" ? "Unified index" : active.name}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {departmentContext
                  ? `${portal.departments.find((item) => item.id === departmentContext)?.name ?? "Department"} · Administrator context`
                  : `All departments · ${portal.setup.location}`}
              </p>
            </button>
            <PersonaSwitcher persona={persona} onSelect={switchPersona} />
            <HeaderAction label="PMSS" icon={ClipboardCheck} onClick={() => setView("pmss")} />
            <HeaderAction
              label="Search"
              icon={Search}
              onClick={() => {
                setView("index");
                setMobileMenu(false);
              }}
            />
            <HeaderAction label="Documents" icon={FileText} onClick={() => setModal("documents")} />
            <HeaderAction label="Hardware Deliverables Drive" icon={FolderOpen} onClick={() => setModal("documents")} />
            <HeaderAction label="Template Settings" icon={Settings2} onClick={() => setTemplateSettingsOpen(true)} />
            <HeaderAction
              label="Administration"
              icon={Settings2}
              onClick={() => setModal("admin")}
            />
            <HeaderAction
              label={`Notifications (${portal.alerts.filter((alert) => !alert.resolved).length})`}
              icon={Bell}
              badge={portal.alerts.filter((alert) => !alert.resolved).length}
              onClick={() => setAlertsOpen(true)}
            />
            <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((value) => !value)} />
          </div>
        </header>
        <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-6 pb-28 lg:pb-10">
          {view === "pmss" ? (
              <PMSSWorkspace
              portal={portal}
              project={selectedProjectProfile}
              projects={activeRecords.filter((record) => record.type === "Project")}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onBack={() => navigate(activeArea)}
              onUpdate={(patch) =>
                update((state) => ({
                  ...state,
                  setup: {
                    ...state.setup,
                    configuration: { ...state.setup.configuration, ...patch },
                  },
                }))
              }
              onLog={log}
            />
          ) : view === "index" ? (
            <IndexWorkspace
              records={activeRecords}
              documents={portal.documents}
              departments={portal.departments}
              departmentContext={departmentContext}
              onBack={() => navigate(activeArea)}
              onSelect={openRecord}
              onSelectDocument={openDocument}
            />
          ) : activeArea === "home" && view === "project" && selected ? (
            <ProjectDetail
              project={selected}
              records={activeRecords}
              documents={portal.documents}
              onBack={() => navigate("home")}
              onSelect={openRecord}
            />
          ) : activeArea === "home" && view === "assignee" && selectedAssignee ? (
            <AssigneeWorkload
              assignee={selectedAssignee}
              records={activeRecords}
              onBack={() => navigate("home")}
              onSelect={openRecord}
            />
          ) : activeArea === "home" ? (
            <CommandCenter
              portal={portal}
              departmentContext={departmentContext}
              onCreate={() => setModal("create")}
              onNavigate={navigate}
              onAdmin={() => setModal("admin")}
              onUpdateTask={updateTask}
              onOpenProject={(id) => {
                const projectRecord = activeRecords.find(
                  (record) => record.id === id || record.reference === id,
                );
                if (projectRecord) {
                  setSelectedId(projectRecord.id);
                  setSelectedProjectId(projectRecord.reference);
                  setView("project");
                }
              }}
              onOpenAssignee={(assignee) => {
                setSelectedAssignee(assignee);
                setView("assignee");
              }}
              onReturnGlobal={() => {
                setDepartmentContext(null);
                setPersona(personas[0] ?? persona);
                log("Administrator context returned", "Returned to global command center");
                navigate("home");
              }}
              onRunRfq={() => {
                setRfqStep(0);
                setRfqOpen(true);
              }}
              onOpenSyncHub={() => setSyncHubOpen(true)}
              onOpenDraftHub={() => setDraftHubOpen(true)}
              onOpenDrive={() => setModal("documents")}
              onOpenAi4t={() => setAi4tOpen(true)}
              persona={persona}
            />
          ) : view === "detail" && selected ? (
            <RecordDetail
              record={selected}
              onBack={() => setView("queue")}
              onSave={(patch) => {
                update((state) => ({
                  ...state,
                  records: state.records.map((record) =>
                    record.id === selected.id ? { ...record, ...patch, updatedAt: now() } : record,
                  ),
                }));
                log("Record updated", `${selected.reference} updated`);
              }}
              onArchive={() => {
                update((state) => ({
                  ...state,
                  records: state.records.map((record) =>
                    record.id === selected.id
                      ? { ...record, archived: true, status: "Archived", updatedAt: now() }
                      : record,
                  ),
                }));
                log("Record archived", `${selected.reference} archived`);
                setView("queue");
              }}
              onOpenPrintable={setPrintTemplate}
            />
          ) : (
            <DepartmentWorkspace
              area={active}
              records={activeRecords.filter(
                (record) =>
                  record.area === activeArea &&
                  (!departmentContext || record.departmentId === departmentContext) &&
                  (!queueStage ||
                    `${record.type} ${record.fields["lifecycleStage"] ?? ""}`
                      .toLowerCase()
                      .includes(queueStage.toLowerCase())),
              )}
              allRecords={activeRecords}
              projectScope={projectScopes[activeArea] ?? "all"}
              onProjectScopeChange={(scope) => setProjectScopes((current) => ({ ...current, [activeArea]: scope }))}
              department={
                portal.departments.find((item) => item.id === departmentContext) ??
                findAreaDepartment(portal.departments, activeArea)
              }
              approvals={portal.approvals}
              contextName={departmentContext ? "Administrator" : "Workspace"}
              view={view === "summary" ? "summary" : "queue"}
              onView={setView}
              onCreate={() => setModal("create")}
              onSelect={(id) => {
                setSelectedId(id);
                setView("detail");
              }}
              onAdmin={() => setModal("admin")}
              onOpenStage={(stage) => {
                setQueueStage(stage);
                setView("queue");
              }}
              onOpenDraftHub={() => setDraftHubOpen(true)}
            onOpenDrive={() => setModal("documents")}
            />
          )}
        </div>
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 px-1 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden">
        {areas.slice(0, 4).map((area) => (
          <button
            key={area.id}
            onClick={() => navigate(area.id)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] ${activeArea === area.id && view !== "index" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
          >
            <area.icon className="size-4" />
            <span>{area.short}</span>
          </button>
        ))}
        <button
          onClick={() => setMobileMenu(true)}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] text-muted-foreground"
        >
          <Menu className="size-4" />
          <span>More</span>
        </button>
      </nav>
      {mobileMenu && <MobileMenu onClose={() => setMobileMenu(false)} onNavigate={navigate} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />} 
      {modal === "create" && (
        <RecordForm
          area={activeArea}
          portal={portal}
          onClose={() => setModal(null)}
          onSave={addRecord}
        />
      )}{" "}
      {modal === "wizard" && (
        <Wizard
          portal={portal}
          onClose={() => setModal(null)}
          onSave={(next) => {
            setPortal(next);
            log("Setup saved", "Portal setup progress saved");
          }}
          onOpenAdministration={() => setModal("admin")}
          onLoadDemo={loadDemo}
          onResetDemo={resetDemo}
        />
      )}{" "}
      {modal === "history" && <HistoryPanel audit={portal.audit} onClose={() => setModal(null)} />}{" "}
      {modal === "approvals" && (
        <ApprovalsPanel approvals={portal.approvals} onClose={() => setModal(null)} />
      )}{" "}
      {modal === "documents" && (
        <DocumentsPanel
          documents={portal.documents}
          departments={portal.departments}
          departmentContext={departmentContext}
          onClose={() => setModal(null)}
          onSelectDocument={openDocument}
          onUploadDocument={(document) => {
            setSelectedDocumentId(document.id);
            setModal("document");
          }}
          onOpenDraftHub={() => setDraftHubOpen(true)}
          templateBodies={portal.templateBodies ?? defaultTemplateBodies()}
          onTemplateBodiesChange={(templateBodies) => update((state) => ({ ...state, templateBodies }))}
        />
      )}{" "}
      {modal === "document" && selectedDocument && (
        <DocumentDetail
          document={selectedDocument}
          departments={portal.departments}
          records={activeRecords}
          departmentContext={departmentContext}
          onClose={() => setModal(null)}
          onDocumentUpdated={(document, event) => {
            update((state) => ({
              ...state,
              documents: state.documents.map((item) => (item.id === document.id ? document : item)),
            }));
            log("Controlled document file activity", event);
          }}
          onSelectRecord={(record) => {
            openRecord(record);
            setModal(null);
          }}
          onOpenPrintable={(document) => setPrintTemplate(document)}
          previewOnly={false}
        />
      )}{" "}
      {modal === "admin" && (
        <AdminCommandCenter
          portal={portal}
          activeDepartmentId={departmentContext}
          onClose={() => setModal(null)}
          onUpdate={update}
          onLog={log}
          onContext={(id) => {
            setDepartmentContext(id);
            setModal(null);
            log(
              id ? "Administrator context changed" : "Administrator context returned",
              id
                ? `Managing ${portal.departments.find((item) => item.id === id)?.name ?? "department"}`
                : "Returned to global command center",
            );
            navigate(
              id ? areaForDepartment(portal.departments.find((item) => item.id === id)) : "home",
            );
          }}
          onLoadDemo={loadDemo}
          onResetDemo={resetDemo}
        />
      )}{" "}
      {alertsOpen && (
        <NotificationCenter
          alerts={portal.alerts}
          departments={portal.departments}
          onClose={() => setAlertsOpen(false)}
          onResolve={(id) => {
            update((state) => ({
              ...state,
              alerts: state.alerts.map((alert) =>
                alert.id === id ? { ...alert, resolved: true } : alert,
              ),
            }));
            log("DEMO alert resolved", id);
          }}
          onDismiss={(id) => {
            update((state) => ({
              ...state,
              alerts: state.alerts.filter((alert) => alert.id !== id),
            }));
            log("DEMO alert dismissed", id);
          }}
          onReview={(departmentId) => {
            const department = portal.departments.find((item) => item.id === departmentId);
            if (department) navigate(areaForDepartment(department));
            setAlertsOpen(false);
          }}
        />
      )}
      {syncHubOpen && <CrossDepartmentSyncHub onClose={() => setSyncHubOpen(false)} />}
      {draftHubOpen && (
        <AutoDraftHub
          onClose={() => setDraftHubOpen(false)}
          settings={portal.templateSettings ?? defaultTemplateSettings()}
          onOpenPrintable={setPrintTemplate}
          documents={portal.documents}
          onOpenDocument={openDocument}
          onOpenSettings={() => setTemplateSettingsOpen(true)}
          templateBodies={portal.templateBodies ?? defaultTemplateBodies()}
          onTemplateBodiesChange={(templateBodies) => update((state) => ({ ...state, templateBodies }))}
        />
      )}
      {templateSettingsOpen && (
        <TemplateSettingsPanel
          settings={portal.templateSettings ?? defaultTemplateSettings()}
          onClose={() => setTemplateSettingsOpen(false)}
          onChange={(settings) => update((state) => ({ ...state, templateSettings: settings }))}
          templateBodies={portal.templateBodies ?? defaultTemplateBodies()}
          onTemplateBodiesChange={(templateBodies) => update((state) => ({ ...state, templateBodies }))}
        />
      )}
      {printTemplate && (
        <PrintableTemplateView
          document={printTemplate}
          settings={portal.templateSettings ?? defaultTemplateSettings()}
          onClose={() => setPrintTemplate(null)}
          onOpenSettings={() => setTemplateSettingsOpen(true)}
        />
      )}
      {ai4tOpen && (
        <Ai4tLifecycleHub
          persona={persona}
          simulation={ai4tSimulation}
          onClose={() => setAi4tOpen(false)}
          onAdvance={() => {
            setAi4tSimulation((state) => {
              const stage = Math.min(state.stage + 1, ai4tStages.length - 1);
              const entry = ai4tStages[stage] ?? ai4tStages[0];
              if (!entry) return state;
              const matrix = portal.raciMatrix ?? defaultRaciMatrix();
              const recipients = Object.entries(matrix[entry[0]] ?? {}).filter(([, role]) => role && role !== "I").map(([department]) => department);
              update((currentPortal) => ({ ...currentPortal, alerts: [...currentPortal.alerts, ...recipients.map((department) => ({ id: createId(), severity: "Warning" as const, title: `${entry[0]} handoff ready`, detail: `${entry[1]} — review the stage handoff and proceed with the assigned controlled work.`, departmentId: currentPortal.departments.find((item) => item.code.replace(/^DEMO-/, "") === department)?.id ?? "sales", resolved: false }))].slice(-100) }));
              log("AI4T lifecycle simulation advanced", `${entry[0]} · ${entry[1]}`);
              return { stage, history: [`${now()} · ${entry[0]} · ${entry[1]}`, ...state.history] };
            });
          }}
          onJump={(stage) => {
            const entry = ai4tStages[stage] ?? ai4tStages[0];
            if (!entry) return;
            setAi4tSimulation((state) => ({ stage, history: [`${now()} · Jumped to ${entry[0]}`, ...state.history] }));
            log("AI4T lifecycle simulation jumped", entry[0]);
          }}
          onRun={() => {
            setAi4tSimulation({ stage: ai4tStages.length - 1, history: [`${now()} · Full DEMO lifecycle run completed`, ...ai4tStages.map(([stage, title]) => `${stage} · ${title}`)] });
            log("AI4T lifecycle simulation completed", "All nine DEMO stages were simulated");
          }}
          onReset={() => {
            setAi4tSimulation({ stage: 0, history: [] });
            log("AI4T lifecycle simulation reset", "Simulation reset to Stage 1");
          }}
          onOpenPrintable={setPrintTemplate}
        />
      )}
      {rfqOpen && (
        <RfqCycleTest
          step={rfqStep}
          onClose={() => setRfqOpen(false)}
          onAdvance={() => {
            const next = Math.min(rfqStages.length - 1, rfqStep + 1);
            const nextStage = rfqStages[next] ?? rfqStages[0];
            setRfqStep(next);
            log("DEMO RFQ feature test advanced", `${nextStage[0]} · ${nextStage[1]}`);
            if (next === rfqStages.length - 1) announce("DEMO RFQ project cycle reached Stage 9.");
          }}
          onReset={() => setRfqStep(0)}
        />
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-20 left-4 right-4 z-[60] rounded-lg border border-border bg-ink px-4 py-3 text-sm text-primary-foreground shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:w-96"
        >
          {notice}
        </div>
      )}
    </main>
  );
}

function CommandCenter({
  portal,
  departmentContext,
  onCreate,
  onNavigate,
  onAdmin,
  onUpdateTask,
  onOpenProject,
  onOpenAssignee,
  onReturnGlobal,
  onRunRfq,
  onOpenSyncHub,
  onOpenDraftHub,
  onOpenAi4t,
  persona,
}: {
  portal: PortalState;
  departmentContext: string | null;
  onCreate: () => void;
  onNavigate: (area: AreaId) => void;
  onAdmin: () => void;
  onUpdateTask: (taskId: string, patch: Partial<RecordItem>, action: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAssignee: (assignee: string) => void;
  onReturnGlobal: () => void;
  onRunRfq: () => void;
  onOpenSyncHub: () => void;
  onOpenDraftHub: () => void;
  onOpenAi4t: () => void;
  persona: Persona;
}) {
  const records = portal.records.filter((record) => !record.archived);
  const visible = departmentContext
    ? records.filter((record) => record.departmentId === departmentContext)
    : records;
  const pending = portal.approvals.filter((item) => item.outcome === "Pending").length;
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = nextWorkingDay(today);
  const taskRecords = visible.filter((record) => record.type === "Task");
  const checklistTasks = taskRecords.filter(
    (record) =>
      (record.fields["dueDate"] === today || record.fields["dueDate"] === tomorrow) &&
      record.status !== "Released",
  );
  return (
    <>
      {portal.demoLoaded && <DemoMarker />}
      {portal.demoLoaded && <LifecycleProgress records={records} projectId="HLPL-SLCT-01" />}
      <PageHeader
        eyebrow={persona.kind === "admin" ? (departmentContext ? "Administrator context" : "Operational workspace") : `${persona.label} · active persona`}
        title="Command Center"
        description={
          departmentContext
            ? "Department-wise quick management and today checklist."
            : "Department-wise quick management, lifecycle tracking, and daily task checklist."
        }
        actions={
          <>
            {departmentContext && <Action onClick={onReturnGlobal} label="Return to global" />}
            <Action onClick={onOpenSyncHub} label="Cross-Department Sync & Order Hub" primary />
            <Action onClick={onOpenAi4t} label="End-to-End Project Lifecycle Hub (HLPL-AI4T-01)" primary />
            <Action onClick={onOpenDraftHub} label="Auto-Draft Templates" />
            <Action onClick={onRunRfq} label="Run RFQ Project Cycle Test" />
            <Action onClick={onCreate} label="Create Task" primary />
          </>
        }
      />
      {persona.kind !== "admin" && (
        <section className="ops-section flex flex-wrap items-center justify-between gap-3 border-steel/35 bg-accent/35 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-steel">Active persona · DEMO context</p>
            <p className="mt-1 text-sm font-semibold">{persona.person}</p>
            <p className="mt-1 text-xs text-muted-foreground">Queues, owned records and human approval visibility are filtered for this persona. No account impersonation occurs.</p>
          </div>
          <Action label="Switch back to Admin" onClick={onReturnGlobal} />
        </section>
      )}
      {portal.demoLoaded && <ExecutiveKpis />}
      <SmartNextStep records={visible} onOpenDraftHub={onOpenDraftHub} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Today"
          value={String(
            taskRecords.filter(
              (record) => record.fields["dueDate"] === today && record.status !== "Released",
            ).length,
          )}
          detail="Checklist tasks"
          tone="steel"
        />
        <Metric
          label="Checklist priority"
          value={String(
            checklistTasks.filter(
              (record) => record.priority === "High" || record.priority === "Critical",
            ).length,
          )}
          detail="High or critical tasks shown"
          tone="danger"
        />
        <Metric
          label="Tomorrow"
          value={String(
            taskRecords.filter(
              (record) => record.fields["dueDate"] === tomorrow && record.status !== "Released",
            ).length,
          )}
          detail="Pending list"
          tone="warning"
        />
        <Metric label="Approvals" value={String(pending)} detail="Human decisions" tone="moss" />
      </section>
      <TodayChecklist
        tasks={taskRecords}
        departments={portal.departments}
        today={today}
        tomorrow={tomorrow}
        onUpdateTask={onUpdateTask}
        onOpenProject={onOpenProject}
        onOpenAssignee={onOpenAssignee}
      />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="ops-section overflow-hidden">
          <div className="ops-section-header">
            <p className="text-sm font-semibold">Department management</p>
            <p className="text-xs text-muted-foreground">
              Open a department to manage its lead, roles, queue and department-owned records.
            </p>
          </div>
          <div>
            {portal.departments
              .filter(
                (department) =>
                  department.active && (!departmentContext || department.id === departmentContext),
              )
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((department) => {
                const departmentRecords = records.filter(
                  (record) => record.departmentId === department.id,
                );
                const open = departmentRecords.filter(
                  (record) => !["Approved", "Released", "Archived"].includes(record.status),
                ).length;
                const complete = departmentRecords.filter(
                  (record) => record.status === "Approved" || record.status === "Released",
                ).length;
                const progress = departmentRecords.length
                  ? Math.round((complete / departmentRecords.length) * 100)
                  : 0;
                const area = areaForDepartment(department);
                return (
                  <button
                    key={department.id}
                    onClick={() => onNavigate(area)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-2 text-left transition-colors hover:bg-secondary/65 last:border-0"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{department.name}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {department.lead || "No lead assigned · administrator fallback"} ·{" "}
                        {
                          portal.roles.filter(
                            (role) => role.departmentId === department.id && role.active,
                          ).length
                        }{" "}
                        roles · {open} open
                      </span>
                    </span>
                    <span className="font-mono text-xs text-steel">{progress}%</span>
                  </button>
                );
              })}
          </div>
        </div>
        <aside className="ops-section bg-panel p-4">
          <p className="text-sm font-semibold">Quick actions</p>
          <div className="mt-3 grid gap-2">
            <Action onClick={onCreate} label="Create task" />
            <Action onClick={() => onNavigate("quality")} label="Review quality queue" />
            <Action onClick={onAdmin} label="Open administration" />
          </div>
          <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            Protected quality releases and financial decisions always require a recorded human
            approval.
          </p>
        </aside>
      </section>
    </>
  );
}

function RfqCycleTest({
  step,
  onClose,
  onAdvance,
  onReset,
}: {
  step: number;
  onClose: () => void;
  onAdvance: () => void;
  onReset: () => void;
}) {
  const [label, title, detail] = rfqStages[step] ?? rfqStages[0];
  const complete = step === rfqStages.length - 1;
  return (
    <Modal title="RFQ-to-production feature test" onClose={onClose} wide>
      <DemoMarker />
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-steel">
        RFQ-2026-TATA-EV-042 · Interactive walkthrough · feature test only
      </p>
      <h3 className="mt-2 text-xl font-semibold">DEMO · Tata Ace EV 4G Telematics Gateway</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Fictional 50,000-units/year scenario. Every commercial, manufacturing and approval event is
        simulated and has no external or operational effect.
      </p>
      <ol className="mt-6 grid gap-2 sm:grid-cols-3">
        {rfqStages.map(([stage, stageTitle], index) => (
          <li
            key={stage}
            className={`border p-3 text-sm ${index === step ? "border-steel bg-accent" : index < step ? "border-moss/40 bg-panel" : "border-border bg-card"}`}
          >
            <span className="font-mono text-[10px] text-steel">{stage}</span>
            <span className="mt-1 block font-medium">{stageTitle}</span>
          </li>
        ))}
      </ol>
      <section className="mt-6 border border-border bg-panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-steel">Current checkpoint</p>
        <h4 className="mt-2 text-lg font-semibold">{label} · {title}</h4>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${((step + 1) / rfqStages.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{step + 1} of {rfqStages.length} gates shown</p>
      </section>
      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <Action label="Restart test" onClick={onReset} />
        <Action label={complete ? "Stage 9 complete" : "Advance simulated gate"} onClick={onAdvance} primary />
      </div>
    </Modal>
  );
}

function Ai4tLifecycleHub({
  persona,
  simulation,
  onClose,
  onAdvance,
  onJump,
  onRun,
  onReset,
  onOpenPrintable,
  documents,
  onOpenDocument,
}: {
  persona: Persona;
  simulation: Ai4tSimulation;
  onClose: () => void;
  onAdvance: () => void;
  onJump: (stage: number) => void;
  onRun: () => void;
  onReset: () => void;
  onOpenPrintable: (document: PrintableDocument) => void;
  documents: ControlledDocument[];
  onOpenDocument: (document: ControlledDocument) => void;
}) {
  const [dossier, setDossier] = useState<(typeof ai4tDossier)[number] | null>(null);
  const [tab, setTab] = useState<"stages" | "binder">("stages");
  const current = ai4tStages[simulation.stage] ?? ai4tStages[0];
  const progress = Math.round(((simulation.stage + 1) / ai4tStages.length) * 100);
  const accessibleDossier = persona.kind === "client"
    ? ai4tDossier.filter(([, , owner]) => owner === "SAL" || owner === "TST" || owner === "FIN")
    : persona.kind === "lead" && persona.departmentId
      ? ai4tDossier.filter(([, , owner]) => owner === areaById(persona.departmentId ?? "home").short)
      : ai4tDossier;
  return (
    <Modal title="HLPL-AI4T-01 · End-to-End Lifecycle" onClose={onClose} wide>
      <DemoMarker />
      <section className="ops-section overflow-hidden">
        <div className="ops-section-header flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-steel">Interactive lifecycle & requirement engine · DEMO only</p>
            <h3 className="mt-1 text-base font-semibold">HLPL-AI4T-01 · Tata Ace EV 4G Telematics Gateway</h3>
            <p className="mt-1 text-xs text-muted-foreground">50,000 units · ₹20.33 Cr · illustrative scenario; not a customer order, approval, certification, or production instruction.</p>
          </div>
          <Status status={simulation.stage === ai4tStages.length - 1 ? "Released" : "In review"} />
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">Overall simulated progress</p><p className="mt-1 text-2xl font-semibold">{progress}%</p></div><p className="max-w-md text-right text-sm font-medium">{current[0]} · {current[1]}</p></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{current[2]}</p>
        </div>
      </section>
      <div className="mt-5 flex gap-2 border-b border-border pb-2">
        <button onClick={() => setTab("stages")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "stages" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Lifecycle stages</button>
        <button onClick={() => setTab("binder")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "binder" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Master dossier binder</button>
      </div>
      {tab === "stages" && <><section className="mt-5 grid gap-2 sm:grid-cols-3">
        {ai4tStages.map(([stage, title], index) => (
          <button key={stage} onClick={() => onJump(index)} className={`rounded-lg border p-3 text-left transition-colors ${index === simulation.stage ? "border-steel bg-accent" : index < simulation.stage ? "border-moss/40 bg-panel hover:bg-secondary" : "border-border bg-card hover:bg-secondary"}`}>
            <span className="font-mono text-[10px] text-steel">{stage}</span><strong className="mt-1 block text-xs">{title}</strong><span className="mt-1 block text-[10px] text-muted-foreground">{index < simulation.stage ? "Complete" : index === simulation.stage ? "In progress" : "Upcoming"}</span>
          </button>
        ))}
      </section>
      <LifecycleDeliverables documents={documents} stage={current[0]} onOpenDocument={onOpenDocument} />
      <section className="ops-section mt-5 overflow-hidden">
        <div className="ops-section-header flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Master dossier · {accessibleDossier.length} documents visible</p><p className="text-xs text-muted-foreground">Role-filtered binder view. Preview content is a formatted DEMO draft.</p></div><BriefcaseBusiness className="size-4 text-steel" /></div>
        <div className="divide-y divide-border">
          {accessibleDossier.map((document) => <button key={document[1]} onClick={() => setDossier(document)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary"><span className="min-w-0"><strong className="block text-sm">{document[0]}</strong><small className="font-mono text-[10px] text-muted-foreground">{document[1]} · {document[2]} · {document[3]}</small></span><ChevronRight className="size-4 self-center text-steel" /></button>)}
        </div>
      </section></>}
      {tab === "binder" && <section className="ops-section mt-5 overflow-hidden">
        <div className="ops-section-header flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Master dossier · {accessibleDossier.length} documents visible</p><p className="text-xs text-muted-foreground">Unified role-filtered binder. Each preview is an unissued DEMO document.</p></div><BriefcaseBusiness className="size-4 text-steel" /></div>
        <div className="divide-y divide-border">{accessibleDossier.map((document) => <button key={document[1]} onClick={() => setDossier(document)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary"><span className="min-w-0"><strong className="block text-sm">{document[0]}</strong><small className="font-mono text-[10px] text-muted-foreground">{document[1]} · {document[2]} · {document[3]}</small></span><ChevronRight className="size-4 self-center text-steel" /></button>)}</div>
      </section>}
      {dossier && <section className="mt-5 rounded-lg border border-steel/35 bg-panel p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-steel">Formatted DEMO document preview</p><h4 className="mt-1 text-sm font-semibold">{dossier[0]}</h4></div><Status status="Draft" /></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><DocumentField label="Document ID" value={dossier[1]} /><DocumentField label="Project" value="HLPL-AI4T-01 · DEMO" /><DocumentField label="Stage" value={dossier[3]} /><DocumentField label="Owner" value={`${dossier[2]} · department-owned`} /><DocumentField label="Revision" value="00 · DEMO draft" /><DocumentField label="Approval" value="Human approval required" /></div><div className="mt-4"><Action label="Open complete document" primary onClick={() => onOpenPrintable({ title: dossier[0].toUpperCase(), documentId: dossier[1], department: dossier[2], revision: "Rev 01", status: "Draft", project: "HLPL-AI4T-01", stage: dossier[3] })} /></div></section>}
      <section className="mt-5 rounded-lg border border-border bg-panel p-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Simulation history</p>{simulation.history.length ? <ol className="mt-2 space-y-1 text-xs text-muted-foreground">{simulation.history.slice(0, 8).map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ol> : <p className="mt-2 text-xs text-muted-foreground">No simulated stage changes yet.</p>}</section>
      <div className="mt-5 flex flex-wrap justify-between gap-2"><div className="flex flex-wrap gap-2"><Action label="Reset Simulation" onClick={onReset} /><Action label="Auto-Run Full Cycle Test" onClick={onRun} /></div><Action label={simulation.stage === ai4tStages.length - 1 ? "Lifecycle Complete" : "Advance to Next Stage"} primary onClick={onAdvance} /></div>
    </Modal>
  );
}

function SmartNextStep({
  records,
  onOpenDraftHub,
}: {
  records: RecordItem[];
  onOpenDraftHub: () => void;
}) {
  const review = records.find(
    (record) => record.reference === "HLPL/F/MKT/01" && record.status === "Approved",
  );
  const openCritical = records.find(
    (record) => record.priority === "Critical" && !["Approved", "Released", "Archived"].includes(record.status),
  );
  const suggestion = openCritical
    ? {
        status: `Critical activity open · ${openCritical.reference}`,
        next: `Resolve ${openCritical.title}`,
        detail: "Completing this task unlocks the following controlled lifecycle handoff.",
      }
    : review
      ? {
          status: "Feasibility approved · Contract Review HLPL/F/MKT/01",
          next: "Auto-compile PRS-01 & issue quotation",
          detail: "The approved feasibility record unblocks the frozen requirement baseline and commercial quotation.",
        }
      : {
          status: "Lifecycle evidence is being assessed",
          next: "Review the next open controlled record",
          detail: "The recommendation refreshes whenever lifecycle tasks or stage records are completed.",
        };
  return (
    <section className="surface-card mt-6 overflow-hidden border border-steel/35 bg-panel">
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-steel">
            <Sparkles className="size-3" /> Smart next-step suggestion
          </p>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
            <span className="text-muted-foreground">{suggestion.status}</span>
            <ChevronRight className="hidden size-4 text-steel md:block" />
            <strong className="text-foreground">Recommended next move: {suggestion.next}</strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{suggestion.detail}</p>
        </div>
        <Action label="Execute next step" primary onClick={onOpenDraftHub} />
      </div>
    </section>
  );
}

const autoDraftTemplates = [
  ["Customer SOR", "HLPL-SLCT-SAL-SOR-01", "SAL"],
  ["Mutual NDA", "HLPL-SLCT-SAL-mNDA-01", "SAL"],
  ["Commercial Quotation", "HLPL-SLCT-SAL-QUO-01", "SAL"],
  ["Contract Review Record", "HLPL/F/MKT/01", "SAL"],
  ["Product Requirement Spec", "HLPL-SLCT-EHW-PRS-01", "EHW"],
  ["Production BOM Cost Tracker", "HLPL-SLCT-EHW-BOM-01", "EHW"],
  ["Hardware DFMEA", "HLPL-SLCT-EHW-DFMEA-01", "EHW"],
  ["Manufacturing Process Flow & Control Plan", "HLPL-SLCT-EMF-CP-01", "EMF"],
  ["DVP&R Verification Plan", "HLPL-SLCT-QA-DVP-01", "QA"],
  ["Pre-Dispatch Inspection Certificate", "HLPL-SLCT-TST-PDI-01", "TST"],
  ["Commercial Tax Invoice", "HLPL-SLCT-FIN-INV-01", "FIN"],
  ["Annual Skill Matrix", "HLPL/F/HR/03", "HR/OPS"],
] as const;

function AutoDraftHub({
  onClose,
  settings = defaultTemplateSettings(),
  onOpenPrintable,
  onOpenSettings,
  templateBodies,
  onTemplateBodiesChange,
}: {
  onClose: () => void;
  settings?: TemplateSettings;
  onOpenPrintable?: (document: PrintableDocument) => void;
  onOpenSettings?: () => void;
  templateBodies: Record<string, string>;
  onTemplateBodiesChange: (templates: Record<string, string>) => void;
}) {
  const [selected, setSelected] = useState<(typeof autoDraftTemplates)[number] | null>(null);
  const [project, setProject] = useState("HLPL-AI4T-01");
  const profile = projectDocumentProfiles[project] ?? projectDocumentProfiles["HLPL-AI4T-01"] ?? { name: "Project baseline", customer: "Customer details pending", contact: "Contact pending", quantity: "Quantity pending", techSpec: "Technical baseline pending", commercialValue: "Commercial value pending", environmental: "Environmental baseline pending", compliance: "Compliance baseline pending" };
  return (
    <Modal title="Auto-Draft Document Templates" onClose={onClose} wide>
      <div className="rounded-lg border border-warning/35 bg-accent p-4 text-sm">
        <strong>DEMO DRAFTING WORKSPACE</strong>
        <p className="mt-1 text-muted-foreground">Pre-filled SLCT templates are illustrative drafts only. They are not signed, approved, issued, or externally shared.</p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {autoDraftTemplates.map((template) => (
          <button key={template[1]} onClick={() => setSelected(template)} className="flex items-center gap-3 border border-border bg-card px-3 py-3 text-left transition-colors hover:border-steel/50 hover:bg-secondary">
            <FileText className="size-4 shrink-0 text-steel" />
            <span className="min-w-0 flex-1"><strong className="block text-sm">{template[0]}</strong><small className="font-mono text-[10px] text-muted-foreground">{template[1]} · {template[2]}</small></span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <div className="mt-5 max-w-md"><SelectField label="Project document baseline" value={project} onChange={setProject} options={Object.keys(projectDocumentProfiles)} /></div>
      {selected && (
        <section className="mt-5 border border-steel/35 bg-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-steel">Document control header · auto-drafted</p><h3 className="mt-1 text-lg font-semibold">{selected[0]}</h3></div>
            <Status status="Draft" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
             <DocumentField label="Document ID" value={createPrintableDocument(selected, settings, project).documentId} /><DocumentField label="Project" value={`${project} · DEMO`} /><DocumentField label="Revision" value="00 · next draft revision" />
            <DocumentField label="Classification" value="Internal · controlled draft" /><DocumentField label="Owner" value={`${selected[2]} · DEMO owner`} /><DocumentField label="Approval" value="Human approval required" />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{profile.customer} · {profile.quantity} · {profile.techSpec} · {profile.commercialValue}. Validate all technical and commercial information before any controlled release.</p>
          <label className="mt-4 block font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">Editable template content<textarea value={templateBodies[selected[0]] ?? templateBlueprint(selected[0])} onChange={(event) => onTemplateBodiesChange({ ...templateBodies, [selected[0]]: event.target.value })} className="mt-2 min-h-28 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal normal-case text-foreground" /></label>
          <div className="mt-5 flex flex-wrap gap-2"><Action label="Save draft" primary onClick={() => onTemplateBodiesChange({ ...templateBodies })} /><Action label="Full Document Viewer & Print" onClick={() => { if (onOpenPrintable) onOpenPrintable(createPrintableDocument(selected, settings, project)); }} />{onOpenSettings && <Action label="Customize header & footer" onClick={onOpenSettings} />}</div>
        </section>
      )}
    </Modal>
  );
}
function nextWorkingDay(value: string) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
function TodayChecklist({
  tasks,
  departments,
  today,
  tomorrow,
  onUpdateTask,
  onOpenProject,
  onOpenAssignee,
}: {
  tasks: RecordItem[];
  departments: Department[];
  today: string;
  tomorrow: string;
  onUpdateTask: (taskId: string, patch: Partial<RecordItem>, action: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAssignee: (assignee: string) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const todayTasks = tasks.filter(
    (task) => task.fields["dueDate"] === today && task.status !== "Released",
  );
  const pendingTasks = tasks.filter(
    (task) => task.fields["dueDate"] === tomorrow && task.status !== "Released",
  );
  const move = (task: RecordItem, dueDate: string, action: string) =>
    onUpdateTask(task.id, { fields: { ...task.fields, dueDate } }, action);
  return (
    <section className="ops-section overflow-hidden">
      <div className="ops-section-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div><p className="text-sm font-semibold">Task checklist</p><p className="text-xs text-muted-foreground">Compact operational rows · up to 23 visible per lane</p></div>
        <div className="flex shrink-0 gap-2"><Action label={expandAll ? "Collapse all" : "Expand all"} onClick={() => setExpandAll((value) => !value)} /><Action label="Open expanded modal" onClick={() => setInspectionOpen(true)} /></div>
      </div>
    <div className="grid gap-6 p-4 lg:grid-cols-2">
      <ChecklistLane
        title="Today"
        description="Short department-wise checklist"
        tasks={todayTasks}
        departments={departments}
        onDrop={() => {
          const task = tasks.find((item) => item.id === draggedId);
          if (task) move(task, tomorrow, "Task moved to pending / tomorrow");
          setDraggedId(null);
        }}
        onDragStart={setDraggedId}
        onDone={(task) => onUpdateTask(task.id, { status: "Released" }, "Task marked done")}
        onMove={(task) => move(task, tomorrow, "Task moved to pending / tomorrow")}
        onOpenProject={onOpenProject}
        onOpenAssignee={onOpenAssignee}
        expandAll={expandAll}
      />
      <ChecklistLane
        title="Pending / Tomorrow"
        description="Tomorrow’s tasks; drag back to today to reprioritize"
        tasks={pendingTasks}
        departments={departments}
        onDrop={() => {
          const task = tasks.find((item) => item.id === draggedId);
          if (task) move(task, today, "Task reprioritized to today");
          setDraggedId(null);
        }}
        onDragStart={setDraggedId}
        onDone={(task) => onUpdateTask(task.id, { status: "Released" }, "Task marked done")}
        onMove={(task) => move(task, today, "Task reprioritized to today")}
        onOpenProject={onOpenProject}
        onOpenAssignee={onOpenAssignee}
        expandAll={expandAll}
      />
    </div>
    {inspectionOpen && <TaskInspectionModal tasks={[...todayTasks, ...pendingTasks]} departments={departments} onClose={() => setInspectionOpen(false)} onDone={(task) => onUpdateTask(task.id, { status: "Released" }, "Task marked done from inspection")} />}
    </section>
  );
}
function ChecklistLane({
  title,
  description,
  tasks,
  departments,
  onDrop,
  onDragStart,
  onDone,
  onMove,
  onOpenProject,
  onOpenAssignee,
  expandAll,
}: {
  title: string;
  description: string;
  tasks: RecordItem[];
  departments: Department[];
  onDrop: () => void;
  onDragStart: (id: string) => void;
  onDone: (task: RecordItem) => void;
  onMove: (task: RecordItem) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAssignee: (assignee: string) => void;
  expandAll: boolean;
}) {
  return (
    <section
      aria-label={`${title} checklist`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="surface-card ops-section overflow-hidden"
    >
      <div className="ops-section-header bg-panel">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div>
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              department={departments.find((department) => department.id === task.departmentId)}
              onDragStart={onDragStart}
              onDone={onDone}
              onMove={onMove}
              onOpenProject={onOpenProject}
              onOpenAssignee={onOpenAssignee}
              expanded={expandAll}
            />
          ))
        ) : (
          <p className="p-5 text-sm text-muted-foreground">No tasks in this list.</p>
        )}
      </div>
    </section>
  );
}
function TaskCard({
  task,
  department,
  onDragStart,
  onDone,
  onMove,
  onOpenProject,
  onOpenAssignee,
  expanded,
}: {
  task: RecordItem;
  department: Department | undefined;
  onDragStart: (id: string) => void;
  onDone: (task: RecordItem) => void;
  onMove: (task: RecordItem) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAssignee: (assignee: string) => void;
  expanded: boolean;
}) {
  const [open, setOpen] = useState(expanded);
  useEffect(() => setOpen(expanded), [expanded]);
  const projectId = task.fields["projectId"];
  const projectLabel = task.fields["project"] ?? "No linked project";
  const assignee = task.fields["assignee"] ?? "Unassigned";
  return (
    <article
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="border-b border-border last:border-0"
    >
      <div className="grid cursor-pointer grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-secondary/70" onClick={() => setOpen((value) => !value)}>
        <span className="rounded border border-steel/35 bg-steel/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-steel">{department?.code.replace("DEMO-", "") ?? "—"}</span>
        <span className={`size-2 rounded-full ${task.priority === "Critical" ? "bg-danger" : task.priority === "High" ? "bg-warning" : "bg-steel"}`} />
        <p className="truncate text-sm font-medium">{task.title}</p>
        <span className="grid size-6 place-items-center rounded-full border border-border bg-panel font-mono text-[9px] text-muted-foreground" title={assignee}>{assignee.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
        <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">{task.fields["dueDate"] || "Unscheduled"}</span>
        <div className="flex items-center gap-1"><button aria-label={`Mark ${task.title} done`} onClick={(event) => { event.stopPropagation(); onDone(task); }} className="grid size-7 place-items-center rounded border border-moss/35 text-moss hover:bg-accent"><Check className="size-3.5" /></button><ChevronRight className={`size-4 text-muted-foreground transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`} /></div>
      </div>
      {open && <div className="task-disclosure grid px-4 pb-4"><div className="min-h-0 overflow-hidden border-l-2 border-steel/35 pl-3">
      <p className="text-sm leading-6 text-muted-foreground">{task.notes || "No further task description recorded."}</p>
      <p className="mt-2 text-xs font-medium text-steel">Next action: Completing this task enables the next unblocked lifecycle handoff.</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs">
        <button
          disabled={!projectId}
          onClick={() => projectId && onOpenProject(projectId)}
          className="text-left font-semibold text-steel transition-colors hover:text-primary disabled:text-muted-foreground"
        >
          Project: {projectLabel}
        </button>
        <button
          disabled={assignee === "Unassigned"}
          onClick={() => assignee !== "Unassigned" && onOpenAssignee(assignee)}
          className="text-left font-semibold text-steel transition-colors hover:text-primary disabled:text-muted-foreground"
        >
          Assignee: {assignee}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Action onClick={() => onDone(task)} label="Mark done" />
        <Action
          onClick={() => onMove(task)}
          label={
            task.fields["dueDate"] === new Date().toISOString().slice(0, 10)
              ? "Move to Pending / Tomorrow"
              : "Move to Today"
          }
        />
      </div></div></div>}
    </article>
  );
}

function TaskInspectionModal({ tasks, departments, onClose, onDone }: { tasks: RecordItem[]; departments: Department[]; onClose: () => void; onDone: (task: RecordItem) => void }) {
  return <Modal title="Expanded task inspection" onClose={onClose} wide><div className="space-y-3">{tasks.map((task) => <article key={task.id} className="border border-border bg-panel p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] text-steel">{departments.find((item) => item.id === task.departmentId)?.code ?? "—"} · {task.reference}</p><h3 className="mt-1 font-semibold">{task.title}</h3></div><Status status={task.status} /></div><p className="mt-2 text-sm text-muted-foreground">{task.notes || "No further description recorded."}</p><p className="mt-3 text-xs font-medium text-steel">Next action: Completion unblocks the next controlled lifecycle handoff.</p><div className="mt-4"><Action label="Mark done" onClick={() => onDone(task)} /></div></article>)}</div></Modal>;
}
function ProjectDetail({
  project,
  records,
  documents,
  onBack,
  onSelect,
}: {
  project: RecordItem;
  records: RecordItem[];
  documents: PortalState["documents"];
  onBack: () => void;
  onSelect: (record: RecordItem) => void;
}) {
  const related = records.filter(
    (record) =>
      record.id === project.id ||
      (record.fields["linkedRecords"] ?? "").includes(project.reference) ||
      record.fields["projectId"] === project.id,
  );
  const files = documents.filter(
    (document) =>
      document.departmentId === project.departmentId ||
      document.linkedRecordRefs?.includes(project.reference),
  );
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel"
      >
        <ArrowLeft className="size-4" />
        Back to command center
      </button>
      <PageHeader
        eyebrow="Project detail"
        title={project.title}
        description="Related files, BOM, tasks and milestones for the selected project."
        actions={null}
      />
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <p className="font-semibold">Related records</p>
          <div className="mt-3 space-y-2">
            {related.map((record) => (
              <button
                key={record.id}
                onClick={() => onSelect(record)}
                className="block w-full border-b border-border py-3 text-left last:border-0"
              >
                <span className="font-mono text-xs text-muted-foreground">{record.reference}</span>
                <strong className="mt-1 block">{record.title}</strong>
                <small className="text-muted-foreground">
                  {record.type} · {record.fields["lifecycleStage"] ?? record.status}
                </small>
              </button>
            ))}
          </div>
        </div>
        <div className="border border-border bg-panel p-5">
          <p className="font-semibold">Files & controlled documents</p>
          <div className="mt-3 space-y-3">
            {files.length ? (
              files.map((document) => (
                <a
                  key={document.id}
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-b border-border pb-3 text-sm font-medium text-steel"
                >
                  {document.title}
                  <span className="mt-1 block text-xs text-muted-foreground">{document.type}</span>
                </a>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No controlled documents are linked yet.
              </p>
            )}
          </div>
          <p className="mt-6 font-semibold">Milestones</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.fields["projectStage"] ??
              project.fields["lifecycleStage"] ??
              "No milestones set."}
          </p>
        </div>
      </section>
    </>
  );
}
function AssigneeWorkload({
  assignee,
  records,
  onBack,
  onSelect,
}: {
  assignee: string;
  records: RecordItem[];
  onBack: () => void;
  onSelect: (record: RecordItem) => void;
}) {
  const work = records.filter(
    (record) => record.fields["assignee"] === assignee || record.fields["owner"] === assignee,
  );
  const overdue = work.filter(
    (record) =>
      (record.fields["dueDate"] ?? "") < new Date().toISOString().slice(0, 10) &&
      record.status !== "Released",
  );
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel"
      >
        <ArrowLeft className="size-4" />
        Back to command center
      </button>
      <PageHeader
        eyebrow="Person workload"
        title={assignee}
        description="Assigned and related work, blockers, status summary and project links."
        actions={null}
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Assigned"
          value={String(work.length)}
          detail="Tasks and related records"
          tone="steel"
        />
        <Metric
          label="Overdue"
          value={String(overdue.length)}
          detail="Needs attention"
          tone="danger"
        />
        <Metric
          label="Open"
          value={String(
            work.filter((record) => !["Released", "Approved", "Archived"].includes(record.status))
              .length,
          )}
          detail="Status summary"
          tone="warning"
        />
      </section>
      <section className="mt-6 border border-border bg-card">
        {work.length ? (
          work.map((record) => (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              className="grid w-full gap-2 border-b border-border p-4 text-left last:border-0"
            >
              <strong>{record.title}</strong>
              <span className="text-xs text-muted-foreground">
                {record.fields["project"] ?? "No project"} ·{" "}
                {record.fields["blocker"] || "No blocker"}
              </span>
            </button>
          ))
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No related work assigned.</p>
        )}
      </section>
    </>
  );
}

function LifecycleProgress({ records, projectId }: { records: RecordItem[]; projectId: string }) {
  const lifecycleRecords = records.filter(
    (record) => record.fields["lifecycleId"] === projectId,
  );
  const stages = [
    ["1", "Sales & NDA", ["Customer requirement", "Enquiry"]],
    ["2", "Feasibility", ["Contract review", "Requirements and design"]],
    ["3", "Requirement freeze", ["Requirements approved"]],
    ["4", "PoC", ["Prototype verified"]],
    ["5", "Pilot build", ["BOM review", "Assembly and traceability"]],
    ["6", "Client validation", ["Testing", "Quality inspection"]],
    ["7", "Design release", ["Engineering change"]],
    ["8", "Type approval & SCM", ["Sourcing", "Material received"]],
    [
      "9",
      "Mass production & EOL",
      ["Kitted for production", "Human quality release pending", "Client update"],
    ],
  ] as const;
  return (
    <section className="surface-card ops-section overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border p-4">
        <div>
          <p className="font-mono text-[10px] uppercase text-moss">Nine-stage lifecycle</p>
          <h2 className="mt-1 font-semibold">{projectId} · controlled lifecycle</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Illustrative only · NOT VALIDATED · human gate sign-offs remain required
          </p>
        </div>
        <span className="font-mono text-sm text-steel">
          {lifecycleRecords.length} linked records
        </span>
      </div>
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-9">
        {stages.map(([number, label, terms]) => {
          const stageRecords = lifecycleRecords.filter((record) =>
            terms.some(
              (term) =>
                record.fields["lifecycleStage"]?.includes(term) || record.type.includes(term),
            ),
          );
          const complete = stageRecords.filter((record) =>
            ["Approved", "Released"].includes(record.status),
          ).length;
          const percent = stageRecords.length
            ? Math.round((complete / stageRecords.length) * 100)
            : 0;
          return (
            <div key={number} className="min-h-32 bg-card p-3">
              <p className="font-mono text-[10px] text-steel">STAGE {number}</p>
              <p className="mt-2 text-xs font-semibold leading-5">{label}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full bg-moss motion-safe:transition-[width] motion-safe:duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {complete}/{stageRecords.length} checks
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ExecutiveKpis() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Metric label="Active project" value="SLCT-01" detail="AIS-140 tracker · DEMO" tone="steel" />
      <Metric label="Order volume" value="50,000" detail="Illustrative units" tone="moss" />
      <Metric label="Revenue" value="₹20.33 Cr" detail="Illustrative order value" tone="steel" />
      <Metric label="Stage" value="8" detail="Type Approval & SCM" tone="warning" />
      <Metric label="Audit score" value="100%" detail="DEMO readiness assertion" tone="moss" />
      <Metric label="System sync" value="11/11" detail="Department handoffs" tone="steel" />
    </section>
  );
}

function CrossDepartmentSyncHub({ onClose }: { onClose: () => void }) {
  const flows = [
    ["SAL", "Order locked & customer LOI confirmed", "PO-TATA-SLCT-2026-9041 · 50,000 units"],
    ["FIN", "Advance deposit verified & invoice generated", "₹6.10 Cr illustrative advance · HLPL-SLCT-FIN-INV-01"],
    ["PUR", "Long-lead IC purchase plan synchronized", "STM32 · Quectel 4G · u-blox GNSS · DEMO ASL"],
    ["R&D", "Design release package synchronized", "Final Gerber · production BOM · mold tooling"],
    ["EMF", "Tranche 1 production scheduled", "SMT Line 2 · 2,500 illustrative units"],
    ["TST", "EOL capacity preloaded", "SLCT-2026-00001..50000 · 97.4% simulated FPY"],
    ["QA", "APQP and compliance evidence ready", "Phases 1–4 closed · DEMO TAC reference only"],
  ];
  return (
    <Modal title="Cross-Department Sync & Order Hub" onClose={onClose} wide>
      <div className="rounded-lg border border-warning/40 bg-accent p-4 text-sm">
        <strong>DEMO DATA ONLY</strong>
        <p className="mt-1 text-muted-foreground">Illustrative order, financial, supplier, production and audit signals. Nothing represents an actual customer order, payment, purchase, release, or certification.</p>
      </div>
      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <DocumentField label="Customer PO" value="PO-TATA-SLCT-2026-9041" />
        <DocumentField label="Order volume" value="50,000 units · illustrative" />
        <DocumentField label="Total value" value="₹20.33 Cr · illustrative" />
        <DocumentField label="Advance" value="₹6.10 Cr · verification simulation" />
        <DocumentField label="Project" value="HLPL-SLCT-01" />
        <DocumentField label="Audit readiness" value="100% IATF 16949 & AIS-140 compliant · 0 NCRs · DEMO assertion" />
      </section>
      <section className="mt-5 divide-y divide-border border border-border bg-panel">
        {flows.map(([code, title, detail]) => (
          <div key={code} className="grid gap-2 p-4 sm:grid-cols-[4rem_1fr]">
            <span className="font-mono text-xs font-semibold text-steel">{code}</span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </section>
      <p className="mt-5 text-xs text-muted-foreground">All department outputs are represented as department-owned, access-checked records in the logical 00_Automotive_Hardware_Audit_Repository audit vault.</p>
    </Modal>
  );
}

function DepartmentWorkspace({
  area,
  records,
  allRecords,
  projectScope,
  onProjectScopeChange,
  department,
  approvals,
  contextName,
  view,
  onView,
  onCreate,
  onSelect,
  onAdmin,
  onOpenStage,
  onOpenDraftHub,
  onOpenDrive,
}: {
  area: (typeof areas)[number];
  records: RecordItem[];
  allRecords: RecordItem[];
  projectScope: ProjectScope;
  onProjectScopeChange: (scope: ProjectScope) => void;
  department: Department | undefined;
  approvals: PortalState["approvals"];
  contextName: string;
  view: "queue" | "summary";
  onView: (view: "queue" | "summary") => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onAdmin: () => void;
  onOpenStage: (stage: string) => void;
  onOpenDraftHub: () => void;
  onOpenDrive: () => void;
}) {
  const scopedRecords = projectScope === "all" ? records : records.filter((record) => record.reference === projectScope || record.fields["projectCode"] === projectScope || record.fields["projectId"] === projectScope || record.fields["project"]?.includes(projectScope));
  const departmentMembers = demoTeam.filter((member) => member.area === area.id).length;
  const today = new Date().toISOString().slice(0, 10);
  const open = scopedRecords.filter((record) => record.status === "Draft" || record.status === "Open");
  const blocked = scopedRecords.filter((record) => record.fields["blocker"]);
  const pendingApprovals = approvals.filter(
    (approval) =>
      approval.outcome === "Pending" && scopedRecords.some((record) => record.id === approval.recordId),
  );
  const upcoming = scopedRecords
    .filter((record) => (record.fields["targetDate"] ?? "") >= today)
    .sort((a, b) => (a.fields["targetDate"] ?? "").localeCompare(b.fields["targetDate"] ?? ""))
    .slice(0, 3);
  const flow = departmentFlow(area.id, scopedRecords);
  return (
    <>
      {records.some((record) => record.fields["demoMarker"]) && <DemoMarker />}
      <PageHeader
        eyebrow={`${area.short} · ${contextName}${department ? ` · ${department.name}` : " · no department configured"}`}
        title={area.name}
        description={area.summary}
        actions={
          <>
            <Action
              onClick={() => onView(view === "queue" ? "summary" : "queue")}
              label={view === "queue" ? "Summary" : "Queue"}
            />
            <Action onClick={onOpenDrive} label="Department Cloud Drive" />
            <Action onClick={onCreate} label={`Create ${area.recordType}`} primary />
          </>
        }
      />
      <section className="ops-section flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-steel">Project scope</p><p className="mt-1 text-xs text-muted-foreground">{projectScope === "all" ? `Department rollup · ${records.length} records · ${departmentMembers} team member${departmentMembers === 1 ? "" : "s"}` : "Selected-project tasks, stage evidence, team and deliverables only"}</p></div>
        <select aria-label="Project scope" value={projectScope} onChange={(event) => onProjectScopeChange(event.target.value as ProjectScope)} className="h-9 min-w-64 rounded-lg border border-border bg-card px-3 text-sm font-medium">
          <option value="all">All Projects (Department Rollup)</option><option value="HLPL-AI4T-01">HLPL-AI4T-01 · Tata Ace EV</option><option value="HLPL-SLCT-01">HLPL-SLCT-01 · AIS-140 Gateway</option><option value="HLPL-XLINK-03">HLPL-XLINK-03 · CV Gateway</option>
        </select>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Today"
          value={String(
            scopedRecords.filter(
              (record) =>
                record.fields["dueDate"] === today || record.fields["targetDate"] === today,
            ).length,
          )}
          detail="Due today"
          tone="steel"
        />
        <Metric
          label="Priority"
          value={String(
            scopedRecords.filter((record) => record.priority === "High" || record.priority === "Critical")
              .length,
          )}
          detail="Needs attention"
          tone="danger"
        />
        <Metric label="Pending" value={String(open.length)} detail="Draft or open" tone="warning" />
        <Metric
          label="Approvals"
          value={String(pendingApprovals.length)}
          detail={pendingApprovals.length ? "Human decisions" : "No department approvals"}
          tone="moss"
        />
        <Metric
          label="Progress"
          value={`${scopedRecords.length ? Math.round((scopedRecords.filter((record) => ["Approved", "Released"].includes(record.status)).length / scopedRecords.length) * 100) : 0}%`}
          detail="Completed"
          tone="steel"
        />
      </section>
      <DepartmentFlow flow={flow} onOpenStage={onOpenStage} />
      <DepartmentProcessMenu area={area.id} onOpenDrive={onOpenDrive} onCreate={onCreate} />
      <SmartNextStep records={scopedRecords} onOpenDraftHub={onOpenDraftHub} />
      {area.id === "hrops" && (
        <TeamCompetencyPanel members={demoTeam.filter((member) => member.area === "hrops")} />
      )}
      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="ops-section overflow-hidden">
          {view === "summary" ? (
            <AreaSummary records={scopedRecords} />
          ) : scopedRecords.length ? (
            <div>
              {scopedRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => onSelect(record.id)}
                  className="grid w-full gap-3 border-b border-border px-4 py-2.5 text-left transition-colors hover:bg-accent/45 last:border-0 md:grid-cols-[8rem_minmax(0,1fr)_7rem_6rem]"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {record.reference}
                  </span>
                  <span>
                    <strong className="block">{record.title}</strong>
                    <small className="mt-1 block text-muted-foreground">
                      {record.type} · {record.updatedAt}
                    </small>
                  </span>
                  <Status status={record.status} />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    {record.priority}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <Empty onCreate={onCreate} label={`Create ${area.recordType}`} />
          )}
        </div>
        <aside className="ops-section bg-panel p-4">
          <p className="text-sm font-semibold">Lead view</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                Overdue / blockers
              </dt>
              <dd className="mt-1">
                {blocked.length} blocked record{blocked.length === 1 ? "" : "s"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                Upcoming milestones
              </dt>
              <dd className="mt-1">
                {upcoming.length
                  ? upcoming.map((record) => <p key={record.id}>{record.title}</p>)
                  : "No upcoming milestones."}
              </dd>
            </div>
          </dl>
          <div className="mt-5">
            <Action onClick={onAdmin} label="Department settings" />
          </div>
        </aside>
      </section>
    </>
  );
}

function departmentFlow(area: AreaId, records: RecordItem[]) {
  const labels: Partial<Record<AreaId, string[]>> = {
    sales: ["Lead intake", "mNDA", "Quotation", "Contract review"],
    ehw: ["HW_01–04", "PRS", "Schematic", "BOM & layout", "Gerber gate"],
    esw: ["G0–G2", "G3–G5", "G6–G8", "G9–G11", "HSI & CI/CD"],
    mech: ["Concept", "STEP clearance", "2D drawing", "Tooling", "Release"],
    pur: ["Request", "RFQ", "ASL/ACML", "PPAP", "Receiving"],
    qa: ["APQP", "DVP&R", "IQC/IPQC/FQC", "8D CAPA", "Quality release"],
    emf: ["PFD", "PFMEA", "Control plan", "Line startup", "Dispatch"],
    tst: ["Pre-flash", "Parametric", "CAN loopback", "Production flash", "FPY & QR"],
    fin: ["PO & GRN", "Billing", "Receivables", "Tax close"],
    sit: ["Telemetry", "Backup", "Support", "ISMS"],
    hrops: ["Skill matrix", "TNI", "License calendar", "DMAIC"],
    rnd: ["HW_01–04", "PRS", "Schematic", "BOM & layout", "Gerber gate"],
    stores: ["Request", "RFQ", "ASL/ACML", "PPAP", "Receiving"],
    production: ["PFD", "PFMEA", "Control plan", "Line startup", "Dispatch"],
    quality: ["APQP", "DVP&R", "IQC/IPQC/FQC", "8D CAPA", "Quality release"],
    people: ["Skill matrix", "TNI", "License calendar", "DMAIC"],
  };
  const stages = labels[area] ?? [];
  return stages.map((label) => {
    const stageRecords = records.filter((record) =>
      `${record.type} ${record.fields["lifecycleStage"] ?? ""}`
        .toLowerCase()
        .includes(label.toLowerCase()),
    );
    const complete = stageRecords.filter((record) =>
      ["Approved", "Released"].includes(record.status),
    ).length;
    const blocked = stageRecords.filter((record) => Boolean(record.fields["blocker"])).length;
    const inProgress = stageRecords.filter(
      (record) => !record.fields["blocker"] && ["Open", "In review"].includes(record.status),
    ).length;
    const upcoming = stageRecords.filter((record) => record.status === "Draft").length;
    const latestUpdate = stageRecords
      .map((record) => record.updatedAt)
      .sort((a, b) => b.localeCompare(a))[0];
    return {
      label,
      total: stageRecords.length,
      complete,
      blocked,
      inProgress,
      upcoming,
      latestUpdate,
    };
  });
}

function DepartmentFlow({
  flow,
  onOpenStage,
}: {
  flow: {
    label: string;
    total: number;
    complete: number;
    blocked: number;
    inProgress: number;
    upcoming: number;
    latestUpdate?: string | undefined;
  }[];
  onOpenStage: (label: string) => void;
}) {
  if (!flow.length) return null;
  return (
    <section className="ops-section surface-panel mt-8 overflow-hidden bg-panel">
      <div className="ops-section-header flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Department flow</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Record progress through this department’s controlled work stages.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          Live queue view
        </span>
      </div>
      <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
        {flow.map((stage, index) => {
          const percent = stage.total ? Math.round((stage.complete / stage.total) * 100) : 0;
          return (
            <button
              key={stage.label}
              onClick={() => onOpenStage(stage.label)}
              className="relative min-h-32 bg-card px-4 py-3 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-sm font-semibold text-steel">{percent}%</span>
              </div>
              <p className="mt-2 text-xs font-semibold">{stage.label}</p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
                aria-label={`${stage.label} ${percent}% complete`}
              >
                <span
                  className="block h-full rounded-full bg-steel motion-safe:animate-[rise-in_600ms_ease-out_both] motion-safe:transition-[width] motion-safe:duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {stage.complete} complete · {stage.inProgress} in progress · {stage.blocked} blocked
                · {stage.upcoming} upcoming
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {stage.latestUpdate
                  ? `Latest update ${stage.latestUpdate}`
                  : "No records in this stage"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AreaSummary({ records }: { records: RecordItem[] }) {
  const statuses: RecordStatus[] = ["Draft", "Open", "In review", "Approved", "Released"];
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
      {statuses.map((status) => (
        <Metric
          key={status}
          label={status}
          value={String(records.filter((record) => record.status === status).length)}
          detail="Records"
          tone={
            status === "Open"
              ? "steel"
              : status === "Approved" || status === "Released"
                ? "moss"
                : "warning"
          }
        />
      ))}
    </div>
  );
}

function RecordDetail({
  record,
  onBack,
  onSave,
  onArchive,
  onOpenPrintable,
}: {
  record: RecordItem;
  onBack: () => void;
  onSave: (patch: Partial<RecordItem>) => void;
  onArchive: () => void;
  onOpenPrintable: (document: PrintableDocument) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(record.title);
  const [notes, setNotes] = useState(record.notes);
  const [status, setStatus] = useState<RecordStatus>(record.status);
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel"
      >
        <ArrowLeft className="size-4" />
        Back to queue
      </button>
      <section className="border border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {record.reference} · {record.type}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{record.title}</h1>
          </div>
          <div className="flex gap-2">
            <Action onClick={() => onOpenPrintable(recordPrintable(record))} label="Open full document" primary />
            <Action onClick={() => setEditing(!editing)} label={editing ? "Cancel" : "Edit"} />
            <Action onClick={onArchive} label="Archive" />
          </div>
        </div>
        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_15rem]">
          {editing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (title.trim()) {
                  onSave({ title: title.trim(), notes, status });
                  setEditing(false);
                }
              }}
              className="space-y-4"
            >
              <TextField label="Title" value={title} onChange={setTitle} required />
              <SelectField
                label="Status"
                value={status}
                options={["Draft", "Open", "In review", "Approved", "Released"]}
                onChange={(value) => setStatus(value as RecordStatus)}
              />
              <label className="block text-sm font-medium">
                Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, 2000))}
                  className="mt-1.5 min-h-28 w-full border border-input bg-background p-3 text-sm"
                />
              </label>
              <Action label="Save changes" primary submit />
            </form>
          ) : (
            <div>
              <h2 className="font-semibold">Controlled fields</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {Object.entries(record.fields)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-2">
                      <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1")}
                      </dt>
                      <dd className="mt-1 text-sm">{value}</dd>
                    </div>
                  ))}
              </dl>
              <h2 className="mt-6 font-semibold">Requirements / scope</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {record.notes || "No scope added."}
              </p>
            </div>
          )}
          <aside className="border-l border-border pl-5">
            <Status status={record.status} />
            <p className="mt-6 font-mono text-[10px] uppercase text-muted-foreground">Priority</p>
            <p className="mt-1 font-semibold">{record.priority}</p>
            <p className="mt-6 text-xs text-muted-foreground">
              Created {record.createdAt}
              <br />
              Updated {record.updatedAt}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

const formSpecs: Partial<
  Record<
    AreaId,
    {
      types: string[];
      fields: {
        key: string;
        label: string;
        required?: boolean;
        kind?: "text" | "date" | "select";
        options?: string[];
        master?: keyof MasterData;
      }[];
    }
  >
> = {
  home: {
    types: ["Task"],
    fields: [
      { key: "controlledNumber", label: "Task number", required: true },
      { key: "title", label: "Task title", required: true },
      {
        key: "priority",
        label: "Priority",
        required: true,
        kind: "select",
        options: ["Low", "Normal", "High", "Critical"],
      },
      { key: "dueDate", label: "Due date", kind: "date" },
    ],
  },
  rnd: {
    types: ["Project", "Part", "BOM", "Prototype", "Engineering change", "Design review"],
    fields: [
      { key: "controlledNumber", label: "Project code", required: true },
      { key: "title", label: "Project title", required: true },
      {
        key: "category",
        label: "Type / category",
        required: true,
        kind: "select",
        options: ["New product", "Variant", "Research", "Sustaining engineering"],
      },
      { key: "product", label: "Product", master: "products" },
      { key: "owner", label: "Owner", master: "people" },
      {
        key: "stage",
        label: "Stage",
        required: true,
        kind: "select",
        options: ["Concept", "Requirements", "Prototype", "Verification", "Released"],
      },
      { key: "targetDate", label: "Target date", kind: "date" },
      { key: "location", label: "Location", required: true, master: "locations" },
    ],
  },
  stores: {
    types: [
      "Purchase request",
      "Part",
      "Supplier",
      "RFQ",
      "Purchase order",
      "Receiving",
      "Stock movement",
    ],
    fields: [
      { key: "controlledNumber", label: "Purchase request number", required: true },
      { key: "title", label: "Request title", required: true },
      { key: "supplier", label: "Supplier", master: "suppliers" },
      { key: "part", label: "Part", master: "parts" },
      { key: "location", label: "Delivery location", required: true, master: "locations" },
      { key: "dueDate", label: "Required date", kind: "date" },
    ],
  },
  production: {
    types: ["Production order", "Production test", "Release", "Dispatch"],
    fields: [
      { key: "controlledNumber", label: "Production order number", required: true },
      { key: "title", label: "Production order title", required: true },
      { key: "route", label: "Production route", master: "routes" },
      { key: "location", label: "Location", required: true, master: "locations" },
      { key: "targetDate", label: "Planned completion", kind: "date" },
    ],
  },
  quality: {
    types: ["Inspection", "NCR", "CAPA", "Quality review"],
    fields: [
      { key: "controlledNumber", label: "Inspection number", required: true },
      { key: "title", label: "Inspection title", required: true },
      { key: "location", label: "Location", required: true, master: "locations" },
      { key: "targetDate", label: "Target closure", kind: "date" },
    ],
  },
  sales: {
    types: ["Enquiry", "Opportunity", "Order", "Handover"],
    fields: [
      { key: "controlledNumber", label: "Enquiry number", required: true },
      { key: "title", label: "Enquiry title", required: true },
      { key: "customer", label: "Customer", master: "customers" },
      { key: "targetDate", label: "Target date", kind: "date" },
      { key: "location", label: "Location", required: true, master: "locations" },
    ],
  },
  people: {
    types: ["Person", "Training", "Leave", "Asset"],
    fields: [
      { key: "controlledNumber", label: "Person number", required: true },
      { key: "title", label: "Name", required: true },
      { key: "location", label: "Location", required: true, master: "locations" },
      { key: "dueDate", label: "Due date", kind: "date" },
    ],
  },
  ehw: {
    types: ["PRS", "Hardware tracker", "Schematic", "BOM", "Gerber release"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      {
        key: "hwStage",
        label: "HW stage",
        required: true,
        kind: "select",
        options: Array.from(
          { length: 37 },
          (_, index) => `HW_${String(index + 1).padStart(2, "0")}`,
        ),
      },
      { key: "projectId", label: "Project ID", master: "products" },
      { key: "location", label: "Location", required: true, master: "locations" },
    ],
  },
  esw: {
    types: ["Software gate", "HSI register", "CI/CD telemetry", "Firmware release"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      {
        key: "gate",
        label: "SDLC gate",
        required: true,
        kind: "select",
        options: Array.from({ length: 12 }, (_, index) => `G${index}`),
      },
      { key: "projectId", label: "Project ID", master: "products" },
    ],
  },
  mech: {
    types: ["STEP clearance", "2D drawing", "Mold tooling", "Mechanical release"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "projectId", label: "Project ID", master: "products" },
      { key: "location", label: "Location", required: true, master: "locations" },
    ],
  },
  pur: {
    types: [
      "Rapid prototype request",
      "Mass production request",
      "ASL/ACML",
      "F-PUR-10",
      "F-PUR-16",
      "PPAP Level 3",
    ],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      {
        key: "procurementTrack",
        label: "Procurement track",
        required: true,
        kind: "select",
        options: ["Rapid prototype", "Mass production"],
      },
      { key: "supplier", label: "Supplier", master: "suppliers" },
    ],
  },
  qa: {
    types: ["APQP gate", "DVP&R", "IQC", "IPQC", "FQC", "8D CAPA"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      {
        key: "qualityStage",
        label: "Quality stage",
        required: true,
        kind: "select",
        options: ["APQP", "DVP&R", "IQC", "IPQC", "FQC", "8D"],
      },
    ],
  },
  emf: {
    types: ["Line startup checklist", "PFD", "PFMEA", "Control plan"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "location", label: "Location", required: true, master: "locations" },
    ],
  },
  tst: {
    types: ["EOL test run", "Test jig", "QR label batch", "FPY review"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "serialRange", label: "Serial range" },
      { key: "fpy", label: "First-pass yield %" },
    ],
  },
  fin: {
    types: ["Commercial billing", "PO & GRN validation", "Receivables review", "Tax close"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "ageingDays", label: "Ageing days" },
    ],
  },
  sit: {
    types: ["Server telemetry", "Backup review", "IT support ticket", "ISMS control"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "service", label: "Service / asset" },
    ],
  },
  hrops: {
    types: ["Skill matrix", "Training need", "License alert", "DMAIC tollgate"],
    fields: [
      { key: "controlledNumber", label: "Controlled number", required: true },
      { key: "title", label: "Title", required: true },
      { key: "owner", label: "Owner", master: "people" },
    ],
  },
  audit: {
    types: [
      "Audit programme",
      "Internal audit plan",
      "Supplier audit plan",
      "Customer audit plan",
      "Audit finding",
      "Corrective / preventive action",
      "Management review",
      "Improvement action",
      "Controlled document",
    ],
    fields: [
      { key: "controlledNumber", label: "Audit / document number", required: true },
      { key: "title", label: "Title", required: true },
      {
        key: "auditStatus",
        label: "Workflow status",
        required: true,
        kind: "select",
        options: auditStatuses,
      },
      {
        key: "auditType",
        label: "Plan / finding type",
        required: true,
        kind: "select",
        options: ["Internal", "Supplier", "Customer", "Controlled document", "Management review"],
      },
      {
        key: "classification",
        label: "Finding / classification",
        kind: "select",
        options: [
          "Observation",
          "Minor nonconformity",
          "Major nonconformity",
          "Confidential",
          "Internal",
        ],
      },
      { key: "owner", label: "Owner", master: "people" },
      { key: "supplier", label: "Supplier", master: "suppliers" },
      { key: "customer", label: "Customer", master: "customers" },
      { key: "location", label: "Location", required: true, master: "locations" },
      { key: "targetDate", label: "Due / review date", kind: "date" },
    ],
  },
};
function RecordForm({
  area,
  portal,
  onClose,
  onSave,
}: {
  area: AreaId;
  portal: PortalState;
  onClose: () => void;
  onSave: (record: Omit<RecordItem, "id" | "reference" | "createdAt" | "updatedAt">) => void;
}) {
  const spec = formSpecs[area] ?? formSpecs.ehw;
  if (!spec) return null;
  const [type, setType] = useState(spec.types[0] ?? "Record");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const field = (key: string) => values[key] ?? "";
  const departmentCode = findAreaDepartment(portal.departments, area)?.code.replace(/^DEMO-/, "") || areaById(area).short;
  const selectedProject = field("projectId") || field("product") || "HLPL-AI4T-01";
  const selectedDocumentType = templateDocumentTypes.includes(type.toUpperCase()) ? type.toUpperCase() : type.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "REC";
  const nextRevision = String(
    portal.records.filter((record) => record.reference.includes(`-${departmentCode}-${selectedDocumentType}-`)).length + 1,
  ).padStart(2, "0");
  const generatedId = documentNumber(selectedProject, departmentCode, selectedDocumentType, nextRevision, portal.templateSettings?.prefix ?? "HLPL");
  const approvedReview = portal.records.find(
    (record) =>
      record.type === "Contract review" &&
      record.status === "Approved" &&
      record.reference === "HLPL/F/MKT/01",
  );
  const visibleFields = type === "PRS" ? spec.fields.filter((item) => item.key !== "hwStage") : spec.fields;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (type === "PRS" && !approvedReview) {
      return setError("PRS is generated only after an approved Contract Review HLPL/F/MKT/01.");
    }
    const preparedValues =
      type === "PRS"
        ? {
            ...values,
            controlledNumber: values["controlledNumber"] || "HLPL-SLCT-EHW-PRS-01",
            projectId: values["projectId"] || "HLPL-SLCT-01",
            lifecycleStage: "Stage 3 · Requirement Freeze & Commercial Confirmation",
            generatedFrom: "Generated automatically from approved Contract Review HLPL/F/MKT/01",
            baseline: "Frozen · automated baseline · changes require PMSS amendment",
          }
        : values;
    const missing = visibleFields.find(
      (item) => item.required && item.key !== "controlledNumber" && !field(item.key).trim(),
    );
    if (missing) return setError(`${missing.label} is required.`);
    const invalid = spec.fields.find(
      (item) =>
        item.master &&
        field(item.key) &&
        !(portal.masters[item.master] ?? []).some(
          (value) => value.toLowerCase() === field(item.key).toLowerCase(),
        ),
    );
    if (invalid) return setError(`Select a managed ${invalid.label.toLowerCase()} option.`);
    onSave({
      area,
      type,
      title: field("title").trim(),
      status: "Draft",
      priority: (field("priority") as Priority) || "Normal",
      notes: field("scope"),
      fields: preparedValues,
    });
  };
  return (
    <Modal title={`Create ${type}`} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <p className="rounded-lg border border-border bg-panel px-3 py-2 text-xs text-muted-foreground">
          The portal generates an HLPL document number on save when you leave the controlled number
          blank.
        </p>
        <SelectField label="Record type" value={type} options={spec.types} onChange={setType} />
        <section className="rounded-lg border border-steel/35 bg-panel p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-steel">Automatic document number</p>
              <p className="mt-1 font-mono text-sm font-semibold text-foreground">{field("controlledNumber") || generatedId}</p>
              <p className="mt-1 text-xs text-muted-foreground">{portal.templateSettings?.prefix ?? "HLPL"} · Project · Department · Document type · Revision</p>
            </div>
            <Action label={copied ? "Copied" : "Copy ID"} onClick={() => { void navigator.clipboard?.writeText(field("controlledNumber") || generatedId); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} />
          </div>
          <input aria-label="Editable document ID" value={field("controlledNumber") || generatedId} onChange={(event) => setValues({ ...values, controlledNumber: event.target.value.toUpperCase() })} className="mt-3 h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-xs" />
        </section>
        {type === "PRS" && (
          <div className="rounded-lg border border-moss/30 bg-accent p-4 text-sm">
            <p className="font-semibold">Auto-compiled, frozen PRS baseline</p>
            <p className="mt-1 text-muted-foreground">
              Generated automatically from approved Contract Review HLPL/F/MKT/01. No stage selection is required.
            </p>
            <p className="mt-2 font-mono text-xs text-steel">
              {approvedReview ? "Feasibility approvals complete" : "Awaiting approved feasibility review"}
            </p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {visibleFields.map((item) =>
            item.master ? (
              <ManagedField
                key={item.key}
                item={item}
                value={field(item.key)}
                options={portal.masters[item.master] ?? []}
                onChange={(value) => setValues({ ...values, [item.key]: value })}
              />
            ) : item.kind === "select" ? (
              <SelectField
                key={item.key}
                label={`${item.label}${item.required ? " *" : ""}`}
                value={field(item.key)}
                options={["", ...(item.options ?? [])]}
                onChange={(value) => setValues({ ...values, [item.key]: value })}
              />
            ) : (
              <TextField
                key={item.key}
                label={item.label}
                type={item.kind === "date" ? "date" : "text"}
                required={item.required === true}
                value={field(item.key)}
                onChange={(value) => setValues({ ...values, [item.key]: value })}
              />
            ),
          )}
        </div>
        <label className="block text-sm font-medium">
          Requirements / scope
          <textarea
            value={field("scope")}
            onChange={(event) => setValues({ ...values, scope: event.target.value.slice(0, 2000) })}
            className="mt-1.5 min-h-28 w-full border border-input bg-background p-3 text-sm"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Action onClick={onClose} label="Cancel" />
          <Action label={`Save ${type}`} primary submit />
        </div>
      </form>
    </Modal>
  );
}
function ManagedField({
  item,
  value,
  options,
  onChange,
}: {
  item: { label: string; required?: boolean };
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {item.label}
      {item.required ? " *" : ""}
      <input
        list={`options-${item.label}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Search ${item.label.toLowerCase()}`}
        className="mt-1.5 h-11 w-full border border-input bg-background px-3 text-sm"
      />
      <datalist id={`options-${item.label}`}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <span className="mt-1 block text-xs text-muted-foreground">
        Manage options in Administration.
      </span>
    </label>
  );
}

function AdminCommandCenter({
  portal,
  activeDepartmentId,
  onClose,
  onUpdate,
  onLog,
  onContext,
  onLoadDemo,
  onResetDemo,
}: {
  portal: PortalState;
  activeDepartmentId: string | null;
  onClose: () => void;
  onUpdate: (recipe: (state: PortalState) => PortalState) => void;
  onLog: (action: string, detail: string) => void;
  onContext: (id: string | null) => void;
  onLoadDemo: () => void;
  onResetDemo: () => void;
}) {
  const [tab, setTab] = useState<
    "company" | "templates" | "raci" | "departments" | "roles" | "masters" | "settings" | "team" | "demo"
  >("company");
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState({
    name: "",
    code: "",
    type: departmentTypes[0] ?? "R&D/Engineering",
    custom: "",
    lead: "",
  });
  const [company, setCompany] = useState(() => ({
    ...emptyPortal().setup,
    ...portal.setup,
    configuration: { ...emptyPortal().setup.configuration, ...(portal.setup?.configuration ?? {}) },
  }));
  const filtered = portal.departments.filter((department) =>
    `${department.name} ${department.code} ${department.departmentType}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const pageSize = density === "compact" ? 10 : 5;
  const current = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const selected =
    portal.departments.find((department) => department.id === activeDepartmentId) ??
    portal.departments.at(0);
  const createDepartment = () => {
    const name = draft.name.trim();
    const code = draft.code.trim().toUpperCase();
    const type = draft.type === "Other/custom" ? draft.custom.trim() : draft.type;
    if (!name || !code || !type) return;
    if (
      portal.departments.some(
        (department) =>
          department.name.toLowerCase() === name.toLowerCase() || department.code === code,
      )
    )
      return;
    const department: Department = {
      id: createId(),
      name,
      code,
      departmentType: type,
      ...(draft.type === "Other/custom" ? { customType: type } : {}),
      active: true,
      lead: draft.lead.trim(),
      sortOrder: portal.departments.length,
      settings: { ...blankSettings(), prefix: code },
    };
    onUpdate((state) => ({ ...state, departments: [...state.departments, department] }));
    onLog("Department created", `${name} (${code}) configured by administrator`);
    setDraft({
      name: "",
      code: "",
      type: departmentTypes[0] ?? "R&D/Engineering",
      custom: "",
      lead: "",
    });
  };
  const saveCompany = () => {
    if (!company.company.trim() || !company.location.trim() || !company.numbering.trim()) return;
    onUpdate((state) => ({
      ...state,
      setup: {
        ...state.setup,
        ...company,
        configuration: { ...state.setup.configuration, ...company.configuration },
      },
    }));
    onLog("Company configuration saved", `${company.company} configuration updated`);
  };
  return (
    <Modal title="Administration command center" onClose={onClose} wide>
      <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-4">
        {(["company", "templates", "raci", "departments", "roles", "masters", "settings", "team", "demo"] as const).map(
          (item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`h-9 px-3 text-sm font-semibold capitalize ${tab === item ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              {item === "company"
                ? "Company & calendar"
                : item === "settings"
                  ? "Department settings"
                  : item === "templates"
                    ? "Template settings"
                    : item === "raci"
                      ? "Responsibility matrix"
                  : item}
            </button>
          ),
        )}
        <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">
          Acting role · Administrator
        </span>
      </div>
      {tab === "team" ? (
        <TeamCompetencyPanel members={demoTeam} />
      ) : tab === "demo" ? (
        <DemoDataPanel loaded={portal.demoLoaded} onLoad={onLoadDemo} onReset={onResetDemo} />
      ) : tab === "templates" ? (
        <TemplateSettingsEditor
          settings={portal.templateSettings ?? defaultTemplateSettings()}
          onChange={(templateSettings) => onUpdate((state) => ({ ...state, templateSettings }))}
          onSave={() => onLog("Document template settings saved", "Header, footer, locations and numbering updated")}
        />
      ) : tab === "raci" ? (
        <RaciMatrixEditor matrix={portal.raciMatrix ?? defaultRaciMatrix()} onChange={(raciMatrix) => onUpdate((state) => ({ ...state, raciMatrix }))} onSave={() => onLog("Responsibility matrix saved", "Stage handoff notification routing updated")} />
      ) : tab === "company" ? (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Company baseline, locations, calendar and document numbering. India / Noida are editable
            starting values.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Company name"
              value={company.company}
              onChange={(value) => setCompany({ ...company, company: value })}
              required
            />
            <TextField
              label="Main location"
              value={company.location}
              onChange={(value) => setCompany({ ...company, location: value })}
              required
            />
            <SelectField
              label="Working days"
              value={company.workingDays}
              options={[
                "Monday – Friday",
                "Monday – Saturday",
                "Monday – Sunday",
                "Custom schedule",
              ]}
              onChange={(value) => setCompany({ ...company, workingDays: value })}
            />
            <SelectField
              label="Time zone"
              value={company.timezone}
              options={["Asia/Kolkata", "UTC", "Custom time zone"]}
              onChange={(value) => setCompany({ ...company, timezone: value })}
            />
            <TextField
              label="Document number pattern"
              value={company.numbering}
              onChange={(value) => setCompany({ ...company, numbering: value })}
              required
            />
            <TextField
              label="Fiscal calendar"
              value={company.configuration["fiscalYear"] ?? ""}
              onChange={(value) =>
                setCompany({
                  ...company,
                  configuration: { ...company.configuration, fiscalYear: value },
                })
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Action label="Save company configuration" onClick={saveCompany} primary />
            <Action label="Manage locations" onClick={() => setTab("masters")} />
          </div>
        </div>
      ) : tab === "masters" ? (
        <MasterManager portal={portal} onUpdate={onUpdate} onLog={onLog} />
      ) : tab === "departments" ? (
        <>
          <div className="grid gap-3 border border-border bg-panel p-4 md:grid-cols-3">
            <TextField
              label="Department name"
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
            />
            <TextField
              label="Code"
              value={draft.code}
              onChange={(code) => setDraft({ ...draft, code })}
            />
            <SelectField
              label="Department type"
              value={draft.type}
              options={departmentTypes}
              onChange={(type) => setDraft({ ...draft, type })}
            />
            <TextField
              label="Department lead"
              value={draft.lead}
              onChange={(lead) => setDraft({ ...draft, lead })}
            />
            {draft.type === "Other/custom" && (
              <TextField
                label="Custom type"
                value={draft.custom}
                onChange={(custom) => setDraft({ ...draft, custom })}
              />
            )}
            <Action label="Create department" onClick={createDepartment} primary />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <input
              aria-label="Filter departments"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Filter departments"
              className="h-10 min-w-52 flex-1 border border-input bg-background px-3 text-sm"
            />
            <SelectField
              label="Row density"
              value={density}
              options={["comfortable", "compact"]}
              onChange={(value) => setDensity(value as "comfortable" | "compact")}
            />
          </div>
          <div className="mt-3 overflow-x-auto border border-border">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="bg-panel font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Department</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Lead</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((department) => (
                  <tr key={department.id} className="border-t border-border">
                    <td className={`p-3 ${density === "compact" ? "py-2" : "py-4"}`}>
                      <strong>{department.name}</strong>
                      <small className="ml-2 font-mono text-muted-foreground">
                        {department.code}
                      </small>
                    </td>
                    <td className="p-3">{department.departmentType}</td>
                    <td className="p-3">{department.lead || "No lead assigned"}</td>
                    <td className="p-3">{department.active ? "Active" : "Inactive"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onContext(department.id)}
                        className="font-semibold text-steel"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => {
                          onUpdate((state) => ({
                            ...state,
                            departments: state.departments.map((item) =>
                              item.id === department.id ? { ...item, active: !item.active } : item,
                            ),
                          }));
                          onLog(
                            "Department status changed",
                            `${department.name} ${department.active ? "deactivated" : "activated"}`,
                          );
                        }}
                        className="ml-3 font-semibold text-danger"
                      >
                        {department.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!current.length && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No departments match the current filters.
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>
              {filtered.length} department{filtered.length === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <Action label="Previous" onClick={() => setPage(Math.max(0, page - 1))} />
              <Action
                label="Next"
                onClick={() => setPage((page + 1) * pageSize < filtered.length ? page + 1 : page)}
              />
            </div>
          </div>
        </>
      ) : tab === "roles" ? (
        <RoleManager portal={portal} onUpdate={onUpdate} onLog={onLog} />
      ) : (
        <DepartmentSettingsManager department={selected} onUpdate={onUpdate} onLog={onLog} />
      )}
    </Modal>
  );
}

function TeamCompetencyPanel({ members }: { members: TeamMember[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tni, setTni] = useState<string[]>([]);
  return (
    <section className="mt-6 overflow-hidden border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <p className="font-semibold">DEMO competency roster</p>
          <p className="mt-1 text-sm text-muted-foreground">Illustrative HR/OPS skill-matrix entries only · not personnel records.</p>
        </div>
        <span className="font-mono text-[10px] uppercase text-steel">HLPL/F/HR/03</span>
      </div>
      <div className="divide-y divide-border">
        {members.map((member) => (
          <div key={member.name} className="px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setExpanded(expanded === member.name ? null : member.name)} className="text-left">
                <strong className="block">{member.name}</strong>
                <span className="mt-1 block text-sm text-muted-foreground">{member.role} · {areaById(member.area).short}</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">{member.score}</span>
                <span className="rounded-md border border-moss/25 bg-card px-2 py-1 text-xs font-semibold text-moss">{member.level}</span>
                <Action label={tni.includes(member.name) ? "TNI queued" : "Create TNI"} onClick={() => setTni((items) => items.includes(member.name) ? items : [...items, member.name])} />
              </div>
            </div>
            {expanded === member.name && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {member.skills.map((skill, index) => <p key={skill} className="border border-border bg-panel px-3 py-2 text-sm">{skill}<span className="float-right font-mono text-xs text-steel">{index < 3 ? "4/4" : "3/4"}</span></p>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
function MasterManager({
  portal,
  onUpdate,
  onLog,
}: {
  portal: PortalState;
  onUpdate: (recipe: (state: PortalState) => PortalState) => void;
  onLog: (action: string, detail: string) => void;
}) {
  const [kind, setKind] = useState<keyof MasterData>("locations");
  const [value, setValue] = useState("");
  const labels: Record<keyof MasterData, string> = {
    people: "Team members",
    suppliers: "Suppliers",
    parts: "Parts / categories / bins",
    products: "Products",
    customers: "Customers",
    locations: "Locations",
    routes: "Production routes",
    documentTypes: "Document types",
  };
  const add = () => {
    const next = value.trim();
    if (!next || portal.masters[kind].some((item) => item.toLowerCase() === next.toLowerCase()))
      return;
    onUpdate((state) => ({
      ...state,
      masters: { ...state.masters, [kind]: [...state.masters[kind], next] },
    }));
    onLog("Master option created", `${next} added to ${labels[kind]}`);
    setValue("");
  };
  const remove = (item: string) => {
    onUpdate((state) => ({
      ...state,
      masters: { ...state.masters, [kind]: state.masters[kind].filter((value) => value !== item) },
    }));
    onLog("Master option removed", `${item} removed from ${labels[kind]}`);
  };
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Add the confirmed options that forms use. Categories, bins and stock rules can be kept as
        named part options until shared inventory is connected.
      </p>
      <div className="mt-4 grid gap-3 border border-border bg-panel p-4 md:grid-cols-3">
        <SelectField
          label="Master list"
          value={kind}
          options={Object.keys(labels)}
          onChange={(value) => setKind(value as keyof MasterData)}
        />
        <TextField
          label={`New ${labels[kind].slice(0, -1) || labels[kind]} option`}
          value={value}
          onChange={setValue}
        />
        <Action label="Create option" onClick={add} primary />
      </div>
      <div className="mt-5 space-y-2">
        {portal.masters[kind].length ? (
          portal.masters[kind].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between border-b border-border py-3"
            >
              <span>{item}</span>
              <button onClick={() => remove(item)} className="font-semibold text-danger">
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="py-5 text-sm text-muted-foreground">
            No options yet. Create the first confirmed option above.
          </p>
        )}
      </div>
    </div>
  );
}
function RoleManager({
  portal,
  onUpdate,
  onLog,
}: {
  portal: PortalState;
  onUpdate: (recipe: (state: PortalState) => PortalState) => void;
  onLog: (action: string, detail: string) => void;
}) {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["records:view"]);
  const create = () => {
    const department = portal.departments.find((item) => item.id === departmentId);
    if (!department || !name.trim()) return;
    const role: DepartmentRole = {
      id: createId(),
      departmentId,
      name: name.trim(),
      assignee: "Unassigned",
      permissions,
      active: true,
    };
    onUpdate((state) => ({ ...state, roles: [...state.roles, role] }));
    onLog("Department role created", `${role.name} created for ${department.name}`);
    setName("");
    setPermissions(["records:view"]);
  };
  return (
    <div>
      <p className="text-sm leading-6 text-muted-foreground">
        Sub-roles scope access by department. Assignments remain blank until a confirmed team member
        is added; this never impersonates another account.
      </p>
      <div className="mt-4 grid gap-3 border border-border bg-panel p-4 md:grid-cols-3">
        <TextField label="Role name" value={name} onChange={setName} />
        <SelectField
          label="Department"
          value={departmentId}
          options={[
            "",
            ...portal.departments.filter((item) => item.active).map((item) => item.name),
          ]}
          onChange={(value) =>
            setDepartmentId(portal.departments.find((item) => item.name === value)?.id ?? "")
          }
        />
        <Action label="Create role" onClick={create} primary />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {permissionOptions.map((permission) => (
          <label
            key={permission}
            className="flex items-center gap-2 border border-border p-3 text-sm"
          >
            <input
              type="checkbox"
              checked={permissions.includes(permission)}
              onChange={(event) =>
                setPermissions(
                  event.target.checked
                    ? [...permissions, permission]
                    : permissions.filter((item) => item !== permission),
                )
              }
            />
            {permission}
          </label>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {portal.roles.length ? (
          portal.roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3"
            >
              <span>
                <strong>{role.name}</strong>
                <small className="ml-2 text-muted-foreground">
                  {role.assignee} ·{" "}
                  {portal.departments.find((department) => department.id === role.departmentId)
                    ?.name ?? "Unknown department"}
                </small>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {role.permissions.length} permissions
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No department sub-roles configured.</p>
        )}
      </div>
    </div>
  );
}
function DepartmentSettingsManager({
  department,
  onUpdate,
  onLog,
}: {
  department: Department | undefined;
  onUpdate: (recipe: (state: PortalState) => PortalState) => void;
  onLog: (action: string, detail: string) => void;
}) {
  const [group, setGroup] =
    useState<
      keyof Pick<
        DepartmentSettings,
        "activityTypes" | "templates" | "approvalGates" | "milestones" | "kpis" | "notifications"
      >
    >("activityTypes");
  const [value, setValue] = useState("");
  if (!department)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Create a department to configure its calendar, numbering, gates and KPI options.
      </p>
    );
  const add = () => {
    const next = value.trim();
    if (!next) return;
    onUpdate((state) => ({
      ...state,
      departments: state.departments.map((item) =>
        item.id === department.id
          ? { ...item, settings: { ...item.settings, [group]: [...item.settings[group], next] } }
          : item,
      ),
    }));
    onLog("Department setting added", `${next} added to ${department.name}`);
    setValue("");
  };
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Managing {department.name}. These controls define local activity options and controlled
        numbering.
      </p>
      <div className="grid gap-3 border border-border bg-panel p-4 md:grid-cols-3">
        <SelectField
          label="Setting group"
          value={group}
          options={[
            "activityTypes",
            "templates",
            "approvalGates",
            "milestones",
            "kpis",
            "notifications",
          ]}
          onChange={(value) => setGroup(value as typeof group)}
        />
        <TextField label="New option" value={value} onChange={setValue} />
        <Action label="Add option" onClick={add} primary />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <TextField
          label="Number prefix"
          value={department.settings.prefix}
          onChange={(prefix) =>
            onUpdate((state) => ({
              ...state,
              departments: state.departments.map((item) =>
                item.id === department.id
                  ? { ...item, settings: { ...item.settings, prefix } }
                  : item,
              ),
            }))
          }
        />
        <TextField
          label="Number format"
          value={department.settings.format}
          onChange={(format) =>
            onUpdate((state) => ({
              ...state,
              departments: state.departments.map((item) =>
                item.id === department.id
                  ? { ...item, settings: { ...item.settings, format } }
                  : item,
              ),
            }))
          }
        />
        <div className="border border-border bg-card p-3">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Preview</p>
          <p className="mt-2 font-semibold">
            {department.settings.format
              .replace("{PREFIX}", department.settings.prefix || department.code)
              .replace("{YYYY}", String(new Date().getFullYear()))
              .replace("{####}", String(department.settings.sequence).padStart(4, "0"))}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {department.settings[group].map((item) => (
          <span key={item} className="border border-border bg-panel px-2 py-1 text-xs">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const wizardGuidance = [
  {
    intro: "Set the legal operating baseline. India and Noida are editable defaults.",
    fields: [
      ["Company name", "company", "text", true],
      ["Main location", "location", "text", true],
      ["Working days", "workingDays", "select", true],
      ["Time zone", "timezone", "select", true],
      ["Document number pattern", "numbering", "text", true],
      ["Fiscal calendar", "fiscalYear", "text", true],
    ],
  },
  {
    intro: "Create departments in Administration, then assign confirmed leads and sub-roles.",
    fields: [
      ["Department model", "departmentModel", "text", true],
      ["Lead assignment rule", "leadRule", "text", true],
      ["Sub-role rule", "subRoleRule", "text", false],
    ],
  },
  {
    intro: "Add confirmed people and role access. Demo identities are not authenticated users.",
    fields: [
      ["Access baseline", "accessRule", "text", true],
      ["Team onboarding rule", "teamOnboarding", "text", true],
      ["Access review cadence", "accessReview", "text", false],
    ],
  },
  {
    intro: "Define the controlled project flow before teams create operational projects.",
    fields: [
      ["Project stages", "projectStages", "text", true],
      ["Approval gates", "projectGates", "text", true],
      ["Milestone review", "milestones", "text", false],
    ],
  },
  {
    intro: "Create master lists in Administration before purchasing or stock activity begins.",
    fields: [
      ["Part categories", "partCategories", "text", true],
      ["Storage / bins", "bins", "text", true],
      ["Stock movement rule", "stockRule", "text", true],
      ["Supplier approval rule", "supplierRule", "text", false],
    ],
  },
  {
    intro: "Set customer, pipeline, order and controlled client-sharing rules.",
    fields: [
      ["Pipeline stages", "pipeline", "text", true],
      ["Order review rule", "orderRule", "text", true],
      ["Client sharing rule", "clientSharing", "text", true],
    ],
  },
  {
    intro: "Configure routes and human-controlled quality / release decisions.",
    fields: [
      ["Production route baseline", "productionRoute", "text", true],
      ["Kitting & serial rule", "serialRule", "text", true],
      ["Quality release rule", "qualityRelease", "text", true],
      ["Dispatch hold rule", "dispatchRule", "text", false],
    ],
  },
  {
    intro:
      "Audit and controlled documents stay with their owning department; they are not a standalone area.",
    fields: [
      ["Audit ownership", "auditOwnership", "text", true],
      ["Finding / CAPA workflow", "auditWorkflow", "text", true],
      ["Controlled document lifecycle", "documentLifecycle", "text", true],
    ],
  },
  {
    intro: "Keep portal access control independent of external document destinations.",
    fields: [
      ["Retention period", "documentRetention", "text", true],
      ["Classification / access", "accessRule", "text", true],
      ["Drive reference policy", "drivePolicy", "text", false],
    ],
  },
  {
    intro: "Define alerts, escalation and management review cadence.",
    fields: [
      ["Notification channels", "notificationChannels", "text", true],
      ["Escalation path", "escalation", "text", true],
      ["Review routine", "reviewRoutine", "text", true],
    ],
  },
  {
    intro: "Confirm acceptance evidence, training and human go-live approval.",
    fields: [
      ["User acceptance evidence", "uat", "text", true],
      ["Training plan", "training", "text", true],
      ["Go-live approver", "goLiveApprover", "text", true],
    ],
  },
] as const;
function Wizard({
  portal,
  onClose,
  onSave,
  onOpenAdministration,
  onLoadDemo,
  onResetDemo,
}: {
  portal: PortalState;
  onClose: () => void;
  onSave: (next: PortalState) => void;
  onOpenAdministration: () => void;
  onLoadDemo: () => void;
  onResetDemo: () => void;
}) {
  const [step, setStep] = useState(portal.setupStep);
  const [setup, setSetup] = useState(() => ({
    ...emptyPortal().setup,
    ...portal.setup,
    configuration: { ...emptyPortal().setup.configuration, ...(portal.setup?.configuration ?? {}) },
  }));
  const [error, setError] = useState("");
  const guide = wizardGuidance[step] ?? wizardGuidance[0];
  const complete = (index: number) => {
    const item = wizardGuidance[index] ?? wizardGuidance[0];
    return item.fields
      .filter((field) => field[3])
      .every((field) => {
        const key = field[1];
        const value =
          key in setup
            ? setup[key as keyof Omit<SetupState, "configuration">]
            : setup.configuration[key];
        return typeof value === "string" && value.trim().length > 0;
      });
  };
  const completed = setupSteps.filter((_, index) => complete(index)).length;
  const save = (nextStep = step) =>
    onSave({
      ...portal,
      setup: {
        ...portal.setup,
        ...setup,
        configuration: { ...portal.setup.configuration, ...setup.configuration },
      },
      setupStep: nextStep,
    });
  const setValue = (key: string, value: string) => {
    if (key in setup && key !== "configuration") setSetup({ ...setup, [key]: value });
    else setSetup({ ...setup, configuration: { ...setup.configuration, [key]: value } });
  };
  const next = () => {
    if (!complete(step)) return setError("Complete the required fields before continuing.");
    const target = Math.min(setupSteps.length - 1, step + 1);
    save(target);
    setError("");
    if (step < setupSteps.length - 1) setStep(target);
    else onClose();
  };
  return (
    <Modal title="Portal setup" onClose={onClose} wide>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase text-muted-foreground">
            Step {step + 1} of {setupSteps.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed}/{setupSteps.length} essentials configured
          </p>
        </div>
        <Action label="Open Administration" onClick={onOpenAdministration} />
      </div>
      <div className="mt-3 h-2 bg-panel-strong">
        <div
          className="h-full bg-steel"
          style={{ width: `${(completed / setupSteps.length) * 100}%` }}
        />
      </div>
      <div className="mt-5">
        <DemoDataPanel loaded={portal.demoLoaded} onLoad={onLoadDemo} onReset={onResetDemo} />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-[15rem_1fr]">
        <div className="grid grid-cols-2 gap-1 md:block">
          {setupSteps.map((name, index) => (
            <button
              key={name}
              onClick={() => {
                save();
                setStep(index);
                setError("");
              }}
              className={`w-full p-2 text-left text-xs ${index === step ? "bg-accent" : "text-muted-foreground"}`}
            >
              <span className="font-mono">{complete(index) ? "✓" : index + 1}.</span> {name}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div className="border border-border bg-panel p-4">
            <p className="font-semibold">{setupSteps[step]}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.intro}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {guide.fields.map(([label, key, kind, required]) =>
              key === "workingDays" ? (
                <SelectField
                  key={key}
                  label={`${label}${required ? " *" : ""}`}
                  value={setup.workingDays}
                  options={[
                    "Monday – Friday",
                    "Monday – Saturday",
                    "Monday – Sunday",
                    "Custom schedule",
                  ]}
                  onChange={(value) => setValue(key, value)}
                />
              ) : key === "timezone" ? (
                <SelectField
                  key={key}
                  label={`${label}${required ? " *" : ""}`}
                  value={setup.timezone}
                  options={["Asia/Kolkata", "UTC", "Custom time zone"]}
                  onChange={(value) => setValue(key, value)}
                />
              ) : (
                <TextField
                  key={key}
                  label={label}
                  value={
                    ((key in setup
                      ? setup[key as keyof SetupState]
                      : setup.configuration[key]) as string) ?? ""
                  }
                  onChange={(value) => setValue(key, value)}
                  required={required}
                />
              ),
            )}
          </div>
          {step === 0 && (
            <SetupMasterLinks portal={portal} onOpenAdministration={onOpenAdministration} />
          )}{" "}
          {step === 1 && (
            <SetupDepartmentLinks portal={portal} onOpenAdministration={onOpenAdministration} />
          )}{" "}
          {step === 4 && (
            <SetupMasterLinks portal={portal} onOpenAdministration={onOpenAdministration} />
          )}{" "}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-between border-t border-border pt-4">
        <Action
          label="Back"
          onClick={() => {
            save();
            setStep(Math.max(0, step - 1));
          }}
        />
        <div className="flex gap-2">
          <Action
            label="Save & resume"
            onClick={() => {
              save();
              onClose();
            }}
          />
          <Action
            label={step === setupSteps.length - 1 ? "Save go-live checklist" : "Save & continue"}
            onClick={next}
            primary
          />
        </div>
      </div>
    </Modal>
  );
}
function SetupMasterLinks({
  portal,
  onOpenAdministration,
}: {
  portal: PortalState;
  onOpenAdministration: () => void;
}) {
  const empty =
    portal.masters.locations.length === 0 ||
    portal.masters.parts.length === 0 ||
    portal.masters.suppliers.length === 0;
  return (
    <div className="border border-dashed border-border p-4 text-sm">
      <p className="font-semibold">Master lists</p>
      <p className="mt-1 text-muted-foreground">
        Locations, suppliers, parts, routes and controlled document types are managed in
        Administration.{" "}
        {empty
          ? "At least one list is currently empty."
          : "Current lists are available for record forms."}
      </p>
      <div className="mt-3">
        <Action label="Create / manage master lists" onClick={onOpenAdministration} />
      </div>
    </div>
  );
}
function SetupDepartmentLinks({
  portal,
  onOpenAdministration,
}: {
  portal: PortalState;
  onOpenAdministration: () => void;
}) {
  return (
    <div className="border border-dashed border-border p-4 text-sm">
      <p className="font-semibold">Departments & roles</p>
      <p className="mt-1 text-muted-foreground">
        {portal.departments.length
          ? `${portal.departments.length} departments and ${portal.roles.length} sub-roles are configured.`
          : "No departments are configured yet."}{" "}
        Create departments and role assignments in Administration.
      </p>
      <div className="mt-3">
        <Action label="Create / manage departments" onClick={onOpenAdministration} />
      </div>
    </div>
  );
}
function SharedIndex({
  records,
  documents,
  departments,
  departmentContext,
  onSelect,
  onSelectDocument,
}: {
  records: RecordItem[];
  documents: ControlledDocument[];
  departments: Department[];
  departmentContext: string | null;
  onSelect: (record: RecordItem) => void;
  onSelectDocument: (document: ControlledDocument) => void;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [department, setDepartment] = useState(departmentContext ?? "All departments");
  const allowedDepartments = departmentContext
    ? departments.filter((item) => item.id === departmentContext)
    : departments;
  const matches = (value: string) => value.toLowerCase().includes(query.toLowerCase());
  const matchingRecordKind = (record: RecordItem) =>
    kind === "All" ||
    (kind === "Clients" && record.area === "sales") ||
    (kind === "Projects" && record.area === "rnd") ||
    (kind === "Audits" && /audit|inspection|ncr|capa|review/i.test(record.type));
  const scopedRecords = records.filter(
    (record) =>
      (department === "All departments" || record.departmentId === department) &&
      matches(`${record.reference} ${record.title} ${record.type} ${record.notes}`) &&
      matchingRecordKind(record),
  );
  const scopedDocuments = documents.filter(
    (document) =>
      (department === "All departments" || document.departmentId === department) &&
      matches(
        `${document.title} ${document.type} ${document.group ?? ""} ${document.device ?? ""} ${document.part ?? ""}`,
      ) &&
      (kind === "All" || kind === "Documents"),
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_13rem]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, projects, audits or documents"
          className="h-11 border border-input bg-background px-3 text-sm"
        />
        <select
          aria-label="Index type"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="h-11 border border-input bg-background px-3 text-sm"
        >
          <option>All</option>
          <option>Clients</option>
          <option>Projects</option>
          <option>Audits</option>
          <option>Documents</option>
        </select>
        <select
          aria-label="Index department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className="h-11 border border-input bg-background px-3 text-sm"
        >
          {!departmentContext && <option>All departments</option>}
          {allowedDepartments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="border border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3 border-b border-border px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">
          <span>Record</span>
          <span>Owner</span>
        </div>
        {scopedRecords.map((record) => (
          <button
            key={record.id}
            onClick={() => onSelect(record)}
            className="grid w-full grid-cols-[minmax(0,1fr)_7rem] gap-3 border-b border-border px-4 py-3 text-left last:border-0"
          >
            <span>
              <strong className="block text-sm">{record.title}</strong>
              <small className="font-mono text-muted-foreground">
                {record.reference} · {record.type}
              </small>
            </span>
            <small className="text-xs text-muted-foreground">
              {departments.find((item) => item.id === record.departmentId)?.code ?? "—"}
            </small>
          </button>
        ))}
        {scopedDocuments.map((document) => (
          <button
            key={document.id}
            onClick={() => onSelectDocument(document)}
            className="grid w-full grid-cols-[minmax(0,1fr)_7rem] gap-3 border-b border-border px-4 py-3 text-left last:border-0"
          >
            <span>
              <strong className="block text-sm">{document.title}</strong>
              <small className="font-mono text-muted-foreground">
                {document.type} · {document.revision ?? "Unrevised"}
              </small>
            </span>
            <small className="text-xs text-muted-foreground">
              {departments.find((item) => item.id === document.departmentId)?.code ?? "—"}
            </small>
          </button>
        ))}
        {!scopedRecords.length && !scopedDocuments.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No access-checked results match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
function PMSSWorkspace({
  portal,
  project,
  projects,
  selectedProjectId,
  onSelectProject,
  onBack,
  onUpdate,
  onLog,
}: {
  portal: PortalState;
  project: RecordItem | undefined;
  projects: RecordItem[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onBack: () => void;
  onUpdate: (patch: Record<string, string>) => void;
  onLog: (action: string, detail: string) => void;
}) {
  const config = portal.setup.configuration;
  const [amendment, setAmendment] = useState(config["pmssStatus"] === "Under Amendment");
  const fields = [
    ["Nominal voltage", project?.fields["voltage"] ?? config["pmssVoltage"] ?? "12V / 24V"],
    ["Operating temperature", project?.fields["temperature"] ?? config["pmssTemperature"] ?? "-40°C to +85°C"],
    ["Enclosure rating", project?.fields["enclosure"] ?? config["pmssIp"] ?? "IP67 / IP68"],
    ["Target BOM", project?.fields["actualBom"] ?? config["pmssActualBom"] ?? "Not set"],
  ];
  const trigger = () => {
    setAmendment(true);
    onUpdate({
      pmssStatus: "Under Amendment",
      pmssGate: "Lifecycle gates held pending human scope review",
    });
    onLog(
      "PMSS scope-change trigger",
      "Loop 1 triggered: PMSS marked Under Amendment; subsequent phase gates are held.",
    );
  };
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </button>
      <PageHeader
        eyebrow="Project master spec sheet · SSOT"
        title="PMSS control"
        description="The shared project baseline for engineering, compliance and lifecycle gate decisions."
        actions={<Action onClick={trigger} label="Trigger scope change" primary />}
      />
      <label className="mb-5 block max-w-xl text-sm font-medium">
        Active project
        <select
          value={selectedProjectId}
          onChange={(event) => onSelectProject(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          {projects.map((item) => (
            <option key={item.id} value={item.reference}>
              {item.reference} · {item.title.replace(/^DEMO · /, "")}
            </option>
          ))}
        </select>
      </label>
      <section className="surface-card border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">PMSS status</p>
            <p className="mt-1 font-semibold">
              {amendment ? "Under Amendment" : project?.fields["currentStage"] ?? "Controlled baseline"}
            </p>
          </div>
          <Status status={amendment ? "In review" : "Approved"} />
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-panel p-4">
              <dt className="font-mono text-[10px] uppercase tracking-[.08em] text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-muted-foreground">
          Loop 1 controls customer scope amendments. A human review is required before any lifecycle
          gate can advance after the PMSS is marked Under Amendment.
        </p>
      </section>
    </>
  );
}

function IndexWorkspace({
  records,
  documents,
  departments,
  departmentContext,
  onBack,
  onSelect,
  onSelectDocument,
}: {
  records: RecordItem[];
  documents: ControlledDocument[];
  departments: Department[];
  departmentContext: string | null;
  onBack: () => void;
  onSelect: (record: RecordItem) => void;
  onSelectDocument: (document: ControlledDocument) => void;
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel"
      >
        <ArrowLeft className="size-4" />
        Back to workspace
      </button>
      <PageHeader
        eyebrow="Access-checked shared view"
        title="Unified index"
        description="Find clients, projects, department audit records and controlled documents without leaving the page."
        actions={null}
      />
      <section className="border border-border bg-panel p-4 md:p-5">
        <SharedIndex
          records={records}
          documents={documents}
          departments={departments}
          departmentContext={departmentContext}
          onSelect={onSelect}
          onSelectDocument={onSelectDocument}
        />
      </section>
    </>
  );
}
function DemoMarker() {
  return (
    <div className="mb-5 flex items-center justify-between border border-warning bg-panel px-4 py-3 text-sm">
      <span>
        <strong>DEMO DATA ONLY</strong>
        <span className="ml-2 text-muted-foreground">
          Fictional records, names and approvals for authorized testing.
        </span>
      </span>
    </div>
  );
}
function DemoDataPanel({
  loaded,
  onLoad,
  onReset,
}: {
  loaded: boolean;
  onLoad: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <DemoMarker />
      <div className="border border-border bg-panel p-4">
        <h3 className="font-semibold">Authorized demo workspace</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Loads the complete DEMO setup and DEMO-AIS140-OBD-01 tracker lifecycle: fictional
          requirement, design, sourcing, material kit, serialised prototype units, test, NCR/CAPA,
          pending human quality release, dispatch hold and a controlled client-update draft. All
          technical values are illustrative and NOT VALIDATED. Loading is idempotent and keeps a
          private browser-local snapshot of the real setup; Remove demo setup restores that snapshot
          without treating demo identities as authenticated users.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {loaded ? (
            <Action label="Reload demo setup" onClick={onLoad} />
          ) : (
            <Action label="Load demo setup" onClick={onLoad} primary />
          )}
          {loaded && <Action label="Remove demo setup & restore real setup" onClick={onReset} />}
        </div>
      </div>
      <div className="border border-border p-4 text-sm">
        <p className="font-semibold">Protected decision check</p>
        <p className="mt-2 leading-6 text-muted-foreground">
          Quality release and financial commitment examples remain pending and require a human
          decision. The demo does not auto-approve, release, send client data, move stock, or make
          financial decisions.
        </p>
      </div>
    </div>
  );
}
function HistoryPanel({ audit, onClose }: { audit: AuditEvent[]; onClose: () => void }) {
  return (
    <Modal title="History" onClose={onClose}>
      {audit.length ? (
        audit.map((event) => (
          <div key={event.id} className="border-b border-border py-3">
            <p className="font-semibold">{event.action}</p>
            <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{event.at}</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No delegated or administrative actions recorded yet.
        </p>
      )}
    </Modal>
  );
}
function ApprovalsPanel({
  approvals,
  onClose,
}: {
  approvals: PortalState["approvals"];
  onClose: () => void;
}) {
  return (
    <Modal title="Human approvals" onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">
        Automation cannot approve controlled operations.
      </p>
      {approvals.length ? (
        approvals.map((approval) => (
          <p key={approval.id} className="border-b border-border py-3">
            {approval.title}
          </p>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No approvals are awaiting a human decision.
        </p>
      )}
    </Modal>
  );
}
function DocumentsPanel({
  documents,
  departments,
  departmentContext,
  onClose,
  onSelectDocument,
  onUploadDocument,
  onOpenDraftHub,
  templateBodies,
  onTemplateBodiesChange,
}: {
  documents: ControlledDocument[];
  departments: Department[];
  departmentContext: string | null;
  onClose: () => void;
  onSelectDocument: (document: ControlledDocument) => void;
  onUploadDocument: (document: ControlledDocument) => void;
  onOpenDraftHub: () => void;
  templateBodies: Record<string, string>;
  onTemplateBodiesChange: (templates: Record<string, string>) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All groups");
  const [phase, setPhase] = useState("All phases");
  const [tab, setTab] = useState<"repository" | "drive">("repository");
  const groups = [
    "Governance/QMS",
    "Product/Device Audit Packs",
    "Supplier Quality/IQC",
    "Calibration/Laboratory",
    "01_Governance_and_QMS",
    "02_Product_Platforms/Automotive_Devices",
    "03_Supplier_Quality_and_PPAP",
    "04_Equipment_and_Calibration",
  ];
  const phases = automotivePhases.map(([phaseName, codes]) => `${phaseName} · ${codes}`);
  const visible = documents.filter(
    (document) =>
      (!departmentContext || document.departmentId === departmentContext) &&
      (group === "All groups" || document.group === group) &&
      (phase === "All phases" || document.phase === phase) &&
      `${document.title} ${document.type} ${document.device ?? ""} ${document.part ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Modal title="Controlled document repository" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><Action label="Document repository" primary={tab === "repository"} onClick={() => setTab("repository")} /><Action label="Drive & Cloud storage" primary={tab === "drive"} onClick={() => setTab("drive")} /></div><Action label="Auto-Draft Document Templates" primary onClick={onOpenDraftHub} /></div>
      <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-moss/25 bg-accent px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-accent-foreground">
            Lovable Cloud storage active
          </p>
          <p className="mt-1 text-xs text-accent-foreground/80">
            Private, department-authorized files use signed access. Google Drive is optional and not
            connected.
          </p>
        </div>
        <span className="rounded-md border border-moss/25 bg-card px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.06em] text-moss">
          Private Cloud storage
        </span>
      </section>
      {tab === "drive" && <HardwareDeliverablesDrive documents={documents} departments={departments} departmentContext={departmentContext} onSelectDocument={onSelectDocument} />}
      {tab === "repository" && <><section className="ops-section mb-6 overflow-hidden bg-panel">
        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-steel">
            Canonical repository path
          </p>
          <p className="mt-1 font-mono text-xs text-foreground">{automotiveRepositoryRoot}</p>
        </div>
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {automotiveRepositoryGroups.map((item) => (
            <div key={item.path} className="p-3">
              <p className="font-mono text-[10px] text-steel">{item.path}</p>
              <p className="mt-1 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.artifacts}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3">
          <p className="font-mono text-[10px] text-steel">
            02_Product_Platforms/Automotive_Devices
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            DEMO platform only · IATF is a record-control goal, not a certification claim.
          </p>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search document, device or part"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <select
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option>All groups</option>
          {groups.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={phase}
          onChange={(event) => setPhase(event.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option>All phases</option>
          {phases.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="ops-section mt-4 overflow-hidden">
        {visible.length ? (
          visible.map((document) => (
            <div
              key={document.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border px-4 py-2.5 last:border-0"
            >
              <button onClick={() => onSelectDocument(document)} className="min-w-0 text-left">
                <span>
                  <strong className="block">{document.title}</strong>
                  <small className="mt-1 block text-muted-foreground">
                    {document.group ?? "Unclassified"} · {document.device ?? "No device"} ·{" "}
                    {document.part ?? "No part"} · Rev {document.revision ?? "—"}
                  </small>
                  <small className="mt-1 block font-mono text-[10px] uppercase tracking-[.06em] text-steel">
                    {document.cloudDocumentId
                      ? "Private files enabled"
                      : "Link to organization to enable files"}
                  </small>
                </span>
              </button>
              <div className="flex flex-col items-end gap-2">
                <Status status={automotiveDocumentStatus(document.lifecycle)} />
                <button
                  aria-label={`Upload document for ${document.title}`}
                  onClick={() => onUploadDocument(document)}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-steel transition-colors hover:border-ring/50 hover:bg-secondary"
                  title="Open file upload and revision history"
                >
                  <Upload className="size-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No controlled documents match this repository view.
          </p>
        )}
      </div>
      <section className="mt-5 overflow-hidden rounded-lg border border-border bg-panel">
        <div className="border-b border-border px-4 py-3">
          <p className="font-semibold">Platform phase mapping</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Path template for Automotive_Devices · DEMO only
          </p>
        </div>
        <div className="divide-y divide-border">
          {automotivePhases.map(([phaseName, codes, artifacts]) => (
            <div
              key={phaseName}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(15rem,1fr)] sm:items-center sm:gap-3"
            >
              <span className="font-mono text-xs text-foreground">{phaseName}</span>
              <span className="font-mono text-xs text-steel">{codes}</span>
              <span className="text-xs leading-5 text-muted-foreground">{artifacts}</span>
            </div>
          ))}
        </div>
      </section>
      </>}
    </Modal>
  );
}

const driveFolders = [
  ["00_Root_Audit_Repository", "Controlled project evidence and release history"],
  ["01_Governance_and_QMS", "SORs, NDAs, quotations and invoices"],
  ["02_Product_Platforms", "Device specifications and PMSS baselines"],
  ["03_Hardware_Deliverables_ECAD", "Schematic PDFs, PCB sources, Gerber ZIPs and BOMs"],
  ["04_Mechanical_Deliverables_MCAD", "3D STEP models, CAD bundles and 2D drawings"],
  ["05_Firmware_and_Software", "Firmware binaries, release notes and flashing packages"],
  ["06_Quality_and_Compliance", "DVP&R, AIS-140 and laboratory evidence"],
  ["07_Production_and_Testing", "Control plans, PDI logs and EOL calibration"],
] as const;

function driveFolderFor(document: ControlledDocument) {
  if (/schematic|gerber|pcb|bom|dfmea/i.test(`${document.title} ${document.type}`)) return "03_Hardware_Deliverables_ECAD";
  if (/step|cad|enclosure|mechanical/i.test(`${document.title} ${document.type}`)) return "04_Mechanical_Deliverables_MCAD";
  if (/firmware|binary|hsi|software/i.test(`${document.title} ${document.type}`)) return "05_Firmware_and_Software";
  if (/dvp|quality|ppap|audit|certificate/i.test(`${document.title} ${document.type}`)) return "06_Quality_and_Compliance";
  if (/control plan|pdi|eol|production|manufactur/i.test(`${document.title} ${document.type}`)) return "07_Production_and_Testing";
  if (/sor|nda|quotation|invoice|contract/i.test(`${document.title} ${document.type}`)) return "01_Governance_and_QMS";
  return "02_Product_Platforms";
}

function HardwareDeliverablesDrive({ documents, departments, departmentContext, onSelectDocument }: { documents: ControlledDocument[]; departments: Department[]; departmentContext: string | null; onSelectDocument: (document: ControlledDocument) => void }) {
  const [folder, setFolder] = useState("00_Root_Audit_Repository");
  const [query, setQuery] = useState("");
  const canSee = (document: ControlledDocument) => !departmentContext || document.departmentId === departmentContext;
  const visible = documents.filter((document) => canSee(document) && `${document.title} ${document.type} ${document.part ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (folder === "00_Root_Audit_Repository" || driveFolderFor(document) === folder));
  const fileCount = (document: ControlledDocument) => document.localFiles?.length ?? 0;
  return <section className="space-y-5"><section className="ops-section overflow-hidden"><div className="ops-section-header flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Hardware Deliverables Drive</p><p className="mt-1 text-xs text-muted-foreground">Private Cloud storage is active. Google Drive remains optional; folders are logical project paths.</p></div><span className="rounded-md border border-moss/25 bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase text-accent-foreground">Cloud active</span></div><div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">{driveFolders.map(([name, detail]) => <button key={name} onClick={() => setFolder(name)} className={`p-3 text-left transition-colors ${folder === name ? "bg-accent" : "hover:bg-secondary"}`}><span className="flex items-center gap-2 font-mono text-xs text-steel"><FolderOpen className="size-4" />/{name}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></button>)}</div></section><section className="ops-section overflow-hidden"><div className="ops-section-header flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.1em] text-steel">/{folder}</p><p className="mt-1 text-sm font-semibold">Project artifact register</p></div><input aria-label="Search deliverables" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files or document ID" className="h-9 rounded-lg border border-input bg-background px-3 text-sm" /></div><div className="divide-y divide-border">{visible.length ? visible.map((document) => <button key={document.id} onClick={() => onSelectDocument(document)} className="grid w-full gap-3 px-4 py-3 text-left hover:bg-secondary sm:grid-cols-[minmax(0,1fr)_auto]"><span className="min-w-0"><strong className="block text-sm">{document.title}</strong><small className="mt-1 block font-mono text-[10px] text-muted-foreground">{document.part ?? document.type} · Rev {document.revision ?? "—"} · {document.deliverableKind ?? "Controlled document"}</small><small className="mt-1 block text-xs text-muted-foreground">{fileCount(document)} file revision{fileCount(document) === 1 ? "" : "s"} · {departments.find((department) => department.id === document.departmentId)?.name ?? "Unassigned"}</small></span><span className="self-center text-xs font-semibold text-steel">Open</span></button>) : <p className="p-8 text-center text-sm text-muted-foreground">No authorized deliverables in this folder.</p>}</div></section></section>;
}
function DocumentDetail({
  document,
  departments,
  records,
  departmentContext,
  onClose,
  onDocumentUpdated,
  onSelectRecord,
  onOpenPrintable,
  previewOnly = false,
}: {
  document: ControlledDocument;
  departments: Department[];
  records: RecordItem[];
  departmentContext: string | null;
  onClose: () => void;
  onDocumentUpdated: (document: ControlledDocument, event: string) => void;
  onSelectRecord: (record: RecordItem) => void;
  onOpenPrintable: (document: PrintableDocument) => void;
  previewOnly?: boolean;
}) {
  const owner = departments.find((item) => item.id === document.departmentId);
  const allowed = !departmentContext || document.departmentId === departmentContext;
  const references = records.filter(
    (record) =>
      document.linkedRecordRefs?.includes(record.reference) &&
      (!departmentContext || record.departmentId === departmentContext),
  );
  const listFiles = useServerFn(listControlledDocumentFiles);
  const beginUpload = useServerFn(beginControlledDocumentUpload);
  const finishUpload = useServerFn(completeControlledDocumentUpload);
  const getDownload = useServerFn(getControlledDocumentDownload);
  const [files, setFiles] = useState<ControlledFile[]>([]);
  const [fileState, setFileState] = useState<"idle" | "loading" | "uploading" | "error">("idle");
  const [fileMessage, setFileMessage] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<LocalControlledFile | null>(null);
  const isCloudDocument = Boolean(document.cloudDocumentId);
  const isHardwareDeliverable = /schematic|gerber|pcb|step|cad/i.test(`${document.title} ${document.type}`);
  const localFiles = document.localFiles ?? [];
  useEffect(() => {
    if (!document.cloudDocumentId || !allowed) {
      setFiles([]);
      return;
    }
    setFileState("loading");
    listFiles({ data: { documentId: document.cloudDocumentId } })
      .then((result) => {
        setFiles(result);
        setFileState("idle");
      })
      .catch(() => {
        setFileState("error");
        setFileMessage(
          "Secure file history is available after this document is linked to your signed-in organization.",
        );
      });
  }, [allowed, document.cloudDocumentId, listFiles]);
  const sha256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };
  const formatBytes = (size: number) =>
    size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  const formatLabel = (file: Pick<LocalControlledFile, "name" | "type">) => {
    const extension = file.name.split(".").pop()?.toUpperCase();
    if (extension === "STP" || extension === "STEP") return "CAD STEP";
    if (extension === "ZIP") return "GERBER ZIP";
    return extension || file.type.split("/").pop()?.toUpperCase() || "FILE";
  };
  const readLocalFile = (file: File) =>
    new Promise<LocalControlledFile>((resolve, reject) => {
      const reader = new FileReader();
      const textLike = /^(text\/|application\/(json|csv))/.test(file.type) || /\.(json|csv|txt|log|md)$/i.test(file.name);
      reader.onerror = () => reject(new Error("The selected file could not be read."));
      reader.onload = () => resolve({
        id: createId(), name: file.name, type: file.type || "application/octet-stream", size: file.size,
        uploadedAt: new Date().toISOString(), uploader: `${owner?.lead ?? "Current user"} · ${owner?.name ?? "Controlled documents"}`,
        revision: document.revision ?? "00", content: String(reader.result ?? ""), encoding: textLike ? "text" : "data-url",
      });
      if (textLike) reader.readAsText(file); else reader.readAsDataURL(file);
    });
  const uploadLocal = async (file: File, incrementRevision = false) => {
    try {
      setFileState("uploading"); setUploadProgress(4); setFileMessage("Securing & Verifying SHA-256 Hash…");
      await sha256(file); setUploadProgress(40);
      const attached = await readLocalFile(file); setUploadProgress(76);
      const revision = incrementRevision ? String((Number.parseInt(document.revision ?? "0", 10) || 0) + 1).padStart(2, "0") : document.revision ?? "00";
      const updatedFile = { ...attached, revision };
      window.setTimeout(() => { setUploadProgress(100); setFileState("idle"); }, 220);
      const next = {
        ...document, revision,
        localFiles: [...localFiles, updatedFile],
        history: [`${now()} · ${updatedFile.name} attached locally · Rev ${revision} · ${updatedFile.uploader}`, ...(document.history ?? [])],
      };
      onDocumentUpdated(next, `${document.title} · ${updatedFile.name} attached locally for DEMO/browser session`);
      setFileMessage("File Attached & Verified (Private Storage Ready)"); setFileInputKey((value) => value + 1);
    } catch (error) { setFileState("error"); setUploadProgress(0); setFileMessage(error instanceof Error ? error.message : "Attachment could not be completed."); }
  };
  const upload = async (file: File) => {
    if (!document.cloudDocumentId) {
      setFileState("error");
      setFileMessage("Link this controlled document to your organization before uploading.");
      return;
    }
    try {
      setFileState("uploading");
      setUploadProgress(12);
      setFileMessage("Preparing secure upload…");
      const checksum = await sha256(file);
      setUploadProgress(32);
      const result = await beginUpload({
        data: {
          documentId: document.cloudDocumentId,
          revision: document.revision ?? "Unrevised",
          name: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          checksum,
        },
      });
      if (result.duplicate) {
        setUploadProgress(100);
        setFileMessage("This exact revision already exists; no duplicate file was created.");
      } else if (result.signedUploadUrl) {
        setUploadProgress(55);
        const response = await fetch(result.signedUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!response.ok) throw new Error("The secure upload did not complete.");
        setUploadProgress(82);
        await finishUpload({ data: { fileId: result.file.id } });
        setUploadProgress(100);
        setFileMessage("File stored privately in Lovable Cloud.");
      }
      const refreshed = await listFiles({ data: { documentId: document.cloudDocumentId } });
      setFiles(refreshed);
      const next = {
        ...document,
        history: [
          `${now()} · Private Lovable Cloud file ${file.name} registered`,
          ...(document.history ?? []),
        ],
      };
      onDocumentUpdated(
        next,
        `${document.title} · ${file.name} registered in private Cloud storage`,
      );
      setFileState("idle");
      setFileInputKey((value) => value + 1);
    } catch (error) {
      setFileState("error");
      setUploadProgress(0);
      setFileMessage(
        error instanceof Error ? error.message : "Secure upload could not be completed.",
      );
    }
  };
  const download = async (file: ControlledFile) => {
    try {
      const result = await getDownload({ data: { fileId: file.id } });
      window.open(result.url, "_blank", "noopener,noreferrer");
      setFileMessage(
        `Secure download opened; access expires in ${result.expiresInSeconds} seconds.`,
      );
    } catch (error) {
      setFileState("error");
      setFileMessage(error instanceof Error ? error.message : "Secure download is unavailable.");
    }
  };
  return (
    <Modal title="Controlled document detail" onClose={onClose} wide>
      {allowed ? (
        <>
          <p className="font-mono text-[10px] uppercase text-muted-foreground">
            Department-owned controlled document
          </p>
          <h3 className="mt-2 text-xl font-semibold">{document.title}</h3>
           <div className="mt-4 flex flex-wrap gap-2"><Action label="Open complete document" primary onClick={() => onOpenPrintable(controlledDocumentPrintable(document, owner?.code.replace(/^DEMO-/, "") ?? "QA"))} /></div>
          <section className="mt-5 overflow-hidden border border-border bg-panel">
            <div className="grid gap-px bg-border sm:grid-cols-3">
              <DocumentField label="Document ID" value={document.type} />
              <DocumentField label="Revision" value={document.revision ?? "Unrevised"} />
              <DocumentField label="Issue date" value={document.effectiveDate ?? "DEMO issue date"} />
            </div>
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-steel">Controlled record preview</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {document.device ? `DEMO ${document.device} controlled record. ` : "Controlled record. "}
                The preview is illustrative only and does not represent a signed, released or externally shared document.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[document.classification ?? "Internal", document.lifecycle ?? "Draft", document.phase ?? "Unmapped"].map((tag) => <span key={tag} className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium">{tag}</span>)}
              </div>
              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                <DocumentField label="Author" value="DEMO record author" />
                <DocumentField label="Reviewer" value="DEMO technical reviewer" />
                <DocumentField label="Approver" value={document.approver ?? "Human approval required"} />
              </div>
            </div>
          </section>
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DocumentField label="Owner" value={owner?.name ?? "Department not assigned"} />
            <DocumentField label="Group" value={document.group ?? "Unclassified"} />
            <DocumentField label="Device" value={document.device ?? "Not set"} />
            <DocumentField
              label="Part / revision"
              value={`${document.part ?? "Not set"} · Rev ${document.revision ?? "—"}`}
            />
            <DocumentField label="Phase" value={document.phase ?? "Not set"} />
            <DocumentField label="Status" value={document.lifecycle ?? "Draft"} />
            <DocumentField label="Effective date" value={document.effectiveDate ?? "Not set"} />
            <DocumentField
              label="Approver"
              value={document.approver ?? "Human approval required"}
            />
            <DocumentField label="Classification" value={document.classification ?? "Internal"} />
            <DocumentField
              label="Access"
              value="Department-owned · internal by default · no external sharing"
            />
          </section>
          <section className="mt-6 overflow-hidden rounded-lg border border-border bg-panel">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
              <div>
                <p className="font-semibold">Private file storage</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lovable Cloud is the active backend. Google Drive is optional and not connected.
                </p>
              </div>
              <Status status={isCloudDocument ? "Approved" : "Draft"} />
            </div>
            <div className="p-4">
              {isHardwareDeliverable && <section className="mb-4 rounded-lg border border-steel/35 bg-accent p-3"><p className="font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-steel">Hardware engineering deliverable</p><p className="mt-1 text-sm font-semibold">{document.title.includes("Gerber") ? "Gerber & PCB release · ZIP archive" : document.title.includes("STEP") || document.title.includes("CAD") ? "3D STEP enclosure · ZIP package" : "Schematic package · PDF deliverable"}</p><p className="mt-1 text-xs text-muted-foreground">Include revision notes and designer attribution with each verified release package. Human approval remains required.</p></section>}
              <div
                onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => { event.preventDefault(); setDragActive(false); const file = event.dataTransfer.files?.[0]; if (file) void (isCloudDocument ? upload(file) : uploadLocal(file)); }}
                className={`rounded-lg border border-dashed p-4 transition-colors ${dragActive ? "border-steel bg-secondary" : "border-border bg-card"}`}
              >
              {isCloudDocument ? (
                <>
                  <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-card px-3.5 text-sm font-semibold transition-colors hover:border-ring/50 hover:bg-secondary">
                    {fileState === "uploading" ? "Uploading securely…" : "Upload private revision"}
                    <input
                      key={fileInputKey}
                      className="sr-only"
                      type="file"
                      accept={isHardwareDeliverable ? ".pdf,.zip,.step,.stp" : undefined}
                      disabled={fileState === "uploading"}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void upload(file);
                      }}
                    />
                  </label>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Drop a file here or browse · {isHardwareDeliverable ? "PDF, Gerber ZIP, or STEP/STP release package · " : ""}Private, department-authorized storage · maximum 25 MB · duplicate revisions are safely detected.
                  </p>
                  {fileState === "uploading" && (
                    <div className="mt-3" aria-live="polite">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Securing & Verifying SHA-256 Hash… {uploadProgress}%
                      </p>
                    </div>
                  )}
                  {fileMessage && (
                    <p
                      className={`mt-3 text-sm ${fileState === "error" ? "text-danger" : "text-muted-foreground"}`}
                    >
                      {fileMessage}
                    </p>
                  )}
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
                    {fileState === "loading" ? (
                      <p className="p-4 text-sm text-muted-foreground">
                        Loading secure file history…
                      </p>
                    ) : files.length ? (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold">{file.original_name}</p>
                            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                              Rev {file.revision} · {Math.ceil(file.size_bytes / 1024)} KB ·{" "}
                              {file.uploaded_at}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{file.audit_note}</p>
                          </div>
                          <Action label="Secure download" onClick={() => void download(file)} />
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground">
                        No private file revisions have been uploaded.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-background px-3.5 text-sm font-semibold transition-colors hover:border-ring/50 hover:bg-secondary">
                    <Upload className="mr-2 size-4" /> Upload / Attach File
                    <input
                      key={fileInputKey}
                      className="sr-only"
                      type="file"
                      accept={isHardwareDeliverable ? ".pdf,.zip,.step,.stp" : ".pdf,.docx,.xlsx,.step,.stp,.zip,.json,.csv,.txt"}
                      disabled={fileState === "uploading"}
                      onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLocal(file); }}
                    />
                  </label>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {isHardwareDeliverable ? "Attach the PDF schematic, Gerber ZIP, or STEP/STP CAD package. " : "Drop PDF, DOCX, XLSX, STEP/STP, Gerber ZIP, JSON, or CSV here. "}Attachments persist in this browser session; secure Cloud transfer activates automatically when this document is organization-linked.
                  </p>
                  {fileState === "uploading" && <div className="mt-3" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-1 text-xs text-muted-foreground">Securing & Verifying SHA-256 Hash… {uploadProgress}%</p></div>}
                  {fileMessage && <p className={`mt-3 text-sm ${fileState === "error" ? "text-danger" : "text-moss"}`}>{fileMessage}</p>}
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-background">
                    {localFiles.length ? localFiles.map((file) => <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-semibold">{file.name}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatBytes(file.size)} · {formatLabel(file)} · Rev {file.revision} · {file.uploadedAt}</p><p className="mt-1 text-xs text-muted-foreground">Uploaded by {file.uploader}</p></div><div className="flex flex-wrap gap-2"><Action label="View / Preview" onClick={() => setPreviewFile(file)} /><Action label="Download file" onClick={() => { const anchor = window.document.createElement("a"); anchor.href = file.encoding === "text" ? URL.createObjectURL(new Blob([file.content], { type: file.type })) : file.content; anchor.download = file.name; anchor.click(); if (file.encoding === "text") window.setTimeout(() => URL.revokeObjectURL(anchor.href), 0); }} /><label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-card px-3.5 text-sm font-semibold"><span>Replace / New Revision</span><input className="sr-only" type="file" accept=".pdf,.docx,.xlsx,.step,.stp,.zip,.json,.csv,.txt" onChange={(event) => { const replacement = event.target.files?.[0]; if (replacement) void uploadLocal(replacement, true); }} /></label></div></div>) : <p className="p-4 text-sm text-muted-foreground">No browser-local attachments yet.</p>}
                  </div>
                </>
              )}
              </div>
            </div>
          </section>
          <section className="mt-6 border-t border-border pt-5">
            <p className="font-semibold">Document history</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {document.history?.length ? (
                document.history.map((event) => <p key={event}>{event}</p>)
              ) : (
                <p>No controlled history has been recorded.</p>
              )}
            </div>
          </section>
          <section className="mt-6 border-t border-border pt-5">
            <p className="font-semibold">Access-controlled references</p>
            <div className="mt-3 space-y-2">
              {references.length ? (
                references.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="block w-full border-b border-border py-3 text-left last:border-0"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {record.reference} · {record.type}
                    </span>
                    <strong className="mt-1 block text-sm">{record.title}</strong>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No linked records are available in this department context.
                </p>
              )}
            </div>
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This controlled document is not available in the active department context.
        </p>
      )}
      {previewFile && <FilePreview file={previewFile} formatLabel={formatLabel} onClose={() => setPreviewFile(null)} />}
    </Modal>
  );
}
function FilePreview({ file, formatLabel, onClose }: { file: LocalControlledFile; formatLabel: (file: LocalControlledFile) => string; onClose: () => void }) {
  const text = file.encoding === "text" ? file.content : "Binary technical file preview is not available in-browser.";
  return <Modal title={`Preview · ${file.name}`} onClose={onClose} wide><div className="mb-4 flex flex-wrap gap-2"><span className="rounded border border-steel/35 bg-secondary px-2 py-1 font-mono text-xs text-steel">{formatLabel(file)}</span><span className="rounded border border-border bg-panel px-2 py-1 font-mono text-xs">Rev {file.revision}</span></div>{file.type === "application/pdf" && file.encoding === "data-url" ? <iframe title={file.name} src={file.content} className="h-[55vh] w-full border border-border" /> : <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap border border-border bg-panel p-4 font-mono text-xs leading-6 text-foreground">{text}</pre>}</Modal>;
}
type PrintableDocument = {
  title: string;
  documentId: string;
  department: string;
  revision: string;
  status: RecordStatus;
  project: string;
  stage: string;
};

function createPrintableDocument(template: readonly [string, string, string], settings: TemplateSettings, project = "HLPL-AI4T-01"): PrintableDocument {
  const type = template[0].includes("SOR") ? "SOR" : template[0].includes("Requirement") ? "PRS" : template[0].includes("DVP") ? "DVP" : template[1].split("-").at(-2) ?? "DOC";
  const department = template[2] === "HR/OPS" ? "HR" : template[2];
  const stage = autoDraftStage(template[0]);
  return { title: template[0].toUpperCase(), documentId: documentNumber(project, department, type, "01", settings.prefix), department, revision: "Rev 01", status: "Draft", project, stage };
}

function controlledDocumentPrintable(document: ControlledDocument, department: string): PrintableDocument {
  const inferredProject = document.type.includes("SLCT") || document.title.includes("SLCT") ? "HLPL-SLCT-01" : document.type.includes("XLINK") || document.title.includes("XLINK") ? "HLPL-XLINK-03" : "HLPL-AI4T-01";
  return { title: document.title.toUpperCase(), documentId: document.type || document.title, department, revision: `Rev ${document.revision ?? "01"}`, status: document.lifecycle === "Approved" ? "Approved" : document.lifecycle === "In review" ? "In review" : "Draft", project: inferredProject, stage: autoDraftStage(`${document.title} ${document.type}`) };
}

function recordPrintable(record: RecordItem): PrintableDocument {
  const documentId = record.reference || record.fields["controlledNumber"] || `HLPL-AI4T-${record.area.toUpperCase()}-DOC-01`;
  const project = documentId.includes("SLCT") ? "HLPL-SLCT-01" : documentId.includes("XLINK") ? "HLPL-XLINK-03" : "HLPL-AI4T-01";
  const department = record.area === "ehw" ? "EHW" : record.area === "esw" ? "ESW" : record.area === "mech" ? "MECH" : record.area === "pur" ? "PUR" : record.area === "quality" ? "QA" : record.area === "emf" ? "EMF" : record.area === "tst" || record.area === "production" ? "TST" : record.area === "fin" ? "FIN" : record.area === "sit" ? "SIT" : record.area === "hrops" || record.area === "people" ? "HR" : "SAL";
  return { title: record.title.toUpperCase(), documentId, department, revision: "Rev 01", status: record.status, project, stage: autoDraftStage(`${record.type} ${record.title} ${documentId}`) };
}

function autoDraftStage(title: string) {
  if (title.includes("SOR") || title.includes("NDA")) return "Stage 1";
  if (title.includes("Contract Review")) return "Stage 2";
  if (title.includes("Requirement") || title.includes("Quotation")) return "Stage 3";
  if (title.includes("BOM")) return "Stage 4";
  if (title.includes("Control Plan")) return "Stage 5";
  if (title.includes("DVP")) return "Stage 6";
  if (title.includes("DFMEA")) return "Stage 7";
  return "Stage 9";
}

function stageDocumentContent(stage: string, title: string, profile: ProjectDocumentProfile) {
  const base = {
    intent: `Controlled ${title.toLowerCase()} baseline for ${profile.name}.`,
    rows: [["Programme baseline", profile.name, "Controlled review"], ["Commercial quantity", profile.quantity, "Approved business case"], ["Environmental envelope", profile.environmental, "Evidence required"]],
    approvals: ["SAL", "EHW", "QA"],
  };
  const content: Record<string, typeof base> = {
    "Stage 1": { intent: "Customer requirement capture and confidential information controls under IATF 16949 §8.2 and ISO 27001.", rows: [["Requirements matrix", profile.techSpec, "Customer SOR traceability"], ["Commercial programme", profile.commercialValue, "Sales review required"], ["Confidentiality", "Bilateral mNDA controls", "Authorized disclosure only"]], approvals: ["SAL", "SIT", "QA"] },
    "Stage 2": { intent: "Cross-functional feasibility decision and Contract Review gate with five technical HOD sign-offs.", rows: [["Hardware feasibility", "Power, RF and PCB capability", "EHW sign-off"], ["Firmware feasibility", "CAN J1939 and 4G integration", "ESW sign-off"], ["Quality feasibility", profile.compliance, "QA sign-off"]], approvals: ["EHW", "ESW", "MECH", "PUR", "QA"] },
    "Stage 3": { intent: "Frozen product requirement and volume-tier commercial baseline for controlled release.", rows: [["Architecture", profile.techSpec, "PRS freeze"], ["Operating envelope", profile.environmental, "Design input approved"], ["Volume tier", profile.quantity, "Quotation review"]], approvals: ["SAL", "EHW", "QA"] },
    "Stage 4": { intent: "Design PoC evidence: schematic release, component breakdown and project-specific communications firmware integration.", rows: [["Schematic architecture", `Power, controller, RF and vehicle interfaces · ${profile.techSpec}`, "Peer review complete"], ["BOM controls", "Manufacturer part numbers and alternates", "AVL review"], ["Firmware PoC", profile.techSpec, "Bench evidence"]], approvals: ["EHW", "ESW", "PUR"] },
    "Stage 5": { intent: "Pilot manufacturing control plan for SMT setup and validated process parameters.", rows: [["Reflow profile", "10-zone thermal profile", "Profile approved"], ["Solder inspection", "3D SPI and AOI coverage", "First-off verification"], ["Process control", "EMF-CP-01 control points", "Line readiness"]], approvals: ["EMF", "QA", "PUR"] },
    "Stage 6": { intent: "DVP&R plan for 18 AIS-140, ISO 7637-2, electrical and environmental verification tests.", rows: [["Electrical immunity", "ISO 7637-2 transient pulses", "Pass/fail test evidence"], ["Environmental", profile.environmental, "Chamber evidence"], ["Regulatory", "AIS-140 functional verification", "QA release review"]], approvals: ["QA", "EHW", "ESW"] },
    "Stage 7": { intent: "Production design release including AIAG-VDA DFMEA and Gerber Rev B controls.", rows: [["DFMEA analysis", "AIAG-VDA failure modes and actions", "RPN/action review"], ["PCB release", "Gerber Rev B and fabrication notes", "Configuration release"], ["Supplier quality", "PPAP Level 3 evidence", "Quality approval"]], approvals: ["EHW", "QA", "PUR"] },
    "Stage 8": { intent: "Type approval and controlled mass-production authorization. Certificate evidence remains subject to human approval.", rows: [["Type approval", "AIS-140 TAC evidence", "ARAI / ICAT review"], ["Production authorization", profile.quantity, "Release gate"], ["Compliance pack", profile.compliance, "Controlled dossier"]], approvals: ["QA", "SAL", "EMF"] },
    "Stage 9": { intent: "Final PDI, tax documentation and competency evidence for the controlled commercial release record.", rows: [["PDI result", "0-defect inspection release", "TST certificate"], ["Commercial invoice", profile.commercialValue, "GST / HSN review"], ["Competency", "HLPL/F/HR/03 skill matrix", "HR approval"]], approvals: ["TST", "FIN", "HR"] },
  };
  return content[stage] ?? base;
}

function TemplateSettingsPanel({ settings, onChange, onClose, templateBodies, onTemplateBodiesChange }: { settings: TemplateSettings; onChange: (settings: TemplateSettings) => void; onClose: () => void; templateBodies: Record<string, string>; onTemplateBodiesChange: (templates: Record<string, string>) => void }) {
  const [template, setTemplate] = useState<string>(autoDraftTemplates[0]?.[0] ?? "Customer SOR");
  return <Modal title="Document Header & Footer Settings" onClose={onClose} wide><TemplateSettingsEditor settings={settings} onChange={onChange} onSave={() => undefined} /><section className="ops-section mt-5 overflow-hidden"><div className="ops-section-header"><p className="text-sm font-semibold">Base HTML drafting templates</p><p className="mt-1 text-xs text-muted-foreground">Edit the controlled starting content for each document type. Project requirements are injected into each full viewer.</p></div><div className="grid gap-4 p-4"><SelectField label="Document template" value={template} onChange={setTemplate} options={autoDraftTemplates.map(([title]) => title)} /><label className="block font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">Template body<textarea value={templateBodies[template] ?? templateBlueprint(template)} onChange={(event) => onTemplateBodiesChange({ ...templateBodies, [template]: event.target.value })} className="mt-2 min-h-36 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal normal-case text-foreground" /></label></div></section><div className="mt-5 flex justify-end"><Action label="Done" primary onClick={onClose} /></div></Modal>;
}

function TemplateSettingsEditor({ settings, onChange, onSave }: { settings: TemplateSettings; onChange: (settings: TemplateSettings) => void; onSave: () => void }) {
  const update = (key: keyof TemplateSettings, value: string) => onChange({ ...settings, [key]: value });
  return <div className="space-y-5"><section className="ops-section overflow-hidden"><div className="ops-section-header"><p className="text-sm font-semibold">Organization & document settings</p><p className="mt-1 text-xs text-muted-foreground">Changes update every full-page template preview immediately in this browser.</p></div><div className="grid gap-4 p-4 md:grid-cols-2"><TextField label="Company name" value={settings.companyName} onChange={(value) => update("companyName", value)} /><TextField label="Header logo / badge text" value={settings.logoBadge} onChange={(value) => update("logoBadge", value)} /><TextField label="Document prefix" value={settings.prefix} onChange={(value) => update("prefix", value.toUpperCase())} /><TextField label="Accreditation marks" value={settings.accreditationMarks} onChange={(value) => update("accreditationMarks", value)} /><TextField label="Tech Center address" value={settings.techCenter} onChange={(value) => update("techCenter", value)} /><TextField label="Manufacturing plant location" value={settings.plantLocation} onChange={(value) => update("plantLocation", value)} /></div></section><section className="ops-section overflow-hidden"><div className="ops-section-header"><p className="text-sm font-semibold">Footer controls</p></div><div className="space-y-4 p-4"><label className="block font-mono text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">Confidentiality notice<textarea value={settings.confidentialityNotice} onChange={(event) => update("confidentialityNotice", event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal normal-case text-foreground" /></label><label className="block font-mono text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">Compliance footer line<textarea value={settings.complianceFooter} onChange={(event) => update("complianceFooter", event.target.value)} className="mt-1 min-h-16 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal normal-case text-foreground" /></label></div></section><div className="flex justify-end"><Action label="Save template settings" primary onClick={onSave} /></div></div>;
}
function RaciMatrixEditor({ matrix, onChange, onSave }: { matrix: RaciMatrix; onChange: (matrix: RaciMatrix) => void; onSave: () => void }) {
  const update = (stage: string, department: string, role: RaciRole) => onChange({ ...matrix, [stage]: { ...(matrix[stage] ?? {}), [department]: role } });
  return <div className="space-y-5"><section className="ops-section overflow-hidden"><div className="ops-section-header"><p className="text-sm font-semibold">Responsibility Matrix (RACI)</p><p className="mt-1 text-xs text-muted-foreground">Saved assignments route simulated lifecycle handoffs to Responsible, Accountable and Consulted departments.</p></div><div className="overflow-auto"><table className="w-full min-w-[940px] text-left text-xs"><thead className="bg-panel"><tr><th className="p-3">Lifecycle stage</th>{raciDepartments.map((department) => <th key={department} className="p-2 text-center font-mono">{department}</th>)}</tr></thead><tbody>{ai4tStages.map(([stage, title]) => <tr key={stage} className="border-t border-border"><td className="min-w-52 p-3"><strong>{stage}</strong><span className="mt-1 block text-muted-foreground">{title}</span></td>{raciDepartments.map((department) => <td key={department} className="p-1 text-center"><select aria-label={`${stage} ${department} responsibility`} value={matrix[stage]?.[department] ?? ""} onChange={(event) => update(stage, department, event.target.value as RaciRole)} className="h-8 rounded border border-input bg-background px-1 text-xs font-semibold"><option value="">—</option><option value="R">R</option><option value="A">A</option><option value="C">C</option><option value="I">I</option></select></td>)}</tr>)}</tbody></table></div></section><div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground"><strong>R</strong> Responsible · <strong>A</strong> Accountable · <strong>C</strong> Consulted · <strong>I</strong> Informed</p><Action label="Save responsibility matrix" primary onClick={onSave} /></div></div>;
}

function PrintableTemplateView({ document, settings, onClose, onOpenSettings }: { document: PrintableDocument; settings: TemplateSettings; onClose: () => void; onOpenSettings: () => void }) {
  const signatories = departmentSignatories[document.department] ?? departmentSignatories["EHW"];
  if (!signatories) return null;
  const profile = projectDocumentProfiles[document.project] ?? projectDocumentProfiles["HLPL-AI4T-01"] ?? { name: "Project baseline", customer: "Customer details pending", contact: "Contact pending", quantity: "Quantity pending", techSpec: "Technical baseline pending", commercialValue: "Commercial value pending", environmental: "Environmental baseline pending", compliance: "Compliance baseline pending" };
  const stageContent = stageDocumentContent(document.stage, document.title, profile);
  const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date());
  const markdown = documentMarkdown(document, profile, stageContent, signatories, date);
  const copyText = () => void navigator.clipboard?.writeText(markdown);
  const exportText = () => { const url = URL.createObjectURL(new Blob([markdown], { type: "text/plain" })); const link = window.document.createElement("a"); link.href = url; link.download = `${document.documentId}.txt`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); };
  const printDocument = () => {
    const source = window.document.getElementById("printable-document");
    if (!source) return;
    const frame = window.document.createElement("iframe");
    frame.setAttribute("title", `Print ${document.documentId}`);
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;";
    window.document.body.appendChild(frame);
    const printable = frame.contentWindow;
    if (!printable) { frame.remove(); return; }
    const style = `@page{size:A4 portrait;margin:15mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff!important;color:#0f172a!important}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.45}article{width:100%;margin:0;background:#fff;color:#0f172a}header,section,footer,table{break-inside:avoid;page-break-inside:avoid}header{display:grid;grid-template-columns:1.15fr 1.7fr 1.15fr;border:2px solid #0f172a}header>div{padding:10px;border-right:1px solid #0f172a}header>div:last-child{border-right:0}section{margin-top:16px}h3{margin:0 0 8px;padding-bottom:5px;border-bottom:1px solid #334155;font-size:11pt}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #334155;padding:6px;vertical-align:top;text-align:left}th{background:#e2e8f0}.no-print{display:none!important}[class*="bg-"],[class*="text-"]{background:transparent!important;color:#0f172a!important}.rounded-lg,.rounded-md{border-radius:0!important}.shadow-lg{box-shadow:none!important}`;
    printable.document.open();
    printable.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${document.documentId}</title><style>${style}</style></head><body>${source.outerHTML}</body></html>`);
    printable.document.close();
    window.setTimeout(() => {
      printable.focus();
      printable.print();
      window.setTimeout(() => frame.remove(), 1000);
    }, 300);
  };
  return <Modal title="Full Document Viewer & Print" onClose={onClose} wide><div className="no-print mb-4 flex flex-wrap justify-end gap-2"><Action label="Copy Full Markdown" onClick={copyText} /><Action label="Export Text" onClick={exportText} /><Action label="Customize Header & Footer" onClick={onOpenSettings} /><Action label="🖨️ Print / Save PDF" primary onClick={printDocument} /></div><article id="printable-document" className="print-document printable-document-content mx-auto max-w-[794px] border border-border bg-card p-5 text-foreground shadow-lg md:p-8"><header className="grid gap-px overflow-hidden border-2 border-foreground/50 bg-border sm:grid-cols-[1.15fr_1.7fr_1.15fr]"><div className="bg-card p-3"><div className="flex items-center gap-2"><span className="grid size-10 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">{settings.logoBadge}</span><div><p className="text-xs font-bold">{settings.companyName}</p><p className="text-[10px] text-muted-foreground">SIX SENSE MOBILITY</p></div></div><p className="mt-3 text-[9px] leading-4 text-muted-foreground">{settings.accreditationMarks}</p></div><div className="bg-card p-3 text-center"><p className="text-sm font-bold">{document.title}</p><p className="mt-1 text-[10px] font-medium">{document.stage} · {document.project} · {profile.name}</p></div><div className="bg-card p-3 text-[10px]"><p><strong>Document ID:</strong> {document.documentId}</p><p className="mt-1"><strong>Revision:</strong> {document.revision}</p><p className="mt-1"><strong>Effective date:</strong> {date}</p><p className="mt-1"><strong>Classification:</strong> Internal controlled DEMO draft</p><p className="mt-2"><Status status={document.status} /></p></div></header><section className="mt-5 border border-border"><div className="border-b border-border bg-panel px-3 py-2"><p className="text-xs font-bold">Organization & facility details</p></div><div className="grid gap-px bg-border sm:grid-cols-2"><div className="bg-card p-3"><p className="font-mono text-[9px] uppercase text-muted-foreground">Tech Center</p><p className="mt-1 text-xs">{settings.techCenter}</p></div><div className="bg-card p-3"><p className="font-mono text-[9px] uppercase text-muted-foreground">Manufacturing plant</p><p className="mt-1 text-xs">{settings.plantLocation}</p></div></div></section><DocumentBody document={document} profile={profile} stageContent={stageContent} signatories={signatories} date={date} /><footer className="mt-8 border-t-2 border-foreground/50 pt-3 text-center text-[9px] leading-4 text-muted-foreground"><p>{settings.confidentialityNotice}</p><p className="mt-2">{settings.complianceFooter}</p><p className="mt-2">Classification: Internal controlled DEMO draft · Printed {new Date().toLocaleString("en-IN")} · Page 1 of 1</p><div className="no-print mt-4"><Action label="🖨️ Print / Save PDF" primary onClick={printDocument} /></div></footer></article></Modal>;
}

function DocumentBody({ document, profile, stageContent, signatories, date }: { document: PrintableDocument; profile: ProjectDocumentProfile; stageContent: ReturnType<typeof stageDocumentContent>; signatories: { author: string; reviewer: string; approver: string }; date: string }) {
  const specs = [["Microcontroller", "STM32 / ESP32 automotive-grade controller", "AEC-Q100 grade selection and controlled firmware release"], ["Cellular modem", "4G LTE Cat-1 eSIM with 2G fallback", "Network registration and field diagnostics"], ["Power supply", "9V–36V with ISO 7637-2 pulse protection", "Transient, reverse polarity and load-dump evidence"], ["GNSS", "L1/L5 GNSS receiver with assisted position data", "AIS-140 location evidence"], ["Vehicle I/O", "CAN 2.0B, CAN J1939 and RS485 interface", "Bus load, termination and interoperability checks"], ["Enclosure", "IP67 UV-stabilized polycarbonate enclosure", "Ingress, vibration and temperature evidence"]];
  const matrix = document.title.includes("DVP") ? [["ISO 7637-2 pulse immunity", "Electrical transient pulses", "No reset, loss of data or permanent damage"], ["AIS-140 functional check", "GNSS, cellular and SOS function", "Traceable simulated evidence"], ["Environmental chamber", profile.environmental, "Functional verification after exposure"], ["CAN J1939 interoperability", "Message timing and diagnostics", "No critical communication fault"]] : document.title.includes("BOM") ? [["STM32 controller", "STM32 automotive MCU", "STMicroelectronics", "LQFP", "12 weeks", "Controlled estimate"], ["4G Cat-1 modem", "eSIM-capable cellular module", "Approved source required", "LGA", "16 weeks", "Controlled estimate"], ["GNSS receiver", "L1/L5 receiver", "Approved source required", "QFN", "14 weeks", "Controlled estimate"], ["Power front end", "TVS, buck regulator and reverse protection", "Approved source required", "Mixed", "10 weeks", "Controlled estimate"]] : stageContent.rows;
  return <><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">1.0 Executive Summary & Project Identification</h3><p className="mt-3 text-xs leading-5">{stageContent.intent} This controlled DEMO draft defines the intended scope and traceability baseline for {profile.name}. It must be reviewed and approved by accountable owners before any operational use.</p><div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><DocumentField label="Client / stakeholder" value={profile.customer} /><DocumentField label="Customer contact" value={profile.contact} /><DocumentField label="Programme volume" value={profile.quantity} /><DocumentField label="Commercial baseline" value={profile.commercialValue} /></div></section><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">2.0 System Architecture & Block Diagram</h3><p className="mt-3 text-xs leading-5">The device architecture routes protected vehicle power through transient suppression and regulated rails to the controller, modem and GNSS subsystem. CAN 2.0B / J1939 and RS485 interfaces are galvanically and diagnostically managed; firmware coordinates telemetry, positioning, secure communications and controlled update states.</p><div className="mt-3 grid gap-2 border border-border bg-panel p-3 text-[11px] sm:grid-cols-5"><span>Vehicle 9–36V</span><span>→ Protection & DC/DC</span><span>→ MCU / Firmware</span><span>→ 4G + GNSS</span><span>→ CAN / RS485</span></div></section><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">3.0 Hardware & Technical Specifications</h3><DocumentTable headers={["Subsystem", "Controlled specification", "Verification expectation"]} rows={specs} /></section><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">4.0 Automotive Compliance & Standards Matrix</h3><DocumentTable headers={["Standard / requirement", "Applicability", "Controlled evidence"]} rows={[["AIS-140 Amendments 1 & 2", "Telematics and positioning functions", "Functional traceability and human review"], ["IATF 16949:2016", "Automotive quality process controls", "Controlled document and approval history"], ["ISO 7637-2 / ISO 16750", "Electrical transients and environmental loads", "DVP&R and laboratory evidence"], ["IP67 ingress protection", "Enclosure protection", "Environmental verification evidence"], ["ARAI / ICAT", "Type-approval evidence where applicable", "Certificate reviewed by authorized quality owner"]]} /></section><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">5.0 {document.title.includes("DVP") ? "Test Plan" : document.title.includes("BOM") ? "Bill of Materials" : "Process Matrix"}</h3><DocumentTable headers={document.title.includes("BOM") ? ["MPN / item", "Description", "Manufacturer", "Package", "Lead time", "Unit cost"] : ["Control parameter", "Requirement / test", "Pass / fail criterion"]} rows={matrix} /></section><section className="mt-5"><h3 className="border-b border-foreground/30 pb-1 text-xs font-bold">6.0 Multi-Department RACI Sign-off Matrix</h3><DocumentTable headers={["Department", "Role", "Lead name", "Approval status", "Timestamp", "Digital signature hash"]} rows={stageContent.approvals.map((department, index) => [department, index === 0 ? "Responsible" : index === 1 ? "Accountable" : "Consulted", department === document.department ? signatories.author : department === "QA" ? "Jordan Blake" : department === "SAL" ? "Priya Sharma" : "Department lead", "APPROVED · DEMO", `${date} · controlled review`, `SHA-256 · DEMO-${document.documentId.slice(-8)}-${department}`])} /></section></>;
}

function DocumentTable({ headers, rows }: { headers: string[]; rows: string[][] }) { return <div className="mt-3 overflow-x-auto border border-border"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-panel"><tr>{headers.map((header) => <th key={header} className="p-2 font-semibold">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`} className="border-t border-border">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="p-2 align-top">{cell}</td>)}</tr>)}</tbody></table></div>; }

function documentMarkdown(document: PrintableDocument, profile: ProjectDocumentProfile, stageContent: ReturnType<typeof stageDocumentContent>, signatories: { author: string; reviewer: string; approver: string }, date: string) { return `# ${document.title}\n\n**Document ID:** ${document.documentId}  \n**Project:** ${document.project} · ${profile.name}  \n**Revision:** ${document.revision}  \n**Effective date:** ${date}\n\n## 1.0 Executive Summary & Project Identification\n${stageContent.intent}\n\nClient: ${profile.customer}\nProgramme: ${profile.quantity}\nTechnical baseline: ${profile.techSpec}\n\n## 2.0 System Architecture & Block Diagram\nProtected vehicle power → DC/DC → MCU/firmware → 4G/GNSS → CAN 2.0B/J1939 and RS485.\n\n## 3.0 Hardware & Technical Specifications\nSTM32/ESP32 controller; 4G LTE Cat-1 eSIM with 2G fallback; 9V–36V ISO 7637-2 protected supply; L1/L5 GNSS; CAN 2.0B/RS485; IP67 UV-stabilized polycarbonate enclosure.\n\n## 4.0 Automotive Compliance & Standards Matrix\nAIS-140 Amendments 1 & 2; IATF 16949:2016; ISO 7637-2 / ISO 16750; IP67; ARAI / ICAT review where applicable.\n\n## 5.0 Controlled Matrix\n${stageContent.rows.map((row) => `- ${row.join(" — ")}`).join("\n")}\n\n## 6.0 Multi-Department RACI Sign-off Matrix\n${stageContent.approvals.map((department, index) => `- ${department}: ${index === 0 ? "Responsible" : index === 1 ? "Accountable" : "Consulted"} · APPROVED DEMO · ${date} · SHA-256 DEMO signature`).join("\n")}\n\nPrepared by: ${signatories.author}\nReviewed by: ${signatories.reviewer}\nApproved by: ${signatories.approver}\n`; }
function DocumentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3">
      <p className="font-mono text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border/40 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-1 truncate text-xl font-bold tracking-normal text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 truncate text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>}
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/30 backdrop-blur-[2px] md:place-items-center md:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`surface-card max-h-[92vh] w-full overflow-auto border border-border bg-popover ${wide ? "max-w-5xl" : "max-w-xl"}`}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-border bg-popover/95 px-4 py-3 backdrop-blur">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="p-4">{children}</div>
      </section>
    </div>
  );
}
function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block font-mono text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">
      {label}
      {required ? " *" : ""}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground transition-colors placeholder:text-muted-foreground hover:border-ring/60 focus:border-ring"
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-mono text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground transition-colors hover:border-ring/60 focus:border-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Select an option"}
          </option>
        ))}
      </select>
    </label>
  );
}
function Action({
  label,
  onClick,
  primary,
  submit,
}: {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  submit?: boolean;
}) {
  return (
    <button
      type={submit ? "submit" : "button"}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 ${primary ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "border border-border bg-card text-foreground hover:border-ring/50 hover:bg-secondary"}`}
    >
      {label}
    </button>
  );
}
function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "danger" | "steel" | "moss" | "warning";
}) {
  const color =
    tone === "danger"
      ? "bg-danger"
      : tone === "steel"
        ? "bg-steel"
        : tone === "moss"
          ? "bg-moss"
          : "bg-warning";
  return (
    <div className="surface-card ops-section p-3">
      <div className="flex justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">
          {label}
        </p>
        <span className={`mt-1 size-2 rounded-full ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
function Status({ status }: { status: RecordStatus }) {
  const tone =
    status === "Approved" || status === "Released"
      ? "border border-moss/25 bg-accent text-accent-foreground"
      : status === "In review"
        ? "border border-warning/30 bg-warning/15 text-foreground"
        : status === "Archived"
          ? "border border-border bg-secondary text-muted-foreground"
          : "border border-steel/20 bg-secondary text-steel";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[.06em] ${tone}`}
    >
      {status}
    </span>
  );
}
function Empty({ onCreate, label }: { onCreate: () => void; label: string }) {
  return (
    <div className="grid place-items-center p-12 text-center">
      <ClipboardCheck className="size-6 text-muted-foreground" />
      <h2 className="mt-3 font-semibold">No records yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        No sample activity has been created. Add the first confirmed record when ready.
      </p>
      <div className="mt-4">
        <Action onClick={onCreate} label={label} primary />
      </div>
    </div>
  );
}
function NotificationCenter({
  alerts,
  departments,
  onClose,
  onResolve,
  onDismiss,
  onReview,
}: {
  alerts: DemoAlert[];
  departments: Department[];
  onClose: () => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  onReview: (departmentId: string) => void;
}) {
  const active = alerts.filter((alert) => !alert.resolved);
  return (
    <Modal title="Notification center" onClose={onClose}>
      <p className="mb-5 text-sm text-muted-foreground">
        Active DEMO alerts are fictional test signals and do not represent live operational events.
      </p>
      <div className="space-y-3">
        {active.length ? (
          active.map((alert) => (
            <article key={alert.id} className="rounded-lg border border-border bg-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                    {alert.id} · {alert.severity}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">{alert.title}</h3>
                </div>
                <Status status={alert.severity === "Critical" ? "In review" : "Open"} />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.detail}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {departments.find((department) => department.id === alert.departmentId)?.name ?? "Department"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Action label="Review handoff" onClick={() => onReview(alert.departmentId)} primary />
                <Action label="Resolve" onClick={() => onResolve(alert.id)} primary />
                <Action label="Dismiss" onClick={() => onDismiss(alert.id)} />
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-border bg-panel p-5 text-sm text-muted-foreground">
            No active DEMO alerts.
          </p>
        )}
      </div>
    </Modal>
  );
}
function HeaderAction({
  label,
  icon: Icon,
  onClick,
  badge,
}: {
  label: string;
  icon: typeof Bell;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-ring/50 hover:bg-secondary hover:text-foreground"
    >
      <Icon className="size-4" />
      {badge ? (
        <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-semibold leading-4 text-destructive-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
function PersonaSwitcher({ persona, onSelect }: { persona: Persona; onSelect: (persona: Persona) => void }) {
  return (
    <label className="hidden min-w-48 items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-ring/50 md:flex">
      <UserRoundCog className="size-4 shrink-0 text-steel" />
      <span className="sr-only">Switch role and department</span>
      <select
        aria-label="Switch role and department"
        value={persona.id}
        onChange={(event) => onSelect(personas.find((item) => item.id === event.target.value) ?? personas[0] ?? persona)}
        className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none"
      >
        {personas.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
  );
}
function ThemeToggle({ darkMode, onToggle, expanded = false }: { darkMode: boolean; onToggle: () => void; expanded?: boolean }) {
  const Icon = darkMode ? Sun : Moon;
  const label = darkMode ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={expanded ? "mt-3 flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-card px-3 py-2.5 text-left text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent" : "grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-ring/50 hover:bg-secondary hover:text-foreground"}
    >
      <Icon className="size-4 text-steel" />
      {expanded && <span>{darkMode ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
function SidebarToggle({ expanded, onToggle, compact = false }: { expanded: boolean; onToggle: () => void; compact?: boolean }) {
  const Icon = expanded ? PanelLeftClose : PanelLeftOpen;
  const label = expanded ? "Collapse navigation" : "Expand navigation";
  return (
    <button
      aria-label={label}
      title={`${label} ([)`}
      onClick={onToggle}
      className={`grid shrink-0 place-items-center rounded-md text-current/75 transition-colors hover:bg-sidebar-primary-foreground/15 hover:text-current ${compact ? "absolute -bottom-1 -right-1 size-5 border border-sidebar-border bg-sidebar shadow-sm" : "size-7"}`}
    >
      <Icon className={compact ? "size-3" : "size-3.5"} />
    </button>
  );
}
function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center ${compact ? "" : "gap-3"}`}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-steel font-sans text-sm font-bold leading-none tracking-[0.08em] text-primary-foreground shadow-sm shadow-primary/20">
        SS
      </div>
      {!compact && <div className="min-w-0">
        <p className="text-sm font-semibold">Six Sense Mobility</p>
        <p className="font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">
          Operations portal
        </p>
      </div>}
    </div>
  );
}
function AreaNav({
  area,
  active,
  onClick,
  expanded = true,
  openCount,
}: {
  area: (typeof areas)[number];
  active: boolean;
  onClick: () => void;
  expanded?: boolean;
  openCount?: number;
}) {
  const Icon = area.icon;
  return (
    <button
      onClick={onClick}
      title={expanded ? undefined : area.name}
      aria-label={area.name}
      className={`group relative flex items-center rounded-lg text-left font-medium transition-colors ${expanded ? "w-full gap-2 px-2.5 py-1.5 text-xs" : "size-10 justify-center"} ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
    >
      <Icon className="size-4 shrink-0" />
      {expanded ? (
        <>
          <span className="min-w-0 flex-1 truncate">{area.navLabel}</span>
          {area.id !== "home" && openCount ? (
            <span className={`grid min-w-4 place-items-center rounded-full px-1 font-mono text-[9px] leading-4 ${active ? "bg-sidebar-primary-foreground/20" : "bg-sidebar-accent text-sidebar-accent-foreground"}`}>{openCount}</span>
          ) : null}
        </>
      ) : (
        <>
          <span className="font-mono text-[9px] font-semibold leading-none">{area.short.replace(/[^A-Z0-9]/g, "").slice(0, 2)}</span>
          <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">{area.name}</span>
        </>
      )}
    </button>
  );
}
function MobileMenu({
  onClose,
  onNavigate,
  darkMode,
  onToggleTheme,
}: {
  onClose: () => void;
  onNavigate: (area: AreaId) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] lg:hidden">
      <div className="h-full w-[min(19rem,88vw)] border-r border-sidebar-border bg-sidebar p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {areas.map((area) => (
            <AreaNav
              key={area.id}
              area={area}
              active={false}
              onClick={() => {
                onNavigate(area.id);
                onClose();
              }}
            />
          ))}
        </nav>
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} expanded />
      </div>
    </div>
  );
}
