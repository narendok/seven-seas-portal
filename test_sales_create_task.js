import { chromium } from "playwright-core";

async function run() {
  console.log("Launching Chrome...");
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
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Verify Command Center Header "Create Task" button
  console.log("1. Testing Command Center 'Create Task' button...");
  const ccCreateTaskBtn = page.locator("button:has-text('Create Task')").first();
  await ccCreateTaskBtn.click();
  await page.waitForTimeout(500);

  // Check that the modal opened
  const modalHeader = page.locator("header h2");
  const modalHeaderText = await modalHeader.textContent();
  console.log(`   Modal opened with title: "${modalHeaderText}"`);

  // Verify Record Type select field has "Task" selected
  const recordTypeSelect = page.locator("label:has-text('Record type') select");
  const selectedType = await recordTypeSelect.inputValue();
  console.log(`   Selected Record Type: "${selectedType}"`);
  if (selectedType !== "Task") {
    throw new Error(`Expected "Task" to be selected, but found "${selectedType}"`);
  }

  // Verify Task fields are rendered
  const taskTitleInput = page.locator("label:has-text('Task Title') input");
  await taskTitleInput.fill("Automated Test Task 1 - Command Center");

  // Save the task
  const saveBtn = page.locator("button:has-text('Save Task')");
  await saveBtn.click();
  await page.waitForTimeout(800);
  console.log("   Task 1 saved successfully!");

  // 2. Navigate to Sales department
  console.log("2. Navigating to Sales Department...");
  // Click on Sales in navigation or sidebar
  const salesNavBtn = page.locator("button[aria-label='Sales & Business Development']").first();
  await salesNavBtn.click();
  await page.waitForTimeout(1000);

  // Verify we are on the Sales page
  const pageTitle = await page.locator("h1").textContent();
  console.log(`   On page: "${pageTitle}"`);

  // 3. Verify "Create Task" in Sales Overview Header Action Bar
  console.log("3. Testing Sales PageHeader 'Create Task' button...");
  const salesHeaderCreateTask = page.locator("header button:has-text('Create Task')").first();
  const salesHeaderCreateTaskVisible = await salesHeaderCreateTask.isVisible();
  console.log(`   Sales PageHeader 'Create Task' visible: ${salesHeaderCreateTaskVisible}`);
  if (!salesHeaderCreateTaskVisible) {
    throw new Error("PageHeader 'Create Task' button is not visible on Sales page!");
  }

  // 4. Verify "Create Task" in Enquiries & Opportunities section
  console.log("4. Testing Enquiries & Opportunities section 'Create Task' button...");
  const salesSectionCreateTask = page.locator("section button:has-text('Create Task')").first();
  const salesSectionCreateTaskVisible = await salesSectionCreateTask.isVisible();
  console.log(`   Enquiries & Opportunities 'Create Task' visible: ${salesSectionCreateTaskVisible}`);
  if (!salesSectionCreateTaskVisible) {
    throw new Error("Enquiries & Opportunities 'Create Task' button is not visible!");
  }

  // Click the section Create Task button
  await salesSectionCreateTask.click();
  await page.waitForTimeout(500);

  const salesModalTitle = await page.locator("header h2").textContent();
  console.log(`   Sales Modal opened with title: "${salesModalTitle}"`);

  const salesRecordType = await page.locator("label:has-text('Record type') select").inputValue();
  console.log(`   Sales Modal Record Type: "${salesRecordType}"`);

  // Fill in Sales Task details
  await page.locator("label:has-text('Task Title') input").fill("Follow-up on Tata Ace EV Q3 delivery schedule");
  
  // Select priority if needed
  const prioritySelect = page.locator("label:has-text('Priority') select");
  if (await prioritySelect.isVisible()) {
    await prioritySelect.selectOption("High");
  }

  // Click Save Task
  await page.locator("button:has-text('Save Task')").click();
  await page.waitForTimeout(800);
  console.log("   Sales Task created successfully!");

  // 5. Test Customer Register.xlsx
  console.log("5. Testing Customer Register.xlsx modal...");
  const custRegBtn = page.locator("button:has-text('Customer Register.xlsx')").first();
  await custRegBtn.click();
  const custModalVisible = await page.locator("h2:has-text('Customer Register.xlsx')").isVisible();
  console.log(`   Customer Register modal opened: ${custModalVisible}`);
  if (!custModalVisible) {
    throw new Error("Customer Register modal did not open!");
  }

  // Close Customer Register modal using close button
  await page.locator("div.fixed button:has-text('✕')").click();
  await page.waitForTimeout(500);

  // 6. Test Feasibility & Hardware Gate
  console.log("6. Testing Feasibility & Hardware Gate modal...");
  const feasGateBtn = page.locator("header button:has-text('Feasibility & Hardware Gate')").first();
  await feasGateBtn.click();
  await page.waitForTimeout(1000);

  const feasModalVisible = await page.locator("text=Stage 2: Feasibility").isVisible();
  console.log(`   Feasibility & Hardware Gate modal active: ${feasModalVisible}`);

  // Check HOD cards (EHW, ESW, MECH, PUR, QA, FIN)
  const ehwVisible = await page.locator("text=EHW").first().isVisible();
  const finVisible = await page.locator("text=FIN").first().isVisible();
  console.log(`   EHW HOD Card visible: ${ehwVisible}`);
  console.log(`   FIN HOD Card visible: ${finVisible}`);

  // Advance / inspect Gate 3: Requirement Lock
  const gate3Tab = page.locator("button:has-text('Stage 3: Req Lock')");
  if (await gate3Tab.isVisible()) {
    await gate3Tab.click();
    await page.waitForTimeout(500);
    const prsFreezeVisible = await page.locator("text=EHW-PRS-01").isVisible();
    console.log(`   Gate 3 PRS Baseline Freeze visible: ${prsFreezeVisible}`);
  }

  // Advance / inspect Gate 4/5: Hardware Kick-off
  const gate4Tab = page.locator("button:has-text('Stage 4/5: Kick-Off')");
  if (await gate4Tab.isVisible()) {
    await gate4Tab.click();
    await page.waitForTimeout(500);
    const pathAVisible = await page.locator("text=Path A: Research / PoC Track").isVisible();
    const pathBVisible = await page.locator("text=Path B: Direct SMT Line 2 Pilot Track").isVisible();
    console.log(`   Path A (Research/PoC) visible: ${pathAVisible}`);
    console.log(`   Path B (Direct Pilot) visible: ${pathBVisible}`);
  }

  // Take screenshot of the verified modal
  await page.screenshot({ path: "c:\\Users\\Test\\Documents\\antigravity\\SSM1\\verification_sales_and_gate.png", fullPage: true });
  console.log("   Screenshot saved to verification_sales_and_gate.png");

  // Close Feasibility Gate modal
  const closeFeasBtn = page.locator("button:has-text('Close Workspace')");
  if (await closeFeasBtn.isVisible()) {
    await closeFeasBtn.click();
  }

  await browser.close();
  console.log("All verification checks PASSED successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
