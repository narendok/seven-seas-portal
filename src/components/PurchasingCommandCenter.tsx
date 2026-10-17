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
  Building,
  FileText,
  Plus,
  FileCheck,
  Calendar,
  DollarSign,
  Check,
  Truck,
  ArrowRight,
  Package,
  BadgeCheck,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  LiveInventoryWorkspace,
  type InventoryItem,
  type InventoryMovement,
  type InventoryAssignment,
  type InventoryCategory,
} from "./LiveInventoryWorkspace";
import { PurchasingBOMReviewTable } from "./PurchasingBOMReviewTable";

// =============================================================================
// TYPES & DATA CONTRACTS
// =============================================================================

export type SupplierRecord = {
  id: string;
  name: string;
  vendorCode: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  
  // Warranty Terms
  warrantyPeriod: string; // e.g. "24 Months Automotive Replacement"
  rmaTatDays: string; // e.g. "5 Business Days"
  warrantyCoverage: string; // e.g. "100% replacement for electrical parametric failure, solderability defect"
  
  // Supplier Validity & Accreditations
  iatfExpiryDate: string; // e.g. "2027-12-31"
  iso9001ExpiryDate: string; // e.g. "2028-06-30"
  vda63AuditScore: string; // e.g. "96% (Grade A - Approved)"
  approvalStatus: "Active Approved" | "Conditional Audit" | "Under Review";
  lastAuditDate: string;
  nextAuditDueDate: string;
  
  // Related Documentation
  ppapDossierStatus: "Approved Level 3" | "Pending Submission" | "Under Review";
  ppapDossierFileName?: string;
  mutualNdaStatus: "Signed & Active" | "Draft" | "Renewal Pending";
  mutualNdaFileName?: string;
  qualityCertificateFileName?: string;
  gstNumber: string;
  bankDetailsVerified: boolean;
  rohsReachStatus: "100% Compliant" | "Pending Declaration";
};

export type PurchaseOrderRecord = {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  componentMpn: string;
  description: string;
  
  // Quantities & Sales Volume Estimation
  estimatedQuantity: number;
  annualSalesTarget: number; // e.g. 50,000 units
  coveragePercent: number; // e.g. 30%
  batchSchedule: string; // e.g. "Batch 1: 5,000 pcs · Batch 2: 10,000 pcs"
  
  // Commercials
  unitCostUsd: number;
  unitCostInr: number;
  totalAmountUsd: number;
  totalAmountInr: number;
  
  // Linkages to Supplier
  warrantyInherited: string;
  supplierValidityStatus: string;
  
  // Workflow Status
  status: "Draft" | "Pending HOD Approval" | "PO Issued to Vendor" | "Partially Received" | "GRN Fulfilled";
  orderDate: string;
  deliveryEta: string;
  linkedGrnId?: string;
  receivedQuantity: number;
  notes: string;
};

export type SupplierQuotationRecord = {
  id: string;
  quotationNumber: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  targetPartMpn: string;
  description: string;
  
  // Pricing Tiers
  tier1kUsd: number;
  tier1kInr: number;
  tier10kUsd: number;
  tier10kInr: number;
  tier50kUsd: number;
  tier50kInr: number;
  
  quotedLeadTimeWeeks: number;
  warrantyTermsQuoted: string;
  validityExpiry: string;
  status: "Approved & Locked" | "Under Review" | "Converted to PO";
  convertedPoNumber?: string;
  notes: string;
};

// =============================================================================
// INITIAL SEED DATA
// =============================================================================

