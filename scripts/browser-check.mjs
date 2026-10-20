import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");

const baseUrl = process.env.BUILDSCOPE_BASE_URL ?? "http://127.0.0.1:3117";
const artifactDir = path.resolve("artifacts/browser-check");
const edgePath =
  process.env.BUILDSCOPE_BROWSER_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const results = [];
const consoleErrors = [];
const pageErrors = [];
let server;

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function check(name, condition, detail = "") {
  record(name, Boolean(condition), detail);
}

async function waitForServer(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startServer() {
  if (process.env.BUILDSCOPE_BASE_URL) return;
  const logDir = process.env.TEMP ?? "C:\\Users\\aaron\\AppData\\Local\\Temp";
  const out = path.join(logDir, "buildscope-browser-check.out.log");
  const err = path.join(logDir, "buildscope-browser-check.err.log");
  const { openSync } = await import("node:fs");
  const outFd = openSync(out, "w");
  const errFd = openSync(err, "w");
  server = spawn("npm run dev -- -p 3117", {
    cwd: process.cwd(),
    stdio: ["ignore", outFd, errFd],
    windowsHide: true,
    shell: true,
  });
  await waitForServer(baseUrl);
}

async function stopServer() {
  if (!server || server.killed) return;
  await new Promise((resolve) => {
    const killer = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("exit", resolve);
  });
}

async function runAxe(page, label, include) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(
    async ({ includeSelector }) => {
      const options = {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      };
      if (includeSelector) {
        const target = document.querySelector(includeSelector);
        if (!target) return { violations: [{ id: "missing-target", nodes: [] }] };
        return window.axe.run(target, options);
      }
      return window.axe.run(document, options);
    },
    { includeSelector: include },
  );
  const violations = result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      summary: node.failureSummary,
    })),
  }));
  check(`${label}: axe WCAG 2.1 A/AA`, violations.length === 0, JSON.stringify(violations));
  return violations;
}

async function focusIsVisible(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return { ok: false, reason: "no focus" };
    const style = getComputedStyle(element);
    return {
      ok:
        style.outlineStyle !== "none" &&
        Number.parseFloat(style.outlineWidth) >= 2 &&
        element.matches(":focus-visible"),
      tag: element.tagName,
      text: element.textContent?.trim().slice(0, 60) ?? "",
      outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
    };
  });
}

async function expectHeading(page, name) {
  const heading = page.getByRole("heading", { name, exact: false }).first();
  await heading.waitFor({ state: "visible", timeout: 5000 });
}

await mkdir(artifactDir, { recursive: true });
await startServer();

const browser = await chromium.launch({
  executablePath: edgePath,
  headless: true,
});

