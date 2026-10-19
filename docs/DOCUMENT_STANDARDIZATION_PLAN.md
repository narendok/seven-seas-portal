# Project document standardization plan

Date: 2026-10-19. Status: planned; templates, backend contracts and releases are not implemented by this document.

## Purpose and observed gap

Every document must use a document-specific controlled format and the selected project's available information. A metadata card or a shared engineering paragraph is not a completed document.

Inspection evidence: `src/routes/index.tsx` contains 12 `autoDraftTemplates`; `templateBlueprint` contains short descriptions, and `DocumentBody` inserts a shared telematics architecture and fixed specifications. `ClientOEMPortal.tsx` advertises seven released deliverables using fixed sample statuses and dates. Files in `documents/` contain detailed examples but their approval names, technical values and commercial facts are not proof of operational approval. These are source observations, not confirmation of the managed backend's live records.

This plan supplements the existing web master plan's controlled-document section. It does not replace the web or Android delivery roadmap. Web/backend owns templates, numbering, approval, released revisions and private binaries; Android consumes verified contracts and may keep clearly marked drafts/cache.

## Common document control format

Every document has company identity from approved settings; title; document ID; template ID/version; project ID and name; department; revision; issue/effective date; classification; lifecycle status; owner; prepared/reviewed/approved records; revision history; source baseline references; attachments; and page numbering. Do not manufacture missing addresses, names, dates or signatures. Project-independent company forms explicitly show project as not applicable.

Use `HLPL-[PROJ_ID]-[DEPT]-[DOC_TYPE]-[REV]` for project deliverables and preserve controlled form IDs such as `HLPL/F/MKT/01` and `HLPL/F/HR/03`. Separate template identity, document instance identity and revision. Do not silently rename existing linked records; keep legacy IDs as aliases pending an approved mapping. Official numbers come from the verified backend contract.

Use A4 portrait for narrative forms and A4 landscape for wide registers/matrices; repeat table headers, wrap cells, prevent clipping, and paginate long tables. Editable narratives use DOCX with a matching PDF rendition. Registers use XLSX with typed columns, units, filters and validated formulas, plus a printable PDF where useful. CAD, Gerber, firmware and signed external evidence retain native files with a controlled cover/index. These are internal format requirements, not a claim of certification to a standard.

## Project data and provenance

Populate from the selected authorized project and its reviewed master specification, customer SOR, linked commercial records, released BOM, design revisions, inspection records and approved source files. Existing examples can inform layout but must not populate another project's facts.

Each populated field needs source record/file ID, source revision, field path or page, retrieval time and verification state. Distinguish verified source, unverified source, demo, missing, conflict and not applicable. Display missing values as `TBD — owner confirmation required`; retain both sources for conflicts. A plan requirement is not a measured result, and an uploaded document is not automatically an approved baseline.

AI4T and SLCT are separate project scopes until an authorized mapping proves otherwise. The client mounting-manual entry currently names OBD4 while describing AI4T; resolve the linkage before release. Resolve company branding and conflicting part specifications through approved settings and project owners. Never infer AIS-140 approval, AEC qualification, zero defects, tax amounts, signatures or payment terms from a demo label.

## Document inventory and required content

Each semicolon-separated item below is a separate template/register entry, even when grouped by family. Owners are functional responsibilities to map onto existing department IDs and approved RACI, not new roles.

