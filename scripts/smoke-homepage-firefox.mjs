/**
 * Native Firefox acceptance against the exported Pages build.
 * Requires Node 22+, geckodriver, and Firefox. No runtime credentials.
 * FIREFOX_BIN and GECKODRIVER override the local binaries. Run npm run build first.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const projectBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "/CoResearch-Community";
const out = path.resolve("out");
const driverPort = Number(process.env.FIREFOX_DRIVER_PORT ?? 4458);
const driverOrigin = `http://127.0.0.1:${driverPort}`;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".txt": "text/plain", ".webp": "image/webp", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
await fs.access(path.join(out, "index.html"));
let unavailableViewer = false;
const viewerDocument = "/demos/coresearch/a52c718-1.0.0/index.html";
const server = http.createServer(async (req, res) => {
  try {
    const raw = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    if (projectBase && !raw.startsWith(`${projectBase}/`) && raw !== projectBase) throw new Error("Unknown base path");
    if (unavailableViewer && raw === projectBase + viewerDocument) {
      res.writeHead(503, { "Content-Type": "text/plain" }).end("Expected fixture interruption");
      return;
    }
    let rel = raw.slice(projectBase.length).replace(/^\/+/, "");
    if (!path.extname(rel)) rel = path.join(rel, "index.html");
    const file = path.resolve(out, rel);
    if (!file.startsWith(out + path.sep)) throw new Error("Path outside export");
    const bytes = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Content-Length": bytes.length });
    res.end(req.method === "HEAD" ? undefined : bytes);
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const root = `http://127.0.0.1:${server.address().port}${projectBase}/`;

const driver = spawn(process.env.GECKODRIVER || "geckodriver", ["--host", "127.0.0.1", "--port", String(driverPort)], { stdio: "ignore" });
let driverFailure;
driver.on("error", (error) => { driverFailure = error; });

async function api(route, arg, method = arg === undefined ? "GET" : "POST") {
  const response = await fetch(driverOrigin + route, {
    method,
    ...(arg === undefined ? {} : { body: JSON.stringify(arg), headers: { "Content-Type": "application/json" } }),
    signal: AbortSignal.timeout(15000),
  });
  const value = (await response.json()).value;
  assert.ok(response.ok, JSON.stringify(value));
  return value;
}

let session, socket;
const relevant = [];
try {
  for (let retry = 0; retry < 40; retry += 1) {
    if (driverFailure) throw driverFailure;
    try { await api("/status"); break; } catch (error) {
      if (retry === 39) throw error;
      await sleep(150);
    }
  }
  const info = await api("/session", {
    capabilities: { alwaysMatch: {
      browserName: "firefox", webSocketUrl: true,
      "moz:firefoxOptions": {
        ...(process.env.FIREFOX_BIN ? { binary: process.env.FIREFOX_BIN } : {}),
        args: ["-headless"], prefs: { "app.update.enabled": false, "ui.prefersReducedMotion": 0 },
      },
    } },
  });
  session = info.sessionId;
  const op = (route, arg) => api(`/session/${session}${route}`, arg);
  const js = (script, ...args) => op("/execute/sync", { script, args });
  const wait = async (check, label, timeout = 12000) => {
    const end = performance.now() + timeout;
    while (performance.now() < end) {
      if (await check()) return;
      await sleep(85);
    }
    throw new Error(`Timed out: ${label}`);
  };
  const move = (selector) => js("document.querySelector(arguments[0]).scrollIntoView({block:'start',behavior:'instant'});", selector);
  const action = (selector, key) => wait(async () => {
    if (!await js("const e=document.querySelector(arguments[0]);if(!e||e.disabled)return false;e.scrollIntoView({block:'nearest',behavior:'instant'});e.focus({preventScroll:true});return e===document.activeElement;", selector)) return false;
    await op("/actions", { actions: [{ type: "key", id: "native-keyboard", actions: [{ type: "keyDown", value: key }, { type: "keyUp", value: key }] }] });
    return true;
  }, selector);
  const open = (suffix = "") => op("/url", { url: root + suffix });
  const clipState = (phase, playing) => js("const e=document.querySelector('.home-core');return e?.dataset.homeScene===arguments[0]&&e.dataset.homePlaying===arguments[1];", phase, String(playing));
  const withinCore = (phrase, selector = ".home-core iframe") => js("return document.querySelector(arguments[1])?.contentDocument?.body?.innerText.includes(arguments[0]);", phrase, selector);
  const atAct = (index) => js("return document.querySelector('#research-world')?.dataset.conceptAct===String(arguments[0]);", index);
  const act = (index) => js("document.querySelectorAll('.rw-tick')[arguments[0]-1].click();", index);

  socket = new WebSocket(info.capabilities.webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let serial = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id !== undefined) pending.get(msg.id)?.(msg);
    else if (msg.params?.context || msg.params?.source?.context) relevant.push(msg);
  });
  const bidi = (method, params) => new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(method + " timed out")); }, 12000);
    pending.set(id, (answer) => {
      clearTimeout(timer);
      pending.delete(id);
      if (answer.type === "success") resolve(answer.result);
      else reject(new Error(JSON.stringify(answer)));
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await bidi("session.subscribe", { events: ["network.beforeRequestSent", "network.responseCompleted", "log.entryAdded"] });
  const context = (await bidi("browsingContext.getTree", {})).contexts[0].context;
  const viewport = (width, height) => bidi("browsingContext.setViewport", { context, viewport: { width, height } });
  await viewport(1440, 1000);
  await open();
  assert.deepEqual(await js("return [...document.querySelector('#main').children].map(el=>el.id);"), ["top", "research-world", "product-demo"]);
  await move(".home-stage-window");
  for (const [phase, phrase] of [["directions", "生成一致性"], ["refine", "主体身份"], ["evidence", "Version p02-card-v1"]]) {
    await wait(async () => await clipState(phase, true) && await withinCore(phrase), phase, 24000);
  }
  await wait(() => clipState("evidence", false), "replay ends");
  await action(".home-core-controls button:first-child", " ");
  await wait(() => clipState("ask", true), "space replay");
  await action(".home-core-controls button:first-child", "\uE007");
  await wait(() => clipState("ask", false), "enter pause");

  await move("#research-world");
  await wait(() => js("return !document.querySelector('.rw-next').disabled;"), "graph controls");
  await act(5);
  await js("const b=[...document.querySelectorAll('.rw-buttons button')].find(e=>e.textContent.includes('继续播放'));b.click();");
  const beat = (value) => js("return document.querySelector('.rw-stage')?.dataset.revisionBeat===arguments[0] && document.querySelector('#research-world')?.dataset.conceptAct==='6';", value);
  for (const value of ["before", "p05", "p03", "after"]) await wait(() => beat(value), "revision beat " + value, 12000);
  await act(6);
  await wait(() => js("return document.querySelector('.rw-stage').dataset.revisionBeat==='all';"), "seek exposes complete revision");
  await action(".rw-next", " ");
  await wait(() => atAct(7), "graph next by Space");
  assert.match(await js("return document.querySelector('.rw-question-body').innerText;"), /相同计算预算/);
  assert.match(await js("return getComputedStyle(document.querySelector('[data-rw-unverified-path]')).strokeDasharray;"), /7px/);
  assert.equal(await js("return document.querySelector('[data-rw-unverified-path]').style.strokeDasharray;"), "");
  await act(8);
  await action(".rw-next", "\uE007");
  await wait(() => atAct(1), "last-act replay returns to start");
  await wait(() => atAct(2), "last-act replay actually runs");

  await action("#feature-evidence button[aria-expanded]", " ");
  await wait(() => withinCore("Version p02-card-v1", "#feature-evidence iframe"), "feature clip opens P02", 16000);
  assert.equal(await js("return document.querySelectorAll('iframe').length;"), 2);
  await action("#feature-evidence button[aria-expanded]", "\uE007");
  await wait(() => js("return document.querySelectorAll('iframe').length===1;"), "feature closes its viewer");

  for (const [width, height] of [[1440, 900], [1280, 720], [640, 450], [390, 844], [320, 740]]) {
    await viewport(width, height);
    await open(`?verify-width=${width}#research-world-revise`);
    await wait(() => atAct(6), "direct revision link " + width);
    for (let index = 1; index <= 8; index += 1) {
      await act(index);
      await wait(() => atAct(index), `act ${index} at ${width}`);
      assert.equal(await js("const e=document.documentElement;return e.scrollWidth<=e.clientWidth+1;"), true);
      if (index >= 7) assert.ok(await js("return parseFloat(getComputedStyle(document.querySelector('.rw-question-body')).fontSize)>=16;"));
      if (index === 6 || index === 7) await wait(() => js(`
        const wrap=document.querySelector('.rw-canvas').getBoundingClientRect();
        const labels=[...document.querySelectorAll('.rw-map-node-id')].filter(e => ['P01','P02','P05','P03','待验证问题'].includes(e.textContent) && getComputedStyle(e).visibility==='visible');
        return labels.length >= 4 && labels.every(e => {
          const r=e.getBoundingClientRect();
          return r.height >= 14 && r.left >= wrap.left - 1 && r.right <= wrap.right + 1 && r.top >= wrap.top - 1 && r.bottom <= wrap.bottom + 1;
        });
      `), `important graph labels stay on-screen at act ${index}, width ${width}`);
    }
    if (width <= 390) {
      await action(".home-core-steps button:nth-child(3)", " ");
      await wait(() => js("const f=document.querySelector('.home-core iframe'),g=f?.contentDocument?.querySelector('[data-demo-anchor=group-G3]');return g&&g.getBoundingClientRect().top>=0&&g.getBoundingClientRect().top<=36;"), "latest refined direction visible at " + width);
    }
    await move("#feature-evidence");
    await wait(() => js("return document.querySelector('#feature-evidence img').naturalWidth > 0;"), "real poster");
    assert.match(await js("return document.querySelector('#feature-evidence img').currentSrc;"), width <= 767 ? /evidence-mobile\.webp$/ : /evidence\.webp$/);
  }
  await viewport(390, 844);
  await open("?verify-autoplay=phone#research-world");
  await move("#research-world");
  await action(".rw-mode button", " ");
  await wait(() => atAct(2), "phone opt-in playing");
  await action(".rw-mode button", "\uE007");
  assert.match(await js("return document.querySelector('.rw-mode button').innerText;"), /自动讲解/);
  await open("docs/read-evidence/?step=read-level");
  await wait(() => withinCore("Version p02-card-v1", "iframe"), "matching P02 guide deep link");
  const requests = relevant.filter((e) => e.method === "network.beforeRequestSent").map((e) => e.params.request);
  const bad = requests.filter(({ url, method }) => /^https?:/.test(url) && !url.startsWith(root) || !["GET", "HEAD", "OPTIONS"].includes(method));
  assert.deepEqual(bad, [], "offline replay and guides must not issue external or write requests");
  assert.ok(requests.length > 20);
  const outputErrors = relevant.filter((e) => e.method === "log.entryAdded" && e.params.level === "error");
  assert.deepEqual(outputErrors, [], "no console errors throughout the walkthrough");
  const failures = relevant.filter((e) => e.method === "network.responseCompleted" && e.params.response.status >= 400);
  assert.deepEqual(failures, [], "no failed page resources");
  console.log(`PASS: continuous real UI, native Space/Enter, timed evidence revision, 5 viewport widths × 8 scenes, P02 guide, ${requests.length} local read-only requests.`);

  // Test a real timed-out/failed boot on the loopback fixture, not production.
  // The preceding network gate excluded this deliberately induced failure.
  unavailableViewer = true;
  await viewport(1440, 1000);
  await open("?verify=viewer-retry");
  await wait(() => js("return document.querySelector('.home-core [data-viewer-loading=error]')!==null;"), "simulated viewer failure");
  await wait(() => js("return document.querySelector('.home-core .home-loading-poster')!==null;"), "stable viewer preview during failure");
  unavailableViewer = false;
  await action(".home-core [data-viewer-loading=error] button", "\uE007");
  await move(".home-stage-window");
  await wait(() => clipState("ask", true), "pinned viewer handshake recovers");
  await wait(async () => await clipState("directions", true) && await withinCore("生成一致性"), "recovered playback advances");
  console.log("PASS: simulated viewer error leaves a stable poster; native Retry reconnects and advances the replay.");
} finally {
  socket?.close();
  if (session) await api("/session/" + session, undefined, "DELETE").catch(() => {});
  driver.kill();
  server.closeAllConnections();
  server.close();
}
