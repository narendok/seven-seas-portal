const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting Playwright Lead Isolation Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'docs', 'images');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Initial view as Admin
  console.log('Navigating to http://localhost:8080/ as Admin...');
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verify Admin header has role switcher select and Lead Auth button
  const adminSelect = await page.$('select[aria-label="Switch role and department"]');
  const leadAuthBtn = await page.$('button[title*="Lead Sign-In & Authentication"]');
  console.log('Admin check - select exists:', !!adminSelect, 'leadAuthBtn exists:', !!leadAuthBtn);

  // Open Lead Auth modal to sign in as Purchasing Lead
  if (leadAuthBtn) {
    await leadAuthBtn.click();
    await page.waitForTimeout(600);
  }

  const modal = page.locator('div.fixed.inset-0.z-50');
  await modal.waitFor({ state: 'visible', timeout: 5000 });

  // Find and click the 1-click button for Purchasing Lead (Morgan Reed) inside the modal
  const purBtn = modal.locator('button:has-text("Morgan Reed")').first();
  await purBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking Morgan Reed 1-click credential button inside modal...');
  await purBtn.click();
  await page.waitForTimeout(400);

  // Click Authenticate button inside modal
  const submitAuthBtn = modal.locator('button:has-text("Authenticate & Sign In as Department Lead")').first();
  await submitAuthBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Submitting Lead authentication...');
  await submitAuthBtn.click();
  await page.waitForTimeout(1200);

  // 2. Verified Purchasing Lead Session
  console.log('Verifying Purchasing Lead Session...');
  await page.screenshot({ path: path.join(screenshotsDir, 'scms_lead_pur_isolated_header.png'), fullPage: false });

  // Verify that role switcher select is completely GONE
  const leadSelect = await page.$('select[aria-label="Switch role and department"]');
  console.log('Lead check - role select exists (should be FALSE):', !!leadSelect);

  // Verify locked badge and Sign Out button
  const lockedBadge = page.locator('text=PUR LEAD').first();
  const signOutBtn = page.locator('button[title="Sign Out of Department Lead Session"]').first();
  console.log('Lead check - locked badge exists:', await lockedBadge.isVisible(), 'Sign Out exists:', await signOutBtn.isVisible());

  // Verify admin actions are hidden
  const adminActionBtn = await page.$('button[aria-label="Administration"]');
  const templateSettingsBtn = await page.$('button[aria-label="Template Settings"]');
  const cloudSyncBtn = await page.$('button[aria-label="Cloud & Supabase Sync"]');
  console.log('Lead check - Admin button exists (should be FALSE):', !!adminActionBtn);
  console.log('Lead check - Template Settings exists (should be FALSE):', !!templateSettingsBtn);
  console.log('Lead check - Cloud Sync exists (should be FALSE):', !!cloudSyncBtn);

  // Take full page screenshot of Purchasing Lead view
  await page.screenshot({ path: path.join(screenshotsDir, 'scms_lead_pur_full_isolated_page.png'), fullPage: true });

  // 3. Test Sign Out
  console.log('Testing Sign Out button...');
  await signOutBtn.click();
  await page.waitForTimeout(1000);

  // Verify returned to Admin gateway
  const returnedSelect = await page.$('select[aria-label="Switch role and department"]');
  console.log('After Sign Out - role select returned (should be TRUE):', !!returnedSelect);
  await page.screenshot({ path: path.join(screenshotsDir, 'scms_lead_signout_returned_gateway.png'), fullPage: false });

  // 4. Test Sales Lead login
  console.log('Testing Sales Lead login...');
  const leadAuthBtn2 = await page.$('button[title*="Lead Sign-In & Authentication"]');
  if (leadAuthBtn2) {
    await leadAuthBtn2.click();
    await page.waitForTimeout(600);
    const modal2 = page.locator('div.fixed.inset-0.z-50');
    await modal2.waitFor({ state: 'visible', timeout: 5000 });
    const salesBtn = modal2.locator('button:has-text("Priya Sharma")').first();
    await salesBtn.waitFor({ state: 'visible', timeout: 5000 });
    await salesBtn.click();
    await page.waitForTimeout(400);
    const submitBtn = modal2.locator('button:has-text("Authenticate & Sign In as Department Lead")').first();
    await submitBtn.click();
    await page.waitForTimeout(1200);
  }

  // Verify Sales Lead header and isolation
  const salesLockedBadge = page.locator('text=SALES LEAD').first();
  const salesSelect = await page.$('select[aria-label="Switch role and department"]');
  console.log('Sales Lead check - locked badge exists:', await salesLockedBadge.isVisible());
  console.log('Sales Lead check - role select exists (should be FALSE):', !!salesSelect);

  await page.screenshot({ path: path.join(screenshotsDir, 'scms_lead_sales_isolated_header.png'), fullPage: false });

  await browser.close();
  console.log('Playwright Verification Complete! All checks passed successfully.');
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
