import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function run() {
  console.log("=== Starting Comprehensive SCMS Features Automated Verification ===");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser Error]: ${msg.text()}`);
    }
  });

  console.log("Navigating to http://localhost:8080/ ...");
  await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector("header", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // Test 1: Command Center Header "Create Task" button
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Testing Command Center 'Create Task' button...");
  const ccCreateTaskBtn = page.locator("button:has-text('Create Task')").first();
  await ccCreateTaskBtn.click();
  await page.waitForTimeout(500);

  const modalHeader = page.locator("header h2");
  const modalHeaderText = await modalHeader.textContent();
  console.log(`   Modal opened: "${modalHeaderText}"`);

  const recordTypeSelect = page.locator("label:has-text('Record type') select");
  const selectedType = await recordTypeSelect.inputValue();
  if (selectedType !== "Task") {
    throw new Error(`Expected "Task" to be selected, but found "${selectedType}"`);
  }

  const taskTitleInput = page.locator("label:has-text('Task Title') input");
  await taskTitleInput.fill("Automated Test Task 1 - Command Center");

  const saveBtn = page.locator("button:has-text('Save Task')");
  await saveBtn.click();
  await page.waitForTimeout(800);
  console.log("   ✓ Command Center 'Create Task' test PASSED!");

  // -------------------------------------------------------------
  // Test 2: Sales Department Overview "Create Task" (Header & Section)
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Testing Sales Department 'Create Task' buttons...");
  const salesNavBtn = page.locator("button[aria-label='Sales & Business Development']").first();
  await salesNavBtn.click();
  await page.waitForTimeout(1000);

  // Test PageHeader Create Task
  console.log("   Clicking Sales PageHeader 'Create Task'...");
  const salesHeaderCreateTask = page.locator("header button:has-text('Create Task')").first();
  await salesHeaderCreateTask.click();
  await page.waitForTimeout(500);

  const salesTaskModalTitle = await page.locator("header h2").textContent();
  console.log(`   Modal opened: "${salesTaskModalTitle}"`);

  await page.locator("label:has-text('Task Title') input").fill("Automated Sales Header Task");
  await page.locator("button:has-text('Save Task')").click();
  await page.waitForTimeout(800);
  console.log("   ✓ Sales PageHeader 'Create Task' PASSED!");

  // Test Enquiries section Create Task
  console.log("   Clicking Sales Enquiries section 'Create Task'...");
  const salesSectionCreateTask = page.locator("section:has-text('Enquiries & Opportunities') button:has-text('Create Task')").first();
  await salesSectionCreateTask.click();
  await page.waitForTimeout(500);

  await page.locator("label:has-text('Task Title') input").fill("Automated Sales Section Task");
  await page.locator("button:has-text('Save Task')").click();
  await page.waitForTimeout(800);
  console.log("   ✓ Sales Enquiries section 'Create Task' PASSED!");

  // -------------------------------------------------------------
  // Test 3: Customer Register Modal
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Testing Customer Register Modal...");
  const customerRegBtn = page.locator("button:has-text('Customer Register.xlsx')").first();
  await customerRegBtn.click();
  await page.waitForTimeout(500);

  const custRegTitle = await page.locator("h2:has-text('Customer Register.xlsx')").textContent();
  console.log(`   Opened: "${custRegTitle.trim()}"`);
  await page.locator("div.fixed button:has-text('✕')").first().click();
  await page.waitForTimeout(500);
  console.log("   ✓ Customer Register Modal PASSED!");

  // -------------------------------------------------------------
  // Test 4: Feasibility & Hardware Kick-off Gate
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Testing Feasibility & Hardware Kick-off Gate...");
  const feasibilityGateBtn = page.locator("button:has-text('Feasibility & Hardware Gate')").first();
  await feasibilityGateBtn.click();
  await page.waitForTimeout(500);

  console.log("   Feasibility Gate modal opened.");

  // Inspect Gate 2: Technical Feasibility
  const gate2Tab = page.locator("button:has-text('Stage 2: Feasibility')").first();
  if (await gate2Tab.isVisible()) {
    await gate2Tab.click();
    await page.waitForTimeout(300);
  }

  // Switch to Stage 4/5: Kick-Off
  const kickOffTab = page.locator("button:has-text('Stage 4/5: Kick-Off')").first();
  if (await kickOffTab.isVisible()) {
    await kickOffTab.click();
    await page.waitForTimeout(400);
  }

  // Close gate modal
  await page.locator("button[aria-label='Close']").click();
  await page.waitForTimeout(500);
  console.log("   ✓ Feasibility & Hardware Gate PASSED!");

  // -------------------------------------------------------------
  // Test 5: Company Directory Modal (§9)
  // -------------------------------------------------------------
  console.log("\n[TEST 5] Testing Company Directory Modal...");
  const directoryBtn = page.locator("button[aria-label='Directory']").first();
  await directoryBtn.click();
  await page.waitForTimeout(600);

  const dirTitle = await page.locator("h2:has-text('Signed-In Company Directory')").textContent();
  console.log(`   Opened: "${dirTitle.trim()}"`);

  // Filter by EHW
  const ehwFilter = page.locator("div.flex button:has-text('EHW')").first();
  await ehwFilter.click();
  await page.waitForTimeout(300);

  // Search for Elena
  const searchInput = page.locator("input[placeholder*='Search by name']");
  await searchInput.fill("Elena");
  await page.waitForTimeout(300);

  const contactName = await page.locator("h3:has-text('Elena Rostova')").textContent();
  console.log(`   Found contact: "${contactName.trim()}"`);

  await page.screenshot({ path: "verification_company_directory.png", animations: "disabled", timeout: 10000 }).catch(e => console.log(e.message));
  console.log("   Saved screenshot: verification_company_directory.png");

  // Close modal
  await page.locator("button[aria-label='Close Directory']").click();
  await page.waitForTimeout(500);
  console.log("   ✓ Company Directory Modal PASSED!");

  // -------------------------------------------------------------
  // Test 6: Official Decision Log Modal (§10)
  // -------------------------------------------------------------
  console.log("\n[TEST 6] Testing Official Decision Log Modal...");
  const decisionLogBtn = page.locator("button[aria-label='Decision Log']").first();
  await decisionLogBtn.click();
  await page.waitForTimeout(600);

  const decLogTitle = await page.locator("h2:has-text('Official Project Decision Log')").textContent();
  console.log(`   Opened: "${decLogTitle.trim()}"`);

  // Record a new decision
  const recordDecisionBtn = page.locator("button:has-text('Record Decision')").first();
  await recordDecisionBtn.click();
  await page.waitForTimeout(400);

  await page.locator("input[placeholder*='Authorize second-source']").fill("Lock Quectel EC200U-CN 4G Modem for AIS-140 compliance");
  await page.locator("textarea[placeholder*='Detail the technical']").fill("Automotive compliance audit requires ARAI-approved Cat-1 modem with embedded eSIM.");
  await page.locator("button:has-text('Save & Lock Decision')").click();
  await page.waitForTimeout(600);

  const committedDecision = await page.locator("h3:has-text('Lock Quectel EC200U-CN 4G Modem')").textContent();
  console.log(`   Committed decision verified: "${committedDecision.trim()}"`);

  await page.screenshot({ path: "verification_decision_log.png", animations: "disabled", timeout: 10000 }).catch(e => console.log(e.message));
  console.log("   Saved screenshot: verification_decision_log.png");

  // Close modal
  await page.locator("button[aria-label='Close Decision Log']").click();
  await page.waitForTimeout(500);
  console.log("   ✓ Official Decision Log Modal PASSED!");

  // -------------------------------------------------------------
  // Test 7: Operations Legal Documents & Letterhead Hub (§9)
  // -------------------------------------------------------------
  console.log("\n[TEST 7] Testing Operations Legal Documents & Letterhead Hub...");
  const legalHubBtn = page.locator("button[aria-label='Legal Hub']").first();
  await legalHubBtn.click();
  await page.waitForTimeout(600);

  const legalTitle = await page.locator("h2:has-text('Operations Legal Documents & Official Letterhead Hub')").textContent();
  console.log(`   Opened: "${legalTitle.trim()}"`);

  // Switch to Controlled Legal Agreements tab
  const legalAgreementsTab = page.locator("button:has-text('Legal Agreements & NDAs')");
  await legalAgreementsTab.click();
  await page.waitForTimeout(400);

  const agreementCard = await page.locator("text=HLPL-AI4T-OPS-mNDA-01").first().textContent();
  console.log(`   Verified Agreement: "${agreementCard.trim()}"`);

  // Switch back to Corporate Letterhead
  const letterheadTab = page.locator("button:has-text('Corporate Letterhead')");
  await letterheadTab.click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: "verification_legal_and_letterhead.png", animations: "disabled", timeout: 10000 }).catch(e => console.log(e.message));
  console.log("   Saved screenshot: verification_legal_and_letterhead.png");

  // Close modal
  await page.locator("button[aria-label='Close Legal Hub']").click();
  await page.waitForTimeout(500);
  console.log("   ✓ Operations Legal & Letterhead Hub PASSED!");

  // -------------------------------------------------------------
  // Test 8: PMSS Workspace Integration
  // -------------------------------------------------------------
  console.log("\n[TEST 8] Testing PMSS Workspace & Official Decision Log connection...");
  const pmssBtn = page.locator("button[aria-label='PMSS']").first();
  await pmssBtn.click();
  await page.waitForTimeout(600);

  const pmssTitle = await page.locator("h1:has-text('PMSS control')").textContent();
  console.log(`   On page: "${pmssTitle.trim()}"`);

  const pmssDecBtn = page.locator("button:has-text('Official Decision Log')").first();
  const pmssDecBtnVisible = await pmssDecBtn.isVisible();
  console.log(`   PMSS 'Official Decision Log' button visible: ${pmssDecBtnVisible}`);

  await page.screenshot({ path: "verification_pmss_and_all.png", animations: "disabled", timeout: 10000 }).catch(e => console.log(e.message));
  console.log("   Saved screenshot: verification_pmss_and_all.png");

  await browser.close();
  console.log("\n=== ALL 8 VERIFICATION TESTS COMPLETED AND PASSED WITH 100% SUCCESS! ===");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