try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await desktop.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await expectHeading(page, "Compare construction proposals");
  check("Landing renders", (await page.title()).includes("BuildScope"));
  check(
    "Landing shows synthetic notice",
    await page.getByText("This is a synthetic P2/P3 lab.").isVisible(),
  );
  check(
    "Landing links to the P3 document lab",
    (await page.getByRole("link", { name: /Analyze synthetic PDFs/ }).getAttribute("href")) ===
      "/analyze",
  );
  check(
    "Landing links to the P2 demo",
    (await page.getByRole("link", { name: /Explore the P2 demo/ }).getAttribute("href")) ===
      "/demo",
  );
  await runAxe(page, "Landing desktop");
  await page.screenshot({ path: path.join(artifactDir, "landing-desktop.png"), fullPage: true });

  await page.getByRole("link", { name: /Explore the P2 demo/ }).click();
  await page.waitForURL("**/demo");
  await expectHeading(page, "Why the headline totals cannot be compared directly");
  check("Demo loads overview", page.url().endsWith("/demo"));
  await runAxe(page, "Demo overview desktop");

  const nav = page.getByRole("navigation", { name: "Demo workspace sections" });
  const navButtons = nav.getByRole("button");
  check("Demo navigation has eight sections", (await navButtons.count()) === 8);

  const views = [
    ["Scope comparison", "Side-by-side scope comparison"],
    ["Responsibilities", "Responsibility matrix"],
    ["Costs & unknowns", "1 · Known costs"],
    ["Changes", "Change and change-order impact"],
    ["Location & risks", "Location and risk screening"],
    ["Findings & questions", "Findings and prioritized questions"],
    ["Report preview", "Report preview"],
    ["Overview", "Why the headline totals cannot be compared directly"],
  ];

  for (const [buttonName, heading] of views) {
    await nav.getByRole("button", { name: buttonName, exact: true }).click();
    await expectHeading(page, heading);
    check(`Navigation: ${buttonName}`, true);
  }

  await nav.getByRole("button", { name: "Scope comparison", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search scope areas" });
  await search.fill("hvac");
  await page.waitForTimeout(150);
  const filteredCount = page.locator(".result-count");
  check("Scope text search filters rows", (await filteredCount.textContent())?.includes("1 of"));
  await search.fill("");
  await page
    .getByRole("group", { name: "Filter by scope status" })
    .getByRole("button", { name: /^Excluded/ })
    .click();
  check("Scope status filter narrows rows", (await filteredCount.textContent())?.includes("of 14"));
  await page
    .getByRole("group", { name: "Filter by scope status" })
    .getByRole("button", { name: /^All/ })
    .click();
  await page.locator(".scope-table").getByRole("button", { name: "Details" }).first().click();
  check(
    "Scope evidence drilldown opens",
    await page.locator(".scope-detail-row .evidence-list").first().isVisible(),
  );
  await page.screenshot({ path: path.join(artifactDir, "scope-desktop.png"), fullPage: true });
  await runAxe(page, "Demo scope desktop");

  await nav.getByRole("button", { name: "Responsibilities", exact: true }).click();
  const responsibilitySelect = page.getByLabel("Scope area");
  await responsibilitySelect.selectOption("hvac");
  check(
    "Responsibility scope selector updates matrix",
    (await page.getByRole("table").innerText()).includes("Trade contractor"),
  );
  await runAxe(page, "Demo responsibilities desktop");

  await nav.getByRole("button", { name: "Costs & unknowns", exact: true }).click();
  check(
    "Cost data shows OFF",
    (await page.locator(".mode-banner").innerText()).includes("Cost-data mode: OFF"),
  );
  await page.screenshot({ path: path.join(artifactDir, "costs-desktop.png"), fullPage: true });
  await runAxe(page, "Demo costs desktop");

  await nav.getByRole("button", { name: "Changes", exact: true }).click();
  await page
    .getByRole("group", { name: "Filter changes by status" })
    .getByRole("button", { name: /^Approved/ })
    .click();
  check(
    "Change status filter narrows cards",
    (await page.locator(".change-card").count()) >= 1,
    `${await page.locator(".change-card").count()} cards`,
  );
  await page
    .getByRole("group", { name: "Filter changes by status" })
    .getByRole("button", { name: /^All/ })
    .click();
  await runAxe(page, "Demo changes desktop");

  await nav.getByRole("button", { name: "Location & risks", exact: true }).click();
  check(
    "Risk cards stay not evaluated",
    (await page.locator(".risk-card").count()) === 6 &&
      (await page.locator(".risk-placeholder").count()) === 6,
  );
  await runAxe(page, "Demo risks desktop");

  await nav.getByRole("button", { name: "Findings & questions", exact: true }).click();
  const copyButton = page.getByRole("button", { name: "Copy question" }).first();
  await copyButton.click();
  const copyStatusVisible = await page
    .getByRole("status")
    .first()
    .waitFor({ state: "visible", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check("Copy-question reports success", copyStatusVisible);
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  check("Clipboard contains question text", clipboard.length > 20, `${clipboard.length} chars`);
  await runAxe(page, "Demo findings desktop");

  await nav.getByRole("button", { name: "Report preview", exact: true }).click();
  check(
    "Report preview has evidence disclaimer",
    await page.getByText("Methodology and limitations").isVisible(),
  );
  await page.screenshot({ path: path.join(artifactDir, "report-desktop.png"), fullPage: true });
  await runAxe(page, "Demo report desktop");

  await page.emulateMedia({ media: "print" });
  check(
    "Print CSS hides navigation",
    (await page
      .locator(".app-sidebar")
      .evaluate((element) => getComputedStyle(element).display)) === "none",
  );
  const printPdf = await page.pdf({ format: "A4", printBackground: true });
  await writeFile(path.join(artifactDir, "report-print.pdf"), printPdf);
  check("Print PDF generated", printPdf.byteLength > 20_000, `${printPdf.byteLength} bytes`);
  await page.emulateMedia({ media: "screen" });

  await nav.getByRole("button", { name: "Overview", exact: true }).click();
  await page.mouse.click(5, 5);
  let focus = null;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    focus = await focusIsVisible(page);
    if (focus.tag === "BUTTON" && focus.text === "Overview") break;
  }
  check("Keyboard focus is visible", focus?.ok, JSON.stringify(focus));
  await page.keyboard.press("Tab");
  const secondFocus = await focusIsVisible(page);
  check(
    "Tab order reaches next nav item",
    secondFocus.text === "Scope comparison",
    JSON.stringify(secondFocus),
  );

  const desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "Desktop has no page-level horizontal overflow",
    desktopOverflow <= 1,
    `${desktopOverflow}px`,
  );

  await page.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
  await expectHeading(page, "Cedar Ridge Retreat");
  check(
    "Analyze sample loads three documents",
    (await page.locator(".topbar-tags").innerText()).includes("3 documents"),
  );
  const analyzeNav = page.getByRole("navigation", { name: "Analysis workspace sections" });
  check(
    "Analyze navigation has seven sections",
    (await analyzeNav.getByRole("button").count()) === 7,
  );
  check(
    "Analyze overview reports findings",
    (await page.locator(".stat-card").filter({ hasText: "Findings" }).innerText()).includes("21"),
  );
  check(
    "Prompt-injection markup is not executed",
    await page.evaluate(() => typeof window.__buildscopeInjected === "undefined"),
  );
  await runAxe(page, "Analyze overview desktop");
  await page.screenshot({
    path: path.join(artifactDir, "analyze-overview-desktop.png"),
    fullPage: true,
  });

  await analyzeNav.getByRole("button", { name: "Documents", exact: true }).click();
  await expectHeading(page, "Extracted fields and document register");
  await page.getByText("Correct extracted fields and line categories").first().click();
  await page.getByLabel("Pricing basis").first().selectOption("materials_package");
  check("Correction marks the document", await page.getByText("1 corrected document").isVisible());
  check(
    "Correction log records the change",
    (await page.locator(".correction-log").first().innerText()).includes("Pricing basis"),
  );
  await page.getByRole("button", { name: "Reset corrections for this document" }).first().click();
  check(
    "Resetting corrections removes the correction tag",
    (await page.getByText("corrected document").count()) === 0,
  );
  await runAxe(page, "Analyze documents desktop");

  await analyzeNav.getByRole("button", { name: "Scope comparison", exact: true }).click();
  await expectHeading(page, "Scope comparison");
  const resultCount = page.locator(".result-count");
  check(
    "Analyze comparison shows all scope areas",
    (await resultCount.textContent())?.includes("Showing 17 of 17"),
  );
  await page
    .getByRole("group", { name: "Filter scope comparisons" })
    .getByRole("button", { name: "Needs review" })
    .click();
  const narrowedCount = (await resultCount.textContent()) ?? "";
  check(
    "Analyze comparison filter narrows rows",
    !narrowedCount.includes("17 of 17"),
    narrowedCount,
  );
  await page
    .locator(".scope-table")
    .getByRole("button", { name: "Evidence & question" })
    .first()
    .click();
  check(
    "Analyze evidence drilldown opens",
    await page.locator(".scope-detail-row .evidence-list").first().isVisible(),
  );
  await runAxe(page, "Analyze scope desktop");
  await page.screenshot({
    path: path.join(artifactDir, "analyze-scope-desktop.png"),
    fullPage: true,
  });

  await analyzeNav.getByRole("button", { name: "Responsibilities", exact: true }).click();
  await expectHeading(page, "Responsibility matrix");
  check(
    "Analyze responsibility matrix is populated",
    (await page.locator(".responsibility-table").innerText()).includes("GC / builder"),
  );
  await runAxe(page, "Analyze responsibilities desktop");

  await analyzeNav.getByRole("button", { name: "Costs & unknowns", exact: true }).click();
  await expectHeading(page, "Costs and unknowns");
  check(
    "Analyze arithmetic exposes the discrepancy",
    await page.getByText("$2,500.00").first().isVisible(),
  );
  await runAxe(page, "Analyze costs desktop");

  await analyzeNav.getByRole("button", { name: "Findings & questions", exact: true }).click();
  await expectHeading(page, "Findings and prioritized questions");
  await page.getByRole("button", { name: "Copy question" }).first().click();
  const analyzeCopyStatusVisible = await page
    .getByRole("status")
    .first()
    .waitFor({ state: "visible", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check("Analyze copy-question reports success", analyzeCopyStatusVisible);
  await runAxe(page, "Analyze findings desktop");

  await analyzeNav.getByRole("button", { name: "Report", exact: true }).click();
  await expectHeading(page, "1. Documents and extraction");
  check(
    "Analyze report includes inline evidence",
    await page.locator(".report-evidence blockquote").first().isVisible(),
  );
  await page.emulateMedia({ media: "print" });
  check(
    "Analyze print CSS hides navigation",
    (await page
      .locator(".app-sidebar")
      .evaluate((element) => getComputedStyle(element).display)) === "none",
  );
  const analyzePrintPdf = await page.pdf({ format: "A4", printBackground: true });
  await writeFile(path.join(artifactDir, "analyze-report-print.pdf"), analyzePrintPdf);
  check(
    "Analyze print PDF generated",
    analyzePrintPdf.byteLength > 20_000,
    `${analyzePrintPdf.byteLength} bytes`,
  );
  await page.emulateMedia({ media: "screen" });
  await runAxe(page, "Analyze report desktop");

  await analyzeNav.getByRole("button", { name: "Overview", exact: true }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles([
      "tests/fixtures/synthetic/no-text-proposal.pdf",
      "tests/fixtures/synthetic/encrypted-proposal.pdf",
    ]);
  await page.getByRole("button", { name: /Analyze 2 PDFs/ }).click();
  await page
    .getByText("No extractable text was found.")
    .waitFor({ state: "visible", timeout: 30_000 });
  check("Analyze rejects an image-only PDF", true);
  check(
    "Analyze rejects an encrypted PDF",
    await page.getByText("password protected", { exact: false }).first().isVisible(),
  );
  check(
    "Rejected upload leaves no accepted documents",
    (await page.locator(".topbar-tags").innerText()).includes("0 documents"),
  );
  await page.getByRole("button", { name: "Load synthetic sample" }).click();
  await page
    .getByText("3 documents", { exact: true })
    .waitFor({ state: "visible", timeout: 30_000 });
  check(
    "Analyze reloads the synthetic sample",
    await page.getByRole("heading", { name: "Analysis summary" }).isVisible(),
  );

  const tablet = await browser.newContext({ viewport: { width: 820, height: 1180 } });
  const tabletPage = await tablet.newPage();
  tabletPage.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`[tablet] ${message.text()}`);
  });
  tabletPage.on("pageerror", (error) => pageErrors.push(`[tablet] ${error.message}`));
  await tabletPage.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  const tabletOverflow = await tabletPage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("Tablet has no page-level horizontal overflow", tabletOverflow <= 1, `${tabletOverflow}px`);
  check(
    "Tablet navigation wraps horizontally",
    (await tabletPage
      .locator(".app-nav")
      .evaluate((element) => getComputedStyle(element).flexDirection)) === "row",
  );
  await tabletPage.getByRole("button", { name: "Scope comparison", exact: true }).click();
  await tabletPage.getByRole("searchbox", { name: "Search scope areas" }).fill("roof");
  const tabletResultText = (await tabletPage.locator(".result-count").textContent()) ?? "";
  const tabletVisibleCount = Number(tabletResultText.match(/Showing (\d+) of/)?.[1] ?? "0");
  check(
    "Tablet scope search works",
    tabletVisibleCount > 0 && tabletVisibleCount < 14,
    tabletResultText,
  );
  await tabletPage.screenshot({ path: path.join(artifactDir, "scope-tablet.png"), fullPage: true });
  await runAxe(tabletPage, "Demo scope tablet");

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  mobilePage.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`[mobile] ${message.text()}`);
  });
  mobilePage.on("pageerror", (error) => pageErrors.push(`[mobile] ${error.message}`));
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const mobileLandingOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "Mobile landing has no horizontal overflow",
    mobileLandingOverflow <= 1,
    `${mobileLandingOverflow}px`,
  );
  await runAxe(mobilePage, "Landing mobile");
  await mobilePage.screenshot({
    path: path.join(artifactDir, "landing-mobile.png"),
    fullPage: true,
  });

  await mobilePage.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  await mobilePage.getByRole("button", { name: "Scope comparison", exact: true }).click();
  check(
    "Mobile uses scope cards instead of the wide table",
    (await mobilePage
      .locator(".scope-table")
      .evaluate((element) => getComputedStyle(element).display)) === "none" ||
      !(await mobilePage.locator(".scope-table").isVisible()),
  );
  check(
    "Mobile scope cards are visible",
    await mobilePage.locator(".scope-card").first().isVisible(),
  );
  await mobilePage.screenshot({ path: path.join(artifactDir, "scope-mobile.png"), fullPage: true });
  await runAxe(mobilePage, "Demo scope mobile");

  await mobilePage.getByRole("button", { name: "Responsibilities", exact: true }).click();
  check(
    "Mobile responsibility matrix remains available",
    await mobilePage.locator(".responsibility-table").isVisible(),
  );
  await mobilePage.getByRole("button", { name: "Report preview", exact: true }).click();
  check(
    "Mobile report tables remain available",
    await mobilePage.locator(".report-table").first().isVisible(),
  );
  const mobileOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "Mobile demo has no page-level horizontal overflow",
    mobileOverflow <= 1,
    `${mobileOverflow}px`,
  );

  await mobilePage.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
  await expectHeading(mobilePage, "Cedar Ridge Retreat");
  check(
    "Mobile analyze sample loads",
    (await mobilePage.locator(".topbar-tags").innerText()).includes("3 documents"),
  );
  const mobileAnalyzeNav = mobilePage.getByRole("navigation", {
    name: "Analysis workspace sections",
  });
  await mobileAnalyzeNav.getByRole("button", { name: "Scope comparison", exact: true }).click();
  await expectHeading(mobilePage, "Scope comparison");
  check(
    "Mobile analyze uses scope cards",
    await mobilePage.locator(".scope-card").first().isVisible(),
  );
  check(
    "Mobile analyze hides the wide scope table",
    (await mobilePage
      .locator(".scope-table")
      .first()
      .evaluate((element) => getComputedStyle(element).display)) === "none" ||
      !(await mobilePage.locator(".scope-table").first().isVisible()),
  );
  const mobileAnalyzeOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "Mobile analyze has no page-level horizontal overflow",
    mobileAnalyzeOverflow <= 1,
    `${mobileAnalyzeOverflow}px`,
  );
  await mobilePage.screenshot({
    path: path.join(artifactDir, "analyze-scope-mobile.png"),
    fullPage: true,
  });
  await runAxe(mobilePage, "Analyze scope mobile");

  check("No browser console errors", consoleErrors.length === 0, JSON.stringify(consoleErrors));
  check("No uncaught page errors", pageErrors.length === 0, JSON.stringify(pageErrors));

  await desktop.close();
  await tablet.close();
  await mobile.close();
} finally {
  await browser.close();
  await stopServer();
}

const failed = results.filter((result) => !result.pass);
const report = {
  baseUrl,
  browser: edgePath,
  date: new Date().toISOString(),
  results,
  consoleErrors,
  pageErrors,
};
await writeFile(path.join(artifactDir, "results.json"), JSON.stringify(report, null, 2));

console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length > 0) {
  console.log(
    `Failures:\n${failed.map((failure) => `- ${failure.name}: ${failure.detail}`).join("\n")}`,
  );
  process.exitCode = 1;
}