| Family / owner | Documents to plan | Required body or table fields | Preferred format / source |
|---|---|---|---|
| Sales / SAL | Enquiry and RFQ intake; customer SOR; scope change | Customer/project, requirement ID, original statement, measurable criterion, source, priority, interface, acceptance method, revision and disposition | DOCX + XLSX requirements register; customer intake and reviewed SOR |
| Sales / SAL + legal reviewer | Mutual NDA; customer agreement | Parties, purpose, definitions, obligations, exclusions, term, governing-law fields, authorized execution evidence | DOCX/PDF; reviewed legal text and executed attachment; no simulated signatures |
| Feasibility / SAL + participating leads | Contract review; department feasibility response; consolidated decision | Requirement links, technical/capacity/supply/cost/schedule assessment, risk, assumptions, actions, response author, decision and approval evidence | DOCX + XLSX matrix; actual reviewer responses |
| Commercial / SAL + FIN | Quotation; customer PO/LOI review; order acknowledgement | Line items, currency, quantities, price tiers, NRE/tooling, tax basis, validity, lead time, terms, exclusions and customer reference | XLSX + PDF; approved costing and commercial records |
| Requirements / EHW + FW + SW + MECH | PMSS; PRS; architecture/block diagram; interface/HSI specification | Requirement IDs, values/units/tolerances, interfaces/pinout, operating envelope, constraints, verification links and baseline change history | DOCX + diagrams; reviewed master specification, never fixed telematics defaults |
| Hardware / EHW | Schematics; PCB release; Gerber package; hardware design review | Design revision, native filenames/checksums, fabrication/assembly notes, review findings, linked requirements and release manifest | Native design package + PDF cover/index; controlled design files |
| Materials / EHW + PUR | Preliminary BOM; released BOM; cost tracker; approved alternates | Item/part ID, MPN/manufacturer, description, quantity/UOM, designators, revision, lifecycle, qualification evidence, alternate approval, cost/currency/date and lead time | XLSX + native BOM; project BOM and approved sourcing evidence |
| Firmware / FW | Firmware requirements, PoC report, firmware design, test report and release notes | Requirement/test links, hardware target, configuration, source revision, version, build checksum, known issues, compatibility, update/rollback instructions and approval | DOCX/PDF + native artifacts; reviewed firmware build/test outputs |
| Software / SW | Cloud and application requirements, API/interface specifications, application test report and release notes | Requirement/test links, API/protocol versions, source revision, deployment configuration, app/cloud version, security/performance results, known issues and approval | DOCX/PDF + native artifacts; reviewed software build/test outputs |
| Mechanical engineering / MECH | Enclosure CAD; drawings; harness drawing/pinout; tooling specification; thermal/mechanical report | Drawing revision, dimensions/tolerances, material, connector/pin/wire tables, tooling/configuration, simulation or test conditions and results | Native CAD + PDF; released mechanical/harness baseline |
| Mechanical manufacturing / MMF | Mechanical fabrication/finishing work order; subassembly traveler; fit/dimensional inspection; supplier receipt where configured | Drawing/revision, material/lot, approved source, process/finish, dimensions/tolerances, inspection results, nonconformance and EMF handoff references | XLSX/DOCX/PDF and approved native drawings; actual supplier/production/inspection evidence |
| Design risk / EHW + QA | DFMEA | Structure/function, failure/effect/cause, prevention/detection controls, adopted method/version, rating rationale, action priority or RPN per approved method, owner/date, evidence and reassessment | XLSX; approved risk methodology and design review; no invented scores |
| Purchasing / PUR | PR; supplier RFQ; supplier quotation comparison; PO/revision; supplier acknowledgement; ASN | Project/BOM link, supplier, item/spec revision, quantity/UOM, currency, dates, delivery terms, evaluation and approved changes | XLSX/PDF; verified procurement records |
| Supplier quality / PUR + QA | ASL/AVL/ACML; supplier audit; capacity review; supplier PPAP | Supplier/part/site scope, audit criteria/findings/actions, capacity assumptions, evidence validity and submission disposition | XLSX + PDF dossier; verified supplier evidence |
| Stores / PUR or configured stores owner | GRN/IQC; stock register; material issue/return; count/picking records | PO/ASN, lot/batch/reel/serial, quantity/UOM, bin, accepted/held/rejected split, recipient/project, movement reference and discrepancy disposition | XLSX/PDF; authoritative receiving/stock contracts; documents must not post stock |
| Electronics manufacturing / EMF | Box-build process flow; PFMEA; control plan; work instruction; line-start checklist; outsourced-PCBA receipt and traceability; in-line/final assembly checks | Assembly step links, accepted PCBA supplier/lot, configuration, tools, parameters/limits, characteristics, checks, reaction plan, safety and evidence. In-house SMT/PCBA assembly is out of scope. | Landscape XLSX for matrices, DOCX/PDF for instructions; approved supplier and reviewed production baseline |
| Validation / QA | APQP plan; DVP&R; pre-compliance report; customer validation | Requirement/test ID, applicable standard/version, method, conditions, sample/configuration, acceptance criterion, planned/actual dates, measured result, evidence and disposition | XLSX + PDF; approved test plan and actual lab/customer results |
| Quality / QA | NCR; deviation/concession; 8D/CAPA; change request/ECO/ECN | Affected parts/lots/revisions, issue/evidence, containment, root cause, actions, effectiveness, impact, approver and closure | DOCX + XLSX register; actual quality/change records |
| Release / QA + EHW + PUR | PPAP dossier/index; design release checklist; TAC/certification record | Required submission items, revisions, evidence links, missing items, review disposition; external certificate issuer/number/scope/validity and authentic file | PDF index + native evidence; do not generate an authority-issued certificate |
| Production test / EMF or MMF + QA | In-line/final functional test report; mechanical inspection record; PDI/final inspection; serialized release list | Batch/serial range, quantity, calibrated test asset where applicable, firmware/configuration, approved checks and limits, actual measured results, failures/rework, disposition and release approval. QA owns test criteria and independent quality disposition; production records execution. | XLSX + PDF; actual production test/inspection evidence and linked QA disposition |
| Finance / FIN | Budget/cost register; tax invoice; receivables/payment reconciliation | Seller/buyer/consignee, order/dispatch links, line values, currency, reviewed tax classification/rates, totals, payment reference and reconciliation | XLSX + PDF; verified finance records and approved calculations |
| Dispatch / EMF + SAL + FIN | Packing list; dispatch note; shipment tracking; delivery acknowledgement | PO/batch/serial links, quantities/packages, destination, carrier/reference, dates and receipt evidence | DOCX/XLSX + PDF; approved dispatch records |
| Service / SIT | Installation/mounting manual; commissioning checklist; service ticket/report; warranty record | Correct product/configuration, tools, installation/pinout, safety, acceptance checks, fault diagnosis, service actions and evidence | DOCX/PDF; released engineering and service records |
| Assets / configured asset owner + EMF/MMF or QA, by asset role | Asset register; maintenance plan/log; calibration register/certificate index; measurement study | Asset/serial, custodian, location, schedule, instrument range, calibration provider/evidence, expiry, out-of-tolerance action and study results | XLSX + PDF/native provider evidence; actual asset/calibration records |
| HR/OPS | Skill matrix; training needs; training record; competency assessment | Employee/role access scope, skill criteria, required/observed level, assessor/evidence/date, gap, training and reassessment | Restricted XLSX + PDF; authorized HR records, no generated competence results |
| QMS / designated quality owner | SOP/procedure; internal audit plan/report; management review; compliance calendar | Purpose/scope, responsibilities, procedure, records, criteria/findings, actions/owners/dates, decisions and review history | DOCX + XLSX registers; approved procedures and audit evidence |
| Governance / admin + department owners | RACI/authority matrix; document master register; revision/change log; transmittal; legal/letterhead templates; access/review register | Authority scope, template/document/revision, classification, owner, approvals, distribution, effective/review dates, supersession and audit references | XLSX + DOCX/PDF; controlled settings and verified audit records |

