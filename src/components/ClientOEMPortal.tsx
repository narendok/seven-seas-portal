import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Award,
  Truck,
  Download,
  Eye,
  Calendar,
  Building,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  Clock,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

export interface ClientOEMPortalProps {
  onOpenDocument?: (docId: string) => void;
}

export function ClientOEMPortal({
  onOpenDocument,
}: ClientOEMPortalProps) {
  const deliverables = [
    {
      id: "HLPL-AI4T-SAL-SOR-01",
      code: "SOR-01",
      title: "Customer Statement of Requirements (SOR)",
      category: "Requirements",
      standard: "IATF 16949 §8.2.1",
      status: "Customer Approved",
      date: "2026-08-15",
      owner: "Priya Sharma (Sales & BD)",
      description:
        "Official technical and operational customer requirements baseline for Tata Ace EV 4G Telematics Gateway (50,000 units).",
    },
    {
      id: "HLPL-AI4T-SAL-mNDA-01",
      code: "mNDA-01",
      title: "Bilateral Mutual Non-Disclosure Agreement",
      category: "Legal & Confidentiality",
      standard: "ISO/IEC 27001 §A.13",
      status: "Executed & Active",
      date: "2026-08-10",
      owner: "Legal & Executive Admin",
      description:
        "Mutual proprietary data and automotive IP protection agreement executed between Tata Motors Ltd and XYZ Pvt Ltd.",
    },
    {
      id: "HLPL-AI4T-SAL-QUO-01",
      code: "QUO-01",
      title: "Commercial Quotation & Volume Tier Agreement",
      category: "Commercial",
      standard: "Contract Baseline",
      status: "Locked & Approved",
      date: "2026-09-02",
      owner: "Priya Sharma (Sales & BD)",
      description:
        "Commercial contract locking unit pricing, annual commitment of 50,000 units (₹20,33,50,000), payment milestones, and warranty SLAs.",
    },
    {
      id: "QA-TAC-01",
      code: "TAC-01",
      title: "ARAI / ICAT Type Approval Certificate (TAC #842)",
      category: "Certification",
      standard: "AIS-140 Annexure 3 & 8",
      status: "Type Approved (ARAI)",
      date: "2026-10-05",
      owner: "Jordan Blake (Quality Assurance)",
      description:
        "Official compliance certificate for automotive AIS-140 intelligent telematics, Indian NavIC/GPS positioning, and emergency alerts.",
    },
    {
      id: "TST-PDI-01",
      code: "PDI-01",
      title: "Pre-Delivery Inspection (PDI) 100% Quality Certificate",
      category: "Quality Release",
      standard: "IATF 16949 §8.6",
      status: "Cleared (0 Defects)",
      date: "2026-10-16",
      owner: "Mina Cross (EOL Testing)",
      description:
        "Automated EOL Jig batch verification report confirming 100% firmware flashing, RF calibration, CAN telemetry, and zero-defect release.",
    },
    {
      id: "FIN-INV-01",
      code: "INV-01",
      title: "Commercial Tax Invoice & Dispatch Authorization",
      category: "Finance & Tax",
      standard: "GST Compliant · HSN 8526",
      status: "Released",
      date: "2026-10-17",
      owner: "Priya Voss (Finance & Accounts)",
      description:
        "Official commercial tax invoice, e-way bill authorization, and batch delivery documentation for Batch 01 shipment.",
    },
    {
      id: "HLPL-OBD4-SIT-MNT-01",
      code: "MNT-01",
      title: "Vehicle Field Installation & Mounting Manual",
      category: "Field Operations",
      standard: "ISO 20653 IP67 Protocol",
      status: "Released to OEM",
      date: "2026-10-12",
      owner: "Kai Morgan (Service & IT)",
      description:
        "Step-by-step automotive installation guide, pinout wiring diagram, CAN bus integration, and IP67 sealed mounting instructions.",
    },
  ];

  const milestones = [
    { stage: "Stage 1", name: "Intake & SOR", status: "Completed", date: "Aug 2026" },
    { stage: "Stage 2", name: "Multi-HOD Feasibility", status: "Completed", date: "Aug 2026" },
    { stage: "Stage 3", name: "Commercial & PRS Lock", status: "Completed", date: "Sep 2026" },
    { stage: "Stage 4", name: "PoC & Schematics", status: "Completed", date: "Sep 2026" },
    { stage: "Stage 5", name: "Pilot SMT Line 2", status: "Completed", date: "Sep 2026" },
    { stage: "Stage 6", name: "DVP&R 18 Tests", status: "Completed", date: "Oct 2026" },
    { stage: "Stage 7", name: "PPAP Level 3", status: "Completed", date: "Oct 2026" },
    { stage: "Stage 8", name: "AIS-140 TAC Approval", status: "Completed", date: "Oct 2026" },
    { stage: "Stage 9", name: "PDI & Batch Dispatch", status: "Active Release", date: "Current" },
  ];

  return (
    <div className="space-y-6">
      {/* Client OEM Portal Hero Header */}
      <div className="rounded-2xl border border-border/80 bg-linear-to-r from-card via-card to-blue-500/5 p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                OEM Stakeholder Portal
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ISO 27001 §A.9 Secured
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Client ID: OEM-TATA-PUNE-2026
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Tata Motors Limited · EV Fleet Solutions Portal
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Authorized stakeholder delivery interface for <strong>HLPL-AI4T-01</strong> (Tata Ace EV 4G Telematics Gateway — 50,000 units annual deployment).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-border/70 bg-card/80 px-3.5 py-1.5 text-right">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">Lead OEM Contact</p>
              <p className="text-xs font-bold text-foreground">Mr. Rohan Verma (Fleet Manager)</p>
            </div>
          </div>
        </div>

        {/* High-Level Program Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Vehicle Platform</p>
            <p className="mt-1 text-sm font-bold text-foreground">Tata Ace EV Commercial</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">AIS-140 Compliant</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Contract Commitment</p>
            <p className="mt-1 text-sm font-bold text-foreground">50,000 Units</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">₹20.33 Cr / $2.45M</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Batch 01 Delivery</p>
            <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">5,000 Units Ready</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">PDI 100% Cleared</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Certification</p>
            <p className="mt-1 text-sm font-bold text-foreground">ARAI TAC #842</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Valid through 2029</p>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">OEM Warranty SLA</p>
            <p className="mt-1 text-sm font-bold text-foreground">36 Months</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">24h Replacement</p>
          </div>
        </div>
      </div>

      {/* Program Milestone Progress Stepper */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">
              OEM Milestone & Delivery Gate Timeline
            </h2>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Stage 8 / 9 Approved · 94% Complete
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {milestones.map((m, index) => {
            const isDone = index < 8;
            const isActive = index === 8;
            return (
              <div
                key={m.stage}
                className={`relative flex flex-col justify-between rounded-xl border p-2.5 transition-all ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                    : isActive
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold">{m.stage}</span>
                  {isDone ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : (
                    <Clock className="size-3 text-primary animate-pulse" />
                  )}
                </div>
                <div className="my-2">
                  <p className="text-xs font-bold leading-snug truncate" title={m.name}>
                    {m.name}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>{m.date}</span>
                  <span
                    className={
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-primary font-bold"
                    }
                  >
                    {isDone ? "PASS" : "ACTIVE"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Deliverables & Released Documents */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="size-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Released OEM Deliverables & Controlled Documents
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authorized customer documents released under IATF 16949 / ISO 9001 governance for Tata Motors verification.
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {deliverables.length} Released Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {deliverables.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-secondary/20 p-4 transition-all hover:border-border hover:bg-secondary/40 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {doc.code}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {doc.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-foreground sm:text-sm">
                    {doc.title}
                  </h3>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    Doc ID: {doc.id} · {doc.standard}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  Released: {doc.date}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenDocument?.(doc.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/50 transition-colors shadow-xs"
                >
                  <Eye className="size-3.5 text-primary" />
                  <span>Inspect Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch & Delivery Logistics Tracker */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-foreground">
            Production Dispatch & Vehicle Mounting Logistics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                BATCH 01 · 5,000 UNITS
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                DISPATCH READY
              </span>
            </div>
            <p className="text-xs text-foreground font-semibold">
              Pre-Delivery Inspection Passed · Sealed Packaging Verified
            </p>
            <p className="text-xs text-muted-foreground">
              All 5,000 units verified with ARAI AIS-140 QR labels, IP67 mating gaskets, and individual serialization certificates. Authorized for delivery to Tata Motors Pune / Sanand assembly plants.
            </p>
            <div className="pt-2 text-[11px] font-mono text-muted-foreground">
              Dispatch Window: October 2026 · Carrier: Safexpress Automotive Direct
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground">
                BATCH 02 · 10,000 UNITS
              </span>
              <span className="rounded-full bg-secondary border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                SCHEDULED SMT
              </span>
            </div>
            <p className="text-xs text-foreground font-semibold">
              SMT Line 2 Automated Production Queue
            </p>
            <p className="text-xs text-muted-foreground">
              Long-lead components secured in buffer inventory. Production run scheduled following vehicle fitment validation of Batch 01.
            </p>
            <div className="pt-2 text-[11px] font-mono text-muted-foreground">
              Scheduled Completion: November 2026 · Target Volume: 10,000 units
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
