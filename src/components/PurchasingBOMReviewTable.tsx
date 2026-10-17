import React, { useState } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Building,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export type BOMReviewItem = {
  id: string;
  line: string;
  category: "Microcontroller" | "RF & Modem" | "Power & Protection" | "Connectors" | "Passives" | "Mechanical" | "Sensors";
  mpn: string;
  description: string;
  package: string;
  qtyPerDevice: number;
  rdSuggestedMfg: string;
  purchasingSourcedSupplier: string;
  leadTimeWeeks: number;
  stockStatus: "In Stock" | "Standard Lead" | "Long Lead Buffer" | "Allocated";
  targetCostUsd: number;
  quotedCostUsd: number;
  aecQualified: boolean;
  qualificationStandard: string;
  status: "Approved" | "Alternate Recommended" | "Long Lead Buffer Required" | "Pending R&D Clarification";
  notes: string;
};

export const defaultBOMReviewItems: BOMReviewItem[] = [
  {
    id: "BOM-01",
    line: "L01",
    category: "Microcontroller",
    mpn: "STM32G0B1VCT6",
    description: "Main Host MCU, ARM Cortex-M0+ 64MHz, 512KB Flash, 144KB RAM, dual CAN FD",
    package: "LQFP-100",
    qtyPerDevice: 1,
    rdSuggestedMfg: "STMicroelectronics",
    purchasingSourcedSupplier: "Arrow Electronics (Authorized)",
    leadTimeWeeks: 6,
    stockStatus: "In Stock",
    targetCostUsd: 4.80,
    quotedCostUsd: 4.65,
    aecQualified: true,
    qualificationStandard: "AEC-Q100 Grade 1 (-40°C to +125°C)",
    status: "Approved",
    notes: "Direct contract allocation for 50,000 units locked. 15,000 safety stock at Arrow Pune warehouse.",
  },
  {
    id: "BOM-02",
    line: "L02",
    category: "RF & Modem",
    mpn: "EG915N-EU",
    description: "LTE Cat-1 bis Cellular Wireless Modem + GNSS Receiver, Multi-band, eSIM ready",
    package: "LGA-126",
    qtyPerDevice: 1,
    rdSuggestedMfg: "Quectel Wireless Solutions",
    purchasingSourcedSupplier: "Quectel Direct / Rutronik",
    leadTimeWeeks: 14,
    stockStatus: "Long Lead Buffer",
    targetCostUsd: 12.50,
    quotedCostUsd: 11.90,
    aecQualified: true,
    qualificationStandard: "Automotive PPAP Level 3 / IATF 16949",
    status: "Long Lead Buffer Required",
    notes: "14-week lead time requires advance long-lead buffer PO for initial batch of 10,000 units by Week 16.",
  },
  {
    id: "BOM-03",
    line: "L03",
    category: "Power & Protection",
    mpn: "LMR14050SDDAR",
    description: "Step-Down Switching Buck Regulator 40V/5A, 9V-36V nominal operating input",
    package: "SO-PowerPAD-8",
    qtyPerDevice: 1,
    rdSuggestedMfg: "Texas Instruments",
    purchasingSourcedSupplier: "Avnet Logistics (Dual-source: Rutronik)",
    leadTimeWeeks: 4,
    stockStatus: "In Stock",
    targetCostUsd: 1.85,
    quotedCostUsd: 1.72,
    aecQualified: true,
    qualificationStandard: "AEC-Q100 Grade 1",
    status: "Approved",
    notes: "Dual-sourcing approved with Microchip MCP16301 alternate verified by Avery Vale (EHW).",
  },
  {
    id: "BOM-04",
    line: "L04",
    category: "Power & Protection",
    mpn: "SM5S24A-E3/2D",
    description: "Surface Mount TVS Diode, 3600W Peak Pulse, 24V Standoff for ISO 7637-2 load dump",
    package: "DO-218AB",
    qtyPerDevice: 1,
    rdSuggestedMfg: "Vishay Semiconductor",
    purchasingSourcedSupplier: "Arrow Electronics / Mouser Tier-1",
    leadTimeWeeks: 8,
    stockStatus: "Standard Lead",
    targetCostUsd: 1.40,
    quotedCostUsd: 1.35,
    aecQualified: true,
    qualificationStandard: "AEC-Q101 Qualified / ISO 7637-2 Pulse 5b",
    status: "Approved",
    notes: "High surge capability. Complies with 24V vehicle battery load dump test pulse 5b (87V @ 400ms).",
  },
  {
    id: "BOM-05",
    line: "L05",
    category: "Power & Protection",
    mpn: "TCAN1042VDRQ1",
    description: "Automotive High-Speed CAN Transceiver with Bus Fault Protection and 3.3V I/O",
    package: "SOIC-8",
    qtyPerDevice: 2,
    rdSuggestedMfg: "Texas Instruments",
    purchasingSourcedSupplier: "DigiKey Corporate / TI Direct",
    leadTimeWeeks: 6,
    stockStatus: "In Stock",
    targetCostUsd: 0.95,
    quotedCostUsd: 0.88,
    aecQualified: true,
    qualificationStandard: "AEC-Q100 Grade 0 / ISO 11898-2:2016",
    status: "Approved",
    notes: "Dual CAN buses (CAN_1 Vehicle Telemetry, CAN_2 Auxiliary Battery Sensor). ±58V fault protection.",
  },
  {
    id: "BOM-06",
    line: "L06",
    category: "Connectors",
    mpn: "MX150-33472-1601",
    description: "SAE J1962 16-Pin Sealed OBD-II Diagnostic Vehicle Interface Plug, Matte Tin",
    package: "16-Circuit Hybrid",
    qtyPerDevice: 1,
    rdSuggestedMfg: "Molex Automotive",
    purchasingSourcedSupplier: "Molex Direct / TTI Asia",
    leadTimeWeeks: 10,
    stockStatus: "Standard Lead",
    targetCostUsd: 3.20,
    quotedCostUsd: 3.10,
    aecQualified: true,
    qualificationStandard: "USCAR-2 Class III / IP54 Mated",
    status: "Approved",
    notes: "Meets 28N minimum pull-out retention force required by commercial automotive fleet OEMs.",
  },
  {
    id: "BOM-07",
    line: "L07",
    category: "Sensors",
    mpn: "LIS3DHTR",
    description: "MEMS Ultra-Low Power 3-Axis Accelerometer for Crash & Rash Driving Detection",
    package: "LGA-16",
    qtyPerDevice: 1,
    rdSuggestedMfg: "STMicroelectronics",
    purchasingSourcedSupplier: "Arrow Electronics",
    leadTimeWeeks: 5,
    stockStatus: "In Stock",
    targetCostUsd: 1.10,
    quotedCostUsd: 0.98,
    aecQualified: true,
    qualificationStandard: "AEC-Q100 Grade 3",
    status: "Approved",
    notes: "Embedded 32-level FIFO buffer for AIS-140 emergency rollover and harsh braking algorithm.",
  },
  {
    id: "BOM-08",
    line: "L08",
    category: "Mechanical",
    mpn: "HLPL-ENC-PCABS-01",
    description: "Custom Injection-Molded Enclosure Envelope (52.4 × 48.2 × 26.0 mm), Cycoloy PC/ABS",
    package: "Molded Shell",
    qtyPerDevice: 1,
    rdSuggestedMfg: "SABIC Innovative Plastics",
    purchasingSourcedSupplier: "Precision Tooling Tech Pune (Tier-1 SCM)",
    leadTimeWeeks: 12,
    stockStatus: "Standard Lead",
    targetCostUsd: 2.80,
    quotedCostUsd: 2.65,
    aecQualified: true,
    qualificationStandard: "UL94-V0 Flame Retardant / IP67 Silicone Mated",
    status: "Approved",
    notes: "Soft-tooling proto mold ready. Hardened production mold for 50k batch quoted at ₹4.2 Lakhs.",
  },
  {
    id: "BOM-09",
    line: "L09",
    category: "Power & Protection",
    mpn: "LP-602030-PCM",
    description: "Internal Rechargeable Li-Polymer Backup Battery 3.7V 350mAh with NTC and PCM",
    package: "Pouch Cell",
    qtyPerDevice: 1,
    rdSuggestedMfg: "EVE Energy / McNair",
    purchasingSourcedSupplier: "EVE Energy India / Maxell",
    leadTimeWeeks: 8,
    stockStatus: "Standard Lead",
    targetCostUsd: 2.10,
    quotedCostUsd: 2.05,
    aecQualified: true,
    qualificationStandard: "BIS R-41000000 / UN38.3 Transport Certified",
    status: "Approved",
    notes: "Mandatory BIS certification verified for Indian telematics homologation. Tested for 6-hr emergency tracking.",
  },
  {
    id: "BOM-10",
    line: "L10",
    category: "Passives",
    mpn: "CL31B106KAHNNNE",
    description: "Capacitor MLCC 10uF 25V X7R 1206 ±10% High Reliability Automotive",
    package: "SMD 1206",
    qtyPerDevice: 14,
    rdSuggestedMfg: "Samsung Electro-Mechanics",
    purchasingSourcedSupplier: "Murata Direct / TTI",
    leadTimeWeeks: 4,
    stockStatus: "In Stock",
    targetCostUsd: 0.84,
    quotedCostUsd: 0.78,
    aecQualified: true,
    qualificationStandard: "AEC-Q200 Grade 1",
    status: "Approved",
    notes: "Reel packaging of 2,000 pcs for high-speed SMT feeder lines.",
  },
];

