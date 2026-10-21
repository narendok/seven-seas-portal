/**
 * Department Budgets, Allocations & Expense Requests Model
 * Conforming to BUDGET_HR_AND_TEAM_COMMUNICATION_PLAN_2026-10-21.md
 * 
 * Rules:
 * 1. Budget ownership is a department; project link is optional.
 * 2. Available = approved allocation - posted actuals - outstanding commitments.
 * 3. No requester approves their own claim (alternate approver rule).
 * 4. Advances are tracked separately from final expense recognition.
 */

export interface BudgetPeriod {
  id: string;
  name: string; // e.g. "FY 2026-27 Q3"
  startDate: string;
  endDate: string;
  currency: string;
  status: "Active" | "Closed" | "Draft";
}

export type BudgetCategory =
  | "Travel & Transport"
  | "Accommodation & Stay"
  | "Consumables & Lab Supplies"
  | "Equipment & Tools (CapEx)"
  | "Software & Subscriptions"
  | "Maintenance & Calibration"
  | "Training & Certifications"
  | "Office & Operations";

export interface DepartmentAllocation {
  id: string;
  departmentCode: string; // e.g. "EHW", "SAL", "PUR", "QA", "FIN"
  departmentName: string;
  periodId: string;
  category: BudgetCategory;
  allocatedAmount: number;
  committedAmount: number; // outstanding unposted approved requests
  spentAmount: number;     // posted actual expenditure
  projectId?: string | null; // optional link to automotive project
  version: number;
  effectiveDate: string;
  approvedBy: string;
}

