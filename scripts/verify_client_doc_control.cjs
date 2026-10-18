const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\Test\\.gemini\\antigravity\\brain\\6d04f0e9-84df-447a-b730-a00e292ef167';

async function main() {
  console.log('Launching browser for Client Document Control verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:8080/?role=client...');
  await page.goto('http://localhost:8080/?role=client', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Verify Client Portal Hero & Deliverables view
  console.log('Verifying Client Portal Header & Deliverables...');
  const headerText = await page.textContent('body');
  if (!headerText.includes('Tata Motors Limited') || !headerText.includes('Released Deliverables')) {
    throw new Error('Client portal did not load expected header text!');
  }

  const p1 = path.join(ARTIFACTS_DIR, 'verified_client_portal_deliverables.png');
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Captured:', p1);

  // 2. Click "Inspect Document" on HLPL-AI4T-SAL-SOR-01
  console.log('Clicking "Inspect Document" on SOR-01...');
  const inspectBtns = await page.locator('button:has-text("Inspect Document")').all();
  if (inspectBtns.length === 0) {
    throw new Error('No Inspect Document buttons found!');
  }
  await inspectBtns[0].click();
  await page.waitForTimeout(1000);

  // Verify modal is open and shows formatted sheet
  const modalText = await page.textContent('body');
  if (!modalText.includes('Customer Statement of Requirements') || !modalText.includes('HEXENSE LABS PRIVATE LIMITED')) {
    throw new Error('Customer document inspection modal failed to render drafted sheet!');
  }
  // Verify it did NOT open DocumentsPanel (internal vault)
  if (modalText.includes('Engineering Deliverables Vault') || modalText.includes('Upload Controlled Document')) {
    throw new Error('CRITICAL BUG: Opened internal DocumentsPanel instead of Customer Document Modal!');
  }

  const p2 = path.join(ARTIFACTS_DIR, 'verified_client_inspect_sheet_modal.png');
  await page.screenshot({ path: p2, fullPage: false });
  console.log('Captured:', p2);

  // 3. Switch to "Attached Sample Files" tab
  console.log('Switching to Attached Sample Files tab...');
  await page.click('button:has-text("Attached Sample Files")');
  await page.waitForTimeout(800);

  const p3 = path.join(ARTIFACTS_DIR, 'verified_client_inspect_attachments_modal.png');
  await page.screenshot({ path: p3, fullPage: false });
  console.log('Captured:', p3);

  // 4. Close Modal
  console.log('Closing Inspection Modal...');
  await page.click('button:has-text("Close")');
  await page.waitForTimeout(500);

  // 5. Switch to Document Control Visibility Matrix tab
  console.log('Switching to Document Control Visibility Matrix tab...');
  await page.click('button:has-text("Document Control Visibility Matrix")');
  await page.waitForTimeout(1000);

  const p4 = path.join(ARTIFACTS_DIR, 'verified_client_visibility_matrix.png');
  await page.screenshot({ path: p4, fullPage: false });
  console.log('Captured:', p4);

  // 6. Test Filter Restricted (9)
  console.log('Filtering Restricted documents...');
  await page.click('button:has-text("Restricted (9)")');
  await page.waitForTimeout(600);

  const p5 = path.join(ARTIFACTS_DIR, 'verified_client_matrix_restricted_filter.png');
  await page.screenshot({ path: p5, fullPage: false });
  console.log('Captured:', p5);

  // 7. Test Filter Granted (7) and open ARAI TAC
  console.log('Filtering Granted documents...');
  await page.click('button:has-text("Granted (7)")');
  await page.waitForTimeout(600);

  console.log('Opening ARAI TAC certificate inspection...');
  const inspectTac = page.locator('tr:has-text("QA-TAC-01") button:has-text("Inspect")');
  await inspectTac.click();
  await page.waitForTimeout(800);

  const p6 = path.join(ARTIFACTS_DIR, 'verified_client_tac_inspection.png');
  await page.screenshot({ path: p6, fullPage: false });
  console.log('Captured:', p6);

  await page.click('button:has-text("Close")');
  await page.waitForTimeout(500);

  await browser.close();
  console.log('All Client Document Control verifications PASSED successfully!');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
