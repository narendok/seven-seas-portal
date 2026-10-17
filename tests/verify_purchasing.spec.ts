import { test, expect } from '@playwright/test';

test('Verify Purchasing Department Sidebar and Command Center Modules', async ({ page }) => {
  // Set viewport to laptop widescreen
  await page.setViewportSize({ width: 1600, height: 1000 });

  // 1. Navigate to PUR role
  await page.goto('http://localhost:8080/?role=pur');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 2. Expand the sidebar if collapsed
  const isExpanded = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.classList.contains('w-64') : false;
  });

  if (!isExpanded) {
    await page.keyboard.press('[');
    await page.waitForTimeout(500);
  }

  // Verify sidebar PUR sub-options are visible
  await expect(page.locator('aside').getByText('Recordage').first()).toBeVisible();
  await expect(page.locator('aside').getByText('Quotations').first()).toBeVisible();
  await expect(page.locator('aside').getByText('Purchase Orders').first()).toBeVisible();
  await expect(page.locator('aside').getByText('Suppliers (ASL)').first()).toBeVisible();

  // Capture Screenshot 1: Sidebar with PUR sub-options expanded
  await page.screenshot({ path: 'docs/images/scms_sidebar_pur_expanded.png' });
  console.log('Saved docs/images/scms_sidebar_pur_expanded.png');

  // 3. Click Quotations sub-option in sidebar
  await page.locator('aside').getByText('Quotations').first().click();
  await page.waitForTimeout(800);
  await expect(page.getByText('Commercial Quotations & Volume Pricing Tiers').first()).toBeVisible();
  await page.screenshot({ path: 'docs/images/scms_pur_quotations_view.png' });
  console.log('Saved docs/images/scms_pur_quotations_view.png');

  // 4. Click Purchase Orders sub-option in sidebar
  await page.locator('aside').getByText('Purchase Orders').first().click();
  await page.waitForTimeout(800);
  await expect(page.getByText('Official Purchase Orders Register & 50,000 Sales Volume Alignment').first()).toBeVisible();
  await page.screenshot({ path: 'docs/images/scms_pur_orders_view.png' });
  console.log('Saved docs/images/scms_pur_orders_view.png');

  // 5. Click Suppliers (ASL) sub-option in sidebar
  await page.locator('aside').getByText('Suppliers (ASL)').first().click();
  await page.waitForTimeout(800);
  await expect(page.getByText('Approved Vendors (ASL)').first()).toBeVisible();
  await page.screenshot({ path: 'docs/images/scms_pur_suppliers_view.png' });
  console.log('Saved docs/images/scms_pur_suppliers_view.png');

  // Open Supplier Dossier for Mouser Electronics
  const inspectBtn = page.getByRole('button', { name: /^Dossier$/i }).first();
  await inspectBtn.click();
  await page.waitForTimeout(600);
  await expect(page.getByText('Official Automotive Warranty Terms').first()).toBeVisible();
  await expect(page.getByText('Quality Standards & Validity Schedule').first()).toBeVisible();
  await expect(page.getByText('Compliance Documents & Files').first()).toBeVisible();
  await page.screenshot({ path: 'docs/images/scms_pur_supplier_dossier_modal.png' });
  console.log('Saved docs/images/scms_pur_supplier_dossier_modal.png');

  // Close Supplier Dossier modal
  const closeBtn = page.locator('div[role="dialog"]').getByText('✕').first();
  await closeBtn.click();
  await page.waitForTimeout(400);

  // 6. Click Recordage sub-option in sidebar
  await page.locator('aside').getByText('Recordage').first().click();
  await page.waitForTimeout(800);
  await expect(page.getByText('Governed Inventory & Asset Management').first()).toBeVisible();

  // Open Register Part Modal
  const registerPartBtn = page.getByRole('button', { name: /Register Part/i }).first();
  await registerPartBtn.click();
  await page.waitForTimeout(600);
  await expect(page.getByText('Mouser Electronics Component Auto-Fill').first()).toBeVisible();

  // Click Mouser API Key modal button
  const apiKeyBtn = page.getByRole('button', { name: /Enter API Key|API Key Configured/i }).first();
  await apiKeyBtn.click();
  await page.waitForTimeout(600);
  await expect(page.getByText('Configure Mouser Search API Key').first()).toBeVisible();
  await page.screenshot({ path: 'docs/images/scms_mouser_api_key_modal.png' });
  console.log('Saved docs/images/scms_mouser_api_key_modal.png');

  // Close Mouser modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
});
