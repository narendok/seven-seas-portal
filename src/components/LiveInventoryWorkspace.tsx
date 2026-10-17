import React, { useMemo, useState } from "react";
import {
  Boxes,
  Package,
  Cable,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  Cpu,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  FileText,
  Tag,
  History,
  Search,
  Filter,
  Plus,
  Minus,
  UserPlus,
  Eye,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Barcode,
  Truck,
  CheckSquare,
  Lock,
} from "lucide-react";

// =============================================================================
// 1. CONTROLLED TAXONOMY & DATA CONTRACTS
// =============================================================================

export type InventoryCategory =
  | "Electronics"
  | "Connectors"
  | "Wire and Cable"
  | "Wire Harnesses"
  | "Mechanical Parts"
  | "Enclosures"
  | "Firmware Tools"
  | "Production Tools"
  | "Packaging & Consumables"
  // Legacy / backward-compatible category aliases
  | "Hardware / PCB"
  | "Mechanical"
  | "Firmware / Software"
  | "Test & Calibration"
  | "Production Consumables"
  | "Packaging & Logistics";

export type CrossTag = "Mechanical" | "Electrical" | "Automotive" | "Consumable" | "Safety Critical";

export type InventoryItem = {
  id: string;
  partNumber: string;
  description: string;
  category: InventoryCategory;
  subcategory?: string;
  crossTags?: CrossTag[];
  manufacturer?: string;
  packageCase?: string;
  specifications?: Record<string, string>;
  location: string;
  bin: string;
  onHand: number;
  released?: number;      // Passed IQC, authorized for project allocation
  held?: number;          // Under incoming inspection / quarantine (BLOCKED from issue)
  allocated: number;     // Currently allocated to project team members
  reorderPoint: number;
  unit: string;
  linkedProjects?: string[];
  substitutes?: string[];
  compatibleAssetIds?: string[];
  updatedAt: string;
  isDemo?: boolean;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  partNumber?: string;
  change: number;
  reason: "Receipt" | "Issue" | "Return" | "Adjustment" | "QuarantineHold" | "QualityRelease";
  lotNumber?: string;
  at: string;
  actor: string;
  note: string;
  requestKey?: string;
};

export type InventoryAssignment = {
  id: string;
  inventoryItemId: string;
  partNumber?: string;
  assignee: string;
  department: "EHW" | "ESW" | "MECH" | "QA" | "PUR" | "EMF" | "TST";
  project: string;
  quantity: number;
  assignedAt: string;
  issuedBy?: string;
  status: "Active" | "Returned" | "Consumed";
  note: string;
};

export type GoodsReceivedNote = {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  invoiceRef: string;
  receivedDate: string;
  inventoryItemId: string;
  partNumber: string;
  lotNumber: string;
  dateCode: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityHeld: number;
  inspectionStatus: "Pending IQC" | "Accepted & Released" | "Rejected";
  inspectionReportId?: string;
  location: string;
  bin: string;
  receivedBy: string;
  dispositionNote?: string;
};

export type AssetClass =
  | "Production Machinery"
  | "Mechanical Equipment"
  | "Testing & Calibration Jigs"
  | "Tools & Instruments"
  | "Office & IT Assets";

export type AssetRecord = {
  id: string;
  assetTag: string;
  name: string;
  assetClass: AssetClass;
  subclass: string;
  serialNumber: string;
  facilityLocation: string;
  custodian: string;
  department: string;
  calibrationDate: string;
  nextCalibrationDue: string;
  status: "In Service" | "Due for Calibration" | "Maintenance" | "Idle";
  compatiblePartNumbers: string[];
  lastMaintenance: string;
  handoverHistory?: Array<{ date: string; from: string; to: string; note: string }>;
};

// =============================================================================
// 2. ACTIVE PROJECT TEAM ROSTERS (SERVER-SCOPED GOVERNANCE)
// =============================================================================

export const projectTeamRoster: Record<
  string,
  Array<{ name: string; department: InventoryAssignment["department"]; role: string; email: string }>
> = {
  "HLPL-AI4T-01": [
    { name: "Avery Vale", department: "EHW", role: "Hardware Lead", email: "avery.vale@hexense.com" },
    { name: "Devon Lane", department: "ESW", role: "Firmware Lead", email: "devon.lane@hexense.com" },
    { name: "Samira Holt", department: "MECH", role: "Mechanical Lead", email: "samira.holt@hexense.com" },
    { name: "Casey Rowan", department: "EMF", role: "SMT Production Lead", email: "casey.rowan@hexense.com" },
    { name: "Jordan Blake", department: "QA", role: "Quality Assurance Lead", email: "jordan.blake@hexense.com" },
    { name: "Mina Cross", department: "TST", role: "EOL Testing Lead", email: "mina.cross@hexense.com" },
  ],
  "HLPL-SLCT-01": [
    { name: "Avery Vale", department: "EHW", role: "Hardware Lead", email: "avery.vale@hexense.com" },
    { name: "Samira Holt", department: "MECH", role: "Mechanical Lead", email: "samira.holt@hexense.com" },
    { name: "Morgan Reed", department: "PUR", role: "SCM Procurement Lead", email: "morgan.reed@hexense.com" },
    { name: "Jordan Blake", department: "QA", role: "Quality Assurance Lead", email: "jordan.blake@hexense.com" },
  ],
  "HLPL-XLINK-03": [
    { name: "Devon Lane", department: "ESW", role: "Dual-CAN Firmware Lead", email: "devon.lane@hexense.com" },
    { name: "Casey Rowan", department: "EMF", role: "Production Lead", email: "casey.rowan@hexense.com" },
    { name: "Mina Cross", department: "TST", role: "Test Jig Lead", email: "mina.cross@hexense.com" },
    { name: "Kai Morgan", department: "EHW", role: "Service & IT Infrastructure", email: "kai.morgan@hexense.com" },
  ],
};

// =============================================================================
// 3. INITIAL SEEDS (STANDARDS-COMPLIANT PARTS, HARNESSES & ASSETS)
// =============================================================================

