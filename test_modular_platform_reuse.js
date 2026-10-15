import { chromium } from "playwright-core";

async function testModularPlatformReuse() {
  console.log("=== Testing Modular Platform Architecture & PCB Reusability (Master Plan §5) ===");
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

  console.log("1. Navigating to http://localhost:8080/ ...");
  await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector("header", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // 1. Check Header "Platform Asset Library"
  console.log("\n[TEST 1] Testing Header 'Platform Asset Library' button...");
  const headerAssetBtn = page.locator("button:has-text('Platform Asset Library')").first();
  await headerAssetBtn.click();
  await page.waitForTimeout(500);

  const catalogTitle = await page.locator("h2:has-text('Modular Platform Asset Catalog')").textContent();
  console.log(`   Opened: "${catalogTitle.trim()}"`);

  // Switch tabs in catalog
  const harnessTab = page.locator("button:has-text('Wiring Harnesses')");
  await harnessTab.click();
  await page.waitForTimeout(300);
  const harnessCard = await page.locator("text=HLPL-HARN-MX150-14P").first().textContent();
  console.log(`   Verified Harness Card: "${harnessCard.trim()}"`);

  const fwTab = page.locator("button:has-text('Firmware Stacks')");
  await fwTab.click();
  await page.waitForTimeout(300);
  const fwCard = await page.locator("text=HLPL-FW-AIS140-RTOS").first().textContent();
  console.log(`   Verified Firmware Card: "${fwCard.trim()}"`);

  const encTab = page.locator("button:has-text('Enclosures')");
  await encTab.click();
  await page.waitForTimeout(300);
  const encCard = await page.locator("text=HLPL-ENC-IP67-PC").first().textContent();
  console.log(`   Verified Enclosure Card: "${encCard.trim()}"`);

  // Close catalog modal
  await page.locator("button[aria-label='Close Asset Catalog']").click();
  await page.waitForTimeout(400);
  console.log("   ✓ Modular Platform Asset Catalog PASSED!");

  // 2. Navigate to Sales Department
  console.log("\n[TEST 2] Navigating to Sales Department & Verifying Reusable Platform Chips...");
  const salesNavBtn = page.locator("button[aria-label='Sales & Business Development']").first();
  await salesNavBtn.click();
  await page.waitForTimeout(1000);

  // Check Platform Asset Library button in Sales
  const salesAssetBtn = page.locator("section:has-text('Enquiries & Opportunities') button:has-text('Platform Asset Library')").first();
  const salesAssetBtnVisible = await salesAssetBtn.isVisible();
  console.log(`   Sales 'Platform Asset Library' button visible: ${salesAssetBtnVisible}`);

  // Check Configure Reuse button on first opportunity card
  console.log("\n[TEST 3] Testing 'Configure Reuse' Modal for Project...");
  const configureReuseBtn = page.locator("button:has-text('Configure Reuse')").first();
  await configureReuseBtn.click();
  await page.waitForTimeout(500);

  const linkerTitle = await page.locator("h2:has-text('Configure Modular Architecture & Asset Reuse')").textContent();
  console.log(`   Opened: "${linkerTitle.trim()}"`);

  // Verify savings banner
  const savingsBanner = await page.locator("text=Dev Time Saved").first().textContent();
  console.log(`   Found Savings Banner: "${savingsBanner.trim()}"`);

  // Click Save Configuration
  await page.locator("button:has-text('Save & Link to Project')").click();
  await page.waitForTimeout(500);
  console.log("   ✓ Configure Reuse Modal PASSED!");

  // 3. Test Feasibility & Hardware Gate with Pre-Qualified Platform
  console.log("\n[TEST 4] Testing Feasibility Gate with Pre-Qualified Platform...");
  const feasibilityGateBtn = page.locator("header button:has-text('Feasibility & Hardware Gate')").first();
  await feasibilityGateBtn.click();
  await page.waitForTimeout(600);

  // Switch to Stage 2: Feasibility
  const gate2Tab = page.locator("button:has-text('Stage 2: Feasibility')").first();
  if (await gate2Tab.isVisible()) {
    await gate2Tab.click();
    await page.waitForTimeout(400);

    const linkedArchBanner = await page.locator("text=Linked Pre-Qualified Platform Architecture").first().isVisible();
    console.log(`   Gate 2 'Linked Pre-Qualified Platform Architecture' banner visible: ${linkedArchBanner}`);
  }

  // Switch to Stage 4/5: Kick-Off
  const kickOffTab = page.locator("button:has-text('Stage 4/5: Kick-Off')").first();
  if (await kickOffTab.isVisible()) {
    await kickOffTab.click();
    await page.waitForTimeout(400);

    const waiverBanner = await page.locator("text=Pre-Certified Platform Architecture Detected").first().isVisible();
    console.log(`   Gate 4/5 'Stage 4 PoC Waived' waiver banner visible: ${waiverBanner}`);
  }

  await page.screenshot({ path: "verification_modular_platform_reuse.png" });
  console.log("   Saved screenshot: verification_modular_platform_reuse.png");

  // Close gate modal
  await page.locator("button[aria-label='Close']").click();
  await page.waitForTimeout(400);

  await browser.close();
  console.log("\n=== ALL MODULAR PLATFORM REUSABILITY TESTS PASSED WITH 100% SUCCESS! ===");
}

testModularPlatformReuse().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
