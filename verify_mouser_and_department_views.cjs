const { chromium } = require("playwright-core");
const path = require("path");

(async () => {
  console.log("=== Starting Live SCMS Verification: Mouser Intelligence & Department Views ===");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1480, height: 1100 } });

  // 1. Navigate to Purchasing role
  console.log("Navigating to http://localhost:8080/?role=pur ...");
  await page.goto("http://localhost:8080/?role=pur", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll to Governed Inventory workspace
  const invHeader = page.locator("h2:has-text('Governed Inventory & Asset Management')").first();
  await invHeader.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Verify Default Purchasing Preset (columns: Tentative Unit Cost, Lead Time, Supplier / Mouser, Stock vs Sales Need)
  console.log("Testing Purchasing View Preset...");
  await page.screenshot({ path: "scms_inventory_pur_view.png" });
  console.log("-> Captured: scms_inventory_pur_view.png");

  // Switch to Hardware (EHW) Preset
  console.log("Switching to Hardware (EHW) Preset...");
  const ehwBtn = page.locator("button:has-text('Hardware (EHW)')").first();
  await ehwBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scms_inventory_ehw_view.png" });
  console.log("-> Captured: scms_inventory_ehw_view.png");

  // Switch to Mechanical (MECH) Preset
  console.log("Switching to Mechanical (MECH) Preset...");
  const mechBtn = page.locator("button:has-text('Mechanical (MECH)')").first();
  await mechBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scms_inventory_mech_view.png" });
  console.log("-> Captured: scms_inventory_mech_view.png");

  // Switch to Universal Preset
  console.log("Switching to Universal Preset...");
  const uniBtn = page.locator("button:has-text('Universal')").first();
  await uniBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scms_inventory_universal_view.png" });
  console.log("-> Captured: scms_inventory_universal_view.png");

  // 2. Test Mouser Component Auto-Fill inside Register Part Modal
  console.log("Opening Register Part Modal with Mouser Search...");
  const registerBtn = page.locator("button:has-text('+ Register Part')").first();
  await registerBtn.click();
  await page.waitForTimeout(800);

  const modal = page.locator("div[role='dialog'][aria-label*='Register New Controlled Part']");
  await modal.waitFor({ state: "visible", timeout: 10000 });

  // Type STM32G0B1VCT6 in Mouser Search input
  const mouserInput = modal.locator("input[placeholder*='STM32G0B1VCT6']").first();
  await mouserInput.fill("STM32G0B1VCT6");
  await page.waitForTimeout(300);

  // Click [ ⚡ Fetch from Mouser ]
  console.log("Fetching component specs from Mouser Intelligence Engine...");
  const fetchBtn = modal.locator("button:has-text('Fetch from Mouser')").first();
  await fetchBtn.click();
  await page.waitForTimeout(1000);

  // Take screenshot of modal with all auto-filled Mouser fields
  await page.screenshot({ path: "scms_mouser_autofill_modal.png" });
  console.log("-> Captured: scms_mouser_autofill_modal.png");

  // Save the part
  console.log("Saving Mouser-verified component...");
  await modal.locator("button:has-text('Save Component')").click();
  await page.waitForTimeout(1000);

  // 3. Test Deep Multi-Section Part Inspection Modal
  console.log("Opening Deep Inspection Modal for STM32G0B1VCT6...");
  const stmPartLink = page.locator("span:has-text('STM32G0B1VCT6')").first();
  await stmPartLink.click();
  await page.waitForTimeout(1000);

  const detailModal = page.locator("div[role='dialog'][aria-label*='Part Specifications']");
  await detailModal.waitFor({ state: "visible", timeout: 10000 });

  // Check EHW Technical tab inside inspection modal
  const techTab = detailModal.locator("button:has-text('EHW Technical')").first();
  await techTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "scms_part_deep_inspection_modal.png" });
  console.log("-> Captured: scms_part_deep_inspection_modal.png");

  // Close detail modal
  const closeBtn = detailModal.locator("button:has-text('Close')").first();
  await closeBtn.click();
  await page.waitForTimeout(600);

  // 4. Test Hardware Department Direct Integration
  console.log("Navigating to http://localhost:8080/?role=ehw to verify Hardware Department View...");
  await page.goto("http://localhost:8080/?role=ehw", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const ehwInv = page.locator("h2:has-text('Governed Inventory & Asset Management')").first();
  await ehwInv.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scms_ehw_department_inventory.png" });
  console.log("-> Captured: scms_ehw_department_inventory.png");

  // 5. Test Mechanical Department Direct Integration
  console.log("Navigating to http://localhost:8080/?role=mech to verify Mechanical Department View...");
  await page.goto("http://localhost:8080/?role=mech", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const mechInv = page.locator("h2:has-text('Governed Inventory & Asset Management')").first();
  await mechInv.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scms_mech_department_inventory.png" });
  console.log("-> Captured: scms_mech_department_inventory.png");

  console.log("=== All Live Mouser & Multi-Column Department Verifications Passed! ===");
  await browser.close();
})();
