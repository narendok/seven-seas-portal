import React, { useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Building,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  Truck,
  RotateCcw,
  Split,
  Eye,
  FileCheck,
  RefreshCw,
  Clock,
  DollarSign,
  Download,
} from "lucide-react";
import type { InventoryItem, GoodsReceivedNote } from "./LiveInventoryWorkspace";
import type { SupplierRecord, PurchaseOrderRecord } from "./PurchasingCommandCenter";

// =============================================================================
// 1. DATA CONTRACTS & ALIAS DICTIONARIES
// =============================================================================

export type StandardField =
  | "poNumber"
  | "invoiceNumber"
  | "orderDate"
  | "invoiceDate"
  | "vendorName"
  | "gstin"
  | "supplierSku"
  | "mpn"
  | "manufacturer"
  | "description"
  | "packageCase"
  | "orderedQty"
  | "invoicedQty"
  | "unitPrice"
  | "currency"
  | "hsnCode"
  | "lineTotal";

export const STANDARD_FIELD_LABELS: Record<StandardField, string> = {
  poNumber: "Purchase Order #",
  invoiceNumber: "Invoice / Bill #",
  orderDate: "Order Date",
  invoiceDate: "Invoice / Delivery Date",
  vendorName: "Vendor / Supplier Name",
  gstin: "Vendor GSTIN / Tax ID",
  supplierSku: "Supplier Part SKU",
  mpn: "Manufacturer Part # (MPN)",
  manufacturer: "Manufacturer / Brand",
  description: "Item Description",
  packageCase: "Package / Footprint",
  orderedQty: "Ordered Quantity",
  invoicedQty: "Invoiced / Shipped Qty",
  unitPrice: "Unit Price",
  currency: "Currency (USD/INR/EUR)",
  hsnCode: "HSN / SAC Code",
  lineTotal: "Extended Line Total",
};

// Multi-alias dictionary for fuzzy matching
export const ALIAS_DICTIONARY: Record<StandardField, string[]> = {
  poNumber: ["po", "po#", "po_number", "ponumber", "purchase_order", "purchase_order_#", "order_ref", "po_no", "order_number"],
  invoiceNumber: ["invoice", "invoice#", "invoice_no", "inv_no", "bill_no", "tax_invoice_no", "invoice_num", "inv_number", "doc_no", "challan_no"],
  orderDate: ["order_date", "po_date", "date_ordered", "booking_date"],
  invoiceDate: ["invoice_date", "inv_date", "bill_date", "dispatch_date", "delivery_date", "date"],
  vendorName: ["vendor", "vendor_name", "supplier", "supplier_name", "sold_by", "seller", "distributor", "company_name"],
  gstin: ["gstin", "gst_no", "gst_number", "tax_id", "vat_no", "ein"],
  supplierSku: ["sku", "supplier_sku", "mouser_part_#", "digikey_part_number", "item_code", "catalog_no", "order_code"],
  mpn: ["mpn", "mfr_part_#", "mfg_part_no", "part_number", "manufacturer_part_number", "component_pn", "part_no", "mfr_p/n"],
  manufacturer: ["manufacturer", "mfr", "mfg", "brand", "maker", "oem"],
  description: ["description", "desc", "item_description", "product_name", "part_description", "line_details", "title"],
  packageCase: ["package", "package_case", "case", "footprint", "pkg"],
  orderedQty: ["ordered_qty", "order_qty", "qty_ordered", "po_qty", "expected_qty"],
  invoicedQty: ["invoiced_qty", "invoiced_quantity", "billed_qty", "qty", "quantity", "shipped_qty", "delivered_qty", "ship_qty"],
  unitPrice: ["unit_price", "price", "unit_cost", "rate", "price_per_unit", "unit_rate", "rate_inr", "price_usd"],
  currency: ["currency", "curr", "curr_code", "currency_code"],
  hsnCode: ["hsn", "hsn_code", "sac", "sac_code", "tax_code"],
  lineTotal: ["line_total", "total", "amount", "net_amount", "extended_price", "total_price", "item_total", "total_inr"],
};

