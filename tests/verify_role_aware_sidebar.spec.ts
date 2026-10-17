import { test, expect } from '@playwright/test';

test('Verify Role-aware Sidebar Menu Plan for Admin and Department Leads', async ({ page }) => {
  // Set viewport to standard widescreen laptop
  await page.setViewportSize({ width: 1600, height: 1000 });

  // ==========================================
  // PART 1: ADMINISTRATOR SIDEBAR BEHAVIOR
  // ==========================================
  await page.goto('http://localhost:8080/?role=admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Ensure sidebar is expanded
  const isExpandedAdmin = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.classList.contains('w-64') : false;
  });
  if (!isExpandedAdmin) {
    await page.keyboard.press('[');
    await page.waitForTimeout(500);
  }

  const aside = page.locator('aside');

  // 1. Verify Favorites at the top
  await expect(aside.getByText('Favorites', { exact: false }).first()).toBeVisible();

  // 2. Verify Overview section is expanded by default (with arrow down)
  await expect(aside.getByText('Dashboard / Command Center').first()).toBeVisible();
  await expect(aside.getByText('Work Queue & Approvals').first()).toBeVisible();

  // 3. Verify other groups start UNEXPANDED (collapsed) for Admin
  await expect(aside.getByText('Commercial & Projects').first()).toBeVisible();
  await expect(aside.getByText('Engineering & Delivery').first()).toBeVisible();
  await expect(aside.getByText('Inventory & Procurement').first()).toBeVisible();
  await expect(aside.getByText('Quality & Compliance').first()).toBeVisible();
  await expect(aside.getByText('Documents & Collaboration').first()).toBeVisible();
  await expect(aside.getByText('People & Organization').first()).toBeVisible();
  await expect(aside.getByText('Administration').first()).toBeVisible();

  // Check that items inside collapsed group (e.g. "Customers & Accounts") are not yet expanded
  const customerLink = aside.getByText('Customers & Accounts');
  expect(await customerLink.count()).toBe(0);

  // 4. Click to expand "Inventory & Procurement" work group
  await aside.getByText('Inventory & Procurement').first().click();
  await page.waitForTimeout(400);

  // Now items inside Inventory & Procurement should be visible
  await expect(aside.getByText('Governed Parts & Stock').first()).toBeVisible();
  await expect(aside.getByText('Purchase Orders (POs)').first()).toBeVisible();
  await expect(aside.getByText('Suppliers & ASL Governance').first()).toBeVisible();

  // Capture Admin Role-Aware Sidebar screenshot
  await page.screenshot({ path: 'docs/images/scms_sidebar_admin_role_aware.png' });
  console.log('Saved docs/images/scms_sidebar_admin_role_aware.png');

  // ==========================================
  // PART 2: DEPARTMENT SIDEBAR BEHAVIOR (ALL EXPANDED)
  // ==========================================
  await page.goto('http://localhost:8080/?role=pur');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const isExpandedDept = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.classList.contains('w-64') : false;
  });
  if (!isExpandedDept) {
    await page.keyboard.press('[');
    await page.waitForTimeout(500);
  }

  // Verify that for department users, ALL groups are expanded by default!
  await expect(aside.getByText('Favorites', { exact: false }).first()).toBeVisible();
  await expect(aside.getByText('My work').first()).toBeVisible();
  await expect(aside.getByText('My Tasks & Action Queue').first()).toBeVisible();

  await expect(aside.getByText('Projects').first()).toBeVisible();
  await expect(aside.getByText('Active Project Workspaces').first()).toBeVisible();

  await expect(aside.getByText('Department workspace').first()).toBeVisible();
  await expect(aside.getByText('Recordage & Governed Stock').first()).toBeVisible();
  await expect(aside.getByText('Quotations & Vendor Pricing').first()).toBeVisible();
  await expect(aside.getByText('Purchase Orders (POs)').first()).toBeVisible();
  await expect(aside.getByText('Suppliers (ASL) & Governance').first()).toBeVisible();

  await expect(aside.getByText('Reference').first()).toBeVisible();
  await expect(aside.getByText('Governed Parts & Stock (Read-only)').first()).toBeVisible();

  // Capture Department Role-Aware Sidebar screenshot
  await page.screenshot({ path: 'docs/images/scms_sidebar_dept_role_aware.png' });
  console.log('Saved docs/images/scms_sidebar_dept_role_aware.png');

  // ==========================================
  // PART 3: COMPACT RAIL VIEW
  // ==========================================
  await page.keyboard.press('[');
  await page.waitForTimeout(500);

  const isCollapsed = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.classList.contains('w-16') : false;
  });
  expect(isCollapsed).toBe(true);

  // Capture Compact Rail Sidebar screenshot
  await page.screenshot({ path: 'docs/images/scms_sidebar_compact_role_aware.png' });
  console.log('Saved docs/images/scms_sidebar_compact_role_aware.png');
});
