# XYZ Pvt Ltd SCMS - Engineering Roadmap

> [!NOTE]
> This roadmap tracks milestones for the **XYZ Pvt Ltd SCMS Web Portal**. The complete, detailed specification is documented in the authoritative [SSM_ONE_WEB_PORTAL_MASTER_PLAN.md](SSM_ONE_WEB_PORTAL_MASTER_PLAN.md).

---

## 1. Core Framework & Multi-Department Architecture
- [x] Make the XYZ Pvt Ltd portal fully functional with browser-local records, master data, and verifiable create-to-detail workflows.
- [x] Replace generic record creation with domain-specific forms, linked record selectors, and Administration master-data CRUD.
- [x] Add department-scoped role management, granular permissions, admin context switching, all-department table controls, and delegated-action audit history.
- [x] Expand the portal to the **11 SCMS automotive departments** (`SAL`, `EHW`, `ESW`, `MECH`, `PUR`, `QA`, `EMF`, `TST`, `FIN`, `SIT`, `HR/OPS`).
- [x] Add compact operational Command Center layout with persistent Dark/Light theme toggle.
- [x] Add the **Admin Personas & Role Switcher** with 1-click switching between Executive Admin, 11 Department Leads, and Client Portal persona.

---

## 2. Automotive Quality & Document Engine
- [x] Automatic automotive document numbering adhering to formula: `HLPL-[PROJ_ID]-[DEPT]-[DOC_TYPE]-[REV]`.
- [x] Smart location, customer, and project metadata auto-fill.
- [x] Organization & Document Template Settings for customizable company headers, logos, and IATF 16949 / ISO 9001 footers.
- [x] Dynamic, project-specific multi-section engineering templates (SOR, Contract Review, PRS, BOM, Control Plan, DVP&R, DFMEA, TAC, PDI, Invoice).
- [x] Isolated A4 iframe print/PDF engine eliminating dark mode inversion, blank pages, and dialog clipping.
- [x] Interactive RACI Responsibility Matrix with automated inter-department stage notifications.
- [x] Operations Legal Documents & Corporate Letterhead Hub (§9) with bilateral mNDAs.
- [x] Signed-In Company Directory (§9) with department filtering and direct communication channels.
- [x] Official Project Decision Log (§10) with immutable locking and PMSS tie-in.

---

## 3. Commercial Intake & Modular Product Architecture (Master Plan §5)
- [x] Unified **Enquiries & Opportunities** flow with inline customer creation and Customer Register.xlsx.
- [x] Multi-Department Feasibility Input & Contract Review Gate (`HLPL/F/MKT/01`).
- [x] **Decoupled Architecture**: Decouple Project from PCB, Wiring Harness, Firmware, and Enclosure.
- [x] Modular Platform Asset Catalog for reusable PCBs, harnesses, firmware stacks, and enclosures.
- [x] Project Architecture & Modular Asset Linker with live development skip calculations.
- [x] **Automated Development Process Skip Engine**:
  - Reusing pre-qualified PCB saves 8–12 weeks.
  - Reusing certified Firmware saves 4–6 weeks.
  - **Stage 4 PoC Bench Bring-Up WAIVED** when pre-certified hardware & software are detected; direct jump to Stage 5 SMT Pilot Build authorized.
- [x] Dedicated 9-stage **AI4T Project Lifecycle Hub** (`HLPL-AI4T-01`) with 12-document master dossier binder and interactive simulation controls.

---

## 4. Delivery Phases Status
- [x] **Phase 1: Symmetrical Cloud Drive & File Manager**:
  - Interactive file manager implementing the 4-group structure (`01 Common documents`, `02 Internal projects`, `03 Client projects`, `04 Other department work`) across all 11 departments.
  - Drag-and-drop file upload dropzone with animated progress bar, SHA-256 verification checksum, download capabilities, and Private S3 / Lovable Cloud Storage readiness.
- [x] **Phase 2: Department Process Menus & Action Shortcuts**:
  - Direct 5-item process menus for all 11 departments (55 processes) linking routine tasks directly to Cloud Drive folders.
  - Instant pre-filling of canonical record types, document IDs, folder scope, and automotive references into `RecordForm`.
- [x] **Phase 3: Supabase Shared Persistence Migration**:
  - Authenticated PostgreSQL tables and Row-Level Security (RLS) policies paired with the verified offline prototype model in an enterprise dual-track persistence architecture.
  - Interactive Cloud & Supabase Sync panel with connection health diagnostics, real-time cluster pinging, telemetry counters, offline JSON snapshot export, and sync triggers.

---

## 5. Procurement-Led Live Inventory
- [x] Compare the browser-local inventory workspace with the read-only SSM one phase 8 reference.
- [x] Expand the local inventory register with the reference's searchable component fields, broader controlled categories, stock states, project links and research-team allocations.
- [x] Derive the assigned department directly from the selected research owner; do not ask the allocator to choose it separately.
