# Hexense Labs — Smart Company Management System (SCMS)
## Enterprise Automotive Knowledge Base for Lovable

### 1. Enterprise Profile & Domain Context
- **Company**: Hexense Labs Private Limited (HLPL) / Six Sense Mobility.
- **Industry**: High-precision automotive electronics and commercial mobility solutions.
- **Core Product Families**:
  1. `BCU`: Body Control Units (e.g., HLPL-BCU-02, HLPL-BCU-03)
  2. `SLCT`: Telematics & Tracking Modules (AIS-140 compliant)
  3. `XLINK`: Commercial Vehicle Gateways
  4. `EFAN`: High-Power eFan Speed Controllers
  5. `PST`: Power Shuttle Transmissions
- **Governing Automotive Standards**:
  - Quality Management: **IATF 16949:2016** and **ISO 9001:2015**
  - Environmental Management: **ISO 14001:2015**
  - Occupational Health & Safety: **ISO 45001:2018**
  - Information Security: **ISO/IEC 27001:2022** (ISMS)
  - Automotive Telematics / Regulatory: **AIS-140 / TAC**
  - Electronic Component Reliability: **AEC-Q100** (Integrated Circuits), **AEC-Q200** (Passive Components)
  - Transient Electrical Immunity: **ISO 7637-2**
  - Environmental Compliance: **RoHS & REACH**

---

### 2. Eleven Functional Departments
The system digital backbone integrates 11 functional departments:
1. `SAL` (Sales & Business Development): Inbound leads (`HLPL-F-SAL-01`), SOR intake, automated Mutual NDA (`HLPL-SAL-mNDA-01`), commercial quotes (`HLPL-SAL-QUO-01`), contract reviews (`HLPL/F/MKT/01`).
2. `EHW` (Embedded Hardware Engineering): Hardware Stages HW_01 to HW_37, Product Requirement Spec (`HLPL-[PROJ]-EHW-PRS`), Block Diagrams, Schematics, BOM, PCB Layouts, Gerber releases, DFMEA.
3. `ESW` / `SW` (Embedded Firmware, Software & Cloud): Peripheral drivers, protocol stacks (CAN, J1939, MQTT), Gated SDLC (G0 to G11), HSI spec (`HLPL-[PROJ]-ESW-HSI`).
4. `MECH` (Mechanical Engineering): 3D STEP enclosure modeling, thermal simulation, 2D drawings (`HLPL-[PROJ]-MECH-DRW`), injection mold tooling specs.
5. `PUR` (Purchasing & Supply Chain): Dual-track procurement engine (Rapid Prototype vs Mass Production), ASL/ACML catalog, supplier audits (`F-PUR-10/11/13/14/16`), PPAP Level 3 (`F-PUR-15`).
6. `QA` (Quality Assurance & Compliance): APQP master gates (`HLPL-APQP-001`), DVP&R test execution, IQC/IPQC/FQC, 8D CAPA, Non-Conformance Reports (NCR).
7. `EMF` (Electronics & Mechanical Manufacturing): Process Flow Diagram (`HLPL-[PROJ]-PFD-01`), PFMEA (`SS-[PROJ]-02`), Control Plan (`HLPL-[PROJ]-CP-01`), Pre-line startup checklist (`HLPL-EMF-CHK-01`).
8. `TST` (Production & EOL Testing): Automated End-of-Line testing jigs (MCU pre-flash, parametric voltage, relay/switch, CAN loopback, production flash, serialized QR printing, First-Pass Yield monitoring).
9. `FIN` (Accounts & Finance): Commercial billing, PO & GRN validation, automated receivables aging alerts (>45 days), statutory tax closing.
10. `SIT` (Service & IT Infrastructure): Server telemetry, automated offsite database backups, IT support ticketing, ISMS compliance.
11. `HR` / `OPS` (Human Resources & Operations): Annual Skill Matrix (`HLPL/F/HR/03`, 8 skills scored 1-4, Levels 1-4), Training Need Identification (TNI), statutory compliance calendar (90-day license alerts), Six Sigma DMAIC governance.

---

### 3. Automated Document Numbering Formula
All documents generated across the enterprise strictly follow the standardized formula:
$$\text{Document ID} = \mathbf{HLPL-[\text{PROJ\_ID}]-[\text{DEPT}]-[\text{DOC\_TYPE}]-[\text{REV}]}$$
- **Prefix**: `HLPL` (Hexense Labs Private Limited)
- **Project ID**: `BCU`, `SLCT`, `XLINK`, `EFAN`, `PST`
- **Department**: `SAL`, `EHW`, `ESW`, `SW`, `MECH`, `PUR`, `QA`, `EMF`, `FIN`, `SIT`, `HR`, `OPS`
- **Doc Type**: `SOR`, `PRS`, `BLK`, `SCH`, `PCB`, `GER`, `BOM`, `DFMEA`, `PFMEA`, `PFD`, `CP`, `DVP`, `ECN`, `QUO`, `PPAP`
- **Revision**: `00`, `01`, `02`, etc.

