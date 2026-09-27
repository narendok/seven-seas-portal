"""Browser regression coverage for the Six Sense Mobility demo workspace.

Run while the local preview is available:
  python3 tests/demo-regression.py
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080"
SCREENSHOTS = Path("/tmp/browser/demo-regression")


async def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


async def open_administration(page) -> None:
    await page.get_by_role("button", name="Administration", exact=True).click()
    await expect(await page.get_by_role("dialog").count() == 1, "Administration dialog did not open")


async def select_tab(page, name: str) -> None:
    await page.get_by_role("button", name=name, exact=True).click()


async def load_demo(page) -> None:
    await open_administration(page)
    await select_tab(page, "demo")
    await page.get_by_role("button", name="Load demo data", exact=True).click()
    await expect(await page.get_by_text("DEMO DATA ONLY", exact=False).count() > 0, "Demo marker is missing")


async def manage_department(page, department_name: str) -> None:
    await open_administration(page)
    await select_tab(page, "departments")
    row = page.locator("tr", has=page.get_by_text(department_name, exact=True))
    await expect(await row.count() == 1, f"Could not find department row: {department_name}")
    await row.get_by_role("button", name="Manage", exact=True).click()


async def main() -> None:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        errors: list[str] = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await load_demo(page)

        # Department-scoped visibility: quality workspace only shows Quality demo records and its approval.
        await page.get_by_role("button", name="Quality", exact=True).click()
        workspace_text = await page.locator("main").inner_text()
        await expect("DEMO · Quality priority review" in workspace_text, "Quality record is not visible in Quality")
        await expect("DEMO · Stores priority review" not in workspace_text, "Stores record leaked into Quality")
        await expect("Approvals" in workspace_text and "Human decisions" in workspace_text, "Quality approval metric is missing")
        await page.screenshot(path=str(SCREENSHOTS / "1-quality-scoped-visibility.png"))

        # Protected approvals remain pending and expose no decision action from the workspace.
        await page.get_by_role("button", name="Administration", exact=True).click()
        await select_tab(page, "demo")
        dialog_text = await page.get_by_role("dialog").inner_text()
        await expect("Protected quality release and financial approval examples remain pending" in dialog_text, "Protected approval protection is not stated")
        await expect(await page.get_by_role("button", name="Approve", exact=True).count() == 0, "Protected approval can be approved directly")
        await page.get_by_role("button", name="Close", exact=True).click()

        # Admin context switching: quality context appears in the header and can return to global administration.
        await manage_department(page, "DEMO · Quality")
        header_text = await page.locator("header").inner_text()
        await expect("DEMO · Quality · Administrator context" in header_text, "Quality administrator context did not activate")
        await page.screenshot(path=str(SCREENSHOTS / "2-quality-administrator-context.png"))
        await open_administration(page)
        await select_tab(page, "departments")
        global_row = page.locator("tr", has=page.get_by_text("DEMO · R&D & Projects", exact=True))
        await global_row.get_by_role("button", name="Manage", exact=True).click()
        header_text = await page.locator("header").inner_text()
        await expect("DEMO · R&D & Projects · Administrator context" in header_text, "Context did not switch between departments")

        # A department with no lead is still manageable by the administrator fallback.
        await manage_department(page, "DEMO · People & Administration")
        header_text = await page.locator("header").inner_text()
        await expect("DEMO · People & Administration · Administrator context" in header_text, "No-lead department is not manageable by administrator")
        await page.get_by_role("button", name="Administration", exact=True).click()
        await select_tab(page, "departments")
        fallback_row = page.locator("tr", has=page.get_by_text("DEMO · People & Administration", exact=True))
        await expect("No lead assigned" in await fallback_row.inner_text(), "No-lead fallback label is missing")
        await page.screenshot(path=str(SCREENSHOTS / "3-no-lead-admin-fallback.png"))

        # Demo cleanup returns the portal to a clean state.
        await select_tab(page, "demo")
        await page.get_by_role("button", name="Remove demo data", exact=True).click()
        await expect(await page.get_by_text("DEMO DATA ONLY", exact=False).count() == 0, "Demo cleanup left visible demo data")
        await expect(not errors, f"Browser console errors: {errors}")
        print("PASS: demo workspace permission regression suite")
        await browser.close()


asyncio.run(main())
