import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const TEST_ORGANIZATION_NAME = "TEST ONLY · SSM-new1 synthetic workspace";

type TestIdentity = {
  email: string;
  password: string;
  name: string;
  role: Database["public"]["Enums"]["app_role"];
  departmentCode: string | null;
};

const departmentDefinitions = [
  ["SAL", "Sales & Business Development"],
  ["EHW", "Embedded Hardware Engineering"],
  ["FW", "Firmware"],
  ["SW", "Cloud & Application Software"],
  ["MECH", "Mechanical Engineering"],
  ["PUR", "Purchasing & Supply Chain"],
  ["QA", "Quality Assurance"],
  ["EMF", "Electronics Manufacturing"],
  ["MMF", "Mechanical Manufacturing"],
  ["FIN", "Accounts & Finance"],
  ["SIT", "Service & IT Infrastructure"],
  ["HR", "HR & Operations"],
] as const;

export const testIdentities: TestIdentity[] = [
  { email: "admin@example.com", password: "Admin@Demo2026", name: "TEST Executive Admin", role: "admin", departmentCode: null },
  { email: "rohan.verma@example.com", password: "Tata@Client2026", name: "TEST Client Viewer", role: "viewer", departmentCode: "CLIENT" },
  { email: "priya.sharma@example.com", password: "Demo@SAL2026", name: "Priya Sharma", role: "department_lead", departmentCode: "SAL" },
  { email: "avery.vale@example.com", password: "Demo@EHW2026", name: "Avery Vale", role: "department_lead", departmentCode: "EHW" },
  { email: "devon.lane@example.com", password: "Demo@EFW2026", name: "Devon Lane", role: "department_lead", departmentCode: "FW" },
  { email: "siddharth.roy@example.com", password: "Demo@CSW2026", name: "Siddharth Roy", role: "department_lead", departmentCode: "SW" },
  { email: "samira.holt@example.com", password: "Demo@MECH2026", name: "Samira Holt", role: "department_lead", departmentCode: "MECH" },
  { email: "morgan.reed@example.com", password: "Demo@PUR2026", name: "Morgan Reed", role: "department_lead", departmentCode: "PUR" },
  { email: "jordan.blake@example.com", password: "Demo@QA2026", name: "Jordan Blake", role: "department_lead", departmentCode: "QA" },
  { email: "casey.rowan@example.com", password: "Demo@EMF2026", name: "Casey Rowan", role: "department_lead", departmentCode: "EMF" },
  { email: "mmf.lead@example.com", password: "Demo@MMF2026", name: "Mechanical Manufacturing Lead (Interim)", role: "department_lead", departmentCode: "MMF" },
  { email: "priya.voss@example.com", password: "Demo@FIN2026", name: "Priya Voss", role: "department_lead", departmentCode: "FIN" },
  { email: "kai.morgan@example.com", password: "Demo@SIT2026", name: "Kai Morgan", role: "department_lead", departmentCode: "SIT" },
  { email: "taylor.quinn@example.com", password: "Demo@HR2026", name: "Taylor Quinn", role: "department_lead", departmentCode: "HR" },
  ...departmentDefinitions.map(([departmentCode, departmentName]) => ({
    email: `employee.${departmentCode.toLowerCase()}@example.com`,
    password: `Demo@${departmentCode}EMP2026`,
    name: `TEST ${departmentName} Employee`,
    role: "member" as const,
    departmentCode,
  })),
];

function getAdmin() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("TEST identity provisioning is unavailable.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function provisionTestIdentities() {
  const admin = getAdmin();
  const users = new Map<string, string>();
  for (const identity of testIdentities) {
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;
    let user = listed.users.find((candidate) => candidate.email?.toLowerCase() === identity.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({ email: identity.email, password: identity.password, email_confirm: true });
      if (error || !data.user) throw error ?? new Error("Unable to create a TEST identity.");
      user = data.user;
    } else {
      const { error } = await admin.auth.admin.updateUserById(user.id, { password: identity.password, email_confirm: true });
      if (error) throw error;
    }
    users.set(identity.email, user.id);
  }

  const adminUserId = users.get("admin@example.com");
  if (!adminUserId) throw new Error("TEST admin identity is unavailable.");
  const { data: existingOrganization, error: orgError } = await admin.from("organizations").select("id").eq("name", TEST_ORGANIZATION_NAME).maybeSingle();
  if (orgError) throw orgError;
  let organizationId = existingOrganization?.id;
  if (!organizationId) {
    const { data, error } = await admin.from("organizations").insert({ name: TEST_ORGANIZATION_NAME, main_location: "Synthetic TEST environment", created_by: adminUserId }).select("id").single();
    if (error || !data) throw error ?? new Error("Unable to create TEST organization.");
    organizationId = data.id;
  }

  for (const identity of testIdentities) {
    const userId = users.get(identity.email);
    if (!userId) continue;
    const { error } = await admin.from("organization_members").upsert({ organization_id: organizationId, user_id: userId, role: identity.role, display_name: identity.name, active: true }, { onConflict: "organization_id,user_id" });
    if (error) throw error;
  }

  const { data: memberships, error: memberError } = await admin.from("organization_members").select("id, user_id").eq("organization_id", organizationId);
  if (memberError || !memberships) throw memberError ?? new Error("Unable to resolve TEST members.");
  const membershipByUser = new Map(memberships.map((member) => [member.user_id, member.id]));

  for (const [index, [code, name]] of departmentDefinitions.entries()) {
    const lead = testIdentities.find((identity) => identity.departmentCode === code && identity.role === "department_lead");
    const leadMemberId = lead ? membershipByUser.get(users.get(lead.email) ?? "") ?? null : null;
    const { error } = await admin.from("departments").upsert({ organization_id: organizationId, code, name, department_type: "TEST only", lead_member_id: leadMemberId, active: true, sort_order: index + 1 }, { onConflict: "organization_id,code" });
    if (error) throw error;
  }

  const clientUserId = users.get("rohan.verma@example.com");
  const clientMemberId = clientUserId ? membershipByUser.get(clientUserId) ?? null : null;
  const { error: clientDepartmentError } = await admin.from("departments").upsert({ organization_id: organizationId, code: "CLIENT", name: "TEST Client Portal", department_type: "TEST only", lead_member_id: clientMemberId, active: true, sort_order: 99 }, { onConflict: "organization_id,code" });
  if (clientDepartmentError) throw clientDepartmentError;

  return { organizationId, accountCount: testIdentities.length };
}