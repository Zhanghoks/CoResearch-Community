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
  const { world, nodeAt } = require(path.join(tmp, "mock-world.js"));
  const { chapters, sampleStory, cameraTransform } = require(path.join(tmp, "story.js"));
  const { createSceneRenderer } = require(path.join(tmp, "scene.js"));
  const ids = new Set(world.nodes.map((n) => n.id));
  assert.equal(ids.size, world.nodes.length);
  for (const n of world.nodes) assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y) && n.radius > 0);
  for (const e of world.edges) { assert.ok(ids.has(e.source) && ids.has(e.target)); assert.equal(e.verified, false); assert.ok(nodeAt(e.source).born <= nodeAt(e.target).born, "work appears after its predecessor"); }
  for (const route of [world.routes.explore, world.routes.lineage]) {
    for (let i = 1; i < route.length; i++) assert.ok(world.edges.some((e) => e.source === route[i - 1] && e.target === route[i]), "semantic path follows defined edges");
  }
  for (const id of [...world.routes.lineage, ...world.routes.explore]) { const n = nodeAt(id); assert.ok(Math.abs(Math.atan2((n.y - 425) / 325, (n.x - 720) / 600) * 180 / Math.PI) <= 30, "lineage stays inside selected domain sector"); }
  assert.equal(new Set(chapters.map((c) => c.id)).size, chapters.length);
  const samples = new Map();
  for (let i = 0; i <= (chapters.length - 1) * 20; i++) {
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
  const index = id => chapters.findIndex(c => c.id === id);
  assert.equal(sampleStory(0).pose.growth, 0, "opening is an empty map");
  assert.ok(sampleStory(index("seed")).pose.growth < sampleStory(index("growth")).pose.growth);
  assert.ok(index("growth") < index("core") && index("domains") < index("slice"));
  assert.equal(sampleStory(index("domains")).pose.domains, 1);
  assert.ok(sampleStory(index("slice")).pose.zoom > 1.8, "camera enters a cropped sector");
  for (let i = 0; i < index("gap"); i++) assert.equal(sampleStory(i).pose.gap, 0);
  for (let i = 0; i < index("candidate"); i++) assert.equal(sampleStory(i).pose.candidate, 0);
  assert.equal(sampleStory(index("explore-domain")).pose.markerX, nodeAt("subject").x);
  assert.equal(sampleStory(index("explore-focus")).pose.markerX, nodeAt("motion").x);
  assert.ok(cameraTransform(sampleStory(index("slice")).pose).startsWith("translate("));
  const make = (dataset = {}) => ({ dataset, style: {}, attributes: {}, setAttribute(k, v) { this.attributes[k] = v; } });
  const camera = make(), marker = make(), bar = make(), overview = make(), terrain = make(), ideaLabel = make();
  const born = [make({ rwBorn: ".05" }), make({ rwBorn: ".9" })];
  const grows = [make({ rwGrow: ".5" })];
  const layers = ["base", "ring", "idea", "gap", "candidate"].map((name) => make({ rwLayer: name }));
  const draws = ["lineage", "explore", "transfer", "candidate"].map((name) => make({ rwDraw: name }));
  const stops = Array.from({ length: 5 }, (_, i) => make({ rwStop: String(i) }));
  const render = createSceneRenderer({
    querySelector: (q) => q.includes("camera") ? camera : q.includes("marker") ? marker : q.includes("overview") ? overview : q.includes("terrain") ? terrain : q.includes("idea-label") ? ideaLabel : bar,
    querySelectorAll: (q) => q.includes("layer") ? layers : q.includes("draw") ? draws : q.includes("born") ? born : q.includes("grow") ? grows : stops,
  });
  render(chapters.length - 1, chapters.length);
  assert.equal(layers.at(-1).style.visibility, "visible");
  render(0, chapters.length);
  assert.equal(layers.at(-1).style.visibility, "hidden");
  assert.equal(layers.find((e) => e.dataset.rwLayer === "idea").style.visibility, "hidden");
  assert.equal(draws.at(-1).style.strokeDashoffset, "1");
  assert.equal(bar.style.transform, "scaleX(0)");
  assert.ok(born.every(n => n.style.visibility === "hidden"));
  assert.equal(grows[0].style.strokeDashoffset, "1");
  render(index("domains"), chapters.length);
  assert.ok(born.every(n => n.style.visibility === "visible"));
  render(index("idea"), chapters.length);
  assert.equal(draws[0].style.strokeDashoffset, "0", "dimmed lineage remains fully drawn");
  render(index("slice"), chapters.length);
  assert.equal(overview.style.opacity, "0");
  assert.ok(Number(terrain.style.opacity) < .2);
  render(index("gap"), chapters.length);
  assert.equal(ideaLabel.style.opacity, "0");
  render(index("idea"), chapters.length);
  assert.equal(ideaLabel.style.opacity, "1");
  const css = fs.readFileSync(path.join(root, "app/components/research-story/research-story.css"), "utf8");
  assert.match(css, /\[data-rw-born\], \[data-rw-grow\]\s*\{\s*visibility: hidden;/, "empty SSR frame does not flash nodes");
  console.log(`PASS: ${world.nodes.length} nodes, ${world.edges.length} edges, ${chapters.length} chapters; graph references, semantic paths, finite poses, reverse seeks, phase visibility and DOM resets.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