export const defaultSuppliers: SupplierRecord[] = [
  {
    id: "sup-mouser",
    name: "Mouser Electronics India",
    vendorCode: "VND-MSR-01",
    category: "Electronic Components & Authorized Distribution",
    contactPerson: "Rahul Sengupta (Regional OEM Manager)",
    email: "oem.sales@mouser.com",
    phone: "+91 80 4265 0000",
    location: "Bengaluru Technology Center / Global Distribution",
    warrantyPeriod: "24 Months Automotive Replacement Warranty",
    rmaTatDays: "5 Business Days Advance Replacement",
    warrantyCoverage: "100% immediate credit or replacement for electrical parametric failure, reel defects, or moisture damage.",
    iatfExpiryDate: "2027-12-31",
    iso9001ExpiryDate: "2028-06-30",
    vda63AuditScore: "96% (Grade A - Approved Automotive Distributor)",
    approvalStatus: "Active Approved",
    lastAuditDate: "2026-03-15",
    nextAuditDueDate: "2027-03-15",
    ppapDossierStatus: "Approved Level 3",
    ppapDossierFileName: "PPAP-MSR-STM32-L3.pdf",
    mutualNdaStatus: "Signed & Active",
    mutualNdaFileName: "HLPL-MSR-mNDA-2026.pdf",
    qualityCertificateFileName: "ISO9001_AS9120_Mouser_Cert.pdf",
    gstNumber: "29AABCM1234F1Z5",
    bankDetailsVerified: true,
    rohsReachStatus: "100% Compliant",
  },
  {
    id: "sup-arrow",
    name: "Arrow Electronics Pune",
    vendorCode: "VND-ARW-02",
    category: "Semiconductors & Passives Direct",
    contactPerson: "Vikram Rathore (Key Account Director)",
    email: "vrathore@arrow.com",
    phone: "+91 20 6711 4000",
    location: "Magarpatta Cybercity, Pune, Maharashtra",
    warrantyPeriod: "24 Months Automotive Manufacturer Warranty",
    rmaTatDays: "7 Business Days",
    warrantyCoverage: "Full component replacement with direct STMicroelectronics & Texas Instruments factory root cause analysis.",
    iatfExpiryDate: "2027-09-30",
    iso9001ExpiryDate: "2028-04-15",
    vda63AuditScore: "94% (Grade A - Approved)",
    approvalStatus: "Active Approved",
    lastAuditDate: "2026-02-10",
    nextAuditDueDate: "2027-02-10",
    ppapDossierStatus: "Approved Level 3",
    ppapDossierFileName: "PPAP-ARW-TI-ST-L3.pdf",
    mutualNdaStatus: "Signed & Active",
    mutualNdaFileName: "HLPL-ARW-mNDA-2025.pdf",
    qualityCertificateFileName: "IATF16949_Arrow_Pune.pdf",
    gstNumber: "27AAACA5678B1Z2",
    bankDetailsVerified: true,
    rohsReachStatus: "100% Compliant",
  },
  {
    id: "sup-quectel",
    name: "Quectel Wireless Solutions",
    vendorCode: "VND-QCT-03",
    category: "Cellular 4G Cat-1 & GNSS Modules",
    contactPerson: "Dennis Zhang / Amit Deshmukh",
    email: "support.india@quectel.com",
    phone: "+91 120 456 7890",
    location: "Noida Sector 62 / Shanghai High-Tech Park",
    warrantyPeriod: "36 Months Automotive Grade Warranty",
    rmaTatDays: "10 Business Days",
    warrantyCoverage: "Hardware module replacement, firmware FOTA patch support, and RF carrier TAC re-testing guarantee.",
    iatfExpiryDate: "2027-11-15",
    iso9001ExpiryDate: "2028-08-20",
    vda63AuditScore: "95% (Grade A - Approved)",
    approvalStatus: "Active Approved",
    lastAuditDate: "2026-01-20",
    nextAuditDueDate: "2027-01-20",
    ppapDossierStatus: "Approved Level 3",
    ppapDossierFileName: "PPAP-QCT-EG915N-EU-L3.pdf",
    mutualNdaStatus: "Signed & Active",
    mutualNdaFileName: "HLPL-QCT-mNDA-2025.pdf",
    qualityCertificateFileName: "IATF16949_Quectel_Cert.pdf",
    gstNumber: "07AAACQ9876C1Z9",
    bankDetailsVerified: true,
    rohsReachStatus: "100% Compliant",
  },
  {
    id: "sup-te",
    name: "TE Connectivity / Cable Systems",
    vendorCode: "VND-TEC-05",
    category: "Automotive Connectors & Sealed Terminals",
    contactPerson: "Siddharth Nair",
    email: "siddharth.nair@te.com",
    phone: "+91 80 6660 7000",
    location: "Whitefield, Bengaluru, Karnataka",
    warrantyPeriod: "24 Months / 100,000 km Automotive Road Warranty",
    rmaTatDays: "7 Business Days",
    warrantyCoverage: "Retention lock retention, terminal tin/gold plating integrity, and IP67 waterproof seal durability.",
    iatfExpiryDate: "2027-06-30",
    iso9001ExpiryDate: "2028-03-31",
    vda63AuditScore: "98% (Grade A - Tier 1 OEM)",
    approvalStatus: "Active Approved",
    lastAuditDate: "2025-11-12",
    nextAuditDueDate: "2026-11-12",
    ppapDossierStatus: "Approved Level 3",
    ppapDossierFileName: "PPAP-TEC-MX150-L3.pdf",
    mutualNdaStatus: "Signed & Active",
    mutualNdaFileName: "HLPL-TEC-mNDA-2026.pdf",
    qualityCertificateFileName: "IATF16949_TE_Bengaluru.pdf",
    gstNumber: "29AABCT4321D1Z1",
    bankDetailsVerified: true,
    rohsReachStatus: "100% Compliant",
  },
  {
    id: "sup-polyalloy",
    name: "Polyalloy Engineering Tooling",
    vendorCode: "VND-PLY-07",
    category: "IP67 Automotive Polycarbonate Enclosures",
    contactPerson: "Sunil Agarwal (Managing Director)",
    email: "sunil@polyalloymoulds.com",
    phone: "+91 120 256 3311",
    location: "Phase II Extension, Greater Noida, UP",
    warrantyPeriod: "12 Months Tooling & Ingress Warranty",
    rmaTatDays: "3 Business Days (Local Noida Plant)",
    warrantyCoverage: "100% replacement for mold flash, gasket groove distortion, UL94-V0 flame retardancy or IP67 seal failure.",
    iatfExpiryDate: "2026-12-15", // Expirying in ~2 months -> alerts conditional
    iso9001ExpiryDate: "2027-05-30",
    vda63AuditScore: "88% (Grade B - Conditional Audit Due)",
    approvalStatus: "Conditional Audit",
    lastAuditDate: "2025-10-18",
    nextAuditDueDate: "2026-11-30",
    ppapDossierStatus: "Approved Level 3",
    ppapDossierFileName: "PPAP-PLY-ENC-PCABS-L3.pdf",
    mutualNdaStatus: "Signed & Active",
    mutualNdaFileName: "HLPL-PLY-mNDA-2025.pdf",
    qualityCertificateFileName: "ISO9001_Polyalloy_Noida.pdf",
    gstNumber: "09AAACP6543E1Z4",
    bankDetailsVerified: true,
    rohsReachStatus: "100% Compliant",
  },
];

