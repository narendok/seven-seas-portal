+----------------------------------------------------------------------------------------------------+
| HEXENSE LABS PRIVATE LIMITED                              Department: Manufacturing & SMT (EMF)    |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / IPC-A-610 Class 3 |
+----------------------------------------------------------------------------------------------------+
| Document Title : Manufacturing Quality Control Plan (CP)                                           |
| Document ID    : HLPL-SLCT-EMF-CP-01                      Issue Date  : 05-Aug-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Revision    : 01 (Mass Production Ready) |
| Line Allocation: SMT Line 2 (Noida Facility)              Status      : Active Control Document    |
+----------------------------------------------------------------------------------------------------+

## 1. Process Flow & Quality Control Points

| Step # | Process Operation | Machine / Tooling | Characteristics / Parameter Checked | Specification & Tolerance | Inspection Method | Frequency | Reaction Plan |
|:---:|---|---|---|---|---|---|---|
| **10** | Raw PCB Baking | Blue M Despatch Oven | Moisture content | 120°C ± 5°C for 4 hours | Thermocouple log | Every batch | Re-bake if time < 4h |
| **20** | Solder Paste Printing | DEK Horizon 03iX | Paste volume, height, alignment, bridging | Height: 120µm ± 15µm, Volume: 80%–120% | Koh Young 3D SPI (inline) | 100% boards | Auto-stop printer, clean stencil |
| **30** | SMT Pick & Place | Fuji NXT III Modules | Part presence, polarity, alignment | IPC-A-610 Class 3 placement accuracy (±25µm) | Vision centering & fiducial check | 100% components | Reject misaligned component |
| **40** | Reflow Soldering | Heller 1913 MK5 (10-Zone) | Thermal profile peak temp & time above liquidus (TAL) | Peak: 242°C ± 3°C, TAL (SAC305): 60s–75s | KIC profiler logger | Every shift (2x/day) | Hold batch, verify thermal profile |
| **50** | Automated Optical Inspection | Koh Young Zenith 3D AOI | Solder fillet, tombstoning, solder balls, bridging | Zero bridging, full pin wetting per IPC-A-610 | 3D AOI automated scan | 100% boards | Route fail boards to rework station |
| **60** | Conformal Coating | PVA Delta 8 Automated Coater | Coating thickness on moisture-sensitive ICs | Acrylic coating thickness: 50µm – 75µm | UV blacklight inspection | 100% boards | Touch-up under magnifying lamp |
| **70** | Ultrasonic Enclosure Sealing | Herrmann 20kHz Welder | Weld collapse depth, ultrasonic energy | Depth: 0.85mm ± 0.05mm, Energy: 450 Joules | LVDT sensor readout | 100% units | Scrap if depth outside tolerance |
| **80** | Automated EOL Functional Jig | Custom HLPL Jig (JIG-SLCT-01) | Pre-code flash, voltage rails, CAN loopback, GNSS lock, 4G ping | All parametric checks = PASS, FPY >= 95% | Automated DAQ jig & server logging | 100% serialized units | Lock device, flag rework ticket |
| **90** | Serialized QR Code Labeling | Zebra ZT411 Industrial | QR code readability & MAC/IMEI matching | GS1 compliant serialized QR code | Honeywell barcode scanner | 100% units | Re-print label if readability < Grade A |

---

## 2. Statistical Process Control (SPC) & First-Pass Yield (FPY)
- **Target First-Pass Yield**: >= 96.5% on SMT Line 2.
- **Current Running FPY**: **97.4%** across 2,500 pilot units.
- **Process Capability Index**: $C_{pk} \ge 1.67$ maintained across solder paste height and reflow peak temperatures.

---

## 3. Control Plan Approval & Governance
- **Manufacturing Process Engineer**: Casey Rowan (Production Lead) · 05-Aug-2026
- **Quality Assurance Manager**: Jordan Blake (Quality Head) · 06-Aug-2026
- **Plant Operations Director**: Vikram Deshmukh (VP Operations) · 07-Aug-2026