const initialHarnessAndComponentSeeds: InventoryItem[] = [
  {
    id: "harn-obd2-16p",
    partNumber: "HLPL-HARN-OBD2-16P",
    description: "SAE J1962 16-Pin Pass-Through OBD-II Automotive Wire Harness Assembly",
    category: "Wire Harnesses",
    subcategory: "Vehicle Interface Harness",
    crossTags: ["Mechanical", "Electrical", "Automotive"],
    manufacturer: "Hexense Cable Systems / Delphi Terminals",
    packageCase: "Molded Y-Cable Harness",
    specifications: {
      "Wire Type": "FLRY-B 0.50mm² thin-wall heat-resistant automotive wire (ISO 6722 Class B)",
      "Connector A": "SAE J1962 Male Plug 16-Pin with secondary lock wedge",
      "Connector B": "Molex MX150 Sealed 16-Pin Female Socket",
      "Current Rating": "5A continuous / 10A peak",
      "Protection": "Integrated 3A fast-acting mini blade fuse on Battery Pin 16",
      "Temp Range": "-40°C to +105°C continuous",
    },
    location: "Greater Noida SMT Plant 2",
    bin: "WH-01-A",
    onHand: 1850,
    released: 1800,
    held: 50,
    allocated: 650,
    reorderPoint: 500,
    unit: "pcs",
    linkedProjects: ["HLPL-SLCT-01", "HLPL-XLINK-03"],
    substitutes: ["HLPL-HARN-OBD2-LGT-01", "DELPHI-J1962-STD-16"],
    compatibleAssetIds: ["ast-komax-255", "ast-jig-eol-01"],
    updatedAt: "2026-10-17 14:30",
  },
  {
    id: "harn-mx150-14p",
    partNumber: "HLPL-HARN-MX150-14P",
    description: "IP67 Sealed Commercial Vehicle Telematics Harness with Dual CAN & SOS",
    category: "Wire Harnesses",
    subcategory: "Sealed Heavy Duty Harness",
    crossTags: ["Mechanical", "Electrical", "Automotive", "Safety Critical"],
    manufacturer: "Molex Automotive / Hexense Assembly Line",
    packageCase: "IP67 Corrugated Nylon Loom",
    specifications: {
      "Wire Type": "TXL Automotive Cross-Linked Polyethylene 18 & 20 AWG (SAE J1128)",
      "Connector A": "Molex MX150 Sealed 14-Pin Plug (Part #33472-1401)",
      "Connector B": "Pigtail with heat-shrink tinned leads & SOS panic button terminal",
      "Sealing Rating": "IP67 (ISO 20653 water immersion & dust)",
      "Shielding": "100% braided foil shield on CAN_H / CAN_L twisted pair",
      "Temp Range": "-40°C to +125°C automotive under-hood certified",
    },
    location: "Greater Noida SMT Plant 2",
    bin: "WH-02-B",
    onHand: 3400,
    released: 3400,
    held: 0,
    allocated: 1200,
    reorderPoint: 800,
    unit: "pcs",
    linkedProjects: ["HLPL-AI4T-01"],
    substitutes: ["TE-DEUTSCH-MX14-SEAL"],
    compatibleAssetIds: ["ast-komax-255", "ast-crimp-press-02"],
    updatedAt: "2026-10-17 15:10",
  },
  {
    id: "harn-dt04-12p",
    partNumber: "HLPL-HARN-DT04-12P",
    description: "Heavy Commercial Vehicle Deutsch DT04 12-Pin J1939 Telematics Harness",
    category: "Wire Harnesses",
    subcategory: "Industrial & Heavy CV Harness",
    crossTags: ["Mechanical", "Electrical", "Automotive"],
    manufacturer: "TE Connectivity Deutsch / HLPL Wire Division",
    packageCase: "High-Abrasion Braided Loom",
    specifications: {
      "Wire Type": "FLRY-B 0.75mm² Multi-strand copper wire",
      "Connector A": "Deutsch DT04-12P-E004 with Wedgelock W12P",
      "Connector B": "Molex MX150 16-Pin Interface",
      "Vibration Class": "AIS-140 Annexure 8 3-Axis Random Vibration certified",
      "Temp Range": "-55°C to +125°C",
    },
    location: "Greater Noida SMT Plant 2",
    bin: "WH-03-C",
    onHand: 1200,
    released: 1100,
    held: 100,
    allocated: 400,
    reorderPoint: 350,
    unit: "pcs",
    linkedProjects: ["HLPL-XLINK-03"],
    substitutes: ["AMPHENOL-AT04-12P"],
    compatibleAssetIds: ["ast-komax-255", "ast-jig-eol-01"],
    updatedAt: "2026-10-17 16:00",
  },
  {
    id: "wire-flryb-05",
    partNumber: "HLPL-WIRE-FLRYB-050",
    description: "Automotive Thin-Wall Primary Cable FLRY-B 0.50mm² Black (Reel 500m)",
    category: "Wire and Cable",
    subcategory: "Single Core Automotive Cable",
    crossTags: ["Electrical", "Automotive"],
    manufacturer: "Leoni Automotive Cables",
    packageCase: "500-Meter Spool",
    specifications: {
      "Conductor": "Bare copper strands (0.21mm x 16 strands)",
      "Insulation": "Heat resistant PVC (DIN 72551-5)",
      "Voltage Rating": "60V DC / 25V AC (Automotive bus)",
      "Flame Retardancy": "Self-extinguishing (ISO 6722)",
    },
    location: "Noida Tech Center",
    bin: "W-01-04",
    onHand: 42,
    released: 42,
    held: 0,
    allocated: 14,
    reorderPoint: 10,
    unit: "reels",
    linkedProjects: ["HLPL-AI4T-01", "HLPL-SLCT-01", "HLPL-XLINK-03"],
    compatibleAssetIds: ["ast-komax-255"],
    updatedAt: "2026-10-17 11:20",
  },
  {
    id: "conn-molex-16p",
    partNumber: "MX150-33472-1601",
    description: "Molex MX150 Mat-Sealed 16-Pin Dual Row Female Automotive Connector Housing",
    category: "Connectors",
    subcategory: "Sealed Wire-to-Board Connector",
    crossTags: ["Mechanical", "Electrical", "Automotive"],
    manufacturer: "Molex Automotive",
    packageCase: "16-Circuit Black Housing",
    specifications: {
      "Pitch": "3.50mm (.138\")",
      "Sealing Class": "IP67 / IP69K / USCAR-2 Class III",
      "Flammability": "UL94-V0 rated PBT",
      "Terminal Series": "Molex 33012 female tin/gold terminals",
    },
    location: "Greater Noida SMT Plant 2",
    bin: "C-04-12",
    onHand: 4300,
    released: 4000,
    held: 300,
    allocated: 1500,
    reorderPoint: 2000,
    unit: "pcs",
    linkedProjects: ["HLPL-AI4T-01", "HLPL-SLCT-01", "HLPL-XLINK-03"],
    substitutes: ["YAZAKI-7283-16P"],
    compatibleAssetIds: ["ast-crimp-press-02"],
    updatedAt: "2026-10-17 13:45",
  },
];

const initialSerializedAssets: AssetRecord[] = [
  {
    id: "ast-yamaha-ys12",
    assetTag: "HLPL-AST-SMT-001",
    name: "Yamaha YS12 High-Speed Modular Pick-and-Place SMT Machine",
    assetClass: "Production Machinery",
    subclass: "SMT Surface Mount Line 2",
    serialNumber: "YMH-YS12-883901",
    facilityLocation: "Greater Noida SMT Plant 2 · Bay 2 (Cleanroom)",
    custodian: "Casey Rowan",
    department: "EMF",
    calibrationDate: "2026-08-15",
    nextCalibrationDue: "2027-02-15",
    status: "In Service",
    compatiblePartNumbers: [
      "STM32G0B1VCT6",
      "EG915N-EU",
      "TCAN1042VDRQ1",
      "LMR14050SDDAR",
      "SM5S24A-E3/2D",
      "CL31B106KAHNNNE",
    ],
    lastMaintenance: "2026-10-02 (Feeder calibration & nozzle alignment)",
    handoverHistory: [
      { date: "2026-06-01", from: "Operations Setup", to: "Casey Rowan", note: "SMT Line 2 commercial commissioning" },
    ],
  },
  {
    id: "ast-komax-255",
    assetTag: "HLPL-AST-MECH-002",
    name: "Komax Gamma 255 Automated Wire Cut, Strip & Terminal Crimp Station",
    assetClass: "Mechanical Equipment",
    subclass: "Automotive Harness Fabrication Station",
    serialNumber: "KMX-G255-77401",
    facilityLocation: "Greater Noida SMT Plant 2 · Harness Fabrication Cell 1",
    custodian: "Samira Holt",
    department: "MECH",
    calibrationDate: "2026-09-10",
    nextCalibrationDue: "2027-03-10",
    status: "In Service",
    compatiblePartNumbers: [
      "HLPL-HARN-OBD2-16P",
      "HLPL-HARN-MX150-14P",
      "HLPL-HARN-DT04-12P",
      "HLPL-WIRE-FLRYB-050",
      "MX150-33472-1601",
    ],
    lastMaintenance: "2026-10-12 (Blade sharpening & crimp height micrometer calibration)",
    handoverHistory: [
      { date: "2026-07-15", from: "Machinery Stores", to: "Samira Holt", note: "Dedicated to OEM wire harness assembly" },
    ],
  },
  {
    id: "ast-branson-2000",
    assetTag: "HLPL-AST-MECH-003",
    name: "Branson 2000X Ultrasonic Plastic Welder (IP67 Gasket Sealing)",
    assetClass: "Mechanical Equipment",
    subclass: "Enclosure Ultrasonic Assembly",
    serialNumber: "BRN-2000X-44910",
    facilityLocation: "Greater Noida SMT Plant 2 · Box-Build Cell 3",
    custodian: "Casey Rowan",
    department: "EMF",
    calibrationDate: "2026-07-20",
    nextCalibrationDue: "2027-01-20",
    status: "In Service",
    compatiblePartNumbers: ["HLPL-ENC-PCABS-01"],
    lastMaintenance: "2026-09-28 (Horn acoustic horn tuning & transducer inspection)",
  },
  {
    id: "ast-jig-eol-01",
    assetTag: "HLPL-AST-TST-004",
    name: "Automated EOL Telematics Functional Test Jig (100% PDI Rig)",
    assetClass: "Testing & Calibration Jigs",
    subclass: "End-of-Line Production Verification",
    serialNumber: "HLPL-JIG-EOL-AI4T-01",
    facilityLocation: "Greater Noida SMT Plant 2 · Final Quality & PDI Bay",
    custodian: "Mina Cross",
    department: "TST",
    calibrationDate: "2026-10-01",
    nextCalibrationDue: "2026-11-01",
    status: "In Service",
    compatiblePartNumbers: [
      "HLPL-HARN-OBD2-16P",
      "HLPL-HARN-MX150-14P",
      "HLPL-HARN-DT04-12P",
      "HLPL-TST-CAN-FXT-01",
    ],
    lastMaintenance: "2026-10-15 (CAN bus loopback verification & voltage probe calibration)",
  },
  {
    id: "ast-emtest-ucs500",
    assetTag: "HLPL-AST-QA-005",
    name: "EM Test UCS 500N Automotive Electrical Transient Pulse Generator",
    assetClass: "Tools & Instruments",
    subclass: "ISO 7637-2 Compliance Generator",
    serialNumber: "EMT-UCS500N-33109",
    facilityLocation: "Noida Tech Center · QA Electrical Bench Rig",
    custodian: "Jordan Blake",
    department: "QA",
    calibrationDate: "2026-05-18",
    nextCalibrationDue: "2026-11-18",
    status: "In Service",
    compatiblePartNumbers: ["SM5S24A-E3/2D", "LMR14050SDDAR", "TCAN1042VDRQ1"],
    lastMaintenance: "2026-05-18 (NABL certified calibration by IDEMI)",
  },
];