export const defaultPurchaseOrders: PurchaseOrderRecord[] = [
  {
    id: "PO-2026-001",
    poNumber: "HLPL-PO-AI4T-001",
    supplierId: "sup-mouser",
    supplierName: "Mouser Electronics India",
    projectId: "HLPL-AI4T-01",
    componentMpn: "STM32G0B1VCT6",
    description: "Main Host MCU, ARM Cortex-M0+ 64MHz, 512KB Flash, 144KB RAM, dual CAN FD",
    estimatedQuantity: 15000,
    annualSalesTarget: 50000,
    coveragePercent: 30,
    batchSchedule: "Pilot Batch 1: 5,000 pcs · Mass Batch 1: 10,000 pcs",
    unitCostUsd: 5.42,
    unitCostInr: 452.57,
    totalAmountUsd: 81300,
    totalAmountInr: 6788550,
    warrantyInherited: "24 Months Automotive Replacement Warranty (ASL Tier 1)",
    supplierValidityStatus: "Active (IATF Valid until Dec 2027)",
    status: "PO Issued to Vendor",
    orderDate: "2026-10-05",
    deliveryEta: "2026-11-20",
    linkedGrnId: "GRN-2026-001",
    receivedQuantity: 15000,
    notes: "Direct contract order covering Initial Tata Ace EV 4G production requirement.",
  },
  {
    id: "PO-2026-002",
    poNumber: "HLPL-PO-AI4T-002",
    supplierId: "sup-quectel",
    supplierName: "Quectel Wireless Solutions",
    projectId: "HLPL-AI4T-01",
    componentMpn: "EG915N-EU",
    description: "LTE Cat-1 bis Cellular Wireless Modem + GNSS Receiver, Multi-band, eSIM ready",
    estimatedQuantity: 10000,
    annualSalesTarget: 50000,
    coveragePercent: 20,
    batchSchedule: "Advance Long-Lead Buffer Batch: 10,000 pcs",
    unitCostUsd: 11.90,
    unitCostInr: 993.65,
    totalAmountUsd: 119000,
    totalAmountInr: 9936500,
    warrantyInherited: "36 Months Automotive Grade Warranty",
    supplierValidityStatus: "Active (IATF Valid until Nov 2027)",
    status: "Pending HOD Approval",
    orderDate: "2026-10-12",
    deliveryEta: "2027-01-15",
    receivedQuantity: 0,
    notes: "Critical 14-week lead time buffer PO authorized by Purchasing Lead Morgan Reed.",
  },
  {
    id: "PO-2026-003",
    poNumber: "HLPL-PO-AI4T-003",
    supplierId: "sup-te",
    supplierName: "TE Connectivity / Cable Systems",
    projectId: "HLPL-AI4T-01",
    componentMpn: "MX150-33472-1601",
    description: "16-Pin Sealed Automotive Header & Receptacle IP67",
    estimatedQuantity: 25000,
    annualSalesTarget: 50000,
    coveragePercent: 50,
    batchSchedule: "Batch 1: 12,500 pcs · Batch 2: 12,500 pcs",
    unitCostUsd: 2.10,
    unitCostInr: 175.35,
    totalAmountUsd: 52500,
    totalAmountInr: 4383750,
    warrantyInherited: "24 Months / 100,000 km Automotive Road Warranty",
    supplierValidityStatus: "Active (IATF Valid until Jun 2027)",
    status: "Draft",
    orderDate: "2026-10-16",
    deliveryEta: "2026-12-10",
    receivedQuantity: 0,
    notes: "Connector order for wiring harness sub-assembly line.",
  },
];

export const defaultQuotations: SupplierQuotationRecord[] = [
  {
    id: "QUO-PUR-01",
    quotationNumber: "HLPL-AI4T-PUR-QUO-01",
    supplierId: "sup-mouser",
    supplierName: "Mouser Electronics India",
    projectId: "HLPL-AI4T-01",
    targetPartMpn: "STM32G0B1VCT6",
    description: "Main Host MCU, ARM Cortex-M0+ 64MHz, 512KB Flash, 144KB RAM, dual CAN FD",
    tier1kUsd: 5.42,
    tier1kInr: 452.57,
    tier10kUsd: 4.85,
    tier10kInr: 404.98,
    tier50kUsd: 4.45,
    tier50kInr: 371.58,
    quotedLeadTimeWeeks: 8,
    warrantyTermsQuoted: "24 Months Full Replacement Warranty",
    validityExpiry: "2026-12-31",
    status: "Approved & Locked",
    convertedPoNumber: "HLPL-PO-AI4T-001",
    notes: "Locked for Tata Ace EV 50,000 unit production run.",
  },
  {
    id: "QUO-PUR-02",
    quotationNumber: "HLPL-AI4T-PUR-QUO-02",
    supplierId: "sup-quectel",
    supplierName: "Quectel Wireless Solutions",
    projectId: "HLPL-AI4T-01",
    targetPartMpn: "EG915N-EU",
    description: "LTE Cat-1 bis Cellular Wireless Modem + GNSS Receiver, Multi-band, eSIM ready",
    tier1kUsd: 12.80,
    tier1kInr: 1068.80,
    tier10kUsd: 11.90,
    tier10kInr: 993.65,
    tier50kUsd: 11.20,
    tier50kInr: 935.20,
    quotedLeadTimeWeeks: 14,
    warrantyTermsQuoted: "36 Months Automotive Grade Warranty",
    validityExpiry: "2026-11-30",
    status: "Approved & Locked",
    convertedPoNumber: "HLPL-PO-AI4T-002",
    notes: "Direct factory pricing for volume telematics tier.",
  },
  {
    id: "QUO-PUR-03",
    quotationNumber: "HLPL-AI4T-PUR-QUO-03",
    supplierId: "sup-arrow",
    supplierName: "Arrow Electronics Pune",
    projectId: "HLPL-AI4T-01",
    targetPartMpn: "LMR14050SDDAR",
    description: "Step-Down Switching Buck Regulator 40V/5A, 9V-36V nominal operating input",
    tier1kUsd: 1.85,
    tier1kInr: 154.48,
    tier10kUsd: 1.72,
    tier10kInr: 143.62,
    tier50kUsd: 1.58,
    tier50kInr: 131.93,
    quotedLeadTimeWeeks: 4,
    warrantyTermsQuoted: "24 Months Automotive Manufacturer Warranty",
    validityExpiry: "2026-12-15",
    status: "Under Review",
    notes: "TI dual-source quote under review with Avnet alternate.",
  },
];

// =============================================================================
// PURCHASING COMMAND CENTER COMPONENT
// =============================================================================

export type PurchasingCommandCenterProps = {
  items: InventoryItem[];
  movements: InventoryMovement[];
  assignments: InventoryAssignment[];
  allowedCategories: InventoryCategory[];
  readOnly?: boolean | undefined;
  onMove: (itemId: string, change: number, reason: InventoryMovement["reason"]) => void;
  onAssign: (
    itemId: string,
    assignee: string,
    department: InventoryAssignment["department"],
    project: string,
    quantity: number,
    note: string
  ) => void;
  projectScope: string;
  onReleaseToManufacturing?: (() => void) | undefined;
  activeSubView?: ("recordage" | "quotations" | "orders" | "suppliers") | undefined;
  onSelectSubView?: ((view: "recordage" | "quotations" | "orders" | "suppliers") => void) | undefined;
  isFullPage?: boolean | undefined;
  onBack?: (() => void) | undefined;
};

