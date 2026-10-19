# Department Project Workspace Browser Verification Checkpoint

Date: 19 October 2026 (Asia/Kolkata)  
Environment: `https://ssm-new.lovable.app`  
Implementation commit: `8fabb5f4d0f1f0757d22887b6dd8b4252db731c6` (One department project workspace)  
Verification method: Automated headless Google Chrome (v155) with Chrome DevTools Protocol (CDP) and live visual inspection  
Status: **Passed** (Priority 0 gate closed; web prototype evidence recorded)

---

## 1. Scope & Execution Boundary

This document records the browser verification of the consolidated Department Project Workspace introduced in commit `8fabb5f`. Per the [Antigravity handoff plan](../ANTIGRAVITY_PORTAL_COMPLETION_HANDOFF_2026-10-19.md), this is a local/preview verification of UI scoping and state synchronization in the prototype. It does not constitute cloud server authorization or production data persistence acceptance.

---

## 2. Hardware Lead (`EHW`, Avery Vale) Walkthrough

### 2.1 All Projects Overview (`projectScope = "all"`)
- **Navigation**: Accessed via `https://ssm-new.lovable.app/?role=ehw`.
- **Header & Scope**: Displayed `Embedded Hardware — Project Workspace` with active persona `EHW Lead (Avery Vale)`.
- **Selector Consolidation**: Exactly **1** visible project dropdown selector (`select[aria-label="Workspace project"]`). Redundant project dropdown and project/team tabs in the embedded coordination center were cleanly hidden (`hideProjectSelector={true}`, `recordsAreScoped={true}`).
- **Department Totals**:
  - Department Progress: `89%` (8 of 9 records complete)
  - Tasks in Scope: `1`
  - Authorized Linked Documents: `6`
  - Pending Approvals: `1`
  - Department Records: `8`
  - Department Team: `4` members (Avery Vale, Marcus Vance, Elena Rostova, Vikram Patel)
- **Project Cards**: 5 linked department projects listed (`HLPL-SLCT-01`, `HLPL-BCU-02`, `HLPL-XLINK-03`, `HLPL-EFAN-01`, `HLPL-PST-01`).
- **Evidence Screenshot**: [`ehw_workspace_all_projects_2026-10-19.png`](ehw_workspace_all_projects_2026-10-19.png)

### 2.2 Dynamic Switch to `HLPL-SLCT-01`
- **Action**: Changed project dropdown to `HLPL-SLCT-01`.
- **Selected Project Overview**: Dedicated card rendered immediately:
  - Title: `DEMO · AIS-140 Intelligent 4G Telematics Tracker`
  - Status: `HLPL-SLCT-01 · In review`
  - Customer: `Not recorded` (honest placeholder; no fabricated values)
  - Lifecycle Stage: `Stage 8 · Type Approval & SCM`
  - Target Date: `2026-11-30`
- **Scoped Metrics & Lists**:
  - Department Progress: Updated to `100%` (2 of 2 records complete)
  - Tasks in Scope: `0`
  - Documents: `2` (`DEMO · Project master specification sheet`, `DEMO · Product requirement specification`)
  - Pending Approvals: `0`
  - Department Records: `4`
  - Assigned Task Owners: `0` (clean empty state)
- **Evidence Screenshot**: [`ehw_workspace_slct01_2026-10-19.png`](ehw_workspace_slct01_2026-10-19.png)

### 2.3 Dynamic Switch to `HLPL-BCU-02`
- **Action**: Changed project dropdown to `HLPL-BCU-02`.
- **Selected Project Overview**:
  - Title: `DEMO · Body Control Unit Gen 3`
  - Status: `HLPL-BCU-02 · In review`
  - Customer: `Not recorded`
  - Lifecycle Stage: `Stage 5 · Pilot Build`
  - Target Date: `2026-11-30`
