# XYZ Pvt Ltd SCMS — Ready-to-Run Lovable Prompts
## Targeted for Project: "SSM New" (`a3399684-daab-4b38-8666-187b96b451af`)

Use these structured prompts in Lovable to expand the existing project into the complete **11-Department Smart Company Management System**.

---

### Step 1: Update Lovable Project Knowledge
1. Navigate to **Project Settings** (gear icon) -> **Knowledge** in Lovable.
2. Open [LOVABLE_KNOWLEDGE.md](file:///c:/Users/Test/Documents/antigravity/SSM-new/LOVABLE_KNOWLEDGE.md) and copy the entire text.
3. Paste it into the Knowledge box and save.

---

### Step 2: Database Schema Migration Prompt
Paste the following prompt in **Lovable Chat**:

```text
Please apply the complete SCMS database schema for XYZ Pvt Ltd to our Lovable Cloud Postgres database.

Key requirements:
1. Create/extend the following core tables with proper relationships and foreign keys:
   - `projects`: id (uuid), project_code (e.g., 'BCU', 'SLCT', 'XLINK', 'EFAN', 'PST'), project_name, client_name, target_vehicle, current_stage (1 to 9), status ('Draft', 'Active', 'Under Amendment', 'Production', 'Archived'), created_at.
   - `pmss_specs`: id, project_id (fk), system_voltage ('12V' | '24V' | '48V'), operating_temp_min (default -40), operating_temp_max (default 85), ip_rating ('IP67' | 'IP68'), aec_q_grade, ais140_compliant (boolean), iso7637_compliant (boolean), rohs_compliant (boolean), target_bom_cost (numeric), cycle_time_seconds (integer), revision (integer, default 0), is_locked (boolean), updated_at.
   - `controlled_documents`: id, project_id (fk), document_id (generated as 'HLPL-[PROJ_ID]-[DEPT]-[DOC_TYPE]-[REV]'), department_code ('SAL' | 'EHW' | 'ESW' | 'SW' | 'MECH' | 'PUR' | 'QA' | 'EMF' | 'FIN' | 'SIT' | 'HR' | 'OPS'), doc_type ('PRS' | 'BLK' | 'SCH' | 'PCB' | 'GER' | 'BOM' | 'DFMEA' | 'PFMEA' | 'PFD' | 'CP' | 'DVP' | 'ECN' | 'QUO' | 'PPAP'), revision (text), title, file_url, file_size, storage_path, classification ('Internal' | 'OEM Confidential'), status ('Draft' | 'Pending Review' | 'Approved' | 'Obsolete'), approver_id, approved_at.
   - `lifecycle_stages`: id, project_id (fk), stage_number (1 to 9), stage_name, status ('Pending' | 'In Progress' | 'Under Review' | 'Passed' | 'Blocked'), sla_days (integer), target_completion_date (date), actual_completion_date (date), gate_signoff_user, gate_signoff_at, notes.
   - `hardware_stages`: id, project_id (fk), stage_code ('HW_01' to 'HW_37'), stage_title, status ('Not Started' | 'In Progress' | 'Pass' | 'Fail'), risk_flag ('Green' | 'Yellow' | 'Red'), dfm_cleared (boolean), engineer_notes.
   - `bom_items`: id, project_id (fk), part_number, component_name, manufacturer, footprint, aec_q_qualified (boolean), asl_vendor_id (text), category ('A' | 'B'), target_unit_cost (numeric), actual_unit_cost (numeric), track_type ('Prototype' | 'Production').
   - `eol_test_runs`: id, project_id (fk), serial_number (unique), jig_id, mcu_flash_status (boolean), voltage_check_status (boolean), can_loopback_status (boolean), overall_result ('PASS' | 'FAIL'), failure_reason, qr_label_data, tested_at.
   - `hr_skill_matrix`: id, employee_name, department_code, skills (jsonb: array of { skill_name, rating_1_to_4 }), average_score (numeric), competency_level ('Level 1' | 'Level 2' | 'Level 3' | 'Level 4'), training_needed (boolean).
   - `system_alerts`: id, alert_code (e.g., 'ALERT_SAL_01', 'ALERT_HW_03', 'ALERT_TST_01'), department_code, project_id (fk, nullable), severity ('INFO' | 'WARNING' | 'CRITICAL'), message, is_resolved (boolean), triggered_at.
   - `change_orders`: id, eco_number, project_id (fk), loop_type ('Loop 1: Scope' | 'Loop 2: Mech Clash' | 'Loop 3: Test Fail' | 'Loop 4: Post-Release'), description, status ('Draft' | 'Under Review' | 'Approved' | 'Rejected'), initiated_by, approved_by, created_at.

2. Enable Row Level Security (RLS) on all tables with authenticated and public read policies for the initial development phase.
3. Seed realistic default projects:
   - `HLPL-BCU-02` (Body Control Unit, Stage 5 Pilot Build, 24V, IP67)
   - `HLPL-SLCT-01` (Telematics Gateway, Stage 8 Type Approval AIS-140, 12V, IP67)
   - `HLPL-XLINK-03` (Commercial Gateway, Stage 4 PoC, 24V)
   - `HLPL-EFAN-01` (eFan Speed Controller, Stage 2 Feasibility, 48V, IP68)
   - `HLPL-PST-01` (Power Shuttle Transmission, Stage 9 Mass Production, 24V)
```

---

### Step 3: Expand Navigation & Department Hubs (Prompt for Build Mode)
Paste the following prompt in **Lovable Chat**:

```text
Expand our existing Command Center and Department Navigation to fully support all 11 functional departments defined in our Knowledge Base:

1. Top Navigation Bar:
   - Project Switcher (Dropdown for HLPL-BCU-02, HLPL-SLCT-01, HLPL-XLINK-03, HLPL-EFAN-01, HLPL-PST-01, + New Project button).
   - PMSS Status Badge (displays Current Stage 1-9, System Voltage, and "Under Amendment" warning banner when locked).
   - Alerts Notification Drawer (showing active counts of CRITICAL and WARNING alerts with direct links).
   - Department Switcher Tabs:
     * Overview / Command Center
     * 1. Sales & BD (SAL)
     * 2. Embedded Hardware (EHW)
     * 3. Firmware & Software (ESW/SW)
     * 4. Mechanical Eng (MECH)
     * 5. Purchasing & SCM (PUR)
     * 6. Quality Assurance (QA)
     * 7. Manufacturing (EMF)
     * 8. EOL Testing (TST)
     * 9. Accounts & Finance (FIN)
     * 10. Service & IT (SIT)
     * 11. HR & Operations (HR/OPS)
     * Document Vault (`00_Automotive_Hardware_Audit_Repository`)
     * OEM Client Portal View

2. Design & Styling:
   - Sleek modern automotive engineering theme (dark slate `#0f172a`, card backgrounds `#1e293b`, borders `#334155`).
   - Accent colors: Emerald `#10b981` (Passing/Approved), Amber `#f59e0b` (In Progress/Warning), Crimson `#ef4444` (Critical Alert/Gate Block), Cyan `#06b6d4` (Active selections).
   - Use Lucide icons for all department badges, status indicators, and actions.
```

---

### Step 4: Nine-Stage Lifecycle Stepper & PMSS Engine
Paste the following prompt in **Lovable Chat**:

```text
Build the interactive 9-Stage Automated Project Lifecycle Stepper and Single Source of Truth (PMSS) Engine:

1. Interactive 9-Stage Stepper:
   - Display Stages 1 to 9 across the top of the Project detail page:
     1. Sales Intake & NDA
     2. Feasibility & Contract Review (HLPL/F/MKT/01)
     3. Requirement Freeze & Commercial PO
     4. Proof of Concept (HW_12 MCU Bring-up)
     5. Pilot Build & Tentative Deliverables
     6. Client Validation & Pre-Compliance (DVP&R)
     7. Final Gerber & BOM Release
     8. Type Approval (AIS-140) & Supplier PPAP
     9. Mass Production & EOL Jigs
   - Clicking a stage highlights its required deliverables, gate criteria, SLA target days, and current sign-off status.
   - Include a "Sign-off & Advance Gate" action with a modal checking mandatory document presence. If documents or criteria are missing, display the blocking alert (e.g., ALERT_QA_01).

2. Project Master Spec Sheet (PMSS) Drawer / Modal:
   - Displays all single-source-of-truth parameters: System Voltage, Operating Temp (-40°C to +85°C), IP Rating, Compliance Badges (AIS-140, AEC-Q100, ISO 7637-2, RoHS).
   - Include a "Trigger Scope Change (Loop 1)" button: Clicking it sets the project to "Under Amendment", adds an amber warning badge across all headers, and locks gate progression until Sales re-issues the quotation and customer re-signs.
```

---

### Step 5: Departmental Special Features (EOL Test Simulator, Dual-Track SCM, HR Matrix)
Paste the following prompt in **Lovable Chat**:

```text
Add the following high-value interactive features to our specialized department tabs:

1. EOL Testing Jig Simulator (TST tab):
   - Interactive diagnostic console simulating an Automated Automotive EOL Test Jig.
   - "Run Automated EOL Jig Test" button:
     * Step 1: Pre-Code Flash -> Step 2: Voltage Regulator Test (5V/3.3V) -> Step 3: CAN/J1939 Bus Loopback -> Step 4: Production Firmware Flash.
     * Real-time progress bar and log stream.
     * On PASS: Auto-generates a serialized QR Code label (e.g. `SN-BCU-2026-00482`) with print/download button.
     * On FAIL: Flashes crimson alert, increments rework counter, and logs error telemetry.
     * Displays First-Pass Yield (FPY %) gauge with target >= 95%.

2. Dual-Track Purchasing & SCM Hub (PUR tab):
   - Toggle between "Prototype / Pilot Track" (speed, 3D soft tooling, sample orders) and "Mass Production Track" (PPAP Level 3, AEC-Q validation, ASL qualification).
   - Active BOM Cost & Compliance Tracker showing Category A (AEC-Q) vs Category B parts.
   - Non-ASL vendor warning banner (`ALERT_PUR_01`) if a part lacks ASL qualification.

3. HR Skill Matrix & Competency Evaluator (HR/OPS tab):
   - Standardized evaluation form (`HLPL/F/HR/03`) scoring 8 domain skills on a 1-4 scale.
   - Displays radar chart or score cards classifying employees into Level 1 (<25%) to Level 4 (76-100%).
   - Auto-triggers Training Need Identification (TNI) when score is below departmental threshold.
```