export function PurchasingCommandCenter({
  items,
  movements,
  assignments,
  allowedCategories,
  readOnly = false,
  onMove,
  onAssign,
  projectScope,
  onReleaseToManufacturing,
  activeSubView = "recordage",
  onSelectSubView,
  isFullPage = false,
  onBack,
}: PurchasingCommandCenterProps) {
  // Navigation sub-tab state (synced with sidebar)
  const [currentTab, setCurrentTab] = useState<"recordage" | "quotations" | "orders" | "suppliers">(activeSubView);
  const [showMorePoDetails, setShowMorePoDetails] = useState(false);

  // Sync external sub-view change
  React.useEffect(() => {
    if (activeSubView) {
      setCurrentTab(activeSubView);
    }
  }, [activeSubView]);

  const handleTabChange = (tab: "recordage" | "quotations" | "orders" | "suppliers") => {
    setCurrentTab(tab);
    onSelectSubView?.(tab);
  };

  // State collections
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(defaultSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>(defaultPurchaseOrders);
  const [quotations, setQuotations] = useState<SupplierQuotationRecord[]>(defaultQuotations);

  // Active Modals & Drawers
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderRecord | null>(null);
  const [selectedQuo, setSelectedQuo] = useState<SupplierQuotationRecord | null>(null);
  const [createPoModalOpen, setCreatePoModalOpen] = useState(false);
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createQuoModalOpen, setCreateQuoModalOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");

  // New PO Form State
  const [newPoSupplierId, setNewPoSupplierId] = useState(suppliers[0]?.id || "");
  const [newPoProject, setNewPoProject] = useState(projectScope === "all" ? "HLPL-AI4T-01" : projectScope);
  const [newPoMpn, setNewPoMpn] = useState("STM32G0B1VCT6");
  const [newPoDesc, setNewPoDesc] = useState("Main Host MCU, ARM Cortex-M0+ 64MHz, 512KB Flash, 144KB RAM");
  const [newPoQty, setNewPoQty] = useState(10000);
  const [newPoCostUsd, setNewPoCostUsd] = useState(5.42);
  const [newPoLeadWeeks, setNewPoLeadWeeks] = useState(8);

  // Handle PO Creation
  const handleCreatePo = () => {
    const sup = suppliers.find((s) => s.id === newPoSupplierId) || suppliers[0]!;
    const totalUsd = Math.round(newPoQty * newPoCostUsd * 100) / 100;
    const totalInr = Math.round(totalUsd * 83.5 * 100) / 100;
    const cov = Math.min(100, Math.round((newPoQty / 50000) * 100));

    const po: PurchaseOrderRecord = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: `HLPL-PO-${newPoProject.replace("HLPL-", "")}-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
      supplierId: sup.id,
      supplierName: sup.name,
      projectId: newPoProject,
      componentMpn: newPoMpn,
      description: newPoDesc,
      estimatedQuantity: Number(newPoQty),
      annualSalesTarget: 50000,
      coveragePercent: cov,
      batchSchedule: `Batch 1: ${Math.round(newPoQty / 2)} pcs · Batch 2: ${Math.round(newPoQty / 2)} pcs`,
      unitCostUsd: Number(newPoCostUsd),
      unitCostInr: Math.round(Number(newPoCostUsd) * 83.5 * 100) / 100,
      totalAmountUsd: totalUsd,
      totalAmountInr: totalInr,
      warrantyInherited: sup.warrantyPeriod,
      supplierValidityStatus: `Active (${sup.iatfExpiryDate})`,
      status: "Pending HOD Approval",
      orderDate: new Date().toISOString().split("T")[0]!,
      deliveryEta: new Date(Date.now() + newPoLeadWeeks * 7 * 24 * 3600 * 1000).toISOString().split("T")[0]!,
      receivedQuantity: 0,
      notes: "Newly raised procurement PO linked to ASL agreement.",
    };

    setPurchaseOrders([po, ...purchaseOrders]);
    setCreatePoModalOpen(false);
  };

  // Convert Quotation to PO
  const handleConvertQuoToPo = (quo: SupplierQuotationRecord) => {
    const sup = suppliers.find((s) => s.id === quo.supplierId) || suppliers[0]!;
    const qty = 10000;
    const costUsd = quo.tier10kUsd;
    const totalUsd = Math.round(qty * costUsd * 100) / 100;
    const totalInr = Math.round(totalUsd * 83.5 * 100) / 100;

    const newPoNum = `HLPL-PO-${quo.projectId.replace("HLPL-", "")}-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`;

    const po: PurchaseOrderRecord = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: newPoNum,
      supplierId: sup.id,
      supplierName: sup.name,
      projectId: quo.projectId,
      componentMpn: quo.targetPartMpn,
      description: quo.description,
      estimatedQuantity: qty,
      annualSalesTarget: 50000,
      coveragePercent: 20,
      batchSchedule: `Pilot Batch: 2,500 pcs · Mass Batch: 7,500 pcs`,
      unitCostUsd: costUsd,
      unitCostInr: Math.round(costUsd * 83.5 * 100) / 100,
      totalAmountUsd: totalUsd,
      totalAmountInr: totalInr,
      warrantyInherited: quo.warrantyTermsQuoted,
      supplierValidityStatus: `Active (${sup.iatfExpiryDate})`,
      status: "Pending HOD Approval",
      orderDate: new Date().toISOString().split("T")[0]!,
      deliveryEta: new Date(Date.now() + quo.quotedLeadTimeWeeks * 7 * 24 * 3600 * 1000).toISOString().split("T")[0]!,
      receivedQuantity: 0,
      notes: `Converted from approved quotation ${quo.quotationNumber}`,
    };

    setPurchaseOrders([po, ...purchaseOrders]);

    // Update quotation status
    setQuotations(
      quotations.map((q) =>
        q.id === quo.id ? { ...q, status: "Converted to PO", convertedPoNumber: newPoNum } : q
      )
    );

    // Switch to PO tab
    handleTabChange("orders");
  };

  return (
    <div className="space-y-6">
      {isFullPage && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1 text-xs font-mono font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Department Overview</span>
                </button>
              )}
              {onBack && <span className="text-muted-foreground">/</span>}
              <span className="font-mono text-xs uppercase text-primary font-bold">
                Purchasing & Supply Chain Management
              </span>
            </div>
            <h1 className="mt-1 font-mono text-xl font-bold text-foreground flex items-center gap-2.5">
              {currentTab === "orders" && (
                <>
                  <ShoppingCart className="size-5 text-primary" />
                  <span>Purchase Orders (POs) & Volume Alignment</span>
                </>
              )}
              {currentTab === "recordage" && (
                <>
                  <Package className="size-5 text-primary" />
                  <span>Recordage & Governed Stock Master</span>
                </>
              )}
              {currentTab === "quotations" && (
                <>
                  <FileText className="size-5 text-primary" />
                  <span>Commercial Vendor Quotations & Pricing Breaks</span>
                </>
              )}
              {currentTab === "suppliers" && (
                <>
                  <Building className="size-5 text-primary" />
                  <span>Approved Supplier List (ASL) & Vendor Governance</span>
                </>
              )}
            </h1>
          </div>
        </div>
      )}

      {/* =========================================================================
          PURCHASING SUB-NAVIGATION BAR (SYNCHRONIZED WITH SIDEBAR)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleTabChange("recordage")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
              currentTab === "recordage"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Package className="size-3.5" />
            <span>1. Recordage & Stores</span>
          </button>

          <button
            onClick={() => handleTabChange("quotations")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
              currentTab === "quotations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>2. Quotations & Vendor Pricing</span>
          </button>

          <button
            onClick={() => handleTabChange("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
              currentTab === "orders"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShoppingCart className="size-3.5" />
            <span>3. Purchase Orders (POs)</span>
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.2 font-mono text-[9px]">
              {purchaseOrders.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("suppliers")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
              currentTab === "suppliers"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Building className="size-3.5" />
            <span>4. Supplier Management (ASL)</span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] text-emerald-500 font-bold">
              {suppliers.length} Approved
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentTab === "orders" && (
            <button
              onClick={() => setCreatePoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 font-mono text-xs font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>+ Create PO</span>
            </button>
          )}

          {currentTab === "suppliers" && (
            <button
              onClick={() => setCreateSupplierModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 font-mono text-xs font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>+ Add Supplier</span>
            </button>
          )}

          {currentTab === "quotations" && (
            <button
              onClick={() => setCreateQuoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 font-mono text-xs font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>+ Add Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: RECORDAGE & GOVERNED STORES
         ========================================================================= */}
      {currentTab === "recordage" && (
        <div className="space-y-6">
          <LiveInventoryWorkspace
            items={items}
            movements={movements}
            assignments={assignments}
            allowedCategories={allowedCategories}
            readOnly={readOnly}
            onMove={onMove}
            onAssign={onAssign}
            activeDepartment="PUR"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: QUOTATIONS & VENDOR PRICE COMPARISONS
         ========================================================================= */}
      {currentTab === "quotations" && (
        <div className="space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-muted-foreground">Active Quotations</span>
              <p className="mt-1 text-xl font-bold text-foreground">{quotations.length}</p>
              <span className="text-[10px] text-muted-foreground">Volume Tier Locked</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-emerald-500">Avg. 50k Volume Savings</span>
              <p className="mt-1 text-xl font-bold text-emerald-500">14.8%</p>
              <span className="text-[10px] text-muted-foreground">vs. 1k Proto Baseline</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-steel">Quoted Factory Lead</span>
              <p className="mt-1 text-xl font-bold text-steel">8.6 Wks</p>
              <span className="text-[10px] text-muted-foreground">Weighted Average</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-moss">Warranty Standard</span>
              <p className="mt-1 text-xl font-bold text-moss">24 Mo</p>
              <span className="text-[10px] text-muted-foreground">IATF Replacement SLA</span>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Commercial Quotations & Volume Pricing Tiers
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                Linked to Suppliers & Dual-Source Matrix
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-secondary/20 font-mono text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Quotation Ref</th>
                    <th className="px-4 py-2.5">Supplier (ASL)</th>
                    <th className="px-4 py-2.5">Component (MPN)</th>
                    <th className="px-4 py-2.5">1k Tier ($ / ₹)</th>
                    <th className="px-4 py-2.5">10k Tier ($ / ₹)</th>
                    <th className="px-4 py-2.5">50k Tier ($ / ₹)</th>
                    <th className="px-4 py-2.5">Lead Time</th>
                    <th className="px-4 py-2.5">Warranty & Validity</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {quotations.map((quo) => {
                    const sup = suppliers.find((s) => s.id === quo.supplierId);
                    return (
                      <tr key={quo.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="px-4 py-3 font-bold text-foreground">
                          {quo.quotationNumber}
                          <small className="block text-[10px] text-muted-foreground font-normal">
                            Project: {quo.projectId}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => sup && setSelectedSupplier(sup)}
                            className="font-bold text-primary hover:underline text-left"
                            title="View Supplier Profile & Warranty"
                          >
                            {quo.supplierName}
                          </button>
                          <small className="block text-[10px] text-muted-foreground">
                            Vendor: {sup?.vendorCode || "ASL"}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground">{quo.targetPartMpn}</span>
                          <small className="block truncate max-w-[200px] text-[10px] text-muted-foreground">
                            {quo.description}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold">${quo.tier1kUsd.toFixed(2)}</span>
                          <small className="block text-[10px] text-muted-foreground">₹{quo.tier1kInr}</small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-emerald-500">${quo.tier10kUsd.toFixed(2)}</span>
                          <small className="block text-[10px] text-muted-foreground">₹{quo.tier10kInr}</small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-primary">${quo.tier50kUsd.toFixed(2)}</span>
                          <small className="block text-[10px] text-muted-foreground">₹{quo.tier50kInr}</small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">{quo.quotedLeadTimeWeeks} wks</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-moss">{quo.warrantyTermsQuoted}</span>
                          <small className="block text-[10px] text-muted-foreground">
                            Valid till {quo.validityExpiry}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                              quo.status === "Approved & Locked"
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : quo.status === "Converted to PO"
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "bg-warning/15 text-warning border border-warning/30"
                            }`}
                          >
                            {quo.status}
                          </span>
                          {quo.convertedPoNumber && (
                            <small className="block text-[9px] text-muted-foreground mt-0.5">
                              PO: {quo.convertedPoNumber}
                            </small>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {quo.status !== "Converted to PO" ? (
                            <button
                              onClick={() => handleConvertQuoToPo(quo)}
                              className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              <ShoppingCart className="size-3" />
                              <span>Convert to PO</span>
                            </button>
                          ) : (
                            <span className="font-mono text-[10px] text-muted-foreground">PO Created ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* R&D SCM BOM Review Table */}
          <div className="pt-2">
            <PurchasingBOMReviewTable
              projectId={projectScope === "all" ? "HLPL-OBD4-01" : projectScope}
              onReleaseToManufacturing={onReleaseToManufacturing}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PURCHASE ORDERS (POS) MANAGEMENT
         ========================================================================= */}
      {currentTab === "orders" && (
        <div className="space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-muted-foreground">Total PO Value (Committed)</span>
              <p className="mt-1 text-xl font-bold text-foreground">
                ${purchaseOrders.reduce((sum, po) => sum + po.totalAmountUsd, 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground">
                ₹{purchaseOrders.reduce((sum, po) => sum + po.totalAmountInr, 0).toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-emerald-500">50,000 Target Coverage</span>
              <p className="mt-1 text-xl font-bold text-emerald-500">
                {purchaseOrders.reduce((sum, po) => sum + po.estimatedQuantity, 0).toLocaleString()} pcs
              </p>
              <span className="text-[10px] text-muted-foreground">
                {Math.min(100, Math.round((purchaseOrders.reduce((sum, po) => sum + po.estimatedQuantity, 0) / 50000) * 100))}% of Annual Need
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-steel">Active Orders</span>
              <p className="mt-1 text-xl font-bold text-steel">{purchaseOrders.length} POs</p>
              <span className="text-[10px] text-muted-foreground">All Projects Tracked</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-moss">Awaiting GRN Inward</span>
              <p className="mt-1 text-xl font-bold text-moss">
                {purchaseOrders.filter((po) => po.status === "PO Issued to Vendor").length} POs
              </p>
              <span className="text-[10px] text-muted-foreground">Ready for IQC Inspection</span>
            </div>
          </div>

          {/* Secondary PO Details Unexpanded by Default with Arrow */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-3 font-mono">
            <button
              type="button"
              onClick={() => setShowMorePoDetails((v) => !v)}
              className="flex w-full items-center justify-between text-left text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded bg-secondary text-primary">
                  {showMorePoDetails ? (
                    <ChevronDown className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </span>
                <span>Secondary PO Allocation Breakdown & Buffer Details</span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                {showMorePoDetails ? "Hide secondary details" : "Expand secondary details"}
                <ChevronDown className={`size-3 transition-transform ${showMorePoDetails ? "rotate-180" : ""}`} />
              </span>
            </button>

            {showMorePoDetails && (
              <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
                <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">14-Week Long-Lead Modem Buffer</span>
                  <p className="text-foreground font-semibold">10,000 Quectel EG915N PO Active</p>
                  <p className="text-[10px] text-emerald-500 font-medium">Dual-sourced alternate: SimCom A7672S</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Vendor Payment & Credit Aging</span>
                  <p className="text-foreground font-semibold">Net 45 Days Commercial Terms</p>
                  <p className="text-[10px] text-muted-foreground">0 Overdue Invoices · 100% On-Time</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Scheduled Batch Delivery Milestones</span>
                  <p className="text-foreground font-semibold">Batch 1: 12k units (Nov 15, 2026)</p>
                  <p className="text-[10px] text-muted-foreground">Batch 2: 12k units (Dec 20, 2026)</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Inward IQC Inspection SLA</span>
                  <p className="text-foreground font-semibold">24-Hr Quarantine & Hold TAT</p>
                  <p className="text-[10px] text-moss font-medium">AEC-Q100 / Q200 CoC Verification</p>
                </div>
              </div>
            )}
          </div>

          {/* PO Register Table */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Official Purchase Orders Register & 50,000 Sales Volume Alignment
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                Linked to ASL Warranties & Inward GRN Receipts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-secondary/20 font-mono text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">PO Number</th>
                    <th className="px-4 py-2.5">Supplier & ASL Warranty</th>
                    <th className="px-4 py-2.5">Component (MPN)</th>
                    <th className="px-4 py-2.5">Estimated Qty / 50k Target</th>
                    <th className="px-4 py-2.5">Unit Cost</th>
                    <th className="px-4 py-2.5">Total Value</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Delivery ETA</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {purchaseOrders.map((po) => {
                    const sup = suppliers.find((s) => s.id === po.supplierId);
                    return (
                      <tr key={po.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground">{po.poNumber}</span>
                          <small className="block text-[10px] text-muted-foreground">
                            Project: {po.projectId}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => sup && setSelectedSupplier(sup)}
                            className="font-bold text-primary hover:underline text-left"
                            title="Click to view Supplier Profile & Warranty"
                          >
                            {po.supplierName}
                          </button>
                          <small className="block text-[10px] text-moss truncate max-w-[200px]">
                            🛡️ {po.warrantyInherited}
                          </small>
                          <small className="block text-[9px] text-muted-foreground">
                            {sup?.approvalStatus} ({sup?.iatfExpiryDate})
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground">{po.componentMpn}</span>
                          <small className="block truncate max-w-[180px] text-[10px] text-muted-foreground">
                            {po.description}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-foreground">{po.estimatedQuantity.toLocaleString()} pcs</span>
                            <span className="text-[10px] font-bold text-primary">{po.coveragePercent}% of 50k</span>
                          </div>
                          <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(100, po.coveragePercent)}%` }}
                            />
                          </div>
                          <small className="block text-[9px] text-muted-foreground mt-0.5">
                            {po.batchSchedule}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold">${po.unitCostUsd.toFixed(2)}</span>
                          <small className="block text-[10px] text-muted-foreground">₹{po.unitCostInr}</small>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground">${po.totalAmountUsd.toLocaleString()}</span>
                          <small className="block text-[10px] text-muted-foreground">
                            ₹{po.totalAmountInr.toLocaleString()}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                              po.status === "GRN Fulfilled"
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : po.status === "PO Issued to Vendor"
                                ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                                : po.status === "Pending HOD Approval"
                                ? "bg-warning/15 text-warning border border-warning/30"
                                : "bg-secondary text-foreground border border-border"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground">{po.deliveryEta}</span>
                          <small className="block text-[10px] text-muted-foreground">Ordered: {po.orderDate}</small>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {po.status === "PO Issued to Vendor" && (
                              <button
                                onClick={() => handleTabChange("recordage")}
                                className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                                title="Open Recordage to receive Inward GRN"
                              >
                                <Package className="size-3" />
                                <span>Receive GRN</span>
                              </button>
                            )}

                            {po.status === "Pending HOD Approval" && (
                              <button
                                onClick={() => {
                                  setPurchaseOrders(
                                    purchaseOrders.map((p) =>
                                      p.id === po.id ? { ...p, status: "PO Issued to Vendor" } : p
                                    )
                                  );
                                }}
                                className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                <Check className="size-3" />
                                <span>Approve PO</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedPo(po)}
                              className="rounded border border-border bg-secondary p-1 text-muted-foreground hover:text-foreground"
                              title="View Full PO Details"
                            >
                              <Eye className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MANAGING THE SUPPLIERS (APPROVED VENDOR LIST / ASL / ACML)
         ========================================================================= */}
      {currentTab === "suppliers" && (
        <div className="space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-muted-foreground">Approved Vendors (ASL)</span>
              <p className="mt-1 text-xl font-bold text-foreground">{suppliers.length} Suppliers</p>
              <span className="text-[10px] text-emerald-500">Tier-1 Direct OEM / Dist</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-moss">Standard Warranty</span>
              <p className="mt-1 text-xl font-bold text-moss">24–36 Mo</p>
              <span className="text-[10px] text-muted-foreground">Full Replacement SLA</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-steel">Accreditation Validity</span>
              <p className="mt-1 text-xl font-bold text-steel">100% IATF</p>
              <span className="text-[10px] text-muted-foreground">Audit Certified</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="text-[10px] uppercase text-warning">Upcoming Audits (90d)</span>
              <p className="mt-1 text-xl font-bold text-warning">1 Vendor</p>
              <span className="text-[10px] text-muted-foreground">Polyalloy Tooling</span>
            </div>
          </div>

          {/* Supplier Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suppliers.map((sup) => {
              const activePos = purchaseOrders.filter((p) => p.supplierId === sup.id);
              const activeQuos = quotations.filter((q) => q.supplierId === sup.id);

              return (
                <div
                  key={sup.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition-all font-mono"
                >
                  <div className="space-y-3">
                    {/* Header: Name, Vendor Code, Status */}
                    <div className="flex items-start justify-between border-b border-border/60 pb-2.5">
                      <div>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                          {sup.vendorCode}
                        </span>
                        <h4 className="mt-1 font-bold text-sm text-foreground">{sup.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{sup.category}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          sup.approvalStatus === "Active Approved"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : "bg-warning/15 text-warning border border-warning/30"
                        }`}
                      >
                        <ShieldCheck className="size-3" />
                        <span>{sup.approvalStatus}</span>
                      </span>
                    </div>

                    {/* Section A: Supplier Warranty Details */}
                    <div className="rounded-xl border border-moss/30 bg-moss/5 p-2.5 text-xs">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-moss flex items-center gap-1">
                        🛡️ Supplier Warranty Terms
                      </span>
                      <p className="mt-1 font-bold text-foreground text-[11px]">{sup.warrantyPeriod}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">RMA TAT: {sup.rmaTatDays}</p>
                      <small className="block text-[9px] text-muted-foreground mt-1 line-clamp-2">
                        {sup.warrantyCoverage}
                      </small>
                    </div>

                    {/* Section B: Supplier Validity & Accreditations */}
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-2.5 text-xs space-y-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-blue-500 flex items-center gap-1">
                        📜 Accreditation & Validity
                      </span>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">IATF 16949 Expiry:</span>
                        <span className="font-bold text-foreground">{sup.iatfExpiryDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">ISO 9001 Expiry:</span>
                        <span className="font-bold text-foreground">{sup.iso9001ExpiryDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">VDA 6.3 Audit Score:</span>
                        <span className="font-bold text-emerald-500">{sup.vda63AuditScore}</span>
                      </div>
                    </div>

                    {/* Section C: Supplier Related Documentation */}
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                        📁 Verified Documentation Dossier
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <span className="rounded bg-secondary/60 p-1 truncate text-foreground border border-border/40">
                          ✓ PPAP: {sup.ppapDossierStatus}
                        </span>
                        <span className="rounded bg-secondary/60 p-1 truncate text-foreground border border-border/40">
                          ✓ NDA: {sup.mutualNdaStatus}
                        </span>
                        <span className="rounded bg-secondary/60 p-1 truncate text-foreground border border-border/40">
                          ✓ GST: {sup.gstNumber}
                        </span>
                        <span className="rounded bg-secondary/60 p-1 truncate text-emerald-500 font-bold border border-emerald-500/30">
                          ✓ {sup.rohsReachStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[10px] text-muted-foreground">
                      {activePos.length} Active POs · {activeQuos.length} Quotes
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setNewPoSupplierId(sup.id);
                          setCreatePoModalOpen(true);
                        }}
                        className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        + Raise PO
                      </button>
                      <button
                        onClick={() => setSelectedSupplier(sup)}
                        className="rounded border border-border bg-secondary px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                      >
                        Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW PURCHASE ORDER (LINKED TO SUPPLIER & SALES TARGET)
         ========================================================================= */}
      {createPoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Official Purchase Order"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-mono"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Create Official Purchase Order
                </h3>
              </div>
              <button onClick={() => setCreatePoModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Linked Project & Supplier */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Target Project</label>
                  <select
                    value={newPoProject}
                    onChange={(e) => setNewPoProject(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  >
                    <option value="HLPL-AI4T-01">HLPL-AI4T-01 (Tata Ace EV 4G · 50,000 units)</option>
                    <option value="HLPL-SLCT-01">HLPL-SLCT-01 (AIS-140 Tracker · 10,000 units)</option>
                    <option value="HLPL-XLINK-03">HLPL-XLINK-03 (Commercial Gateway · 25,000 units)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Approved Supplier (ASL)</label>
                  <select
                    value={newPoSupplierId}
                    onChange={(e) => setNewPoSupplierId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.vendorCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inherited Supplier Warranty Banner */}
              {(() => {
                const s = suppliers.find((x) => x.id === newPoSupplierId) || suppliers[0];
                return s ? (
                  <div className="rounded-xl border border-moss/30 bg-moss/5 p-2.5 text-[11px]">
                    <div className="flex justify-between font-bold text-moss">
                      <span>🛡️ Inherited Supplier Warranty:</span>
                      <span>Validity: {s.iatfExpiryDate}</span>
                    </div>
                    <p className="mt-0.5 text-foreground">{s.warrantyPeriod} · {s.rmaTatDays} TAT</p>
                  </div>
                ) : null;
              })()}

              {/* Component MPN & Description */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Component MPN</label>
                  <input
                    type="text"
                    value={newPoMpn}
                    onChange={(e) => setNewPoMpn(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Description</label>
                  <input
                    type="text"
                    value={newPoDesc}
                    onChange={(e) => setNewPoDesc(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Estimated Quantity vs 50,000 Sales Target */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[10px] uppercase text-primary">
                    Estimated Order Quantity
                  </label>
                  <span className="font-bold text-primary">
                    {Math.min(100, Math.round((newPoQty / 50000) * 100))}% of 50k Vehicle Target
                  </span>
                </div>
                <input
                  type="number"
                  value={newPoQty}
                  onChange={(e) => setNewPoQty(Number(e.target.value))}
                  step={500}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm font-bold"
                />
                <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(100, (newPoQty / 50000) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Tata Ace EV Target: 50,000 units/year. Ordering {newPoQty.toLocaleString()} units secures production through Month {Math.round((newPoQty / 50000) * 12)}.
                </p>
              </div>

              {/* Pricing & Lead Time */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Unit Cost (USD $)</label>
                  <input
                    type="number"
                    value={newPoCostUsd}
                    onChange={(e) => setNewPoCostUsd(Number(e.target.value))}
                    step={0.01}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  />
                  <small className="text-muted-foreground">≈ ₹{Math.round(newPoCostUsd * 83.5 * 100) / 100} INR</small>
                </div>
                <div>
                  <label className="font-bold text-[10px] uppercase text-muted-foreground">Factory Lead Time (Weeks)</label>
                  <input
                    type="number"
                    value={newPoLeadWeeks}
                    onChange={(e) => setNewPoLeadWeeks(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Computed Total Banner */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-2.5">
                <span className="font-bold text-muted-foreground">Total Order Commitment:</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    ${(newPoQty * newPoCostUsd).toLocaleString()} USD
                  </span>
                  <small className="block text-muted-foreground">
                    ≈ ₹{Math.round(newPoQty * newPoCostUsd * 83.5).toLocaleString()} INR
                  </small>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setCreatePoModalOpen(false)}
                className="h-8 rounded border border-border px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePo}
                className="h-8 rounded bg-primary px-4 text-xs font-bold text-primary-foreground shadow"
              >
                Create Purchase Order & Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SUPPLIER FULL DOSSIER & WARRANTY VIEW
         ========================================================================= */}
      {selectedSupplier && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Supplier Dossier and Warranty Specification"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-mono"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                  {selectedSupplier.vendorCode} · ASL APPROVED
                </span>
                <h3 className="mt-1 font-bold text-base text-foreground">{selectedSupplier.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedSupplier.category}</p>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Contact Information */}
              <div className="grid gap-2 sm:grid-cols-2 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{selectedSupplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-primary shrink-0" />
                  <span>{selectedSupplier.phone}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span>{selectedSupplier.location}</span>
                </div>
              </div>

              {/* Warranty Coverage */}
              <div className="rounded-xl border border-moss/30 bg-moss/5 p-3 space-y-1.5">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-moss">
                  🛡️ Official Automotive Warranty Terms
                </h4>
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">Warranty Coverage Period:</span>
                  <span className="font-bold text-foreground">{selectedSupplier.warrantyPeriod}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">RMA Turnaround Time (TAT):</span>
                  <span className="font-bold text-foreground">{selectedSupplier.rmaTatDays}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Coverage Scope:</span>
                  <p className="text-[11px] text-foreground">{selectedSupplier.warrantyCoverage}</p>
                </div>
              </div>

              {/* Accreditations & Validity */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-1.5">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-blue-500">
                  📜 Quality Standards & Validity Schedule
                </h4>
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">IATF 16949:2016 Expiry:</span>
                  <span className="font-bold text-foreground">{selectedSupplier.iatfExpiryDate} (Audit Valid)</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">ISO 9001:2015 Expiry:</span>
                  <span className="font-bold text-foreground">{selectedSupplier.iso9001ExpiryDate}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">VDA 6.3 Process Audit:</span>
                  <span className="font-bold text-emerald-500">{selectedSupplier.vda63AuditScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Annual On-Site Audit:</span>
                  <span className="font-bold text-foreground">{selectedSupplier.nextAuditDueDate}</span>
                </div>
              </div>

              {/* Documentation */}
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  📁 Compliance Documents & Files
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                  <div className="flex items-center justify-between rounded border border-border p-2 bg-secondary/30">
                    <span>PPAP Level 3 Dossier:</span>
                    <span className="font-bold text-emerald-500">{selectedSupplier.ppapDossierStatus}</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-border p-2 bg-secondary/30">
                    <span>Mutual Bilateral NDA:</span>
                    <span className="font-bold text-emerald-500">{selectedSupplier.mutualNdaStatus}</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-border p-2 bg-secondary/30">
                    <span>GST Registration:</span>
                    <span className="font-bold text-foreground">{selectedSupplier.gstNumber}</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-border p-2 bg-secondary/30">
                    <span>RoHS & REACH:</span>
                    <span className="font-bold text-emerald-500">{selectedSupplier.rohsReachStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="h-8 rounded bg-secondary px-4 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
