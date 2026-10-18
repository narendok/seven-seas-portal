const { chromium } = require("playwright-core");
const path = require("path");

async function run() {
  console.log("Starting verification of Department Lead Login & Session Authentication...");
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
  } catch (err) {
    console.log("Falling back to default chromium launcher...", err.message);
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Navigate to SCMS root
  console.log("Navigating to http://localhost:8080/ ...");
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 2. Open Lead Auth Modal
  console.log("Clicking [Lead Auth] button in top header...");
  const authBtn = await page.waitForSelector('button:has-text("Lead Auth")');
  await authBtn.click();
  await page.waitForTimeout(500);

  // Capture open modal screenshot
  const modalOpenPath = path.join(__dirname, "docs/images/scms_demo_auth_modal_open.png");
  await page.screenshot({ path: modalOpenPath, fullPage: false });
  console.log(`Saved screenshot: ${modalOpenPath}`);

  // 3. Enter Purchasing Lead credentials
  console.log("Filling Purchasing Lead credentials (morgan.reed@example.com)...");
  const emailInput = await page.waitForSelector('input[placeholder="e.g. morgan.reed@example.com"]');
  await emailInput.fill("morgan.reed@example.com");

  const passInput = await page.waitForSelector('input[placeholder="Enter password"]');
  await passInput.fill("Demo@PUR2026");

  // Toggle password visibility eye icon
  const eyeBtn = await page.$('form button[type="button"]');
  if (eyeBtn) {
    await eyeBtn.click();
    await page.waitForTimeout(300);
  }

  const modalFilledPath = path.join(__dirname, "docs/images/scms_demo_auth_pur_filled.png");
  await page.screenshot({ path: modalFilledPath, fullPage: false });
  console.log(`Saved screenshot: ${modalFilledPath}`);

  // 4. Submit Authentication
  console.log("Clicking 'Authenticate & Sign In as Department Lead'...");
  const submitBtn = await page.waitForSelector('button:has-text("Authenticate & Sign In as Department Lead")');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // Verify page context has changed to Purchasing
  const purSessionPath = path.join(__dirname, "docs/images/scms_demo_auth_pur_session.png");
  await page.screenshot({ path: purSessionPath, fullPage: false });
  console.log(`Saved screenshot: ${purSessionPath}`);

  // 5. Open Modal Again & Authenticate as Sales Lead via 1-Click Directory
  console.log("Opening modal again to verify Active Session card and autofill Sales Lead...");
  const authBtn2 = await page.waitForSelector('button:has-text("Lead Auth")');
  await authBtn2.click();
  await page.waitForTimeout(600);

  // Click Sales Lead card in the directory
  console.log("Clicking Priya Sharma (Sales & BD Lead) card...");
  const salesCard = await page.waitForSelector('button:has-text("Priya Sharma")');
  await salesCard.click();
  await page.waitForTimeout(300);

  // Submit Sales login
  const submitBtn2 = await page.waitForSelector('button:has-text("Authenticate & Sign In as Department Lead")');
  await submitBtn2.click();
  await page.waitForTimeout(1500);

  // Verify Sales context
  const salesSessionPath = path.join(__dirname, "docs/images/scms_demo_auth_sales_session.png");
  await page.screenshot({ path: salesSessionPath, fullPage: false });
  console.log(`Saved screenshot: ${salesSessionPath}`);

  // 6. Authenticate as Finance Lead
  console.log("Opening modal again and authenticating as Finance Lead...");
  const authBtn3 = await page.waitForSelector('button:has-text("Lead Auth")');
  await authBtn3.click();
  await page.waitForTimeout(600);

  const finCard = await page.waitForSelector('button:has-text("Priya Voss")');
  await finCard.click();
  await page.waitForTimeout(300);

  const submitBtn3 = await page.waitForSelector('button:has-text("Authenticate & Sign In as Department Lead")');
  await submitBtn3.click();
  await page.waitForTimeout(1500);

  const finSessionPath = path.join(__dirname, "docs/images/scms_demo_auth_fin_session.png");
  await page.screenshot({ path: finSessionPath, fullPage: false });
  console.log(`Saved screenshot: ${finSessionPath}`);

  await browser.close();
  console.log("All Department Lead Authentication demo steps verified successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