export type StagedRow = {
  id: string;
  sourceLineNumber: number;
  raw: Record<string, string>;
  
  // Normalized Fields
  poNumber: string;
  invoiceNumber: string;
  orderDate: string;
  invoiceDate: string;
  vendorName: string;
  gstin: string;
  supplierSku: string;
  mpn: string;
  manufacturer: string;
  description: string;
  packageCase: string;
  orderedQty: number;
  invoicedQty: number;
  unitPrice: number;
  currency: string;
  hsnCode: string;
  lineTotal: number;

  // Governed Reconciliation Attributes
  vendorMatchStatus: "Verified ASL" | "Unregistered Candidate";
  matchedSupplierId?: string | undefined;
  
  componentMatchStatus: "Exact Catalog Match" | "Approved Substitute Match" | "Unmatched Candidate";
  matchedComponentId?: string | undefined;
  matchedComponentMpn?: string | undefined;

  poMatchStatus: "Matched PO Line" | "Price Variance" | "Over-Billed Qty" | "No Linked PO";
  matchedPoId?: string | undefined;
  poOrderedQty?: number | undefined;
  poUnitPrice?: number | undefined;
  qtyVariance?: number | undefined;
  priceVariancePercent?: number | undefined;

  duplicateWarning?: boolean | undefined;
  validationErrors: string[];

  // User Disposition in Staging Gate
  disposition: "Pending Review" | "Accepted" | "Rejected" | "Remapped";
};

// =============================================================================
// 2. REAL-WORLD PRESET SAMPLES (Mouser, Digi-Key, Local Fabricator, Arrow)
// =============================================================================

export type IngestionPreset = {
  id: string;
  name: string;
  distributor: string;
  formatType: "CSV Spreadsheet" | "Excel Workbook" | "Invoice Scan / PDF (AI Extracted)";
  sourceFileName: string;
  rawHeaders: string[];
  rawRows: Array<Record<string, string>>;
};

