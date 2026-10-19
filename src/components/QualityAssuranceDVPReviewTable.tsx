import React, { useState } from "react";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  Search,
  ExternalLink,
  Award,
  FlaskConical,
  Building2,
  FileCheck2,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";

export type DVPTestItem = {
  id: string;
  testCode: string;
  standard: string;
  name: string;
  originatingHardwareRequirement: string;
  facilityType: "Internal Lab" | "Outsourced Lab";
  facilityName: string;
  sampleQuantity: number;
  targetCompletionDate: string;
  certificationAuthority: string;
  status: "Hardware Draft Submitted" | "QA Scheduled" | "Testing in Progress" | "Certified & Passed (0 Deviation)" | "Deviation Retest Logged";
  reportReference: string;
  notes: string;
};

export const defaultDVPTestItems: DVPTestItem[] = [
  {
    id: "DVP-01",
    testCode: "DVP-E-01",
    standard: "ISO 7637-2:2011",
    name: "Electrical Transient Immunity (Pulse 1, 2a, 3a, 3b)",
    originatingHardwareRequirement: "EHW §3.2: 12V/24V power input must withstand inductive disconnect transients without MCU reboot or lockup.",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd Noida R&D Electrical Rig",
    sampleQuantity: 5,
    targetCompletionDate: "2026-11-10",
    certificationAuthority: "Internal QA Sign-off",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "HLPL-QA-TR-ISO7637-01.pdf",
    notes: "TVS diode SM5S24A clamped pulses within 38V peak. Zero resets observed across 500 pulse repetitions.",
  },
  {
    id: "DVP-02",
    testCode: "DVP-E-02",
    standard: "ISO 16750-2:2012 §4.6.4",
    name: "Centralized Alternator Load Dump (Pulse 5b)",
    originatingHardwareRequirement: "EHW §3.3: 24V commercial vehicle alternator dump protection up to 87V peak for 400ms duration.",
    facilityType: "Outsourced Lab",
    facilityName: "ARAI Automotive Testing Lab (Pune)",
    sampleQuantity: 10,
    targetCompletionDate: "2026-11-18",
    certificationAuthority: "ARAI Accredited Certificate",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "ARAI-TAC-LOAD-DUMP-01.pdf",
    notes: "Official witness testing passed at ARAI Pune. Residual voltage clamped to 34.2V; buck regulator remained operating.",
  },
  {
    id: "DVP-03",
    testCode: "DVP-E-03",
    standard: "ISO 16750-2 §4.7",
    name: "Reverse Battery & Jump Start Overvoltage (28V DC)",
    originatingHardwareRequirement: "EHW §3.4: P-channel MOSFET reverse protection must sustain continuous -24V and +28V 5-min jump start without damage.",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd Noida R&D Bench",
    sampleQuantity: 5,
    targetCompletionDate: "2026-11-08",
    certificationAuthority: "Internal QA Sign-off",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "HLPL-QA-TR-REV-POL-01.pdf",
    notes: "Reverse leakage measured <12uA. No thermal degradation observed after 10-minute reverse voltage stress.",
  },
  {
    id: "DVP-04",
    testCode: "DVP-EMC-01",
    standard: "CISPR 25:2016 Class 3",
    name: "Conducted & Radiated RF Emissions (150kHz - 2.5GHz)",
    originatingHardwareRequirement: "EHW §4.1: DC-DC switcher EMI must stay 6dB below CISPR 25 Class 3 mask to prevent interference with FM/GPS.",
    facilityType: "Outsourced Lab",
    facilityName: "NABL Accredited Anechoic Chamber (ICAT Manesar)",
    sampleQuantity: 4,
    targetCompletionDate: "2026-11-20",
    certificationAuthority: "ICAT NABL Report",
    status: "Testing in Progress",
    reportReference: "ICAT-EMC-2026-088-DRAFT.pdf",
    notes: "Radiated sweep underway in 10-meter chamber. Conducted emissions cleared with 8.4dB margin.",
  },
  {
    id: "DVP-05",
    testCode: "DVP-EMC-02",
    standard: "ISO 10605:2008",
    name: "Electrostatic Discharge (ESD: ±8kV Contact / ±15kV Air)",
    originatingHardwareRequirement: "EHW §4.3: Exposed OBD-II pins and enclosure joints must tolerate direct ±8kV discharge gun hits.",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd ESD Testing Bench",
    sampleQuantity: 5,
    targetCompletionDate: "2026-11-12",
    certificationAuthority: "Internal QA Sign-off",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "HLPL-QA-TR-ESD-01.pdf",
    notes: "Discharges applied to J1962 pins 16, 6, 14, 4. PESD0402 diodes prevented MCU IO latchup.",
  },
  {
    id: "DVP-06",
    testCode: "DVP-ENV-01",
    standard: "ISO 16750-4 / IEC 60068-2-14",
    name: "Thermal Shock (-40°C to +85°C, 100 Cycles)",
    originatingHardwareRequirement: "MECH §2.1 & EHW §5.1: Device must operate reliably across extreme automotive cabin temperature swings.",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd Dual-Chamber Thermal Chamber",
    sampleQuantity: 8,
    targetCompletionDate: "2026-11-15",
    certificationAuthority: "Internal QA Sign-off",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "HLPL-QA-TR-THERMAL-01.pdf",
    notes: "Transition time <10 seconds. Zero micro-cracks in BGA/LGA solder joints confirmed via X-Ray inspection.",
  },
  {
    id: "DVP-07",
    testCode: "DVP-ENV-02",
    standard: "ISO 20653 / IEC 60529",
    name: "Water & Dust Ingress Protection (IP67)",
    originatingHardwareRequirement: "MECH §1.2: Enclosure with silicone gasket must prevent liquid entry at 1m water depth for 30 minutes.",
    facilityType: "Outsourced Lab",
    facilityName: "TUV Rheinland / ARAI Test Facility",
    sampleQuantity: 6,
    targetCompletionDate: "2026-11-22",
    certificationAuthority: "TUV IP67 Certificate",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "TUV-IP67-CERT-2026-041.pdf",
    notes: "Negative pressure vacuum check passed at 20kPa. Post-immersion internal humidity measured <35%.",
  },
  {
    id: "DVP-08",
    testCode: "DVP-ENV-03",
    standard: "AIS-140 Annexure 8",
    name: "Random Vibration & Mechanical Shock (3-Axis)",
    originatingHardwareRequirement: "MECH §1.4: Commercial vehicle chassis mount vibration profile (10Hz to 500Hz, 3.2 Grms, 8 hrs/axis).",
    facilityType: "Outsourced Lab",
    facilityName: "ARAI Mechanical Dynamics Lab (Pune)",
    sampleQuantity: 6,
    targetCompletionDate: "2026-11-25",
    certificationAuthority: "ARAI AIS-140 TAC Matrix",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "ARAI-VIB-AIS140-REP-01.pdf",
    notes: "OBD-II retention latch held firmly without pin fretting or intermittent connection drop.",
  },
  {
    id: "DVP-09",
    testCode: "DVP-RF-01",
    standard: "AIS-140 (MoRTH / ARAI Annex 3)",
    name: "Emergency Panic Packet & GNSS Fix Accuracy",
    originatingHardwareRequirement: "ESW §2.4: Cold-start GNSS fix within 35 seconds; emergency panic button packets dispatched to state backend server.",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd Noida Telematics Field Rig",
    sampleQuantity: 10,
    targetCompletionDate: "2026-11-14",
    certificationAuthority: "ARAI TAC Witness Release",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "HLPL-QA-TR-AIS140-EMG-01.pdf",
    notes: "Position error <2.5m CEP. Emergency packet latency to government mock endpoint averaged 1.2 seconds.",
  },
  {
    id: "DVP-10",
    testCode: "DVP-REL-01",
    standard: "IATF 16949 §8.5.1 / AEC-Q",
    name: "High Temperature Operational Life (HTOL / 500 Hours)",
    originatingHardwareRequirement: "EHW §6.2: Continuous 4G telemetry transmission at maximum ambient operating temperature (+85°C).",
    facilityType: "Internal Lab",
    facilityName: "XYZ Pvt Ltd Reliability Oven Line 1",
    sampleQuantity: 12,
    targetCompletionDate: "2026-11-28",
    certificationAuthority: "Internal QA Quality Release",
    status: "Testing in Progress",
    reportReference: "HLPL-QA-TR-HTOL-DRAFT.pdf",
    notes: "340 hours completed out of 500 hours. Zero component failures, zero memory leaks in FreeRTOS heap.",
  },
  {
    id: "DVP-11",
    testCode: "DVP-ICAT-01",
    standard: "AIS-140:2018 / MoRTH CMVR",
    name: "iCAT Full Agency Type Approval & Witness TAC (AIS-140 Annexure 8)",
    originatingHardwareRequirement: "QA §8.1 & EHW §2.1: Full vehicle telematics gateway qualification witnessed by designated certification agency.",
    facilityType: "Outsourced Lab",
    facilityName: "ICAT (International Centre for Automotive Technology, Manesar)",
    sampleQuantity: 8,
    targetCompletionDate: "2026-11-20",
    certificationAuthority: "iCAT Official TAC Certificate (Form 22 / TAC No. ICAT/2026/TAC-140-089)",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "ICAT-TAC-2026-AIS140-089.pdf",
    notes: "Official witness testing passed at ICAT Manesar: GNSS fix CEP <2.5m, 4G telemetry transmission, panic button alert dispatch to government server, and environmental testing completed with 0 deviation.",
  },
  {
    id: "DVP-12",
    testCode: "DVP-BAT-01",
    standard: "IS 16046 (Part 2):2018 / IEC 62133-2:2017 & UN 38.3",
    name: "3.7V Lithium-Ion Internal Battery NABL Certification & Safety Test",
    originatingHardwareRequirement: "EHW §3.8: 3.7V 1000mAh Lithium-ion internal battery must hold NABL accredited laboratory test certificate for overcharge, short circuit, and transport safety.",
    facilityType: "Outsourced Lab",
    facilityName: "NABL Accredited Battery Test Lab (UL India / TUV Rheinland)",
    sampleQuantity: 15,
    targetCompletionDate: "2026-11-16",
    certificationAuthority: "NABL Accredited Certificate (NABL/BAT-2026-LI37-9912)",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "NABL-BAT-IS16046-2026-9912.pdf",
    notes: "3.7V Lithium-ion cell battery pack successfully passed IS 16046 (Part 2) overcharge, forced discharge, external short circuit at 55°C, crush, and UN 38.3 transport altitude test. Zero leakage or thermal runaway.",
  },
  {
    id: "DVP-13",
    testCode: "DVP-BLE-01",
    standard: "ETSI EN 300 328 v2.2.2 / WPC ETA India",
    name: "BLE 5.2 RF Radiated Power, Antenna Harmonics & 30m Range Verification",
    originatingHardwareRequirement: "EHW §4.5: 2.4GHz Nordic nRF52840 BLE 5.2 radio must achieve +4dBm radiated power and 30m line-of-sight range to external TPMS and temperature sensors.",
    facilityType: "Outsourced Lab",
    facilityName: "NABL Accredited RF Anechoic Chamber (ICAT Manesar)",
    sampleQuantity: 6,
    targetCompletionDate: "2026-11-22",
    certificationAuthority: "WPC ETA / ICAT RF Test Report",
    status: "Certified & Passed (0 Deviation)",
    reportReference: "ICAT-RF-BLE-2026-328.pdf",
    notes: "RF EIRP measured at +3.85dBm. Transmission range tested up to 35 meters with wireless tire pressure sensors and cold-chain temperature tags through vehicle chassis.",
  },
];