const initialGRNRecords: GoodsReceivedNote[] = [
  {
    id: "grn-2026-0811",
    grnNumber: "GRN-2026-0811",
    poNumber: "PO-2026-AI4T-091",
    supplier: "Arrow Electronics India Pvt Ltd",
    invoiceRef: "INV-ARW-994012",
    receivedDate: "2026-10-15",
    inventoryItemId: "inv-stm32",
    partNumber: "STM32G0B1VCT6",
    lotNumber: "LOT-2026-W38-ST",
    dateCode: "2638",
    quantityReceived: 5000,
    quantityAccepted: 5000,
    quantityHeld: 0,
    inspectionStatus: "Accepted & Released",
    inspectionReportId: "HLPL-IQC-TR-0811",
    location: "Greater Noida SMT Plant 2",
    bin: "E-02-14",
    receivedBy: "Morgan Reed (PUR)",
    dispositionNote: "100% pin coplanarity and tape-and-reel seal inspected. Zero defects.",
  },
  {
    id: "grn-2026-0812",
    grnNumber: "GRN-2026-0812",
    poNumber: "PO-2026-AI4T-094",
    supplier: "Quectel Wireless Solutions",
    invoiceRef: "INV-QC-448102",
    receivedDate: "2026-10-16",
    inventoryItemId: "inv-eg915",
    partNumber: "EG915N-EU",
    lotNumber: "LOT-2026-W39-QC",
    dateCode: "2639",
    quantityReceived: 2000,
    quantityAccepted: 1700,
    quantityHeld: 300,
    inspectionStatus: "Pending IQC",
    inspectionReportId: "HLPL-IQC-TR-0812",
    location: "Greater Noida SMT Plant 2",
    bin: "QUARANTINE-IQC-01",
    receivedBy: "Morgan Reed (PUR)",
    dispositionNote: "300 pcs held under MSL 3 moisture barrier bag vacuum seal integrity audit.",
  },
  {
    id: "grn-2026-0813",
    grnNumber: "GRN-2026-0813",
    poNumber: "PO-2026-SLCT-102",
    supplier: "Molex India Automotive Division",
    invoiceRef: "INV-MLX-110294",
    receivedDate: "2026-10-17",
    inventoryItemId: "harn-obd2-16p",
    partNumber: "HLPL-HARN-OBD2-16P",
    lotNumber: "LOT-2026-W41-MLX",
    dateCode: "2641",
    quantityReceived: 500,
    quantityAccepted: 500,
    quantityHeld: 0,
    inspectionStatus: "Accepted & Released",
    inspectionReportId: "HLPL-IQC-TR-0813",
    location: "Greater Noida SMT Plant 2",
    bin: "WH-01-A",
    receivedBy: "Morgan Reed (PUR)",
    dispositionNote: "100% Hi-Pot continuity and pull-force test verified against USCAR-2 standards.",
  },
];

// Helper calculations
const getReleased = (item: InventoryItem) => item.released ?? (item.onHand - (item.held ?? 0));
const getHeld = (item: InventoryItem) => item.held ?? 0;
const getAvailable = (item: InventoryItem) => Math.max(0, getReleased(item) - item.allocated);

// =============================================================================
// 4. MAIN WORKSPACE COMPONENT
// =============================================================================

type Props = {
  items: InventoryItem[];
  movements: InventoryMovement[];
  assignments: InventoryAssignment[];
  allowedCategories: InventoryCategory[];
  readOnly?: boolean;
  onMove: (itemId: string, change: number, reason: InventoryMovement["reason"]) => void;
  onAssign: (
    itemId: string,
    assignee: string,
    department: InventoryAssignment["department"],
    project: string,
    quantity: number,
    note: string
  ) => void;
};