export const sampleIngestionPresets: IngestionPreset[] = [
  // --- PRESET 1: MOUSER ELECTRONICS CSV EXPORT ---
  {
    id: "preset-mouser",
    name: "Mouser Electronics Order Confirmation / Packing List",
    distributor: "Mouser Electronics India",
    formatType: "CSV Spreadsheet",
    sourceFileName: "MOUSER_ORDER_IN849204_DISPATCH.csv",
    rawHeaders: ["Mouser Part #", "Mfr. Part #", "Manufacturer", "Description", "Order Qty", "Invoiced Qty", "Price (USD)", "Ext. Total (USD)", "Invoice #", "PO #"],
    rawRows: [
      {
        "Mouser Part #": "511-STM32G0B1VCT6",
        "Mfr. Part #": "STM32G0B1VCT6",
        "Manufacturer": "STMicroelectronics",
        "Description": "Main Host MCU ARM Cortex-M0+ 64MHz 512KB Flash LQFP-100",
        "Order Qty": "5000",
        "Invoiced Qty": "5000",
        "Price (USD)": "4.65",
        "Ext. Total (USD)": "23250.00",
        "Invoice #": "MOU-INV-2026-8492",
        "PO #": "HLPL/PO/2026/088",
      },
      {
        "Mouser Part #": "78-SM5S36AHE3_A/I",
        "Mfr. Part #": "SM5S36AHE3_A/I",
        "Manufacturer": "Vishay",
        "Description": "Automotive Transient Voltage Suppressor TVS 36V DO-218AB",
        "Order Qty": "10000",
        "Invoiced Qty": "10000",
        "Price (USD)": "1.38",
        "Ext. Total (USD)": "13800.00",
        "Invoice #": "MOU-INV-2026-8492",
        "PO #": "HLPL/PO/2026/088",
      },
      {
        "Mouser Part #": "81-GCM188R71H104KA57D",
        "Mfr. Part #": "GCM188R71H104KA57D",
        "Manufacturer": "Murata Electronics",
        "Description": "0.1uF 50V 10% X7R 0603 Automotive AEC-Q200 MLCC",
        "Order Qty": "100000",
        "Invoiced Qty": "100000",
        "Price (USD)": "0.016",
        "Ext. Total (USD)": "1600.00",
        "Invoice #": "MOU-INV-2026-8492",
        "PO #": "HLPL/PO/2026/088",
      },
    ],
  },

  // --- PRESET 2: DIGI-KEY ORDER ACKNOWLEDGMENT ---
  {
    id: "preset-digikey",
    name: "Digi-Key Global Order & Commercial Invoice",
    distributor: "Digi-Key Corporation",
    formatType: "CSV Spreadsheet",
    sourceFileName: "DIGIKEY_INV_7918231_COMMERCIAL.csv",
    rawHeaders: ["DigiKey Part Number", "Manufacturer Part Number", "Maker", "Item Details", "PO Ref", "Inv Number", "Shipped Qty", "Unit Price", "Total USD"],
    rawRows: [
      {
        "DigiKey Part Number": "296-48291-1-ND",
        "Manufacturer Part Number": "LMR14050SDDAR",
        "Maker": "Texas Instruments",
        "Item Details": "IC REG BUCK ADJ 5A 8SOPWRPAD Automotive",
        "PO Ref": "HLPL/PO/2026/092",
        "Inv Number": "DK-INV-7918231",
        "Shipped Qty": "5000",
        "Unit Price": "1.72",
        "Total USD": "8600.00",
      },
      {
        "DigiKey Part Number": "WM8492-ND",
        "Manufacturer Part Number": "19418-0014",
        "Maker": "Molex",
        "Item Details": "CONN HEADER R/A 16POS HYBRID OBD-II",
        "PO Ref": "HLPL/PO/2026/092",
        "Inv Number": "DK-INV-7918231",
        "Shipped Qty": "3000",
        "Unit Price": "3.10", // Price variance vs $2.95 target
        "Total USD": "9300.00",
      },
    ],
  },

  // --- PRESET 3: LOCAL FABRICATOR GST TAX INVOICE ---
  {
    id: "preset-local-fabricator",
    name: "Precision Wiring Systems (Custom Harness Challan / Tax Invoice)",
    distributor: "Precision Cable Systems Pvt Ltd (Noida)",
    formatType: "Invoice Scan / PDF (AI Extracted)",
    sourceFileName: "TAX_INVOICE_PCS_2026_0411.pdf",
    rawHeaders: ["Item_Code", "Part_Description", "GSTIN_Vendor", "Billed_Quantity", "Rate_INR", "GST%", "HSN_Code", "Invoice_Ref", "PO_Number"],
    rawRows: [
      {
        "Item_Code": "HLPL-HARN-AI4T-PWR-01",
        "Part_Description": "High-Voltage 4-Pin Sealed Automotive Battery & BMS Harness Assembly 1.5m",
        "GSTIN_Vendor": "07AAAAA0000A1Z5",
        "Billed_Quantity": "1000",
        "Rate_INR": "342.00",
        "GST%": "18%",
        "HSN_Code": "85443000",
        "Invoice_Ref": "PCS/INV/26-0411",
        "PO_Number": "HLPL/PO/2026/095",
      },
    ],
  },
];

// =============================================================================
// 3. WORKSPACE PROPS
// =============================================================================

