import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  ArrowLeft,
  FileCheck2,
  Clock,
  Building2,
  Award,
  Lock,
  Plus,
  Send,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Persona } from "@/components/RoleAwareSidebar";

export interface ApprovalRecord {
  id: string;
  title: string;
  recordId: string;
  outcome: "Pending" | "Approved" | "Rejected" | "Returned";
  updatedAt: string;
  requester?: string | undefined;
  requesterDepartment?: string | undefined;
  department?: string | undefined; // Target Approving Department (e.g. "FIN", "EHW", "QA", "PUR")
  project?: string | undefined;
  description?: string | undefined;
  riskLevel?: "Low" | "Medium" | "High" | "Critical" | undefined;
  iatfClause?: string | undefined;
  comments?: string | undefined;
  signedBy?: string | undefined;
  signedAt?: string | undefined;
}

interface ApprovalsFullPageViewProps {
  approvals: ApprovalRecord[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
  onReturn: (id: string, reworkNotes: string) => void;
  onResubmit?: ((id: string, notes: string) => void) | undefined;
  onCreateRequest?: ((request: Omit<ApprovalRecord, "id" | "outcome" | "updatedAt">) => void) | undefined;
  onBack: () => void;
  currentUser?: string | undefined;
  userRole?: string | undefined;
  persona?: Persona | undefined;
}

export function ApprovalsFullPageView({
  approvals,
  onApprove,
  onReject,
  onReturn,
  onResubmit,
  onCreateRequest,
  onBack,
  currentUser = "Executive Admin / MD",
  userRole = "Admin",
  persona,
}: ApprovalsFullPageViewProps) {
  const isLead = persona?.kind === "lead";
  const userDept = (persona?.departmentId ?? "").toUpperCase();

  // Filter tabs for department leads vs admin
  const [leadTab, setLeadTab] = useState<"ALL" | "ACTION_REQUIRED" | "MY_REQUESTS" | "APPROVED" | "RETURNED">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected" | "Returned">("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Action modal states
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRecord | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "return" | "resubmit" | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");

  // New Request modal state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newTargetDept, setNewTargetDept] = useState("FIN");
  const [newTitle, setNewTitle] = useState("");
  const [newRecordId, setNewRecordId] = useState("");
  const [newProject, setNewProject] = useState("HLPL-AI4T-01 (Tata Ace EV 4G)");
  const [newRiskLevel, setNewRiskLevel] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [newClause, setNewClause] = useState("IATF 16949 §8.3.4 (Engineering Change Control)");
  const [newDesc, setNewDesc] = useState("");

  // Canonical enriched approvals mapping (guarantees all 11-department metadata integrity)
  const enrichedApprovals: ApprovalRecord[] = useMemo(() => {
    return approvals.map((appr) => {
      if (appr.id === "demo-approval-quality-release" || appr.id === "approval-qa-release") {
        return {
          ...appr,
          requester: appr.requester ?? "Casey Rowan (Manufacturing Lead)",
          requesterDepartment: (appr as any).requesterDepartment ?? "EMF",
          department: appr.department ?? "QA",
          project: appr.project ?? "HLPL-AI4T-01 (Tata Ace EV 4G)",
          riskLevel: appr.riskLevel ?? "Critical",
          iatfClause: appr.iatfClause ?? "IATF 16949 §8.5.1 (Production Release Gate)",
          description:
            appr.description ??
            "Authorization for serial production release following successful completion of ARAI Stage 8 Type Approval TAC #842 and 18-point DVP&R environmental verification matrix.",
        };
      }
      if (appr.id === "demo-approval-ecn-002" || appr.id === "approval-ehw-ecn-002") {
        return {
          ...appr,
          requester: appr.requester ?? "Avery Vale (Embedded Hardware Lead)",
          requesterDepartment: (appr as any).requesterDepartment ?? "EHW",
          department: appr.department ?? "EHW",
          project: appr.project ?? "HLPL-AI4T-01 (Tata Ace EV 4G)",
          riskLevel: appr.riskLevel ?? "High",
          iatfClause: appr.iatfClause ?? "IATF 16949 §8.3.4 (Engineering Change Control)",
          description:
            appr.description ??
            "ECN-002: Layout thermal copper relief enhancement around TI Buck Regulator U4 and Vishay 36V TVS clamping diode to improve continuous high-temperature operating envelope up to +85°C.",
        };
      }
      if (appr.id === "demo-approval-fin-advance" || appr.id === "approval-fin-advance") {
        return {
          ...appr,
          requester: appr.requester ?? "Morgan Reed (Purchasing & SCM Lead)",
          requesterDepartment: (appr as any).requesterDepartment ?? "PUR",
          department: appr.department ?? "FIN",
          project: appr.project ?? "HLPL-AI4T-01 (Tata Ace EV 4G)",
          riskLevel: appr.riskLevel ?? "High",
          iatfClause: appr.iatfClause ?? "ISO 9001 §8.4 / IATF 16949 §8.4.2 (Advance Tooling & SCM Authorizations)",
          description:
            appr.description ??
            "Advance billing payment disbursement release of ₹14.50 Lakh for Molex sealed connector hard tooling and Quectel LTE Cat-1 modem engineering samples.",
        };
      }
      if (appr.id === "approval-pur-bom-01") {
        return {
          ...appr,
          requester: appr.requester ?? "Avery Vale (Embedded Hardware Lead)",
          requesterDepartment: (appr as any).requesterDepartment ?? "EHW",
          department: appr.department ?? "PUR",
          project: appr.project ?? "HLPL-AI4T-01 (Tata Ace EV 4G)",
          riskLevel: appr.riskLevel ?? "High",
          iatfClause: appr.iatfClause ?? "IATF 16949 §8.4.1 (Supplier Evaluation & SCM Review)",
          description:
            appr.description ??
            "Verification and commercial price freeze for 10-line automotive BOM including dual-source alternates and 14-week long-lead buffer order.",
        };
      }
      if (appr.id === "approval-sal-contract") {
        return {
          ...appr,
          requester: appr.requester ?? "Priya Sharma (Sales & BD Lead)",
          requesterDepartment: (appr as any).requesterDepartment ?? "SAL",
          department: appr.department ?? "SAL",
          project: appr.project ?? "HLPL-AI4T-01 (Tata Ace EV 4G)",
          riskLevel: appr.riskLevel ?? "High",
          iatfClause: appr.iatfClause ?? "IATF 16949 §8.2.3 (Review of Requirements for Products)",
          description:
            appr.description ??
            "Formal multi-HOD feasibility sign-off consolidation and commercial commitment lock for 50,000 units @ ₹20.33 Cr.",
        };
      }
      return {
        ...appr,
        requester: appr.requester ?? "Department Lead",
        requesterDepartment: (appr as any).requesterDepartment ?? "ENG",
        department: appr.department ?? "QA",
        project: appr.project ?? "HLPL-AI4T-01",
        riskLevel: appr.riskLevel ?? "Medium",
        iatfClause: appr.iatfClause ?? "IATF 16949 / ISO 9001",
        description: appr.description ?? "Controlled gateway review requiring designated human sign-off.",
      };
    });
  }, [approvals]);

  // STRICT Role-Based Department Isolation:
  // - Executive Admin: Full cross-company visibility over all 11 departments.
  // - Department Lead: ONLY sees approvals where their department is the designated Approver (department === userDept)
  //   OR their department is the Requester (requesterDepartment === userDept).
  // - Client: Read-only client gate views only.
  const visibleApprovals = useMemo(() => {
    return enrichedApprovals.filter((appr) => {
      if (!isLead) return true;
      const apprDept = (appr.department ?? "").toUpperCase();
      const reqDept = (appr.requesterDepartment ?? "").toUpperCase();
      return apprDept === userDept || reqDept === userDept;
    });
  }, [enrichedApprovals, isLead, userDept]);

  // Department Lead specific tab counts
  const pendingForMeCount = visibleApprovals.filter(
    (a) => (a.department ?? "").toUpperCase() === userDept && a.outcome === "Pending"
  ).length;

  const myRequestsCount = visibleApprovals.filter(
    (a) => (a.requesterDepartment ?? "").toUpperCase() === userDept
  ).length;

  const approvedCount = visibleApprovals.filter((a) => a.outcome === "Approved").length;
  const returnedCount = visibleApprovals.filter((a) => a.outcome === "Returned").length;
  const rejectedCount = visibleApprovals.filter((a) => a.outcome === "Rejected").length;

  // Final filtered list based on active view controls
  const filtered = useMemo(() => {
    return visibleApprovals.filter((appr) => {
      const apprDept = (appr.department ?? "").toUpperCase();
      const reqDept = (appr.requesterDepartment ?? "").toUpperCase();

      if (isLead) {
        if (leadTab === "ACTION_REQUIRED") {
          if (apprDept !== userDept || appr.outcome !== "Pending") return false;
        } else if (leadTab === "MY_REQUESTS") {
          if (reqDept !== userDept) return false;
        } else if (leadTab === "APPROVED") {
          if (appr.outcome !== "Approved") return false;
        } else if (leadTab === "RETURNED") {
          if (appr.outcome !== "Returned") return false;
        }
      } else {
        if (statusFilter !== "ALL" && appr.outcome !== statusFilter) return false;
        if (deptFilter !== "ALL" && appr.department !== deptFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = appr.title.toLowerCase().includes(q);
        const matchRef = appr.recordId.toLowerCase().includes(q);
        const matchReq = (appr.requester ?? "").toLowerCase().includes(q);
        const matchDesc = (appr.description ?? "").toLowerCase().includes(q);
        if (!matchTitle && !matchRef && !matchReq && !matchDesc) return false;
      }
      return true;
    });
  }, [visibleApprovals, isLead, leadTab, userDept, statusFilter, deptFilter, searchQuery]);

  const canUserActOnApproval = (appr: ApprovalRecord): boolean => {
    if (persona?.kind === "client") return false;
    if (!persona || persona.kind === "admin") return true;

    const apprDept = (appr.department ?? "").toUpperCase();
    if (userDept === apprDept) return true;
    if (userDept === "QA" && (appr.riskLevel === "Critical" && (apprDept === "QA" || apprDept === "EMF"))) return true;

    return false;
  };

  const canUserResubmit = (appr: ApprovalRecord): boolean => {
    if (appr.outcome !== "Returned") return false;
    if (persona?.kind === "admin") return true;
    const reqDept = (appr.requesterDepartment ?? "").toUpperCase();
    return userDept === reqDept;
  };

  const handleOpenAction = (appr: ApprovalRecord, type: "approve" | "reject" | "return" | "resubmit") => {
    setSelectedApproval(appr);
    setActionType(type);
    setActionNotes("");
  };

  const handleConfirmAction = () => {
    if (!selectedApproval || !actionType) return;
    if (actionType === "approve") {
      onApprove(selectedApproval.id, actionNotes || "Sign-off verified and approved under ISO/IATF compliance.");
    } else if (actionType === "reject") {
      onReject(selectedApproval.id, actionNotes || "Rejected due to non-conformance with requirements.");
    } else if (actionType === "return") {
      onReturn(selectedApproval.id, actionNotes || "Returned to requesting lead for revisions.");
    } else if (actionType === "resubmit") {
      onResubmit?.(selectedApproval.id, actionNotes || "Revised per reviewer feedback and resubmitted.");
    }
    setSelectedApproval(null);
    setActionType(null);
    setActionNotes("");
  };

  const handleCreateNewRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRecordId.trim()) return;

    onCreateRequest?.({
      title: newTitle.trim(),
      recordId: newRecordId.trim(),
      department: newTargetDept,
      requesterDepartment: userDept || "SAL",
      requester: currentUser,
      project: newProject,
      riskLevel: newRiskLevel,
      iatfClause: newClause,
      description: newDesc.trim() || "Official inter-department governance request requiring review.",
    });

    setIsNewRequestOpen(false);
    setNewTitle("");
    setNewRecordId("");
    setNewDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              GOVERNANCE & APPROVAL GATE
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldAlert className="size-6 text-amber-500" />
            Human Approvals & Governance Sign-Off Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
            Mandatory human engineering and commercial sign-offs under <strong>IATF 16949:2016</strong> and{" "}
            <strong>ISO 9001:2015</strong>. Cross-department approvals maintain complete audit trails with automatic
            feedback and rework notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLead && (
            <Button
              size="sm"
              onClick={() => setIsNewRequestOpen(true)}
              className="h-9 gap-1.5 bg-primary font-semibold text-xs text-primary-foreground shadow-sm"
            >
              <Plus className="size-4" />
              + Request Approval
            </Button>
          )}

