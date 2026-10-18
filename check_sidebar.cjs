const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:8080/');
  await p.waitForTimeout(1000);

  // Click expand navigation
  const expandBtn = await p.$('button[aria-label="Expand navigation"]');
  if (expandBtn) await expandBtn.click();
  await p.waitForTimeout(500);

  const btns = await p.$$eval('aside button, nav button', els => els.map(e => e.innerText.replace(/\n+/g, ' ').trim()).filter(Boolean));
  console.log('Sidebar buttons when expanded:');
  btns.forEach(b => console.log(' -', b));

  await b.close();
})();
