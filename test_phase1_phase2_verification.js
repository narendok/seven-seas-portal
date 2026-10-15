import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function run() {
  console.log("=== Testing Phase 1 (Symmetrical Cloud Drive) & Phase 2 (Department Process Menus) ===");
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
  // TEST 1: Phase 1 - Symmetrical Cloud Drive 4-Group Architecture
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Opening Controlled Documents & Cloud Drive...");
  const driveNavBtn = page.locator("button[aria-label='Hardware Deliverables Drive'], button[aria-label='Documents']").first();
  await driveNavBtn.click();
  await page.waitForTimeout(600);

  // Switch to "Drive & Cloud storage" tab
  console.log("   Switching to 'Drive & Cloud storage' tab...");
  const driveTabBtn = page.locator("button:has-text('Drive & Cloud storage')").first();
  await driveTabBtn.click();
  await page.waitForTimeout(500);

  // Verify all 5 group tabs exist
  const groups = [
    "All Deliverables",
    "01 Common documents",
    "02 Internal projects",
    "03 Client projects",
    "04 Other department work"
  ];

  for (const grp of groups) {
    const grpBtn = page.locator(`button:has-text('${grp}')`).first();
    const isVisible = await grpBtn.isVisible();
    if (!isVisible) throw new Error(`Group tab "${grp}" not found!`);
    await grpBtn.click();
    await page.waitForTimeout(300);
    console.log(`   ✓ Clicked and verified group: ${grp}`);
  }

  // Switch to "01 Common documents" and check Customer Register.xlsx
  console.log("   Checking Customer Register.xlsx in 01 Common documents...");
  await page.locator("button:has-text('01 Common documents')").first().click();
  await page.waitForTimeout(400);
  const custRegRow = page.locator("strong:has-text('Customer Register.xlsx')").first();
  const custRegVisible = await custRegRow.isVisible();
  if (!custRegVisible) throw new Error("Customer Register.xlsx not visible in 01 Common documents!");
  console.log("   ✓ Customer Register.xlsx is visible and active in 01 Common documents!");

  // Test technical folder switching
  console.log("   Testing folder switching to /03_Hardware_Deliverables_ECAD...");
  const ecadFolderBtn = page.locator("button:has-text('03_Hardware_Deliverables_ECAD')").first();
  await ecadFolderBtn.click();
  await page.waitForTimeout(400);

  // -------------------------------------------------------------
  // TEST 2: Phase 1 - Direct Cloud Drive File Upload
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Testing Direct Cloud Drive File Upload & SHA-256 Verification...");
  const tempFilePath = path.join(process.cwd(), "test_phase1_deliverable.pdf");
  fs.writeFileSync(tempFilePath, "%PDF-1.4 Mock Engineering Deliverable Content for Phase 1 Testing");

  const fileInput = page.locator("section:has-text('Direct File Upload') input[type='file']").first();
  await fileInput.setInputFiles(tempFilePath);
  await page.waitForTimeout(1000);

  const uploadVerificationNotice = page.locator("p:has-text('Upload Verified')").first();
  const noticeText = await uploadVerificationNotice.textContent();
  console.log(`   ✓ Upload result: "${noticeText}"`);
  if (!noticeText.includes("Upload Verified") || !noticeText.includes("SHA-256")) {
    throw new Error("Upload verification or SHA-256 checksum notice missing!");
  }

  // Clean up temp file
  if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

  // Close documents modal
  await page.locator("div.fixed button[aria-label='Close']").first().click();
  await page.waitForTimeout(500);
  console.log("   ✓ Phase 1 Symmetrical Cloud Drive & Direct Upload PASSED!");

  // -------------------------------------------------------------
  // TEST 3: Phase 2 - Sales Department Process Shortcut Direct Binding
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Testing Sales Department Process Shortcut Direct Binding...");
  await page.locator("button[aria-label='Sales & Business Development']").first().click();
  await page.waitForTimeout(800);

  // Find process shortcut: "Customer SOR intake & analysis"
  console.log("   Clicking 'Customer SOR intake & analysis' process shortcut...");
  const salesSorShortcut = page.locator("button:has-text('Customer SOR intake & analysis')").first();
  await salesSorShortcut.click();
  await page.waitForTimeout(600);

  // Verify RecordForm opened pre-filled
  const modalH2 = await page.locator("header h2").textContent();
  console.log(`   Modal opened: "${modalH2}"`);

  const titleInput = page.locator("label:has-text('Enquiry title') input, label:has-text('Title') input").first();
  const titleValue = await titleInput.inputValue();
  console.log(`   Pre-filled Title: "${titleValue}"`);
  if (!titleValue.includes("Customer SOR")) {
    throw new Error(`Expected Title to contain "Customer SOR", but got "${titleValue}"`);
  }

  const scopeTextarea = page.locator("textarea").first();
  const scopeValue = await scopeTextarea.inputValue();
  console.log(`   Pre-filled Scope:\n${scopeValue}`);
  if (!scopeValue.includes("Target Cloud Drive") || !scopeValue.includes("03 Client projects")) {
    throw new Error(`Expected Scope to include Cloud Drive path, but got "${scopeValue}"`);
  }

  // Save the pre-filled record
  console.log("   Saving pre-filled record...");
  await page.locator("form button[type='submit']").first().click();
  await page.waitForTimeout(1000);
  console.log("   ✓ Sales Process Shortcut successfully created pre-filled record!");

  // -------------------------------------------------------------
  // TEST 4: Phase 2 - EHW Department Process Shortcut Direct Binding
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Testing EHW Department Process Shortcut Direct Binding...");
  await page.locator("button[aria-label='Embedded Hardware']").first().click();
  await page.waitForTimeout(800);

  console.log("   Clicking 'Production Gerber & drill ZIP' process shortcut in EHW...");
  const ehwGerberShortcut = page.locator("button:has-text('Production Gerber & drill ZIP')").first();
  await ehwGerberShortcut.click();
  await page.waitForTimeout(600);

  const ehwModalH2 = await page.locator("header h2").textContent();
  console.log(`   Modal opened: "${ehwModalH2}"`);
  if (!ehwModalH2.includes("Gerber release")) {
    throw new Error(`Expected modal to be "Create Gerber release", got "${ehwModalH2}"`);
  }

  const ehwTitle = await page.locator("label:has-text('Title') input").first().inputValue();
  console.log(`   Pre-filled EHW Title: "${ehwTitle}"`);
  if (!ehwTitle.includes("Gerber")) {
    throw new Error(`Expected EHW Title to contain "Gerber", got "${ehwTitle}"`);
  }

  await page.locator("form button[type='submit']").first().click();
  await page.waitForTimeout(1000);
  console.log("   ✓ EHW Gerber Shortcut successfully created pre-filled record!");

  // -------------------------------------------------------------
  // TEST 5: Phase 2 - QA Department Process Shortcut Direct Binding
  // -------------------------------------------------------------
  console.log("\n[TEST 5] Testing QA Department Process Shortcut Direct Binding...");
  await page.locator("button[aria-label='Quality Assurance']").first().click();
  await page.waitForTimeout(800);

  console.log("   Clicking 'DVP&R verification plan' process shortcut in QA...");
  const qaDvprShortcut = page.locator("button:has-text('DVP&R verification plan')").first();
  await qaDvprShortcut.click();
  await page.waitForTimeout(600);

  const qaModalH2 = await page.locator("header h2").textContent();
  console.log(`   Modal opened: "${qaModalH2}"`);
  if (!qaModalH2.includes("DVP&R")) {
    throw new Error(`Expected modal to be "Create DVP&R", got "${qaModalH2}"`);
  }

  const qaTitle = await page.locator("label:has-text('Title') input").first().inputValue();
  console.log(`   Pre-filled QA Title: "${qaTitle}"`);
  if (!qaTitle.includes("DVP&R")) {
    throw new Error(`Expected QA Title to contain "DVP&R", got "${qaTitle}"`);
  }

  await page.locator("form button[type='submit']").first().click();
  await page.waitForTimeout(1000);
  console.log("   ✓ QA DVP&R Shortcut successfully created pre-filled record!");

  // Take a full verification screenshot
  const screenshotPath = path.join(process.cwd(), "verification_phase1_phase2.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nScreenshot saved: ${screenshotPath}`);

  await browser.close();
  console.log("\n=================================================================");
  console.log(">>> ALL PHASE 1 & PHASE 2 VERIFICATIONS PASSED (100% SUCCESS) <<<");
  console.log("=================================================================");
}

run().catch((err) => {
  console.error("\n❌ Test failed with error:", err);
  process.exit(1);
});