- **Scoped Metrics & Lists**:
  - Department Progress: Updated to `0%` (0 of 1 records complete)
  - Tasks in Scope: `1`
  - Documents: `0` (`No authorized documents linked to this project scope`)
  - Pending Approvals: `1` (`DEMO · EHW ECN-002 thermal layout review`)
  - Department Records: `2`
  - Assigned Task Owners: `1` (`Avery Vale`)
- **Task Board State**:
  - `Today / In Progress`: `1` task (`DEMO-TASK-EHW-ECN-002`: "DEMO · Review & approve ECN-002 MOSFET package layout change", Priority: Critical, Assignee: Avery Vale).
  - `Under Review`: `0`
  - `To Do`: `0`
- **Isolation Verification**: Complete zero-bleed between `HLPL-SLCT-01` and `HLPL-BCU-02`. No residual metadata, documents, or tasks persisted across selection.
- **Evidence Screenshot**: [`ehw_workspace_bcu02_2026-10-19.png`](ehw_workspace_bcu02_2026-10-19.png)

### 2.4 Return to All Projects
- **Action**: Changed project dropdown back to `All projects — department overview`.
- **Verification**: Exact original department totals restored (`89%` progress, `1` task, `6` documents, `1` approval).

---

## 3. Testing Lead (`TST`, Mina Cross) Walkthrough

- **Navigation**: Accessed via `https://ssm-new.lovable.app/?role=tst`.
- **Header**: Displayed `Production — Project Workspace` with active persona `TST Lead (Mina Cross)`.
- **Consolidation**: Department landing automatically loads the consolidated workspace with single project dropdown.
- **All Projects State**:
  - Progress: `50%` (1 of 2 records complete)
  - Tasks: `1`
  - Documents: `1`
  - Approvals: `0`
  - Department Team: `4` members (Mina Cross, Rohit Pillai, Suresh Yadav, Divya Nair)
  - Task Board: `To Do (1)` contains `DEMO-TASK-TST-CAL` ("DEMO · Calibrate automated EOL jig JIG-SLCT-01 optical barcode scanner", Priority: Normal).
- **Evidence Screenshot**: [`tst_workspace_all_projects_2026-10-19.png`](tst_workspace_all_projects_2026-10-19.png)
- **Project Scope Switch (`HLPL-SLCT-01`)**:
  - Selected `HLPL-SLCT-01 · DEMO · AIS-140 Intelligent 4G Telematics Tracker`.
  - Progress: `0%` (0 of 1 records complete), Tasks: `1`, Docs: `0`, Approvals: `0`.
  - Task board correctly retained `DEMO-TASK-TST-CAL` linked to `HLPL-SLCT-01`.
- **Evidence Screenshot**: [`tst_workspace_slct01_2026-10-19.png`](tst_workspace_slct01_2026-10-19.png)

---

## 4. Verification Summary Matrix

| Verification Requirement | Status | Observed Evidence |
|---|---|---|
| Single project selector in workspace | **PASSED** | Exactly 1 dropdown rendered; embedded coordination center hides duplicate selector and tabs |
| Scoped project metadata | **PASSED** | Title, reference, customer, stage, target date update synchronously |
| Scoped task board | **PASSED** | Active tasks filter strictly by selected project; lane exclusivity preserved |
| Scoped document catalogue | **PASSED** | Only authorized direct/source-linked documents displayed; unlinked remain in All |
| Scoped approvals & reviews | **PASSED** | Pending reviews filter by source record/project UUID |
| Scoped task owners | **PASSED** | Shows only recorded task owners in selected scope; full team in All |
| Zero state bleed between projects | **PASSED** | `SLCT-01` (100% / 0 tasks / 2 docs) vs `BCU-02` (0% / 1 task / 0 docs) verified |
| Specialist tools discoverability | **PASSED** | Sidebar provides direct access to inventory, procurement, sales, and QA tools |
| Console / Runtime errors | **PASSED** | 0 uncaught exceptions or React hydration errors during switching |

---

## 5. Next Steps

With Priority 0 browser verification successfully closed and evidence recorded, proceed to **Priority 1: Consistent department UX and regression coverage across all 11 roles** per the handoff roadmap.