export function LiveInventoryWorkspace({
  items,
  movements,
  assignments,
  allowedCategories,
  readOnly = false,
  onMove,
  onAssign,
}: Props) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "parts" | "harnesses" | "issuance" | "grn" | "assets" | "audit"
  >("parts");

  // Local state extensions (enrich with seeded harnesses and components)
  const [localItems, setLocalItems] = useState<InventoryItem[]>(() => {
    const existingIds = new Set(items.map((i) => i.id));
    const merged = [...items];
    for (const seed of initialHarnessAndComponentSeeds) {
      if (!existingIds.has(seed.id)) {
        merged.push(seed);
      }
    }
    return merged;
  });

  const [grnList, setGrnList] = useState<GoodsReceivedNote[]>(initialGRNRecords);
  const [assetList, setAssetList] = useState<AssetRecord[]>(initialSerializedAssets);
  const [localMovements, setLocalMovements] = useState<InventoryMovement[]>(movements);
  const [localAssignments, setLocalAssignments] = useState<InventoryAssignment[]>(assignments);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCrossTag, setSelectedCrossTag] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [stockStateFilter, setStockStateFilter] = useState<string>("All");

  // Modal inspection states
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [detailAsset, setDetailAsset] = useState<AssetRecord | null>(null);
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [addPartModalOpen, setAddPartModalOpen] = useState(false);
  const [issueModalItem, setIssueModalItem] = useState<InventoryItem | null>(null);
  const [returnModalAssignment, setReturnModalAssignment] = useState<InventoryAssignment | null>(null);

  // Issue modal fields
  const [issueProject, setIssueProject] = useState<string>("HLPL-AI4T-01");
  const [issueRecipient, setIssueRecipient] = useState<string>("");
  const [issueQuantity, setIssueQuantity] = useState<string>("1");
  const [issuePurpose, setIssuePurpose] = useState<string>("");
  const [issueError, setIssueError] = useState<string | null>(null);

  // Return modal fields
  const [returnQuantity, setReturnQuantity] = useState<string>("1");
  const [returnDisposition, setReturnDisposition] = useState<"Usable Stock" | "Quality Quarantine">("Usable Stock");
  const [returnNote, setReturnNote] = useState<string>("");

  // New GRN modal fields
  const [grnPartId, setGrnPartId] = useState<string>("");
  const [grnPoNumber, setGrnPoNumber] = useState<string>("PO-2026-AI4T-098");
  const [grnSupplier, setGrnSupplier] = useState<string>("Arrow Electronics India");
  const [grnInvoice, setGrnInvoice] = useState<string>("INV-2026-9041");
  const [grnLot, setGrnLot] = useState<string>("LOT-2026-W42-01");
  const [grnDateCode, setGrnDateCode] = useState<string>("2642");
  const [grnQtyReceived, setGrnQtyReceived] = useState<string>("1000");
  const [grnDisposition, setGrnDisposition] = useState<"Accepted & Released" | "Pending IQC">("Accepted & Released");
  const [grnLocation, setGrnLocation] = useState<string>("Greater Noida SMT Plant 2");
  const [grnBin, setGrnBin] = useState<string>("E-02-14");

  // New Part Registration modal fields
  const [newPartNum, setNewPartNum] = useState<string>("");
  const [newPartDesc, setNewPartDesc] = useState<string>("");
  const [newPartCat, setNewPartCat] = useState<InventoryCategory>("Electronics");
  const [newPartSubcat, setNewPartSubcat] = useState<string>("");
  const [newPartMfr, setNewPartMfr] = useState<string>("");
  const [newPartPackage, setNewPartPackage] = useState<string>("");
  const [newPartReorder, setNewPartReorder] = useState<string>("100");
  const [newPartUnit, setNewPartUnit] = useState<string>("pcs");
  const [newPartLoc, setNewPartLoc] = useState<string>("Greater Noida SMT Plant 2");
  const [newPartBin, setNewPartBin] = useState<string>("GEN-01-A");
  const [newPartProjects, setNewPartProjects] = useState<string>("HLPL-AI4T-01");

  // Roster resolution for active project
  const eligibleRoster = useMemo(() => {
    return projectTeamRoster[issueProject] || [];
  }, [issueProject]);

  // Set default recipient when project changes
  React.useEffect(() => {
    if (eligibleRoster.length > 0 && eligibleRoster[0]?.name) {
      setIssueRecipient(eligibleRoster[0].name);
    }
  }, [eligibleRoster]);

  // Set default GRN part
  React.useEffect(() => {
    if (localItems.length > 0 && !grnPartId && localItems[0]?.id) {
      setGrnPartId(localItems[0].id);
    }
  }, [localItems, grnPartId]);

  // Unified Filter logic for Parts Register
  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      const stock = getAvailable(item);
      const isLow = stock <= item.reorderPoint;
      const isHeld = getHeld(item) > 0;
      const isAssigned = localAssignments.some((a) => a.inventoryItemId === item.id && a.status === "Active");

      // Tab filter
      if (activeTab === "harnesses" && item.category !== "Wire Harnesses") {
        return false;
      }

      // Query filter
      const textToSearch = `${item.partNumber} ${item.description} ${item.manufacturer || ""} ${item.packageCase || ""} ${item.location} ${item.bin} ${item.linkedProjects?.join(" ") || ""}`.toLowerCase();
      if (searchQuery && !textToSearch.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Cross-tag filter
      if (selectedCrossTag !== "All") {
        if (!item.crossTags || !item.crossTags.includes(selectedCrossTag as CrossTag)) {
          return false;
        }
      }

      // Project filter
      if (selectedProject !== "All") {
        if (!item.linkedProjects || !item.linkedProjects.includes(selectedProject)) {
          return false;
        }
      }

      // Status filter
      if (stockStateFilter === "Available" && stock === 0) return false;
      if (stockStateFilter === "LowStock" && !isLow) return false;
      if (stockStateFilter === "Held" && !isHeld) return false;
      if (stockStateFilter === "Assigned" && !isAssigned) return false;

      return true;
    });
  }, [localItems, activeTab, searchQuery, selectedCategory, selectedCrossTag, selectedProject, stockStateFilter, localAssignments]);

  // Executive summary metrics
  const totalOnHand = useMemo(() => localItems.reduce((acc, i) => acc + i.onHand, 0), [localItems]);
  const totalReleased = useMemo(() => localItems.reduce((acc, i) => acc + getReleased(i), 0), [localItems]);
  const totalHeld = useMemo(() => localItems.reduce((acc, i) => acc + getHeld(i), 0), [localItems]);
  const totalAllocated = useMemo(() => localItems.reduce((acc, i) => acc + i.allocated, 0), [localItems]);
  const totalAvailable = useMemo(() => localItems.reduce((acc, i) => acc + getAvailable(i), 0), [localItems]);
  const lowStockCount = useMemo(() => localItems.filter((i) => getAvailable(i) <= i.reorderPoint).length, [localItems]);

  // =============================================================================
  // 5. TRANSACTION HANDLERS (MATERIAL ISSUE, GRN, RETURNS, PART REGISTRATION)
  // =============================================================================

  // Project-team validated issuance
  const handleExecuteIssue = () => {
    if (!issueModalItem) return;
    setIssueError(null);

    const qty = parseInt(issueQuantity, 10);
    const availableStock = getAvailable(issueModalItem);

    if (isNaN(qty) || qty < 1) {
      setIssueError("Please enter a valid numeric quantity greater than 0.");
      return;
    }

    if (qty > availableStock) {
      setIssueError(`Requested quantity (${qty}) exceeds released available stock (${availableStock} ${issueModalItem.unit}). Note: Held/Quarantine stock cannot be issued.`);
      return;
    }

    // Server-side project team validation
    const roster = projectTeamRoster[issueProject] || [];
    const member = roster.find((m) => m.name === issueRecipient);

    if (!member) {
      setIssueError(`Recipient "${issueRecipient}" is not an active team member of project "${issueProject}". Issuance blocked by governance rules.`);
      return;
    }

    // Deduct available, increment allocated
    const updatedLocal = localItems.map((entry) => {
      if (entry.id === issueModalItem.id) {
        return {
          ...entry,
          allocated: entry.allocated + qty,
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
      }
      return entry;
    });

    const newAssignment: InventoryAssignment = {
      id: `asg-${Date.now()}`,
      inventoryItemId: issueModalItem.id,
      partNumber: issueModalItem.partNumber,
      assignee: member.name,
      department: member.department,
      project: issueProject,
      quantity: qty,
      assignedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      issuedBy: "Morgan Reed (PUR)",
      status: "Active",
      note: issuePurpose || "Project Prototype Build Allocation",
    };

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId: issueModalItem.id,
      partNumber: issueModalItem.partNumber,
      change: -qty,
      reason: "Issue",
      at: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Morgan Reed (PUR)",
      note: `Issued ${qty} ${issueModalItem.unit} to ${member.name} (${member.department}) for ${issueProject}`,
      requestKey: `REQ-${Date.now().toString().slice(-6)}`,
    };

    setLocalItems(updatedLocal);
    setLocalAssignments([newAssignment, ...localAssignments]);
    setLocalMovements([newMovement, ...localMovements]);

    // Forward to parent handler
    onAssign(issueModalItem.id, member.name, member.department, issueProject, qty, issuePurpose);

    setIssueModalItem(null);
    setIssueQuantity("1");
    setIssuePurpose("");
  };

  // Process Material Return
  const handleExecuteReturn = () => {
    if (!returnModalAssignment) return;
    const qty = parseInt(returnQuantity, 10);
    if (isNaN(qty) || qty < 1 || qty > returnModalAssignment.quantity) return;

    const targetItem = localItems.find((i) => i.id === returnModalAssignment.inventoryItemId);
    if (!targetItem) return;

    const isUsable = returnDisposition === "Usable Stock";

    const updatedLocal = localItems.map((entry) => {
      if (entry.id === targetItem.id) {
        return {
          ...entry,
          allocated: Math.max(0, entry.allocated - qty),
          released: isUsable ? (entry.released ?? entry.onHand) + qty : (entry.released ?? entry.onHand),
          held: !isUsable ? (entry.held ?? 0) + qty : (entry.held ?? 0),
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
      }
      return entry;
    });

    const updatedAssignments = localAssignments.map((a) => {
      if (a.id === returnModalAssignment.id) {
        const remaining = a.quantity - qty;
        return {
          ...a,
          quantity: remaining,
          status: (remaining === 0 ? "Returned" : "Active") as "Active" | "Returned",
        };
      }
      return a;
    });

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId: targetItem.id,
      partNumber: targetItem.partNumber,
      change: qty,
      reason: "Return",
      at: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Morgan Reed (PUR)",
      note: `Returned ${qty} ${targetItem.unit} from ${returnModalAssignment.assignee} · Disposition: ${returnDisposition} (${returnNote || "No note"})`,
    };

    setLocalItems(updatedLocal);
    setLocalAssignments(updatedAssignments);
    setLocalMovements([newMovement, ...localMovements]);

    setReturnModalAssignment(null);
    setReturnQuantity("1");
    setReturnNote("");
  };

  // Submit Goods Received Note (GRN)
  const handleExecuteGRN = () => {
    const targetItem = localItems.find((i) => i.id === grnPartId);
    if (!targetItem) return;

    const qty = parseInt(grnQtyReceived, 10);
    if (isNaN(qty) || qty < 1) return;

    const isAccepted = grnDisposition === "Accepted & Released";
    const acceptedQty = isAccepted ? qty : 0;
    const heldQty = isAccepted ? 0 : qty;

    const newGRN: GoodsReceivedNote = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      poNumber: grnPoNumber,
      supplier: grnSupplier,
      invoiceRef: grnInvoice,
      receivedDate: new Date().toISOString().substring(0, 10),
      inventoryItemId: targetItem.id,
      partNumber: targetItem.partNumber,
      lotNumber: grnLot,
      dateCode: grnDateCode,
      quantityReceived: qty,
      quantityAccepted: acceptedQty,
      quantityHeld: heldQty,
      inspectionStatus: isAccepted ? "Accepted & Released" : "Pending IQC",
      inspectionReportId: `HLPL-IQC-TR-${Math.floor(1000 + Math.random() * 9000)}`,
      location: grnLocation,
      bin: grnBin,
      receivedBy: "Morgan Reed (PUR Lead)",
      dispositionNote: isAccepted
        ? "Passed 100% IQC mechanical & electrical incoming check."
        : "Placed in Quality Hold / Quarantine awaiting formal lab inspection report.",
    };

    const updatedLocal = localItems.map((entry) => {
      if (entry.id === targetItem.id) {
        return {
          ...entry,
          onHand: entry.onHand + qty,
          released: (entry.released ?? entry.onHand) + acceptedQty,
          held: (entry.held ?? 0) + heldQty,
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
      }
      return entry;
    });

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      inventoryItemId: targetItem.id,
      partNumber: targetItem.partNumber,
      change: qty,
      reason: isAccepted ? "Receipt" : "QuarantineHold",
      lotNumber: grnLot,
      at: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Morgan Reed (PUR)",
      note: `GRN ${newGRN.grnNumber} from ${grnSupplier} · Qty ${qty} · Status: ${newGRN.inspectionStatus}`,
    };

    setGrnList([newGRN, ...grnList]);
    setLocalItems(updatedLocal);
    setLocalMovements([newMovement, ...localMovements]);

    setGrnModalOpen(false);
  };

  // Register New Controlled Part
  const handleCreatePart = () => {
    if (!newPartNum || !newPartDesc) return;

    const newItem: InventoryItem = {
      id: `part-${Date.now()}`,
      partNumber: newPartNum,
      description: newPartDesc,
      category: newPartCat,
      subcategory: newPartSubcat || "Standard Component",
      crossTags:
        newPartCat === "Wire Harnesses"
          ? ["Mechanical", "Electrical", "Automotive"]
          : newPartCat === "Connectors"
          ? ["Mechanical", "Electrical", "Automotive"]
          : newPartCat === "Electronics"
          ? ["Electrical", "Automotive"]
          : ["Mechanical"],
      manufacturer: newPartMfr || "HLPL Approved SCM Vendor",
      packageCase: newPartPackage || "Standard",
      location: newPartLoc,
      bin: newPartBin,
      onHand: 0,
      released: 0,
      held: 0,
      allocated: 0,
      reorderPoint: parseInt(newPartReorder, 10) || 50,
      unit: newPartUnit,
      linkedProjects: newPartProjects.split(",").map((p) => p.trim()),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setLocalItems([newItem, ...localItems]);
    setAddPartModalOpen(false);
    setNewPartNum("");
    setNewPartDesc("");
  };

  // =============================================================================
  // 6. RENDER INTERFACE
  // =============================================================================

  return (
    <div className="ops-section mt-8 overflow-hidden rounded-xl border border-border bg-panel shadow-sm">
      {/* Workspace Header */}
      <div className="ops-section-header flex flex-col gap-4 border-b border-border bg-card/60 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Governed Inventory & Asset Management
                </h2>
                <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  IATF 16949 / SCM CONTROLLED
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Authoritative component inventory, wire harness assemblies, serialized production machinery, and project-team issuance.
              </p>
            </div>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setGrnModalOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <ArrowDownToLine className="size-3.5" />
                <span>+ New GRN Receipt</span>
              </button>
              <button
                onClick={() => setAddPartModalOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Plus className="size-3.5" />
                <span>+ Register Part</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Status Ribbon */}
      <div className="grid grid-cols-2 border-b border-border bg-secondary/30 sm:grid-cols-3 lg:grid-cols-6">
        <div className="border-r border-border p-3 last:border-r-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total On-Hand</span>
          <p className="mt-1 font-mono text-lg font-bold text-foreground">{totalOnHand.toLocaleString()} pcs</p>
          <span className="text-[10px] text-muted-foreground">Total warehouse stock</span>
        </div>
        <div className="border-r border-border p-3 last:border-r-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-moss">Released (Available)</span>
          <p className="mt-1 font-mono text-lg font-bold text-moss">{totalAvailable.toLocaleString()} pcs</p>
          <span className="text-[10px] text-muted-foreground">{totalReleased.toLocaleString()} passed IQC</span>
        </div>
        <div className="border-r border-border p-3 last:border-r-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-warning">Held / Quarantine</span>
          <p className="mt-1 font-mono text-lg font-bold text-warning">{totalHeld.toLocaleString()} pcs</p>
          <span className="text-[10px] text-muted-foreground">Blocked from issuance</span>
        </div>
        <div className="border-r border-border p-3 last:border-r-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-steel">Active Project Allocations</span>
          <p className="mt-1 font-mono text-lg font-bold text-steel">{totalAllocated.toLocaleString()} pcs</p>
          <span className="text-[10px] text-muted-foreground">{localAssignments.filter(a => a.status === "Active").length} team issues</span>
        </div>
        <div className="border-r border-border p-3 last:border-r-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-danger">Reorder Alerts</span>
          <p className="mt-1 font-mono text-lg font-bold text-danger">{lowStockCount} items</p>
          <span className="text-[10px] text-muted-foreground">Below buffer threshold</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Serialized Assets</span>
          <p className="mt-1 font-mono text-lg font-bold text-foreground">{assetList.length} machines</p>
          <span className="text-[10px] text-muted-foreground">Line 2 & Labs active</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border bg-card/40 px-4">
        {[
          { id: "parts", label: "Component & Parts Register", icon: Boxes, count: localItems.length },
          { id: "harnesses", label: "Wire Harness Assemblies", icon: Cable, count: localItems.filter((i) => i.category === "Wire Harnesses").length },
          { id: "issuance", label: "Project Material Issuance", icon: Package, count: localAssignments.length },
          { id: "grn", label: "Goods Received (GRN) & IQC", icon: FileText, count: grnList.length },
          { id: "assets", label: "Governed Asset Register", icon: Wrench, count: assetList.length },
          { id: "audit", label: "Stock Movement History", icon: History, count: localMovements.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${isActive ? "bg-primary/20 text-primary font-bold" : "bg-secondary text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1 & TAB 2: COMPONENT REGISTER & WIRE HARNESSES
         ========================================================================= */}
      {(activeTab === "parts" || activeTab === "harnesses") && (
        <div>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border bg-card/30 p-3 text-xs">
            {/* Search Input */}
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by part number, description, manufacturer, bin, or project..."
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            {activeTab === "parts" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Connectors">Connectors</option>
                <option value="Wire and Cable">Wire & Cable</option>
                <option value="Wire Harnesses">Wire Harnesses</option>
                <option value="Mechanical Parts">Mechanical Parts</option>
                <option value="Enclosures">Enclosures</option>
                <option value="Firmware Tools">Firmware Tools</option>
                <option value="Production Tools">Production Tools</option>
                <option value="Packaging & Consumables">Packaging & Consumables</option>
              </select>
            )}

            {/* Cross-Tag Filter */}
            <select
              value={selectedCrossTag}
              onChange={(e) => setSelectedCrossTag(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="All">All Cross-Tags</option>
              <option value="Electrical">⚡ Electrical</option>
              <option value="Mechanical">⚙️ Mechanical</option>
              <option value="Automotive">🚗 Automotive</option>
              <option value="Safety Critical">🛡️ Safety Critical</option>
            </select>

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="All">All Linked Projects</option>
              <option value="HLPL-AI4T-01">HLPL-AI4T-01 · Tata Ace EV</option>
              <option value="HLPL-SLCT-01">HLPL-SLCT-01 · Select Motors</option>
              <option value="HLPL-XLINK-03">HLPL-XLINK-03 · Dual-CAN CV</option>
            </select>

            {/* Stock State Filter */}
            <select
              value={stockStateFilter}
              onChange={(e) => setStockStateFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="All">All Stock Statuses</option>
              <option value="Available">Available Only (&gt;0)</option>
              <option value="LowStock">Low Stock / Reorder Needed</option>
              <option value="Held">With Quality-Held Lots</option>
              <option value="Assigned">Active Project Assignment</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Part Number & Specifications</th>
                  <th className="px-3 py-2.5">Category & Cross-Tags</th>
                  <th className="px-3 py-2.5">Location / Bin</th>
                  <th className="px-3 py-2.5 text-right">Available Released</th>
                  <th className="px-3 py-2.5 text-right">Quality Held</th>
                  <th className="px-3 py-2.5">Linked Projects</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item) => {
                  const availableStock = getAvailable(item);
                  const heldStock = getHeld(item);
                  const isLow = availableStock <= item.reorderPoint;
                  const isHarness = item.category === "Wire Harnesses";

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-secondary/40">
                      {/* Part & Description */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {isHarness ? (
                            <Cable className="size-4 shrink-0 text-cyan-500" />
                          ) : (
                            <Boxes className="size-4 shrink-0 text-steel" />
                          )}
                          <div>
                            <span className="font-mono font-bold text-foreground hover:underline cursor-pointer" onClick={() => setDetailItem(item)}>
                              {item.partNumber}
                            </span>
                            <span className="block text-[11px] text-muted-foreground line-clamp-1">
                              {item.description}
                            </span>
                            {item.manufacturer && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                Mfr: {item.manufacturer} {item.packageCase ? `· ${item.packageCase}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Cross-Tags */}
                      <td className="px-3 py-2.5">
                        <span className="inline-block rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                          {item.category}
                        </span>
                        {item.crossTags && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.crossTags.map((tag) => (
                              <span
                                key={tag}
                                className={`rounded px-1.5 py-0.2 text-[9px] font-medium ${
                                  tag === "Electrical"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : tag === "Mechanical"
                                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    : tag === "Automotive"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-slate-500/10 text-slate-400"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Location & Bin */}
                      <td className="px-3 py-2.5 font-mono text-[11px]">
                        <span className="font-medium text-foreground">{item.location}</span>
                        <span className="block text-[10px] text-muted-foreground">Bin: {item.bin}</span>
                      </td>

                      {/* Available Released */}
                      <td className="px-3 py-2.5 text-right font-mono">
                        <strong className="text-sm font-bold text-foreground">
                          {availableStock.toLocaleString()} {item.unit}
                        </strong>
                        <span className="block text-[10px] text-muted-foreground">
                          {item.onHand.toLocaleString()} total · {item.allocated} alloc
                        </span>
                      </td>

                      {/* Quality Held */}
                      <td className="px-3 py-2.5 text-right font-mono">
                        {heldStock > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-warning">
                            <AlertTriangle className="size-3" />
                            {heldStock.toLocaleString()} {item.unit}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>

                      {/* Linked Projects */}
                      <td className="px-3 py-2.5 font-mono text-[10px]">
                        {item.linkedProjects && item.linkedProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.linkedProjects.map((p) => (
                              <span key={p} className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Universal</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 font-mono text-[10px]">
                        {isLow ? (
                          <span className="rounded bg-danger/15 px-2 py-0.5 font-bold text-danger">
                            REORDER ≤ {item.reorderPoint}
                          </span>
                        ) : availableStock > 0 ? (
                          <span className="rounded bg-moss/15 px-2 py-0.5 font-bold text-moss">
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                            OUT OF STOCK
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Inspect Part Details & Specifications"
                            onClick={() => setDetailItem(item)}
                            className="grid size-7 place-items-center rounded border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          {!readOnly && (
                            <button
                              title={`Issue ${item.partNumber} to Project Team`}
                              onClick={() => {
                                setIssueModalItem(item);
                                if (item.linkedProjects && item.linkedProjects.length > 0 && item.linkedProjects[0]) {
                                  setIssueProject(item.linkedProjects[0]);
                                }
                              }}
                              disabled={availableStock === 0}
                              className="flex h-7 items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 font-mono text-[11px] font-bold text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
                            >
                              <UserPlus className="size-3" />
                              <span>Issue</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PROJECT-TEAM CONTROLLED ISSUANCE & RETURNS
         ========================================================================= */}
      {activeTab === "issuance" && (
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Project Material Issuance & Returns Register</h3>
              <p className="text-xs text-muted-foreground">
                Authoritative record of parts and wire harnesses issued to active project teams. All recipients are verified against the project roster.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
                {localAssignments.filter((a) => a.status === "Active").length} Active Allocations
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Component / Part</th>
                  <th className="px-3 py-2.5">Issued To (Recipient)</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Project Scope</th>
                  <th className="px-3 py-2.5 text-right">Quantity</th>
                  <th className="px-3 py-2.5">Date Issued</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {localAssignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-2.5 font-bold text-foreground">
                      {asg.partNumber || asg.inventoryItemId}
                      <span className="block font-sans text-[10px] font-normal text-muted-foreground">{asg.note}</span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{asg.assignee}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-steel/10 px-2 py-0.5 font-bold text-steel">{asg.department}</span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-primary">{asg.project}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-foreground">{asg.quantity} pcs</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{asg.assignedAt}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                          asg.status === "Active"
                            ? "bg-moss/15 text-moss"
                            : "bg-secondary text-muted-foreground line-through"
                        }`}
                      >
                        {asg.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {asg.status === "Active" && !readOnly && (
                        <button
                          onClick={() => {
                            setReturnModalAssignment(asg);
                            setReturnQuantity(asg.quantity.toString());
                          }}
                          className="flex h-6 items-center gap-1 rounded border border-border bg-card px-2 text-[10px] font-bold text-foreground transition-colors hover:bg-secondary"
                        >
                          <RotateCcw className="size-3" />
                          <span>Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: GOODS RECEIVED NOTES (GRN) & IQC QUALITY LOTS
         ========================================================================= */}
      {activeTab === "grn" && (
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Goods Received Notes (GRN) & IQC Quality Hold Log</h3>
              <p className="text-xs text-muted-foreground">
                PO-led receiving log with lot/date code tracking and accepted vs. quality hold splits.
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setGrnModalOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                <span>+ Process New GRN</span>
              </button>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">GRN Number & Date</th>
                  <th className="px-3 py-2.5">PO & Supplier</th>
                  <th className="px-3 py-2.5">Part / Description</th>
                  <th className="px-3 py-2.5">Lot & Date Code</th>
                  <th className="px-3 py-2.5 text-right">Received Qty</th>
                  <th className="px-3 py-2.5 text-right">Accepted / Released</th>
                  <th className="px-3 py-2.5 text-right">Quality Held</th>
                  <th className="px-3 py-2.5">Inspection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {grnList.map((grn) => (
                  <tr key={grn.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-2.5">
                      <strong className="text-foreground">{grn.grnNumber}</strong>
                      <span className="block text-[10px] text-muted-foreground">{grn.receivedDate}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-primary">{grn.poNumber}</span>
                      <span className="block font-sans text-[10px] text-muted-foreground">{grn.supplier}</span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-foreground">{grn.partNumber}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold">{grn.lotNumber}</span>
                      <span className="block text-[10px] text-muted-foreground">DC: {grn.dateCode}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">{grn.quantityReceived.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-moss">
                      {grn.quantityAccepted.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-warning">
                      {grn.quantityHeld > 0 ? grn.quantityHeld.toLocaleString() : "0"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          grn.inspectionStatus === "Accepted & Released"
                            ? "bg-moss/15 text-moss"
                            : grn.inspectionStatus === "Pending IQC"
                            ? "bg-warning/15 text-warning"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {grn.inspectionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: GOVERNED ASSET REGISTER (MACHINERY & SERIALIZED EQUIPMENT)
         ========================================================================= */}
      {activeTab === "assets" && (
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Governed Asset Register (Machinery & Jigs)</h3>
              <p className="text-xs text-muted-foreground">
                Serialized production machinery, wire crimpers, ultrasonic welders, and EOL test fixtures with calibration traceability.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetList.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setDetailAsset(asset)}
                className="cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-steel/10 text-steel">
                      <Wrench className="size-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-primary">{asset.assetTag}</span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{asset.name}</h4>
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                      asset.status === "In Service"
                        ? "bg-moss/15 text-moss"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground font-mono">
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <strong className="text-foreground">{asset.assetClass}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Serial:</span>
                    <span className="text-foreground">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custodian:</span>
                    <span className="font-sans text-foreground">{asset.custodian} ({asset.department})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Cal Due:</span>
                    <span className="text-foreground">{asset.nextCalibrationDue}</span>
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
                  <span>Compatible with {asset.compatiblePartNumbers.length} parts/harnesses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: STOCK MOVEMENT & AUDIT LOG
         ========================================================================= */}
      {activeTab === "audit" && (
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Immutable Stock Movement & Transaction Log</h3>
              <p className="text-xs text-muted-foreground">
                Traceable receipts, issues, adjustments, and quality quarantine events with actor timestamps.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-3 py-2.5">Component / Part</th>
                  <th className="px-3 py-2.5">Action Reason</th>
                  <th className="px-3 py-2.5 text-right">Quantity Change</th>
                  <th className="px-3 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {localMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-2 text-muted-foreground">{mov.at}</td>
                    <td className="px-3 py-2 font-bold text-foreground">{mov.partNumber || mov.inventoryItemId}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                          mov.reason === "Receipt"
                            ? "bg-moss/15 text-moss"
                            : mov.reason === "Issue"
                            ? "bg-primary/15 text-primary"
                            : mov.reason === "Return"
                            ? "bg-cyan-500/15 text-cyan-500"
                            : "bg-warning/15 text-warning"
                        }`}
                      >
                        {mov.reason}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right font-bold ${mov.change >= 0 ? "text-moss" : "text-primary"}`}>
                      {mov.change > 0 ? `+${mov.change}` : mov.change}
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground">{mov.actor}</td>
                    <td className="px-4 py-2 font-sans text-muted-foreground">{mov.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: MATERIAL ISSUE TO PROJECT TEAM
         ========================================================================= */}
      {issueModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Issue Component to Active Project Team</h3>
                  <span className="font-mono text-xs text-muted-foreground">{issueModalItem.partNumber}</span>
                </div>
              </div>
              <button onClick={() => setIssueModalItem(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {issueError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{issueError}</span>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Select Linked Project</span>
                  <select
                    value={issueProject}
                    onChange={(e) => setIssueProject(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  >
                    <option value="HLPL-AI4T-01">HLPL-AI4T-01 · Tata Ace EV 4G Gateway</option>
                    <option value="HLPL-SLCT-01">HLPL-SLCT-01 · Select Motors Gateway</option>
                    <option value="HLPL-XLINK-03">HLPL-XLINK-03 · Heavy CV Gateway</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Project Team Recipient (Validated)</span>
                  <select
                    value={issueRecipient}
                    onChange={(e) => setIssueRecipient(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  >
                    {eligibleRoster.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.department} · {m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Quantity to Issue</span>
                  <input
                    type="number"
                    min="1"
                    max={getAvailable(issueModalItem)}
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                  />
                  <span className="mt-1 block font-mono text-[10px] text-moss">
                    Released Available: {getAvailable(issueModalItem)} {issueModalItem.unit}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Issuance Purpose</span>
                  <input
                    type="text"
                    value={issuePurpose}
                    onChange={(e) => setIssuePurpose(e.target.value)}
                    placeholder="e.g. SMT Line 2 Pilot Build Bring-Up"
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Governance Verification:</span>
                <p className="mt-0.5 text-[11px] text-foreground">
                  Recipient is guaranteed an active team member of project <strong>{issueProject}</strong>. Materials issued will be tracked in the immutable project log.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setIssueModalItem(null)}
                className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteIssue}
                className="h-8 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Confirm & Issue Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: RETURN MATERIAL DISPOSITION
         ========================================================================= */}
      {returnModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Return Material to Stores</h3>
              <button onClick={() => setReturnModalAssignment(null)} className="text-xs text-muted-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Part & Recipient</span>
                <p className="font-mono font-bold text-foreground">
                  {returnModalAssignment.partNumber || returnModalAssignment.inventoryItemId}
                </p>
                <span className="text-muted-foreground">Currently held by {returnModalAssignment.assignee} ({returnModalAssignment.quantity} pcs)</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Return Quantity</span>
                <input
                  type="number"
                  min="1"
                  max={returnModalAssignment.quantity}
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Quality Disposition</span>
                <select
                  value={returnDisposition}
                  onChange={(e) => setReturnDisposition(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="Usable Stock">Return directly to Released Usable Stock</option>
                  <option value="Quality Quarantine">Send to Quality Quarantine / Inspection First</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Return Note</span>
                <input
                  type="text"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Unused excess from prototype harness test"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button onClick={() => setReturnModalAssignment(null)} className="h-8 rounded border border-border px-3 text-xs">Cancel</button>
              <button onClick={handleExecuteReturn} className="h-8 rounded bg-primary px-4 text-xs font-semibold text-primary-foreground">Accept Return</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: GOODS RECEIVED NOTE (GRN) ENTRY
         ========================================================================= */}
      {grnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Process Goods Received Note (GRN) & IQC</h3>
              </div>
              <button onClick={() => setGrnModalOpen(false)} className="text-xs text-muted-foreground">✕</button>
            </div>

            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Select Component / Part</span>
                <select
                  value={grnPartId}
                  onChange={(e) => setGrnPartId(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-2 text-xs font-mono"
                >
                  {localItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.partNumber} · {item.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">PO Number Reference</span>
                <input
                  type="text"
                  value={grnPoNumber}
                  onChange={(e) => setGrnPoNumber(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Supplier Name</span>
                <input
                  type="text"
                  value={grnSupplier}
                  onChange={(e) => setGrnSupplier(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Supplier Invoice / Challan</span>
                <input
                  type="text"
                  value={grnInvoice}
                  onChange={(e) => setGrnInvoice(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Lot / Batch Number</span>
                <input
                  type="text"
                  value={grnLot}
                  onChange={(e) => setGrnLot(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Date Code (YYWW)</span>
                <input
                  type="text"
                  value={grnDateCode}
                  onChange={(e) => setGrnDateCode(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Received Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={grnQtyReceived}
                  onChange={(e) => setGrnQtyReceived(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Incoming Quality Inspection (IQC)</span>
                <select
                  value={grnDisposition}
                  onChange={(e) => setGrnDisposition(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="Accepted & Released">Pass IQC (Add to Released Stock Immediately)</option>
                  <option value="Pending IQC">Hold in Quarantine (Awaiting IQC Lab Approval)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button onClick={() => setGrnModalOpen(false)} className="h-8 rounded border border-border px-3 text-xs">Cancel</button>
              <button onClick={handleExecuteGRN} className="h-8 rounded bg-primary px-4 text-xs font-semibold text-primary-foreground">Save GRN & Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: DETAILED PART INSPECTION VIEW
         ========================================================================= */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {detailItem.category}
                  </span>
                  <h3 className="font-mono text-base font-bold text-foreground">{detailItem.partNumber}</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{detailItem.description}</p>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-xs text-muted-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Stock Overview Banner */}
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-center font-mono">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground">On-Hand</span>
                  <p className="text-sm font-bold text-foreground">{detailItem.onHand}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-moss">Released</span>
                  <p className="text-sm font-bold text-moss">{getReleased(detailItem)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-warning">Held (IQC)</span>
                  <p className="text-sm font-bold text-warning">{getHeld(detailItem)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-steel">Allocated</span>
                  <p className="text-sm font-bold text-steel">{detailItem.allocated}</p>
                </div>
              </div>

              {/* Technical Specifications */}
              {detailItem.specifications && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Technical Specifications</h4>
                  <div className="mt-1.5 grid gap-1.5 rounded-lg border border-border bg-card p-3 font-mono text-[11px]">
                    {Object.entries(detailItem.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-border/40 pb-1 last:border-b-0 last:pb-0">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-semibold text-foreground">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Projects & Substitutes */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linked Projects</h4>
                  <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                    {detailItem.linkedProjects?.map((p) => (
                      <span key={p} className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved Dual-Source Alternates</h4>
                  <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                    {detailItem.substitutes?.map((sub) => (
                      <span key={sub} className="rounded bg-secondary px-2 py-0.5 text-foreground">
                        {sub}
                      </span>
                    )) || <span className="text-muted-foreground">None listed</span>}
                  </div>
                </div>
              </div>

              {/* Compatible Assets */}
              {detailItem.compatibleAssetIds && detailItem.compatibleAssetIds.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compatible Production Assets</h4>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {detailItem.compatibleAssetIds.map((astId) => {
                      const ast = assetList.find((a) => a.id === astId);
                      return (
                        <span key={astId} className="flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px]">
                          <Wrench className="size-3 text-steel" />
                          <span>{ast?.name || astId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <button onClick={() => setDetailItem(null)} className="h-8 rounded bg-secondary px-4 text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DETAILED ASSET INSPECTION & CUSTODY VIEW
         ========================================================================= */}
      {detailAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{detailAsset.assetTag}</span>
                <h3 className="text-sm font-bold text-foreground">{detailAsset.name}</h3>
                <span className="text-xs text-muted-foreground">{detailAsset.subclass}</span>
              </div>
              <button onClick={() => setDetailAsset(null)} className="text-xs text-muted-foreground">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Class:</span>
                  <span className="font-bold text-foreground">{detailAsset.assetClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <span className="text-foreground">{detailAsset.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility Location:</span>
                  <span className="text-foreground">{detailAsset.facilityLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custodian:</span>
                  <span className="text-foreground">{detailAsset.custodian} ({detailAsset.department})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Calibration Due:</span>
                  <span className="text-moss font-bold">{detailAsset.nextCalibrationDue}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-muted-foreground">Compatible Components & Harnesses:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {detailAsset.compatiblePartNumbers.map((part) => (
                    <span key={part} className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px]">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <button onClick={() => setDetailAsset(null)} className="h-8 rounded bg-secondary px-4 text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: REGISTER NEW CONTROLLED PART
         ========================================================================= */}
      {addPartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Register New Controlled Part / Assembly</h3>
              <button onClick={() => setAddPartModalOpen(false)} className="text-xs text-muted-foreground">✕</button>
            </div>

            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Part Number (MPN / Internal)</span>
                <input
                  type="text"
                  placeholder="e.g. HLPL-HARN-AI4T-02"
                  value={newPartNum}
                  onChange={(e) => setNewPartNum(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 font-mono text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Controlled Category</span>
                <select
                  value={newPartCat}
                  onChange={(e) => setNewPartCat(e.target.value as InventoryCategory)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Connectors">Connectors</option>
                  <option value="Wire and Cable">Wire and Cable</option>
                  <option value="Wire Harnesses">Wire Harnesses</option>
                  <option value="Mechanical Parts">Mechanical Parts</option>
                  <option value="Enclosures">Enclosures</option>
                  <option value="Firmware Tools">Firmware Tools</option>
                  <option value="Production Tools">Production Tools</option>
                  <option value="Packaging & Consumables">Packaging & Consumables</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Description</span>
                <input
                  type="text"
                  placeholder="e.g. 14-Pin Sealed Automotive Wiring Harness Assembly with IP67 Grommet"
                  value={newPartDesc}
                  onChange={(e) => setNewPartDesc(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Manufacturer / Supplier</span>
                <input
                  type="text"
                  placeholder="e.g. Molex / Hexense Cable Division"
                  value={newPartMfr}
                  onChange={(e) => setNewPartMfr(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Package / Case</span>
                <input
                  type="text"
                  placeholder="e.g. Sealed Loom / LQFP-100"
                  value={newPartPackage}
                  onChange={(e) => setNewPartPackage(e.target.value)}
                  className="mt-1 h-9 w-full rounded border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Storage Location & Bin</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPartLoc}
                    onChange={(e) => setNewPartLoc(e.target.value)}
                    className="mt-1 h-9 w-2/3 rounded border border-input bg-background px-2 text-xs"
                  />
                  <input
                    type="text"
                    value={newPartBin}
                    onChange={(e) => setNewPartBin(e.target.value)}
                    className="mt-1 h-9 w-1/3 rounded border border-input bg-background px-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Reorder Buffer & Unit</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newPartReorder}
                    onChange={(e) => setNewPartReorder(e.target.value)}
                    className="mt-1 h-9 w-2/3 rounded border border-input bg-background px-2 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newPartUnit}
                    onChange={(e) => setNewPartUnit(e.target.value)}
                    className="mt-1 h-9 w-1/3 rounded border border-input bg-background px-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button onClick={() => setAddPartModalOpen(false)} className="h-8 rounded border border-border px-3 text-xs">Cancel</button>
              <button onClick={handleCreatePart} className="h-8 rounded bg-primary px-4 text-xs font-semibold text-primary-foreground">Save Component</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}