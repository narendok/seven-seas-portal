/**
 * Versioned portal state migration and hydration protocol (schemaVersion: 3).
 * Formally separates Firmware (FW) and Cloud & Application Software (SW),
 * retiring legacy ESW from active signing authority while preserving foreign-key
 * referential integrity and user data. Transitional aliases (EFW, CSW) are migrated.
 */

export const MIGRATION_SCHEMA_VERSION = 4;
export const PRE_MIGRATION_BACKUP_KEY = "ssm_portal_backup_pre_12dept_v1";

export interface MigrationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface MigratableState {
  schemaVersion?: number | undefined;
  demoLoaded?: boolean | undefined;
  records?: any[] | undefined;
  documents?: any[] | undefined;
  alerts?: any[] | undefined;
  approvals?: any[] | undefined;
  teamMembers?: any[] | undefined;
  departments?: any[] | undefined;
  notifications?: string[] | undefined;
  [key: string]: any;
}

const EXPLICIT_EFW_TASKS = new Set([
  "DEMO-TASK-ESW-BLE-GATT",
  "TASK-EFW-CAN01",
  "TASK-EFW-BOOT01",
  "TASK-ESW-CAN01",
]);

const EXPLICIT_CSW_TASKS = new Set([
  "TASK-CSW-MQTT01",
  "TASK-CSW-DASH01",
  "TASK-CSW-OTA01",
]);

const EXPLICIT_EFW_RECORDS = new Set([
  "HLPL-SLCT-ESW-HSI-01",
  "HLPL-SLCT-ESW-FW-01",
]);

const EXPLICIT_CSW_RECORDS = new Set([
  "HLPL-SLCT-CSW-ARCH-01",
  "HLPL-SLCT-CSW-BENCH-01",
]);

const EXPLICIT_DOCUMENTS: Record<string, { departmentId: string; designer?: string; approver?: string }> = {
  "demo-doc-hsi": { departmentId: "demo-dept-fw", designer: "Devon Lane", approver: "Jordan Blake" },
  "demo-doc-csw-arch": { departmentId: "demo-dept-sw", designer: "Siddharth Roy", approver: "Avery Vale" },
};

const EXPLICIT_ALERTS: Record<string, string> = {
  ALERT_HW_01: "demo-dept-ehw",
  ALERT_SAL_02: "demo-dept-sales",
  ALERT_TST_01: "demo-dept-tst",
  ALERT_FIN_03: "demo-dept-fin",
  ALERT_ESW_FW_01: "demo-dept-fw",
  ALERT_CSW_INGEST_01: "demo-dept-sw",
};

