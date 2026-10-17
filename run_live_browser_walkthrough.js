import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

(async () => {
  console.log("=== Launching Live Visible Browser Walkthrough for OBD Tracker Lifecycle ===");
  
  // Launch visible Chrome with slowMo so user can easily watch on screen
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    slowMo: 600, // deliberate human-observable speed
    args: ["--start-maximized"],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  const artifactDir = "C:\\Users\\Test\\.gemini\\antigravity\\brain\\6d04f0e9-84df-447a-b730-a00e292ef167";

  const saveShot = async (name) => {
    const localPath = path.resolve(name);
    await page.screenshot({ path: localPath, fullPage: false });
    const brainPath = path.join(artifactDir, name);
    fs.copyFileSync(localPath, brainPath);
    console.log(`[Captured]: ${name}`);
  };

  try {
    // 1. Navigate to SCMS Portal
    console.log("1. Navigating to SCMS Command Center (http://localhost:8080/)...");
    await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);

    // 2. Open Project Analysis (Page 1)
    console.log("2. Opening Project Analysis (Page 1) Workspace...");
    const page1Btn = page.locator("button:has-text('Project Analysis (Page 1)')").first();
    await page1Btn.waitFor({ state: "visible", timeout: 10000 });
    await page1Btn.click();
    await page.waitForTimeout(2000);

    // 3. Switch Program to HLPL-OBD4-01 (4G OBD-II Smart Tracker)
    console.log("3. Switching Program to HLPL-OBD4-01 (Ashok Leyland 4G OBD-II Smart Tracker)...");
    const programSelect = page.locator("select").filter({ hasText: "Tata Ace" }).first();
    if (await programSelect.isVisible()) {
      await programSelect.selectOption("HLPL-OBD4-01");
      await page.waitForTimeout(1500);
    }

    // 4. Inspect Tab 1: Physical Device One-View & J1962 Pinout
    console.log("4. Exploring Physical Device One-View & J1962 16-Pin Visual Reference...");
    const oneViewTab = page.locator("button:has-text('1. Device Visual One-View & J1962 Pinout')").first();
    if (await oneViewTab.isVisible()) {
      await oneViewTab.click();
      await page.waitForTimeout(1000);

      // Hover over key OBD-II pins to show dynamic electrical spec
      const pin16 = page.locator("button:has-text('16')").first();
      if (await pin16.isVisible()) {
        await pin16.hover();
        await page.waitForTimeout(1000);
      }

      const pin6 = page.locator("button:has-text('6')").first();
      if (await pin6.isVisible()) {
        await pin6.hover();
        await page.waitForTimeout(1000);
      }

      const pin14 = page.locator("button:has-text('14')").first();
      if (await pin14.isVisible()) {
        await pin14.hover();
        await page.waitForTimeout(1000);
      }
    }
    await saveShot("obd_step1_physical_oneview.png");
    await page.waitForTimeout(2000);

    // 5. Inspect Tab 2: Mechanical Dimensions & Fitment Envelope
    console.log("5. Exploring Mechanical Dimensions & Fitment Envelope...");
    const dimensionsTab = page.locator("button:has-text('2. Mechanical Dimensions & Fitment Envelope')").first();
    if (await dimensionsTab.isVisible()) {
      await dimensionsTab.click();
      await page.waitForTimeout(1500);
      await saveShot("obd_step2_mechanical_dimensions.png");
      await page.waitForTimeout(2000);
    }

    // 6. Inspect Tab 3: Hardware System Block Diagram
    console.log("6. Exploring Hardware System Block Diagram...");
    const blockTab = page.locator("button:has-text('3. Hardware System Block Diagram')").first();
    if (await blockTab.isVisible()) {
      await blockTab.click();
      await page.waitForTimeout(1500);
      await saveShot("obd_step3_block_diagram.png");
      await page.waitForTimeout(2000);
    }

    // 7. Inspect Tab 4: Service Team (SIT) Field Mounting & PDI
    console.log("7. Exploring Service Team (SIT) Vehicle Mounting Protocol...");
    const serviceTab = page.locator("button:has-text('4. Service Team (SIT) Field Mounting & PDI')").first();
    if (await serviceTab.isVisible()) {
      await serviceTab.click();
      await page.waitForTimeout(1500);
      await saveShot("obd_step4_service_mounting.png");
      await page.waitForTimeout(2000);
    }

    // 8. Scroll Down to 11-Department Matrix Cards on Page 1
    console.log("8. Verifying 11-Department Matrix Cards & SIT Vehicle Fitment...");
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: "smooth" }));
    await page.waitForTimeout(2000);
    await saveShot("obd_step5_11dept_shared_matrix.png");

    // 9. Execute Lifecycle Revision Update: Adding the BLE 5.2 Version (Rev 02)
    console.log("9. Executing Lifecycle Revision Update: Adding BLE 5.2 Sensor Hub (Rev 02)...");
    await page.evaluate(() => window.scrollTo({ top: 150, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    const rev02Btn = page.locator("button:has-text('Rev 02 · BLE 5.2 Upgrade')").first();
    if (await rev02Btn.isVisible()) {
      await rev02Btn.click();
      await page.waitForTimeout(1500);

      // Switch to block diagram to show the illuminated BLE 5.2 co-processor
      const blockTabAgain = page.locator("button:has-text('3. Hardware System Block Diagram')").first();
      if (await blockTabAgain.isVisible()) {
        await blockTabAgain.click();
        await page.waitForTimeout(1500);
      }
      await saveShot("obd_step6_ble_rev02_upgrade.png");
      await page.waitForTimeout(2500);
    }

    // 10. Inspect Tab 3: Client Preview & Tokenized Share Link
    console.log("10. Exploring Tab 3: Client Preview & Tokenized Share Link...");
    const clientTab = page.locator("button:has-text('Client Preview & Share Link')").first();
    if (await clientTab.isVisible()) {
      await clientTab.click();
      await page.waitForTimeout(2000);

      // Copy client link
      const copyBtn = page.locator("button:has-text('Copy Client Link')").first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await page.waitForTimeout(1000);
      }

      // Customer Acknowledgment sign-off
      const ackBtn = page.locator("button:has-text('Acknowledge Milestone & Sign Off')").first();
      if (await ackBtn.isVisible()) {
        await ackBtn.click();
        await page.waitForTimeout(1000);
      }
      await saveShot("obd_step7_client_preview.png");
      await page.waitForTimeout(3000);
    }

    // Return to Page 1 view to leave in pristine state
    const sharedTab = page.locator("button:has-text('All-in-One Shared Analysis (Page 1)')").first();
    if (await sharedTab.isVisible()) {
      await sharedTab.click();
      await page.waitForTimeout(2000);
    }

    console.log("=== Live Visible Browser Walkthrough Completed Successfully! ===");
    // Keep window open for 10 seconds so user can see the final state on desktop
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error("Walkthrough error:", err);
  } finally {
    await browser.close();
  }
})();
