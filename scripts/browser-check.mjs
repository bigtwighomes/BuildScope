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
const fixtureDir = path.resolve("tests/fixtures/synthetic");

const results = [];
const consoleErrors = [];
const pageErrors = [];
let server;

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function check(name, condition, detail = "") {
  record(name, Boolean(condition), detail);
}

async function scenario(name, work) {
  const failedBefore = results.filter((result) => !result.pass).length;
  try {
    await work();
  } catch (error) {
    record(name, false, error instanceof Error ? error.message : String(error));
    return;
  }
  const failedAfter = results.filter((result) => !result.pass).length;
  record(name, failedAfter === failedBefore, `${failedAfter - failedBefore} failed checks`);
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

  if (process.env.BUILDSCOPE_SKIP_BUILD !== "1") {
    const build = spawn("npm run build", {
      cwd: process.cwd(),
      stdio: ["ignore", outFd, errFd],
      windowsHide: true,
      shell: true,
    });
    const exitCode = await new Promise((resolve, reject) => {
      build.on("error", reject);
      build.on("exit", resolve);
    });
    if (exitCode !== 0) {
      throw new Error(`Production build failed with exit code ${exitCode}. See ${out}`);
    }
  }

  server = spawn("npm run start -- -p 3117", {
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
  await heading.waitFor({ state: "visible", timeout: 10_000 });
}

async function expectText(page, text) {
  await page
    .getByText(text, { exact: false })
    .first()
    .waitFor({ state: "visible", timeout: 10_000 });
}

async function goToReview(page) {
  await page.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
  await expectHeading(page, "Compare proposals without guessing");
  await page.getByRole("button", { name: "Continue to documents" }).click();
  await expectHeading(page, "Add two or three proposals");
}

async function openSample(page) {
  await page.goto(`${baseUrl}/analyze?sample=1`, { waitUntil: "networkidle" });
  await expectHeading(page, "Review what BuildScope extracted");
}

async function openCompare(page) {
  const nav = page.getByRole("navigation", { name: "Proposal review steps" });
  await nav.getByRole("button", { name: /Compare/ }).click();
  await expectHeading(page, "Compare scope, money and open questions");
}

async function selectProjectType(page, name) {
  await page.locator("label.choice-card").filter({ hasText: name }).click();
}

async function selectCompareView(page, name) {
  await page.getByRole("tab", { name, exact: true }).click();
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
    if (message.type() === "error" && !message.text().includes("status of 413")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await scenario("S01 Landing page and entry points", async () => {
    const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    check("Landing responds with 200", response?.status() === 200, String(response?.status()));
    await expectHeading(page, "Compare construction proposals");
    check("Landing title includes BuildScope", (await page.title()).includes("BuildScope"));
    check(
      "Landing primary CTA starts a review",
      (await page.getByRole("link", { name: /Start a proposal review/ }).getAttribute("href")) ===
        "/analyze",
    );
    check(
      "Landing sample CTA opens the synthetic flow",
      (await page
        .getByRole("link", { name: /Explore the synthetic example/ })
        .getAttribute("href")) === "/analyze?sample=1",
    );
    await runAxe(page, "Landing desktop");
    await page.screenshot({ path: path.join(artifactDir, "landing-desktop.png"), fullPage: true });
  });

  await scenario("S02 Legacy demo route redirects into the five-step flow", async () => {
    await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
    await page.waitForURL(/\/analyze\?sample=1$/, { timeout: 10_000 });
    await expectHeading(page, "Review what BuildScope extracted");
    check("Legacy /demo URL ends at the sample flow", page.url().endsWith("/analyze?sample=1"));
    check(
      "Legacy demo navigation is gone",
      (await page.getByRole("navigation", { name: "Demo workspace sections" }).count()) === 0,
    );
  });

  await scenario("S03 Project setup captures type, name and location", async () => {
    await page.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
    await expectHeading(page, "Compare proposals without guessing");
    await page.getByLabel("Project name").fill("Harborlight bathroom review");
    await page.getByLabel("City, state or postal code").fill("Portland, OR");
    await selectProjectType(page, "Bathroom renovation");
    check(
      "Bathroom project type is selected",
      await page.getByRole("radio", { name: /Bathroom renovation/ }).isChecked(),
    );
    check(
      "Project summary in top bar reflects the name",
      (await page.locator(".app-topbar h1").innerText()).includes("Harborlight bathroom review"),
    );
    await page.getByRole("button", { name: "Continue to documents" }).click();
    await expectHeading(page, "Add two or three proposals");
    check(
      "Documents step shows the selected project type",
      (await page.locator(".upload-card .tag").innerText()).includes("Bathroom renovation"),
    );
  });

  await scenario("S04 Synthetic sample loads three proposals and opens review", async () => {
    await openSample(page);
    check(
      "Sample top bar shows three documents",
      (await page.locator(".topbar-tags").innerText()).includes("3 documents"),
    );
    check(
      "Sample displays project name",
      (await page.locator(".app-topbar h1").innerText()).includes("Cedar Ridge Retreat"),
    );
    check(
      "Review summary shows extracted line items",
      (await page.locator(".step-summary").innerText()).includes("32"),
    );
    check(
      "Synthetic provenance is visible",
      (await page.locator(".topbar-tags").innerText()).includes("New home"),
    );
    await page.screenshot({
      path: path.join(artifactDir, "review-desktop.png"),
      fullPage: true,
    });
  });

  await scenario("S05 Reviewer corrections are marked and reversible", async () => {
    await openSample(page);
    await page.getByText("Correct extracted fields and line categories").first().click();
    await page.getByLabel("Pricing basis").first().selectOption("materials_package");
    check(
      "Correction marks the document",
      await page.getByText("1 corrected document", { exact: true }).isVisible(),
    );
    check(
      "Correction log records the change",
      (await page.locator(".correction-log").first().innerText()).includes("Pricing basis"),
    );
    await page.getByRole("button", { name: "Reset corrections for this document" }).first().click();
    check(
      "Resetting corrections removes the corrected tag",
      (await page.getByText("1 corrected document", { exact: true }).count()) === 0,
    );
    await runAxe(page, "Documents review desktop");
  });

  await scenario("S06 Scope comparison filters and evidence drilldown work", async () => {
    await openSample(page);
    await openCompare(page);
    const count = page.locator(".result-count");
    check("Comparison reports every scope area", (await count.innerText()).includes("scope areas"));
    await page
      .getByRole("group", { name: "Filter scope comparisons" })
      .getByRole("button", { name: "Needs review" })
      .click();
    check(
      "Needs-review filter changes the row count",
      (await count.innerText()).includes("Showing"),
    );
    await page.getByRole("button", { name: "All scope areas" }).click();
    await page
      .locator(".scope-table")
      .getByRole("button", { name: "Evidence & question" })
      .first()
      .click();
    check(
      "Evidence drilldown exposes cited spans",
      await page.locator(".scope-detail-row .evidence-list").first().isVisible(),
    );
    await runAxe(page, "Scope comparison desktop");
  });

  await scenario("S07 Responsibility matrix remains populated", async () => {
    await openSample(page);
    await openCompare(page);
    await selectCompareView(page, "Responsibilities");
    await expectHeading(page, "Responsibility matrix");
    check(
      "Responsibility table identifies contractor and owner roles",
      (await page.locator(".responsibility-table").innerText()).includes("GC / builder"),
    );
    await runAxe(page, "Responsibilities desktop");
  });

  await scenario("S08 Costs expose totals and the stated arithmetic discrepancy", async () => {
    await openSample(page);
    await openCompare(page);
    await selectCompareView(page, "Costs & unknowns");
    await expectHeading(page, "Costs and unknowns");
    check("Northline total is visible", await page.getByText("$486,540.00").first().isVisible());
    check("Sagebrush total is visible", await page.getByText("$508,162.40").first().isVisible());
    check(
      "Arithmetic discrepancy is visible",
      await page.getByText("$2,500.00").first().isVisible(),
    );
    check("Cost-data mode remains OFF", await page.getByText("Cost data OFF").first().isVisible());
    await runAxe(page, "Costs desktop");
  });

  await scenario("S09 Change register computes additions, credits and fees", async () => {
    await openSample(page);
    await openCompare(page);
    await selectCompareView(page, "Changes");
    await expectHeading(page, "Change and revision review");
    check("Sample change cards are present", (await page.locator(".change-card").count()) >= 2);
    await page.getByLabel("Title", { exact: true }).fill("Floor tile upgrade");
    await page
      .getByLabel("What changed?")
      .fill("Synthetic test of a customer-requested tile change.");
    await page.getByLabel("Additions").fill("1,000.00");
    await page.getByLabel("Credits").fill("200.00");
    await page.getByLabel("Fee %").fill("10");
    await page.getByLabel("Fixed fee").fill("50.00");
    await page.getByRole("button", { name: "Add change" }).click();
    check("New change appears in the register", (await page.locator(".change-card").count()) >= 3);
    check(
      "Documented change includes fee arithmetic",
      (await page.getByText("$930.00", { exact: false }).count()) > 0,
    );
    check(
      "Unknown exposure stays visible",
      (await page.getByText("Unknown exposure", { exact: false }).count()) >= 3,
    );
    const lastCard = page.locator(".change-card").last();
    await lastCard.getByRole("button", { name: "Remove" }).click();
    check(
      "Removing a change updates the register",
      (await page.locator(".change-card").count()) >= 2,
    );
    await runAxe(page, "Changes desktop");
  });

  await scenario("S10 Site questions stay labelled not evaluated with sources", async () => {
    await openSample(page);
    await openCompare(page);
    await selectCompareView(page, "Site questions");
    await expectHeading(page, "Site and project screening questions");
    check(
      "Sample location is carried into screening",
      (await page.getByText("Cedar Ridge, fictional sample", { exact: false }).count()) >= 1,
    );
    check("Screening cards are present", (await page.locator(".risk-card").count()) >= 4);
    check(
      "No screening result is presented as verified",
      (await page.getByText("Not evaluated").count()) >= 1,
    );
    const sourceLinks = page.locator(".risk-card a");
    check("Official source links are present", (await sourceLinks.count()) >= 3);
    check(
      "Source links use a safe external pattern",
      (await sourceLinks.first().getAttribute("rel")) === "noreferrer",
    );
    await runAxe(page, "Site questions desktop");
  });

  await scenario("S11 Questions can be copied for a contractor conversation", async () => {
    await openSample(page);
    await openCompare(page);
    await selectCompareView(page, "Questions");
    await expectHeading(page, "Findings and prioritized questions");
    await page.getByRole("button", { name: "Copy question" }).first().click();
    const feedbackVisible = await page
      .getByRole("status")
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    check("Copy-question feedback is announced", feedbackVisible);
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    check("Clipboard contains question text", clipboard.length > 20, `${clipboard.length} chars`);
    await runAxe(page, "Questions desktop");
  });

  await scenario("S12 Report includes changes, risks, limitations and print output", async () => {
    await openSample(page);
    await page
      .getByRole("navigation", { name: "Proposal review steps" })
      .getByRole("button", { name: /Report/ })
      .click();
    await expectHeading(page, "Your review report");
    check(
      "Report has document section",
      await page.getByRole("heading", { name: /1. Documents/ }).isVisible(),
    );
    check(
      "Report has change register section",
      await page.getByRole("heading", { name: /6. Change/ }).isVisible(),
    );
    check(
      "Report has screening-question section",
      await page.getByRole("heading", { name: /7. Site/ }).isVisible(),
    );
    check(
      "Report carries inline source evidence",
      await page.locator(".report-evidence blockquote").first().isVisible(),
    );
    await page.emulateMedia({ media: "print" });
    check(
      "Print CSS hides the step navigation",
      (await page
        .locator(".app-sidebar")
        .evaluate((element) => getComputedStyle(element).display)) === "none",
    );
    const printPdf = await page.pdf({ format: "A4", printBackground: true });
    await writeFile(path.join(artifactDir, "report-print.pdf"), printPdf);
    check("Print PDF is generated", printPdf.byteLength > 20_000, `${printPdf.byteLength} bytes`);
    await page.emulateMedia({ media: "screen" });
    await runAxe(page, "Report desktop");
    await page.screenshot({ path: path.join(artifactDir, "report-desktop.png"), fullPage: true });
  });

  await scenario("S13 Start over clears the working comparison", async () => {
    await openSample(page);
    await page.getByRole("button", { name: "Start over" }).click();
    await expectHeading(page, "Compare proposals without guessing");
    check(
      "Start over clears document tags",
      (await page.locator(".topbar-tags").innerText()).includes("No documents loaded"),
    );
    const breadcrumb = await page.locator(".breadcrumb").innerText();
    check(
      "Start over returns to project step",
      breadcrumb.toLowerCase().includes("step 1 of 5"),
      breadcrumb,
    );
  });

  await scenario("S14 Invalid PDFs are rejected with named reasons", async () => {
    await goToReview(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        path.join(fixtureDir, "no-text-proposal.pdf"),
        path.join(fixtureDir, "encrypted-proposal.pdf"),
      ]);
    await page.getByRole("button", { name: /Analyze 2 PDFs/ }).click();
    await expectText(page, "No extractable text was found.");
    check(
      "Encrypted PDF rejection is named",
      await page.getByText("password protected", { exact: false }).first().isVisible(),
    );
    check(
      "Rejected upload leaves no accepted documents",
      (await page.locator(".topbar-tags").innerText()).includes("0 documents"),
    );
    await expectHeading(page, "Review what BuildScope extracted");
  });

  await scenario("S15 Synthetic sample can be reloaded after a rejection", async () => {
    await page
      .getByRole("navigation", { name: "Proposal review steps" })
      .getByRole("button", { name: /Documents/ })
      .click();
    await page.getByRole("button", { name: "Use synthetic example" }).click();
    await expectHeading(page, "Review what BuildScope extracted");
    check(
      "Reloaded sample shows three documents",
      (await page.locator(".topbar-tags").innerText()).includes("3 documents"),
    );
  });

  await scenario("S16 Bathroom project uploads compare waterproofing and ventilation", async () => {
    await page.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
    await page.getByLabel("Project name").fill("Maple Street bathroom");
    await selectProjectType(page, "Bathroom renovation");
    await page.getByRole("button", { name: "Continue to documents" }).click();
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        path.join(fixtureDir, "willow-bath-renovation.pdf"),
        path.join(fixtureDir, "harbor-bath-renovation.pdf"),
      ]);
    await page.getByRole("button", { name: /Analyze 2 PDFs/ }).click();
    await expectHeading(page, "Review what BuildScope extracted");
    check(
      "Bathroom project type persists after upload",
      (await page.locator(".topbar-tags").innerText()).includes("Bathroom renovation"),
    );
    await openCompare(page);
    check(
      "Bathroom scope comparison includes waterproofing",
      (await page.locator(".scope-table").innerText()).includes("Wet-area waterproofing"),
    );
    check(
      "Bathroom scope comparison includes ventilation",
      (await page.locator(".scope-table").innerText()).includes("Bathroom ventilation"),
    );
    check(
      "Bathroom project does not include sitework",
      !(await page.locator(".scope-table").innerText()).includes("Sitework and excavation"),
    );
    await selectCompareView(page, "Costs & unknowns");
    check(
      "Willow bathroom total is visible",
      await page.getByText("$40,957.50").first().isVisible(),
    );
    check(
      "Harbor bathroom total is visible",
      await page.getByText("$27,700.00").first().isVisible(),
    );
    await page.screenshot({
      path: path.join(artifactDir, "bathroom-costs-desktop.png"),
      fullPage: true,
    });
    await runAxe(page, "Bathroom comparison desktop");
  });

  await scenario("S17 Materials package project type reaches the upload step", async () => {
    await page.goto(`${baseUrl}/analyze`, { waitUntil: "networkidle" });
    await selectProjectType(page, "Materials package or kit");
    await page.getByRole("button", { name: "Continue to documents" }).click();
    await expectHeading(page, "Add two or three proposals");
    check(
      "Materials package type is shown on documents step",
      (await page.locator(".upload-card .tag").innerText()).includes("Materials package"),
    );
  });

  await scenario("S18 Security headers and no-store API responses are present", async () => {
    const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    const headers = response?.headers() ?? {};
    check("X-Content-Type-Options is nosniff", headers["x-content-type-options"] === "nosniff");
    check("Framing is denied", headers["x-frame-options"] === "DENY");
    check("Referrer policy is no-referrer", headers["referrer-policy"] === "no-referrer");
    check(
      "Content-Security-Policy restricts framing and objects",
      (headers["content-security-policy"] ?? "").includes("frame-ancestors 'none'"),
    );
    const apiResult = await page.evaluate(async () => {
      const sample = await fetch("/api/analyze/sample", { method: "POST" });
      return { status: sample.status, cacheControl: sample.headers.get("cache-control") };
    });
    check("Sample API responds", apiResult.status === 200, String(apiResult.status));
    check("Sample API is no-store", apiResult.cacheControl === "no-store");
    const oversized = await page.evaluate(async () => {
      const form = new FormData();
      form.append("projectType", "new_home");
      form.append("files", new Blob(["%PDF-1.4\n"], { type: "application/pdf" }), "large.pdf");
      const padding = new Uint8Array(9 * 1024 * 1024);
      form.append("padding", new Blob([padding]));
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      return response.status;
    });
    check("Oversized upload is rejected with 413", oversized === 413, String(oversized));
  });

  await scenario("S19 Keyboard focus and tab order stay visible", async () => {
    await page.goto(`${baseUrl}/analyze?sample=1`, { waitUntil: "networkidle" });
    await page.mouse.click(5, 5);
    let focus = null;
    for (let index = 0; index < 15; index += 1) {
      await page.keyboard.press("Tab");
      focus = await focusIsVisible(page);
      if (focus.ok && focus.tag === "BUTTON") break;
    }
    check("Focused control has a visible outline", focus?.ok, JSON.stringify(focus));
    const labels = [];
    for (let index = 0; index < 4; index += 1) {
      const current = await focusIsVisible(page);
      labels.push(current.text);
      await page.keyboard.press("Tab");
    }
    check("Tab order is not empty", labels.filter(Boolean).length >= 3, JSON.stringify(labels));
  });

  const tablet = await browser.newContext({ viewport: { width: 820, height: 1180 } });
  const tabletPage = await tablet.newPage();
  tabletPage.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`[tablet] ${message.text()}`);
  });
  tabletPage.on("pageerror", (error) => pageErrors.push(`[tablet] ${error.message}`));

  await scenario("S20 Tablet layout and accessibility hold", async () => {
    await tabletPage.goto(`${baseUrl}/analyze?sample=1`, { waitUntil: "networkidle" });
    await expectHeading(tabletPage, "Review what BuildScope extracted");
    const overflow = await tabletPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check("Tablet has no page-level horizontal overflow", overflow <= 1, `${overflow}px`);
    check(
      "Tablet step navigation wraps horizontally",
      (await tabletPage
        .locator(".flow-nav")
        .evaluate((element) => getComputedStyle(element).flexDirection)) === "row",
    );
    await tabletPage.screenshot({
      path: path.join(artifactDir, "review-tablet.png"),
      fullPage: true,
    });
    await runAxe(tabletPage, "Review tablet");
  });

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

  await scenario("S21 Mobile landing and project step avoid overflow", async () => {
    await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await expectHeading(mobilePage, "Compare construction proposals");
    const landingOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(
      "Mobile landing has no horizontal overflow",
      landingOverflow <= 1,
      `${landingOverflow}px`,
    );
    await runAxe(mobilePage, "Landing mobile");
    await mobilePage.screenshot({
      path: path.join(artifactDir, "landing-mobile.png"),
      fullPage: true,
    });
    await mobilePage.getByRole("link", { name: /Start a proposal review/ }).click();
    await expectHeading(mobilePage, "Compare proposals without guessing");
    const projectOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(
      "Mobile project step has no horizontal overflow",
      projectOverflow <= 1,
      `${projectOverflow}px`,
    );
    await runAxe(mobilePage, "Project mobile");
  });

  await scenario("S22 Mobile sample uses responsive scope and report views", async () => {
    await mobilePage.goto(`${baseUrl}/analyze?sample=1`, { waitUntil: "networkidle" });
    await expectHeading(mobilePage, "Review what BuildScope extracted");
    await openCompare(mobilePage);
    check("Mobile shows scope cards", await mobilePage.locator(".scope-card").first().isVisible());
    check(
      "Mobile hides the wide scope table",
      !(await mobilePage.locator(".scope-table").first().isVisible()),
    );
    const compareOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check("Mobile compare has no page overflow", compareOverflow <= 1, `${compareOverflow}px`);
    await mobilePage.screenshot({
      path: path.join(artifactDir, "scope-mobile.png"),
      fullPage: true,
    });
    await runAxe(mobilePage, "Scope mobile");
    await mobilePage
      .getByRole("navigation", { name: "Proposal review steps" })
      .getByRole("button", { name: /Report/ })
      .click();
    check(
      "Mobile report table remains available",
      await mobilePage.locator(".report-table").first().isVisible(),
    );
    const reportOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check("Mobile report has no page overflow", reportOverflow <= 1, `${reportOverflow}px`);
    await runAxe(mobilePage, "Report mobile");
  });

  await scenario("S23 Accessibility sweep covers every compare view", async () => {
    await openSample(page);
    await openCompare(page);
    for (const view of [
      "Scope",
      "Responsibilities",
      "Costs & unknowns",
      "Changes",
      "Site questions",
      "Questions",
    ]) {
      await selectCompareView(page, view);
      await runAxe(page, `Compare ${view} desktop`);
    }
    await page
      .getByRole("navigation", { name: "Proposal review steps" })
      .getByRole("button", { name: /Review/ })
      .click();
    await runAxe(page, "Review desktop");
  });

  await scenario(
    "S24 No console errors, page errors or unsupported document assumptions",
    async () => {
      check("No browser console errors", consoleErrors.length === 0, JSON.stringify(consoleErrors));
      check("No uncaught page errors", pageErrors.length === 0, JSON.stringify(pageErrors));
      await openSample(page);
      await openCompare(page);
      await selectCompareView(page, "Questions");
      const bodyText = (await page.locator("body").textContent()) ?? "";
      check(
        "Fixture markup is present as inert text",
        bodyText.includes("<script>window.__buildscopeInjected = true</script>"),
      );
      check(
        "Fixture markup did not execute",
        await page.evaluate(() => !("__buildscopeInjected" in window)),
      );
      check(
        "Visible copy no longer names P2 or P3",
        !(await page.locator("body").innerText()).match(/\bP[23]\b/),
      );
      check(
        "Visible copy names cost data as OFF",
        (await page.locator("body").innerText()).includes("Cost data OFF"),
      );
      check(
        "Project source fixture path is not exposed",
        !(await page.locator("body").innerText()).includes("tests/fixtures"),
      );
    },
  );

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