export function migratePortalState<T extends MigratableState>(
  saved: T,
  seed?: Partial<T>,
  storage?: MigrationStorage | null,
): T {
  // Idempotency: If state is already at schemaVersion >= 2, no further transformation needed.
  if (typeof saved.schemaVersion === "number" && saved.schemaVersion >= MIGRATION_SCHEMA_VERSION) {
    return saved;
  }

  if (saved.schemaVersion === 3) {
    return { ...saved, schemaVersion: MIGRATION_SCHEMA_VERSION, departments: saved.departments?.map((department: any) =>
      /^(DEMO-)?TST$/i.test(department.code ?? "") || /^(demo-dept-)?tst$/i.test(department.id ?? "")
        ? { ...department, active: false, isLegacy: true } : department) };
  }

  // Crash Recovery / Interrupted Migration check
  let sourceState = saved;
  if (storage) {
    try {
      const existingBackup = storage.getItem(PRE_MIGRATION_BACKUP_KEY);
      if (existingBackup && (!saved.schemaVersion || saved.schemaVersion < MIGRATION_SCHEMA_VERSION)) {
        // Interrupted prior save detected: recover clean pre-migration snapshot
        const parsedBackup = JSON.parse(existingBackup);
        if (parsedBackup && typeof parsedBackup === "object") {
          sourceState = parsedBackup as T;
        }
      } else if (!existingBackup) {
        // First run: save clean pre-migration backup before writing transformed state
        storage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify(saved));
      }
    } catch {
      // Storage errors fail safe without destroying in-memory data
    }
  }

  // 1. Records & Tasks migration
  const records = Array.isArray(sourceState.records)
    ? sourceState.records.map((record: any) => {
        if (!record || typeof record !== "object") return record;
        const ref = record.reference || record.id;
        const area = record.area;

        if (EXPLICIT_EFW_TASKS.has(ref) || EXPLICIT_EFW_RECORDS.has(ref) || area === "efw" || area === "fw") {
          return { ...record, area: "fw" };
        }
        if (EXPLICIT_CSW_TASKS.has(ref) || EXPLICIT_CSW_RECORDS.has(ref) || area === "csw" || area === "sw") {
          return { ...record, area: "sw" };
        }
        if (area === "esw") {
          // Unknown or mixed legacy record: preserve verbatim, flag, and quarantine from FW and SW boards
          return {
            ...record,
            legacy_area: "esw",
            migration_flag: "unresolved_legacy_esw",
          };
        }
        return record;
      })
    : [];

  // Add seed SW records/tasks if demoLoaded and not present
  if (sourceState.demoLoaded && seed && Array.isArray((seed as any).records)) {
    const existingRefs = new Set(records.map((r: any) => r?.reference || r?.id));
    for (const seedRec of (seed as any).records) {
      if (seedRec && (EXPLICIT_CSW_RECORDS.has(seedRec.reference) || EXPLICIT_CSW_TASKS.has(seedRec.reference) || seedRec.area === "sw" || seedRec.area === "csw")) {
        if (!existingRefs.has(seedRec.reference)) {
          records.push({ ...seedRec, area: "sw" });
          existingRefs.add(seedRec.reference);
        }
      }
    }
  }

  // 2. Documents migration
  const documents = Array.isArray(sourceState.documents)
    ? sourceState.documents.map((doc: any) => {
        if (!doc || typeof doc !== "object") return doc;
        const explicit = EXPLICIT_DOCUMENTS[doc.id];
        if (explicit) {
          return {
            ...doc,
            departmentId: explicit.departmentId,
            designer: doc.designer ?? explicit.designer,
            approver: doc.approver ?? explicit.approver,
          };
        }
        if (doc.departmentId === "demo-dept-efw" || doc.departmentId === "efw") {
          return { ...doc, departmentId: "demo-dept-fw" };
        }
        if (doc.departmentId === "demo-dept-csw" || doc.departmentId === "csw") {
          return { ...doc, departmentId: "demo-dept-sw" };
        }
        if (doc.departmentId === "demo-dept-esw" || doc.departmentId === "esw") {
          return {
            ...doc,
            legacy_departmentId: doc.departmentId,
            migration_flag: "unresolved_legacy_esw",
          };
        }
        return doc;
      })
    : [];

  // 3. Alerts migration (strict explicit alert ID lookup only; no title/detail heuristics)
  const alerts = Array.isArray(sourceState.alerts)
    ? sourceState.alerts.map((alert: any) => {
        if (!alert || typeof alert !== "object") return alert;
        if (EXPLICIT_ALERTS[alert.id]) {
          return { ...alert, departmentId: EXPLICIT_ALERTS[alert.id] };
        }
        if (alert.departmentId === "demo-dept-efw" || alert.departmentId === "efw") {
          return { ...alert, departmentId: "demo-dept-fw" };
        }
        if (alert.departmentId === "demo-dept-csw" || alert.departmentId === "csw") {
          return { ...alert, departmentId: "demo-dept-sw" };
        }
        if (alert.departmentId === "demo-dept-esw" || alert.departmentId === "esw") {
          // Unknown or mixed legacy alert: preserve, flag, and quarantine from FW and SW visibility
          return {
            ...alert,
            legacy_departmentId: alert.departmentId,
            departmentId: "unresolved",
            migration_flag: "unresolved_legacy_esw",
          };
        }
        return alert;
      })
    : [];

  // 4. Approvals migration
  const approvals = Array.isArray(sourceState.approvals)
    ? sourceState.approvals.map((approval: any) => {
        if (!approval || typeof approval !== "object") return approval;
        const sourceRecId = approval.recordId;
        if (sourceRecId === "HLPL-SLCT-ESW-FW-01" || sourceRecId === "HLPL-SLCT-ESW-HSI-01" || approval.department === "EFW" || approval.department === "FW") {
          return { ...approval, department: "FW" };
        }
        if (sourceRecId === "HLPL-SLCT-CSW-ARCH-01" || sourceRecId === "HLPL-SLCT-CSW-BENCH-01" || approval.department === "CSW" || approval.department === "SW") {
          return { ...approval, department: "SW" };
        }
        if (approval.department === "ESW") {
          return {
            ...approval,
            legacy_department: "ESW",
            migration_flag: "unresolved_legacy_esw",
          };
        }
        return approval;
      })
    : [];

  // 5. Team Members migration
  const teamMembers = Array.isArray(sourceState.teamMembers)
    ? sourceState.teamMembers.map((member: any) => {
        if (!member || typeof member !== "object") return member;
        if (member.name === "Devon Lane" || member.name === "Sneha Patel") {
          return { ...member, area: "fw" };
        }
        if (member.name === "Siddharth Roy" || member.name === "Nathan Cole") {
          return { ...member, area: "sw" };
        }
        if (member.area === "efw" || member.area === "fw") {
          return { ...member, area: "fw" };
        }
        if (member.area === "csw" || member.area === "sw") {
          return { ...member, area: "sw" };
        }
        if (member.area === "esw") {
          return {
            ...member,
            legacy_area: "esw",
            migration_flag: "unresolved_legacy_esw",
          };
        }
        return member;
      })
    : [];

  // 6. Departments & Roles migration
  const existingDeptIds = new Set((sourceState.departments || []).map((d: any) => d?.id));
  const departments = Array.isArray(sourceState.departments)
    ? sourceState.departments.map((dept: any) => {
        if (dept?.id === "demo-dept-tst" || dept?.id === "tst" || /^(DEMO-)?TST$/i.test(dept?.code ?? "") || dept?.id === "demo-dept-esw") {
          return { ...dept, active: false, isLegacy: true };
        }
        if (dept?.id === "demo-dept-efw" || dept?.id === "efw") {
          return { ...dept, id: "demo-dept-fw", code: "FW", name: "Firmware" };
        }
        if (dept?.id === "demo-dept-csw" || dept?.id === "csw") {
          return { ...dept, id: "demo-dept-sw", code: "SW", name: "Cloud & Application Software" };
        }
        return dept;
      })
    : [];

  if (seed && Array.isArray((seed as any).departments)) {
    for (const seedDept of (seed as any).departments) {
      if (seedDept?.id && !existingDeptIds.has(seedDept.id)) {
        departments.push(/^(DEMO-)?TST$/i.test(seedDept.code ?? "") ? { ...seedDept, active: false, isLegacy: true } : seedDept);
        existingDeptIds.add(seedDept.id);
      }
    }
  }

  // 7. Notifications: 100% bit-for-bit chronological invariance
  const notifications = Array.isArray(sourceState.notifications)
    ? [...sourceState.notifications]
    : [];

  return {
    ...sourceState,
    schemaVersion: MIGRATION_SCHEMA_VERSION,
    records: records.length || !sourceState.records ? records : sourceState.records,
    documents: documents.length || !sourceState.documents ? documents : sourceState.documents,
    alerts,
    approvals: approvals.length || !sourceState.approvals ? approvals : sourceState.approvals,
    teamMembers: teamMembers.length || !sourceState.teamMembers ? teamMembers : sourceState.teamMembers,
    departments: departments.length || !sourceState.departments ? departments : sourceState.departments,
    notifications,
  };
}

/** Repair absent seed collections without discarding user-created records or revisions. */
export function repairDemoState<T extends { documents: { id: string }[]; records: unknown[]; departments: unknown[] }>(
  saved: T,
  seed: T,
): T {
  const existing = new Set(saved.documents.map(document => document.id));
  const baseRepaired = {
    ...saved,
    documents: [...saved.documents, ...seed.documents.filter(document => !existing.has(document.id))],
    records: saved.records.length ? saved.records : seed.records,
    departments: saved.departments.length ? saved.departments : seed.departments,
  };
  return migratePortalState(baseRepaired as any, seed as any) as T;
}