## Delivery sequence

1. Inventory every entry point: Auto Draft, Inspect Document, lifecycle dossier, Drive, department records, client deliverables and Android document links. Assign each existing record/file a document type and project without altering approved identities. Reconcile the 12 draft templates, seven client cards, lifecycle documents and `documents/` examples against this inventory. Unmapped types remain visibly unsupported rather than using a generic template.
2. Build a versioned template registry: type, aliases, owner, sections/columns, output format, required fields, source mapping, applicability rules, classification, review route and validation. Template version is independent of project document revision.
3. Implement project-source resolution and missing/conflicting-data reporting. Save a source snapshot with each draft. Start with SOR, feasibility, PRS and BOM; then quotation, control plan, DVP&R, DFMEA, PDI and invoice; then complete the remaining inventory. One project must pass end to end before widening scope.
4. Replace the shared `DocumentBody` with type-specific renderers using the registry. Use the same populated snapshot for preview, editable export and PDF. Preserve native externally issued files. Resolve aliases explicitly; reject type inference from ambiguous titles or abbreviated IDs.
5. Bind lifecycle status and client visibility to verified approval/release records. Keep author, reviewer and approver actions attributable. An edited source flags affected drafts for review; it never silently rewrites a released revision. Release numbering, immutable audit and private file links require verified backend contracts.
6. Hand the verified registry/read/download contracts to Android. Validate web/mobile agreement on project, document ID, revision, status, classification and authorized file. Keep unsupported writes blocked until the backend contract exists.

