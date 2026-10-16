import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

(async () => {
  console.log("=== Phase 3 Verification: Supabase Shared Persistence & Cloud Sync ===");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

  // 1. Click "Cloud & Supabase Sync" header action or button in Command Center
  console.log("Looking for Cloud & Supabase Sync button...");
  const cloudSyncHeaderBtn = page.locator("button:has-text('Cloud & Supabase Sync')").first();
  await cloudSyncHeaderBtn.waitFor({ state: "visible", timeout: 10000 });
  await cloudSyncHeaderBtn.click();
  console.log("Clicked Cloud & Supabase Sync button.");

  // 2. Verify modal opened with Cloud & Supabase Sync tab active
  const modalTitle = page.locator("h2:has-text('Administration command center')");
  await modalTitle.waitFor({ state: "visible", timeout: 5000 });
  console.log("Administration command center modal is open.");

  const cloudTab = page.locator("button:has-text('Cloud & Supabase Sync')").nth(1);
  await cloudTab.waitFor({ state: "visible", timeout: 5000 });
  console.log("Cloud & Supabase Sync tab is active.");

  // 3. Verify CloudSyncPanel elements
  await page.locator("text=Supabase Shared Persistence & Cloud Sync").waitFor({ state: "visible" });
  await page.locator("text=rzskhndweihuczbdhoxk").first().waitFor({ state: "visible" });
  await page.locator("text=Dual-Track Persistence Architecture").waitFor({ state: "visible" });
  console.log("Verified CloudSyncPanel structure and telemetry cards.");

  // 4. Test "Test Supabase Connection"
  console.log("Testing Supabase Connection ping...");
  const pingBtn = page.locator("button:has-text('Test Supabase Connection')");
  await pingBtn.click();
  await page.waitForTimeout(1000);
  const statusBadge = page.locator("text=Connected").first();
  await statusBadge.waitFor({ state: "visible", timeout: 5000 });
  console.log("Supabase connection ping verified: Connected status displayed.");

  // 5. Test "Sync Local State to Cloud"
  console.log("Testing Sync Local State to Cloud...");
  const syncBtn = page.locator("button:has-text('Sync Local State to Cloud')");
  await syncBtn.click();
  await page.waitForTimeout(1200);
  const syncSuccessAlert = page.locator("text=Sync Successful");
  await syncSuccessAlert.waitFor({ state: "visible", timeout: 5000 });
  console.log("Cloud sync execution verified: Sync Successful banner displayed.");

  // 6. Capture high-res screenshot
  const screenshotPath = path.resolve("verification_phase3_supabase_cloud_sync.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log("Captured verification screenshot at:", screenshotPath);

  // Copy to artifact directory
  const artifactDir = "C:\\Users\\Test\\.gemini\\antigravity\\brain\\6d04f0e9-84df-447a-b730-a00e292ef167";
  if (fs.existsSync(artifactDir)) {
    const targetPath = path.join(artifactDir, "verification_phase3_supabase_cloud_sync.png");
    fs.copyFileSync(screenshotPath, targetPath);
    console.log("Copied screenshot to artifact directory:", targetPath);
  }

  await browser.close();
  console.log("Phase 3 Supabase Shared Persistence & Cloud Sync verification PASSED!");
})();