export function PurchasingBOMReviewTable({
  projectId = "HLPL-OBD4-01",
  onReleaseToManufacturing,
}: {
  projectId?: string | undefined;
  onReleaseToManufacturing?: (() => void) | undefined;
}) {
  const [items, setItems] = useState<BOMReviewItem[]>(defaultBOMReviewItems);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.mpn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rdSuggestedMfg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purchasingSourcedSupplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalTargetCost = items.reduce((acc, item) => acc + item.targetCostUsd * item.qtyPerDevice, 0);
  const totalQuotedCost = items.reduce((acc, item) => acc + item.quotedCostUsd * item.qtyPerDevice, 0);
  const totalSavings = totalTargetCost - totalQuotedCost;
  const savingsPct = ((totalSavings / totalTargetCost) * 100).toFixed(1);
  const approvedCount = items.filter((item) => item.status === "Approved").length;
  const longLeadCount = items.filter((item) => item.leadTimeWeeks > 10).length;

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
    );
    showNotice(`Line item approved and locked for SCM procurement.`);
  };

  const handleSuggestAlternate = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Alternate Recommended",
              purchasingSourcedSupplier: `${item.purchasingSourcedSupplier} + Dual Source Added`,
            }
          : item
      )
    );
    showNotice(`Alternate source marked and logged for R&D review.`);
  };

  const handleFlagBuffer = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Long Lead Buffer Required" } : item
      )
    );
    showNotice(`Long-lead advance PO buffer flagged for Finance & Management approval.`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = "Line,Category,MPN,Description,Package,Qty,RD_Suggested_Mfg,Purchasing_Supplier,LeadTime_Wks,Stock_Status,Target_Cost_USD,Quoted_Cost_USD,AEC_Qualified,Status\n";
    const rows = items
      .map(
        (i) =>
          `"${i.line}","${i.category}","${i.mpn}","${i.description}","${i.package}",${i.qtyPerDevice},"${i.rdSuggestedMfg}","${i.purchasingSourcedSupplier}",${i.leadTimeWeeks},"${i.stockStatus}",${i.targetCostUsd},${i.quotedCostUsd},"${i.aecQualified ? "YES" : "NO"}","${i.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HLPL-${projectId}-PUR-BOM-REVIEW.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Purchasing Review BOM CSV exported successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="rounded-xl border border-steel/30 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                PUR · SCM Review Gate
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                IATF 16949 §8.4 Approved Supplier List (ASL)
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              R&D Preliminary BOM — Purchasing Review & SCM Allocation
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tentative component list proposed by Embedded Hardware & Mechanical Engineering for program{" "}
              <strong className="text-foreground">{projectId}</strong>. Purchasing team validates tier-1 authorized distributors, lead-time buffers, AEC-Q automotive grades, and volume tier pricing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm hover:bg-secondary"
            >
              <Download className="size-3.5" />
              Export SCM Review (.csv)
            </button>
            {onReleaseToManufacturing && (
              <button
                onClick={onReleaseToManufacturing}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <CheckCircle2 className="size-3.5" />
                Release BOM to Manufacturing (EMF)
              </button>
            )}
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 border-t border-border/40 pt-4">
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Total Line Items</span>
            <p className="mt-0.5 text-lg font-bold text-foreground">{items.length} Lines</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">100% R&D mapped</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Unit BOM Target</span>
            <p className="mt-0.5 text-lg font-bold text-foreground">${totalTargetCost.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground">50k annual volume target</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Quoted SCM Cost</span>
            <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ${totalQuotedCost.toFixed(2)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              -${totalSavings.toFixed(2)} ({savingsPct}% savings)
            </span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Critical Long Lead (&gt;10w)</span>
            <p className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">{longLeadCount} Items</p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Buffer PO Recommended</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">SCM Approval Rate</span>
            <p className="mt-0.5 text-lg font-bold text-foreground">
              {Math.round((approvedCount / items.length) * 100)}%
            </p>
            <span className="text-[10px] text-muted-foreground">{approvedCount} of {items.length} locked</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search MPN, description, manufacturer, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-muted-foreground">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="All">All Categories</option>
              <option value="Microcontroller">Microcontrollers</option>
              <option value="RF & Modem">RF & Modems</option>
              <option value="Power & Protection">Power & TVS</option>
              <option value="Connectors">Connectors</option>
              <option value="Sensors">Sensors</option>
              <option value="Passives">Passives</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Alternate Recommended">Alternate Recommended</option>
              <option value="Long Lead Buffer Required">Long Lead Buffer Required</option>
              <option value="Pending R&D Clarification">Pending R&D</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-muted-foreground">
          Showing <strong>{filteredItems.length}</strong> of {items.length} line items
        </span>
      </div>

      {/* Main Review Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-secondary/50 font-mono text-[11px] font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2.5">Line</th>
              <th className="px-3 py-2.5">Category &amp; R&amp;D MPN</th>
              <th className="px-3 py-2.5">Description &amp; Package</th>
              <th className="px-3 py-2.5 text-center">Qty</th>
              <th className="px-3 py-2.5">R&amp;D Mfg &amp; SCM Supplier</th>
              <th className="px-3 py-2.5">Lead Time</th>
              <th className="px-3 py-2.5">Target / Quoted</th>
              <th className="px-3 py-2.5">AEC-Q Grade</th>
              <th className="px-3 py-2.5">SCM Status</th>
              <th className="px-3 py-2.5 text-right">Purchasing Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredItems.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-3 py-3 font-mono font-bold text-steel">
                  {item.line}
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono font-bold text-foreground">{item.mpn}</div>
                  <span className="inline-block rounded bg-secondary px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                    {item.category}
                  </span>
                </td>
                <td className="px-3 py-3 max-w-xs">
                  <p className="line-clamp-2 text-foreground font-medium">{item.description}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">Pkg: {item.package}</span>
                </td>
                <td className="px-3 py-3 text-center font-mono font-bold text-foreground">
                  {item.qtyPerDevice}
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-foreground">{item.rdSuggestedMfg}</div>
                  <div className="font-mono text-[10px] text-steel flex items-center gap-1">
                    <Building className="size-3" />
                    {item.purchasingSourcedSupplier}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-semibold ${
                      item.leadTimeWeeks > 10
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-foreground"
                    }`}
                  >
                    <Clock className="size-3" />
                    {item.leadTimeWeeks} wks
                  </span>
                  <div className="text-[10px] text-muted-foreground">{item.stockStatus}</div>
                </td>
                <td className="px-3 py-3 font-mono">
                  <div className="text-muted-foreground line-through">${item.targetCostUsd.toFixed(2)}</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${item.quotedCostUsd.toFixed(2)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    {item.qualificationStandard.split(" ")[0]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === "Approved"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : item.status === "Long Lead Buffer Required"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : item.status === "Alternate Recommended"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            : "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.status !== "Approved" && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        title="Approve Component"
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleSuggestAlternate(item.id)}
                      title="Suggest Dual-Source Alternate"
                      className="rounded p-1 text-steel hover:bg-secondary"
                    >
                      <RefreshCw className="size-4" />
                    </button>
                    {item.leadTimeWeeks > 8 && (
                      <button
                        onClick={() => handleFlagBuffer(item.id)}
                        title="Flag Long-Lead Buffer PO"
                        className="rounded p-1 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                      >
                        <AlertTriangle className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
