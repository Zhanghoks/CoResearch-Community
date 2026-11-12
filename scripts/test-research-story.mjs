import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-story-"));
try {
  for (const filename of ["types", "mock-world", "story", "scene"]) {
    const result = ts.transpileModule(fs.readFileSync(path.join(root, `app/graph-svg/${filename}.ts`), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      reportDiagnostics: true,
    });
    assert.equal((result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0, `${filename} syntax`);
    fs.writeFileSync(path.join(tmp, `${filename}.js`), result.outputText);
  }
  const { world, nodeAt, communityMeta } = require(path.join(tmp, "mock-world.js"));
  const { chapters, sampleStory, cameraTransform } = require(path.join(tmp, "story.js"));
  const { createSceneRenderer } = require(path.join(tmp, "scene.js"));
  const ids = new Set(world.nodes.map((n) => n.id));
  assert.equal(ids.size, world.nodes.length);
  for (const n of world.nodes) assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y) && n.radius > 0);
  for (const e of world.edges) { assert.ok(ids.has(e.source) && ids.has(e.target)); assert.equal(e.verified, false); }
  // Visual hierarchy contract: depth tiers, baked alpha and per-community hue anchors.
  assert.equal(communityMeta.length, 7, "seven communities expose palette metadata");
  const palette = new Set();
  for (const c of communityMeta) {
    assert.ok(c.key && /^#[0-9a-f]{6}$/i.test(c.color), `community ${c.key} has a hex color`);
    assert.ok([c.cx, c.cy, c.rx, c.ry].every((v) => Number.isFinite(v)), `community ${c.key} geometry is finite`);
    assert.ok(!palette.has(c.key), "community keys are unique");
    palette.add(c.key);
  }
  const storyIds = ["video", "consistency", "subject", "multi-shot", "motion", "paper-early", "paper-compare", "paper-recent", "paper-frontier", "gap", "candidate", "cross-domain"];
  for (const n of world.nodes) {
    assert.ok([1, 2, 3].includes(n.tier), `node ${n.id} declares tier 1-3`);
    assert.ok(n.alpha > 0 && n.alpha <= 1, `node ${n.id} alpha in (0,1]`);
    if (storyIds.includes(n.id)) assert.equal(n.alpha, 1, `story node ${n.id} reads at full opacity`);
    else assert.ok(palette.has(n.community), `background node ${n.id} maps to a known community hue`);
  }
  for (const c of communityMeta) assert.ok(!["idea", "gap", "candidate"].includes(c.key), "semantic accents stay out of the community palette");
  // Reserved semantic accents must stay color-distinct from every community hue
  // (max channel distance), so the visual grammar never collides.
  const accents = { idea: "#e0a63a", gap: "#c49654", boundary: "#9483b0", transfer: "#4e8f7f" };
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const channelGap = (a, b) => Math.max(...rgb(a).map((v, i) => Math.abs(v - rgb(b)[i])));
  for (const c of communityMeta) {
    for (const [role, hex] of Object.entries(accents)) {
      assert.ok(channelGap(c.color, hex) >= 20, `community ${c.color} collides with the ${role} accent ${hex}`);
    }
  }
  // Route arrivals are real arc-length fractions ending exactly at 1.
  const { routeArrivals } = require(path.join(tmp, "mock-world.js"));
  for (const route of [world.routes.explore, world.routes.lineage]) {
    const arrivals = routeArrivals(route);
    assert.equal(arrivals.length, route.length);
    assert.ok(arrivals.every((v, i) => v >= 0 && v <= 1 && (i === 0 || v > arrivals[i - 1])), "arrivals ascend within [0,1]");
    assert.equal(arrivals.at(-1), 1, "route arrival ends at 1");
  }
  for (const route of [world.routes.explore, world.routes.lineage]) {
    for (let i = 1; i < route.length; i++) assert.ok(world.edges.some((e) => e.source === route[i - 1] && e.target === route[i]), "semantic path follows defined edges");
  }
  assert.equal(new Set(chapters.map((c) => c.id)).size, chapters.length);
  const samples = new Map();
  for (let i = 0; i <= 240; i++) {
    const p = i / 20, state = sampleStory(p);
    assert.ok(Object.values(state.pose).every(Number.isFinite));
    assert.ok(state.active >= 0 && state.active < chapters.length);
    samples.set(p, JSON.stringify(state));
  }
  for (const [p, state] of [...samples].reverse()) assert.equal(JSON.stringify(sampleStory(p)), state, "reverse seeking is deterministic");
  for (let i = 0; i < chapters.length; i++) {
    assert.deepEqual(sampleStory(i).pose, chapters[i].pose);
    assert.equal(sampleStory(i).active, i);
  }
  assert.equal(sampleStory(NaN).active, 0);
  assert.equal(sampleStory(-5).active, 0);
  assert.equal(sampleStory(1000).active, chapters.length - 1);
  for (let i = 0; i < 10; i++) assert.equal(sampleStory(i).pose.gap, 0, "gap must not pre-exist discovery");
  for (let i = 0; i < 12; i++) assert.equal(sampleStory(i).pose.candidate, 0, "candidate must not pre-exist synthesis");
  assert.equal(sampleStory(7).pose.markerX, nodeAt("subject").x);
  assert.equal(sampleStory(8).pose.markerX, nodeAt("motion").x);
  assert.ok(cameraTransform(sampleStory(12).pose).startsWith("translate("));
  const make = (dataset = {}) => ({ dataset, style: {}, attributes: {}, setAttribute(k, v) { this.attributes[k] = v; } });
  const camera = make(), marker = make(), bar = make();
  const layers = ["base", "ring", "idea", "gap", "candidate"].map((name) => make({ rwLayer: name }));
  const draws = ["lineage", "explore", "transfer", "candidate"].map((name) => make({ rwDraw: name }));
  const stops = Array.from({ length: 5 }, (_, i) => make({ rwStop: String(i) }));
  const staggered = ["papers:0:4", "papers:1:4", "papers:2:4", "papers:3:4", "lineage:0:4", "lineage:3:4"].map((spec) => make({ rwStagger: spec }));
  const render = createSceneRenderer({
    querySelector: (q) => q.includes("camera") ? camera : q.includes("marker") ? marker : bar,
    querySelectorAll: (q) => q.includes("layer") ? layers : q.includes("draw") ? draws : q.includes("stagger") ? staggered : stops,
  });
  render(12, chapters.length);
  assert.equal(layers.at(-1).style.visibility, "visible");
  render(0, chapters.length);
  assert.equal(layers.at(-1).style.visibility, "hidden");
  assert.equal(layers.find((e) => e.dataset.rwLayer === "idea").style.visibility, "hidden");
  assert.equal(draws.at(-1).style.strokeDashoffset, "1");
  assert.equal(bar.style.transform, "scaleX(0)");
  // Depth comes from baked tier alpha, never from CSS filters that muddy the zoomed frame.
  const base = layers.find((e) => e.dataset.rwLayer === "base");
  for (const p of [0, 3, 8, 12]) {
    render(p, chapters.length);
    assert.ok(!base.style.filter, `base layer stays filter-free at chapter ${p}`);
  }
  // Staggered items reveal in order as their layer value rises, deterministically both ways.
  render(2, chapters.length);
  const settled = staggered.map((el) => Number(el.style.opacity));
  assert.ok(settled.every((v) => v === 1), "a settled reveal layer shows every staggered item");
  render(3, chapters.length);
  const partial = staggered.map((el) => Number(el.style.opacity));
  assert.ok(partial[0] > partial[3], "mid-transition stagger reveals items in order");
  assert.ok(partial[0] > 0 && partial[3] < 1, "mid-transition stagger is partial");
  const firstPass = staggered.map((el) => el.style.opacity);
  render(3, chapters.length);
  assert.deepEqual(staggered.map((el) => el.style.opacity), firstPass, "stagger output is deterministic");
  render(2, chapters.length);
  assert.deepEqual(staggered.map((el) => Number(el.style.opacity)), settled, "reverse seeking restores the settled stagger");
  // Lineage stops stagger inside their layer: settled chapters show every stop,
  // faded chapters keep early stops faint and later ones hidden — in order, never popped.
  render(2, chapters.length);
  assert.equal(staggered[5].style.opacity, "1", "settled lineage shows its last stop");
  render(3, chapters.length);
  const coreFirst = Number(staggered[4].style.opacity), coreLast = Number(staggered[5].style.opacity);
  assert.ok(coreFirst > 0 && coreFirst < 1, `faded lineage keeps its first stop partial, got ${coreFirst}`);
  assert.ok(coreLast < coreFirst, "lineage stagger reveals in order");
  // Explore stops materialize as the drawn line reaches them and persist after exploration — no binary pops.
  const stopAt = (p, i) => { render(p, chapters.length); return Number(stops[i].style.opacity); };
  render(7, chapters.length);
  assert.equal(stops[2].style.opacity, "1", "half-explored route shows stops the line has reached");
  assert.equal(stops[3].style.opacity, "0", "stops beyond the drawn line stay hidden");
  const midStop = stopAt(7.4, 3);
  assert.ok(midStop > 0 && midStop < 1, `stop opacity interpolates mid-draw, got ${midStop}`);
  assert.ok(stopAt(7.8, 3) > midStop, "stop opacity grows with the draw");
  assert.equal(stopAt(8, 4), 1, "fully explored route shows every stop");
  assert.equal(stopAt(10, 4), 1, "explored stops persist into later chapters");
  assert.equal(stopAt(7.4, 3), midStop, "stop reveal is deterministic");
  console.log(`PASS: ${world.nodes.length} nodes, ${world.edges.length} edges, ${chapters.length} chapters; graph references, semantic paths, finite poses, reverse seeks, phase visibility and DOM resets.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