export type AdaptiveIngestionAndStagingGateProps = {
  inventoryCatalog?: InventoryItem[];
  vendorCatalog?: SupplierRecord[];
  activePurchaseOrders?: PurchaseOrderRecord[];
  onGeneratePurchaseDrafts?: (drafts: any[]) => void;
  onGenerateInwardDraft?: (grnDraft: GoodsReceivedNote, stagedRows: StagedRow[]) => void;
  readOnly?: boolean;
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export function AdaptiveIngestionAndStagingGate({
  inventoryCatalog = [],
  vendorCatalog = [],
  activePurchaseOrders = [],
  onGeneratePurchaseDrafts,
  onGenerateInwardDraft,
  readOnly = false,
}: AdaptiveIngestionAndStagingGateProps) {
  // Active Preset or Uploaded File
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-mouser");
  const [activePreset, setActivePreset] = useState<IngestionPreset>(sampleIngestionPresets[0] as IngestionPreset);
  
  // Ingestion Mode: PO Import vs Inward Invoice Delivery
  const [ingestionType, setIngestionType] = useState<"invoice" | "purchase_order">("invoice");

  // Step Tracker: 1. File Upload & Mapping -> 2. Governed Staging Gate -> 3. Output Generation
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Column Mapping Map: standardField -> rawHeader
  const [columnMapping, setColumnMapping] = useState<Record<StandardField, string>>({} as Record<StandardField, string>);

  // Normalized Staged Rows
  const [stagedRows, setStagedRows] = useState<StagedRow[]>([]);

  // Staging Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Success Notification
  const [committedBatchInfo, setCommittedBatchInfo] = useState<string | null>(null);

  // Initialize column mapping with fuzzy matching when preset changes
  useMemo(() => {
    const mapping: Partial<Record<StandardField, string>> = {};
    const rawHeaders = activePreset.rawHeaders;

    (Object.keys(ALIAS_DICTIONARY) as StandardField[]).forEach((field) => {
      const aliases = ALIAS_DICTIONARY[field];
      const matchedHeader = rawHeaders.find((h) => {
        const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
        return aliases.some((a) => {
          const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, "");
          return cleanH === cleanA || cleanH.includes(cleanA) || cleanA.includes(cleanH);
        });
      });
      if (matchedHeader) {
        mapping[field] = matchedHeader;
      }
    });

    setColumnMapping(mapping as Record<StandardField, string>);
  }, [activePreset]);

  // Compute confidence score for header matching
  const mappingConfidence = useMemo(() => {
    const requiredFields: StandardField[] = ["mpn", "invoicedQty", "unitPrice"];
    let mappedRequired = 0;
    requiredFields.forEach((rf) => {
      if (columnMapping[rf]) mappedRequired++;
    });

    const totalMapped = Object.values(columnMapping).filter(Boolean).length;
    const confidencePct = Math.round((totalMapped / activePreset.rawHeaders.length) * 100);

    return {
      allRequiredMapped: mappedRequired === requiredFields.length,
      confidencePct,
      mappedCount: totalMapped,
      totalHeaders: activePreset.rawHeaders.length,
    };
  }, [columnMapping, activePreset]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = sampleIngestionPresets.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setActivePreset(found);
      setActiveStep(1);
      setCommittedBatchInfo(null);
    }
  };

  // Process Ingestion into Governed Staging Gate
  const handleProcessIntoStagingGate = () => {
    const rows: StagedRow[] = activePreset.rawRows.map((raw, idx) => {
      const getVal = (f: StandardField) => (columnMapping[f] ? raw[columnMapping[f]] || "" : "");

      const mpnRaw = getVal("mpn");
      const normMpn = mpnRaw.trim().toUpperCase().replace(/-ND$|-REEL$|\/TR$/, "");
      const invoicedQty = parseFloat(getVal("invoicedQty")) || 0;
      const orderedQty = parseFloat(getVal("orderedQty")) || invoicedQty;
      const unitPrice = parseFloat(getVal("unitPrice").replace(/[^0-9.]/g, "")) || 0;
      const poNum = getVal("poNumber") || "HLPL/PO/2026/088";
      const invNum = getVal("invoiceNumber") || "INV-SAMPLE-2026";
      const vendorName = getVal("vendorName") || activePreset.distributor;

      // 1. Vendor Reconciliation
      const matchedVendor = vendorCatalog.find((v) =>
        v.name.toLowerCase().includes(vendorName.toLowerCase()) ||
        vendorName.toLowerCase().includes(v.name.toLowerCase())
      );
      const vendorMatchStatus = matchedVendor ? "Verified ASL" : "Unregistered Candidate";

      // 2. Component Catalog Reconciliation
      const matchedComp = inventoryCatalog.find((c) => {
        const cMpn = c.partNumber.trim().toUpperCase();
        return cMpn === normMpn || normMpn.includes(cMpn) || cMpn.includes(normMpn);
      });

      let componentMatchStatus: StagedRow["componentMatchStatus"] = "Unmatched Candidate";
      let matchedComponentId = undefined;
      let matchedComponentMpn = undefined;

      if (matchedComp) {
        componentMatchStatus = "Exact Catalog Match";
        matchedComponentId = matchedComp.id;
        matchedComponentMpn = matchedComp.partNumber;
      } else {
        // Check substitutes
        const subComp = inventoryCatalog.find((c) =>
          c.substitutes?.some((s) => s.toUpperCase() === normMpn)
        );
        if (subComp) {
          componentMatchStatus = "Approved Substitute Match";
          matchedComponentId = subComp.id;
          matchedComponentMpn = subComp.partNumber;
        }
      }

      // 3. Purchase Order Reconciliation & Variances
      const matchedPo = activePurchaseOrders.find((p) => p.poNumber.toUpperCase() === poNum.toUpperCase());
      let poMatchStatus: StagedRow["poMatchStatus"] = "No Linked PO";
      let poOrderedQty = undefined;
      let poUnitPrice = undefined;
      let qtyVariance = undefined;
      let priceVariancePercent = undefined;

      if (matchedPo) {
        poMatchStatus = "Matched PO Line";
        poOrderedQty = matchedPo.estimatedQuantity;
        poUnitPrice = matchedPo.unitCostUsd;
        qtyVariance = invoicedQty - poOrderedQty;

        if (poUnitPrice > 0 && unitPrice > poUnitPrice * 1.02) {
          poMatchStatus = "Price Variance";
          priceVariancePercent = Math.round(((unitPrice - poUnitPrice) / poUnitPrice) * 100);
        } else if (invoicedQty > poOrderedQty) {
          poMatchStatus = "Over-Billed Qty";
        }
      }

      // Validation Errors
      const validationErrors: string[] = [];
      if (!normMpn) validationErrors.push("Missing Manufacturer Part Number (MPN)");
      if (invoicedQty <= 0) validationErrors.push("Invoiced Quantity must be greater than 0");
      if (unitPrice < 0) validationErrors.push("Negative Unit Price is invalid");

      return {
        id: `stage-${idx}-${Date.now()}`,
        sourceLineNumber: idx + 1,
        raw,
        poNumber: poNum,
        invoiceNumber: invNum,
        orderDate: getVal("orderDate") || "2026-10-17",
        invoiceDate: getVal("invoiceDate") || "2026-10-17",
        vendorName,
        gstin: getVal("gstin") || "07AAACH1234F1Z1",
        supplierSku: getVal("supplierSku"),
        mpn: normMpn,
        manufacturer: getVal("manufacturer"),
        description: getVal("description"),
        packageCase: getVal("packageCase"),
        orderedQty,
        invoicedQty,
        unitPrice,
        currency: getVal("currency") || "USD",
        hsnCode: getVal("hsnCode") || "85423100",
        lineTotal: invoicedQty * unitPrice,
        vendorMatchStatus,
        matchedSupplierId: matchedVendor?.id,
        componentMatchStatus,
        matchedComponentId,
        matchedComponentMpn,
        poMatchStatus,
        matchedPoId: matchedPo?.id,
        poOrderedQty,
        poUnitPrice,
        qtyVariance,
        priceVariancePercent,
        duplicateWarning: false,
        validationErrors,
        disposition: "Pending Review",
      };
    });

    setStagedRows(rows);
    setActiveStep(2);
  };

  // Filtered Staged Rows
  const filteredStagedRows = useMemo(() => {
    return stagedRows.filter((row) => {
      const matchesSearch =
        row.mpn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.poNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && row.componentMatchStatus === "Exact Catalog Match") ||
        (statusFilter === "warning" && (row.poMatchStatus === "Price Variance" || row.poMatchStatus === "Over-Billed Qty")) ||
        (statusFilter === "unmatched" && row.componentMatchStatus === "Unmatched Candidate");

      return matchesSearch && matchesStatus;
    });
  }, [stagedRows, searchQuery, statusFilter]);

  // Handle Line Disposition Actions
  const handleUpdateDisposition = (rowId: string, newDisposition: StagedRow["disposition"]) => {
    setStagedRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, disposition: newDisposition } : r))
    );
  };

  const handleAcceptAllVerified = () => {
    setStagedRows((prev) =>
      prev.map((r) =>
        r.validationErrors.length === 0 ? { ...r, disposition: "Accepted" } : r
      )
    );
  };

  // Controlled Output Commit Gate
  const handleCommitStagingToControlledOutputs = () => {
    const acceptedRows = stagedRows.filter((r) => r.disposition === "Accepted");
    if (acceptedRows.length === 0) {
      alert("Please accept at least one verified line item before generating output drafts.");
      return;
    }

    if (ingestionType === "invoice") {
      // Generate Inwarding (GRN) Draft (Stores / IQC)
      const first = acceptedRows[0];
      if (!first) return;
      const grnDraft: GoodsReceivedNote = {
        id: `grn-draft-${Date.now()}`,
        grnNumber: `GRN-DRAFT-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-01`,
        poNumber: first.poNumber,
        supplier: first.vendorName,
        invoiceRef: first.invoiceNumber,
        receivedDate: first.invoiceDate || new Date().toISOString().slice(0, 10),
        inventoryItemId: first.matchedComponentId || "inv-staged-candidate",
        partNumber: first.mpn,
        lotNumber: `LOT-IMP-${Date.now().toString().slice(-5)}`,
        dateCode: "2642",
        quantityReceived: acceptedRows.reduce((acc, r) => acc + r.invoicedQty, 0),
        quantityAccepted: 0, // Invariant: Zero stock released directly!
        quantityHeld: acceptedRows.reduce((acc, r) => acc + r.invoicedQty, 0), // Strictly held on IQC Hold!
        inspectionStatus: "Pending IQC",
        location: "Greater Noida SMT Plant 2",
        bin: "IQC-HOLD-STAGE-01",
        receivedBy: "Morgan Reed (Stores Inward Gate)",
        dispositionNote: `Automated import from ${activePreset.sourceFileName}. 100% placed in IQC quarantine awaiting quality disposition.`,
      };

      if (onGenerateInwardDraft) {
        onGenerateInwardDraft(grnDraft, acceptedRows);
      }
      setCommittedBatchInfo(
        `Generated Inwarding (GRN) Draft ${grnDraft.grnNumber} for Stores & Quality Inspection. 0 active stock was touched; all items placed on IQC Quarantine Hold.`
      );
    } else {
      // Generate Purchase Drafts
      const drafts = acceptedRows.map((r) => ({
        id: `po-draft-${Date.now()}-${r.sourceLineNumber}`,
        poNumber: r.poNumber,
        supplierName: r.vendorName,
        mpn: r.mpn,
        description: r.description,
        orderedQuantity: r.orderedQty,
        unitCostUsd: r.unitPrice,
        status: "Draft",
        notes: `Imported from ${activePreset.sourceFileName}. Reconciled with ASL.`,
      }));

      if (onGeneratePurchaseDrafts) {
        onGeneratePurchaseDrafts(drafts);
      }
      setCommittedBatchInfo(`Generated ${drafts.length} editable Purchase Drafts under Procurement review.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HEADER & PRESET SELECTOR
         ========================================================================= */}
      <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                ISO 9001 §8.4 & IATF 16949 §8.4.2
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Adaptive Purchase & Invoice Ingestion Gate
              </h2>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
                Pre-Inventory Reconciliation Gate
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingest spreadsheets with arbitrary headers, vendor CSVs, or scanned invoices. Reconcile against Approved Suppliers and Component Catalog before generating official drafts.
            </p>
          </div>

          {/* Ingestion Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
              <button
                onClick={() => setIngestionType("invoice")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  ingestionType === "invoice"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck className="size-3.5" />
                <span>Inward Invoice / Delivery</span>
              </button>
              <button
                onClick={() => setIngestionType("purchase_order")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  ingestionType === "purchase_order"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Purchase Order / Vendor Quote</span>
              </button>
            </div>
          </div>
        </div>

        {/* Distributor Presets Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
          <span className="text-xs font-semibold text-muted-foreground">Select Format Preset:</span>
          {sampleIngestionPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                selectedPresetId === preset.id
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <FileText className="size-3.5" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Committed Batch Notification Banner */}
      {committedBatchInfo && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-sm font-bold">Governed Reconciliation Gate Succeeded!</strong>
            <p>{committedBatchInfo}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: COLUMN NORMALIZATION & FUZZY MAPPING
         ========================================================================= */}
      {activeStep === 1 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Intelligent Column & Header Normalization</h3>
              <p className="text-xs text-muted-foreground">
                Matched <strong>{mappingConfidence.mappedCount}</strong> of <strong>{mappingConfidence.totalHeaders}</strong> columns with{" "}
                <strong className={mappingConfidence.confidencePct >= 80 ? "text-emerald-600" : "text-amber-500"}>
                  {mappingConfidence.confidencePct}% confidence
                </strong>. Override mappings using the dropdowns below.
              </p>
            </div>

            <button
              onClick={handleProcessIntoStagingGate}
              disabled={!mappingConfidence.allRequiredMapped}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                mappingConfidence.allRequiredMapped
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Sparkles className="size-4" />
              <span>Proceed to Governed Staging Gate</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Grid of Standard Mapped Fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(STANDARD_FIELD_LABELS) as StandardField[]).map((field) => {
              const currentMappedHeader = columnMapping[field] || "";
              const isRequired = field === "mpn" || field === "invoicedQty" || field === "unitPrice";

              return (
                <div
                  key={field}
                  className={`rounded-xl border p-3 text-xs transition-all ${
                    currentMappedHeader
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : isRequired
                      ? "border-rose-500/30 bg-rose-500/5"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {STANDARD_FIELD_LABELS[field]}
                      {isRequired && <span className="ml-1 text-rose-500">*</span>}
                    </span>
                    {currentMappedHeader ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : isRequired ? (
                      <AlertCircle className="size-3.5 text-rose-500" />
                    ) : null}
                  </div>

                  <select
                    value={currentMappedHeader}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    <option value="">-- Unmapped --</option>
                    {activePreset.rawHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Raw Spreadsheet Preview Table */}
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <div className="bg-secondary/60 px-4 py-2 font-mono text-xs font-bold text-muted-foreground">
              Source File Preview: {activePreset.sourceFileName} ({activePreset.rawRows.length} lines)
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-secondary/30 text-[10px] uppercase text-muted-foreground">
                <tr>
                  {activePreset.rawHeaders.map((h) => (
                    <th key={h} className="px-3 py-2 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[11px]">
                {activePreset.rawRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20">
                    {activePreset.rawHeaders.map((h) => (
                      <td key={h} className="px-3 py-2 whitespace-nowrap text-foreground">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: GOVERNED PRE-INVENTORY STAGING & RECONCILIATION GATE
         ========================================================================= */}
      {activeStep === 2 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                  GATE 2: RECONCILIATION
                </span>
                <h3 className="text-base font-bold text-foreground">Governed Staging Review Workspace</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify catalog matches, vendor ASL status, and PO pricing variances. <strong>Hard Invariant:</strong> Zero active inventory will be modified until official GRN & IQC Quality Release.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
              >
                Back to Column Remapping
              </button>
              <button
                onClick={handleAcceptAllVerified}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              >
                Accept All Verified Lines
              </button>
              <button
                onClick={handleCommitStagingToControlledOutputs}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <Check className="size-4" />
                <span>
                  {ingestionType === "invoice" ? "Generate Inwarding (GRN) Draft" : "Generate Purchase Drafts"}
                </span>
              </button>
            </div>
          </div>

          {/* Staging Metrics Badges */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Catalog Matched</span>
              <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {stagedRows.filter((r) => r.componentMatchStatus === "Exact Catalog Match").length} / {stagedRows.length}
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">Vendor ASL Verified</span>
              <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                {stagedRows.filter((r) => r.vendorMatchStatus === "Verified ASL").length} / {stagedRows.length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Price / Qty Variances</span>
              <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
                {stagedRows.filter((r) => r.poMatchStatus === "Price Variance" || r.poMatchStatus === "Over-Billed Qty").length}
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase">Total Invoiced Value</span>
              <p className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
                ${stagedRows.reduce((acc, r) => acc + r.lineTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search MPN, description, vendor, or PO#..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="all">All Staged Lines ({stagedRows.length})</option>
                <option value="verified">Verified Catalog Matches</option>
                <option value="warning">Variances / Warnings</option>
                <option value="unmatched">Unmatched Candidate Parts</option>
              </select>
            </div>
          </div>

          {/* Staging Table */}
          <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-secondary/50 text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Line</th>
                  <th className="px-3 py-2.5">MPN & Description</th>
                  <th className="px-3 py-2.5">Vendor (ASL Check)</th>
                  <th className="px-3 py-2.5">Catalog Match</th>
                  <th className="px-3 py-2.5 text-right">Invoiced Qty</th>
                  <th className="px-3 py-2.5 text-right">Unit Price</th>
                  <th className="px-3 py-2.5">PO & Variances</th>
                  <th className="px-3 py-2.5">Disposition</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[11px]">
                {filteredStagedRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.disposition === "Accepted"
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : row.disposition === "Rejected"
                        ? "bg-rose-500/5 opacity-60 hover:opacity-100"
                        : "hover:bg-secondary/30"
                    }`}
                  >
                    {/* Line # */}
                    <td className="px-3 py-2.5 font-bold text-foreground">L{row.sourceLineNumber}</td>

                    {/* MPN & Desc */}
                    <td className="px-3 py-2.5">
                      <strong className="text-foreground">{row.mpn}</strong>
                      <span className="block font-sans text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                        {row.description}
                      </span>
                    </td>

                    {/* Vendor ASL */}
                    <td className="px-3 py-2.5">
                      <span className="font-sans font-semibold text-foreground">{row.vendorName}</span>
                      <span
                        className={`block text-[10px] font-bold ${
                          row.vendorMatchStatus === "Verified ASL" ? "text-emerald-600" : "text-amber-500"
                        }`}
                      >
                        {row.vendorMatchStatus}
                      </span>
                    </td>

                    {/* Catalog Match */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          row.componentMatchStatus === "Exact Catalog Match"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : row.componentMatchStatus === "Approved Substitute Match"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {row.componentMatchStatus === "Exact Catalog Match" && <Check className="size-3" />}
                        {row.componentMatchStatus}
                      </span>
                      {row.matchedComponentMpn && (
                        <span className="block text-[10px] text-muted-foreground">ID: {row.matchedComponentMpn}</span>
                      )}
                    </td>

                    {/* Invoiced Qty */}
                    <td className="px-3 py-2.5 text-right font-bold text-foreground">
                      {row.invoicedQty.toLocaleString()}
                    </td>

                    {/* Unit Price */}
                    <td className="px-3 py-2.5 text-right font-bold text-foreground">
                      ${row.unitPrice.toFixed(2)}
                    </td>

                    {/* PO & Variances */}
                    <td className="px-3 py-2.5">
                      <span className="text-primary font-bold">{row.poNumber}</span>
                      {row.poMatchStatus === "Price Variance" && (
                        <span className="block font-bold text-rose-600 text-[10px]">
                          Price hike: +{row.priceVariancePercent}% vs PO
                        </span>
                      )}
                      {row.poMatchStatus === "Over-Billed Qty" && (
                        <span className="block font-bold text-amber-500 text-[10px]">
                          Qty overflow (+{row.qtyVariance})
                        </span>
                      )}
                      {row.poMatchStatus === "Matched PO Line" && (
                        <span className="block text-emerald-600 text-[10px]">PO Validated ✓</span>
                      )}
                    </td>

                    {/* Disposition Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          row.disposition === "Accepted"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : row.disposition === "Rejected"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {row.disposition}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.disposition !== "Accepted" && (
                          <button
                            onClick={() => handleUpdateDisposition(row.id, "Accepted")}
                            className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                          >
                            Accept
                          </button>
                        )}
                        {row.disposition !== "Rejected" && (
                          <button
                            onClick={() => handleUpdateDisposition(row.id, "Rejected")}
                            className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-500/20"
                          >
                            Reject
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
      )}
    </div>
  );
}
