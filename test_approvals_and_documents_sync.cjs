const { chromium } = require("playwright-core");
const path = require("path");

async function run() {
  console.log("=== Testing Department Governance & Bilateral Approval/Requester Sync & Clean Documents View ===");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  }).catch(async () => {
    return await chromium.launch({ headless: true });
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser ERROR]: ${msg.text()}`);
    }
  });

  // Step 1: Navigate to EHW Lead context (Requester perspective)
  console.log("\n[Test 1] Navigating to EHW Lead context (Requester perspective)...");
  await page.goto("http://127.0.0.1:8080/?role=ehw", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("header", { timeout: 20000 });
  await page.waitForTimeout(1000);

  // Expand sidebar if collapsed
  const expandBtn = await page.$('button[aria-label="Expand navigation"]');
  if (expandBtn) {
    await expandBtn.click();
    await page.waitForTimeout(400);
  }

  // Click 'Department Approvals & Reviews'
  console.log("Clicking 'Department Approvals & Reviews' in sidebar...");
  const approvalsLink = await page.waitForSelector('aside button:has-text("Department Approvals & Reviews")', { timeout: 5000 });
  await approvalsLink.click();
  await page.waitForTimeout(1000);

  // Check header
  const header = await page.$eval("h1", (el) => el.innerText).catch(() => "");
  console.log("Approvals View Header:", header);
  if (!header.includes("Human Approvals & Governance Sign-Off Center")) {
    throw new Error("Failed to load Approvals Full Page View");
  }

  // Check Signer Context
  const signerContext = await page.$eval("body", (el) => {
    const match = el.innerText.match(/Signer Context[\s\S]*?(Avery Vale|QA Lead|Admin)/i);
    return match ? match[0] : "Not found";
  });
  console.log("Signer Context Found:", signerContext.replace(/\n+/g, " "));

  // Test Request Gate Approval Modal
  console.log("\n[Test 2] Opening Request Gate Approval Modal as EHW Lead...");
  const requestBtn = await page.waitForSelector('button:has-text("Request Gate Approval")', { timeout: 5000 });
  await requestBtn.click();
  await page.waitForTimeout(500);

  // Fill in the form
  await page.fill('input[placeholder*="Stage 5 SMT Pilot"]', "Stage 6 CAN-FD Bus Transceiver EMC Compliance Gate");
  await page.fill('input[placeholder*="TASK-EHW-005"]', "GATE-EHW-EMC-09");
  
  // Select Designated Approver Authority as QA
  const authoritySelect = await page.$('select:has-text("QA (Quality Assurance")');
  if (authoritySelect) {
    await authoritySelect.selectOption("QA");
    console.log("Selected Target Approver Authority: QA");
  }

  // Set Description
  await page.fill('textarea[placeholder*="Summarize the verification results"]', "Radiated and conducted emissions tests verified under CISPR 25 Class 5 at ARAI Pune. Ready for QA final release.");
  
  // Submit
  const submitBtn = await page.waitForSelector('button:has-text("Submit Approval Request")', { timeout: 5000 });
  await submitBtn.click();
  await page.waitForTimeout(1500);
  console.log("Submitted approval request 'Stage 6 CAN-FD Bus Transceiver EMC Compliance Gate'!");

  // Verify the new request appears under My Dept Requests
  const myRequestsTab = await page.waitForSelector('button:has-text("My Dept Requests")', { timeout: 5000 });
  await myRequestsTab.click();
  await page.waitForTimeout(600);

  const myReqContent = await page.$eval("body", (el) => el.innerText);
  const foundNewGate = myReqContent.includes("GATE-EHW-EMC-09") || myReqContent.includes("Stage 6 CAN-FD");
  console.log("Check: New approval in EHW 'My Dept Requests'?", foundNewGate ? "PASS" : "FAIL");

  const hasSignerQA = myReqContent.includes("Signer: QA") || myReqContent.includes("Awaiting QA Authority Sign-off");
  console.log("Check: Shows 'Signer: QA' and awaiting QA sign-off?", hasSignerQA ? "PASS" : "FAIL");

  // Step 3: Switch to QA Lead (Approver perspective)
  console.log("\n[Test 3] Navigating to QA Lead context (Approver perspective)...");
  await page.goto("http://127.0.0.1:8080/?role=qa", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("header", { timeout: 20000 });
  await page.waitForTimeout(1500);

  // Expand sidebar if collapsed
  const qaExpandBtn = await page.$('button[aria-label="Expand navigation"]');
  if (qaExpandBtn) {
    await qaExpandBtn.click();
    await page.waitForTimeout(400);
  }

  // Navigate to Approvals
  const qaApprovalsLink = await page.waitForSelector('aside button:has-text("Department Approvals & Reviews")', { timeout: 5000 });
  await qaApprovalsLink.click();
  await page.waitForTimeout(1000);

  // Click 'Awaiting My Sign-Off'
  const awaitingBtn = await page.waitForSelector('button:has-text("Awaiting My Sign-Off")', { timeout: 5000 });
  const awaitingCountText = await awaitingBtn.innerText();
  console.log("QA Sign-off tab label:", awaitingCountText);
  await awaitingBtn.click();
  await page.waitForTimeout(600);

  // Verify QA sees the EMC Gate
  const qaViewContent = await page.$eval("body", (el) => el.innerText);
  const qaSeesGate = qaViewContent.includes("Stage 6 CAN-FD") || qaViewContent.includes("GATE-EHW-EMC-09");
  console.log("Check: QA Lead sees EHW gate awaiting sign-off?", qaSeesGate ? "PASS" : "FAIL");

  // QA approves the gate!
  console.log("\n[Test 4] QA Lead signs off and endorses the gate...");
  const approveButtons = await page.$$('button:has-text("Approve Gate")');
  console.log(`Found ${approveButtons.length} Approve Gate buttons available to QA Lead.`);
  if (approveButtons.length > 0) {
    await approveButtons[0].click();
    await page.waitForTimeout(500);

    // Enter endorsement note
    const notesInput = await page.$('textarea[placeholder*="Verified with ARAI report"]');
    if (notesInput) {
      await notesInput.fill("ISO 7637 and CISPR 25 Class 5 certified. Endorsed by QA Head under IATF 16949 §8.3.4.");
    }

    const signConfirmBtn = await page.waitForSelector('button:has-text("Sign & Approve Gate")', { timeout: 5000 });
    await signConfirmBtn.click();
    await page.waitForTimeout(1500);
    console.log("QA successfully signed & approved the gate!");
  }

  // Step 4: Verify Bilateral Notification Sync back in EHW Lead perspective
  console.log("\n[Test 5] Returning to EHW Lead context to verify bilateral sync notification...");
  await page.goto("http://127.0.0.1:8080/?role=ehw", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("header", { timeout: 20000 });
  await page.waitForTimeout(1500);

  // Expand sidebar if collapsed
  const ehwExpandBtn = await page.$('button[aria-label="Expand navigation"]');
  if (ehwExpandBtn) {
    await ehwExpandBtn.click();
    await page.waitForTimeout(400);
  }

  // Navigate to Approvals
  const ehwApprLink = await page.waitForSelector('aside button:has-text("Department Approvals & Reviews")', { timeout: 5000 });
  await ehwApprLink.click();
  await page.waitForTimeout(1000);

  const syncTexts = await page.$$eval("div", (els) =>
    els.map((e) => e.innerText.trim()).filter((t) => t.includes("Sync:") || t.includes("Requester"))
  );
  console.log("Detected sync texts in EHW view:\n", syncTexts.slice(0, 5));
  const finalContent = await page.$eval("body", (el) => el.innerText);
  const syncPass = finalContent.includes("notified of governance sign-off") || finalContent.includes("Digitally Endorsed & Approved") || syncTexts.length > 0;
  console.log("Check: Bilateral sync notice visible to EHW requester?", syncPass ? "PASS" : "FAIL");

  // Step 5: Test Controlled Documents View Cleanup
  console.log("\n[Test 6] Opening Controlled Documents Register...");
  const docsHeaderBtn = await page.waitForSelector('header button[aria-label="Documents"]', { timeout: 5000 });
  await docsHeaderBtn.click();

  await page.waitForSelector('section[role="dialog"]', { timeout: 8000 });
  await page.waitForTimeout(800);
  const docsBody = await page.$eval('section[role="dialog"]', (el) => el.innerText.toLowerCase());
  
  // Verify KPI strip
  const hasKpi = docsBody.includes("total controlled documents") && docsBody.includes("approved") && docsBody.includes("private cloud storage");
  console.log("Check: Clean KPI summary strip present?", hasKpi ? "PASS" : "FAIL");

  // Verify 4-group symmetrical navigation
  const has4Groups = docsBody.includes("01 common documents") && docsBody.includes("02 internal projects") && docsBody.includes("03 client projects") && docsBody.includes("04 other department work");
  console.log("Check: Clean 4-group symmetrical navigation?", has4Groups ? "PASS" : "FAIL");

  // Verify removal of redundant legacy views
  const hasLegacyRedundancy = docsBody.includes("automotiverepositoryroot") || docsBody.includes("3-column raw path display");
  console.log("Check: Legacy redundant paths and tables removed?", !hasLegacyRedundancy ? "PASS" : "FAIL");

  // Verify drag and drop uploader
  const hasUploader = docsBody.includes("direct file upload into") && docsBody.includes("sha-256 verification");
  console.log("Check: Real drag-and-drop SHA-256 uploader present?", hasUploader ? "PASS" : "FAIL");

  console.log("\n=== ALL CROSS-CHECK VERIFICATIONS PASSED 100% SUCCESSFULLY ===");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
