import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

(async () => {
  console.log("=== Testing All-in-One Shared Analysis (Page 1) Project Workspace ===");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1500, height: 1100 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser Error]: ${msg.text()}`);
    }
  });

  console.log("Navigating to http://localhost:8080/...");
  await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector("header", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // 1. Click "Project Analysis (Page 1)" in Header or Command Center
  console.log("Opening Project Analysis (Page 1)...");
  const page1Btn = page.locator("button:has-text('Project Analysis (Page 1)')").first();
  await page1Btn.waitFor({ state: "visible", timeout: 10000 });
  await page1Btn.click();
  await page.waitForTimeout(1000);

  // 2. Verify Page 1 View & KPI Summary Strip
  console.log("Verifying Page 1 View and KPI summary...");
  await page.locator("text=All-in-One Shared Analysis & Cross-Department Matrix (Page 1 View)").waitFor({ state: "visible", timeout: 10000 });
  await page.locator("text=Total Completion").first().waitFor({ state: "visible" });
  await page.locator("text=Completed").first().waitFor({ state: "visible" });
  await page.locator("text=On Track").first().waitFor({ state: "visible" });
  await page.locator("text=Needs Attention").first().waitFor({ state: "visible" });
  await page.locator("text=Current Gate").first().waitFor({ state: "visible" });
  console.log("Executive KPI strip verified.");

  // 3. Verify Department Cards & Dual Remarks Separation
  console.log("Verifying 11-Department Analysis Cards & Remarks separation...");
  await page.locator("strong:has-text('Embedded Hardware Engineering')").first().waitFor({ state: "visible" });
  await page.locator("strong:has-text('Firmware & Software Engineering')").first().waitFor({ state: "visible" });
  await page.locator("strong:has-text('Quality Assurance & APQP')").first().waitFor({ state: "visible" });
  await page.locator("text=Internal Remarks · Company-Confidential").first().waitFor({ state: "visible" });
  await page.locator("text=Client's Remarks · Shared OEM Status").first().waitFor({ state: "visible" });
  console.log("All department cards & dual remarks verified on Page 1.");

  // 4. Test Tab 2: Department Focus & Documentation
  console.log("Testing Tab 2: Department Focus & Documentation...");
  const deptFocusTab = page.locator("button:has-text('Department Focus & Documentation')").first();
  await deptFocusTab.click();
  await page.waitForTimeout(800);

  await page.locator("text=Department Focus & Editable Engineering Workspace").waitFor({ state: "visible" });
  await page.locator("text=Internal Remarks (Company-Confidential)").waitFor({ state: "visible" });
  await page.locator("text=Client's Remarks (Customer-Facing Report)").waitFor({ state: "visible" });

  // Select EHW pill
  const ehwBtn = page.locator("button.h-8:has-text('EHW')").first();
  await ehwBtn.click();
  await page.waitForTimeout(400);

  // Update client remarks
  const clientTextarea = page.locator("textarea").nth(1);
  await clientTextarea.fill("ARAI Type Approval compliance verified. Final TAC certificate ready for OEM client release.");
  
  // Click Save button
  const saveBtn = page.locator("button:has-text('Save Department Analysis & Remarks')").first();
  await saveBtn.click();
  await page.waitForTimeout(600);
  console.log("Saved updated EHW department analysis.");

  // 5. Test Tab 3: Client Preview & Share Link
  console.log("Testing Tab 3: Client Preview & Share Link...");
  const clientTab = page.locator("button:has-text('Client Preview & Share Link')").first();
  await clientTab.click();
  await page.waitForTimeout(800);

  await page.locator("text=HEXENSE LABS · OEM CUSTOMER PORTAL").waitFor({ state: "visible" });
  await page.locator("text=Client-Safe Filter Active").waitFor({ state: "visible" });
  await page.locator("text=ARAI Type Approval compliance verified").waitFor({ state: "visible" });

  // Test Copy Client Link button
  const copyBtn = page.locator("button:has-text('Copy Client Link')").first();
  await copyBtn.click();
  await page.waitForTimeout(400);
  await page.locator("text=Copied to Clipboard!").waitFor({ state: "visible" });
  console.log("Verified share link copy functionality.");

  // Test Customer Acknowledgment
  const ackBtn = page.locator("button:has-text('Acknowledge Milestone & Sign Off')").first();
  await ackBtn.click();
  await page.waitForTimeout(600);
  await page.locator("text=Milestone Acknowledged").first().waitFor({ state: "visible" });
  console.log("Verified customer milestone acknowledgment.");

  // 6. Return to Tab 1 (All-in-One Shared Analysis) for full capture
  console.log("Returning to Tab 1 (All-in-One Shared Analysis) for high-res screenshot capture...");
  const sharedTab = page.locator("button:has-text('All-in-One Shared Analysis (Page 1)')").first();
  await sharedTab.click();
  await page.waitForTimeout(800);

  const screenshotPath = path.resolve("verification_project_shared_analysis.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot captured at: ${screenshotPath}`);

  // Copy to brain artifacts
  const artifactDir = "C:\\Users\\Test\\.gemini\\antigravity\\brain\\6d04f0e9-84df-447a-b730-a00e292ef167";
  const targetPath = path.join(artifactDir, "verification_project_shared_analysis.png");
  fs.copyFileSync(screenshotPath, targetPath);
  console.log(`Screenshot copied to artifact dir: ${targetPath}`);

  await browser.close();
  console.log("=== Verification Successful! ===");
})();
