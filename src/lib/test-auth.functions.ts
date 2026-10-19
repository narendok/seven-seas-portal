import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TestMembership = {
  organizationId: string;
  organizationName: string;
  membershipId: string;
  displayName: string;
  role: "admin" | "department_lead" | "member" | "viewer";
  departmentCode: string | null;
  departmentName: string | null;
  isClient: boolean;
};

export const getTestMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TestMembership> => {
    const { data: rows, error } = await context.supabase.rpc("resolve_test_membership");
    if (error) throw error;
    const membership = rows?.[0];
    if (!membership) throw new Error("This account has no active TEST organization membership.");

    return {
      organizationId: membership.organization_id,
      organizationName: membership.organization_name,
      membershipId: membership.membership_id,
      displayName: membership.display_name,
      role: membership.role,
      departmentCode: membership.department_code,
      departmentName: membership.department_name,
      isClient: membership.is_client,
    };
  });