export interface BudgetRevision {
  id: string;
  allocationId: string;
  originalAmount: number;
  revisedAmount: number;
  deltaAmount: number;
  reason: string;
  proposedBy: string;
  approvedBy: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export interface TravelDetail {
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  transportEstimate: number;
  stayEstimate: number;
  dailyAllowanceEstimate: number;
  requestedAdvance: number;
  advanceSettled: boolean;
}

export interface AssetRequestDetail {
  itemSpecification: string;
  quantity: number;
  replacementJustification?: string;
  targetLocation: string;
  requiredDate: string;
  linkedAssetTag?: string;
}

export interface ExpenseRequest {
  id: string;
  reference: string; // e.g. "EXP-2026-EHW-012"
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  category: BudgetCategory;
  amount: number;
  currency: string;
  purpose: string;
  projectId?: string | null; // optional
  requiredDate: string;
  status: "Draft" | "Pending_Dept_Review" | "Pending_Finance" | "Pending_Admin" | "Approved" | "Rejected" | "Returned" | "Settled";
  currentApproverRole: string; // e.g. "FIN Lead", "Executive Admin"
  alternateApprover?: string;  // designated when requester is lead or Admin
  iatfClause?: string;        // e.g. "IATF 16949 §8.3.4"
  receiptEvidence?: string[];  // uploaded receipts or attachment filenames
  travelDetail?: TravelDetail;
  assetDetail?: AssetRequestDetail;
  claimSettlement?: {
    actualAmount: number;
    advanceDeducted: number;
    netPayable: number;
    financePostingRef: string;
    settledAt: string;
  };
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

/** Compute available balance: allocation - spent - committed */
export function calculateAvailableBudget(allocation: DepartmentAllocation): number {
  return allocation.allocatedAmount - allocation.spentAmount - allocation.committedAmount;
}

/** Check if user can approve the request, enforcing no self-approval */
export function canUserApproveExpense(
  request: ExpenseRequest,
  userPersona: { kind: string; person: string; departmentId?: string; id?: string }
): { canApprove: boolean; reason?: string } {
  // Rule 1: No requester approves their own request
  if (
    request.requesterName.toLowerCase().includes(userPersona.person.toLowerCase()) ||
    request.requesterId === userPersona.id
  ) {
    return {
      canApprove: false,
      reason: "Self-approval prohibited. Request routed to designated alternate approver (Finance / Admin).",
    };
  }

  // Rule 2: Client has zero internal financial approval authority
  if (userPersona.kind === "client") {
    return { canApprove: false, reason: "Client accounts do not have internal budget authority." };
  }

  // Rule 3: Admin has universal approval authority (except for own requests)
  if (userPersona.kind === "admin") {
    return { canApprove: true };
  }

  // Rule 4: Finance Lead can approve at Pending_Finance stage
  if (userPersona.departmentId === "fin" && request.status === "Pending_Finance") {
    return { canApprove: true };
  }

  // Rule 5: Department Lead can approve for their own department at Pending_Dept_Review
  if (
    userPersona.kind === "lead" &&
    userPersona.departmentId?.toLowerCase() === request.requesterDept.toLowerCase() &&
    request.status === "Pending_Dept_Review"
  ) {
    return { canApprove: true };
  }

  return { canApprove: false, reason: `Requires ${request.currentApproverRole} approval.` };
}

/** Default Active Budget Period */
export const DEFAULT_BUDGET_PERIOD: BudgetPeriod = {
  id: "FY-2026-Q3",
  name: "FY 2026-27 Q3 (Oct - Dec 2026)",
  startDate: "2026-10-01",
  endDate: "2026-12-31",
  currency: "INR",
  status: "Active",
};

/** Default Department Allocations */
export const DEFAULT_DEPARTMENT_ALLOCATIONS: DepartmentAllocation[] = [
  {
    id: "ALLOC-EHW-01",
    departmentCode: "EHW",
    departmentName: "Hardware Engineering",
    periodId: "FY-2026-Q3",
    category: "Consumables & Lab Supplies",
    allocatedAmount: 450000,
    committedAmount: 85000,
    spentAmount: 195000,
    projectId: "HLPL-AI4T-01",
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Priya Voss (Finance Lead)",
  },
  {
    id: "ALLOC-EHW-02",
    departmentCode: "EHW",
    departmentName: "Hardware Engineering",
    periodId: "FY-2026-Q3",
    category: "Equipment & Tools (CapEx)",
    allocatedAmount: 1200000,
    committedAmount: 320000,
    spentAmount: 480000,
    projectId: "HLPL-AI4T-01",
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Executive Admin",
  },
  {
    id: "ALLOC-PUR-01",
    departmentCode: "PUR",
    departmentName: "Purchasing & SCM",
    periodId: "FY-2026-Q3",
    category: "Consumables & Lab Supplies",
    allocatedAmount: 350000,
    committedAmount: 42000,
    spentAmount: 118000,
    projectId: null, // Department operational spend
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Priya Voss (Finance Lead)",
  },
  {
    id: "ALLOC-QA-01",
    departmentCode: "QA",
    departmentName: "Quality Assurance & APQP",
    periodId: "FY-2026-Q3",
    category: "Maintenance & Calibration",
    allocatedAmount: 600000,
    committedAmount: 150000,
    spentAmount: 220000,
    projectId: "HLPL-AI4T-01",
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Executive Admin",
  },
  {
    id: "ALLOC-SAL-01",
    departmentCode: "SAL",
    departmentName: "Sales & Business Development",
    periodId: "FY-2026-Q3",
    category: "Travel & Transport",
    allocatedAmount: 500000,
    committedAmount: 90000,
    spentAmount: 215000,
    projectId: "HLPL-AI4T-01",
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Priya Voss (Finance Lead)",
  },
  {
    id: "ALLOC-FIN-01",
    departmentCode: "FIN",
    departmentName: "Accounts & Finance",
    periodId: "FY-2026-Q3",
    category: "Software & Subscriptions",
    allocatedAmount: 800000,
    committedAmount: 60000,
    spentAmount: 520000,
    projectId: null,
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Executive Admin",
  },
  {
    id: "ALLOC-HR-01",
    departmentCode: "HROPS",
    departmentName: "HR & Operations",
    periodId: "FY-2026-Q3",
    category: "Training & Certifications",
    allocatedAmount: 400000,
    committedAmount: 75000,
    spentAmount: 145000,
    projectId: null,
    version: 1,
    effectiveDate: "2026-10-01",
    approvedBy: "Priya Voss (Finance Lead)",
  },
];

/** Default Initial Expense & Travel Requests */
export const DEFAULT_EXPENSE_REQUESTS: ExpenseRequest[] = [
  {
    id: "EXP-2026-001",
    reference: "EXP-EHW-2026-081",
    requesterId: "usr-ehw-avery",
    requesterName: "Avery Vale",
    requesterDept: "EHW",
    category: "Consumables & Lab Supplies",
    amount: 38500,
    currency: "INR",
    purpose: "Precision SMD rework nozzles and solder paste alloy SAC305 for Stage 4 MCU proto rework",
    projectId: "HLPL-AI4T-01",
    requiredDate: "2026-10-25",
    status: "Pending_Finance",
    currentApproverRole: "FIN Lead",
    alternateApprover: "Executive Admin",
    iatfClause: "IATF 16949 §8.3.4 (Design Verification)",
    receiptEvidence: ["proforma_smd_nozzles_robu.pdf"],
    createdAt: "2026-10-18T10:30:00Z",
    updatedAt: "2026-10-19T14:15:00Z",
  },
  {
    id: "EXP-2026-002",
    reference: "TRV-SAL-2026-042",
    requesterId: "usr-sal-priya",
    requesterName: "Priya Sharma",
    requesterDept: "SAL",
    category: "Travel & Transport",
    amount: 24800,
    currency: "INR",
    purpose: "Customer commercial technical sign-off meeting at Tata Motors EV Fleet Division, Pune",
    projectId: "HLPL-AI4T-01",
    requiredDate: "2026-10-28",
    status: "Approved",
    currentApproverRole: "FIN Lead",
    alternateApprover: "Executive Admin",
    iatfClause: "IATF 16949 §8.2.3 (Review of Customer Requirements)",
    travelDetail: {
      destination: "Tata Motors Ltd, Pimpri, Pune",
      startDate: "2026-10-28",
      endDate: "2026-10-29",
      purpose: "Stage 2 Contract Review & Advance billing reconciliation",
      transportEstimate: 14500,
      stayEstimate: 7500,
      dailyAllowanceEstimate: 2800,
      requestedAdvance: 20000,
      advanceSettled: false,
    },
    receiptEvidence: ["flight_del_pnq_indigo.pdf"],
    createdAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-10-16T11:45:00Z",
  },
  {
    id: "EXP-2026-003",
    reference: "AST-QA-2026-019",
    requesterId: "usr-qa-jordan",
    requesterName: "Jordan Blake",
    requesterDept: "QA",
    category: "Maintenance & Calibration",
    amount: 65000,
    currency: "INR",
    purpose: "NABL annual calibration certificate for Chroma 8000 EOL test jig and Rohde & Schwarz EMI receiver",
    projectId: "HLPL-AI4T-01",
    requiredDate: "2026-11-05",
    status: "Pending_Admin",
    currentApproverRole: "Executive Admin",
    iatfClause: "IATF 16949 §7.1.5.2 (Measurement Traceability)",
    assetDetail: {
      itemSpecification: "Calibration Services — Accredited ISO/IEC 17025 Lab",
      quantity: 2,
      replacementJustification: "Mandatory annual statutory calibration prior to Stage 8 Mass Production",
      targetLocation: "Hexense Reliability & DVP Lab, Greater Noida",
      requiredDate: "2026-11-05",
      linkedAssetTag: "AST-CAL-JIG-8000",
    },
    receiptEvidence: ["nabl_calib_quotation_2026.pdf"],
    createdAt: "2026-10-20T11:00:00Z",
    updatedAt: "2026-10-20T16:30:00Z",
  },
  {
    id: "EXP-2026-004",
    reference: "EXP-PUR-2026-055",
    requesterId: "usr-pur-morgan",
    requesterName: "Morgan Reed",
    requesterDept: "PUR",
    category: "Consumables & Lab Supplies",
    amount: 18200,
    currency: "INR",
    purpose: "ESD safe conductive totes and reel storage bins for SMT Line 2 feeder preparation",
    projectId: null,
    requiredDate: "2026-10-30",
    status: "Pending_Dept_Review",
    currentApproverRole: "PUR Lead",
    alternateApprover: "Executive Admin",
    iatfClause: "IATF 16949 §8.5.4 (Preservation)",
    receiptEvidence: ["esd_totes_proforma.pdf"],
    createdAt: "2026-10-21T08:15:00Z",
    updatedAt: "2026-10-21T08:15:00Z",
  },
];
