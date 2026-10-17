import { useState } from "react";
import {
  Layers,
  Cpu,
  Radio,
  Wifi,
  Zap,
  Shield,
  Gauge,
  CheckCircle2,
  Box,
  Compass,
  ArrowRight,
  Info,
  Sliders,
  FileText,
  Wrench,
  Activity,
  AlertTriangle,
  QrCode,
  Bluetooth,
  Truck,
  Sparkles,
} from "lucide-react";

export interface DeviceVisualSpecProps {
  projectId: string;
  activeRev?: "01" | "02" | undefined;
  onRevChange?: ((rev: "01" | "02") => void) | undefined;
  onOpenDocument?: ((docId: string) => void) | undefined;
}

export function DeviceVisualSpecAndBlockDiagram({
  projectId,
  activeRev = "01",
  onRevChange,
  onOpenDocument,
}: DeviceVisualSpecProps) {
  const [internalRev, setInternalRev] = useState<"01" | "02">(activeRev);
  const rev = onRevChange ? activeRev : internalRev;
  const setRev = onRevChange ? onRevChange : setInternalRev;

  const [activeTab, setActiveTab] = useState<"oneview" | "dimensions" | "blockDiagram" | "serviceMounting">("oneview");
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);

  const isObd = projectId.includes("OBD") || projectId === "HLPL-OBD4-01";
  const modelCode = isObd ? (rev === "02" ? "HLPL-OBD4-02" : "HLPL-OBD4-01") : projectId;
  const modelTitle = isObd
    ? rev === "02"
      ? "4G OBD-II Smart Telematics Tracker (BLE 5.2 Sensor Hub Variant)"
      : "4G OBD-II Commercial Telematics Tracker (Base J1962)"
    : `${projectId} Telematics System`;

  const pinoutData: Record<number, { name: string; signal: string; desc: string; color: string }> = {
    1: { name: "Pin 1", signal: "Vendor Option", desc: "Ignition Sense / Wakeup DI", color: "bg-slate-400" },
    4: { name: "Pin 4", signal: "Chassis GND", desc: "Vehicle Frame Ground Return", color: "bg-slate-900 text-white dark:bg-slate-800" },
    5: { name: "Pin 5", signal: "Signal GND", desc: "Isolated Electronic Ground Reference", color: "bg-slate-700 text-white" },
    6: { name: "Pin 6", signal: "CAN_H (ISO 15765)", desc: "High-Speed Vehicle Bus High (500 kbps)", color: "bg-amber-500 text-black font-bold" },
    7: { name: "Pin 7", signal: "K-Line (ISO 9141-2)", desc: "Legacy Diagnostic Bus / UDS Kline", color: "bg-blue-500 text-white" },
    14: { name: "Pin 14", signal: "CAN_L (ISO 15765)", desc: "High-Speed Vehicle Bus Low (500 kbps)", color: "bg-emerald-500 text-black font-bold" },
    16: { name: "Pin 16", signal: "+12V / 24V BATT", desc: "Direct Permanent Vehicle Battery (9V–36V)", color: "bg-rose-500 text-white font-bold" },
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm transition-all">
      {/* Top Banner & Revision Switcher */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold rounded bg-primary/10 text-primary px-2.5 py-1">
              DEVICE BLUEPRINT & ARCHITECTURE SPEC
            </span>
            <span className="font-mono text-xs font-bold rounded border border-border bg-panel px-2 py-0.5 text-foreground">
              {modelCode}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              rev === "02"
                ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
            }`}>
              {rev === "02" ? (
                <>
                  <Bluetooth className="size-3 animate-pulse" />
                  Rev 02: BLE 5.2 Sensor Hub Active (ECN-02 Approved)
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3" />
                  Rev 01: Base Production Architecture Frozen
                </>
              )}
            </span>
          </div>

          <h3 className="mt-1.5 text-base font-bold text-foreground md:text-lg">
            {modelTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synchronized one-view specification for Engineering (EHW, ESW, MECH), Manufacturing (EMF), Quality (QA), Testing (TST), and Field Installation Service (SIT).
          </p>
        </div>

        {/* Revision Toggle Pill */}
        <div className="flex flex-wrap items-center gap-2 bg-panel p-1.5 rounded-lg border border-border">
          <span className="text-[11px] font-bold text-muted-foreground px-2">Lifecycle Revision:</span>
          <button
            onClick={() => setRev("01")}
            className={`h-7 px-3 rounded text-xs font-bold transition-all ${
              rev === "01"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rev 01 · Standard OBD-II
          </button>
          <button
            onClick={() => setRev("02")}
            className={`h-7 px-3 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              rev === "02"
                ? "bg-cyan-600 text-white shadow"
                : "text-muted-foreground hover:text-cyan-500"
            }`}
          >
            <Sparkles className="size-3" />
            Rev 02 · BLE 5.2 Upgrade
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Visual One-View, Mechanical Dimensions, System Block Diagram, Service Mounting */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-2">
        <button
          onClick={() => setActiveTab("oneview")}
          className={`h-8 px-3 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "oneview"
              ? "bg-secondary text-foreground border border-border shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Box className="size-3.5" />
          1. Device Visual One-View & J1962 Pinout
        </button>

        <button
          onClick={() => setActiveTab("dimensions")}
          className={`h-8 px-3 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "dimensions"
              ? "bg-secondary text-foreground border border-border shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="size-3.5" />
          2. Mechanical Dimensions & Fitment Envelope
        </button>

        <button
          onClick={() => setActiveTab("blockDiagram")}
          className={`h-8 px-3 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "blockDiagram"
              ? "bg-secondary text-foreground border border-border shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="size-3.5" />
          3. Hardware System Block Diagram
        </button>

        <button
          onClick={() => setActiveTab("serviceMounting")}
          className={`h-8 px-3 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "serviceMounting"
              ? "bg-secondary text-foreground border border-border shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="size-3.5 text-amber-500" />
          4. Service Team (SIT) Field Mounting & PDI
        </button>
      </div>

      {/* TAB 1: DEVICE VISUAL ONE-VIEW & J1962 PINOUT */}
      {activeTab === "oneview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Visual Device Chassis Render (Left Col: 7 spans) */}
          <div className="lg:col-span-7 rounded-lg border border-border bg-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
              <span className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                <Box className="size-4 text-primary" />
                Physical Device One-View · J1962 Type A Form Factor
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Scale 1:1 Engineering Model</span>
            </div>

            {/* Interactive Device Chassis Representation */}
            <div className="relative mx-auto max-w-md rounded-2xl border-2 border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl text-white">
              {/* Top Laser Markings */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded bg-primary text-primary-foreground font-black text-xs">
                    SS
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-bold tracking-wider text-slate-200">
                      HEXENSE LABS
                    </p>
                    <p className="font-mono text-[9px] text-slate-400">
                      MODEL: {modelCode} · AUTOMOTIVE TELEMATICS
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[9px] text-slate-400">
                  <span className="inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/30">
                    AIS-140 TAC APPROVED
                  </span>
                  <p className="mt-1">CE · RoHS · 9V-36V</p>
                </div>
              </div>

              {/* Status Diagnostic LEDs */}
              <div className="my-4 rounded-lg bg-slate-900/90 border border-slate-800 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-2">
                  Diagnostic Status Indicators (Quad LED Cluster)
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-1.5">
                    <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse mb-1" />
                    <p className="font-bold text-emerald-300">PWR</p>
                    <p className="text-[8px] text-slate-400">3.3V Normal</p>
                  </div>

                  <div className="rounded border border-blue-500/30 bg-blue-500/10 p-1.5">
                    <span className="inline-block size-2 rounded-full bg-blue-400 animate-pulse mb-1" />
                    <p className="font-bold text-blue-300">4G LTE</p>
                    <p className="text-[8px] text-slate-400">Cloud Link</p>
                  </div>

                  <div className="rounded border border-amber-500/30 bg-amber-500/10 p-1.5">
                    <span className="inline-block size-2 rounded-full bg-amber-400 animate-pulse mb-1" />
                    <p className="font-bold text-amber-300">GNSS</p>
                    <p className="text-[8px] text-slate-400">3D Fix (14 sat)</p>
                  </div>

                  <div className={`rounded p-1.5 transition-all ${
                    rev === "02"
                      ? "border border-cyan-500/40 bg-cyan-500/20"
                      : "border border-slate-800 bg-slate-950 text-slate-600 opacity-50"
                  }`}>
                    <span className={`inline-block size-2 rounded-full mb-1 ${
                      rev === "02" ? "bg-cyan-400 animate-pulse" : "bg-slate-600"
                    }`} />
                    <p className={`font-bold ${rev === "02" ? "text-cyan-300" : "text-slate-500"}`}>BLE 5.2</p>
                    <p className="text-[8px]">{rev === "02" ? "TPMS Mesh" : "Rev 01 N/C"}</p>
                  </div>
                </div>
              </div>

              {/* J1962 16-Pin Male Plug Visual Representation */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-300">
                    SAE J1962 / ISO 15031-3 OBD-II Plug Interface
                  </span>
                  <span className="text-[9px] text-slate-400">Hover pin for spec</span>
                </div>

                {/* 16 Pins in 2 Rows (1-8 and 9-16) */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {/* Row 1: Pins 1 to 8 */}
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                      const isConnected = pinoutData[p];
                      const isHovered = hoveredPin === p;
                      return (
                        <button
                          key={p}
                          onMouseEnter={() => setHoveredPin(p)}
                          onMouseLeave={() => setHoveredPin(null)}
                          className={`size-7 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center ${
                            isConnected
                              ? isHovered
                                ? "ring-2 ring-primary scale-110 " + isConnected.color
                                : isConnected.color
                              : "bg-slate-800/80 text-slate-500"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row 2: Pins 9 to 16 */}
                  <div className="flex justify-between gap-1">
                    {[9, 10, 11, 12, 13, 14, 15, 16].map((p) => {
                      const isConnected = pinoutData[p];
                      const isHovered = hoveredPin === p;
                      return (
                        <button
                          key={p}
                          onMouseEnter={() => setHoveredPin(p)}
                          onMouseLeave={() => setHoveredPin(null)}
                          className={`size-7 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center ${
                            isConnected
                              ? isHovered
                                ? "ring-2 ring-primary scale-110 " + isConnected.color
                                : isConnected.color
                              : "bg-slate-800/80 text-slate-500"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Pin Tooltip */}
                <div className="mt-2.5 rounded bg-slate-950 p-2 text-xs font-mono border border-slate-800 min-h-[44px]">
                  {hoveredPin && pinoutData[hoveredPin] ? (
                    <div>
                      <span className="text-primary font-bold">{pinoutData[hoveredPin].name}: </span>
                      <strong className="text-white">{pinoutData[hoveredPin].signal}</strong> —{" "}
                      <span className="text-slate-400">{pinoutData[hoveredPin].desc}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">
                      Hover over any colored pin to inspect vehicle electrical bus function.
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom IMEI & Barcode */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 font-mono text-[9px] text-slate-500">
                <span>IMEI: 869402058194012</span>
                <span>MAC: 5C:02:72:A1:B8:3F</span>
                <span>REV {rev}</span>
              </div>
            </div>
          </div>

          {/* Key Specifications & Deliverables Matrix (Right Col: 5 spans) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" />
                Automotive Engineering Baseline Specs
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Form Factor & Connector</span>
                  <strong className="font-mono text-foreground">SAE J1962 Type A Male</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Operating Voltage</span>
                  <strong className="font-mono text-foreground">9V – 36V (ISO 7637-2 Clamped)</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Sleep Mode Quiescent Current</span>
                  <strong className="font-mono text-emerald-500 font-bold">&lt; 1.8 mA @ 12V</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">CAN Protocol Support</span>
                  <strong className="text-foreground">ISO 15765-4 / SAE J1939 @ 500k</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Cellular Modem</span>
                  <strong className="text-foreground">Quectel EC200U-CN (4G Cat-1)</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">GNSS Positioning</span>
                  <strong className="text-foreground">GPS + GLONASS + BeiDou (Active Ceramic)</strong>
                </div>

                <div className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">BLE Sensor Gateway</span>
                  <strong className={`font-mono ${rev === "02" ? "text-cyan-500 font-bold" : "text-muted-foreground"}`}>
                    {rev === "02" ? "Nordic nRF52820 (BLE 5.2 Long Range)" : "None (Available in Rev 02)"}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Internal Battery Backup</span>
                  <strong className="text-foreground">450 mAh LiPo (2h Emergency E-Call)</strong>
                </div>
              </div>
            </div>

            {/* Controlled Documentation Cross-Reference */}
            <div className="rounded-lg border border-border bg-panel p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-steel" />
                Controlled Documents for this Baseline
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between rounded border border-border bg-card p-2">
                  <div>
                    <span className="font-mono font-bold text-primary block">
                      {isObd ? `HLPL-OBD4-EHW-PRS-${rev}` : `${projectId}-EHW-PRS-01`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Product Requirement Spec ({rev === "02" ? "Rev 02 BLE Sensor Gateway" : "Rev 01 Base"})
                    </span>
                  </div>
                  {onOpenDocument && (
                    <button
                      onClick={() => onOpenDocument(`${isObd ? "HLPL-OBD4" : projectId}-EHW-PRS-${rev}`)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between rounded border border-border bg-card p-2">
                  <div>
                    <span className="font-mono font-bold text-foreground block">
                      {isObd ? `HLPL-OBD4-EHW-SCH-${rev}` : `${projectId}-EHW-SCH-01`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Schematics ({rev === "02" ? "Rev 02 BLE Co-processor" : "Rev 01 Core MCU"})
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold">✓ Released</span>
                </div>

                <div className="flex items-center justify-between rounded border border-border bg-card p-2">
                  <div>
                    <span className="font-mono font-bold text-foreground block">
                      {isObd ? "HLPL-OBD4-SIT-MNT-01" : `${projectId}-SIT-MNT-01`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Vehicle Field Mounting & SIT PDI Protocol
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-500 font-semibold">Service SOP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MECHANICAL DIMENSIONS & CLEARANCE ENVELOPE */}
      {activeTab === "dimensions" && (
        <div className="rounded-lg border border-border bg-panel p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                Mechanical Enclosure Dimensions & Vehicle Mounting Envelope
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed 3D clearance envelope verified for Ashok Leyland Boss, Tata Ace, and commercial vehicle fuse boxes.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-foreground bg-card border border-border px-3 py-1 rounded">
              MECH Drawing: HLPL-OBD4-MECH-CAD-01
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Length / Width / Height Callouts */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Outer Dimensions</span>
              <p className="text-xl font-black text-foreground font-mono">52.4 × 48.2 × 26.0 mm</p>
              <p className="text-xs text-muted-foreground">
                Ultra-compact low profile allows driver footwell fuse box door to close completely without interference.
              </p>
              <div className="pt-2 text-[11px] space-y-1 text-muted-foreground border-t border-border">
                <p><strong>Length:</strong> 52.4 mm (including J1962 pins)</p>
                <p><strong>Width:</strong> 48.2 mm (connector head)</p>
                <p><strong>Height / Depth:</strong> 26.0 mm (chassis body)</p>
              </div>
            </div>

            {/* Mass & Materials */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Weight & Enclosure Material</span>
              <p className="text-xl font-black text-foreground font-mono">68.5 g ± 1.5g</p>
              <p className="text-xs text-muted-foreground">
                SABIC Cycoloy (PC/ABS blend) UL94-V0 flame-retardant automotive resin. High impact resistance.
              </p>
              <div className="pt-2 text-[11px] space-y-1 text-muted-foreground border-t border-border">
                <p><strong>Ingress Rating:</strong> IP54 Cabin / IP67 Mated</p>
                <p><strong>Drop Test:</strong> 1.5m onto concrete (MIL-STD-810H)</p>
                <p><strong>Vibration:</strong> SAE J1455 Under-Dash Profile</p>
              </div>
            </div>

            {/* Retention & Anti-Loosening Detents */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Retention Mechanism</span>
              <p className="text-xl font-black text-emerald-500 font-mono">28N Pull Retention</p>
              <p className="text-xs text-muted-foreground">
                Dual mechanical snap-latches prevent accidental dislodgement from vehicle vibration or driver foot contact.
              </p>
              <div className="pt-2 text-[11px] space-y-1 text-muted-foreground border-t border-border">
                <p><strong>Insertion Force:</strong> 35N max (smooth push)</p>
                <p><strong>Extraction Force:</strong> 28N min (anti-vibration)</p>
                <p><strong>Mating Cycles:</strong> 500+ insertion cycles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HARDWARE SYSTEM BLOCK DIAGRAM */}
      {activeTab === "blockDiagram" && (
        <div className="rounded-lg border border-border bg-panel p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="size-4 text-primary" />
                Integrated Electrical & Firmware Block Diagram
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete signal and power topology showing main MCU, cellular/GNSS engine, vehicle CAN transceiver, and {rev === "02" ? "modular BLE 5.2 co-processor" : "expansion header"}.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-foreground bg-card border border-border px-3 py-1 rounded">
              SCH Ref: {isObd ? `HLPL-OBD4-EHW-SCH-${rev}` : `${projectId}-EHW-SCH-01`}
            </span>
          </div>

          {/* Interactive Block Diagram Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Block 1: Power Stage */}
            <div className="rounded-lg border border-rose-500/30 bg-card p-4 space-y-2">
              <span className="font-mono text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1.5">
                <Zap className="size-3.5" />
                1. Power Management
              </span>
              <p className="text-xs font-bold text-foreground">TI LM5017 Buck + TVS</p>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• 9V–36V Input with ISO 7637-2 clamp</li>
                <li>• Dual 3.3V @ 1.5A & 5.0V @ 1.0A rails</li>
                <li>• 450 mAh LiPo Cell (BQ24075 charger)</li>
                <li>• Ultra-low sleep current: 1.8 mA</li>
              </ul>
            </div>

            {/* Block 2: Main Processing Core */}
            <div className="rounded-lg border border-primary/40 bg-card p-4 space-y-2">
              <span className="font-mono text-[10px] font-bold text-primary uppercase flex items-center gap-1.5">
                <Cpu className="size-3.5" />
                2. Processing & Memory
              </span>
              <p className="text-xs font-bold text-foreground">STM32F405VGT6 (168MHz)</p>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• ARM Cortex-M4 with FPU</li>
                <li>• 1 MB Flash / 192 KB SRAM</li>
                <li>• 32 MB SPI NOR Flash (offline log)</li>
                <li>• FreeRTOS v10.4 Kernel & Watchdog</li>
              </ul>
            </div>

            {/* Block 3: Cellular & GNSS Radio */}
            <div className="rounded-lg border border-blue-500/30 bg-card p-4 space-y-2">
              <span className="font-mono text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1.5">
                <Radio className="size-3.5" />
                3. Telematics Radio
              </span>
              <p className="text-xs font-bold text-foreground">Quectel EC200U-CN</p>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• 4G LTE Cat-1 (B1/B3/B5/B8/B34/B38+)</li>
                <li>• High-sensitivity GNSS (GPS+GLO)</li>
                <li>• Internal 3D active ceramic antenna</li>
                <li>• MQTT over TLS 1.3 telemetry link</li>
              </ul>
            </div>

            {/* Block 4: Modular BLE 5.2 / Expansion (Dynamic with Rev) */}
            <div className={`rounded-lg p-4 space-y-2 transition-all ${
              rev === "02"
                ? "border-2 border-cyan-500 bg-cyan-500/10 shadow-md"
                : "border border-border bg-card"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                  rev === "02" ? "text-cyan-400" : "text-muted-foreground"
                }`}>
                  <Bluetooth className="size-3.5" />
                  4. {rev === "02" ? "BLE 5.2 Sensor Hub (Active)" : "Expansion Header J4"}
                </span>
                {rev === "02" && (
                  <span className="text-[9px] bg-cyan-500 text-black font-bold px-1.5 py-0.2 rounded">
                    REV 02
                  </span>
                )}
              </div>

              <p className="text-xs font-bold text-foreground">
                {rev === "02" ? "Nordic nRF52820 SoC" : "Unpopulated 10-Pin Header"}
              </p>

              <ul className="text-[11px] text-muted-foreground space-y-1">
                {rev === "02" ? (
                  <>
                    <li className="text-foreground font-medium">• Bluetooth 5.2 Long Range & 2Mbps</li>
                    <li>• SPI/UART slave interface to main MCU</li>
                    <li>• Up to 32 Wireless TPMS tire sensors</li>
                    <li>• Smartphone BLE diagnostics pairing</li>
                  </>
                ) : (
                  <>
                    <li>• SPI, UART, 3.3V, GND provisioned</li>
                    <li>• Ready for Rev 02 modular snap-in</li>
                    <li>• Zero mainboard redesign required</li>
                    <li>• ECN-02 upgrade path</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE TEAM (SIT) FIELD MOUNTING & PDI */}
      {activeTab === "serviceMounting" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/20 pb-3">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wrench className="size-4 text-amber-500" />
                Service Team (SIT) Vehicle Mounting, Field Fitment & PDI Protocol
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official dealer & field service engineer mounting guide (HLPL-OBD4-SIT-MNT-01) for Ashok Leyland & Tata fleet vehicles.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded">
              Lead: Kai Morgan · Service & IT HOD
            </span>
          </div>

          {/* 4-Step Installation Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-500">STEP 1</span>
              <h5 className="text-xs font-bold text-foreground">Port Identification</h5>
              <p className="text-[11px] text-muted-foreground">
                Locate vehicle 16-pin OBD-II port (SAE J1962) situated under driver dash or behind fuse panel cover. Inspect socket for bent pins.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-500">STEP 2</span>
              <h5 className="text-xs font-bold text-foreground">Insertion & Retention</h5>
              <p className="text-[11px] text-muted-foreground">
                Align tracker and push firmly until the dual retention detents click. Fasten auxiliary zip-tie through chassis loop for heavy trucks.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-500">STEP 3</span>
              <h5 className="text-xs font-bold text-foreground">Ignition & LED Self-Test</h5>
              <p className="text-[11px] text-muted-foreground">
                Turn vehicle ignition ON. Verify PWR LED solid green, 4G blinking blue, GNSS solid amber. If Rev 02, verify BLE cyan pulse.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-500">STEP 4</span>
              <h5 className="text-xs font-bold text-foreground">SIT Cloud QR Binding</h5>
              <p className="text-[11px] text-muted-foreground">
                Scan device QR code via SIT Field Mobile App. App pairs IMEI with vehicle VIN and odometer reading in &lt; 30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
