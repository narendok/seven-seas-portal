import { useState, useId } from "react";
import {
  Users,
  Building2,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  Download,
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ChevronRight,
  UserPlus,
  Shield,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";

export type CustomerRecord = {
  id: string;
  code: string;
  name: string;
  division: string;
  spocName: string;
  spocEmail: string;
  spocPhone: string;
  cityState: string;
  gstin: string;
  status: "Active" | "Prospect" | "Inactive";
  activeOpportunitiesCount: number;
  assignedLead: string;
  createdAt: string;
};

export type EnquiryOpportunity = {
  id: string;
  reference: string;
  kind: "opportunity" | "enquiry";
  title: string;
  customerCode: string;
  customerName: string;
  spocName: string;
  spocEmail: string;
  scopeSummary: string;
  targetVolume: string;
  targetClosureDate: string;
  salesOwner: string;
  status:
    | "Pending Enquiry"
    | "Internal Review"
    | "Sent for Feasibility"
    | "Feasibility Complete"
    | "Baseline Locked"
    | "Project Started";
  feasibilitySignedDepts: string[];
  totalFeasibilityDepts: number;
  rfqReference?: string;
  linkedProjectCode?: string;
  createdAt: string;
  updatedAt: string;
};

export const defaultCustomers: CustomerRecord[] = [
  {
    id: "cust-tata-01",
    code: "CUST-TATA-01",
    name: "Tata Motors Limited",
    division: "EV Fleet Division · Commercial Vehicles",
    spocName: "Mr. Rajesh Sharma",
    spocEmail: "rajesh.sharma@tatamotors.com",
    spocPhone: "+91 98200 12345",
    cityState: "Pune, Maharashtra",
    gstin: "27AAACT2727Q1ZW",
    status: "Active",
    activeOpportunitiesCount: 1,
    assignedLead: "Riley Stone · Sales Lead",
    createdAt: "2026-09-10",
  },
  {
    id: "cust-slct-02",
    code: "CUST-SLCT-02",
    name: "Select Motors Limited",
    division: "Telematics & Connected Fleet Mobility",
    spocName: "Mr. Vikram Singhania",
    spocEmail: "vikram.s@selectmotors.in",
    spocPhone: "+91 98110 54321",
    cityState: "Noida, Uttar Pradesh",
    gstin: "07AABCS1234F1ZQ",
    status: "Active",
    activeOpportunitiesCount: 1,
    assignedLead: "Riley Stone · Sales Lead",
    createdAt: "2026-09-18",
  },
  {
    id: "cust-mhev-03",
    code: "CUST-MHEV-03",
    name: "Mahindra Electric Mobility Limited",
    division: "Electric 3W & Light Commercial Platforms",
    spocName: "Ms. Ananya Deshmukh",
    spocEmail: "ananya.d@mahindraelectric.com",
    spocPhone: "+91 98450 67890",
    cityState: "Bengaluru, Karnataka",
    gstin: "29AABCM9876K1ZS",
    status: "Prospect",
    activeOpportunitiesCount: 1,
    assignedLead: "Riley Stone · Sales Lead",
    createdAt: "2026-10-02",
  },
  {
    id: "cust-alfl-04",
    code: "CUST-ALFL-04",
    name: "Ashok Leyland Limited",
    division: "Heavy Commercial Vehicles · Fleet Solutions",
    spocName: "Mr. K. Ramanathan",
    spocEmail: "k.raman@ashokleyland.com",
    spocPhone: "+91 94440 11223",
    cityState: "Chennai, Tamil Nadu",
    gstin: "33AAACA1234B1ZK",
    status: "Prospect",
    activeOpportunitiesCount: 1,
    assignedLead: "Riley Stone · Sales Lead",
    createdAt: "2026-10-05",
  },
  {
    id: "cust-eskt-05",
    code: "CUST-ESKT-05",
    name: "Escorts Kubota Limited",
    division: "Agri-Machinery & Telematics Division",
    spocName: "Mr. Hardeep Singh",
    spocEmail: "hardeep.singh@escortskubota.com",
    spocPhone: "+91 98180 99887",
    cityState: "Faridabad, Haryana",
    gstin: "06AAACE4567M1ZX",
    status: "Active",
    activeOpportunitiesCount: 1,
    assignedLead: "Riley Stone · Sales Lead",
    createdAt: "2026-10-08",
  },
];

export const defaultEnquiriesOpportunities: EnquiryOpportunity[] = [
  {
    id: "opp-ai4t-01",
    reference: "OPP-AI4T-01",
    kind: "opportunity",
    title: "Tata Ace EV 4G AIS-140 Telematics Gateway",
    customerCode: "CUST-TATA-01",
    customerName: "Tata Motors Limited",
    spocName: "Mr. Rajesh Sharma",
    spocEmail: "rajesh.sharma@tatamotors.com",
    scopeSummary: "AIS-140 4G Cat-1 gateway, STM32 MCU, Dual CAN J1939, IP67 enclosure, emergency e-call battery.",
    targetVolume: "50,000 units / year",
    targetClosureDate: "2026-11-15",
    salesOwner: "Riley Stone",
    status: "Baseline Locked",
    feasibilitySignedDepts: ["EHW", "ESW", "MECH", "PUR", "QA", "FIN"],
    totalFeasibilityDepts: 6,
    rfqReference: "HLPL-AI4T-SAL-SOR-01",
    linkedProjectCode: "HLPL-AI4T-01",
    createdAt: "2026-09-12",
    updatedAt: "2026-10-14",
  },
  {
    id: "opp-slct-01",
    reference: "OPP-SLCT-01",
    kind: "opportunity",
    title: "Select Motors AIS-140 GPS Telematics Gateway",
    customerCode: "CUST-SLCT-02",
    customerName: "Select Motors Limited",
    spocName: "Mr. Vikram Singhania",
    spocEmail: "vikram.s@selectmotors.in",
    scopeSummary: "OBD-II 4G tracker, basic CAN logger, panic button inputs, automotive 12V/24V power supply.",
    targetVolume: "10,000 units / year",
    targetClosureDate: "2026-11-30",
    salesOwner: "Riley Stone",
    status: "Sent for Feasibility",
    feasibilitySignedDepts: ["EHW", "ESW", "PUR", "FIN"],
    totalFeasibilityDepts: 6,
    rfqReference: "HLPL-SLCT-SAL-SOR-01",
    linkedProjectCode: "HLPL-SLCT-01",
    createdAt: "2026-09-20",
    updatedAt: "2026-10-12",
  },
  {
    id: "enq-mhev-089",
    reference: "HLPL-2026-ENQ-089",
    kind: "enquiry",
    title: "Mahindra Treo EV Telematics & CAN Logger",
    customerCode: "CUST-MHEV-03",
    customerName: "Mahindra Electric Mobility Limited",
    spocName: "Ms. Ananya Deshmukh",
    spocEmail: "ananya.d@mahindraelectric.com",
    scopeSummary: "Custom 48V direct-input telematics unit for electric 3-wheelers with BLE diagnostics and GPS.",
    targetVolume: "20,000 units / year",
    targetClosureDate: "2026-12-15",
    salesOwner: "Riley Stone",
    status: "Pending Enquiry",
    feasibilitySignedDepts: [],
    totalFeasibilityDepts: 6,
    createdAt: "2026-10-02",
    updatedAt: "2026-10-04",
  },
  {
    id: "enq-alfl-104",
    reference: "HLPL-2026-ENQ-104",
    kind: "enquiry",
    title: "Ashok Leyland Boss Truck OBD-II & FMS Gateway",
    customerCode: "CUST-ALFL-04",
    customerName: "Ashok Leyland Limited",
    spocName: "Mr. K. Ramanathan",
    spocEmail: "k.raman@ashokleyland.com",
    scopeSummary: "FMS protocol compliant telematics unit with dual CAN channels for commercial trucking fleet.",
    targetVolume: "15,000 units / year",
    targetClosureDate: "2026-12-20",
    salesOwner: "Riley Stone",
    status: "Pending Enquiry",
    feasibilitySignedDepts: [],
    totalFeasibilityDepts: 6,
    createdAt: "2026-10-06",
    updatedAt: "2026-10-08",
  },
  {
    id: "enq-eskt-112",
    reference: "HLPL-2026-ENQ-112",
    kind: "enquiry",
    title: "Escorts Farmtrac Tractor ISOBUS & GPS Terminal",
    customerCode: "CUST-ESKT-05",
    customerName: "Escorts Kubota Limited",
    spocName: "Mr. Hardeep Singh",
    spocEmail: "hardeep.singh@escortskubota.com",
    scopeSummary: "Ruggedized ISOBUS display and GNSS guidance terminal with IP69K sealing for agricultural tractors.",
    targetVolume: "8,000 units / year",
    targetClosureDate: "2027-01-10",
    salesOwner: "Riley Stone",
    status: "Pending Enquiry",
    feasibilitySignedDepts: [],
    totalFeasibilityDepts: 6,
    createdAt: "2026-10-09",
    updatedAt: "2026-10-11",
  },
];

// Inline Customer Creation Modal
export function InlineCustomerModal({
  onClose,
  onCustomerCreated,
}: {
  onClose: () => void;
  onCustomerCreated: (customer: CustomerRecord) => void;
}) {
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [spocName, setSpocName] = useState("");
  const [spocEmail, setSpocEmail] = useState("");
  const [spocPhone, setSpocPhone] = useState("");
  const [cityState, setCityState] = useState("");
  const [gstin, setGstin] = useState("");
  const [status, setStatus] = useState<"Active" | "Prospect">("Active");
  const [assignedLead, setAssignedLead] = useState("Riley Stone · Sales Lead");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Customer Name is required.");
    if (!spocName.trim()) return setError("SPOC Contact Person is required.");

    const prefix = name
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 4)
      .toUpperCase();
    const code = `CUST-${prefix || "NEW"}-${String(Math.floor(10 + Math.random() * 89))}`;

    const newCust: CustomerRecord = {
      id: `cust-${Date.now()}`,
      code,
      name: name.trim(),
      division: division.trim() || "Automotive & Fleet Division",
      spocName: spocName.trim(),
      spocEmail: spocEmail.trim() || `${name.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
      spocPhone: spocPhone.trim() || "+91 98000 00000",
      cityState: cityState.trim() || "National / India",
      gstin: gstin.trim().toUpperCase() || "UNREGISTERED",
      status,
      activeOpportunitiesCount: 0,
      assignedLead,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCustomerCreated(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Inline Customer Creation</h3>
              <p className="text-xs text-muted-foreground">
                Master Plan §4 · Saves directly to Customer Master without leaving intake form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-foreground">Customer / Company Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Motors Limited"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">Division / Fleet Segment</label>
              <input
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="e.g. EV Commercial Vehicles"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-foreground">SPOC Contact Person *</label>
              <input
                required
                value={spocName}
                onChange={(e) => setSpocName(e.target.value)}
                placeholder="e.g. Mr. Rajesh Sharma"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">SPOC Email</label>
              <input
                type="email"
                value={spocEmail}
                onChange={(e) => setSpocEmail(e.target.value)}
                placeholder="rajesh.sharma@tatamotors.com"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-medium text-foreground">Phone / Mobile</label>
              <input
                value={spocPhone}
                onChange={(e) => setSpocPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">City & State</label>
              <input
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Pune, Maharashtra"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">GSTIN / Tax ID</label>
              <input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AAACT2727Q1ZW"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs uppercase focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-foreground">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Prospect")}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="Active">Active Automotive OEM / Tier-1</option>
                <option value="Prospect">Prospective Lead / Trial</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">Assigned Sales Lead</label>
              <select
                value={assignedLead}
                onChange={(e) => setAssignedLead(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="Riley Stone · Sales Lead">Riley Stone · Sales Lead</option>
                <option value="Priya Sharma · Head of Business Dev">Priya Sharma · Head of Business Dev</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
            >
              <CheckCircle2 className="size-3.5" />
              Save Customer & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Send for Feasibility Dispatch Modal
export function SendForFeasibilityModal({
  enquiry,
  onClose,
  onDispatch,
}: {
  enquiry: EnquiryOpportunity;
  onClose: () => void;
  onDispatch: (enquiryId: string, departments: string[], targetDate: string) => void;
}) {
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    "EHW",
    "ESW",
    "MECH",
    "PUR",
    "QA",
    "FIN",
  ]);
  const [dueDate, setDueDate] = useState("2026-11-05");
  const [notes, setNotes] = useState(
    "Please conduct comprehensive technical & commercial feasibility per IATF 16949 §8.2.3 and Master Plan §4.",
  );

  const availableDepts = [
    { code: "EHW", name: "Embedded Hardware (Avery Vale)", desc: "MCU, schematic, RF, TVS & 4-layer PCB" },
    { code: "ESW", name: "Firmware & Software (Devon Lane)", desc: "FreeRTOS, CAN J1939, AIS-140 MQTT, OTA" },
    { code: "MECH", name: "Mechanical Eng. (Samira Holt)", desc: "IP67 enclosure, thermal dissipation & connectors" },
    { code: "PUR", name: "Purchasing & SCM (Morgan Reed)", desc: "BOM costing, AEC-Q parts & supplier lead times" },
    { code: "QA", name: "Quality Assurance (Jordan Blake)", desc: "DVP&R matrix, AIS-140 test jigs & environmental" },
    { code: "FIN", name: "Accounts & Finance (Priya Voss)", desc: "Gross margin, NRE tooling recovery & tax close" },
  ];

  const toggleDept = (code: string) => {
    if (selectedDepts.includes(code)) {
      setSelectedDepts(selectedDepts.filter((c) => c !== code));
    } else {
      setSelectedDepts([...selectedDepts, code]);
    }
  };

  const handleConfirm = () => {
    onDispatch(enquiry.id, selectedDepts, dueDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Send className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Send for Multi-Department Feasibility</h3>
              <p className="text-xs text-muted-foreground">
                Converts Enquiry to Active Opportunity · Generates HLPL/F/MKT/01 Contract Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-primary">{enquiry.reference}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {enquiry.targetVolume}
              </span>
            </div>
            <p className="mt-1 font-semibold text-foreground">{enquiry.title}</p>
            <p className="text-[11px] text-muted-foreground">{enquiry.customerName} · {enquiry.spocName}</p>
          </div>

          <div>
            <label className="mb-1.5 block font-medium text-foreground">
              Participating Feasibility Departments (Select applicable)
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableDepts.map((dept) => {
                const checked = selectedDepts.includes(dept.code);
                return (
                  <button
                    type="button"
                    key={dept.code}
                    onClick={() => toggleDept(dept.code)}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                      checked
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {checked && <CheckCircle2 className="size-3" />}
                    </div>
                    <div>
                      <span className="font-bold">{dept.code}</span> · {dept.name}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{dept.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-foreground">Review Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground">Target Project Code (Auto-Reserved)</label>
              <input
                readOnly
                value="HLPL-AI4T-01"
                className="h-9 w-full rounded-md border border-input bg-muted/40 px-3 font-mono text-xs text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-foreground">Dispatch Instructions / Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedDepts.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              Dispatch & Create Opportunity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Managed Customer Register (.xlsx) Viewer & Export Modal
export function CustomerRegisterModal({
  customers,
  onClose,
  onAddCustomer,
}: {
  customers: CustomerRecord[];
  onClose: () => void;
  onAddCustomer: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.spocName.toLowerCase().includes(search.toLowerCase()) ||
      c.division.toLowerCase().includes(search.toLowerCase()) ||
      c.cityState.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      "Customer Code",
      "Customer Name",
      "Division / Segment",
      "SPOC Contact",
      "Email Address",
      "Phone Number",
      "City & State",
      "GSTIN / Tax ID",
      "Account Status",
      "Active Opportunities",
      "Assigned Sales Lead",
      "Registered Date",
    ];

    const rows = filtered.map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.division}"`,
      `"${c.spocName}"`,
      `"${c.spocEmail}"`,
      `"${c.spocPhone}"`,
      `"${c.cityState}"`,
      `"${c.gstin}"`,
      `"${c.status}"`,
      `"${c.activeOpportunitiesCount}"`,
      `"${c.assignedLead}"`,
      `"${c.createdAt}"`,
    ]);

    const content = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Customer_Register_HLPL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Customer Register.xlsx</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Managed Live Sheet · Sales Drive /01_Governance_and_QMS
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Authoritative Master Customer Register · IATF 16949:2016 §8.2.1 & ISO 9001:2015 §8.2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
            >
              <Download className="size-3.5" />
              Download .xlsx / .csv
            </button>
            <button
              onClick={onAddCustomer}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
            >
              <Plus className="size-3.5" />
              Add Customer
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative min-w-72 flex-1">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, code, SPOC, division or city..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            {["All", "Active", "Prospect"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterStatus === st
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-xs font-mono text-[11px] text-muted-foreground">
              <tr>
                <th className="p-3">Customer Code</th>
                <th className="p-3">Customer Name & Division</th>
                <th className="p-3">SPOC Contact</th>
                <th className="p-3">Contact Details</th>
                <th className="p-3">City / State</th>
                <th className="p-3">GSTIN / Tax ID</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Active Opps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-secondary/40">
                  <td className="p-3 font-mono font-semibold text-primary">{c.code}</td>
                  <td className="p-3">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.division}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-foreground">{c.spocName}</p>
                    <p className="text-[11px] text-muted-foreground">{c.assignedLead}</p>
                  </td>
                  <td className="p-3 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="size-3" />
                      <span>{c.spocEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="size-3" />
                      <span>{c.spocPhone}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.cityState}</td>
                  <td className="p-3 font-mono text-[11px] text-muted-foreground">{c.gstin}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {c.activeOpportunitiesCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>Showing {filtered.length} of {customers.length} registered customer accounts</span>
          <span className="font-mono">Last Synchronized: Today, Live (State-Connected)</span>
        </div>
      </div>
    </div>
  );
}

