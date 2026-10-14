+----------------------------------------------------------------------------------------------------+
| HEXENSE LABS PRIVATE LIMITED                              Department: Purchasing & Embedded HW     |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / AEC-Q100 / RoHS   |
+----------------------------------------------------------------------------------------------------+
| Document Title : Production Bill of Materials (BOM) & Costed Assembly Sheet                        |
| Document ID    : HLPL-SLCT-EHW-BOM-01                     Issue Date  : 18-Jun-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Revision    : 01 (Production Frozen)     |
| Client Target  : Tata Motors EV & Fleet Division          Target BOM  : $38.50                     |
| Actual BOM Cost: $35.42                                   Track Type  : Mass Production Track      |
+----------------------------------------------------------------------------------------------------+

## 1. Executive Cost Summary
- **Total Component Count (PCBA)**: 168 line items
- **AEC-Q Qualified Parts (Category A)**: 96.4%
- **Standard Parts with R&D Waiver (Category B)**: 3.6% (connectors, plastic housing)
- **Approved Supplier Network (ASL)**: 100% components sourced via audited Tier-1 distributors (Arrow, Avnet, Molex, Quectel Direct).

---

## 2. Key Component Schedule & Sourcing Matrix

| Item # | Part Classification | Manufacturer Part Number (MPN) | Manufacturer | Footprint / Package | AEC-Q Status | Cat | Unit Cost (USD) | ASL Vendor |
|:---:|---|---|---|---|:---:|:---:|:---:|---|
| **01** | Microcontroller Unit (MCU) | `STM32G0B1VET6` | STMicroelectronics | LQFP-100 (14x14) | **AEC-Q100 Gr 1** | A | \$3.45 | Avnet Silica |
| **02** | 4G LTE-M / 2G Cellular Engine | `EC200U-CN-TE-A` | Quectel Wireless | LCC-144 (17.7x15.8) | **AEC-Q100 Gr 2** | A | \$9.80 | Quectel Direct |
| **03** | Multi-GNSS Positioning Receiver | `MAX-M10S-00B` | u-blox AG | LGA-18 (9.7x10.1) | **AEC-Q100 Gr 1** | A | \$6.20 | Arrow Electronics |
| **04** | Dual CAN FD Transceiver | `TJA1051T/3/1J` | NXP Semiconductors | SOIC-8 | **AEC-Q100 Gr 0** | A | \$0.95 | Arrow Electronics |
| **05** | Automotive Buck PMIC | `AXP2101-AQ` | X-Powers | QFN-40 (5x5) | **AEC-Q100 Gr 1** | A | \$1.35 | WPG Holdings |
| **06** | 6-Axis Inertial Sensor (IMU) | `ASM330LHHXTR` | STMicroelectronics | LGA-14 (2.5x3.0) | **AEC-Q100 Gr 1** | A | \$2.10 | ST Direct |
| **07** | High-Voltage Load Dump TVS | `SM8S36CA-E3/2D` | Vishay Semiconductors | DO-218AB | **AEC-Q101** | A | \$1.85 | Mouser Global |
| **08** | High-Side Power Switch (x2) | `VN7016AJTR` | STMicroelectronics | PowerSSO-16 | **AEC-Q100 Gr 1** | A | \$1.10 | Arrow Electronics |
| **09** | Backup Battery Pack | `HLPL-LP-1000-01` | EVE Energy | 3.7V 1000mAh PCM | **UN 38.3 / IEC** | A | \$2.40 | EVE Direct |
| **10** | Automotive Sealed Connector | `Molex 34791-0140` | Molex LLC | Mini50 14-Pin Sealed| **USCAR-2** | B | \$1.42 | Molex India |
| **11** | Enclosure (ABS/PC Top & Bottom)| `HLPL-MCH-ENC-01` | Hexense Labs Tooling | Injection Molded PBT| **UL94-V0** | B | \$1.80 | In-House Tooling |
| **12** | Bare PCB Fabrication (4-Layer) | `HLPL-SLCT-PCB-01` | AT&S / Genus PCB | FR4 TG170 ENIG | **IPC Class 3** | A | \$1.65 | Genus Electrotech |
| **13** | Passives (Caps, Resistors, Ind) | Various SMD (0402/0603)| Murata / Yageo / TDK | SMD Passives | **AEC-Q200** | A | \$1.35 | Avnet / Arrow |
| **--** | **TOTAL UNIT BOM COST** | | | | | | **\$35.42** | Target: \$38.50 (Pass) |

---

## 3. ASL / ACML Supplier Allocation & Risk Analysis
- **Primary Source Compliance**: 100% components verified against the Approved Component Master List (ACML).
- **Dual-Source Redundancy**: 88% of line items (including all passives, TVS, CAN transceivers, and MCU alternates) possess validated secondary manufacturers in the Approved Supplier List (`HLPL-PUR-ASL-01`).
- **Scrap Liability**: Mass production forecast locked for 6 months rolling inventory per supplier SLA agreements (`F-PUR-16`).

---

## 4. Engineering & SCM Sign-Off
- **Compiled By**: Rajiv Verma (Hardware Engineer) · 18-Jun-2026
- **Sourcing Verification**: Morgan Reed (Purchasing Head) · 19-Jun-2026
- **Quality Approval**: Jordan Blake (Quality Head) · 20-Jun-2026
