# Project Rules: Hexense Labs Smart Company Management System (SCMS)

## Permissions & Autonomy Policy
- **Blanket Authorization ("Allow All")**: The user has explicitly authorized full, autonomous execution for this project (`SSM1`).
- **Tool & Command Execution**: All command executions (`run_command`), file modifications, creation of scripts/artifacts, database migrations, and subagent invocations (including browser automation via `browser` subagent) are pre-approved and may proceed without interruption or redundant permission prompts.
- **Data Safety Protocol**: Maintain project integrity, preserve existing working code and documentation, and ensure all changes conform to enterprise standards.

---

## Domain & System Specifications

### 1. Enterprise Profile & Compliance
- **Company**: Hexense Labs Private Limited (HLPL) / Six Sense Mobility.
- **Governing Standards**:
  - Quality Management: **IATF 16949:2016** & **ISO 9001:2015**
  - Environmental Management: **ISO 14001:2015**
  - Occupational Health & Safety: **ISO 45001:2018**
  - Information Security: **ISO/IEC 27001:2022** (ISMS)
  - Telematics Compliance: **AIS-140 / TAC**
  - Component Qualification: **AEC-Q100** (Integrated Circuits), **AEC-Q200** (Passives)
  - Electrical Transients: **ISO 7637-2**
  - Environmental: **RoHS & REACH**

### 2. Document Numbering Formula
All documents generated across the enterprise must conform to:
$$\text{Document ID} = \mathbf{HLPL-[\text{PROJ\_ID}]-[\text{DEPT}]-[\text{DOC\_TYPE}]-[\text{REV}]}$$
- Examples: `HLPL-SLCT-EHW-PRS-02`, `HLPL-BCU-SAL-QUO-01`, `HLPL-XLINK-EMF-PFD-01`.

### 3. Eleven Functional Departments
The system digital backbone integrates:
1. `SAL`: Sales & Business Development
2. `EHW`: Embedded Hardware Engineering
3. `ESW`: Firmware & Software Engineering
4. `MECH`: Mechanical Engineering
5. `PUR`: Purchasing & Supply Chain Management (Dual-track: Proto vs Mass)
6. `QA`: Quality Assurance & APQP (`HLPL-APQP-001`)
7. `EMF`: Electronics & Mechanical Manufacturing
8. `TST`: Production & Automated EOL Testing Jigs
9. `FIN`: Accounts & Finance
10. `SIT`: Service & IT Infrastructure
11. `HR/OPS`: HR & Operations (Skill Matrix `HLPL/F/HR/03`, Six Sigma DMAIC)

### 4. Lovable Integration
- **Active Project**: "Portal & Wizard" (`a3399684-daab-4b38-8666-187b96b451af`)
- **Backend**: Lovable Cloud (managed Supabase Postgres + private S3 storage with signed tokens)
- **Repository Structure**: `00_Automotive_Hardware_Audit_Repository` covering phases `HW_01` to `HW_37`.
