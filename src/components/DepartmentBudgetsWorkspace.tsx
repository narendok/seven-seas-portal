import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck2,
  AlertCircle,
  Plus,
  Plane,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Filter,
  Search,
  Building,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  type DepartmentAllocation,
  type ExpenseRequest,
  type BudgetCategory,
  DEFAULT_BUDGET_PERIOD,
  DEFAULT_DEPARTMENT_ALLOCATIONS,
  DEFAULT_EXPENSE_REQUESTS,
  calculateAvailableBudget,
  canUserApproveExpense,
  executeExpenseApproval,
  executeExpenseRejection,
  createExpenseRequest,
} from "@/lib/department-budgets";
import type { Persona } from "@/components/RoleAwareSidebar";

interface DepartmentBudgetsWorkspaceProps {
  persona: Persona;
  selectedProjectId?: string | null;
  onOpenProjectDetail?: (projectId: string) => void;
}

export function DepartmentBudgetsWorkspace({
  persona,
  selectedProjectId,
  onOpenProjectDetail,
}: DepartmentBudgetsWorkspaceProps) {
  if (persona.kind === "client") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
        <Lock className="mx-auto size-8 text-rose-600 dark:text-rose-400 mb-2" />
        <h3 className="text-sm font-bold text-foreground">Access Restricted — Internal Budgets</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Department budgets and expense claims are internal operational controls. Client accounts do not have access to internal company finances.
        </p>
      </div>
    );
  }

  const [allocations, setAllocations] = useState<DepartmentAllocation[]>(DEFAULT_DEPARTMENT_ALLOCATIONS);
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>(DEFAULT_EXPENSE_REQUESTS);
  const [activeTab, setActiveTab] = useState<"allocations" | "requests">("requests");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<BudgetCategory>("Consumables & Lab Supplies");
  const [newAmount, setNewAmount] = useState<string>("");
  const [newPurpose, setNewPurpose] = useState<string>("");
  const [newProject, setNewProject] = useState<string>(selectedProjectId || "HLPL-AI4T-01");
  const [newRequiredDate, setNewRequiredDate] = useState<string>("2026-11-01");
  const [isTravel, setIsTravel] = useState(false);
  const [travelDestination, setTravelDestination] = useState("");
  const [travelAdvance, setTravelAdvance] = useState("");
  const [isAsset, setIsAsset] = useState(false);
  const [assetSpec, setAssetSpec] = useState("");
  const [assetQty, setAssetQty] = useState("1");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isFinanceLead = persona.departmentId?.toLowerCase() === "fin";
  const isAdmin = persona.kind === "admin";
  const userDeptCode = persona.departmentId?.toUpperCase();

  // Filtered Allocations (scoped by persona authority)
  const filteredAllocations = allocations.filter((alloc) => {
    if (!isAdmin && !isFinanceLead) {
      if (userDeptCode && alloc.departmentCode !== userDeptCode) return false;
    } else {
      if (deptFilter !== "ALL" && alloc.departmentCode !== deptFilter) return false;
    }
    if (selectedProjectId && alloc.projectId && alloc.projectId !== selectedProjectId) return false;
    return true;
  });

  // Financial Metrics
  const totalAllocated = filteredAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  const totalCommitted = filteredAllocations.reduce((sum, a) => sum + a.committedAmount, 0);
  const totalSpent = filteredAllocations.reduce((sum, a) => sum + a.spentAmount, 0);
  const totalAvailable = totalAllocated - totalCommitted - totalSpent;

  // Filtered Requests (scoped by persona authority)
  const filteredRequests = expenseRequests.filter((req) => {
    if (persona.kind === "member") {
      const isSelf =
        (persona.id && req.requesterId === persona.id) ||
        (persona.person && req.requesterName.toLowerCase().includes(persona.person.toLowerCase()));
      if (!isSelf) return false;
    } else if (!isAdmin && !isFinanceLead) {
      if (userDeptCode && req.requesterDept !== userDeptCode) return false;
    } else {
      if (deptFilter !== "ALL" && req.requesterDept !== deptFilter) return false;
    }

    if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        req.reference.toLowerCase().includes(q) ||
        req.requesterName.toLowerCase().includes(q) ||
        req.purpose.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle Approve with Staged Transition & Overdraft Balance Verification
  const handleApprove = (reqId: string) => {
    const req = expenseRequests.find((r) => r.id === reqId);
    if (!req) return;

    const result = executeExpenseApproval(req, allocations, persona);
    setActionMessage(result.message);
    if (result.success && result.nextRequest) {
      setExpenseRequests((prev) => prev.map((r) => (r.id === reqId ? result.nextRequest! : r)));
      if (result.updatedAllocations) {
        setAllocations(result.updatedAllocations);
      }
    }
  };

  // Handle Reject with Reviewer Authorization Check
  const handleReject = (reqId: string) => {
    const req = expenseRequests.find((r) => r.id === reqId);
    if (!req) return;

    const result = executeExpenseRejection(req, persona, "Does not comply with departmental budget criteria.");
    setActionMessage(result.message);
    if (result.success && result.nextRequest) {
      setExpenseRequests((prev) => prev.map((r) => (r.id === reqId ? result.nextRequest! : r)));
    }
  };

  // Handle Create Request with Staged Routing
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newReq = createExpenseRequest(
      {
        category: newCategory,
        amount: amountVal,
        currency: "INR",
        purpose: newPurpose,
        projectId: newProject || null,
        requiredDate: newRequiredDate,
        ...(isTravel
          ? {
              travelDetail: {
                destination: travelDestination,
                startDate: newRequiredDate,
                endDate: newRequiredDate,
                purpose: newPurpose,
                transportEstimate: amountVal * 0.6,
                stayEstimate: amountVal * 0.3,
                dailyAllowanceEstimate: amountVal * 0.1,
                requestedAdvance: parseFloat(travelAdvance) || 0,
                advanceSettled: false,
              },
            }
          : {}),
        ...(isAsset
          ? {
              assetDetail: {
                itemSpecification: assetSpec,
                quantity: parseInt(assetQty, 10) || 1,
                targetLocation: "Hexense Tech Center",
                requiredDate: newRequiredDate,
              },
            }
          : {}),
      },
      persona
    );

    setExpenseRequests((prev) => [newReq, ...prev]);
    setIsNewRequestModalOpen(false);
    setNewAmount("");
    setNewPurpose("");
    setIsTravel(false);
    setIsAsset(false);
    setActionMessage(`Expense claim ${newReq.reference} submitted to ${newReq.currentApproverRole}.`);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Demo Seed Notice */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
            DEMO / Sandbox Seed
          </span>
          <span>
            Department budget allocations and ledger entries loaded in this local session. Staged approval gates and overdraft ledger checks are enforced.
          </span>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">
          Scoped Persona: <strong>{persona.person}</strong> ({persona.label})
        </div>
      </div>

      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              IATF 16949 §7.1.3 & §8.3.4 Governed
            </span>
            <span className="text-xs text-muted-foreground">{DEFAULT_BUDGET_PERIOD.name}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
            Department Budgets & Expense Requests
          </h2>
          <p className="text-xs text-muted-foreground">
            Department allocations, operational expense claims, travel advances, and asset requests with atomic commitment rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsNewRequestModalOpen(true)}
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            New Expense / Travel Request
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Approved Allocation</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">
            ₹{(totalAllocated / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Across 11 Departments</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Committed Reserves</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{(totalCommitted / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Unposted Approved POs/Claims</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Posted Actuals</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(totalSpent / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Settled & Verified Invoices</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Available Balance</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-black text-primary mt-1">
            ₹{(totalAvailable / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Allocation − Spent − Committed</div>
        </div>
      </div>

      {/* Navigation Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border/50 w-fit">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "requests" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expense & Travel Requests ({expenseRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("allocations")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "allocations" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Department Allocations ({allocations.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reference, purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring w-48 md:w-64"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Departments</option>
            <option value="EHW">EHW · Hardware</option>
            <option value="SAL">SAL · Sales & BD</option>
            <option value="PUR">PUR · Purchasing</option>
            <option value="QA">QA · Quality</option>
            <option value="FIN">FIN · Finance</option>
            <option value="HROPS">HR · Operations</option>
          </select>

          {activeTab === "requests" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending_Dept_Review">Dept Review</option>
              <option value="Pending_Finance">Pending Finance</option>
              <option value="Pending_Admin">Pending Admin</option>
              <option value="Approved">Approved</option>
              <option value="Settled">Settled</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === "requests" ? (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Reference / Requester</th>
                  <th className="py-2.5 px-3">Category & Scope</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Purpose & Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((req) => {
                  const check = canUserApproveExpense(req, persona);
                  const isRequesterSelf = req.requesterName.toLowerCase().includes(persona.person.toLowerCase());

                  return (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">{req.reference}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {req.requesterName} · <span className="font-semibold text-primary">{req.requesterDept}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground">{req.category}</div>
                        {req.projectId ? (
                          <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] font-mono rounded bg-secondary text-secondary-foreground font-semibold">
                            {req.projectId}
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] rounded bg-muted text-muted-foreground">
                            Dept Operational
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground text-sm">
                          ₹{req.amount.toLocaleString()}
                        </div>
                        {req.travelDetail?.requestedAdvance ? (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                            Advance: ₹{req.travelDetail.requestedAdvance.toLocaleString()}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="line-clamp-2 text-foreground font-normal">{req.purpose}</div>
                        {req.travelDetail && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                            <Plane className="w-3 h-3" />
                            <span>Destination: {req.travelDetail.destination}</span>
                          </div>
                        )}
                        {req.assetDetail && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                            <Package className="w-3 h-3" />
                            <span>{req.assetDetail.itemSpecification} (Qty: {req.assetDetail.quantity})</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : req.status === "Settled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : req.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {req.status === "Approved" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : req.status === "Rejected" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {req.status.replace(/_/g, " ")}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Approver: {req.currentApproverRole}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {req.status !== "Approved" && req.status !== "Settled" && req.status !== "Rejected" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {isRequesterSelf ? (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                                Self-approval prohibited
                              </span>
                            ) : check.canApprove ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(req.id)}
                                  className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(req.id)}
                                  className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                Requires {req.currentApproverRole}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Department & Category</th>
                  <th className="py-2.5 px-3">Project Link</th>
                  <th className="py-2.5 px-3">Allocated Amount</th>
                  <th className="py-2.5 px-3">Committed Reserves</th>
                  <th className="py-2.5 px-3">Posted Actuals</th>
                  <th className="py-2.5 px-3">Available Balance</th>
                  <th className="py-2.5 px-3">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAllocations.map((alloc) => {
                  const available = calculateAvailableBudget(alloc);
                  const utilPct = Math.min(100, Math.round(((alloc.spentAmount + alloc.committedAmount) / alloc.allocatedAmount) * 100));

                  return (
                    <tr key={alloc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">
                          {alloc.departmentName} ({alloc.departmentCode})
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{alloc.category}</div>
                      </td>

                      <td className="py-3 px-3">
                        {alloc.projectId ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-secondary text-secondary-foreground font-semibold">
                            {alloc.projectId}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">General Dept Scope</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-foreground">
                        ₹{alloc.allocatedAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">
                        ₹{alloc.committedAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{alloc.spentAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-primary">₹{available.toLocaleString()}</div>
                        <div className="w-24 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${utilPct > 90 ? "bg-rose-500" : utilPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${utilPct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {alloc.approvedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <Dialog open={isNewRequestModalOpen} onOpenChange={setIsNewRequestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">New Expense, Travel or Asset Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitted under IATF 16949 / ISO 9001 governance. Subject to available department budget.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-3.5 mt-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Expense Category</label>
              <select
                value={newCategory}
                onChange={(e) => {
                  const cat = e.target.value as BudgetCategory;
                  setNewCategory(cat);
                  setIsTravel(cat === "Travel & Transport" || cat === "Accommodation & Stay");
                  setIsAsset(cat === "Equipment & Tools (CapEx)");
                }}
                className="w-full h-8 px-2 rounded-lg border border-input bg-background text-xs"
              >
                <option value="Consumables & Lab Supplies">Consumables & Lab Supplies</option>
                <option value="Travel & Transport">Travel & Transport</option>
                <option value="Accommodation & Stay">Accommodation & Stay</option>
                <option value="Equipment & Tools (CapEx)">Equipment & Tools (CapEx)</option>
                <option value="Software & Subscriptions">Software & Subscriptions</option>
                <option value="Maintenance & Calibration">Maintenance & Calibration</option>
                <option value="Training & Certifications">Training & Certifications</option>
                <option value="Office & Operations">Office & Operations</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Estimated Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-input bg-background text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Required By Date</label>
                <input
                  type="date"
                  value={newRequiredDate}
                  onChange={(e) => setNewRequiredDate(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-input bg-background text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Linked Project (Optional)</label>
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border border-input bg-background text-xs font-mono"
              >
                <option value="">None (Department Operational Expense)</option>
                <option value="HLPL-AI4T-01">HLPL-AI4T-01 · Tata Ace EV 4G</option>
                <option value="HLPL-SLCT-01">HLPL-SLCT-01 · Select Motors AIS-140</option>
                <option value="HLPL-XLINK-03">HLPL-XLINK-03 · CV Dual-CAN Gateway</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Business Purpose & Justification</label>
              <textarea
                rows={2}
                required
                placeholder="Explain justification, scope, and technical requirement..."
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                className="w-full p-2 rounded-lg border border-input bg-background text-xs resize-none"
              />
            </div>

            {isTravel && (
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Travel Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Destination (e.g. Pune OEM)"
                    value={travelDestination}
                    onChange={(e) => setTravelDestination(e.target.value)}
                    className="h-7 px-2 rounded border border-input bg-background text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Advance Requested (INR)"
                    value={travelAdvance}
                    onChange={(e) => setTravelAdvance(e.target.value)}
                    className="h-7 px-2 rounded border border-input bg-background text-xs"
                  />
                </div>
              </div>
            )}

            {isAsset && (
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
                  <Package className="w-3.5 h-3.5" />
                  <span>Equipment / Asset Specification</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Specification / Make"
                    value={assetSpec}
                    onChange={(e) => setAssetSpec(e.target.value)}
                    className="col-span-2 h-7 px-2 rounded border border-input bg-background text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={assetQty}
                    onChange={(e) => setAssetQty(e.target.value)}
                    className="h-7 px-2 rounded border border-input bg-background text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
