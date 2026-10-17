import React, { useState } from "react";
import {
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  X,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { type CustomerRecord, defaultCustomers } from "./SalesWorkspaceAndCustomerRegister";

export type CustomerManagementFullPageViewProps = {
  customers: CustomerRecord[];
  onAddCustomer: (customer: CustomerRecord) => void;
  onBack: () => void;
  departmentRole?: "sales" | "fin" | "admin" | string;
};

export function CustomerManagementFullPageView({
  customers = defaultCustomers,
  onAddCustomer,
  onBack,
  departmentRole = "sales",
}: CustomerManagementFullPageViewProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [newSpocName, setNewSpocName] = useState("");
  const [newSpocEmail, setNewSpocEmail] = useState("");
  const [newSpocPhone, setNewSpocPhone] = useState("");
  const [newCityState, setNewCityState] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [newCreditTerms, setNewCreditTerms] = useState("Net 45 Days");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.spocName.toLowerCase().includes(search.toLowerCase()) ||
      c.division.toLowerCase().includes(search.toLowerCase()) ||
      c.cityState.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSpocName.trim()) return;

    const code = `CUST-${newName.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${(customers.length + 1).toString().padStart(2, "0")}`;
    const newRecord: CustomerRecord = {
      id: `cust-${Date.now()}`,
      code,
      name: newName.trim(),
      division: newDivision.trim() || "Corporate Division",
      spocName: newSpocName.trim(),
      spocEmail: newSpocEmail.trim() || "contact@client.com",
      spocPhone: newSpocPhone.trim() || "+91 98000 00000",
      cityState: newCityState.trim() || "Noida, Uttar Pradesh",
      gstin: newGstin.trim() || "09AAACH1234F1Z5",
      status: "Active",
      activeOpportunitiesCount: 1,
      assignedLead: departmentRole === "fin" ? "Priya Voss · Finance Lead" : "Priya Sharma · Sales Lead",
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newRecord);
    setCreateModalOpen(false);
    setNewName("");
    setNewDivision("");
    setNewSpocName("");
    setNewSpocEmail("");
    setNewSpocPhone("");
    setNewGstin("");
  };

  const handleExportCsv = () => {
    const headers = ["Customer Code", "Company Name", "Division", "SPOC Name", "Email", "Phone", "Location", "GSTIN", "Status", "Credit Terms"];
    const rows = filtered.map((c) => [
      c.code,
      `"${c.name}"`,
      `"${c.division}"`,
      `"${c.spocName}"`,
      c.spocEmail,
      c.spocPhone,
      `"${c.cityState}"`,
      c.gstin,
      c.status,
      "Net 45 Days",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customer_Register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-mono font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-xs uppercase text-primary font-bold">
              {departmentRole === "fin" ? "Accounts & Finance" : "Sales & Business Development"}
            </span>
          </div>
          <h1 className="mt-1 font-mono text-xl font-bold text-foreground flex items-center gap-2.5">
            <Building2 className="size-5 text-primary" />
            <span>Customer Master & OEM Accounts Directory</span>
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {departmentRole === "fin"
              ? "Official customer master ledger: verified GSTIN identification, credit terms, payment aging, and billing contacts."
              : "Enterprise OEM fleet client registry: key decision makers, active vehicle platforms, bilateral NDA verification, and RFQs."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-secondary transition-colors"
          >
            <Download className="size-3.5" />
            <span>Export Register (.csv)</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-[10px] uppercase text-muted-foreground">Active OEM Accounts</span>
          <p className="mt-1 text-xl font-bold text-foreground">{customers.length} Accounts</p>
          <span className="text-[10px] text-emerald-500 font-medium">100% Verified Bilateral NDA</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-[10px] uppercase text-emerald-500">Annual Fleet Commitment</span>
          <p className="mt-1 text-xl font-bold text-emerald-500">1,10,000 units</p>
          <span className="text-[10px] text-muted-foreground">Across 4 OEM Platforms</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-[10px] uppercase text-steel">Commercial Pipeline</span>
          <p className="mt-1 text-xl font-bold text-steel">₹48.95 Cr ($5.9M)</p>
          <span className="text-[10px] text-muted-foreground">Telematics Gateways & AIS-140</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <span className="text-[10px] uppercase text-moss">Credit Terms & Billing</span>
          <p className="mt-1 text-xl font-bold text-moss">Net 30 - 45 Days</p>
          <span className="text-[10px] text-muted-foreground">GST & E-Invoicing Compliant</span>
        </div>
      </div>

      {/* Main Customers Table Container */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table Filter & Search Header */}
        <div className="flex flex-col gap-3 border-b border-border bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Official Customer Register
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
              {filtered.length} Records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, SPOC, GSTIN, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-medium focus:border-primary focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Approved</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Full-width Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/20 font-mono text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Customer Code & Name</th>
                <th className="px-4 py-2.5">Division & Vehicle Platform</th>
                <th className="px-4 py-2.5">Key SPOC Contact</th>
                <th className="px-4 py-2.5">GSTIN / Tax ID</th>
                <th className="px-4 py-2.5">Location</th>
                <th className="px-4 py-2.5">Credit Terms</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/25 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-foreground block text-sm">{customer.name}</span>
                    <span className="inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground mt-0.5">
                      {customer.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground block">{customer.division}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {customer.code === "CUST-TATA-01"
                        ? "Tata Ace EV 4G Telematics (50,000 units)"
                        : customer.code === "CUST-AL-02"
                        ? "OBD-II Commercial Gateway (25,000 units)"
                        : "Fleet AIS-140 Gateway"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-foreground block">{customer.spocName}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        {customer.spocEmail}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" />
                        {customer.spocPhone}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-foreground bg-secondary/50 px-2 py-0.5 rounded">
                      {customer.gstin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-steel shrink-0" />
                      {customer.cityState}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-moss">
                      <CreditCard className="size-3" />
                      Net 45 Days
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        customer.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <CheckCircle2 className="size-3" />
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Inspection Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <div>
                  <h3 className="font-mono text-base font-bold text-foreground">
                    {selectedCustomer.name}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">{selectedCustomer.code} · {selectedCustomer.division}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="grid size-8 place-items-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">SPOC Contact Details</span>
                <p className="font-bold text-foreground">{selectedCustomer.spocName}</p>
                <p className="text-muted-foreground">{selectedCustomer.spocEmail}</p>
                <p className="text-muted-foreground">{selectedCustomer.spocPhone}</p>
                <p className="text-muted-foreground">{selectedCustomer.cityState}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Tax & Financial Terms</span>
                <p className="text-foreground"><span className="text-muted-foreground">GSTIN:</span> {selectedCustomer.gstin}</p>
                <p className="text-foreground"><span className="text-muted-foreground">Credit Terms:</span> Net 45 Days</p>
                <p className="text-foreground"><span className="text-muted-foreground">Billing Currency:</span> INR (₹) / USD ($)</p>
                <p className="text-emerald-500 font-semibold">Bilateral NDA: Signed & Active</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-muted-foreground font-bold">Linked Automotive Programs</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
                <div>
                  <p className="font-bold text-foreground">Tata Ace EV 4G AIS-140 Gateway (HLPL-AI4T-01)</p>
                  <p className="text-[10px] text-muted-foreground">50,000 units/year · ₹20.33 Cr ($2.45M) · IP67 CAN J1939</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  Active Run
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-border bg-secondary px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h3 className="font-mono text-sm font-bold text-foreground">Register New OEM Customer Account</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Company / OEM Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra Electric Automobiles Limited"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Division / Plant Location</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Electric Fleet Division · Chakan Plant, Pune"
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">SPOC Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Anil Deshmukh"
                    value={newSpocName}
                    onChange={(e) => setNewSpocName(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">SPOC Email</label>
                  <input
                    type="email"
                    placeholder="anil.d@mahindra.com"
                    value={newSpocEmail}
                    onChange={(e) => setNewSpocEmail(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98220 54321"
                    value={newSpocPhone}
                    onChange={(e) => setNewSpocPhone(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">City & State</label>
                  <input
                    type="text"
                    placeholder="Pune, Maharashtra"
                    value={newCityState}
                    onChange={(e) => setNewCityState(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27AAACM1234K1ZV"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-hidden font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Credit Terms</label>
                  <select
                    value={newCreditTerms}
                    onChange={(e) => setNewCreditTerms(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs focus:border-primary focus:outline-hidden"
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 45 Days">Net 45 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="LC at Sight">Letter of Credit (LC at Sight)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-border bg-secondary px-3.5 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-1.5 font-mono text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                >
                  Save & Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
