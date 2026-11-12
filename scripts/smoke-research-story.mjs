/**
 * Research World visual smoke: steps through all 13 chapters at desktop and mobile
 * widths, saves per-chapter screenshots and asserts the scene never renders blank
 * or overflows. Standalone on purpose — not part of prebuild.
 *
 * Usage:
 *   npm run test:visual                 # against a running dev server on :3457
 *   RW_SMOKE_URL=http://localhost:3000 npm run test:visual
 *   RW_SMOKE_URL=http://localhost:3457/rw-preview npm run test:visual   # preview route
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "smoke-artifacts", "research-story");
const baseUrl = process.env.RW_SMOKE_URL ?? "http://localhost:3457";
const viewports = [
  { name: "desktop", width: 1600, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];
const chapters = 13;

async function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      // Any HTTP response (including 5xx during a dev recompile) proves the server is up;
      // page.goto below retries the actual navigation.
      await fetch(url, { redirect: "follow" });
      return;
    } catch { /* server not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server never became reachable at ${url}`);
}

async function startOwnServer() {
  const port = 3557;
  console.log(`No server at ${baseUrl}; spawning dev server on :${port} …`);
  const child = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--port", String(port)], { cwd: root, stdio: "ignore", detached: true });
  const stop = () => { try { process.kill(-child.pid, "SIGTERM"); } catch { /* already gone */ } };
  const url = `http://localhost:${port}`;
  try {
    await waitForServer(url);
    return { url, stop };
  } catch (error) {
    stop();
    throw error;
  }
}

const { chromium } = await import("playwright");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let target = baseUrl;
let stopServer = null;
try {
  await waitForServer(target, 2500);
} catch {
  const own = await startOwnServer();
  target = own.url;
  stopServer = own.stop;
}

const browser = await chromium.launch();
const failures = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    const dir = path.join(outDir, viewport.name);
    fs.mkdirSync(dir, { recursive: true });

    await page.goto(target, { waitUntil: "domcontentloaded" });
    // Dev servers may serve a 500 while compiling; retry until the section mounts.
    await page.locator("#research-world .rw-svg").waitFor({ state: "visible", timeout: 45000 }).catch(async () => {
      await page.goto(target, { waitUntil: "domcontentloaded" });
      await page.locator("#research-world .rw-svg").waitFor({ state: "visible", timeout: 20000 });
    });
    await page.locator("#research-world .rw-svg").waitFor({ state: "visible", timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);

    // Step deterministically: click mode pauses scroll-driven playback.
    await page.locator(".rw-mode button").click();
    await page.locator(".rw-tick").first().waitFor({ state: "visible" });

    for (let index = 0; index < chapters; index += 1) {
      await page.locator(".rw-tick").nth(index).click();
      await page.waitForTimeout(1100); // navigation tween (.65s) + narration swap (.46s)

      const state = await page.evaluate(() => ({
        nodes: document.querySelectorAll("[data-rw-node]").length,
        baseOpacity: Number(document.querySelector('[data-rw-layer="base"]')?.style.opacity ?? 0),
        camera: document.querySelector("[data-rw-camera]")?.getAttribute("transform") ?? "",
        narration: document.querySelector(".rw-narration h3")?.textContent ?? "",
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      try {
        assert.ok(state.nodes >= 250, `expected the full graph, got ${state.nodes} nodes`);
        assert.ok(state.baseOpacity > 0, "base layer must stay visible in every chapter");
        assert.ok(state.camera.includes("scale"), `camera transform missing at chapter ${index + 1}`);
        assert.ok(state.narration.length > 0, `narration title missing at chapter ${index + 1}`);
        assert.ok(state.scrollWidth <= state.innerWidth + 1, `horizontal overflow at chapter ${index + 1}: ${state.scrollWidth} > ${state.innerWidth}`);
        await page.screenshot({ path: path.join(dir, `ch${String(index + 1).padStart(2, "0")}.png`) });
      } catch (error) {
        failures.push(`${viewport.name} ch${index + 1}: ${error.message}`);
        await page.screenshot({ path: path.join(dir, `FAIL-ch${String(index + 1).padStart(2, "0")}.png`) }).catch(() => {});
      }
    }
    if (pageErrors.length > 0) failures.push(`${viewport.name}: page errors — ${pageErrors.join(" | ")}`);
    await context.close();
    console.log(`${viewport.name}: ${chapters} chapters captured → ${dir}`);
  }
} finally {
  await browser.close();
  stopServer?.();
}

if (failures.length > 0) {
  console.error(`FAIL (${failures.length}):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`PASS: research story smoke — ${viewports.length} viewports × ${chapters} chapters, screenshots in ${outDir}`);
