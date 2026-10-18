+----------------------------------------------------------------------------------------------------+
| XYZ Pvt Ltd                              Department: Cross-Functional R&D         |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 Cl 8.2.3 / ISO 9001 |
+----------------------------------------------------------------------------------------------------+
| Document Title : Contract Review & Cross-Functional Feasibility Record                             |
| Document ID    : HLPL/F/MKT/01                            Issue Date  : 24-May-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Revision    : 01                         |
| Client Target  : Tata Motors EV & Fleet Division          RFQ Ref No  : RFQ-2026-TATA-EV-042       |
| Classification : Internal & OEM Confidential              Status      : Cleared & Feasible         |
+----------------------------------------------------------------------------------------------------+

## 1. Customer Requirement Baseline (SOR Summary)
- **Vehicle Target**: Tata Ace EV / Intra V50 (12V/24V dual architecture with regeneration pulses up to 100V).
- **Core Interfaces**: 2x CAN 2.0B / J1939 buses, 4x Digital Inputs (Ignition, SOS button, Door Sensor, AC on), 2x Analog Inputs (0–36V Fuel / Temperature sensor), 2x High-Side Protected Outputs (Engine immobilizer relay).
- **Environmental**: -40°C to +85°C operating, IP67 enclosure, ISO 7637-2 Pulse 1, 2a, 3a/b, 5b immunity.
- **Regulatory**: AIS-140 Amendment 2 (Emergency SOS button with alert packet, embedded eSIM, NavIC + GPS dual positioning, 10Hz sampling).

---

## 2. Cross-Functional Feasibility Sign-Off Matrix

| Discipline / Dept | Feasibility Parameter Evaluated | Assessment | Risk Level | Lead Engineer | Status |
|---|---|---|:---:|---|:---:|
| **Hardware Engineering (EHW)** | Pin count, TVS clamping voltage, AEC-Q100 Grade 1 controller, dual CAN transceivers | **FEASIBLE**: STM32G0B1VET6 meets pin budget; high-voltage TVS array absorbs ISO 7637-2 Pulse 5b dump. | **GREEN** | Avery Vale (HW Lead) | **CLEARED** |
| **Firmware & Software (ESW)** | AIS-140 packet protocol, TLS 1.3 encryption, FOTA memory partitioning, CAN J1939 decoder | **FEASIBLE**: 512KB Flash sufficient with dual-bank A/B bootloader; Quectel LTE-M/2G stack verified. | **GREEN** | Devon Lane (FW Lead) | **CLEARED** |
| **Mechanical Engineering (MECH)** | IP67 ultrasonic seal, connector clearance, harness strain relief, vibration damping | **FEASIBLE**: PBT/PC blend enclosure with molded liquid silicone gasket passes IP67 immersion test. | **GREEN** | Samira Holt (Mech Lead)| **CLEARED** |
| **Purchasing & SCM (PUR)** | Long-lead ICs (Microcontroller, Cellular modem, GNSS module), target unit cost <$38.50 | **FEASIBLE**: Quectel and ST components allocated on 14-week SLA; Tier 4 BOM cost calculated at $35.40. | **GREEN** | Morgan Reed (SCM Lead)| **CLEARED** |
| **Quality Assurance (QA)** | APQP Phase milestones, ARAI TAC timeline, DVP&R thermal shock & vibration profiles | **FEASIBLE**: Internal DVP bench available; ARAI slot booked for Q3 testing. Zero open non-conformances. | **GREEN** | Jordan Blake (QA Lead) | **CLEARED** |
| **Manufacturing & SMT (EMF)** | SMT Line 2 tact time, paste printing SPI tolerances, conformal coating dry cycle | **FEASIBLE**: 68 seconds cycle time on Fuji line; selective conformal coating station active. | **GREEN** | Casey Rowan (MFG Lead)| **CLEARED** |

---

## 3. Risk Mitigation & Waiver Log
- **Identified Risk**: Supply chain lead time spike for Quectel EC200U-CN 4G module during Q4 volume ramp.
  - **Mitigation Action**: Second-source qualification initiated with Fibocom MA510; footprint-compatible hybrid landing pad incorporated into HW layout.
  - **Risk Waiver Reference**: `HLPL-EHW-RSK-2026-004` (Approved by R&D Head).

---

## 4. Final Executive Recommendation & Approval
All 6 technical departments confirm engineering and manufacturing feasibility without unresolved exceptions. The contract is cleared for formal PRS freeze and customer PO acceptance.

- **R&D Lead Sign-off**: Avery Vale · 24-May-2026
- **Quality Assurance Head**: Jordan Blake · 25-May-2026
- **Operations & Manufacturing VP**: Vikram Deshmukh · 26-May-2026