          <div className="rounded-xl border border-border/60 bg-card px-4 py-2 text-right shadow-xs">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Signer Context
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 justify-end">
              <Lock className="size-3 text-emerald-500" />
              {currentUser} ({userRole})
            </span>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isLead ? "Awaiting My Sign-off" : "Pending Company Decisions"}
            </span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {isLead ? pendingForMeCount : visibleApprovals.filter((a) => a.outcome === "Pending").length}
            </span>
            <span className="text-xs text-muted-foreground">Action required</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Approved & Endorsed
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{approvedCount}</span>
            <span className="text-xs text-muted-foreground">Both departments synchronized</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Returned for Rework
            </span>
            <RotateCcw className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{returnedCount}</span>
            <span className="text-xs text-muted-foreground">Feedback provided</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scope & Compliance
            </span>
            <Award className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              {isLead ? `${userDept} Governance` : "IATF 16949 §8.3.4"}
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              100% Traceable
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 md:flex-row md:items-center md:justify-between shadow-xs">
        {/* Department Lead Context Tabs */}
        {isLead ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setLeadTab("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                leadTab === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All My Department ({visibleApprovals.length})
            </button>
            <button
              onClick={() => setLeadTab("ACTION_REQUIRED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                leadTab === "ACTION_REQUIRED"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Awaiting My Sign-off ({pendingForMeCount})
            </button>
            <button
              onClick={() => setLeadTab("MY_REQUESTS")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                leadTab === "MY_REQUESTS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Requested by {userDept} ({myRequestsCount})
            </button>
            <button
              onClick={() => setLeadTab("APPROVED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                leadTab === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Approved List ({approvedCount})
            </button>
            <button
              onClick={() => setLeadTab("RETURNED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                leadTab === "RETURNED"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Needs Rework ({returnedCount})
            </button>
          </div>
        ) : (
          /* Executive Admin Filter Tabs */
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All Decisions ({enrichedApprovals.length})
            </button>
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "Pending"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Pending Action ({enrichedApprovals.filter((a) => a.outcome === "Pending").length})
            </button>
            <button
              onClick={() => setStatusFilter("Approved")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "Approved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Approved ({enrichedApprovals.filter((a) => a.outcome === "Approved").length})
            </button>
            <button
              onClick={() => setStatusFilter("Returned")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "Returned"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Returned ({enrichedApprovals.filter((a) => a.outcome === "Returned").length})
            </button>
            <button
              onClick={() => setStatusFilter("Rejected")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "Rejected"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Rejected ({enrichedApprovals.filter((a) => a.outcome === "Rejected").length})
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Admin Department Selector */}
          {!isLead && (
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Departments</option>
                <option value="EHW">EHW · Embedded Hardware</option>
                <option value="ESW">ESW · Firmware & Software</option>
                <option value="MECH">MECH · Mechanical</option>
                <option value="PUR">PUR · Purchasing & SCM</option>
                <option value="QA">QA · Quality Assurance</option>
                <option value="EMF">EMF · Manufacturing</option>
                <option value="TST">TST · EOL Testing</option>
                <option value="FIN">FIN · Finance & Accounts</option>
                <option value="SAL">SAL · Sales & BD</option>
                <option value="SIT">SIT · Service & IT</option>
                <option value="HROPS">HR · Operations</option>
              </select>
            </div>
          )}

          {/* Search box */}
          <div className="relative min-w-56">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, record ID, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Main Approvals Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
            <FileCheck2 className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">No approvals match your current filter</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLead
                ? `No approval items currently active for ${userDept} under this view.`
                : "Try resetting your status or department filter."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isLead) setLeadTab("ALL");
                setStatusFilter("ALL");
                setDeptFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filtered.map((appr) => {
            const isPending = appr.outcome === "Pending";
            const isApproved = appr.outcome === "Approved";
            const isRejected = appr.outcome === "Rejected";
            const isReturned = appr.outcome === "Returned";

            const canAct = canUserActOnApproval(appr);
            const canResubmitItem = canUserResubmit(appr);

            const riskTone =
              appr.riskLevel === "Critical"
                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                : appr.riskLevel === "High"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                : "bg-blue-500/10 text-blue-600 border-blue-500/30";

            return (
              <div
                key={appr.id}
                className={`rounded-xl border bg-card p-5 transition-all shadow-xs ${
                  isPending
                    ? "border-amber-500/40 hover:border-amber-500/70"
                    : isApproved
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                    : isReturned
                    ? "border-amber-500/30 bg-amber-500/[0.02]"
                    : "border-rose-500/30 bg-rose-500/[0.02]"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {appr.recordId}
                      </span>
                      <span className="rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase bg-secondary text-secondary-foreground">
                        Approver: {appr.department}
                      </span>
                      {appr.requesterDepartment && (
                        <span className="rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase bg-muted text-muted-foreground">
                          Requester: {appr.requesterDepartment}
                        </span>
                      )}
                      <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${riskTone}`}>
                        Risk: {appr.riskLevel}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {appr.project}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground tracking-tight">{appr.title}</h3>

                    <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
                      {appr.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        Requested By: <strong className="text-foreground font-semibold">{appr.requester}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="size-3.5 text-muted-foreground" />
                        Updated: {appr.updatedAt}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-primary">
                        <Award className="size-3.5" />
                        {appr.iatfClause}
                      </span>
                    </div>

                    {/* Step 3: Approved Banner for BOTH approving and requesting departments */}
                    {isApproved && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          <strong>Digitally Endorsed & Approved</strong> by {appr.signedBy ?? "Authorized Lead"} on{" "}
                          {appr.signedAt ?? appr.updatedAt}.{" "}
                          {appr.comments && <em>“{appr.comments}”</em>}
                          <span className="ml-1 text-[11px] opacity-80">
                            (Synchronized across {appr.department} and {appr.requesterDepartment ?? "initiating"} departments)
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Step 2: Returned for Review / Rework Banner */}
                    {isReturned && (
                      <div className="mt-3 space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="font-bold">Returned for Engineering Rework / Correction</span>
                        </div>
                        <p className="pl-6 text-muted-foreground italic">
                          “{appr.comments ?? "Please modify design parameters to conform with IATF standard."}”
                        </p>
                        {canResubmitItem && (
                          <div className="pl-6 pt-1">
                            <Button
                              size="sm"
                              onClick={() => handleOpenAction(appr, "resubmit")}
                              className="h-7 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 shadow-xs"
                            >
                              <Send className="size-3" />
                              Resubmit with Corrections
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {isRejected && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-800 dark:text-rose-300">
                        <XCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>
                          <strong>Rejected</strong>: {appr.comments ?? "Does not meet compliance gating criteria."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    <div className="flex items-center gap-1.5">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Sign-off
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          Approved
                        </span>
                      ) : isReturned ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <RotateCcw className="size-3.5 text-amber-500" />
                          Returned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="size-3.5 text-rose-500" />
                          Rejected
                        </span>
                      )}
                    </div>

                    {isPending && (
                      canAct ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            data-testid="gate-approve-action"
                            onClick={() => handleOpenAction(appr, "approve")}
                            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve Gate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid="gate-return-action"
                            onClick={() => handleOpenAction(appr, "return")}
                            className="h-8 gap-1.5 text-xs px-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30"
                          >
                            <RotateCcw className="size-3.5" />
                            Return for Rework
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid="gate-reject-action"
                            onClick={() => handleOpenAction(appr, "reject")}
                            className="h-8 gap-1.5 text-xs px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                          >
                            <XCircle className="size-3.5" />
                            Reject Gate
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-steel/20 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Lock className="size-3 text-steel" />
                            {persona?.kind === "client"
                              ? "Client Audit View · Sign-off Restricted"
                              : `Awaiting ${appr.department ?? "Designated"} Lead Sign-off`}
                          </span>
                        </div>
                      )
                    )}

                    {!isPending && canAct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAction(appr, "approve")}
                        className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Re-evaluate Decision
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Dialog Modal (Approve, Return, Reject, Resubmit) */}
      {selectedApproval && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3">
              {actionType === "approve" ? (
                <div className="rounded-full bg-emerald-500/15 p-2.5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="size-6" />
                </div>
              ) : actionType === "reject" ? (
                <div className="rounded-full bg-rose-500/15 p-2.5 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <XCircle className="size-6" />
                </div>
              ) : actionType === "resubmit" ? (
                <div className="rounded-full bg-blue-500/15 p-2.5 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  <Send className="size-6" />
                </div>
              ) : (
                <div className="rounded-full bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <RotateCcw className="size-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {actionType === "approve"
                    ? "Confirm Governance Sign-off & Approval"
                    : actionType === "reject"
                    ? "Reject Approval Gate with Non-Conformance Note"
                    : actionType === "resubmit"
                    ? "Resubmit Corrected Approval Request"
                    : "Return Approval for Engineering Rework"}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Record ID: {selectedApproval.recordId} · {selectedApproval.project}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">{selectedApproval.title}</p>
              <p className="text-muted-foreground">{selectedApproval.description}</p>
              {actionType === "resubmit" && selectedApproval.comments && (
                <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-800 dark:text-amber-300">
                  <strong>Reviewer Feedback:</strong> “{selectedApproval.comments}”
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {actionType === "approve"
                  ? "Sign-off Endorsement Note (Optional)"
                  : actionType === "resubmit"
                  ? "Summary of Applied Corrections (Required)"
                  : "Non-Conformance / Modification Rationale (Required)"}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "e.g. Verified with ARAI report #842 and internal test fixture. Approved for serial pilot release."
                    : actionType === "resubmit"
                    ? "e.g. Updated thermal copper relief on layer 2 per review feedback. Resubmitting for sign-off."
                    : "e.g. Clarification needed on transient clamping voltage under ISO 7637-2 pulse 5b."
                }
                className="h-24 w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedApproval(null);
                  setActionType(null);
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                data-testid="confirm-gate-action"
                onClick={handleConfirmAction}
                className={`text-xs font-semibold text-white ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : actionType === "reject"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : actionType === "resubmit"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {actionType === "approve"
                  ? "Sign & Approve Gate"
                  : actionType === "reject"
                  ? "Confirm Rejection"
                  : actionType === "resubmit"
                  ? "Resubmit Request"
                  : "Confirm Return for Rework"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary border border-primary/20">
                <Plus className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Initiate New Cross-Department Approval</h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Originating from: {userDept} Lead ({currentUser})
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewRequestSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Target Approving Department
                </label>
                <select
                  value={newTargetDept}
                  onChange={(e) => setNewTargetDept(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="FIN">FIN · Finance & Accounts (Disbursements & Invoicing)</option>
                  <option value="QA">QA · Quality Assurance (Gates & Compliance)</option>
                  <option value="PUR">PUR · Purchasing & SCM (AVL & BOM Costing)</option>
                  <option value="EHW">EHW · Embedded Hardware (Schematics & ECNs)</option>
                  <option value="ESW">ESW · Firmware & Software (Release Stack)</option>
                  <option value="MECH">MECH · Mechanical (3D Tooling & CAD)</option>
                  <option value="EMF">EMF · Electronics Manufacturing (SMT Profiling)</option>
                  <option value="TST">TST · EOL Testing (PDI & Test Jigs)</option>
                  <option value="SAL">SAL · Sales & BD (Contract Reviews)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Approval Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SMT Line 2 Thermal Profile & Stencil Sign-off"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Record ID / Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecordId}
                    onChange={(e) => setNewRecordId(e.target.value)}
                    placeholder="e.g. HLPL-AI4T-EMF-CP-01"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Risk Classification
                  </label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  IATF 16949 / ISO Standard Clause
                </label>
                <input
                  type="text"
                  value={newClause}
                  onChange={(e) => setNewClause(e.target.value)}
                  placeholder="e.g. IATF 16949 §8.5.1 (Production Release)"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Scope & Engineering Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed justification and deliverable breakdown for the approving lead..."
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNewRequestOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-primary text-primary-foreground font-semibold"
                >
                  Submit Approval Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