Every document displays a standard **Document Control Header**:
- Document Title, Document ID, Project Code, Revision, Issue Date, Classification, Approval Status, and Revision History Log.

---

### 4. Single Source of Truth: Project Master Spec Sheet (PMSS)
Every newly created project initializes a unified `PMSS` record (`HLPL-[PROJ]-PMSS-00`) containing:
- **Operating Parameters**: System Nominal Voltage (12V/24V), Operating Temperature Range (-40°C to +85°C), Enclosure IP Rating (IP67/IP68), I/O Channel Mapping.
- **Compliance Flags**: AIS-140, AEC-Q100/Q200 Grade Selection, ISO 7637-2 Pulse Immunity, RoHS/REACH.
- **Target Metrics**: Target Unit BOM Cost, Manufacturing Cycle Time, Target Delivery Dates.
- **Dynamic Lock**: Any unapproved change or customer scope amendment locks the PMSS into "Under Amendment" status, halting subsequent phase gate transitions.

---

### 5. Nine Lifecycle Stages
1. **Stage 1 (Sales Intake & Client Portal Form)**: CRM Enquiry ID, SOR submission, automated mNDA.
2. **Stage 2 (Cross-Dept Feasibility Analysis)**: Contract Review Record (`HLPL/F/MKT/01`) with multi-department sign-offs.
3. **Stage 3 (Requirement Freeze & Commercial Confirmation)**: Frozen `PRS-00`, formal Quotation, customer PO/LOI verification.
4. **Stage 4 (PoC by HW, FW & SW & Live Client Portal Sync)**: Block diagram (`EHW-BLK-01`), PoC firmware code (`ESW-POC-01`), MCU bring-up (`HW_12`).
5. **Stage 5 (Pilot Build & Tentative Deliverables)**: Tentative BOM (`EHW-BOM-00`), Schematics (`EHW-SCH-01`), 3D STEP soft tooling, prototype SMT run.
6. **Stage 6 (Client Validation & Pre-Compliance Testing)**: EMC/ESD pre-compliance, DVP&R testing, prototype sample dispatch, customer field testing.
7. **Stage 7 (Final Hardware & Mechanical Design Release)**: Final Gerber (`EHW-GER-01`), Production BOM (`EHW-BOM-01`), HSI spec (`ESW-HSI-01`), 2D/3D tooling release, R&D Head sign-off.
8. **Stage 8 (Type Approval & Supply Chain Planning)**: Supplier capacity (`F-PUR-16`), PPAP dossiers Level 3 (`F-PUR-15`), Approved Supplier List (`ASL`), AIS-140 TAC certification.
9. **Stage 9 (Mass Production, EOL Testing & Logistics)**: Work orders, SMT line execution, automated EOL test jig, serialized QR code label printing, PDI Certificate, Tax Invoices.

---

### 6. Four Closed Bi-Directional Change Control Loops
- **Loop 1 (Customer Scope Change)**: OEM submits modification -> PMSS marked "Under Amendment" -> R&D re-evaluates cost/schedule -> revised quotation issued -> customer re-signs -> PMSS revision increments.
- **Loop 2 (Mechanical / Component Clash)**: 3D STEP clearance check flags interference -> Mechanical ECO ticket raised -> Hardware repositions component or selects lower profile package -> Layout re-verified.
- **Loop 3 (Test Verification Failure)**: Pre-compliance or DVP failure logs critical bug -> locks stage gate -> triggers schematic rollback (`HW_15 / HW_32A`) and ECN issuance.
- **Loop 4 (Post-Release ECO/ECN)**: Component EOL or cost reduction -> DFMEA RPN reassessed -> supplier scrap liability calculated -> PFMEA & Control Plan updated -> ERP active BOM updated.

---

### 7. Maintenance (TPM) & HR Competency Framework
- **TPM**: Preventative maintenance schedules, MTBF/MTTR tracking per SMT equipment, IMTE Calibration Register with 30-day expiry notifications, Gage R&R studies, backup power & DG load testing logs.
- **HR Skill Matrix (`HLPL/F/HR/03`)**: 8 domain competencies evaluated on 1–4 scale (1: Learner, 2: Supervised, 3: Independent, 4: Expert/Trainer). Employee level classified into Levels 1–4 (<25%, 26–50%, 51–75%, 76–100%). Score < required level triggers automatic Training Need Identification (TNI).
