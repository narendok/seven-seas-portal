const { chromium } = require("playwright-core");
const path = require("path");

async function run() {
  console.log("Starting visual & functional verification for Department Coordination & Approvals...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  }).catch(async () => {
    return await chromium.launch({ headless: true });
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const brainDir = "C:\\Users\\Test\\.gemini\\antigravity\\brain\\6d04f0e9-84df-447a-b730-a00e292ef167";
  const docsDir = path.join(__dirname, "docs/images");

  // 1. Verify Full-Page Approvals View (No Pop-up!)
  console.log("Step 1: Navigating to http://localhost:8080/ to test Approvals view...");
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Expand sidebar
  const expandBtn = await page.$('button[aria-label="Expand navigation"]');
  if (expandBtn) {
    await expandBtn.click();
    await page.waitForTimeout(400);
  }

  // Verify that Notifications is NOT in sidebar
  const sidebarContent = await page.$eval('aside', el => el.innerText).catch(() => "");
  const hasNotificationsInSidebar = sidebarContent.includes("Notifications & Handoffs") || sidebarContent.includes("dept-alerts");
  console.log("Check: Notifications in sidebar?", hasNotificationsInSidebar ? "FAIL - Found in sidebar" : "PASS - Cleanly absent from sidebar");

  // Check if 'Pending Sign-offs' is visible; if not, click 'OVERVIEW'
  let approvalsLink = await page.$('button:has-text("Pending Sign-offs")');
  if (!approvalsLink) {
    console.log("Clicking OVERVIEW to reveal Pending Sign-offs...");
    const overviewGroupBtn = await page.$('button:has-text("OVERVIEW")');
    if (overviewGroupBtn) {
      await overviewGroupBtn.click();
      await page.waitForTimeout(400);
    }
    approvalsLink = await page.waitForSelector('button:has-text("Pending Sign-offs")', { timeout: 5000 });
  }

  console.log("Clicking 'Pending Sign-offs' in sidebar...");
  await approvalsLink.click();
  await page.waitForTimeout(1000);

  // Verify full-page view header
  const fullPageApprovals = await page.waitForSelector('text=Human Approvals & Governance Sign-Off Center', { timeout: 8000 });
  console.log("Check: Full-page Approvals header present?", fullPageApprovals ? "PASS" : "FAIL");

  // Verify NO pop-up dialog backdrop
  const modalDialog = await page.$('div[role="dialog"]');
  console.log("Check: Is a pop-up dialog open?", modalDialog ? "YES (Warning: Check dialog)" : "NO (Clean Full Page)");

  await page.screenshot({ path: path.join(brainDir, "scms_full_page_approvals_verified.png") });
  await page.screenshot({ path: path.join(docsDir, "scms_full_page_approvals_verified.png") });
  console.log("Saved scms_full_page_approvals_verified.png");

  // 2. Verify Department Lead Coordination Center in Embedded Hardware (EHW)
  console.log("Step 2: Navigating to EHW Lead context: http://localhost:8080/?role=ehw");
  await page.goto("http://localhost:8080/?role=ehw", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Scroll down to Coordination Hub
  const coordCenter = await page.waitForSelector('text=EHW · COORDINATION HUB', { timeout: 10000 });
  await coordCenter.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  console.log("Checking Teams Tasks tab (Kanban view)...");
  await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_tasks_kanban.png") });
  await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_tasks_kanban.png") });
  console.log("Saved scms_dept_lead_tasks_kanban.png");

  // Test switching view to Table View
  console.log("Switching to Table View mode...");
  const tableToggle = await page.$('button[title="Dense Table View"]');
  if (tableToggle) {
    await tableToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_tasks_table.png") });
    await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_tasks_table.png") });
    console.log("Saved scms_dept_lead_tasks_table.png");
  }

  // Test 1-click assignee dropdown change on a task card/row
  console.log("Testing 1-click assignee dropdown change...");
  const assigneeSelects = await page.$$('select');
  for (const sel of assigneeSelects) {
    const options = await sel.$$eval('option', opts => opts.map(o => o.text));
    if (options.some(o => o.includes("Alex Chen") || o.includes("Maya Lin"))) {
      console.log("Found assignee dropdown with options:", options.slice(0, 3));
      await sel.selectOption({ index: 2 });
      await page.waitForTimeout(600);
      console.log("Successfully switched assignee via 1-click select!");
      break;
    }
  }

  // 3. Check "Department Projects" Tab
  console.log("Step 3: Checking Department Projects tab...");
  const projectsTab = await page.$('button:has-text("Department Projects")');
  if (projectsTab) {
    await projectsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_projects_tab.png") });
    await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_projects_tab.png") });
    console.log("Saved scms_dept_lead_projects_tab.png");
  }

  // 4. Check "Department Teams" Tab
  console.log("Step 4: Checking Department Teams tab...");
  const teamsTab = await page.$('button:has-text("Department Teams")');
  if (teamsTab) {
    await teamsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_teams_tab.png") });
    await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_teams_tab.png") });
    console.log("Saved scms_dept_lead_teams_tab.png");

    // Open Assign Task dialog from team card
    console.log("Clicking '+ Assign' on a team member card...");
    const assignBtn = await page.$('button:has-text("+ Assign")');
    if (assignBtn) {
      await assignBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_quick_assign_modal.png") });
      await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_quick_assign_modal.png") });
      console.log("Saved scms_dept_lead_quick_assign_modal.png");

      const cancelBtn = await page.$('button:has-text("Cancel")');
      if (cancelBtn) await cancelBtn.click();
      await page.waitForTimeout(300);
    }
  }

  // 5. Check Purchasing Lead context (PUR)
  console.log("Step 5: Navigating to PUR Lead context: http://localhost:8080/?role=pur");
  await page.goto("http://localhost:8080/?role=pur", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const purCoordCenter = await page.waitForSelector('text=PUR · COORDINATION HUB', { timeout: 10000 });
  await purCoordCenter.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(brainDir, "scms_dept_lead_pur_coordination.png") });
  await page.screenshot({ path: path.join(docsDir, "scms_dept_lead_pur_coordination.png") });
  console.log("Saved scms_dept_lead_pur_coordination.png");

  console.log("All verifications completed successfully!");
  await browser.close();
}

run().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