// Unified Enquiries & Opportunities View (Master Plan §4)
export function SalesEnquiriesAndOpportunities({
  customers,
  enquiries,
  onOpenNewEnquiry,
  onOpenCustomerRegister,
  onOpenFeasibilityGate,
  onSendForFeasibility,
}: {
  customers: CustomerRecord[];
  enquiries: EnquiryOpportunity[];
  onOpenNewEnquiry: () => void;
  onOpenCustomerRegister: () => void;
  onOpenFeasibilityGate: (projectCode: string) => void;
  onSendForFeasibility: (enquiry: EnquiryOpportunity) => void;
}) {
  const [filterTab, setFilterTab] = useState<
    "all" | "opportunities" | "enquiries" | "feasibility" | "locked"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = enquiries
    .filter((item) => {
      if (filterTab === "opportunities") return item.kind === "opportunity";
      if (filterTab === "enquiries") return item.kind === "enquiry";
      if (filterTab === "feasibility")
        return item.status === "Sent for Feasibility" || item.status === "Feasibility Complete";
      if (filterTab === "locked")
        return item.status === "Baseline Locked" || item.status === "Project Started";
      return true;
    })
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.reference.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.scopeSummary.toLowerCase().includes(q) ||
        item.spocName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Per Master Plan §4: Active Opportunities first, then Pending Enquiries
      if (a.kind === "opportunity" && b.kind === "enquiry") return -1;
      if (a.kind === "enquiry" && b.kind === "opportunity") return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const opportunitiesCount = enquiries.filter((e) => e.kind === "opportunity").length;
  const enquiriesCount = enquiries.filter((e) => e.kind === "enquiry").length;

  return (
    <div className="space-y-6">
      {/* Sales Action Bar & Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Opportunities
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{opportunitiesCount}</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              High Priority
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Prioritized in intake queue</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pending Enquiries
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{enquiriesCount}</span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              Awaiting Feasibility
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting review dispatch</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Customer Directory
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{customers.length}</span>
            <button
              onClick={onOpenCustomerRegister}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <FileSpreadsheet className="size-3" />
              Open .xlsx
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Managed accounts register</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Conversion Protocol
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-sm font-bold text-foreground">IATF §8.2.3</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              1-Click Gate
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Contract Review HLPL/F/MKT/01</p>
        </div>
      </section>

      {/* Main Section Header with Tabs, Search, and Action Buttons */}
      <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Enquiries & Opportunities</h2>
              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-primary">
                One Sales Flow (Master Plan §4)
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              One unified queue: Active opportunities first, then pending enquiries. Direct customer creation and feasibility dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCustomerRegister}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Customer Register.xlsx
            </button>
            <button
              onClick={onOpenNewEnquiry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
            >
              <Plus className="size-3.5" />
              New Enquiry
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filterTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              All Records ({enquiries.length})
            </button>
            <button
              onClick={() => setFilterTab("opportunities")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filterTab === "opportunities"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Active Opportunities ({opportunitiesCount})
            </button>
            <button
              onClick={() => setFilterTab("enquiries")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filterTab === "enquiries"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Pending Enquiries ({enquiriesCount})
            </button>
            <button
              onClick={() => setFilterTab("feasibility")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filterTab === "feasibility"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Under Feasibility
            </button>
            <button
              onClick={() => setFilterTab("locked")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filterTab === "locked"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Baseline Locked
            </button>
          </div>

          <div className="relative min-w-64">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enquiries, customer, ID..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Records Queue List */}
        <div className="mt-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-semibold text-foreground">No matching enquiries or opportunities</p>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing the search or adding a new enquiry.</p>
              <button
                onClick={onOpenNewEnquiry}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Plus className="size-3.5" />
                Create New Enquiry
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpportunity = item.kind === "opportunity";
              const isFeasible = item.status === "Baseline Locked" || item.status === "Project Started";
              const underReview = item.status === "Sent for Feasibility";

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                    isOpportunity
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Info */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                            isOpportunity
                              ? "bg-primary/10 text-primary"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isOpportunity ? "OPPORTUNITY" : "ENQUIRY"} · {item.reference}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isFeasible
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : underReview
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>

                        <span className="text-[11px] font-medium text-muted-foreground">
                          {item.targetVolume}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.scopeSummary}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="size-3 text-steel" />
                          <strong className="text-foreground">{item.customerName}</strong> ({item.spocName})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Target: {item.targetClosureDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          Owner: {item.salesOwner}
                        </span>
                      </div>
                    </div>

                    {/* Right: Feasibility Status & Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
                      {/* Feasibility Indicators */}
                      {isOpportunity ? (
                        <div className="flex flex-col items-end mr-2 text-right">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {item.feasibilitySignedDepts.length}/{item.totalFeasibilityDepts}
                            </span>
                            <span className="text-[11px] text-muted-foreground">HOD Sign-offs</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {["EHW", "ESW", "MECH", "PUR", "QA", "FIN"].map((d) => (
                              <span
                                key={d}
                                className={`rounded px-1 text-[9px] font-mono font-semibold ${
                                  item.feasibilitySignedDepts.includes(d)
                                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                    : "bg-muted text-muted-foreground/60"
                                }`}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right text-[11px] text-muted-foreground mr-2">
                          <span>Not sent for feasibility</span>
                        </div>
                      )}

                      {/* Primary Action Button */}
                      {isOpportunity ? (
                        <button
                          onClick={() => onOpenFeasibilityGate(item.linkedProjectCode || "HLPL-AI4T-01")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                        >
                          <Shield className="size-3.5" />
                          {isFeasible ? "View Baseline & Kick-off" : "Open Feasibility Gate"}
                          <ChevronRight className="size-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSendForFeasibility(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-400"
                        >
                          <Send className="size-3.5" />
                          Send for Feasibility
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
