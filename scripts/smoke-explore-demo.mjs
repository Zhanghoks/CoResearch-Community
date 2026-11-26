import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.EXPLORE_SMOKE_URL;
const artifactDir = process.env.EXPLORE_ARTIFACTS || "/tmp/co-replica";
const browser = await chromium.launch({
  executablePath: process.env.RW_CHROMIUM_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-site-isolation-trials", "--disable-features=IsolateOrigins,site-per-process"],
});
const errors = [];
const remote = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url()) && !r.url().startsWith(base || "#")) remote.push(r.url());
  });
};
await mkdir(artifactDir, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 842 } });
  watch(page);
  await page.goto(new URL("../public/demos/coresearch-explore.html", import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('g[data-node="surface"][tabindex="0"]').waitFor();
  assert.equal(await page.locator(".stage").evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(13, 14, 18)", "The standalone theme remains dark");
  await page.screenshot({ path: artifactDir + "/focus.png" });

  await page.locator(".tabbar button[data-action=frontier]").click();
  assert.equal(await page.locator("#chart g[data-node]").count(), 5);
  await page.screenshot({ path: artifactDir + "/frontier.png" });
  await page.locator(".tabbar button[data-action=home]").click();
  await page.getByRole("button", { name: "在工作区打开" }).click();
  await page.screenshot({ path: artifactDir + "/overview.png" });
  const surface = page.getByRole("button", { name: "表面线索耦合：表述像已有", exact: true });
  await surface.focus();
  await page.keyboard.press("Enter");
  await page.locator(".actions").getByRole("button", { name: "查看详解", exact: true }).click();
  assert.match(await page.locator("#inspector").textContent(), /Expert Rubrics/);

  await page.locator(".action-row").getByRole("button", { name: "细分方向" }).click();
  assert.match(await page.locator("#input").inputValue(), /表面线索耦合/);
  assert.equal(await page.locator("g[data-leaf]").count(), 0);
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await page.getByRole("button", { name: "返回全景" }).click();
  await page.locator('g[data-node="gap"]').focus();
  await page.keyboard.press("Enter");
  await page.locator("button[data-child=surface-1]").waitFor();
  assert.equal(await page.locator("g[data-leaf]").count(), 0, "Do not graft onto whichever sector is selected now");
  await page.locator("button[data-child=surface-1]").click();
  assert.equal(await page.locator("g[data-leaf]").count(), 2);
  await page.screenshot({ path: artifactDir + "/children.png" });
  await page.locator(".stage").getByRole("button", { name: "树状图", exact: true }).click();
  assert.equal(await page.locator("#chart rect.face").count(), 2);
  await page.getByRole("button", { name: "圆盘", exact: true }).click();
  assert.equal(await page.locator("#chart g[data-node]").count(), 2);

  const touch = await browser.newPage({ viewport: { width: 320, height: 550 }, reducedMotion: "reduce", hasTouch: true, isMobile: true });
  watch(touch);
  await touch.goto(page.url());
  await touch.getByRole("button", { name: "研究对话", exact: true }).tap();
  await touch.getByRole("button", { name: "在工作区打开" }).tap();
  assert.equal(await touch.locator("#layout").getAttribute("data-mobile"), "graph");
  assert.ok(await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await touch.screenshot({ path: artifactDir + "/mobile.png" });

  if (base) {
    await page.goto(base);
    await page.locator("#product-demo").scrollIntoViewIfNeeded();
    const home = page.frameLocator("#product-demo iframe");
    await home.locator(".graph").waitFor();
    assert.equal(await page.locator("#product-demo iframe").getAttribute("inert"), null);
    await page.locator("#demo-play").click();
    await home.locator('[data-leaf="surface-1"]').waitFor({ timeout: 15000 });

    for (const width of [1440, 390]) {
      const product = await browser.newPage({ viewport: { width, height: width === 1440 ? 1120 : 844 } });
      watch(product);
      await product.goto(base + "product/");
      await product.evaluate(() => document.fonts.ready);
      const frame = product.frameLocator("#product-demo iframe");
      const layout = frame.locator("#layout");
      const target = product.locator("#product-demo iframe");
      assert.equal(await target.getAttribute("inert"), "");
      assert.equal(await product.locator("[data-macos-titlebar] [aria-hidden=true] span").count(), 3);
      assert.equal(await product.getByRole("list", { name: "演示步骤" }).count(), 0);
      assert.equal(await product.locator("[data-macos-window] > iframe").count(), 1);
      await product.getByRole("heading", { name: "CoResearch", exact: true }).waitFor();
      assert.ok(await product.locator("[data-product-intro]").evaluate(intro => {
        const windowBox = document.querySelector("[data-macos-window]").getBoundingClientRect();
        return windowBox.top - intro.getBoundingClientRect().bottom >= 20;
      }), "The visible intro must have its own space above the macOS window");
      assert.equal(await target.getAttribute("tabindex"), "-1");
      assert.equal(await target.evaluate(el=>getComputedStyle(el).pointerEvents), "none");
      await product.waitForFunction(() => document.querySelector("#product-demo img")?.naturalWidth > 0);
      await frame.locator('#layout[data-play=playing][data-phase="0"]').waitFor();
      assert.equal(await frame.locator(".expansion").isVisible(), false);
      assert.equal(await frame.locator(".stage").evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(248, 250, 252)");
      assert.equal(await frame.locator(".chat").evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(255, 255, 255)");
      await product.screenshot({ path: artifactDir + "/opening-" + width + ".png" });
      if (width === 1440) {
        await product.getByRole("button", { name: "暂停演示", exact: true }).click();
        await frame.locator("#layout[data-play=paused]").waitFor();
        const before = await layout.getAttribute("data-phase");
        await product.waitForTimeout(2700);
        assert.equal(await layout.getAttribute("data-phase"), before);
        await product.getByRole("button", { name: "继续演示", exact: true }).click();
      }
      await frame.locator(".messages>.bubble").waitFor();
      assert.match(await frame.locator(".messages>.bubble").textContent(), /怎么判断 AI/);
      await frame.locator('#layout[data-phase="1"]').waitFor();
      assert.equal(await frame.locator(".show-item").count(), 2);
      assert.equal(await frame.locator(".expansion").isVisible(), false);
      await frame.locator('#layout[data-phase="2"] .show-item.active').waitFor();
      assert.equal(await frame.locator(".show-item.active em").textContent(), "已选中");
      assert.equal(await frame.locator("#pin").isVisible(), false);
      assert.equal(await frame.locator(".overview-scene").isVisible(), false);
      assert.equal(await frame.locator(".focus-scene").isVisible(), true);
      assert.equal(await frame.locator(".focus-scene .leaf-preview").isVisible(), true);
      const pinnedSector = await frame.locator('.focus-scene [data-node="surface"]').filter({has: frame.locator('path[fill="url(#activeFill-focus)"]')}).locator("path.face").getAttribute("d");
      const darkLabels = await frame.locator(".focus-scene text").evaluateAll(labels=>
        labels.some(label=>getComputedStyle(label).fill==="rgb(38, 56, 88)"));
      assert.ok(darkLabels, "The active wedge uses dark ink on the light plate");
      await frame.locator("#pin").waitFor();
      assert.match(await frame.locator("#pin").textContent(), /02 表面线索耦合/);
      assert.equal(await frame.locator(".expansion").isVisible(), false);
      await product.screenshot({ path: artifactDir + "/focus-" + width + ".png" });
      await frame.locator('#layout[data-phase="3"] .expansion').waitFor();
      assert.equal(await frame.locator(".expansion [data-show-child]").count(), 2);
      assert.equal(await frame.locator(".focus-scene .leaf-preview").isVisible(), false);
      assert.equal(await frame.locator(".child-sector path").first().evaluate(el=>getComputedStyle(el).fill), "rgb(234, 242, 253)");
      assert.equal(await frame.locator('.focus-scene path[fill="url(#activeFill-focus)"]').getAttribute("d"), pinnedSector);
      assert.equal(await frame.locator(".show-branch .show-item").count(), 2);
      await product.getByRole("button", { name: "重播演示", exact: true }).waitFor();
      assert.ok(await frame.locator("#messages").evaluate(el=>{
        const box=el.getBoundingClientRect();
        return [...el.querySelectorAll(".show-item.active,.show-item.child")].every(item=>{
          const r=item.getBoundingClientRect();
          return r.height>0 && r.top>=box.top-1 && r.bottom<=box.bottom+1;
        });
      }), "The selected direction and both results must be fully visible even on phones");
      await product.screenshot({ path: artifactDir + "/end-" + width + ".png" });
      assert.ok(await product.evaluate(() => document.documentElement.scrollWidth <= innerWidth && scrollY === 0));
      assert.ok(await product.evaluate(() => document.activeElement?.tagName !== "IFRAME"));
      await product.getByRole("button", { name: "重播演示", exact: true }).click();
      await frame.locator('#layout[data-play=playing][data-phase="0"]').waitFor();
      assert.equal(await frame.locator(".expansion").isVisible(), false);
      await product.close();
    }
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    watch(reduced);
    await reduced.goto(base + "product/");
    const reducedFrame = reduced.frameLocator("#product-demo iframe");
    await reducedFrame.locator('#layout[data-play=idle][data-phase="0"]').waitFor();
    await reduced.waitForTimeout(2900);
    assert.equal(await reducedFrame.locator("#layout").getAttribute("data-play"), "idle");
    const playback = reduced.getByRole("button", { name: "播放演示", exact: true });
    for (const width of [390, 320]) {
      await reduced.setViewportSize({ width, height: 900 });
      for (const scale of [1, 2]) {
        const introFits = await reduced.locator("[data-product-intro]").evaluate(async (intro, scale) => {
          await document.fonts.ready;
          const parts = [...intro.querySelectorAll("h1,p")];
          for (const part of parts) part.style.removeProperty("font-size");
          for (const part of parts) part.style.fontSize = `${parseFloat(getComputedStyle(part).fontSize) * scale}px`;
          const clip = intro.parentElement.getBoundingClientRect();
          const demo = document.querySelector("[data-macos-window]").getBoundingClientRect();
          return document.documentElement.scrollWidth <= innerWidth
            && demo.top - intro.getBoundingClientRect().bottom >= 20
            && parts.every(part => {
              const range = document.createRange();
              range.selectNodeContents(part);
              const lines = [...range.getClientRects()];
              return lines.length > 0 && lines.every(line =>
                line.left >= clip.left - 1 && line.right <= clip.right + 1 && line.bottom < demo.top);
            });
        }, scale);
        assert.ok(introFits, `Product description and title must fit above the window at ${width}px and ${scale * 100}% text`);
      }
    }
    await playback.focus();
    assert.ok(await playback.evaluate(button => document.activeElement === button));
    await reduced.keyboard.press("Enter");
    await reducedFrame.locator('#layout[data-play=playing]').waitFor();
    assert.equal(await reducedFrame.locator(".show-enter").first().evaluate(el=>getComputedStyle(el).animationName), "none");
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(remote, []);
  console.log("PASS: offline focus, overview, keyboard, draft/send, captured parent, tree, mobile, and no errors or remote I/O." + (base ? " Product: artwork, white inert autoplay, phase/branch ordering, pause/resume/replay, no scroll/focus steal, phone and reduced motion; homepage interactive." : ""));
} finally {
  await browser.close();
}