## Acceptance evidence required

- Every inventoried type has its own sections/columns, output format, source mapping and review route; unsupported types show a clear gap.
- Inspect Document opens the exact selected project/document/revision. No SLCT, AI4T or OBD4 cross-population; test two distinct project fixtures and one sparse project.
- A sparse project shows missing fields and never receives sample prices, MCU values, approvals, certificates, inspection passes or signatures. Conflicting sources require resolution.
- Requirements link to design, BOM, test and release evidence. Planned tests stay distinct from actual results; authentic external certificates are attachments.
- Preview, DOCX/XLSX and PDF agree on values and source revision. Visually inspect narrative, wide matrix and multi-page outputs for repeated headers, legibility, units, pagination and clipping; verify workbook formulas independently.
- Verify owner/reviewer/approver permissions and client visibility with approved test identities. Released files and superseded versions remain traceable, access checked and immutable through ordinary editing.
- Record actual build results, browser checks and output evidence before claiming implementation. This planning change alone does not fix the live viewer or certify any sample document.

## Combined department fix scope

The user confirmed the same relevance/navigation problems across all 12 lead logins. This is one shared correction, not a Service-only patch. Tasks, approvals, projects, documents, references, notifications and team views must preserve department identity and explicit cross-department assignments. Optional filters cannot widen authorization. Admin and client experiences require separate acceptance.

### Findings reproduced during the live review

1. Finance approvals showed unrelated QA and EHW requests because list/count scope defaulted to all records. Service showed the same three records despite having no own or assigned requests, with a hardcoded sidebar badge of 2.
2. Service My Tasks clicked back into its existing department queue, producing no visible destination change despite a backup task being present.
3. Active Project Workspaces sent a department lead to a global route that the department guard rejected.
4. User requested removal of Service's fixed AI4T lifecycle shortcut, retaining relevant Service work and documents.
5. Project Documents displayed generic cross-functional empty folders and a Customer Register action. This established irrelevant presentation; it did not establish access to unrelated binary files. User clarified this review applies to all document entry points in all departments.
6. Reference links need label/destination verification: Templates & Standards opened the general draft hub; the directory opened company-wide contacts. User requires department-related teams by default. Service's directory and coordination roster had different memberships.
7. The lifecycle progression and several generated documents used fixed simulation content. Screen progression was not proof of authenticated production execution.

### Required behavior and validation

For each lead, verify task ownership/filter/counts, own and explicitly assigned approvals, linked project contributions, scoped document records and file access, relevant templates, department roster, alerts, desktop/mobile/favorite links, selected state, reload and stale-dialog handling. Keep permitted collaboration visible. Test direct unrelated access denial with approved authenticated identities before asserting backend isolation.

Local implementation and verification are recorded in [the 19 October checkpoint](evidence/DEPARTMENT_SCOPE_FIX_2026-10-19.md). It distinguishes completed local corrections from unverified managed-backend integration. The full inventory, editable artifact formats, approved template governance and production lifecycle acceptance remain delivery requirements, not completed claims.

## Decisions still needed from accountable owners

Confirm authoritative project baselines and approved company identity; map functional owners to configured departments; choose controlled standards/method editions; supply missing legal, tax, test, certification and signature evidence. Verify the intended authenticated test environment and approved test identities before production workflow acceptance. These decisions block affected fields or releases, not template planning.