export function QualityAssuranceDVPReviewTable({
  projectId = "HLPL-OBD4-01",
  onSignOffGate,
}: {
  projectId?: string;
  onSignOffGate?: () => void;
}) {
  const [items, setItems] = useState<DVPTestItem[]>(defaultDVPTestItems);
  const [facilityFilter, setFacilityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesFacility = facilityFilter === "All" || item.facilityType === facilityFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originatingHardwareRequirement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFacility && matchesStatus && matchesSearch;
  });

  const internalCount = items.filter((i) => i.facilityType === "Internal Lab").length;
  const outsourcedCount = items.filter((i) => i.facilityType === "Outsourced Lab").length;
  const certifiedCount = items.filter((i) => i.status === "Certified & Passed (0 Deviation)").length;
  const inProgressCount = items.filter((i) => i.status === "Testing in Progress").length;

  const handleMarkPassed = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "Certified & Passed (0 Deviation)" } : i
      )
    );
    showNotice(`Test verification certified and passed with zero deviations.`);
  };

  const handleToggleFacility = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              facilityType: i.facilityType === "Internal Lab" ? "Outsourced Lab" : "Internal Lab",
              facilityName:
                i.facilityType === "Internal Lab"
                  ? "ARAI / ICAT Accredited Lab"
                  : "XYZ Pvt Ltd In-House R&D Test Rig",
            }
          : i
      )
    );
    showNotice(`Test execution facility updated between internal and outsourced.`);
  };

  const handleLogDeviation = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "Deviation Retest Logged" } : i
      )
    );
    showNotice(`Quality deviation logged. EHW hardware engineer notified for retest.`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = "Test_Code,Standard,Name,Hardware_Requirement,Facility_Type,Facility_Name,Sample_Qty,Target_Date,Authority,Status,Report_Ref\n";
    const rows = items
      .map(
        (i) =>
          `"${i.testCode}","${i.standard}","${i.name}","${i.originatingHardwareRequirement}","${i.facilityType}","${i.facilityName}",${i.sampleQuantity},"${i.targetCompletionDate}","${i.certificationAuthority}","${i.status}","${i.reportReference}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HLPL-${projectId}-QA-DVP-REVIEW.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("DVP&R matrix exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="rounded-xl border border-steel/30 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                QA · Design Verification Review
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                IATF 16949 §8.2.3 / AIS-140 Type Approval DVP&amp;R Gate
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              Hardware DVP&amp;R Plan &amp; Automotive Certification Review
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Master Design Verification Plan generated by Embedded Hardware &amp; Mechanical Engineering for{" "}
              <strong className="text-foreground">{projectId}</strong>. Quality Assurance reviews, allocates tests between In-House R&amp;D Chambers and Outsourced NABL / ARAI / ICAT Labs, tracks test execution, and issues compliance certificates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm hover:bg-secondary"
            >
              <Download className="size-3.5" />
              Export DVP&amp;R (.csv)
            </button>
            {onSignOffGate && (
              <button
                onClick={onSignOffGate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <CheckCircle2 className="size-3.5" />
                Sign Off QA Gate 2 Feasibility
              </button>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 border-t border-border/40 pt-4">
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Total DVP Suite</span>
            <p className="mt-0.5 text-lg font-bold text-foreground">{items.length} Tests</p>
            <span className="text-[10px] text-steel font-medium">AIS-140 / ISO 7637-2</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Internal Lab Tests</span>
            <p className="mt-0.5 text-lg font-bold text-foreground">{internalCount} Tests</p>
            <span className="text-[10px] text-muted-foreground">XYZ Pvt Ltd In-House Chambers</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Outsourced NABL / TAC</span>
            <p className="mt-0.5 text-lg font-bold text-steel">{outsourcedCount} Tests</p>
            <span className="text-[10px] text-steel font-medium">ARAI / ICAT / TUV</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Certified &amp; Passed</span>
            <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {certifiedCount} Tests
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {Math.round((certifiedCount / items.length) * 100)}% Pass Rate
            </span>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-2.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">In Progress</span>
            <p className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">
              {inProgressCount} Tests
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Target: 2026-11-28</span>
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
              placeholder="Search test code, standard, description, facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-muted-foreground">Facility:</span>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="All">All Facilities</option>
              <option value="Internal Lab">Internal Lab Only</option>
              <option value="Outsourced Lab">Outsourced Lab Only</option>
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
              <option value="Certified & Passed (0 Deviation)">Certified &amp; Passed</option>
              <option value="Testing in Progress">Testing in Progress</option>
              <option value="QA Scheduled">QA Scheduled</option>
              <option value="Deviation Retest Logged">Deviation Logged</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-muted-foreground">
          Showing <strong>{filteredItems.length}</strong> of {items.length} DVP tests
        </span>
      </div>

      {/* Main DVP Review Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-secondary/50 font-mono text-[11px] font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2.5">Test Code</th>
              <th className="px-3 py-2.5">Standard &amp; Description</th>
              <th className="px-3 py-2.5">Originating Hardware Requirement (EHW)</th>
              <th className="px-3 py-2.5">Testing Facility</th>
              <th className="px-3 py-2.5 text-center">DUTs</th>
              <th className="px-3 py-2.5">Target SLA</th>
              <th className="px-3 py-2.5">Certification Authority</th>
              <th className="px-3 py-2.5">QA Status</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredItems.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-3 py-3">
                  <div className="font-mono font-bold text-foreground">{item.testCode}</div>
                  <span className="font-mono text-[10px] text-muted-foreground">{item.standard}</span>
                </td>
                <td className="px-3 py-3 max-w-xs">
                  <strong className="block text-foreground">{item.name}</strong>
                  <p className="mt-0.5 line-clamp-1 font-mono text-[10px] text-muted-foreground">
                    Report: {item.reportReference}
                  </p>
                </td>
                <td className="px-3 py-3 max-w-xs">
                  <p className="line-clamp-2 text-muted-foreground font-medium text-[11px]">
                    {item.originatingHardwareRequirement}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => handleToggleFacility(item.id)}
                    title="Click to toggle Internal vs Outsourced"
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-transform hover:scale-105 ${
                      item.facilityType === "Internal Lab"
                        ? "bg-primary/15 text-primary"
                        : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    {item.facilityType === "Internal Lab" ? (
                      <FlaskConical className="size-3" />
                    ) : (
                      <Building2 className="size-3" />
                    )}
                    {item.facilityType}
                  </button>
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    {item.facilityName}
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-mono font-bold text-foreground">
                  {item.sampleQuantity}
                </td>
                <td className="px-3 py-3 font-mono">
                  <div className="flex items-center gap-1 text-foreground">
                    <Clock className="size-3 text-steel" />
                    {item.targetCompletionDate}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="font-mono text-[10px] font-medium text-foreground">
                    {item.certificationAuthority}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === "Certified & Passed (0 Deviation)"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : item.status === "Testing in Progress"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : item.status === "QA Scheduled"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.status !== "Certified & Passed (0 Deviation)" && (
                      <button
                        onClick={() => handleMarkPassed(item.id)}
                        title="Certify & Pass Test"
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleLogDeviation(item.id)}
                      title="Log Deviation / Retest"
                      className="rounded p-1 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                    >
                      <AlertTriangle className="size-4" />
                    </button>
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
